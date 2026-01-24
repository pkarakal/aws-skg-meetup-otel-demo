import { Counter, Trend, Rate } from 'k6/metrics';

// Cart service metrics
export const cartRequests = new Counter('cart_requests_total');
export const cartErrors = new Counter('cart_errors_total');
export const cartsCreated = new Counter('carts_created_total');
export const itemsAddedToCart = new Counter('items_added_to_cart_total');

// Catalog service metrics
export const catalogRequests = new Counter('catalog_requests_total');
export const catalogErrors = new Counter('catalog_errors_total');
export const productsViewed = new Counter('products_viewed_total');

// Checkout service metrics
export const checkoutRequests = new Counter('checkout_requests_total');
export const checkoutErrors = new Counter('checkout_errors_total');
export const checkoutsCompleted = new Counter('checkouts_completed_total');
export const checkoutsFailed = new Counter('checkouts_failed_total');

// Business metrics
export const ordersPlaced = new Counter('orders_placed_total');
export const abandonedCarts = new Counter('abandoned_carts_total');

// Latency trends
export const browseProductsDuration = new Trend('browse_products_duration');
export const checkoutFlowDuration = new Trend('checkout_flow_duration');
export const addToCartDuration = new Trend('add_to_cart_duration');

// Error rates
export const catalogErrorRate = new Rate('catalog_error_rate');
export const cartErrorRate = new Rate('cart_error_rate');
export const checkoutErrorRate = new Rate('checkout_error_rate');

// Scenario tracking
export const scenarioExecutions = new Counter('scenario_executions_total');
