package main

import (
	"context"
	"errors"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/infrastructure/handlers"
	"net"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/application"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/config"
	util "github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/infrastructure/redis"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/router"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/telemetry"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

func main() {
	logger, undo := config.InitLogging(true)
	defer logger.Sync()
	defer undo()
	c, err := config.LoadConfig()
	if err != nil {
		logger.Fatal("couldn't load configuration. Terminating", zap.Error(err))
	}
	logger.Debug("Got config", zap.Any("config", c))
	redisClient := c.OpenRedisConnection()
	conn := redisClient.Conn()
	if conn == nil {
		logger.Fatal("couldn't connect to redis", zap.Error(err))
	}
	defer conn.Close()
	telemetryKeys := []func(*telemetry.OTELProvider){
		telemetry.ServiceName("cart"),
		telemetry.ServiceVersion("0.1.0"),
		telemetry.ServiceEnvironment("demo"),
		telemetry.ServiceHostName(),
	}
	tp, err := config.InitTelemetry(
		logger,
		&c.TelemetryConfig,
		telemetryKeys,
	)
	if err != nil {
		logger.Error("Failed to initialize telemetry provider", zap.Error(err))
	}
	ctx := context.Background()
	ctx = context.WithValue(ctx, "logger", logger)
	ctx = context.WithValue(ctx, "telemetry", tp)
	ctx = context.WithValue(ctx, "redisClient", redisClient)
	if err = run(ctx, c); err != nil {
		logger.Fatal("Failed to run application", zap.Error(err))
	}
}

func run(ctx context.Context, c *config.Configuration) error {
	redisClient := ctx.Value("redisClient").(*redis.Client)
	logger := ctx.Value("logger").(*zap.Logger)
	tp := ctx.Value("telemetry").(telemetry.Provider)
	cartRepo := util.NewRedisCartRepository(redisClient, logger.With(zap.String("subsystem", "repository")), tp)
	cartService := application.NewCartService(cartRepo, logger.With(zap.String("subsystem", "service")), tp)
	cartHandler := handlers.NewCartHandler(cartService, logger.With(zap.String("subsystem", "handler")), tp)

	srv := router.InitRouter(cartHandler)
	httpServer := &http.Server{
		Addr:    net.JoinHostPort("", strconv.FormatUint(c.Port, 10)),
		Handler: srv,
	}
	go func() {
		logger.Debug("listening on %s\n", zap.String("listenAddr", httpServer.Addr))
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("error listening and serving", zap.Error(err))
		}
	}()
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		<-ctx.Done()
		shutdownCtx := context.Background()
		shutdownCtx, cancel := context.WithTimeout(shutdownCtx, 10*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			logger.Error("error shutting down http server", zap.Error(err))
		}
	}()
	wg.Wait()
	return nil
}
