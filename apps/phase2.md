# Phase 2 design: autonomous per-customer case agents (NOT BUILT)

Status: design only, 20 Oct 2026. Nothing below runs yet. Today a subscriber gets a dashboard with a virtual base camp whose six stages show "queued", and Sion onboards each subscriber by hand from the notification email and the HubSpot deal.

Goal (Sion, 20:04 BST 20 Oct 2026): each £49.99/month subscriber gets AI agents that work their parcel the way the Llandough work was done (records requests, title trail, evidence log, timeline, authorities list, costs ledger) as long-running flywheels on Sion's GitHub and Cloudflare, using tab.bot and free APIs where possible.

## 1. Principles
- Human in the loop for anything outward. Agents draft; a person (Sion, or the subscriber where the request is in their own name) approves before any FOI/EIR/SAR is sent, any public body is contacted or anything is published. This keeps it a records-request and evidence-organising service, not legal advice, and keeps SARs lawful (only the data subject or someone with written authority).
- One customer, one sandbox. Customer data never mixes with the Great House Farm case or with another customer's.
- Free tiers first, hard caps everywhere, and a kill switch per customer and globally.
- Wording rules apply to every agent output: no accusations, no outcome promises, "Our case, prospective. Not a finding of any court."

## 2. Per-customer storage
- GitHub: one PRIVATE repo per customer (`unclehowell/case-<slug>`), created from a template repo `unclehowell/case-template`, rather than a branch of a public repo. Free private repos are unlimited. Layout: `records/` (requests and replies), `title/` (registers, plans, parent/child trail as JSON), `evidence/log.csv`, `timeline/chronology.json`, `authorities/list.json`, `costs/ledger.beancount`, `agent/state.json` (stage, next action, last run).
- D1 (cedwyn-apps): new tables `cases(user_id, slug, repo, stage_json, paused, created)`, `jobs(id, case_id, stage, kind, status, due_at, attempts, last_error)`, `approvals(id, case_id, kind, draft_ref, status, decided_by, decided_at)`, `agent_runs(id, case_id, started, ended, tokens, model, outcome)`.
- R2 (free 10 GB): large scans (title plans, PDFs) under `cases/<slug>/`, private bucket, signed links only.
- IMPORTANT: today the account's free D1 read allowance (5M rows a day, shared by every database) is used up by the financecheque-db full-table scans. Fix that first, or give phase 2 its own Cloudflare account, before any per-customer job table exists.

## 3. The flywheel (scheduled Workers)
- A Cron-triggered Worker `case-scheduler` (free plan: up to 5 cron triggers) runs every 15 minutes. It picks due `jobs` (a few per run, to stay inside the free 10 ms CPU and 100k requests a day), and dispatches each to a stage worker through a Queue or a plain fetch with a signed job token.
- Stage workers (one per stage) do bounded steps: e.g. `records`: find the right public bodies for the parcel (council, HM Land Registry, Cadw/Historic England, National Archives catalogue, the county archive), check WhatDoTheyKnow for existing requests, draft an FOI/EIR text from templates; `title`: list title numbers from the HMLR INSPIRE index polygons near the parcel (free, OGL) and propose which registers to buy (needs approval: HMLR copies cost £7 each); `evidence`: file each reply into the log with date, source and hash; `timeline`: merge dated facts into the chronology; `authorities`: keep the list of bodies with contact routes and statutory deadlines (20 working days for FOI/EIR, one month for SAR) and chase when overdue (draft only); `costs`: post every fee to the Beancount ledger.
- Long-horizon tasks: each job writes its progress to `agent/state.json` in the customer repo and reschedules itself (`due_at`), so a task can span weeks (e.g. waiting for a statutory reply) without a long-running process.
- Every stage change updates the subscriber's dashboard: the stage pill moves from "queued" to "working", "waiting for reply", "needs your approval" or "done".

## 4. Models (free tier first)
- Default: Cloudflare Workers AI (free daily allowance; `@cf/meta/llama-3.3-70b-instruct-fp8-fast` for drafting, the 8B model for classification), the same as the SpaceXSI Agent.
- Optional: Grok through Sion's own XAI_API_KEY Worker secret once his xAI account has credit, with a per-customer monthly token cap stored in D1 and enforced before each call.
- Retrieval: per-customer FTS5 table in D1 (or Vectorize free tier) over the customer's own documents only.

## 5. tab.bot hand-off
- Work that needs a real browser, a phone call, a paid order or judgment goes to Sion's Tab: the stage worker writes an approval row and sends a short notice (an email to sales@ via the send_email binding, or a Telegram message to Sion through @Cedwynbot). Sion replies to his Tab, which does the step (order the HMLR copy, make the call, send the approved FOI from the right mailbox) and writes the result back into the customer repo and D1.
- Tab-side jobs: `python3 work/apps/hubspot_sync.py` already logs leads; a phase-2 `case_sync.py` would pull approvals, post decisions back and update HubSpot deal stages.

## 6. Customer-facing
- Dashboard: live stage status, an approvals inbox ("approve this FOI to the council"), documents list with signed links, the chronology and the costs ledger.
- Monthly summary email to the subscriber (needs a sending route for arbitrary addresses: e.g. a free-tier transactional provider, or Gmail drafts sent by a person; Cloudflare send_email only reaches verified addresses).
- Cancel = pause all jobs at period end; erasure = delete the private repo, R2 prefix and D1 rows (after the 6-year payment-record period for invoices only).

## 7. Safety and compliance
- ICO registration (data protection fee, about £52 a year) before onboarding real customers.
- DPIA for processing third-party personal data in customer records.
- No agent sends anything outward without an approval row signed by a person.
- Audit log per case; per-customer and global kill switches (`cases.paused`, a `meta` flag).
- Rate limits on public-body portals and WhatDoTheyKnow; polite user agent; respect robots.txt.

## 8. Build order (when approved)
1. Fix the shared D1 read budget (financecheque-db index) or move phase 2 to its own account.
2. `case-template` repo + `cases`/`jobs` tables + a "Start onboarding" admin button that creates the repo and seeds jobs.
3. `case-scheduler` cron + the `authorities` and `records` stages (drafts only) + approvals inbox.
4. `title`, `evidence`, `timeline`, `costs` stages.
5. tab.bot hand-off via Telegram/email; monthly summaries.

— Sion's Tab agent
