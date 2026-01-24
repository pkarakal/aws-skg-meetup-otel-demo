import http from 'k6/http';
import { check } from 'k6';
import { config } from '../config.ts';
import { Product, Inventory } from '../types/index.ts';
import { catalogRequests, catalogErrors } from '../metrics/custom-metrics.ts';

const baseUrl = config.catalogServiceUrl;

// Get all products
export function getProducts(): Product[] {
  const response = http.get(`${baseUrl}/products`, {
    tags: { name: 'GET /products' },
  });

  catalogRequests.add(1);

  const success = check(response, {
    'get products status is 200': (r) => r.status === 200,
  });

  if (!success) {
    catalogErrors.add(1);
    return [];
  }

  try {
    return JSON.parse(response.body as string) as Product[];
  } catch {
    catalogErrors.add(1);
    return [];
  }
}

// Get product by ID
export function getProduct(productId: number): Product | null {
  const response = http.get(`${baseUrl}/products/${productId}`, {
    tags: { name: 'GET /products/{id}' },
  });

  catalogRequests.add(1);

  const success = check(response, {
    'get product status is 200': (r) => r.status === 200,
  });

  if (!success) {
    catalogErrors.add(1);
    return null;
  }

  try {
    return JSON.parse(response.body as string) as Product;
  } catch {
    catalogErrors.add(1);
    return null;
  }
}

// Get product inventory
export function getInventory(productId: number): Inventory | null {
  const response = http.get(`${baseUrl}/products/${productId}/inventory`, {
    tags: { name: 'GET /products/{id}/inventory' },
  });

  catalogRequests.add(1);

  const success = check(response, {
    'get inventory status is 200': (r) => r.status === 200,
  });

  if (!success) {
    catalogErrors.add(1);
    return null;
  }

  try {
    return JSON.parse(response.body as string) as Inventory;
  } catch {
    catalogErrors.add(1);
    return null;
  }
}

// Get product (expecting 404 - for error scenarios)
export function getProductExpecting404(productId: number): boolean {
  const response = http.get(`${baseUrl}/products/${productId}`, {
    tags: { name: 'GET /products/{id} (404 expected)' },
  });

  catalogRequests.add(1);

  return check(response, {
    'get non-existent product returns 404': (r) => r.status === 404,
  });
}
