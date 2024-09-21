package infrastructure

import (
	"context"
	"encoding/json"
	"errors"
	"math/rand"
	"time"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure/clients/cart"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure/clients/catalog"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/infrastructure/clients/rabbitmq"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/models"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/telemetry"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

const (
	InventoryUpdateRk = "order.placed"
)

var (
	priceDelta       metric.Float64Histogram
	income           metric.Float64Histogram
	cardsCharged     metric.Int64Counter
	cardsDeclined    metric.Int64Counter
	labelsCreated    metric.Int64Counter
	labelsFailed     metric.Int64Counter
	successfulOrders metric.Int64Counter
	failedOrders     metric.Int64Counter
)

var (
	CartNotFound                  = errors.New("cart not found")
	ProductNotFound               = errors.New("product not found")
	InsufficientInventory         = errors.New("insufficient inventory")
	ShippingCostCalculationFailed = errors.New("shipping cost calculation failed")
	CardDeclined                  = errors.New("card declined")
	ShippingLabelNotIssued        = errors.New("shipping label not issued")
	InventoryUpdateFailure        = errors.New("failed to update inventory")
)

type CheckoutRepository struct {
	cartClient     *cart.Client
	catalogClient  *catalog.Client
	rabbitmqClient *rabbitmq.AMQP

	logger *zap.Logger
	tracer trace.Tracer
	meter  metric.Meter
}

func NewCheckoutRepository(cart *cart.Client, catalog *catalog.Client, rabbitmq *rabbitmq.AMQP, logger *zap.Logger, tp telemetry.Provider) *CheckoutRepository {
	if logger == nil {
		logger = zap.NewNop()
	}

	repo := &CheckoutRepository{
		cartClient:     cart,
		catalogClient:  catalog,
		rabbitmqClient: rabbitmq,
		logger:         logger,
		tracer:         tp.Tracer().Tracer("checkout.repository"),
		meter:          tp.Meter().Meter("checkout.repository"),
	}

	repo.initMetrics()
	return repo
}

func (r *CheckoutRepository) initMetrics() {
	var err error
	priceDelta, err = r.meter.Float64Histogram(
		"checkout.repository.price.delta",
		metric.WithDescription("The amount delta between the actual price and the price the user saw in cart"),
		metric.WithUnit("dollars"),
	)
	if err != nil {
		r.logger.Error("Failed to initialize price delta metric", zap.Error(err))
	}
	income, err = r.meter.Float64Histogram(
		"checkout.repository.income",
		metric.WithDescription("The income over time"),
		metric.WithUnit("dollar"),
	)
	if err != nil {
		r.logger.Error("Failed to initialize income metric", zap.Error(err))
	}
	cardsCharged, err = r.meter.Int64Counter(
		"checkout.repository.cards.charged",
		metric.WithDescription("The number of cards charged"),
		metric.WithUnit("1"),
	)
	if err != nil {
		r.logger.Error("Failed to initialize card charged", zap.Error(err))
	}
	cardsDeclined, err = r.meter.Int64Counter(
		"checkout.repository.cards.declined",
		metric.WithDescription("The number of cards declined"),
		metric.WithUnit("1"),
	)
	if err != nil {
		r.logger.Error("Failed to initialize card declined", zap.Error(err))
	}
	labelsCreated, err = r.meter.Int64Counter(
		"checkout.repository.labels.created",
		metric.WithDescription("The number of shipping labels created"),
		metric.WithUnit("1"),
	)
	if err != nil {
		r.logger.Error("Failed to initialize labels created", zap.Error(err))
	}
	labelsFailed, err = r.meter.Int64Counter(
		"checkout.repository.labels.failed",
		metric.WithDescription("The number of shipping labels failed"),
		metric.WithUnit("1"),
	)
	if err != nil {
		r.logger.Error("Failed to initialize labels failed", zap.Error(err))
	}
	successfulOrders, err = r.meter.Int64Counter(
		"checkout.repository.orders.successful",
		metric.WithDescription("The number of successful orders"),
		metric.WithUnit("1"),
	)
	if err != nil {
		r.logger.Error("Failed to initialize orders successful", zap.Error(err))
	}
	failedOrders, err = r.meter.Int64Counter(
		"checkout.repository.orders.failed",
		metric.WithDescription("The number of failed orders"),
		metric.WithUnit("1"),
	)
	if err != nil {
		r.logger.Error("Failed to initialize orders failed", zap.Error(err))
	}
}

func (r *CheckoutRepository) PlaceOrder(ctx context.Context, cartId int64) error {
	childCtx, span := r.tracer.Start(ctx, "PlaceOrder")
	defer span.End()

	userCart, err := r.cartClient.GetCart(childCtx, cartId)
	if err != nil {
		r.logger.Error("error getting cart from cart service", zap.Error(err))
		span.SetStatus(codes.Error, "error getting cart from cart service")
		span.RecordError(err)
		failedOrders.Add(childCtx, 1, metric.WithAttributes(attribute.String("reason", "CART_FAILURE")))
		return CartNotFound
	}

	products := make([]*models.Inventory, 0, len(userCart.Items))

	for _, item := range userCart.Items {
		product, err := r.catalogClient.GetProductInventory(childCtx, item.ProductID)
		if err != nil {
			r.logger.Error("error getting inventory from catalog service", zap.Error(err))
			span.SetStatus(codes.Error, "error getting inventory from catalog service")
			span.RecordError(err)
			failedOrders.Add(childCtx, 1, metric.WithAttributes(attribute.String("reason", "CATALOG_FAILURE")))
			return ProductNotFound
		}
		if product.Quantity <= 0 {
			r.logger.Error("quantity 0 is not valid", zap.Int64("product_id", item.ProductID))
			span.SetStatus(codes.Error, "quantity 0 is not valid")
			span.RecordError(errors.New("quantity 0 is not valid"))
			failedOrders.Add(childCtx, 1, metric.WithAttributes(attribute.String("reason", "INSUFFICIENT_INVENTORY")))
			return InsufficientInventory
		}
		delta := item.CalculatePriceDelta(product)
		priceDelta.Record(childCtx, delta, metric.WithAttributes(attribute.Int("productId", product.Product.Id)))
		if delta > 5.0 {
			r.logger.Warn("The pricing delta is too high and you're losing money")
		}
		products = append(products, product)
	}

	cost, err := r.GetShippingCost(childCtx)
	if err != nil {
		r.logger.Error("error getting shipping cost", zap.Error(err))
		span.SetStatus(codes.Error, "error getting shipping cost")
		span.RecordError(err)
		failedOrders.Add(childCtx, 1, metric.WithAttributes(attribute.String("reason", "SHIPPING_COST_FAILURE")))
		return ShippingCostCalculationFailed
	}
	err = r.ChargeCard(childCtx, userCart.Total+cost)
	if err != nil {
		r.logger.Error("error charging card", zap.Error(err))
		span.SetStatus(codes.Error, "error charging card")
		span.RecordError(err)
		failedOrders.Add(childCtx, 1, metric.WithAttributes(attribute.String("reason", "CARD_DECLINED")))
		return CardDeclined
	}

	err = r.ShipOrder(childCtx)
	if err != nil {
		r.logger.Error("error shipping order", zap.Error(err))
		span.SetStatus(codes.Error, "error shipping order")
		span.RecordError(err)
		failedOrders.Add(childCtx, 1, metric.WithAttributes(attribute.String("reason", "SHIPPING_LABEL_FAILURE")))
		return ShippingLabelNotIssued
	}

	err = r.SendConfirmation(childCtx, userCart)
	if err != nil {
		r.logger.Error("error sending confirmation", zap.Error(err))
		span.SetStatus(codes.Error, "error sending confirmation")
		span.RecordError(err)
		failedOrders.Add(ctx, 1, metric.WithAttributes(attribute.String("reason", "INVENTORY_UPDATE_FAILURE")))
		return InventoryUpdateFailure
	}
	successfulOrders.Add(childCtx, 1)
	return nil
}

func (r *CheckoutRepository) GetShippingCost(ctx context.Context) (float64, error) {
	childCtx, span := r.tracer.Start(ctx, "GetShippingCost")
	defer span.End()
	time.Sleep(100 * time.Millisecond)
	if rand.Float64() > 0.2 {
		span.SetStatus(codes.Ok, "Successfully got shipping cost from provider")
		span.SetAttributes(attribute.String("postalCode", childCtx.Value("postalCode").(string)))
		return rand.Float64() * 10, nil
	}
	span.SetStatus(codes.Error, "Failed to calculate shipping cost")
	return 0, errors.New("error getting shipping cost")
}

func (r *CheckoutRepository) ChargeCard(ctx context.Context, amount float64) error {
	childCtx, span := r.tracer.Start(ctx, "ChargeCard")
	defer span.End()
	time.Sleep(800 * time.Millisecond)
	if rand.Float64() > 0.2 {
		r.logger.Info("Successfully charged card", zap.Float64("amount", amount))
		cardsCharged.Add(childCtx, 1)
		income.Record(childCtx, amount)
		span.SetStatus(codes.Ok, "Successfully charged card")
		return nil
	}
	r.logger.Error("Failed to charge card", zap.Float64("amount", amount))
	span.SetStatus(codes.Error, "Failed to charge card")
	cardsDeclined.Add(childCtx, 1)
	return errors.New("error charging card")
}

func (r *CheckoutRepository) ShipOrder(ctx context.Context) error {
	childCtx, span := r.tracer.Start(ctx, "ShipOrder")
	defer span.End()
	time.Sleep(30 * time.Millisecond)
	if rand.Float64() > 0.2 {
		r.logger.Info("Successfully created shipping label", zap.String("postalCode", childCtx.Value("postalCode").(string)))
		span.SetAttributes(attribute.String("postalCode", childCtx.Value("postalCode").(string)))
		labelsCreated.Add(childCtx, 1, metric.WithAttributes(attribute.String("postalCode", childCtx.Value("postalCode").(string))))
		return nil
	}
	r.logger.Error("Failed to create shipping label")
	span.SetStatus(codes.Error, "Failed to create shipping label")
	labelsFailed.Add(childCtx, 1)
	return errors.New("error shipping order")
}

func (r *CheckoutRepository) SendConfirmation(ctx context.Context, cart *models.Cart) error {
	childCtx, span := r.tracer.Start(ctx, "SendConfirmation")
	defer span.End()
	for _, cartItem := range cart.Items {
		updateMsg := cartItem.IntoInventory()
		msg, err := json.Marshal(updateMsg)
		if err != nil {
			r.logger.Error("error marshalling update message", zap.Error(err))
			span.SetStatus(codes.Error, "error marshalling update message")
			span.RecordError(err)
			return err
		}
		err = r.rabbitmqClient.PublishMessage(childCtx, msg, InventoryUpdateRk)
		if err != nil {
			r.logger.Error("error publishing update message", zap.Error(err))
			span.SetStatus(codes.Error, "error publishing update message")
			span.RecordError(err)
			return err
		}
	}
	r.logger.Debug("Successfully sent inventory update messages")
	return nil
}
