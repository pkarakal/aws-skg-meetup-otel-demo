package model

type Cart struct {
	ID    int64      `json:"id"`
	Items []CartItem `json:"items"`
	Total float64    `json:"total"`
}

type CartItem struct {
	ProductID int64   `json:"product_id"`
	Quantity  uint    `json:"quantity"`
	Price     float64 `json:"price"`
}

func (c *Cart) AddItem(item CartItem) {
	defer c.calculateTotal()
	// check if product exists in Items
	if c.checkProductExists(item.ProductID) {
		for i, product := range c.Items {
			if product.ProductID == item.ProductID {
				c.Items[i].Quantity = item.Quantity
			}
		}
		return
	}
	c.Items = append(c.Items, item)
}

func (c *Cart) checkProductExists(productID int64) bool {
	for _, product := range c.Items {
		if product.ProductID == productID {
			return true
		}
	}
	return false
}

func (c *Cart) Clear() {
	c.Items = []CartItem{}
	c.Total = 0
}

func (c *Cart) calculateTotal() {
	total := 0.0
	for _, item := range c.Items {
		total += item.Price * float64(item.Quantity)
	}
	c.Total = total
}
