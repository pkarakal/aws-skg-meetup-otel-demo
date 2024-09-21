package application

import (
	"context"
	"errors"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/models"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/ports"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/telemetry"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

func NewCheckoutService(repo ports.CheckoutRepository, logger *zap.Logger, tp telemetry.Provider) *CheckoutService {
	if logger == nil {
		logger = zap.NewNop()
	}

	s := &CheckoutService{
		repo:   repo,
		logger: logger,
		tracer: tp.Tracer().Tracer("checkout.service"),
		meter:  tp.Meter().Meter("checkout.service"),
	}

	return s
}

type CheckoutService struct {
	repo ports.CheckoutRepository

	logger *zap.Logger
	tracer trace.Tracer
	meter  metric.Meter
}

func (s *CheckoutService) PlaceOrder(ctx context.Context, cartId int64, order *models.PlaceOrderRequest) error {
	childCtx, span := s.tracer.Start(ctx, "PlaceOrder")
	defer span.End()
	if order == nil {
		s.logger.Error("Missing order request")
		return errors.New("missing order request")
	}
	childCtx = context.WithValue(childCtx, "postalCode", order.Address.PostalCode)
	err := s.repo.PlaceOrder(childCtx, cartId)
	if err != nil {
		s.logger.Error("Error placing order", zap.Error(err))
		return err
	}
	return nil
}
