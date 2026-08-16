import Stripe from 'stripe';

let cachedStripe: { key: string; client: Stripe } | null = null;

export function getStripe(apiKey?: string): Stripe | null {
  if (!apiKey) return null;
  if (cachedStripe && cachedStripe.key === apiKey) {
    return cachedStripe.client;
  }
  const client = new Stripe(apiKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  cachedStripe = { key: apiKey, client };
  return client;
}
