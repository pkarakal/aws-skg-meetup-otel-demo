import { sleep as k6Sleep } from 'k6';
import { Address, CreditCard } from '../types/index.ts';
import { thinkTime } from '../config.ts';

// Random number between min and max (inclusive)
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random element from array
export function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// Random subset of array
export function randomSubset<T>(arr: T[], minCount: number, maxCount: number): T[] {
  const count = randomInt(minCount, Math.min(maxCount, arr.length));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Generate random user ID
export function generateUserId(): string {
  return `user-${randomInt(1000, 9999)}-${Date.now()}`;
}

// Generate random email
export function generateEmail(): string {
  const domains = ['example.com', 'test.org', 'demo.net', 'loadtest.io'];
  const names = ['john', 'jane', 'alex', 'sam', 'chris', 'pat', 'taylor', 'jordan'];
  return `${randomElement(names)}${randomInt(1, 999)}@${randomElement(domains)}`;
}

// Sample addresses for testing
const addresses: Address[] = [
  {
    street_address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
  },
  {
    street_address: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    postal_code: '90001',
    country: 'USA',
  },
  {
    street_address: '789 Pine Road',
    city: 'Chicago',
    state: 'IL',
    postal_code: '60601',
    country: 'USA',
  },
  {
    street_address: '321 Elm Street',
    city: 'Houston',
    state: 'TX',
    postal_code: '77001',
    country: 'USA',
  },
  {
    street_address: '654 Maple Drive',
    city: 'Seattle',
    state: 'WA',
    postal_code: '98101',
    country: 'USA',
  },
  {
    street_address: '10 Downing Street',
    city: 'London',
    state: 'Greater London',
    postal_code: 'SW1A 2AA',
    country: 'UK',
  },
  {
    street_address: 'Alexanderplatz 1',
    city: 'Berlin',
    state: 'Berlin',
    postal_code: '10178',
    country: 'Germany',
  },
  {
    street_address: '1 Champs-Élysées',
    city: 'Paris',
    state: 'Île-de-France',
    postal_code: '75008',
    country: 'France',
  },
];

// Sample credit cards - mix of valid and failing cards
const creditCards: CreditCard[] = [
  // Valid cards (will succeed)
  {
    card_number: '4111111111111111',
    card_cvv: 123,
    card_expiration_month: 12,
    card_expiration_year: 2026,
    card_owner: 'Test User One',
  },
  {
    card_number: '4242424242424242',
    card_cvv: 456,
    card_expiration_month: 6,
    card_expiration_year: 2027,
    card_owner: 'Test User Two',
  },
  {
    card_number: '5555555555554444',
    card_cvv: 789,
    card_expiration_month: 3,
    card_expiration_year: 2028,
    card_owner: 'Test User Three',
  },
  // Additional valid cards
  {
    card_number: '4000056655665556',
    card_cvv: 111,
    card_expiration_month: 9,
    card_expiration_year: 2026,
    card_owner: 'Test User Four',
  },
  {
    card_number: '5200828282828210',
    card_cvv: 222,
    card_expiration_month: 11,
    card_expiration_year: 2027,
    card_owner: 'Test User Five',
  },
];

// Cards designed to fail (for error scenarios)
const failingCreditCards: CreditCard[] = [
  {
    card_number: '4000000000000002',
    card_cvv: 999,
    card_expiration_month: 1,
    card_expiration_year: 2026,
    card_owner: 'Declined Card',
  },
  {
    card_number: '4000000000009995',
    card_cvv: 888,
    card_expiration_month: 2,
    card_expiration_year: 2026,
    card_owner: 'Insufficient Funds',
  },
  {
    card_number: '4000000000000069',
    card_cvv: 777,
    card_expiration_month: 3,
    card_expiration_year: 2026,
    card_owner: 'Expired Card',
  },
];

// Get random address
export function getRandomAddress(): Address {
  return randomElement(addresses);
}

// Get random valid credit card
export function getRandomCreditCard(): CreditCard {
  return randomElement(creditCards);
}

// Get random failing credit card (for error scenarios)
export function getRandomFailingCreditCard(): CreditCard {
  return randomElement(failingCreditCards);
}

// Get credit card with specified failure probability
export function getCreditCardWithFailureProbability(failureProbability: number): CreditCard {
  if (Math.random() < failureProbability) {
    return getRandomFailingCreditCard();
  }
  return getRandomCreditCard();
}

// Simulate user think time between actions
export function sleep(seconds: number): void {
  k6Sleep(seconds);
}

// Random think time between min and max
export function randomThinkTime(): void {
  const duration = randomInt(thinkTime.min * 1000, thinkTime.max * 1000) / 1000;
  sleep(duration);
}

// Generate a non-existent ID for error testing
export function getNonExistentId(): number {
  return randomInt(999999, 9999999);
}

// Generate random quantity for cart items
export function getRandomQuantity(): number {
  return randomInt(1, 3);
}
