package telemetry

import (
	"context"
	"fmt"
	"os"
	"sync"
	"time"

	"go.opentelemetry.io/contrib/bridges/otelzap"
	"go.opentelemetry.io/contrib/instrumentation/host"
	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	sdklogger "go.opentelemetry.io/otel/sdk/log"
	sdkmeter "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Options struct {
	LoggerVerbose bool
}

type ProviderConfiguration struct {
	Port        uint64
	EndpointURL string
}

func (c *ProviderConfiguration) Name() string {
	return "otel"
}

func (c *ProviderConfiguration) NewTelemetryProvider(opt *Options, attributes []func(provider *OTELProvider)) (*OTELProvider, error) {
	return NewTelemetryProvider(c, opt.LoggerVerbose, attributes...), nil
}

func (c *ProviderConfiguration) NewNoOpProvider(opt *Options) (*NoOpProvider, error) {
	return NewNoOpProvider(c, opt.LoggerVerbose), nil
}

type Provider interface {
	Tracer() *sdktrace.TracerProvider
	Logger() *zap.Logger
	Meter() *sdkmeter.MeterProvider
	LoggerUndo()
	Shutdown(ctx context.Context) error
	Attributes() []attribute.KeyValue
}

type OTELProvider struct {
	config     *ProviderConfiguration
	logger     *zap.Logger
	mtx        sync.Mutex
	attributes []attribute.KeyValue

	verbose    bool
	loggerUndo func()

	tracer         *sdktrace.TracerProvider
	meter          *sdkmeter.MeterProvider
	loggerProvider *sdklogger.LoggerProvider
}

func ServiceName(name string) func(*OTELProvider) {
	return func(tp *OTELProvider) {
		tp.mtx.Lock()
		tp.attributes = append(tp.attributes, semconv.ServiceNameKey.String(name))
		tp.mtx.Unlock()
	}
}

func ServiceVersion(version string) func(*OTELProvider) {
	return func(tp *OTELProvider) {
		tp.mtx.Lock()
		tp.attributes = append(tp.attributes, semconv.ServiceVersionKey.String(version))
		tp.mtx.Unlock()
	}
}

func ServiceEnvironment(env string) func(*OTELProvider) {
	return func(tp *OTELProvider) {
		tp.mtx.Lock()
		tp.attributes = append(tp.attributes, semconv.DeploymentEnvironmentNameKey.String(env))
		tp.mtx.Unlock()
	}
}

func ServiceHostName() func(*OTELProvider) {
	return func(tp *OTELProvider) {
		tp.mtx.Lock()
		hostName, err := os.Hostname()
		if err != nil {
			hostName = "unknown"
		}
		tp.attributes = append(tp.attributes, semconv.HostNameKey.String(hostName))
		tp.mtx.Unlock()
	}
}

func (p *OTELProvider) Tracer() *sdktrace.TracerProvider {
	return p.tracer
}

func (p *OTELProvider) Meter() *sdkmeter.MeterProvider {
	return p.meter
}
func (p *OTELProvider) Logger() *zap.Logger {
	return p.logger
}
func (p *OTELProvider) LoggerUndo() {
	p.loggerUndo()
}

func (p *OTELProvider) Shutdown(ctx context.Context) error {
	_ = p.tracer.ForceFlush(ctx)
	_ = p.tracer.Shutdown(ctx)
	_ = p.meter.ForceFlush(ctx)
	_ = p.meter.Shutdown(ctx)
	_ = p.loggerProvider.ForceFlush(ctx)
	_ = p.loggerProvider.Shutdown(ctx)
	return nil
}

func (p *OTELProvider) Attributes() []attribute.KeyValue {
	return p.attributes
}

func NewTelemetryProvider(c *ProviderConfiguration, verbose bool, attributes ...func(*OTELProvider)) *OTELProvider {
	p := &OTELProvider{
		logger:  zap.NewNop(),
		config:  c,
		verbose: verbose,
	}

	for _, attr := range attributes {
		attr(p)
	}

	err := p.initSDK()
	if err != nil {
		p.logger.Error("Failed to create telemetry provider")
		return nil
	}
	return p
}

