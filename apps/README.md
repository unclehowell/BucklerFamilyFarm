# app.bucklerfamily.estate — Cedwyn Estate · Case Office

Sion, 20:04 BST 20 Oct 2026: give the web app its own URL, let people register, pay for a live search (emailed to Sion to run by hand and qualify), and offer a £49.99/month subscription with a virtual base camp. 20:26 BST: an admin area (suspend, refunds, etc.) and the site agent. Built by Sion's Tab agent.

## v2 — 21 Oct 2026 (Sion, 02:05 BST: "I sign up no verify email arrives… Simple landing page. Simple choice… free eligibility check… code… £49.99 a month")
- Landing: "Locate and reclaim your ancestral land parcel" (restored from the old webapp's "Locate & Reclaim Ancestral Birthland"), two choices (Try the demo / Sign up · free eligibility check), how it works in 3 steps, and a tap-to-read story (industrial era, AI era 100x faster, one family, estate reconstruction, the primary cases, strength in numbers).
- Free eligibility check (/check/): the old demo search's questions — who (claimant/representative, family names, for whom), where (holding, parish, county, parcel), what you know or remember (+ dates), file uploads (JPEG/PNG/WebP/GIF/HEIC/PDF, checked by magic bytes, 6 files, 10 MB each, 30 MB total) to the private R2 bucket `cedwyn-apps-uploads`. Disclaimer ticked before sending. Many checks per account (friends/family). Each saved to the dashboard and emailed to Sion (MAILER → his verified Gmail) with admin download links. Button "Skip the queue: full deep search · £19.99" uses the existing Stripe link (DS- refs).
- Email from onboard-team@bucklerfamily.estate: signup verification (3-day link), resend (3/h), password reset (/forgot/, /reset/, 1 h). Route order: Resend API if a key is stored (Worker secret RESEND_KEY or the AES-GCM sealed D1 meta row set through /ops/mailkey with x-apps-test), then the Cloudflare send_email binding SENDER (no fixed destination). Cloudflare only delivers SENDER mail to verified addresses until the zone is onboarded to Cloudflare Email Sending (the connected API token gets 401 on /zones/{zone}/email/sending). mail_log keeps a hashed record of each send.
- Admin: /admin/enquiries/ (to review / eligible / all), /admin/enquiry/?ref= (all fields, files, Mark eligible / not eligible / need more info, private note, Generate & email code with an editable template), /admin/codes/ (unattached codes, template editor, revoke), /admin/mail/ (route + log). If a code email can't be sent, the page shows the code and a "Send it from my own email" mailto button.
- Codes: CE-XXXX-XXXX, single use, /code/?c= prefilled. A code unlocks /subscribe/ (£49.99/month, existing Stripe link); without a code /subscribe/ shows the code form. Admins can subscribe without a code.
- Quiet coins line after a paid deep search, after subscribing, and on the subscribe page.
- Sion's own sign-up (user #1) was promoted to admin on 21 Oct 2026.
- Schema: worker/migrate_002_v2.sql. Bindings now: DB, UPLOADS (R2), MAILER, SENDER, secrets SALT, MAIL_TO, TEST_TOKEN (+ STRIPE_KEY, RESEND_KEY optional). Redeploys must carry inherit rows for MAILER, SALT, MAIL_TO, TEST_TOKEN.

## What is live
- Sion, 20:35 BST: "App not apps" and "Theme it like starlink website too." The main address is app.bucklerfamily.estate; apps.bucklerfamily.estate stays as a 301 redirect (same Worker). Starlink-style theme (black, full-bleed darkened 1988 survey photograph of the farmhouse from the Farm Album, thin uppercase Barlow, ghost buttons). Visible name: "Cedwyn Estate · Case Office".
- https://app.bucklerfamily.estate/ — one Cloudflare Worker `cedwyn-apps` (id c0a9adfe8fa34596a761b69021a4fb31, custom domain, workers.dev off) + D1 `cedwyn-apps` (6fb11d8e-5d14-41a4-a7a0-ebf3d3de410a).
- Pages: `/` landing, `/pricing/`, `/signup/`, `/login/`, `/dashboard/`, `/enquire/`, `/subscribe/`, `/camp/`, `/terms/`, `/privacy/`, `/admin/…`.
- `/demo/` is the EXISTING web app, unchanged: the "FOI Evidence Tree & Chronological Bible" (BucklerFamilyFarm `ghf-app` source, built from main and served at bucklerfamily.estate/webapp/). The Worker passes `/demo/`, `/assets/*`, `/evidence/*` and the demo's `/api/stripe|eligibility|auth/*` + `/api/health` through to bucklerfamily.estate, so the Great House Farm / Sion Buckler case study and its demo behaviour stay exactly as they were.
- Cedwyn Estate map: stop 23 "The Case Office (Apps)" (BucklerFamilyFarm main e722a9c); colours Cedar `#3E2C23` / Sky Cyan `#7FDBFF` (work/brand/palette.md).
- Agent: the shared site chat (Worker `ghf-chat`) is labelled just "Agent" on every site (Sion, 20:52 BST); on app. it uses an app-specific prompt and a fixed service-facts source (work/chat-agent/worker). Same caps and guards; free Workers AI unless Sion adds XAI_API_KEY. Locked down in code: it refuses to run with any binding outside AI, DB (its own public index), SALT, XAI_MODEL, XAI_API_KEY, and answers account/admin/refund questions with a fixed pointer to sign-up, the enquiry page or sales@.

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

 — Sion's Tab agent
