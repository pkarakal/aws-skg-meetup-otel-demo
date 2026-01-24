import { getProducts, getProduct } from '../lib/catalog-client.ts';
import { createCart, addToCart, getCart } from '../lib/cart-client.ts';
import { checkout } from '../lib/checkout-client.ts';
import {
  randomSubset,
  randomThinkTime,
  generateUserId,
  generateEmail,
  getRandomAddress,
  getRandomCreditCard,
  getRandomQuantity,
} from '../lib/helpers.ts';
import {
  productsViewed,
  ordersPlaced,
  checkoutFlowDuration,
  scenarioExecutions,
  checkoutErrorRate,
} from '../metrics/custom-metrics.ts';

/**
 * Full Checkout Scenario (30% of traffic)
 *
 * Simulates a complete purchase flow:
 * 1. Browse products
 * 2. Create cart
 * 3. Add 1-3 random products
 * 4. Review cart
 * 5. Fill checkout form with random user data
 * 6. Complete purchase
 */
export function fullCheckout(): void {
  const startTime = Date.now();

  scenarioExecutions.add(1, { scenario: 'full_checkout' });

  // Step 1: Browse products
  const products = getProducts();

  if (products.length === 0) {
    checkoutErrorRate.add(true);
    checkoutFlowDuration.add(Date.now() - startTime);
    return;
  }

  randomThinkTime();

  // View a few products before deciding
  const productsToView = randomSubset(products, 2, 4);
  for (const product of productsToView) {
    getProduct(product.id);
    productsViewed.add(1);
    randomThinkTime();
  }

  // Step 2: Create cart
  const cart = createCart();

  if (!cart) {
    checkoutErrorRate.add(true);
    checkoutFlowDuration.add(Date.now() - startTime);
    return;
  }

  randomThinkTime();

  // Step 3: Add 1-3 random products to cart
  const productsToAdd = randomSubset(products, 1, 3);

  for (const product of productsToAdd) {
    const quantity = getRandomQuantity();
    const updatedCart = addToCart(cart.id, product.id, quantity);

    if (!updatedCart) {
      // Continue even if one add fails
      continue;
    }

    randomThinkTime();
  }

  // Step 4: Review cart
  const finalCart = getCart(cart.id);

  if (!finalCart || finalCart.items.length === 0) {
    checkoutErrorRate.add(true);
    checkoutFlowDuration.add(Date.now() - startTime);
    return;
  }

  randomThinkTime();

  // Step 5 & 6: Fill checkout form and complete purchase
  const userId = generateUserId();
  const email = generateEmail();
  const address = getRandomAddress();
  const creditCard = getRandomCreditCard();

  const result = checkout(cart.id, userId, email, address, creditCard);

  if (result) {
    ordersPlaced.add(1);
    checkoutErrorRate.add(false);
  } else {
    // Note: Payment service has 30% failure rate, checkout has 20% shipping failure
    // So failures are expected and not necessarily errors in the load test
    checkoutErrorRate.add(true);
  }

  checkoutFlowDuration.add(Date.now() - startTime);
}

/**
 * Express Checkout Scenario
 *
 * User knows exactly what they want - minimal browsing
 */
export function expressCheckout(): void {
  const startTime = Date.now();

  scenarioExecutions.add(1, { scenario: 'express_checkout' });

  // Get products and immediately add to cart
  const products = getProducts();

  if (products.length === 0) {
    checkoutFlowDuration.add(Date.now() - startTime);
    return;
  }

  // Create cart
  const cart = createCart();

  if (!cart) {
    checkoutFlowDuration.add(Date.now() - startTime);
    return;
  }

  // Add just one product
  const product = products[Math.floor(Math.random() * products.length)];
  addToCart(cart.id, product.id, 1);

  randomThinkTime();

  // Checkout immediately
  const userId = generateUserId();
  const email = generateEmail();
  const address = getRandomAddress();
  const creditCard = getRandomCreditCard();

  const result = checkout(cart.id, userId, email, address, creditCard);

  if (result) {
    ordersPlaced.add(1);
  }

  checkoutFlowDuration.add(Date.now() - startTime);
}

/**
 * Bulk Purchase Scenario
 *
 * User buying multiple items in larger quantities
 */
export function bulkPurchase(): void {
  const startTime = Date.now();

  scenarioExecutions.add(1, { scenario: 'bulk_purchase' });

  const products = getProducts();

  if (products.length === 0) {
    checkoutFlowDuration.add(Date.now() - startTime);
    return;
  }

  const cart = createCart();

  if (!cart) {
    checkoutFlowDuration.add(Date.now() - startTime);
    return;
  }

  // Add 3-5 products with higher quantities
  const productsToAdd = randomSubset(products, 3, 5);

  for (const product of productsToAdd) {
    // Higher quantity: 2-5 items
    const quantity = Math.floor(Math.random() * 4) + 2;
    addToCart(cart.id, product.id, quantity);
    randomThinkTime();
  }

  // Checkout
  const userId = generateUserId();
  const email = generateEmail();
  const address = getRandomAddress();
  const creditCard = getRandomCreditCard();

  const result = checkout(cart.id, userId, email, address, creditCard);

  if (result) {
    ordersPlaced.add(1);
  }

  checkoutFlowDuration.add(Date.now() - startTime);
}
