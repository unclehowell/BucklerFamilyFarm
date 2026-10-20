# app.bucklerfamily.estate — Cedwyn Estate · Case Office

Sion, 20:04 BST 20 Oct 2026: give the web app its own URL, let people register, pay for a live search (emailed to Sion to run by hand and qualify), and offer a £49.99/month subscription with a virtual base camp. 20:26 BST: an admin area (suspend, refunds, etc.) and the SpaceXSI Agent. Built by Sion's Tab agent.

## What is live
- Sion, 20:35 BST: "App not apps" and "Theme it like starlink website too." The main address is app.bucklerfamily.estate; apps.bucklerfamily.estate stays as a 301 redirect (same Worker). Starlink-style theme (black, full-bleed darkened 1988 survey photograph of the farmhouse from the Farm Album, thin uppercase Barlow, ghost buttons). Visible name: "Cedwyn Estate · Case Office".
- https://app.bucklerfamily.estate/ — one Cloudflare Worker `cedwyn-apps` (id c0a9adfe8fa34596a761b69021a4fb31, custom domain, workers.dev off) + D1 `cedwyn-apps` (6fb11d8e-5d14-41a4-a7a0-ebf3d3de410a).
- Pages: `/` landing, `/pricing/`, `/signup/`, `/login/`, `/dashboard/`, `/enquire/`, `/subscribe/`, `/camp/`, `/terms/`, `/privacy/`, `/admin/…`.
- `/demo/` is the EXISTING web app, unchanged: the "FOI Evidence Tree & Chronological Bible" (BucklerFamilyFarm `ghf-app` source, built from main and served at bucklerfamily.estate/webapp/). The Worker passes `/demo/`, `/assets/*`, `/evidence/*` and the demo's `/api/stripe|eligibility|auth/*` + `/api/health` through to bucklerfamily.estate, so the Great House Farm / Sion Buckler case study and its demo behaviour stay exactly as they were.
- Cedwyn Estate map: stop 23 "The Case Office (Apps)" (BucklerFamilyFarm main e722a9c); colours Cedar `#3E2C23` / Sky Cyan `#7FDBFF` (work/brand/palette.md).
- SpaceXSI Agent: the shared site chat (Worker `ghf-chat`) shows as "SpaceXSI Agent" on apps pages, with an apps-specific prompt and a fixed service-facts source (work/chat-agent/worker). Same caps and guards; free Workers AI unless Sion adds XAI_API_KEY.

## Flows
- Registration: email + password (PBKDF2-SHA256, 100,000 iterations, random salt, in D1), session cookie `ca_s` (HttpOnly, Secure, SameSite=Lax, 30 days, stored as a SHA-256 hash). Rate limits (signup 5/h/IP, login 15/h/IP and 10/h/account, enquiries 5/h/user), honeypot + minimum form time, Origin check on POSTs. No email verification or password-reset emails: Cloudflare can only email verified addresses, and there is no free way to email arbitrary users. Password resets are by email to sales@ for now.
- Live search £19.99 (config.json `search_price_pence`; also change the Stripe price): form → D1 row `pending` → Stripe Payment Link with `client_reference_id` → return `/paid/?session_id=…` → `paid_claimed` (or `paid_verified` when STRIPE_KEY is set and Stripe confirms paid, £19.99, GBP, this link, this reference) → email to Sion with the enquiry and a rule-based lead score (title number, UK, 12-year limitation window, detail, phone, address).
- Case Agent £49.99/month: parcel + location → Nominatim geocode (polite UA, ≤1 request/s) → Stripe subscription link → `/subscribed/` → dashboard shows the subscriber's virtual base camp (estate-map style board drawn with build_basecamp.py's icons, OpenStreetMap embed, six stages all "QUEUED", "Your case agent starts work once onboarding is complete.") → email to Sion.
- Admin: `/admin/` (users, search, profile edit, suspend/unsuspend with session revoke, UK GDPR erase, enquiry status qualified/in review/rejected/done, refunds and cancellations, audit log). Server-side role check, CSRF token on every admin POST. Without STRIPE_KEY, refund/cancel buttons record the request and link to the payment in the Stripe dashboard; with it they call Stripe directly. Bootstrap: `POST /admin/bootstrap/` (test token only, only while no admin exists) emails a one-time, 24-hour setup link to Sion's verified address; he picks his own admin email and password.
- Emails go through the Email Routing `send_email` binding `MAILER` to Sion's verified destination (secret `MAIL_TO`; not in this repo), from sales@bucklerfamily.estate.
- HubSpot: the Worker can't hold a HubSpot token, so `python3 work/apps/hubspot_sync.py` (run on Tab's box) logs each paid enquiry and subscriber as a contact + deal in the "Apps leads" pipeline (4244015340), with duplicate checks, 1 call per 5 s.

## Stripe (DATRO, live)
- Live land search (enquiry): https://buy.stripe.com/8x2bJ22pB0DRdKI5gr6Zy0h (price_1USiR9JRNz20guqBKtKUzABi)
- Cedwyn Estate Case Agent (monthly): https://buy.stripe.com/cNi6oIfcncmzfSQ4cn6Zy0i (price_1USiRQJRNz20guqBdiwm08Um)
- Customer portal (cancel / card / invoices; its privacy/terms links still say apps., which redirect, because Stripe won't let an app edit a default portal configuration): https://billing.stripe.com/p/login/4gMbJ25BN5YbeOM24f6Zy00

## Secrets and switches (Cloudflare → Workers → cedwyn-apps → Settings → Variables and secrets)
- `STRIPE_KEY` (NOT SET): a restricted key with Checkout Sessions: Read, plus Refunds: Write and Subscriptions: Write if the admin buttons should act in Stripe. When present, payments are verified server-side.
- `SALT`, `MAIL_TO`, `TEST_TOKEN`: set at deploy. Redeploys by API must carry `{"type":"inherit","name":"…"}` for each (and STRIPE_KEY once added) or they are dropped.

## Files
worker/worker.js · worker/gen.js (generated by build_apps.py from legal/build_legal.py and campus/build_basecamp.py; do not edit) · worker/schema.sql · worker/migrate_001_admin.sql · config.json · stripe.json · build_apps.py · hubspot_sync.py · phase2.md

## Undo
Every Cloudflare, Stripe and HubSpot change is a row in work/cf-rebalance/changes.json with its rollback: delete the custom domain, then the Worker, then the D1 database; deactivate the two payment links, prices and products; deactivate the portal configuration; delete the HubSpot pipeline; revert BucklerFamilyFarm e722a9c; roll ghf-chat back to version 98776a96.

Our case, prospective. Not a finding of any court. — Sion's Tab agent
