# bucklerfamily.estate — Cedwyn Estate (base camp) map and campus map

**Public name (Sion, 17:38 BST 20 Oct 2026): the base camp is called "Cedwyn Estate"** (Welsh "Ystâd Cedwyn", Spanish "Finca Cedwyn"); the URL stays bucklerfamily.estate. File and variable names (basecamp.js, basecamp_stops.json, build_basecamp.py) are unchanged. Visible strings: `base.name` in basecamp_stops.json, the page head/hero in build_basecamp.py, the `T` table (back-link labels EN/CY/ES) in the generated basecamp.js, and the 3D page `public/3d/index.html`.

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


## 3D walk (game mode) — /3d/

`public/3d/index.html` is a static first-person walk of the same stops (it reads `/basecamp.json`; three.js 0.160 from the jsDelivr CDN; no build step). The 2D map stays the default; its header has a "2D map | 3D walk" switch.

- Desktop: arrow keys or WASD; left/right veer and turn while walking and turn on the spot when standing; Space jumps; Shift runs; E or Enter goes in; H shows the key panel; mouse drag looks.
- Phones: a "tip your phone sideways" screen in portrait; in landscape a left thumb-stick (walk/turn), right-side drag to look, Jump, and a "Go in" button at doors. Tablets get larger, higher controls.
- The fenced "Enemy camp" holds the Public Authorities building (`ENEMY` set in the page). Only inside it is a rifle drawn and raised; nothing to shoot, no people.
- Walking up to a door shows its card and link; visited stops are remembered on the device and a gold arrow points at the next one.
- basecamp.js hides itself on /3d/ as well as on the root.
