package models

type Product struct {
	Id          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Image       *Image  `json:"image"`
}

type Image struct {
	Id          int    `json:"id"`
	FileName    string `json:"fileName"`
	Url         string `json:"url"`
	ContentType string `json:"contentType"`
	Size        int    `json:"size"`
}

type Inventory struct {
	Id       int      `json:"id"`
	Product  *Product `json:"product"`
	Quantity int      `json:"quantity"`
}
