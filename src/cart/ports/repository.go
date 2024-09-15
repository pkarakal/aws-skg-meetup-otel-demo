package ports

import (
	"context"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/cart/model"
)

type CartRepository interface {
	Save(ctx context.Context, cart model.Cart) error
	GetByID(ctx context.Context, id string) (*model.Cart, error)
	GenerateNextCartID(ctx context.Context) (*int64, error)
}
