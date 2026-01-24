import { getProducts, getProduct, getInventory } from '../lib/catalog-client.ts';
import { randomSubset, randomThinkTime, randomInt } from '../lib/helpers.ts';
import {
  productsViewed,
  browseProductsDuration,
  scenarioExecutions,
  catalogErrorRate,
} from '../metrics/custom-metrics.ts';
import { Product } from '../types/index.ts';

/**
 * Browse Products Scenario (50% of traffic)
 *
 * Simulates a user browsing the product catalog:
 * 1. Get all products from catalog
 * 2. View 2-4 random products in detail
 * 3. Check inventory for some products
 * 4. User leaves without purchasing
 */
export function browseProducts(): void {
  const startTime = Date.now();
  let errors = 0;
  let requests = 0;

  scenarioExecutions.add(1, { scenario: 'browse_products' });

  // Step 1: Get all products
  const products = getProducts();
  requests++;

  if (products.length === 0) {
    errors++;
    catalogErrorRate.add(true);
    browseProductsDuration.add(Date.now() - startTime);
    return;
  }

  randomThinkTime();

  // Step 2: View 2-4 random products in detail
  const productsToView = randomSubset(products, 2, 4);

  for (const product of productsToView) {
    const productDetail = getProduct(product.id);
    requests++;

    if (productDetail) {
      productsViewed.add(1);
    } else {
      errors++;
    }

    randomThinkTime();

    // Step 3: Check inventory for some products (50% chance)
    if (Math.random() < 0.5) {
      const inventory = getInventory(product.id);
      requests++;

      if (!inventory) {
        errors++;
      }

      randomThinkTime();
    }
  }

  // Record metrics
  catalogErrorRate.add(errors > 0);
  browseProductsDuration.add(Date.now() - startTime);
}

/**
 * Extended Browse Scenario
 *
 * A longer browsing session that simulates a more engaged user
 */
export function extendedBrowse(): void {
  const startTime = Date.now();

  scenarioExecutions.add(1, { scenario: 'extended_browse' });

  // Get all products
  const products = getProducts();

  if (products.length === 0) {
    browseProductsDuration.add(Date.now() - startTime);
    return;
  }

  randomThinkTime();

  // View more products (4-8)
  const productsToView = randomSubset(products, 4, 8);

  for (const product of productsToView) {
    getProduct(product.id);
    productsViewed.add(1);
    randomThinkTime();

    // Check inventory more frequently (70% chance)
    if (Math.random() < 0.7) {
      getInventory(product.id);
      randomThinkTime();
    }
  }

  browseProductsDuration.add(Date.now() - startTime);
}

/**
 * Quick Browse Scenario
 *
 * A quick look at the catalog - user just checking what's available
 */
export function quickBrowse(): void {
  const startTime = Date.now();

  scenarioExecutions.add(1, { scenario: 'quick_browse' });

  // Just get the product list
  const products = getProducts();

  if (products.length > 0) {
    // Maybe look at one product
    if (Math.random() < 0.3) {
      const product = products[randomInt(0, products.length - 1)];
      getProduct(product.id);
      productsViewed.add(1);
    }
  }

  browseProductsDuration.add(Date.now() - startTime);
}
