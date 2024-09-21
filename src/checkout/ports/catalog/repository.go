package cart

import (
	"context"

	"github.com/pkarakal/aws-skg-meetup-otel-demo/src/checkout/models"
)

type Repository interface {
	GetProduct(context.Context, int64) (*models.Product, error)
	GetProductInventory(context.Context, int64) (*models.Inventory, error)
}
