import { getProductExpecting404 } from '../lib/catalog-client.ts';
import {
  getCartExpecting404,
  addToCartExpectingError,
  createCart,
  addToCart,
} from '../lib/cart-client.ts';
import { checkoutExpectingError, checkoutWithDeclinedCard } from '../lib/checkout-client.ts';
import { getProducts } from '../lib/catalog-client.ts';
import {
  getNonExistentId,
  generateUserId,
  generateEmail,
  getRandomAddress,
  getRandomFailingCreditCard,
  getRandomCreditCard,
  randomThinkTime,
  randomInt,
  randomSubset,
} from '../lib/helpers.ts';
import { scenarioExecutions } from '../metrics/custom-metrics.ts';

/**
 * Error Scenarios (5% of traffic)
 *
 * Intentionally generates errors to:
 * 1. Test error handling in services
 * 2. Generate error traces and logs for Grafana
 * 3. Validate monitoring and alerting
 */

/**
 * Invalid Cart ID Scenario
 *
 * Request a cart that doesn't exist (404 error)
 */
export function invalidCartId(): void {
  scenarioExecutions.add(1, { scenario: 'error_invalid_cart' });

  const nonExistentCartId = getNonExistentId();
  getCartExpecting404(nonExistentCartId);

  randomThinkTime();
}

/**
 * Invalid Product ID Scenario
 *
 * Request a product that doesn't exist (404 error)
 */
export function invalidProductId(): void {
  scenarioExecutions.add(1, { scenario: 'error_invalid_product' });

  const nonExistentProductId = getNonExistentId();
  getProductExpecting404(nonExistentProductId);

  randomThinkTime();
}

/**
 * Add to Non-Existent Cart Scenario
 *
 * Try to add items to a cart that doesn't exist
 */
export function addToNonExistentCart(): void {
  scenarioExecutions.add(1, { scenario: 'error_add_to_invalid_cart' });

  const products = getProducts();

  if (products.length === 0) {
    return;
  }

  const nonExistentCartId = getNonExistentId();
  const product = products[randomInt(0, products.length - 1)];

  addToCartExpectingError(nonExistentCartId, product.id, 1);

  randomThinkTime();
}

/**
 * Checkout Empty Cart Scenario
 *
 * Try to checkout with an empty cart
 */
export function checkoutEmptyCart(): void {
  scenarioExecutions.add(1, { scenario: 'error_checkout_empty_cart' });

  // Create a cart but don't add any items
  const cart = createCart();

  if (!cart) {
    return;
  }

  randomThinkTime();

  // Try to checkout with empty cart
  const userId = generateUserId();
  const email = generateEmail();
  const address = getRandomAddress();
  const creditCard = getRandomCreditCard();

  checkoutExpectingError(cart.id, userId, email, address, creditCard);
}

/**
 * Checkout Non-Existent Cart Scenario
 *
 * Try to checkout with a cart ID that doesn't exist
 */
export function checkoutNonExistentCart(): void {
  scenarioExecutions.add(1, { scenario: 'error_checkout_invalid_cart' });

  const nonExistentCartId = getNonExistentId();

  const userId = generateUserId();
  const email = generateEmail();
  const address = getRandomAddress();
  const creditCard = getRandomCreditCard();

  checkoutExpectingError(nonExistentCartId, userId, email, address, creditCard);

  randomThinkTime();
}

/**
 * Payment Declined Scenario
 *
 * Complete checkout flow but with a card that will be declined
 */
export function paymentDeclined(): void {
  scenarioExecutions.add(1, { scenario: 'error_payment_declined' });

  const products = getProducts();

  if (products.length === 0) {
    return;
  }

  // Create cart and add items normally
  const cart = createCart();

  if (!cart) {
    return;
  }

  // Add a product
  const product = products[randomInt(0, products.length - 1)];
  addToCart(cart.id, product.id, 1);

  randomThinkTime();

  // Checkout with a card designed to fail
  const userId = generateUserId();
  const email = generateEmail();
  const address = getRandomAddress();
  const declinedCard = getRandomFailingCreditCard();

  checkoutWithDeclinedCard(cart.id, userId, email, address, declinedCard);
}

/**
 * Mixed Error Scenario
 *
 * Randomly executes one of the error scenarios
 */
export function mixedErrors(): void {
  const errorScenarios = [
    invalidCartId,
    invalidProductId,
    addToNonExistentCart,
    checkoutEmptyCart,
    checkoutNonExistentCart,
    paymentDeclined,
  ];

  // Weighted distribution - payment declined is more realistic
  const weights = [15, 15, 10, 10, 10, 40];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const random = Math.random() * totalWeight;

  let cumulative = 0;
  for (let i = 0; i < errorScenarios.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      errorScenarios[i]();
      return;
    }
  }

  // Fallback
  paymentDeclined();
}

/**
 * Rapid Fire Errors
 *
 * Quick succession of error requests (for stress testing error handling)
 */
export function rapidFireErrors(): void {
  scenarioExecutions.add(1, { scenario: 'error_rapid_fire' });

  // Generate multiple 404s quickly
  for (let i = 0; i < 3; i++) {
    getCartExpecting404(getNonExistentId());
  }

  for (let i = 0; i < 3; i++) {
    getProductExpecting404(getNonExistentId());
  }
}

/**
 * Add Invalid Product to Cart
 *
 * Try to add a non-existent product to a valid cart
 */
export function addInvalidProductToCart(): void {
  scenarioExecutions.add(1, { scenario: 'error_add_invalid_product' });

  const cart = createCart();

  if (!cart) {
    return;
  }

  // Try to add a non-existent product
  const nonExistentProductId = getNonExistentId();
  addToCartExpectingError(cart.id, nonExistentProductId, 1);

  randomThinkTime();
}
