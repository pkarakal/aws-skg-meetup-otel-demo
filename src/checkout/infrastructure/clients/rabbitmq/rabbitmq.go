package rabbitmq

import (
	"context"
	"fmt"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/telemetry"
	amqp "github.com/rabbitmq/amqp091-go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type Config struct {
	Port     int64  `mapstructure:"port"`
	Host     string `mapstructure:"host"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
	Exchange string `mapstructure:"queue"`
}

type ClientOptions struct {
	Logger *zap.Logger

	TelemetryProvider telemetry.Provider
}

func (c *Config) NewAMQPClient(opt ClientOptions) (*AMQP, error) {
	return NewAMQP(c, opt.Logger, opt.TelemetryProvider), nil
}

func NewAMQP(c *Config, l *zap.Logger, tp telemetry.Provider) *AMQP {
	if l == nil {
		l = zap.NewNop()
	}

	a := &AMQP{
		logger: l,
		config: c,
		client: nil,
		tracer: tp.Tracer().Tracer("checkout.amqp"),
		meter:  tp.Meter().Meter("checkout.amqp"),
	}
	a.initMetrics()
	client, err := a.amqpClient()
	if err != nil {
		l.Fatal("Failed to create connection to AMQP provider", zap.Error(err))
	}
	a.client = client

	channel, err := a.amqpChannel()
	if err != nil {
		l.Fatal("Failed to create AMQP channel", zap.Error(err))
	}
	a.channel = channel
	return a
}

type AMQP struct {
	logger *zap.Logger

	config  *Config
	client  *amqp.Connection
	channel *amqp.Channel
	tracer  trace.Tracer
	meter   metric.Meter
}

func (a *AMQP) initMetrics() {
	var err error
	messageCounter, err = a.meter.Int64Counter(
		"streamer.amqp.messages.produced",
		metric.WithDescription("Number of messages sent to AMQP queue"),
		metric.WithUnit("1"),
	)
	if err != nil {
		a.logger.Error("Failed to instantiate metric", zap.Error(err))
	}

	failedCounter, err = a.meter.Int64Counter(
		"streamer.amqp.messages.failed",
		metric.WithDescription("Number of messages that failed to be sent to AMQP queue"),
		metric.WithUnit("1"),
	)
	if err != nil {
		a.logger.Error("Failed to instantiate metric", zap.Error(err))
	}
}

func (a *AMQP) amqpClient() (*amqp.Connection, error) {
	if a.client != nil {
		return a.client, nil
	}

	amqpURL := fmt.Sprintf("amqp://%s:%s@%s:%d/", a.config.Username, a.config.Password, a.config.Host, a.config.Port)
	conn, err := amqp.DialConfig(amqpURL, amqp.Config{})
	if err != nil {
		a.logger.Error("Couldn't connect to the AMQP broker", zap.Error(err))
		return nil, err
	}
	return conn, err
}

func (a *AMQP) amqpChannel() (*amqp.Channel, error) {
	if a.channel != nil {
		return a.channel, nil
	}
	amqpChan, err := a.client.Channel()
	if err != nil {
		a.logger.Error("Couldn't open AMQP channel", zap.Error(err))
		return nil, err
	}

	conClosedCh := make(chan *amqp.Error, 1)
	connClose := amqpChan.NotifyClose(conClosedCh)

	conFailCh := make(chan string, 1)
	conFail := amqpChan.NotifyCancel(conFailCh)

	chClosedCh := make(chan *amqp.Error, 1)
	channelClose := amqpChan.NotifyClose(chClosedCh)
	go func() {
		for {
			select {
			case <-connClose:
				{
					a.logger.Error("AMQP connection has been terminated. Closing consumer")
					_ = a.client.Close()
					return
				}
			case <-conFail:
				{
					a.logger.Error("AMQP basic cancel received. Probably the queue has been deleted. Closing consumer")
					_ = a.client.Close()
					return
				}
			case <-channelClose:
				{
					a.logger.Error("AMQP channel has been terminated. Closing connection")
					_ = a.client.Close()
					return
				}
			}
		}
	}()

	a.logger.Debug("Successfully opened AMQP channel")
	return amqpChan, nil
}

func (a *AMQP) PublishMessage(ctx context.Context, message []byte, routingKey string) error {
	childCtx, span := a.tracer.Start(ctx, "PublishMessage")
	defer span.End()
	propagator := otel.GetTextMapPropagator()

	headers := amqp.Table{}
	propagator.Inject(childCtx, amqpHeadersCarrier{headers})

	amqpChan, err := a.amqpChannel()
	if err != nil {
		a.logger.Error("Couldn't open AMQP channel", zap.Error(err))
		return err
	}
	err = amqpChan.Publish(
		a.config.Exchange,
		routingKey,
		false,
		false,
		amqp.Publishing{
			Headers:     headers,
			ContentType: "application/json",
			Body:        message,
		},
	)
	if err != nil {
		a.logger.Error("Failed to publish message", zap.Error(err))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		failedCounter.Add(childCtx, 1)
		return err
	}
	a.logger.Debug("Successfully published message", zap.String("message", string(message)))
	messageCounter.Add(childCtx, 1)
	return nil
}
