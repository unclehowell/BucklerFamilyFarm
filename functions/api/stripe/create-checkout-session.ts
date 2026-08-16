import { PagesFunction } from '../../_shared/types';
import { getStripe } from '../../_shared/stripe';
import {
  registerRuntimeCode,
  validateEligibilityCode,
} from '../../_shared/eligibility';

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = (await context.request.json().catch(() => ({}))) as {
      type?: string;
      eligibilityCode?: string;
      email?: string;
      name?: string;
    };

    const { type, eligibilityCode, email, name } = body;

    // Derive app's URL dynamically from request origin
    const requestUrl = new URL(context.request.url);
    const origin =
      context.request.headers.get('origin') ||
      `${requestUrl.protocol}//${requestUrl.host}`;

    const isTestMode = context.env.TEST_MODE === 'true';
    const stripe = getStripe(context.env.STRIPE_SECRET_KEY);

    // If Stripe secret key is not configured, provide realistic simulated checkout response
    if (!stripe) {
      if (type === 'eligibility_check') {
        const generatedCode = `ELIG-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        registerRuntimeCode(generatedCode, {
          claimant: name || 'Sion Buckler',
          holding: 'Great House Farm',
          location: 'Llandough',
          issuedAt: new Date().toISOString().split('T')[0],
          rating: '96.8% High Restitution Probability',
          isDemo: true,
        });

        return new Response(
          JSON.stringify({
            success: true,
            mode: 'demo_simulation',
            sessionUrl: null,
            eligibilityCode: generatedCode,
            amount: 9.99,
            currency: 'GBP',
            message: 'Simulated checkout completed. Certificate code generated.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (type === 'subscription') {
        if (!eligibilityCode) {
          return new Response(
            JSON.stringify({
              error: 'Eligibility code is required to activate £49.99/mo subscription.',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const validation = validateEligibilityCode(eligibilityCode, isTestMode);
        if (!validation.body.valid) {
          return new Response(
            JSON.stringify({
              error: validation.body.error || 'A valid eligibility code is required.',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            mode: 'demo_simulation',
            sessionUrl: null,
            amount: 49.99,
            currency: 'GBP',
            billing: 'monthly',
            message: 'Simulated subscription completed. Workspace activated.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Invalid checkout type specified.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Live or Test Stripe Checkout Session via Stripe API
    if (type === 'eligibility_check') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: 'Ancestral Land Title £9.99 Eligibility Check & Certificate',
                description: 'Statutory deed triangulation, 1840 tithe audit & official qualification code',
              },
              unit_amount: 999, // £9.99 in pence
            },
            quantity: 1,
          },
        ],
        metadata: {
          serviceType: 'eligibility_check',
          claimantName: name || 'Not specified',
        },
        success_url: `${origin}?payment_status=eligibility_success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}?payment_status=cancelled`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: session.id,
          sessionUrl: session.url,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'subscription') {
      if (!eligibilityCode) {
        return new Response(
          JSON.stringify({
            error: 'A verified £9.99 eligibility certificate code is required before subscribing.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const validation = validateEligibilityCode(eligibilityCode, isTestMode);
      if (!validation.body.valid) {
        return new Response(
          JSON.stringify({
            error: validation.body.error || 'A valid eligibility code is required.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              recurring: {
                interval: 'month',
              },
              product_data: {
                name: 'Autonomous AI Restitution Agent (£49.99 / Month)',
                description: 'Continuous statutory FOI pursuits, archival research, and document disclosure filings',
              },
              unit_amount: 4999, // £49.99 in pence
            },
            quantity: 1,
          },
        ],
        metadata: {
          serviceType: 'monthly_subscription',
          eligibilityCode,
          claimantName: name || 'Not specified',
        },
        success_url: `${origin}?payment_status=subscription_success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}?payment_status=cancelled`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: session.id,
          sessionUrl: session.url,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid checkout type specified.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    console.error('Stripe Checkout Error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
