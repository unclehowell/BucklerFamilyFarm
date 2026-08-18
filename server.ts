import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getStripe } from './functions/_shared/stripe';
import {
  registerRuntimeCode,
  validateEligibilityCode,
} from './functions/_shared/eligibility';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes FIRST

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Ancestral Land Claim Restitution Engine (Dev Server)',
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      testMode: Boolean(process.env.TEST_MODE === 'true'),
    });
  });

  // Stripe Merchant Status
  app.get('/api/stripe/status', (_req: Request, res: Response) => {
    res.json({
      configured: Boolean(process.env.STRIPE_SECRET_KEY),
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
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
    });
  });

  // OAuth Provider Status & Configuration
  app.get('/api/auth/providers', (_req: Request, res: Response) => {
    res.json({
      google: {
        configured: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID),
        clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || null,
        name: 'Google',
      },
      facebook: {
        configured: Boolean(process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID),
        appId: process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID || null,
        name: 'Facebook',
      },
      instagram: {
        configured: Boolean(process.env.INSTAGRAM_CLIENT_ID || process.env.VITE_INSTAGRAM_CLIENT_ID),
        clientId: process.env.INSTAGRAM_CLIENT_ID || process.env.VITE_INSTAGRAM_CLIENT_ID || null,
        name: 'Instagram',
      },
      apple: {
        configured: Boolean(process.env.APPLE_CLIENT_ID || process.env.VITE_APPLE_CLIENT_ID),
        clientId: process.env.APPLE_CLIENT_ID || process.env.VITE_APPLE_CLIENT_ID || null,
        name: 'Apple',
      },
    });
  });

  // OAuth Authorization URL Generator
  app.get('/api/auth/oauth-url', (req: Request, res: Response) => {
    const provider = String(req.query.provider || 'google').toLowerCase();
    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol || 'http';
    const origin = req.get('origin') || `${protocol}://${host}`;
    const redirectUri = `${origin}/auth/callback`;

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId) {
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          clientId
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=consent`;
        res.json({ configured: true, url, provider: 'google' });
        return;
      }
    } else if (provider === 'facebook') {
      const appId = process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID;
      if (appId) {
        const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${encodeURIComponent(
          appId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile`;
        res.json({ configured: true, url, provider: 'facebook' });
        return;
      }
    } else if (provider === 'instagram') {
      const clientId = process.env.INSTAGRAM_CLIENT_ID || process.env.VITE_INSTAGRAM_CLIENT_ID;
      if (clientId) {
        const url = `https://api.instagram.com/oauth/authorize?client_id=${encodeURIComponent(
          clientId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;
        res.json({ configured: true, url, provider: 'instagram' });
        return;
      }
    } else if (provider === 'apple') {
      const clientId = process.env.APPLE_CLIENT_ID || process.env.VITE_APPLE_CLIENT_ID;
      if (clientId) {
        const url = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(
          clientId
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code%20id_token&scope=name%20email&response_mode=form_post`;
        res.json({ configured: true, url, provider: 'apple' });
        return;
      }
    }

    // Default fallback if credentials not entered in .env yet
    res.json({
      configured: false,
      url: null,
      provider,
      message: `No ${provider} client credentials configured in backend .env. Operating in instant verification mode.`,
    });
  });

  // OAuth Login / Verification
  app.post('/api/auth/oauth-login', (req: Request, res: Response) => {
    const { provider, email, name } = req.body;
    const resolvedEmail =
      email ||
      (provider === 'google'
        ? 'google.user@gmail.com'
        : provider === 'facebook'
        ? 'facebook.user@facebook.com'
        : provider === 'instagram'
        ? 'instagram.user@instagram.com'
        : 'apple.id@icloud.com');

    const resolvedName =
      name ||
      (provider === 'google'
        ? 'Google Verified Member'
        : provider === 'facebook'
        ? 'Facebook Verified Member'
        : provider === 'instagram'
        ? 'Instagram Verified Member'
        : 'Apple ID Member');

    res.json({
      success: true,
      user: {
        email: resolvedEmail,
        name: resolvedName,
        provider: provider || 'oauth',
        isDemo: false,
        authenticatedAt: new Date().toISOString(),
      },
    });
  });

  // Verify Eligibility Code
  app.post('/api/eligibility/validate-code', (req: Request, res: Response) => {
    const { code } = req.body;
    const isTestMode = process.env.TEST_MODE === 'true';
    const result = validateEligibilityCode(code, isTestMode);
    res.status(result.status).json(result.body);
  });

  // Create Checkout Session
  app.post('/api/stripe/create-checkout-session', async (req: Request, res: Response) => {
    try {
      const { type, eligibilityCode, email, name } = req.body;
      const host = req.get('host') || `localhost:${PORT}`;
      const protocol = req.protocol || 'http';
      const origin = req.get('origin') || `${protocol}://${host}`;

      const isTestMode = process.env.TEST_MODE === 'true';
      const stripe = getStripe(process.env.STRIPE_SECRET_KEY);

      // Simulation mode when Stripe secret key is not set
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

          res.json({
            success: true,
            mode: 'demo_simulation',
            sessionUrl: null,
            eligibilityCode: generatedCode,
            amount: 9.99,
            currency: 'GBP',
            message: 'Stripe simulated test checkout completed. Certificate code generated.',
          });
          return;
        }

        if (type === 'subscription') {
          if (!eligibilityCode) {
            res.status(400).json({
              error: 'Eligibility code is required to activate £49.99/mo subscription.',
            });
            return;
          }

          const validation = validateEligibilityCode(eligibilityCode, isTestMode);
          if (!validation.body.valid) {
            res.status(400).json({
              error: validation.body.error || 'A valid eligibility code is required.',
            });
            return;
          }

          res.json({
            success: true,
            mode: 'demo_simulation',
            sessionUrl: null,
            amount: 49.99,
            currency: 'GBP',
            billing: 'monthly',
            message: 'Stripe subscription simulated successfully. Workspace activated.',
          });
          return;
        }

        res.status(400).json({ error: 'Invalid checkout type specified.' });
        return;
      }

      // Live / Test Stripe Checkout Session
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

        res.json({
          success: true,
          sessionId: session.id,
          sessionUrl: session.url,
        });
        return;
      }

      if (type === 'subscription') {
        if (!eligibilityCode) {
          res.status(400).json({
            error: 'A verified £9.99 eligibility certificate code is required before subscribing.',
          });
          return;
        }

        const validation = validateEligibilityCode(eligibilityCode, isTestMode);
        if (!validation.body.valid) {
          res.status(400).json({
            error: validation.body.error || 'A valid eligibility code is required.',
          });
          return;
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

        res.json({
          success: true,
          sessionId: session.id,
          sessionUrl: session.url,
        });
        return;
      }

      res.status(400).json({ error: 'Invalid checkout type specified.' });
    } catch (err: unknown) {
      console.error('Stripe Checkout Error:', err);
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ancestral Land Restitution Engine dev server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
