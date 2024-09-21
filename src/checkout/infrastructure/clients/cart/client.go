package cart

import (
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

func NewCartConfig(url string, timeout int) (*Config, error) {
	return &Config{URL: url, Timeout: timeout}, nil
}

func (c *Config) NewCartClient(opt ClientOptions) Client {
	return NewCart(c, opt.Logger, opt.TelemetryProvider)
}

func NewCart(c *Config, l *zap.Logger, tp telemetry.Provider) Client {
	if l == nil {
		l = zap.NewNop()
	}

	// bootstrap a new http client so that we can reuse connections
	httpClient := &http.Client{
		Timeout: time.Duration(c.Timeout) * time.Second,
		Transport: otelhttp.NewTransport(&http.Transport{
			MaxIdleConns:        1000,
			MaxConnsPerHost:     1000,
			MaxIdleConnsPerHost: 1000,
			IdleConnTimeout:     60 * time.Second,
		}),
	}

	cartClient := Client{
		logger: l,
		client: httpClient,
		config: c,
		tracer: tp.Tracer().Tracer("checkout.cart.client"),
		meter:  tp.Meter().Meter("checkout.cart.client"),
	}
	cartClient.initMetrics()

	return cartClient
}

func (c *Client) initMetrics() {
	var err error
	requestDuration, err = c.meter.Int64Histogram(
		"checkout.cart.request.duration",
		metric.WithDescription("Time the request to cart service took to fulfill"),
		metric.WithUnit("milliseconds"),
	)
	if err != nil {
		c.logger.Error("Failed to instantiate cart request duration metric")
	}
	requestSuccess, err = c.meter.Int64Counter(
		"checkout.cart.request.success",
		metric.WithDescription("Number of successful requests to cart service"),
		metric.WithUnit("{req}"),
	)
	if err != nil {
		c.logger.Error("Failed to instantiate cart successful request count metric")
	}
	requestFail, err = c.meter.Int64Counter(
		"checkout.cart.request.failed",
		metric.WithDescription("Number of failed requests to cart service"),
		metric.WithUnit("{req}"),
	)
	if err != nil {
		c.logger.Error("Failed to instantiate cart failed request count metric")
	}
}

func (c *Client) GetCart(ctx context.Context, cartId int64) (*models.Cart, error) {
	childCtx, span := c.tracer.Start(ctx, "GetCart")
	defer span.End()
	url := fmt.Sprintf("%s/cart/%d", c.config.URL, cartId)

	req, _ := http.NewRequestWithContext(childCtx, "GET", url, nil)

	start := time.Now()
	resp, err := c.client.Do(req)
	if err != nil {
		c.logger.Error("Failed to initiate request", zap.Error(err), zap.Int64("cartID", cartId), zap.String("url", url))
		return nil, err
	}
	requestDuration.Record(childCtx, time.Since(start).Milliseconds())
	defer resp.Body.Close()

	if resp.StatusCode > 400 {
		c.logger.Error("Received an error from the server when requesting cart", zap.Error(err))
		span.SetStatus(codes.Error, "Received an error from the server when requestingcart")
		span.RecordError(err)
		requestFail.Add(childCtx, 1)
		return nil, err
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.logger.Error("Failed to read the response body from the cart response", zap.Error(err))
		span.SetStatus(codes.Error, "Failed to read the response body from the cart response")
		span.RecordError(err)
		requestFail.Add(childCtx, 1)
		return nil, err
	}

	var cart models.Cart
	err = json.Unmarshal(body, &cart)
	if err != nil {
		c.logger.Error("Failed to parse response from cart service", zap.Error(err))
		span.SetStatus(codes.Error, "Failed to parse response from cart service")
		span.RecordError(err)
		requestFail.Add(childCtx, 1)
		return nil, err
	}

	requestSuccess.Add(childCtx, 1)
	return &cart, nil
}
