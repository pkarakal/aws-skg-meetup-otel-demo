package redis

import "go.opentelemetry.io/otel/metric"

var (
	cacheRequestDuration metric.Int64Histogram
	cacheHits            metric.Int64Counter
	cacheMisses          metric.Int64Counter
)
