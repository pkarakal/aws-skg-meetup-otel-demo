package redis

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"time"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/model"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/ports"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/telemetry"
	"github.com/redis/go-redis/extra/redisotel/v9"
	"github.com/redis/go-redis/v9"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type CartRepository struct {
	client *redis.Client

	logger *zap.Logger
	tracer trace.Tracer
	meter  metric.Meter
}

func NewRedisCartRepository(client *redis.Client, l *zap.Logger, tp telemetry.Provider) ports.CartRepository {
	if l == nil {
		l = zap.NewNop()
	}

	if err := redisotel.InstrumentTracing(client); err != nil {
		l.Error("Failed to instrument redis tracing", zap.Error(err))
	}
	if err := redisotel.InstrumentMetrics(client); err != nil {
		l.Error("Failed to instrument redis metrics", zap.Error(err))
	}

	r := &CartRepository{
		client: client,
		logger: l,
		tracer: tp.Tracer().Tracer("cart.repository"),
		meter:  tp.Meter().Meter("cart.repository"),
	}

	r.initMetrics()

	return r
}

func (r *CartRepository) initMetrics() {
	var err error
	cacheRequestDuration, err = r.meter.Int64Histogram(
		"cart.repository.cache.request_duration",
		metric.WithDescription("Time the request to redis took to fulfill"),
		metric.WithUnit("ms"),
	)
	if err != nil {
		r.logger.Error("Failed to instantiate cache request duration metric")
	}
	cacheHits, err = r.meter.Int64Counter(
		"cart.repository.cache.hits",
		metric.WithDescription("Number of times the cart was found in cache"),
		metric.WithUnit("{hit}"),
	)
	if err != nil {
		r.logger.Error("Failed to instantiate cache hits metric")
	}
	cacheMisses, err = r.meter.Int64Counter(
		"cart.repository.cache.misses",
		metric.WithDescription("Number of times the cart was not found in cache"),
		metric.WithUnit("{miss}"),
	)
	if err != nil {
		r.logger.Error("Failed to instantiate cache miss metric")
	}
}

func (r *CartRepository) Save(ctx context.Context, cart model.Cart) error {
	childCtx, span := r.tracer.Start(ctx, "Save")
	defer span.End()
	data, err := json.Marshal(cart)
	if err != nil {
		r.logger.Error("Failed to marshal cart to json", zap.Error(err))
		span.SetStatus(codes.Error, "Failed to marshal cart to json")
		span.RecordError(err)
		return err
	}
	start := time.Now()
	err = r.client.Set(childCtx, strconv.FormatInt(cart.ID, 10), data, 0).Err()
	cacheRequestDuration.Record(
		childCtx,
		time.Since(start).Milliseconds(),
		metric.WithAttributes(attribute.String("operation", "save")),
	)
	if err != nil {
		r.logger.Error("Failed to save cart to redis", zap.Error(err))
		span.SetStatus(codes.Error, "Failed to save cart to redis")
		span.RecordError(err)
	}
	return err
}

func (r *CartRepository) GetByID(ctx context.Context, id string) (*model.Cart, error) {
	childCtx, span := r.tracer.Start(ctx, "GetByID")
	defer span.End()
	start := time.Now()
	data, err := r.client.Get(childCtx, id).Result()
	cacheRequestDuration.Record(
		childCtx,
		time.Since(start).Milliseconds(),
		metric.WithAttributes(attribute.String("operation", "query")),
	)
	if errors.Is(err, redis.Nil) {
		r.logger.Error("Couldn't find the cart in the redis database", zap.String("id", id))
		cacheMisses.Add(childCtx, 1)
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, nil
	} else if err != nil {
		r.logger.Error("Error while fetching cart from redis", zap.String("id", id), zap.Error(err))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	var cart model.Cart
	if err := json.Unmarshal([]byte(data), &cart); err != nil {
		return nil, err
	}
	cacheHits.Add(childCtx, 1)
	return &cart, nil
}

func (r *CartRepository) GenerateNextCartID(ctx context.Context) (*int64, error) {
	childCtx, span := r.tracer.Start(ctx, "GenerateNextCartID")
	defer span.End()
	nextID, err := r.client.Incr(childCtx, "cart_id_counter").Result()
	if err != nil {
		r.logger.Error("Error while generating next cart ID", zap.Error(err))
		return nil, err
	}
	r.logger.Debug("Successfully generated next cart ID", zap.Int64("nextID", nextID))
	return &nextID, nil
}
