package cart

import (
	"context"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/models"
)

type Repository interface {
	GetCart(context.Context, int64) (*models.Cart, error)
}
