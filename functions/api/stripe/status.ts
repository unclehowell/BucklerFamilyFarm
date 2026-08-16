import { PagesFunction } from '../../_shared/types';

export const onRequestGet: PagesFunction = async (context) => {
  const isConfigured = Boolean(context.env.STRIPE_SECRET_KEY);
  const publishableKey = context.env.STRIPE_PUBLISHABLE_KEY || null;

  return new Response(
    JSON.stringify({
      configured: isConfigured,
      publishableKey,
      currency: 'GBP',
      pricing: {
        eligibilityCheck: {
          amount: 9.99,
          formatted: '£9.99',
          type: 'one_time',
          description: 'Statutory Root-of-Title Archival Audit & Eligibility Certificate',
        },
        monthlySubscription: {
          amount: 49.99,
          formatted: '£49.99/month',
          type: 'recurring',
          description: 'Autonomous AI Agent Restitution & FOI Pursuit Campaign',
          requiresEligibilityCode: true,
        },
      },
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
