package telemetry

import (
	"context"

	sdkmeter "go.opentelemetry.io/otel/sdk/metric"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.uber.org/zap"
)

type NoOpProvider struct{}

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

func NewNoOpProvider(_ *ProviderConfiguration, _ *zap.Logger) *NoOpProvider {
	return &NoOpProvider{}
}
