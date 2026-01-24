import http from 'k6/http';
import { check } from 'k6';
import { config } from '../config.ts';
import { Cart, AddToCartRequest } from '../types/index.ts';
import { cartRequests, cartErrors, cartsCreated, itemsAddedToCart } from '../metrics/custom-metrics.ts';

const baseUrl = config.cartServiceUrl;
const jsonHeaders = { 'Content-Type': 'application/json' };

// Create a new cart
export function createCart(): Cart | null {
  const response = http.post(`${baseUrl}/api/v1/cart`, null, {
    tags: { name: 'POST /api/v1/cart' },
  });

  cartRequests.add(1);

  const success = check(response, {
    'create cart status is 201 or 200': (r) => r.status === 201 || r.status === 200,
  });

  if (!success) {
    cartErrors.add(1);
    return null;
  }

  cartsCreated.add(1);

  try {
    return JSON.parse(response.body as string) as Cart;
  } catch {
    cartErrors.add(1);
    return null;
  }
}

// Get cart by ID
export function getCart(cartId: number): Cart | null {
  const response = http.get(`${baseUrl}/api/v1/cart/${cartId}`, {
    tags: { name: 'GET /api/v1/cart/{id}' },
  });

  cartRequests.add(1);

  const success = check(response, {
    'get cart status is 200': (r) => r.status === 200,
  });

  if (!success) {
    cartErrors.add(1);
    return null;
  }

  try {
    return JSON.parse(response.body as string) as Cart;
  } catch {
    cartErrors.add(1);
    return null;
  }
}

// Add item to cart
export function addToCart(cartId: number, productId: number, quantity: number): Cart | null {
  const payload: AddToCartRequest = {
    product_id: productId,
    quantity: quantity,
  };

  const response = http.post(
    `${baseUrl}/api/v1/cart/${cartId}`,
    JSON.stringify(payload),
    {
      headers: jsonHeaders,
      tags: { name: 'POST /api/v1/cart/{id}' },
    }
  );

  cartRequests.add(1);

  const success = check(response, {
    'add to cart status is 200': (r) => r.status === 200,
  });

  if (!success) {
    cartErrors.add(1);
    return null;
  }

  itemsAddedToCart.add(quantity);

  try {
    return JSON.parse(response.body as string) as Cart;
  } catch {
    cartErrors.add(1);
    return null;
  }
}

// Empty cart
export function emptyCart(cartId: number): boolean {
  const response = http.post(`${baseUrl}/api/v1/cart/${cartId}/empty`, null, {
    tags: { name: 'POST /api/v1/cart/{id}/empty' },
  });

  cartRequests.add(1);

  const success = check(response, {
    'empty cart status is 200': (r) => r.status === 200,
  });

  if (!success) {
    cartErrors.add(1);
  }

  return success;
}

// Delete cart
export function deleteCart(cartId: number): boolean {
  const response = http.del(`${baseUrl}/api/v1/cart/${cartId}`, null, {
    tags: { name: 'DELETE /api/v1/cart/{id}' },
  });

  cartRequests.add(1);

  const success = check(response, {
    'delete cart status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });

  if (!success) {
    cartErrors.add(1);
  }

  return success;
}

// Get cart (expecting 404 - for error scenarios)
export function getCartExpecting404(cartId: number): boolean {
  const response = http.get(`${baseUrl}/api/v1/cart/${cartId}`, {
    tags: { name: 'GET /api/v1/cart/{id} (404 expected)' },
  });

  cartRequests.add(1);

  return check(response, {
    'get non-existent cart returns 404': (r) => r.status === 404,
  });
}

// Add to cart (expecting error - for error scenarios)
export function addToCartExpectingError(cartId: number, productId: number, quantity: number): boolean {
  const payload: AddToCartRequest = {
    product_id: productId,
    quantity: quantity,
  };

  const response = http.post(
    `${baseUrl}/api/v1/cart/${cartId}`,
    JSON.stringify(payload),
    {
      headers: jsonHeaders,
      tags: { name: 'POST /api/v1/cart/{id} (error expected)' },
    }
  );

  cartRequests.add(1);

  // Expect 4xx or 5xx status
  return check(response, {
    'add to invalid cart returns error': (r) => r.status >= 400,
  });
}
