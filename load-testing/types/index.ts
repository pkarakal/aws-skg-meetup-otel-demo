// Cart types
export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

// Catalog types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: { url: string };
}

export interface Inventory {
  product_id: number;
  quantity: number;
}

// Checkout types
export interface Address {
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CreditCard {
  card_number: string;
  card_cvv: number;
  card_expiration_month: number;
  card_expiration_year: number;
  card_owner: string;
}

export interface CheckoutRequest {
  user_id: string;
  email: string;
  address: Address;
  credit_card: CreditCard;
}

export interface CheckoutResponse {
  message: string;
  new_cart_id?: number;
}

// Load testing config
export interface ServiceConfig {
  cartServiceUrl: string;
  catalogServiceUrl: string;
  checkoutServiceUrl: string;
}
