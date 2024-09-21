package catalog

import "go.opentelemetry.io/otel/metric"

var (
	requestDuration metric.Int64Histogram
	requestSuccess  metric.Int64Counter
	requestFail     metric.Int64Counter
)
