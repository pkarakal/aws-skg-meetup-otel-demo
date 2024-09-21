package main

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/application"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/config"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure/clients/cart"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure/clients/catalog"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure/clients/rabbitmq"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure/handlers"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/router"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/telemetry"
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

	telemetryKeys := []func(*telemetry.OTELProvider){
		telemetry.ServiceName("checkout"),
		telemetry.ServiceVersion("0.1.0"),
		telemetry.ServiceEnvironment("demo"),
		telemetry.ServiceHostName(),
	}

	tp, err := config.InitTelemetry(logger, &c.TelemetryConfig, telemetryKeys)
	if err != nil {
		logger.Error("couldn't initialize telemetry", zap.Error(err))
	}
	ctx := context.Background()
	ctx = context.WithValue(ctx, "logger", logger)
	ctx = context.WithValue(ctx, "telemetry", tp)
	if err = run(ctx, c); err != nil {
		logger.Fatal("Failed to run application", zap.Error(err))
	}
}

func run(ctx context.Context, c *config.Configuration) error {
	logger := ctx.Value("logger").(*zap.Logger)
	tp := ctx.Value("telemetry").(telemetry.Provider)
	cartConf, err := cart.NewCartConfig(fmt.Sprintf("%s://%s:%d%s", c.CartConfig.Protocol, c.CartConfig.Server, c.CartConfig.Port, c.CartConfig.Path), c.CartConfig.Timeout)
	if err != nil {
		logger.Fatal("Failed to create cart config", zap.Error(err))
	}
	catalogConf, err := catalog.NewCatalogConfig(fmt.Sprintf("%s://%s:%d%s", c.CatalogConfig.Protocol, c.CatalogConfig.Server, c.CatalogConfig.Port, c.CatalogConfig.Path), c.CatalogConfig.Timeout)
	if err != nil {
		logger.Error("Failed to create catalog client", zap.Error(err))
		return err
	}
	rabbitmqConf := rabbitmq.Config{
		Port:     c.RabbitMQConfig.Port,
		Host:     c.RabbitMQConfig.Host,
		Username: c.RabbitMQConfig.Username,
		Password: c.RabbitMQConfig.Password,
		Exchange: c.RabbitMQConfig.Exchange,
	}
	cartClient := cartConf.NewCartClient(cart.ClientOptions{
		Logger:            logger.With(zap.String("subsystem", "cart.client")),
		TelemetryProvider: tp,
	})
	catalogClient := catalogConf.NewCatalogClient(catalog.ClientOptions{
		Logger:            logger.With(zap.String("subsystem", "catalog.client")),
		TelemetryProvider: tp,
	})
	rabbitmqClient, err := rabbitmqConf.NewAMQPClient(rabbitmq.ClientOptions{
		Logger:            logger.With(zap.String("subsystem", "rabbitmq.client")),
		TelemetryProvider: tp,
	})
	if err != nil {
		logger.Error("Failed to create rabbitmq client", zap.Error(err))
		return err
	}
	checkoutRepo := infrastructure.NewCheckoutRepository(&cartClient, &catalogClient, rabbitmqClient, logger.With(zap.String("subsystem", "checkout.repository")), tp)
	checkoutSvc := application.NewCheckoutService(checkoutRepo, logger.With(zap.String("subsystem", "checkout.service")), tp)
	checkoutHandler := handlers.NewCheckoutHandler(checkoutSvc, logger.With(zap.String("subsystem", "checkout.handler")), tp)

	srv := router.InitRouter(checkoutHandler)
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
