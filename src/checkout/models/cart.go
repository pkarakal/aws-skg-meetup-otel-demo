package models

type Cart struct {
	ID    int64      `json:"id"`
	Items []CartItem `json:"items"`
	Total float64    `json:"total"`
}

type InventoryUpdateMessage struct {
	AmountOrdered uint  `json:"amountOrdered"`
	ProductID     int64 `json:"productId"`
}

type CartItem struct {
	ProductID int64   `json:"product_id"`
	Quantity  uint    `json:"quantity"`
	Price     float64 `json:"price"`
}

func (i *CartItem) CalculatePriceDelta(inventory *Inventory) float64 {
	return inventory.Product.Price - i.Price
}

func (i *CartItem) IntoInventory() InventoryUpdateMessage {
	return InventoryUpdateMessage{
		ProductID:     i.ProductID,
		AmountOrdered: i.Quantity,
	}
}
