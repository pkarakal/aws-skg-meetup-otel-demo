package telemetry

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	sdkmeter "go.opentelemetry.io/otel/sdk/metric"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.uber.org/zap"
)

type NoOpProvider struct {
	logger *zap.Logger
}

func (p *NoOpProvider) Tracer() *sdktrace.TracerProvider {
	trace := sdktrace.NewTracerProvider()
	_ = trace.Shutdown(context.Background())
	return trace
}

func (p *NoOpProvider) Meter() *sdkmeter.MeterProvider {
	meter := sdkmeter.NewMeterProvider()
	_ = meter.Shutdown(context.Background())
	return meter
}

func (p *NoOpProvider) Logger() *zap.Logger {
	return p.logger
}

func (p *NoOpProvider) LoggerUndo() {
	return
}

func (p *NoOpProvider) Attributes() []attribute.KeyValue {
	return nil
}

func (p *NoOpProvider) Shutdown(_ context.Context) error {
	return nil
}

func NewNoOpProvider(_ *ProviderConfiguration, _ bool) *NoOpProvider {
	return &NoOpProvider{
		logger: zap.NewNop(),
	}
}
