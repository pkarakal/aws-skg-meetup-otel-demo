package ports

import (
	"context"
	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/models"
)

type CheckoutRepository interface {
	PlaceOrder(context.Context, int64) error
	GetShippingCost(ctx context.Context) (float64, error)
	ChargeCard(context.Context, float64) error
	ShipOrder(context.Context) error
	SendConfirmation(context.Context, *models.Cart) error
}
