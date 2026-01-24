import { getProducts, getProduct } from '../lib/catalog-client.ts';
import { createCart, addToCart, getCart, emptyCart, deleteCart } from '../lib/cart-client.ts';
import {
  randomSubset,
  randomThinkTime,
  getRandomQuantity,
  randomInt,
} from '../lib/helpers.ts';
import {
  productsViewed,
  abandonedCarts,
  scenarioExecutions,
} from '../metrics/custom-metrics.ts';

/**
 * Abandoned Cart Scenario (15% of traffic)
 *
 * Simulates a user who adds items to cart but leaves without completing checkout:
 * 1. Browse some products
 * 2. Create cart
 * 3. Add items to cart
 * 4. Review cart
 * 5. Leave without completing checkout
 */
export function abandonedCart(): void {
  scenarioExecutions.add(1, { scenario: 'abandoned_cart' });

  // Step 1: Browse products
  const products = getProducts();

  if (products.length === 0) {
    return;
  }

  randomThinkTime();

  // View a few products
  const productsToView = randomSubset(products, 1, 3);
  for (const product of productsToView) {
    getProduct(product.id);
    productsViewed.add(1);
    randomThinkTime();
  }

  // Step 2: Create cart
  const cart = createCart();

  if (!cart) {
    return;
  }

  randomThinkTime();

  // Step 3: Add 1-3 products to cart
  const productsToAdd = randomSubset(products, 1, 3);

  for (const product of productsToAdd) {
    const quantity = getRandomQuantity();
    addToCart(cart.id, product.id, quantity);
    randomThinkTime();
  }

  // Step 4: Review cart
  getCart(cart.id);

  // Longer think time - user is hesitating
  randomThinkTime();
  randomThinkTime();

  // Step 5: User decides to leave
  // In reality, they just close the browser
  // We track this as an abandoned cart
  abandonedCarts.add(1);
}

/**
 * Cart Abandonment After Price Check
 *
 * User adds items, sees the total, and abandons
 */
export function abandonAfterPriceCheck(): void {
  scenarioExecutions.add(1, { scenario: 'abandon_price_check' });

  const products = getProducts();

  if (products.length === 0) {
    return;
  }

  const cart = createCart();

  if (!cart) {
    return;
  }

  // Add several items
  const productsToAdd = randomSubset(products, 2, 4);

  for (const product of productsToAdd) {
    addToCart(cart.id, product.id, getRandomQuantity());
    randomThinkTime();
  }

  // Check cart total multiple times (price comparison behavior)
  getCart(cart.id);
  randomThinkTime();
  getCart(cart.id);

  // User abandons after seeing the price
  abandonedCarts.add(1);
}

/**
 * Cart Emptied Scenario
 *
 * User adds items, then empties the cart and leaves
 */
export function cartEmptied(): void {
  scenarioExecutions.add(1, { scenario: 'cart_emptied' });

  const products = getProducts();

  if (products.length === 0) {
    return;
  }

  const cart = createCart();

  if (!cart) {
    return;
  }

  // Add items
  const productsToAdd = randomSubset(products, 1, 2);

  for (const product of productsToAdd) {
    addToCart(cart.id, product.id, getRandomQuantity());
  }

  randomThinkTime();

  // User decides to empty the cart
  emptyCart(cart.id);

  // Track as abandonment
  abandonedCarts.add(1);
}

/**
 * Cart Deleted Scenario
 *
 * User creates cart, adds items, then explicitly deletes it
 */
export function cartDeleted(): void {
  scenarioExecutions.add(1, { scenario: 'cart_deleted' });

  const products = getProducts();

  if (products.length === 0) {
    return;
  }

  const cart = createCart();

  if (!cart) {
    return;
  }

  // Add a few items
  const productsToAdd = randomSubset(products, 1, 3);

  for (const product of productsToAdd) {
    addToCart(cart.id, product.id, 1);
  }

  randomThinkTime();

  // Delete the cart
  deleteCart(cart.id);

  abandonedCarts.add(1);
}

/**
 * Indecisive Shopper Scenario
 *
 * User adds items, removes some, adds different ones, then abandons
 */
export function indecisiveShopper(): void {
  scenarioExecutions.add(1, { scenario: 'indecisive_shopper' });

  const products = getProducts();

  if (products.length < 3) {
    return;
  }

  const cart = createCart();

  if (!cart) {
    return;
  }

  // First round of adding
  let productsToAdd = randomSubset(products, 2, 3);
  for (const product of productsToAdd) {
    addToCart(cart.id, product.id, 1);
    randomThinkTime();
  }

  // Review cart
  getCart(cart.id);
  randomThinkTime();

  // Empty cart (changed mind)
  emptyCart(cart.id);
  randomThinkTime();

  // Add different products
  productsToAdd = randomSubset(products, 1, 2);
  for (const product of productsToAdd) {
    addToCart(cart.id, product.id, getRandomQuantity());
    randomThinkTime();
  }

  // Final review
  getCart(cart.id);
  randomThinkTime();

  // Still abandons
  abandonedCarts.add(1);
}
