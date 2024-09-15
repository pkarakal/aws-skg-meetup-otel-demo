package application

import (
	"context"
	"go.opentelemetry.io/otel/codes"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/model"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/ports"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/telemetry"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type CartService struct {
	repo ports.CartRepository

	logger *zap.Logger
	tracer trace.Tracer
	meter  metric.Meter
}

func NewCartService(repo ports.CartRepository, logger *zap.Logger, tp telemetry.Provider) *CartService {
	if logger == nil {
		logger = zap.NewNop()
	}

	s := &CartService{
		repo:   repo,
		logger: logger,
		tracer: tp.Tracer().Tracer("cart.service"),
		meter:  tp.Meter().Meter("cart.service"),
	}

	return s
}

func (s *CartService) AddItem(ctx context.Context, cartID string, item model.CartItem) (*model.Cart, error) {
	childCtx, span := s.tracer.Start(ctx, "AddItem")
	defer span.End()
	s.logger.Debug("Will try to add item to cart", zap.String("cartID", cartID), zap.Any("item", item))
	cart, err := s.repo.GetByID(childCtx, cartID)
	if err != nil {
		s.logger.Error("Error finding cart", zap.String("cartID", cartID), zap.Error(err))
		return nil, err
	}
	if cart == nil {
		s.logger.Warn("Couldn't find cart with the given ID. Creating a new one", zap.String("cartID", cartID))
		cart, err = s.NewCart(childCtx)
		if err != nil {
			s.logger.Error("Error creating cart", zap.String("cartID", cartID), zap.Error(err))
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
	}

	cart.AddItem(item)
	err = s.repo.Save(childCtx, *cart)
	if err != nil {
		s.logger.Error("Error updating cart", zap.String("cartID", cartID), zap.Error(err))
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return cart, err
	}
	return cart, nil
}

func (s *CartService) GetCart(ctx context.Context, cartID string) (*model.Cart, error) {
	childCtx, span := s.tracer.Start(ctx, "GetCart")
	defer span.End()
	cart, err := s.repo.GetByID(childCtx, cartID)
	if err != nil {
		s.logger.Error("Error finding cart", zap.String("cartID", cartID), zap.Error(err))
		return nil, err
	}
	if cart == nil {
		s.logger.Error("Cart not found", zap.String("cartID", cartID))
		return nil, CartNotFound
	}
	return cart, nil
}

func (s *CartService) EmptyCart(ctx context.Context, cartID string) (*model.Cart, error) {
	childCtx, span := s.tracer.Start(ctx, "EmptyCart")
	defer span.End()
	cart, err := s.repo.GetByID(childCtx, cartID)
	if err != nil {
		return nil, err
	}
	if cart == nil {
		return nil, nil // Cart doesn't exist, nothing to empty
	}

	cart.Clear()
	err = s.repo.Save(ctx, *cart)
	if err != nil {
		s.logger.Error("Failed to clear the cart")
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	return cart, nil
}

func (s *CartService) NewCart(ctx context.Context) (*model.Cart, error) {
	childCtx, span := s.tracer.Start(ctx, "NewCart")
	defer span.End()
	cartID, err := s.repo.GenerateNextCartID(childCtx)
	if err != nil {
		s.logger.Error("An error occurred while generating the next cart id")
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	if cartID == nil {
		s.logger.Warn("The cart ID returned was null")
		cartID = new(int64)
		*cartID = 0
	}
	cart := &model.Cart{
		ID: *cartID,
	}

	s.repo.Save(childCtx, *cart)
	return cart, nil

}
