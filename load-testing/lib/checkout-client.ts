import http from 'k6/http';
import { check } from 'k6';
import { config } from '../config.ts';
import { CheckoutRequest, CheckoutResponse, Address, CreditCard } from '../types/index.ts';
import {
  checkoutRequests,
  checkoutErrors,
  checkoutsCompleted,
  checkoutsFailed,
} from '../metrics/custom-metrics.ts';

const baseUrl = config.checkoutServiceUrl;
const jsonHeaders = { 'Content-Type': 'application/json' };

// Perform checkout
export function checkout(
  cartId: number,
  userId: string,
  email: string,
  address: Address,
  creditCard: CreditCard
): CheckoutResponse | null {
  const payload: CheckoutRequest = {
    user_id: userId,
    email: email,
    address: address,
    credit_card: creditCard,
  };

  const response = http.post(
    `${baseUrl}/api/v1/checkout/${cartId}`,
    JSON.stringify(payload),
    {
      headers: jsonHeaders,
      tags: { name: 'POST /api/v1/checkout/{cartId}' },
    }
  );

  checkoutRequests.add(1);

  const success = check(response, {
    'checkout status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  if (!success) {
    checkoutErrors.add(1);
    checkoutsFailed.add(1);
    return null;
  }

  checkoutsCompleted.add(1);

  try {
    return JSON.parse(response.body as string) as CheckoutResponse;
  } catch {
    checkoutErrors.add(1);
    return null;
  }
}

// Checkout with empty/non-existent cart (for error scenarios)
export function checkoutExpectingError(
  cartId: number,
  userId: string,
  email: string,
  address: Address,
  creditCard: CreditCard
): boolean {
  const payload: CheckoutRequest = {
    user_id: userId,
    email: email,
    address: address,
    credit_card: creditCard,
  };

  const response = http.post(
    `${baseUrl}/api/v1/checkout/${cartId}`,
    JSON.stringify(payload),
    {
      headers: jsonHeaders,
      tags: { name: 'POST /api/v1/checkout/{cartId} (error expected)' },
    }
  );

  checkoutRequests.add(1);

  // Expect 4xx or 5xx status
  const isError = check(response, {
    'checkout with invalid cart returns error': (r) => r.status >= 400,
  });

  if (isError) {
    checkoutsFailed.add(1);
  }

  return isError;
}

// Checkout with declined card (for error scenarios)
export function checkoutWithDeclinedCard(
  cartId: number,
  userId: string,
  email: string,
  address: Address,
  declinedCard: CreditCard
): boolean {
  const payload: CheckoutRequest = {
    user_id: userId,
    email: email,
    address: address,
    credit_card: declinedCard,
  };

  const response = http.post(
    `${baseUrl}/api/v1/checkout/${cartId}`,
    JSON.stringify(payload),
    {
      headers: jsonHeaders,
      tags: { name: 'POST /api/v1/checkout/{cartId} (payment decline expected)' },
    }
  );

  checkoutRequests.add(1);

  // Payment failures might return 400 or 402 or similar
  const failed = response.status >= 400;

  if (failed) {
    checkoutsFailed.add(1);
  } else {
    // Payment service has built-in 30% failure rate, so success is also valid
    checkoutsCompleted.add(1);
  }

  return failed;
}
