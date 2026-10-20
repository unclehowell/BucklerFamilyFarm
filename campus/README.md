# bucklerfamily.estate — base camp map and campus map

**Since 20 Oct 2026 the root of bucklerfamily.estate is the BASE CAMP map** (a numbered, game-board path from the
Legal Wiki to the gift shop). The original campus map moved, unchanged, to `/campus/` (`campus/index.html`).

- Base camp: edit `campus/basecamp_stops.json`, then run `python3 campus/build_basecamp.py`. It writes the root
  `index.html`, `public/ghf-lang/basecamp.js` (the "Back to base camp" link that ghf-lang.js loads on every GHF site;
  also served at `/basecamp.js`), `public/basecamp.json` and `public/ghf-lang/sites/basecamp.json`.
- Campus: edit `campus/build_campus.py`, then run `python3 campus/build_campus.py`; it now writes `campus/index.html`.
  **Do not write the campus into the root `index.html` any more** — that would replace the base camp map.
- `npm run build` (Vite) builds `dist/index.html` (base camp), `dist/campus/index.html` (campus) and
  `dist/webapp/index.html` (WebApp).

## Campus map (original notes)

The root of bucklerfamily.estate is a map of the Tŷ Mawr case: each building is one part of the case
(museum, evidence quest, council briefing, records, the Wiki). The Great House WebApp lives at `/webapp/`.

- Edit buildings in `campus/build_campus.py`, then run `python3 campus/build_campus.py` to regenerate `index.html`.
- `npm run build` (Vite) builds both pages: `dist/index.html` (campus) and `dist/webapp/index.html` (WebApp).
- `/api/*` Cloudflare Pages functions are unchanged. Stripe returns to `/webapp/`; any payment return that lands
  on the root is forwarded there.
