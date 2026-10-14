# bucklerfamily.estate — campus map

The root of bucklerfamily.estate is a map of the Tŷ Mawr case: each building is one part of the case
(museum, evidence quest, council briefing, records, the Wiki). The Great House WebApp lives at `/webapp/`.

- Edit buildings in `campus/build_campus.py`, then run `python3 campus/build_campus.py` to regenerate `index.html`.
- `npm run build` (Vite) builds both pages: `dist/index.html` (campus) and `dist/webapp/index.html` (WebApp).
- `/api/*` Cloudflare Pages functions are unchanged. Stripe returns to `/webapp/`; any payment return that lands
  on the root is forwarded there.
