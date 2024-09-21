package rabbitmq

import "go.opentelemetry.io/otel/metric"

var (
	messageCounter metric.Int64Counter
	failedCounter  metric.Int64Counter
)
