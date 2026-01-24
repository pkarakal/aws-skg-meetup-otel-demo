import { ServiceConfig } from './types/index.ts';

// Service URLs - can be overridden via environment variables
export const config: ServiceConfig = {
  cartServiceUrl: __ENV.CART_SERVICE_URL || 'http://localhost:8081',
  catalogServiceUrl: __ENV.CATALOG_SERVICE_URL || 'http://localhost:8080',
  checkoutServiceUrl: __ENV.CHECKOUT_SERVICE_URL || 'http://localhost:8082',
};

// Thresholds for k6 metrics
export const thresholds = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.1'],
  'http_req_duration{scenario:browse_products}': ['p(95)<300'],
  'http_req_duration{scenario:checkout_flow}': ['p(95)<800'],
};

// Think time between actions (in seconds)
export const thinkTime = {
  min: 1,
  max: 3,
};

// Retry configuration
export const retryConfig = {
  maxRetries: 2,
  retryDelay: 500,
};
