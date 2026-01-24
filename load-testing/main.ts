import { Options } from 'k6/options';
import { thresholds } from './config.ts';

// Import scenarios
import { browseProducts, extendedBrowse, quickBrowse } from './scenarios/browse-products.ts';
import { fullCheckout, expressCheckout, bulkPurchase } from './scenarios/full-checkout.ts';
import {
  abandonedCart,
  abandonAfterPriceCheck,
  cartEmptied,
  indecisiveShopper,
} from './scenarios/abandoned-cart.ts';
import {
  mixedErrors,
  invalidCartId,
  invalidProductId,
  paymentDeclined,
} from './scenarios/error-scenarios.ts';

// k6 options
export const options: Options = {
  scenarios: {
    // Browse Products (50% of traffic)
    browse_products: {
      executor: 'ramping-vus',
      exec: 'browseScenario',
      stages: [
        { duration: '2m', target: 10 }, // Ramp up
        { duration: '5m', target: 20 }, // Steady state
        { duration: '2m', target: 30 }, // Peak
        { duration: '3m', target: 20 }, // Cool down
        { duration: '1m', target: 0 }, // Ramp down
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'browse_products' },
    },

    // Checkout Flow (30% of traffic)
    checkout_flow: {
      executor: 'constant-arrival-rate',
      exec: 'checkoutScenario',
      rate: 5,
      timeUnit: '1m',
      duration: '13m',
      preAllocatedVUs: 10,
      maxVUs: 20,
      tags: { scenario: 'checkout_flow' },
    },

    // Abandoned Carts (15% of traffic)
    abandoned_carts: {
      executor: 'constant-vus',
      exec: 'abandonedCartScenario',
      vus: 5,
      duration: '13m',
      tags: { scenario: 'abandoned_carts' },
    },

    // Error Generation (5% of traffic)
    error_generation: {
      executor: 'constant-vus',
      exec: 'errorScenario',
      vus: 2,
      duration: '13m',
      tags: { scenario: 'error_generation' },
    },
  },

  thresholds: thresholds,

  // Summary configuration
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

/**
 * Browse Products Scenario Handler
 *
 * Randomly selects between different browsing behaviors
 */
export function browseScenario(): void {
  const rand = Math.random();

  if (rand < 0.6) {
    // 60% - Standard browsing
    browseProducts();
  } else if (rand < 0.85) {
    // 25% - Extended browsing (engaged user)
    extendedBrowse();
  } else {
    // 15% - Quick browse (just checking)
    quickBrowse();
  }
}

/**
 * Checkout Scenario Handler
 *
 * Randomly selects between different checkout behaviors
 */
export function checkoutScenario(): void {
  const rand = Math.random();

  if (rand < 0.7) {
    // 70% - Full checkout with browsing
    fullCheckout();
  } else if (rand < 0.9) {
    // 20% - Express checkout (knows what they want)
    expressCheckout();
  } else {
    // 10% - Bulk purchase
    bulkPurchase();
  }
}

/**
 * Abandoned Cart Scenario Handler
 *
 * Randomly selects between different abandonment behaviors
 */
export function abandonedCartScenario(): void {
  const rand = Math.random();

  if (rand < 0.5) {
    // 50% - Standard abandonment
    abandonedCart();
  } else if (rand < 0.75) {
    // 25% - Abandon after seeing price
    abandonAfterPriceCheck();
  } else if (rand < 0.9) {
    // 15% - Indecisive shopper
    indecisiveShopper();
  } else {
    // 10% - Cart emptied/deleted
    cartEmptied();
  }
}

/**
 * Error Scenario Handler
 *
 * Generates various error conditions
 */
export function errorScenario(): void {
  const rand = Math.random();

  if (rand < 0.4) {
    // 40% - Payment failures (most realistic error)
    paymentDeclined();
  } else if (rand < 0.6) {
    // 20% - Invalid cart errors
    invalidCartId();
  } else if (rand < 0.8) {
    // 20% - Invalid product errors
    invalidProductId();
  } else {
    // 20% - Mixed errors
    mixedErrors();
  }
}

/**
 * Default function (used when running without scenarios)
 */
export default function (): void {
  const rand = Math.random();

  if (rand < 0.5) {
    browseScenario();
  } else if (rand < 0.8) {
    checkoutScenario();
  } else if (rand < 0.95) {
    abandonedCartScenario();
  } else {
    errorScenario();
  }
}

// Setup function - runs once before the test
export function setup(): void {
  console.log('Starting k6 load test for OpenTelemetry Demo');
  console.log('='.repeat(50));
  console.log('Scenarios:');
  console.log('  - Browse Products: 50% of traffic');
  console.log('  - Checkout Flow: 30% of traffic');
  console.log('  - Abandoned Carts: 15% of traffic');
  console.log('  - Error Scenarios: 5% of traffic');
  console.log('='.repeat(50));
}

// Teardown function - runs once after the test
export function teardown(): void {
  console.log('='.repeat(50));
  console.log('k6 load test completed');
  console.log('Check Grafana dashboards for telemetry data');
  console.log('='.repeat(50));
}
