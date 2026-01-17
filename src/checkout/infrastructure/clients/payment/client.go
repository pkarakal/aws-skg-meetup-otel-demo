package payment

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/models"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/telemetry"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type Config struct {
	URL     string `json:"url"`
	Timeout int    `json:"timeout"`
}

type ClientOptions struct {
	Logger *zap.Logger

	TelemetryProvider telemetry.Provider
}

type Client struct {
	client *http.Client
	config *Config

	logger *zap.Logger
	tracer trace.Tracer
	meter  metric.Meter
}

type Request struct {
	Amount     float64 `json:"amount"`
	Currency   string  `json:"currency"`
	CardNumber string  `json:"card_number"`
	CardHolder string  `json:"card_holder"`
	ExpiryDate string  `json:"expiry_date"`
	CVV        string  `json:"cvv"`
}

type Response struct {
	Status        string  `json:"status"`
	TransactionID string  `json:"transaction_id"`
	FailureReason *string `json:"failure_reason,omitempty"`
	Message       string  `json:"message"`
}

func NewPaymentConfig(url string, timeout int) (*Config, error) {
	return &Config{URL: url, Timeout: timeout}, nil
}

func (c *Config) NewPaymentClient(opt ClientOptions) Client {
	return NewPayment(c, opt.Logger, opt.TelemetryProvider)
}

func NewPayment(c *Config, l *zap.Logger, tp telemetry.Provider) Client {
	if l == nil {
		l = zap.NewNop()
	}

	httpClient := &http.Client{
		Timeout: time.Duration(c.Timeout) * time.Second,
		Transport: otelhttp.NewTransport(&http.Transport{
			MaxIdleConns:        1000,
			MaxConnsPerHost:     1000,
			MaxIdleConnsPerHost: 1000,
			IdleConnTimeout:     60 * time.Second,
		}),
	}

	paymentClient := Client{
		logger: l,
		client: httpClient,
		config: c,
		tracer: tp.Tracer().Tracer("checkout.payment.client"),
		meter:  tp.Meter().Meter("checkout.payment.client"),
	}
	paymentClient.initMetrics()

	return paymentClient
}

func (c *Client) initMetrics() {
	var err error
	requestDuration, err = c.meter.Int64Histogram(
		"checkout.payment.request.duration",
		metric.WithDescription("Time the request to payment service took to fulfill"),
		metric.WithUnit("milliseconds"),
	)
	if err != nil {
		c.logger.Error("Failed to instantiate payment request duration metric")
	}
	requestSuccess, err = c.meter.Int64Counter(
		"checkout.payment.request.success",
		metric.WithDescription("Number of successful requests to payment service"),
		metric.WithUnit("{req}"),
	)
	if err != nil {
		c.logger.Error("Failed to instantiate payment successful request count metric")
	}
	requestFail, err = c.meter.Int64Counter(
		"checkout.payment.request.failed",
		metric.WithDescription("Number of failed requests to payment service"),
		metric.WithUnit("{req}"),
	)
	if err != nil {
		c.logger.Error("Failed to instantiate payment failed request count metric")
	}
}

func (c *Client) ProcessPayment(ctx context.Context, amount float64, card *models.CreditCard) (*Response, error) {
	childCtx, span := c.tracer.Start(ctx, "ProcessPayment")
	defer span.End()

	url := fmt.Sprintf("%s/payments", c.config.URL)

	expiryDate := fmt.Sprintf("%02d/%d", card.CardExpirationMonth, card.CardExpirationYear)

	paymentReq := Request{
		Amount:     amount,
		Currency:   "EUR",
		CardNumber: card.CardNumber,
		CardHolder: card.CardOwner,
		ExpiryDate: expiryDate,
		CVV:        fmt.Sprintf("%d", card.CardCvv),
	}

	body, err := json.Marshal(paymentReq)
	if err != nil {
		c.logger.Error("Failed to marshal payment request", zap.Error(err), zap.Any("context", childCtx))
		span.SetStatus(codes.Error, "Failed to marshal payment request")
		span.RecordError(err)
		requestFail.Add(childCtx, 1)
		return nil, err
	}

	req, err := http.NewRequestWithContext(childCtx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		c.logger.Error("Failed to create payment request", zap.Error(err), zap.Any("context", childCtx))
		span.SetStatus(codes.Error, "Failed to create payment request")
		span.RecordError(err)
		requestFail.Add(childCtx, 1)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	start := time.Now()
	resp, err := c.client.Do(req)
	if err != nil {
		c.logger.Error("Failed to send payment request", zap.Error(err), zap.String("url", url), zap.Any("context", childCtx))
		span.SetStatus(codes.Error, "Failed to send payment request")
		span.RecordError(err)
		requestFail.Add(childCtx, 1)
		return nil, err
	}
	requestDuration.Record(childCtx, time.Since(start).Milliseconds())
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		c.logger.Error("Received an error from the payment service", zap.Int("status", resp.StatusCode), zap.Any("context", childCtx))
		span.SetStatus(codes.Error, "Received an error from the payment service")
		requestFail.Add(childCtx, 1)
		return nil, fmt.Errorf("payment service returned status %d", resp.StatusCode)
	}

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.logger.Error("Failed to read the response body from the payment response", zap.Error(err), zap.Any("context", childCtx))
		span.SetStatus(codes.Error, "Failed to read the response body from the payment response")
		span.RecordError(err)
		requestFail.Add(childCtx, 1)
		return nil, err
	}

	var paymentResp Response
	err = json.Unmarshal(respBody, &paymentResp)
	if err != nil {
		c.logger.Error("Failed to parse response from payment service", zap.Error(err), zap.Any("context", childCtx))
		span.SetStatus(codes.Error, "Failed to parse response from payment service")
		span.RecordError(err)
		requestFail.Add(childCtx, 1)
		return nil, err
	}

	requestSuccess.Add(childCtx, 1)
	return &paymentResp, nil
}
