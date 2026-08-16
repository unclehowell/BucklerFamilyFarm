import { PagesFunction } from '../_shared/types';

export const onRequestGet: PagesFunction = async (context) => {
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  const isTestMode = context.env.TEST_MODE === 'true';

  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'Ancestral Land Claim Restitution Engine (Cloudflare Pages Functions)',
      stripeConfigured: Boolean(stripeKey),
      testMode: isTestMode,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};
