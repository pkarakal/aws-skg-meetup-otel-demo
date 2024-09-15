package telemetry

import (
	"context"
	"fmt"
	"os"
	"sync"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/host"
	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	sdkmeter "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Options struct {
	Logger *zap.Logger
}

type ProviderConfiguration struct {
	Port        uint64
	EndpointURL string
}

func (c *ProviderConfiguration) Name() string {
	return "otel"
}

func (c *ProviderConfiguration) NewTelemetryProvider(opt *Options, attributes []func(provider *OTELProvider)) (*OTELProvider, error) {
	tp := NewTelemetryProvider(c, opt.Logger, attributes...)
	return tp, nil
}

func (c *ProviderConfiguration) NewNoOpProvider(opt *Options) (*NoOpProvider, error) {
	return NewNoOpProvider(c, opt.Logger), nil
}

type Provider interface {
	Tracer() *sdktrace.TracerProvider
	Meter() *sdkmeter.MeterProvider
}

type OTELProvider struct {
	config     *ProviderConfiguration
	logger     *zap.Logger
	mtx        sync.Mutex
	attributes []attribute.KeyValue

	tracer *sdktrace.TracerProvider
	meter  *sdkmeter.MeterProvider
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
		tp.attributes = append(tp.attributes, semconv.DeploymentEnvironmentKey.String(env))
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

func NewTelemetryProvider(c *ProviderConfiguration, l *zap.Logger, attributes ...func(*OTELProvider)) *OTELProvider {
	if l == nil {
		l = zap.NewNop()
	}

	p := &OTELProvider{
		logger: l,
		config: c,
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
	conn, err := grpc.DialContext(ctx, fmt.Sprintf("%s:%d", p.config.EndpointURL, p.config.Port),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		p.logger.Error("Failed to create connection with OTEL collector", zap.Error(err))
		return err
	}
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

	// override global providers
	otel.SetMeterProvider(meterProvider)
	otel.SetTracerProvider(traceProvider)

	p.tracer = traceProvider
	p.meter = meterProvider

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
	err = runtime.Start(runtime.WithMinimumReadMemStatsInterval(runtime.DefaultMinimumReadMemStatsInterval))
	if err != nil {
		p.logger.Error("Failed to start runtime metrics exporter", zap.Error(err))
	}
}
