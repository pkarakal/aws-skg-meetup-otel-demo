package models

type PlaceOrderRequest struct {
	UserId     string     `json:"user_id"`
	Email      string     `json:"email"`
	Address    Address    `json:"address"`
	CreditCard CreditCard `json:"credit_card"`
}

type Address struct {
	StreetAddress string `json:"street_address"`
	City          string `json:"city"`
	State         string `json:"state"`
	PostalCode    string `json:"postal_code"`
	Country       string `json:"country"`
}

type CreditCard struct {
	CardNumber          string `json:"card_number"`
	CardCvv             int32  `json:"card_cvv"`
	CardExpirationMonth int32  `json:"card_expiration_month"`
	CardExpirationYear  int32  `json:"card_expiration_year"`
}
