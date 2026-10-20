# ghf-lang — English / Cymraeg / Español switcher for the Great House Farm (Tŷ Mawr) sites

One dependency-free script (`ghf-lang.js`) and one static dictionary per site (`sites/<site>.json`).

- Add to any GHF page: `<script src="https://bucklerfamily.estate/ghf-lang/ghf-lang.js" defer></script>`
  (optional `data-site="name"`; default = the first part of the hostname, `estate` on the apex).
- The choice is remembered: `?lang=en|cy|es`, then a `ghf_lang` cookie on `.bucklerfamily.estate`
  (so it follows the visitor across the subdomains), then localStorage. It sets `<html lang>`.
- Only interface text is translated (nav, headings, buttons, labels, building names, intros), by exact match
  against the dictionary. Evidence and legal text is never rewritten: in Welsh or Spanish a note says
  "Translation of the interface; the original English text is the authoritative record", with a link
  to an external machine translator that opens in a new tab and never replaces the source text.
- Elements inside `blockquote`, `pre`, `code`, or anything marked `data-no-translate` / `translate="no"`
  are never touched.
- Wording rules: concealment and fraud stay "our case, prospective" ("ein hachos, darpar" /
  "nuestro caso, prospectivo"); none of the banned qualifiers in any language (see the project style rules).
- Sites with a strict Content-Security-Policy (email.) serve their own copy of these two files.

Built 20 Oct 2026. Source of truth for the dictionaries: this folder.