func (p *OTELProvider) initSDK() error {
	ctx := context.Background()

	res, err := p.setupResource(&ctx)
	if err != nil {
		p.logger.Error("Failed to initialize resource", zap.Error(err))
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, time.Second)
	defer cancel()
	conn, err := grpc.NewClient(fmt.Sprintf("%s:%d", p.config.EndpointURL, p.config.Port),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		p.logger.Error("Failed to create connection with OTEL collector", zap.Error(err))
		return err
	}

	prop := propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)

	otel.SetTextMapPropagator(prop)

	traceProvider, err := p.setupTracer(res, &ctx, conn)
	if err != nil {
		p.logger.Error("Failed to setup trace provider", zap.Error(err))
		return err
	}

	meterProvider, err := p.setupMeter(res, &ctx, conn)
	if err != nil {
		p.logger.Error("Failed to setup meter provider", zap.Error(err))
		return err
	}

	lp, err := p.setupLogger(res, &ctx, conn)
	if err != nil {
		p.logger.Error("Failed to setup logger", zap.Error(err))
		return err
	}
	logger, undo := initLogging(p.verbose, lp)

	// override global providers
	otel.SetMeterProvider(meterProvider)
	otel.SetTracerProvider(traceProvider)
	global.SetLoggerProvider(lp)
	zap.ReplaceGlobals(logger)

	p.tracer = traceProvider
	p.meter = meterProvider
	p.loggerProvider = lp
	p.logger = logger
	p.loggerUndo = undo

	p.setupBaseMetrics()

	return nil
}

func (p *OTELProvider) setupResource(_ *context.Context) (*resource.Resource, error) {
	base := resource.Default()

	return resource.Merge(base, resource.NewWithAttributes(
		semconv.SchemaURL,
		p.attributes...,
	))
}

func (p *OTELProvider) setupTracer(res *resource.Resource, ctx *context.Context, con *grpc.ClientConn) (*sdktrace.TracerProvider, error) {
	traceExporter, err := otlptracegrpc.New(*ctx, otlptracegrpc.WithGRPCConn(con))
	if err != nil {
		return nil, fmt.Errorf("failed to create trace exporter: %w", err)
	}

	// Register the trace exporter with a TracerProvider, using a batch
	// span processor to aggregate spans before export.
	bsp := sdktrace.NewBatchSpanProcessor(traceExporter)
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.TraceIDRatioBased(0.65)),
		sdktrace.WithResource(res),
		sdktrace.WithSpanProcessor(bsp),
	)
	return tracerProvider, nil
}

func (p *OTELProvider) setupMeter(res *resource.Resource, ctx *context.Context, con *grpc.ClientConn) (*sdkmeter.MeterProvider, error) {
	meterExporter, err := otlpmetricgrpc.New(*ctx, otlpmetricgrpc.WithGRPCConn(con))
	if err != nil {
		return nil, fmt.Errorf("failed to create trace exporter: %w", err)
	}

	reader := sdkmeter.NewPeriodicReader(meterExporter, sdkmeter.WithInterval(10*time.Second))
	meterProvider := sdkmeter.NewMeterProvider(
		sdkmeter.WithReader(reader),
		sdkmeter.WithResource(res),
	)
	return meterProvider, nil
}

func (p *OTELProvider) setupLogger(res *resource.Resource, ctx *context.Context, con *grpc.ClientConn) (*sdklogger.LoggerProvider, error) {
	loggerExporter, err := otlploggrpc.New(*ctx, otlploggrpc.WithGRPCConn(con))
	if err != nil {
		return nil, fmt.Errorf("failed to create logger exporter: %w", err)
	}
	lp := sdklogger.NewLoggerProvider(
		sdklogger.WithProcessor(
			sdklogger.NewBatchProcessor(loggerExporter, sdklogger.WithExportInterval(10*time.Second)),
		),
		sdklogger.WithResource(res),
	)

	return lp, nil
}

// setupBaseMetrics starts metrics collection for the host the process is running on
// as well as go runtime metrics for the process. It is generally safe to ignore the
// errors of these instrumentations as they don't affect the overall process
func (p *OTELProvider) setupBaseMetrics() {
	err := host.Start(host.WithMeterProvider(p.meter))
	if err != nil {
		p.logger.Error("Failed to start host metrics exporter", zap.Error(err))
	}
	// Reading memory stats every second is extremely expensive.
	// Reverting to using the default 15 second interval
	err = runtime.Start(runtime.WithMinimumReadMemStatsInterval(runtime.DefaultMinimumReadMemStatsInterval), runtime.WithMeterProvider(p.meter))
	if err != nil {
		p.logger.Error("Failed to start runtime metrics exporter", zap.Error(err))
	}
}

func initLogging(verbose bool, provider *sdklogger.LoggerProvider) (*zap.Logger, func()) {
	atomicLevel := zap.NewAtomicLevel()
	level := zapcore.WarnLevel
	if verbose {
		level = zapcore.DebugLevel
	}
	atomicLevel.SetLevel(level)
	// initialize logger
	logger := zap.New(
		zapcore.NewTee(
			zapcore.NewCore(
				zapcore.NewJSONEncoder(
					zap.NewProductionEncoderConfig()),
				zapcore.Lock(os.Stdout), atomicLevel,
			),
			otelzap.NewCore("checkout", otelzap.WithLoggerProvider(provider)),
		),
	)

	undo := zap.ReplaceGlobals(logger)
	return logger, undo
}
