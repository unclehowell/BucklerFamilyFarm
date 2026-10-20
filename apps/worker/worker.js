// app.bucklerfamily.estate (was apps.; 301) — Cedwyn Estate · Case Office (registration, paid live-search enquiry, Case Agent subscription,
// subscriber base camp) plus the existing FOI Evidence Tree demo at /demo/ (served unchanged from bucklerfamily.estate/webapp/).
// Free Cloudflare only: this Worker + D1 (DB) + Email Routing send_email (MAILER, Sion's verified address set in the binding).
// STRIPE_KEY (secret, optional): when present, Stripe Checkout Sessions are verified server-side; otherwise returns are
// recorded as "paid_claimed" and Sion checks Stripe by hand. — Sion's Tab agent, 20 Oct 2026
import { EmailMessage } from "cloudflare:email";
import { CO, TEMPLATE_NOTE, TERMS, PRIVACY, CAMP_SVG, CFG } from "./gen.js";

const APP = "https://app.bucklerfamily.estate";
const OLD_HOST = "apps.bucklerfamily.estate";
const ORIGIN = "https://bucklerfamily.estate";
const [P, S] = CFG.colors;
const PBKDF2_ITER = 100000;
const DAY = 86400;
const enc = new TextEncoder();
const UA = "CedwynEstateCaseOffice/1.0 (+https://app.bucklerfamily.estate; sales@bucklerfamily.estate)";

// ---------- small helpers ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
const rand = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const now = () => Math.floor(Date.now() / 1000);
const iso = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");
const ALPH = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const code = (n) => [...rand(n)].map((x) => ALPH[x % ALPH.length]).join("");

async function pbkdf2(pw, salt, iter) {
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256);
  return b64(bits);
}
async function hashPw(pw) {
  const salt = rand(16);
  return `pbkdf2$sha256$${PBKDF2_ITER}$${b64(salt)}$${await pbkdf2(pw, salt, PBKDF2_ITER)}`;
}
async function checkPw(pw, stored) {
  const [, , it, s, h] = String(stored).split("$");
  if (!s || !h || !(+it > 0) || s === "x") return false;
  const salt = Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const got = await pbkdf2(pw, salt, +it);
  if (got.length !== h.length) return false;
  let d = 0; for (let i = 0; i < h.length; i++) d |= got.charCodeAt(i) ^ h.charCodeAt(i);
  return d === 0;
}
function cookies(req) {
  const o = {}; (req.headers.get("cookie") || "").split(";").forEach((p) => { const i = p.indexOf("="); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
  return o;
}
const redirect = (to, extra = {}) => new Response(null, { status: 303, headers: { Location: to, ...extra } });
const json = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { "content-type": "application/json" } });

// rate limit on a salted key; returns true when allowed
async function limit(env, key, max, windowSec) {
  const k = await sha256((env.SALT || "s") + "|" + key);
  const t = now();
  const row = await env.DB.prepare("SELECT n, exp FROM rl WHERE k=?").bind(k).first();
  if (!row || row.exp < t) { await env.DB.prepare("INSERT OR REPLACE INTO rl (k,n,exp) VALUES (?,1,?)").bind(k, t + windowSec).run(); return true; }
  if (row.n >= max) return false;
  await env.DB.prepare("UPDATE rl SET n=n+1 WHERE k=?").bind(k).run();
  return true;
}
async function sweep(env) { await env.DB.prepare("DELETE FROM rl WHERE exp < ?").bind(now()).run(); await env.DB.prepare("DELETE FROM sessions WHERE expires < ?").bind(now()).run(); }

async function currentUser(req, env) {
  const tok = cookies(req).ca_s;
  if (!tok || tok.length < 20) return null;
  const h = await sha256(tok);
  return await env.DB.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>? AND u.suspended=0").bind(h, now()).first();
}
async function startSession(env, uid) {
  const tok = b64(rand(32)).replace(/[+/=]/g, "");
  await env.DB.prepare("INSERT INTO sessions (token_hash,user_id,expires) VALUES (?,?,?)").bind(await sha256(tok), uid, now() + 30 * DAY).run();
  return `ca_s=${tok}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * DAY}`;
}

// ---------- lead qualifier (rule based; for Sion's review order only) ----------
function qualify(e) {
  const notes = []; let s = 0;
  const tn = (e.title_no || "").trim().toUpperCase();
  if (/^[A-Z]{1,3}\d{1,7}$/.test(tn.replace(/\s/g, ""))) { s += 25; notes.push("has title number (+25)"); } else notes.push("no title number (+0)");
  const ctry = (e.country || "").toLowerCase();
  const uk = /^(uk|united kingdom|england|wales|scotland|northern ireland|gb|great britain|cymru)$/.test(ctry.trim()) || /\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/i.test(e.parcel || "");
  if (uk) { s += 20; notes.push("UK land (+20)"); } else notes.push("not shown as UK (+0)");
  const yr = parseInt(e.year_lost, 10), cy = new Date().getUTCFullYear();
  if (yr && yr <= cy && yr > 1000) {
    if (cy - yr <= 12) { s += 20; notes.push(`lost ${yr}: inside 12 years (Limitation Act 1980 s15) (+20)`); }
    else { s += 5; notes.push(`lost ${yr}: over 12 years; would need s32 postponement (concealment) to be reviewed (+5)`); }
  } else notes.push("year not given (+0)");
  if ((e.happened || "").length >= 200) { s += 15; notes.push("detailed account (+15)"); }
  if ((e.contact_phone || "").replace(/\D/g, "").length >= 9) { s += 10; notes.push("phone given (+10)"); }
  if ((e.parcel || "").trim().length >= 10) { s += 10; notes.push("parcel/address given (+10)"); }
  const grade = s >= 70 ? "A" : s >= 45 ? "B" : "C";
  return { score: s, grade, notes: notes.join("; ") };
}

// ---------- email to Sion (Email Routing send_email; destination fixed in the binding) ----------
function mimeB64(s) { const b = enc.encode(s); let o = ""; for (let i = 0; i < b.length; i++) o += String.fromCharCode(b[i]); return btoa(o).replace(/.{76}/g, "$&\r\n"); }
async function mailSion(env, subject, body) {
  const from = CFG.mail_from;
  const raw = [
    `From: Cedwyn Estate Case Office <${from}>`,
    `To: <${env.MAIL_TO}>`,
    `Subject: =?UTF-8?B?${btoa(String.fromCharCode(...enc.encode(subject)))}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${hex(rand(12))}@bucklerfamily.estate>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "", mimeB64(body + "\n\n— Sion's Tab agent (app.bucklerfamily.estate)\n")].join("\r\n");
  // destination: MAIL_TO secret = the send_email binding's verified address (never in this source or the repo)
  await env.MAILER.send(new EmailMessage(from, env.MAIL_TO, raw));
}

// ---------- Stripe (feature flag: STRIPE_KEY) ----------
async function stripeSession(env, sid, plink, ref) {
  if (!env.STRIPE_KEY) return null;
  const H = { headers: { Authorization: `Bearer ${env.STRIPE_KEY}` } };
  if (sid) {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sid)}`, H);
    if (!r.ok) return { error: r.status };
    return await r.json();
  }
  // no session id came back: find this buyer's completed session on the payment link by its client_reference_id
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions?payment_link=${encodeURIComponent(plink)}&limit=50`, H);
  if (!r.ok) return { error: r.status };
  const j = await r.json();
  return (j.data || []).find((x) => x.client_reference_id === ref && x.status === "complete") || { error: "not_found" };
}

// ---------- Nominatim (1 request per second across the Worker; polite UA) ----------
async function geocode(env, q) {
  try {
    const last = await env.DB.prepare("SELECT v FROM meta WHERE k='nom_last'").first();
    const gap = Date.now() - (last ? +last.v : 0);
    if (gap < 1100) await new Promise((r) => setTimeout(r, 1100 - gap));
    await env.DB.prepare("INSERT OR REPLACE INTO meta (k,v) VALUES ('nom_last',?)").bind(String(Date.now())).run();
    const u = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=0&q=" + encodeURIComponent(q);
    const r = await fetch(u, { headers: { "User-Agent": UA, Referer: APP, "Accept-Language": "en-GB" } });
    if (!r.ok) return null;
    const a = await r.json();
    if (!a.length) return null;
    return { lat: +a[0].lat, lon: +a[0].lon, label: a[0].display_name.slice(0, 200) };
  } catch (e) { return null; }
}

// ---------- page shell (Starlink-style: black, full-bleed darkened farm photo, thin uppercase type, ghost buttons) ----------
const HERO_IMG = "https://fb.bucklerfamily.estate/img/1988-cadw-survey-photograph-of-the-farmhouse-29-july-19.jpg";
const HERO_CAP = "Tŷ Mawr (Great House Farm), Llandough: survey photograph, 29 July 1988";
const NAME = "Cedwyn Estate · Case Office";
function shell(title, body, { user = null, chat = true, hero = null, desc = "Cedwyn Estate Case Office: help to request records and organise evidence about your land. Your case, prospective." } = {}) {
  const nav = user
    ? `${user.role === "admin" ? `<a href="/admin/">Admin</a>` : ""}<a href="/dashboard/">Dashboard</a><a href="/enquire/">Live search</a><form method="post" action="/logout/" class="inl"><button class="lnk">Log out</button></form>`
    : `<a href="/pricing/">Pricing</a><a href="/demo/">Demo</a><a href="/login/">Log in</a><a href="/signup/" class="ghost">Sign up</a>`;
  const heroHtml = hero ? `<section class="hero${hero.full ? " full" : ""}"><div class="hero-bg" role="img" aria-label="${esc(HERO_CAP)}"></div><div class="hero-in">${hero.html}</div>${hero.full ? `<p class="cap">${esc(HERO_CAP)}</p>` : ""}</section>` : `<div class="spacer"></div>`;
  return new Response(`<!DOCTYPE html><html lang="en-GB" data-ghf-brand="off"${chat ? "" : ' data-ghf-chat="off"'}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ${NAME}</title><meta name="description" content="${esc(desc)}"><meta name="theme-color" content="#000000">
<meta property="og:title" content="${esc(title)} · ${NAME}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Cedwyn Estate"><meta property="og:image" content="${HERO_IMG}"><link rel="canonical" href="${APP}${esc(PATHNOW)}">
<style>
@font-face{font-family:Barlow;src:url(https://bucklerfamily.estate/fonts/barlow-latin-300-normal.woff2) format("woff2");font-weight:300;font-display:swap}
@font-face{font-family:Barlow;src:url(https://bucklerfamily.estate/fonts/barlow-latin-400-normal.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:Barlow;src:url(https://bucklerfamily.estate/fonts/barlow-latin-500-normal.woff2) format("woff2");font-weight:500;font-display:swap}
@font-face{font-family:Barlow;src:url(https://bucklerfamily.estate/fonts/barlow-latin-700-normal.woff2) format("woff2");font-weight:700;font-display:swap}
:root{--line:rgba(255,255,255,.16);--muted:#a3a3a3;--acc:${S}}
*{box-sizing:border-box}html{background:#000;color-scheme:dark}body{margin:0;font-family:Barlow,"Helvetica Neue",Arial,sans-serif;background:#000;color:#d4d4d4;line-height:1.65;font-size:17px;font-weight:400;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:#fff;text-underline-offset:.18em;text-decoration-color:rgba(255,255,255,.45)}strong,b{color:#fff;font-weight:500}
.top{position:absolute;top:0;left:0;right:0;z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1.4rem;padding:1.1rem 1.25rem;font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;font-weight:500}
.top .brand{margin-right:auto;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.22em;font-size:.78rem}
.top nav{display:flex;flex-wrap:wrap;gap:.6rem 1.3rem;align-items:center}.top nav a,.lnk{color:#fff;text-decoration:none;opacity:.9;background:none;border:0;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;padding:0}
.top nav a.ghost{border:1px solid #fff;padding:.42rem .9rem;border-radius:2px;opacity:1}.inl{display:inline;margin:0}
.hero{position:relative;min-height:56vh;display:flex;align-items:flex-end;padding:7.5rem 1.25rem 3rem;color:#fff;overflow:hidden;border-bottom:1px solid var(--line)}
.hero.full{min-height:100vh;min-height:100svh;align-items:center}
.hero-bg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.45) 40%,rgba(0,0,0,.92) 100%),url("${HERO_IMG}") center 35%/cover no-repeat;filter:grayscale(.25) contrast(1.05)}
.hero-in{position:relative;z-index:1;width:100%;max-width:68rem;margin:0 auto}
.hero h1{margin:0 0 1rem;font-weight:500;font-size:clamp(2rem,8vw,4.6rem);line-height:1.04;letter-spacing:.02em;text-transform:uppercase;color:#fff;max-width:18ch}
.hero p{max-width:38rem;margin:0 0 .9rem;color:#e5e5e5;font-size:1.04rem}
.hero .cap{position:absolute;left:1.25rem;right:1.25rem;bottom:.8rem;margin:0;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.55);z-index:1}
.spacer{height:5.2rem;border-bottom:1px solid var(--line)}
main{max-width:52rem;margin:0 auto;padding:2.2rem 1.25rem 3.5rem}
h1{font-size:clamp(1.8rem,7vw,3rem);font-weight:500;letter-spacing:.02em;text-transform:uppercase;line-height:1.08;color:#fff;margin:.2em 0 .5em}
h2{font-size:.8rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:2.6rem 0 1rem}
p.k{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);font-weight:500;margin:0}
.actions{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1.6rem}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:3rem;padding:.75rem 1.6rem;border:1px solid #fff;color:#fff;background:transparent;text-decoration:none;font:inherit;font-size:.78rem;font-weight:500;letter-spacing:.16em;text-transform:uppercase;border-radius:2px;cursor:pointer}
.btn.solid{background:#fff;color:#000}.btn.alt{border-color:rgba(255,255,255,.55)}
.card{border-top:1px solid var(--line);padding:1.6rem 0 .6rem;margin:0}
.price{font-size:2.2rem;font-weight:300;color:#fff;letter-spacing:.02em;margin:.2rem 0}.price small{font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-left:.4rem}
form.f label{display:block;margin:1.1rem 0 .35rem;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#e5e5e5;font-weight:500}
form.f input,form.f textarea,form.f select{width:100%;padding:.8rem .2rem;border:0;border-bottom:1px solid rgba(255,255,255,.4);background:transparent;color:#fff;font:inherit;font-size:16px;border-radius:0}
form.f input:focus,form.f textarea:focus,form.f select:focus{outline:none;border-bottom-color:#fff}form.f select option{background:#000}
form.f textarea{min-height:9rem;border:1px solid rgba(255,255,255,.3);padding:.7rem}
form.f label.chk{text-transform:none;letter-spacing:0;font-size:.95rem;font-weight:400;color:#d4d4d4;display:flex;gap:.6rem;align-items:flex-start}form.f label.chk input{width:auto;margin-top:.35rem}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.err{border:1px solid #ff8a80;color:#ffd6d1;padding:.8rem 1rem}.ok{border:1px solid rgba(255,255,255,.5);color:#fff;padding:.8rem 1rem}
.muted{color:var(--muted);font-size:.95rem}.small{font-size:.8rem;color:var(--muted)}
table{border-collapse:collapse;width:100%;font-size:.88rem;margin:.6rem 0}td,th{border-bottom:1px solid var(--line);padding:.55rem .3rem;text-align:left;vertical-align:top}th{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:500}
ol.cl{padding-left:0;list-style:none}ol.cl li{margin:1rem 0}ol.cl .n{color:#fff;font-weight:500;margin-right:.5rem}
.stages{list-style:none;padding:0;margin:1rem 0}.stages li{display:flex;justify-content:space-between;gap:.8rem;border-top:1px solid var(--line);padding:.9rem 0}
.pill{border:1px solid var(--acc);color:var(--acc);border-radius:2px;padding:.1rem .6rem;font-size:.66rem;font-weight:500;letter-spacing:.18em;white-space:nowrap;height:fit-content}
iframe.map{width:100%;height:240px;border:0;margin-top:1rem;filter:grayscale(.6) invert(.9) hue-rotate(180deg)}
footer.af{border-top:1px solid var(--line);padding:2rem 1.25rem 3rem;max-width:52rem;margin:0 auto;font-size:.78rem;color:var(--muted)}footer.af a{color:#e5e5e5;margin-right:1rem;text-decoration:none;letter-spacing:.12em;text-transform:uppercase;font-size:.7rem}
@media(min-width:760px){.top{padding:1.4rem 2rem}.hero{padding:9rem 2rem 4rem}main{padding:3rem 2rem 4rem}}
</style>
<script src="https://bucklerfamily.estate/ghf-lang/ghf-lang.js" defer></script></head>
<body><header class="top"><a class="brand" href="/">Cedwyn Estate · Case Office</a><nav>${nav}</nav></header>
${heroHtml}<main>${body}</main>
<footer class="af"><p><strong>Our case, prospective. Not a finding of any court.</strong> A records-request and evidence-organising service. Not a law firm; no legal advice.</p>
<p><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><a href="/pricing/">Pricing</a><a href="mailto:sales@bucklerfamily.estate">Contact</a><a href="${ORIGIN}/">Cedwyn Estate</a></p>
<p>Run by DATRO CONSORTIUM LIMITED (company 13775817) for the Williams–Buckler family. ${esc(TEMPLATE_NOTE)}</p><p>— Sion's Tab agent</p></footer></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "referrer-policy": "strict-origin-when-cross-origin" } });
}
let PATHNOW = "/";
const tsField = () => `<input type="hidden" name="t" value="${Date.now()}"><div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>`;
const botCheck = (f) => (f.get("website") || "") !== "" || Date.now() - +(f.get("t") || 0) < 2000;

// ---------- pages ----------
function landing(user) {
  const go = user ? "/enquire/" : "/signup/?next=/enquire/", sub = user ? "/subscribe/" : "/signup/?next=/subscribe/";
  return shell("Request the records. Organise the evidence.", `
<h2 style="margin-top:0">What it does</h2>
<p>If you believe land your family held was lost through a process you want to understand, the Case Office helps you request records (FOI, EIR and subject access requests) and organise what comes back into a title trail, an evidence log and a timeline.</p>
<p class="muted">We are not a law firm and give no legal advice. We do not promise any outcome.</p>
<h2>Two ways to start</h2>
<div class="card"><p class="k">Live search · one-off</p><p class="price">${CFG.search_price_label}</p><p>Tell us the parcel and what happened. A person reviews your enquiry, runs a live records search and emails you what we found and what you could request next.</p><div class="actions"><a class="btn solid" href="${go}">Start a live search</a></div></div>
<div class="card"><p class="k">Case Agent · monthly</p><p class="price">£49.99 <small>a month · renews monthly · cancel any time</small></p><p>Your own virtual base camp for your land parcel, with six stages: records requests, title trail, evidence log, timeline, authorities list and costs ledger. Your case agent starts work once onboarding is complete.</p><div class="actions"><a class="btn" href="${sub}">Subscribe</a></div></div>
<h2>Worked example</h2>
<div class="card"><p><strong>Great House Farm (Tŷ Mawr), Llandough.</strong> The method comes from one family's own records work: the title registers, the records requests to public bodies, the court record of BP Properties Ltd v Buckler (1987) and a single chronology. The demo shows how the evidence tree and timeline fit together.</p><div class="actions"><a class="btn alt" href="/demo/">Open the demo</a></div></div>`,
    { user, hero: { full: true, html: `<p class="k" style="color:#e5e5e5">Cedwyn Estate · Case Office</p><h1>Request the records. Organise the evidence.</h1><p>Your case, prospective. Help to request records about your family's land and to put what comes back in order.</p><div class="actions"><a class="btn solid" href="${go}">Live search · ${CFG.search_price_label}</a><a class="btn" href="/pricing/">Pricing</a></div>` } });
}
function pricing(user) {
  return shell("Pricing", `
<div class="card"><p class="price">${CFG.search_price_label} <small>one-off, including any VAT</small></p><p><strong>Live search (enquiry).</strong> A person reviews your enquiry and runs a live records search. We reply by email, usually within 10 working days. Third-party fees, such as an HM Land Registry official copy, are extra and only with your agreement.</p>
<p><a class="btn" href="${user ? "/enquire/" : "/signup/?next=/enquire/"}">Start a live search</a></p></div>
<div class="card"><p class="price">£49.99 <small>a month, including any VAT</small></p><p><strong>Cedwyn Estate Case Agent (monthly).</strong> Renews automatically every month until you cancel. Includes your virtual base camp and help to prepare and track records requests and organise your evidence, once onboarding is complete.</p>
<p><strong>Cancel any time:</strong> through the <a href="${CFG.portal_url}">customer portal</a> (sign in with the email you paid with) or by emailing <a href="mailto:sales@bucklerfamily.estate">sales@bucklerfamily.estate</a>.</p>
<p><strong>14-day cooling-off:</strong> you can cancel within 14 days of your first payment for a refund, less the value of any service already supplied at your request (Consumer Contracts Regulations 2013).</p>
<p><a class="btn" href="${user ? "/subscribe/" : "/signup/?next=/subscribe/"}">Subscribe</a></p></div>
<p class="muted">A records-request and evidence-organising service. Not a law firm; no legal advice; no outcome promised. See the <a href="/terms/">terms</a>.</p>`, { user, hero: { html: `<p class="k" style="color:#e5e5e5">Pricing</p><h1>Simple prices, in pounds</h1>` } });
}
function authForm(kind, err, next, email = "") {
  const up = kind === "signup";
  return shell(up ? "Sign up" : "Log in", `<p class="k">${up ? "Create your account" : "Welcome back"}</p><h1>${up ? "Sign up" : "Log in"}</h1>
${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/${kind}/">${tsField()}<input type="hidden" name="next" value="${esc(next || "/dashboard/")}">
${up ? `<label for="n">Your name</label><input id="n" name="name" autocomplete="name" maxlength="80" required>` : ""}
<label for="e">Email</label><input id="e" name="email" type="email" autocomplete="email" maxlength="160" value="${esc(email)}" required>
<label for="p">Password${up ? " (at least 10 characters)" : ""}</label><input id="p" name="password" type="password" autocomplete="${up ? "new-password" : "current-password"}" minlength="${up ? 10 : 1}" maxlength="200" required>
${up ? `<label class="chk"><input type="checkbox" name="agree" value="1" required> I am 18 or over and agree to the <a href="/terms/">terms</a> and <a href="/privacy/">privacy notice</a>.</label>` : ""}
<p><button class="btn solid">${up ? "Create account" : "Log in"}</button></p></form>
<p class="muted">${up ? `Already have an account? <a href="/login/?next=${encodeURIComponent(next || "")}">Log in</a>` : `New here? <a href="/signup/?next=${encodeURIComponent(next || "")}">Sign up</a>. Forgotten your password? Email <a href="mailto:sales@bucklerfamily.estate">sales@bucklerfamily.estate</a> from your account email.`}</p>`, { chat: true });
}
function enquireForm(user, err) {
  return shell("Live search enquiry", `<p class="k">Live search · ${CFG.search_price_label}</p><h1>Tell us about the land</h1>
<p class="muted">After this form you pay ${CFG.search_price_label} on Stripe's secure page. A person reviews every enquiry by hand.</p>
${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/enquire/">${tsField()}
<label for="pa">Land parcel or address</label><input id="pa" name="parcel" maxlength="300" required placeholder="e.g. the field north of Church Lane, Llandough">
<label for="tn">Title number, if known</label><input id="tn" name="title_no" maxlength="20" placeholder="e.g. WA231076">
<label for="co">Country</label><select id="co" name="country"><option>United Kingdom</option><option>Ireland</option><option>Other</option></select>
<label for="yr">Roughly what year was the land lost? (optional)</label><input id="yr" name="year_lost" inputmode="numeric" maxlength="4" placeholder="e.g. 1987">
<label for="hp">What happened?</label><textarea id="hp" name="happened" maxlength="5000" required placeholder="In your own words: who held the land, what changed, and what records you already have."></textarea>
<label for="cn">Your name</label><input id="cn" name="contact_name" maxlength="80" value="${esc(user.name)}" required>
<label for="ce">Email for our reply</label><input id="ce" name="contact_email" type="email" maxlength="160" value="${esc(user.email)}" required>
<label for="cp">Phone (optional)</label><input id="cp" name="contact_phone" maxlength="30" inputmode="tel">
<label class="chk"><input type="checkbox" name="start" value="1" required> I ask you to start the search straight away. I understand that if I cancel within 14 days I get a refund less the value of work already done, and that once the search is fully done the right to cancel ends.</label>
<p><button class="btn solid">Continue to payment · ${CFG.search_price_label}</button></p></form>`, { user, chat: true });
}
function subscribeForm(user, err) {
  return shell("Subscribe to the Case Agent", `<p class="k">Case Agent · £49.99 a month</p><h1>Set up your base camp</h1>
<p>Tell us which land parcel your base camp is for. We place it on a map, then you pay on Stripe's secure page. Your base camp appears on your dashboard straight after.</p>
${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/subscribe/">${tsField()}
<label for="pn">Name of the land parcel or farm</label><input id="pn" name="parcel" maxlength="120" required value="${esc(user.parcel || "")}" placeholder="e.g. Great House Farm">
<label for="lo">Where is it? (town, village or postcode area)</label><input id="lo" name="location" maxlength="160" required value="${esc(user.location || "")}" placeholder="e.g. Llandough, Vale of Glamorgan">
<div class="card"><p><strong>£49.99 a month</strong>, renewing monthly until you cancel. Cancel any time in the customer portal or by emailing sales@bucklerfamily.estate. You can cancel within 14 days of the first payment for a refund, less the value of any service already supplied.</p></div>
<label class="chk"><input type="checkbox" name="start" value="1" required> I agree to the <a href="/terms/">terms</a> and ask you to start the service during the 14-day cancellation period.</label>
<p><button class="btn solid">Continue to payment · £49.99/month</button></p></form>`, { user, chat: true });
}
const STATUS_LABEL = { pending: "Awaiting payment", paid_claimed: "Payment received, being checked", paid_verified: "Paid", in_review: "In review", qualified: "Qualified", rejected: "Not taken forward", done: "Done", refund_requested: "Refund requested", refunded: "Refunded" };
const placeLabel = (u) => (u.geo_label || u.location || "").split(",").map((x) => x.trim()).filter((x) => x && !/\d/.test(x)).slice(0, 3).join(", ");
function campBlock(user) {
  const name = user.parcel || "Your land";
  const short = name.length > 34 ? name.slice(0, 33) + "…" : name;
  const svg = CAMP_SVG.replace("__PARCEL__", esc(name)).replace("__PARCEL_SHORT__", esc(short));
  let map = `<p class="muted">Location: ${esc(user.location || "")}. We will confirm the exact position with you during onboarding.</p>`;
  if (user.lat != null && user.lon != null) {
    const d = 0.01, bb = [user.lon - d, user.lat - d * 0.6, user.lon + d, user.lat + d * 0.6].map((x) => x.toFixed(5)).join(",");
    map = `<iframe class="map" title="Map near ${esc(name)}" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${bb}&layer=mapnik&marker=${user.lat.toFixed(5)},${user.lon.toFixed(5)}"></iframe>
<p class="small">Base camp placed near ${esc(placeLabel(user))} (map © OpenStreetMap contributors). Approximate: we confirm the parcel boundary with you during onboarding.</p>`;
  }
  const stages = CFG.stages.map((s, i) => `<li><span><strong>${i + 1}. ${esc(s.title)}</strong><br><span class="muted">${esc(s.caption)}</span></span><span class="pill">QUEUED</span></li>`).join("");
  return `<div class="card"><p class="k">Your virtual base camp</p><h2 style="margin-top:.2em">${esc(name)}</h2>
<p><strong>Your case agent starts work once onboarding is complete.</strong> We will email you to arrange onboarding. Until then each stage below shows as queued.</p>
${svg}${map}<ul class="stages">${stages}</ul>
<div class="card" style="border-left-color:${P}"><p class="k">SpaceXSI Agent</p><p>Questions about the service, your stages or the worked example? Ask the SpaceXSI Agent. It answers from our published pages; it may be wrong and gives no legal advice.</p><p><button class="btn alt" type="button" onclick="window.GHFChat&&window.GHFChat.open?window.GHFChat.open():alert('The SpaceXSI Agent is loading; please try again in a moment.')">Ask the SpaceXSI Agent</button></p></div>
<p class="small">Modelled on the Great House Farm (Llandough) records work: see the <a href="/demo/">demo</a>. Our case, prospective. Not a finding of any court.</p></div>`;
}
async function dashboard(user, env, msg) {
  const { results } = await env.DB.prepare("SELECT ref,parcel,status,created FROM enquiries WHERE user_id=? ORDER BY id DESC LIMIT 20").bind(user.id).all();
  const rows = results.length ? `<table><tr><th>Ref</th><th>Parcel</th><th>Status</th></tr>${results.map((r) => `<tr><td>${esc(r.ref)}</td><td>${esc(r.parcel.slice(0, 60))}</td><td>${esc(STATUS_LABEL[r.status] || r.status)}${r.status === "pending" ? ` · <a href="/enquire/pay/?ref=${esc(r.ref)}">pay</a>` : ""}</td></tr>`).join("")}</table>` : `<p class="muted">No enquiries yet.</p>`;
  const subbed = ["claimed", "active"].includes(user.sub_status);
  const sub = subbed ? campBlock(user) + `<p class="muted">Subscription: £49.99 a month, renews monthly. <a href="${CFG.portal_url}">Manage or cancel</a> (sign in with the email you paid with), or email sales@bucklerfamily.estate.</p>`
    : `<div class="card"><p class="k">Case Agent · £49.99 a month</p><p>Get your own virtual base camp for your land parcel, with records requests, title trail, evidence log, timeline, authorities list and costs ledger.</p><p><a class="btn" href="/subscribe/">Subscribe</a></p></div>`;
  return shell("Dashboard", `<p class="k">Signed in as ${esc(user.email)}</p><h1>Hello, ${esc(user.name)}</h1>${msg ? `<p class="ok">${esc(msg)}</p>` : ""}
<h2>Your live searches</h2>${rows}<p><a class="btn" href="/enquire/">New live search · ${CFG.search_price_label}</a></p>
<h2>Your base camp</h2>${sub}`, { user, chat: true });
}
const legalPage = (user, title, body) => shell(title, `<p class="k">Legal · 20 October 2026</p><h1>${title}</h1><p class="muted">${esc(TEMPLATE_NOTE)}</p>${body}`, { user });

// ---------- enquiry email ----------
function enquiryText(e, q, verified, test) {
  return [
    `${test ? "[TEST] " : ""}New paid live-search enquiry ${e.ref}`,
    `Payment: ${verified ? "VERIFIED with Stripe" : "reported by the buyer's return from Stripe, NOT yet verified: check Stripe for the session below (Payment Link " + CFG.search_plink + ")"}`,
    `Stripe session: ${e.session_id || "-"}`,
    "",
    `LEAD SCORE: ${q.score}/100, grade ${q.grade} — ${q.notes}`,
    "",
    `Parcel / address: ${e.parcel}`, `Title number: ${e.title_no || "-"}`, `Country: ${e.country || "-"}`, `Year lost: ${e.year_lost || "-"}`,
    "", "What happened:", e.happened, "",
    `Name: ${e.contact_name}`, `Email: ${e.contact_email}`, `Phone: ${e.contact_phone || "-"}`,
    `Account: user #${e.user_id}; enquiry created ${e.created}`,
    "", "Next: run the search by hand, reply to the customer, and move the HubSpot deal (Apps leads)."].join("\n");
}

// ---------- the demo (existing FOI Evidence Tree web app, unchanged) ----------
const PROXY = [/^\/assets\//, /^\/evidence\//, /^\/api\/(stripe|eligibility|auth)\//, /^\/api\/health$/, /^\/fonts\//];
async function proxy(req, path) {
  const u = new URL(req.url);
  const r = await fetch(ORIGIN + path + u.search, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body, redirect: "manual" });
  return new Response(r.body, r);
}


// ---------- admin (Sion, 20:26 BST 20 Oct 2026: "I need an admin account to manage user profiles too. Suspend access, refunds etc.") ----------
async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}
async function csrfFor(req, env) { return (await hmacHex((env.SALT || "s") + "|csrf", await sha256(cookies(req).ca_s || ""))).slice(0, 40); }
async function audit(env, admin, action, target, detail) {
  await env.DB.prepare("INSERT INTO audit (at,admin_id,action,target,detail) VALUES (?,?,?,?,?)").bind(iso(), admin.id, action, String(target), String(detail || "").slice(0, 500)).run();
}
const stripeLink = (sid) => `https://dashboard.stripe.com/search?query=${encodeURIComponent(sid || "")}`;
async function stripeApi(env, method, path, form) {
  const r = await fetch("https://api.stripe.com" + path, { method, headers: { Authorization: `Bearer ${env.STRIPE_KEY}`, "Content-Type": "application/x-www-form-urlencoded" }, body: form ? new URLSearchParams(form) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j.error && j.error.message) || `Stripe ${r.status}`);
  return j;
}
function adminShell(user, title, body, msg, err) {
  return shell(`Admin · ${title}`, `<p class="k">Admin · signed in as ${esc(user.email)}</p><h1>${esc(title)}</h1>
<p><a href="/admin/">Users</a> · <a href="/admin/enquiries/">Enquiries</a> · <a href="/admin/audit/">Audit log</a> · <a href="/dashboard/">My dashboard</a></p>
${msg ? `<p class="ok">${esc(msg)}</p>` : ""}${err ? `<p class="err">${esc(err)}</p>` : ""}${body}`, { user, chat: true });
}
const btnForm = (csrf, action, fields, label, confirmText) => `<form method="post" action="/admin/action/" class="inl" ${confirmText ? `onsubmit="return confirm('${esc(confirmText)}')"` : ""}><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="action" value="${action}">${Object.entries(fields).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join("")}<button class="btn alt" style="padding:6px 12px;font-size:14px;margin:3px 0">${esc(label)}</button></form>`;

async function handleAdmin(req, env, u, user) {
  const path = u.pathname;
  // one-time setup link (emailed to Sion's verified address only)
  if (path === "/admin/bootstrap/" && req.method === "POST") {
    if (!env.TEST_TOKEN || req.headers.get("x-apps-test") !== env.TEST_TOKEN) return new Response("Not found", { status: 404 });
    const ex = await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin'").first();
    if (ex.n > 0) return json({ ok: false, why: "an admin already exists" }, 409);
    const tok = b64(rand(32)).replace(/[+/=]/g, "");
    await env.DB.prepare("INSERT INTO admin_setup (token_hash,expires,used,created) VALUES (?,?,0,?)").bind(await sha256(tok), now() + DAY, iso()).run();
    const link = `${APP}/admin/setup/?t=${tok}`;
    try {
      await mailSion(env, "Your Cedwyn Estate Case Office admin account: one-time setup link", ["Here is the one-time link to create the admin account for app.bucklerfamily.estate.", "", link, "",
        "It works once and expires 24 hours after this email was sent. You choose your own email and password on that page; nobody else sees the password.",
        "Admin area afterwards: https://app.bucklerfamily.estate/admin/ (users, suspend, erase, enquiry status, refunds, audit log).",
        "If you didn't expect this, ignore it: the link expires by itself."].join("\n"));
      return json({ ok: true, emailed: true, expires_in_hours: 24 });
    } catch (e) { return json({ ok: false, emailed: false, error: String(e).slice(0, 200) }, 500); }
  }
  if (path === "/admin/setup/") {
    const tok = (req.method === "POST" ? null : u.searchParams.get("t")) || "";
    const form = (t, err) => shell("Admin setup", `<p class="k">One-time admin setup</p><h1>Create the admin account</h1>${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/admin/setup/">${tsField()}<input type="hidden" name="tok" value="${esc(t)}">
<label for="n">Your name</label><input id="n" name="name" maxlength="80" required>
<label for="e">Admin email</label><input id="e" name="email" type="email" autocomplete="email" maxlength="160" required>
<label for="p">Password (at least 12 characters)</label><input id="p" name="password" type="password" autocomplete="new-password" minlength="12" maxlength="200" required>
<p><button class="btn solid">Create admin account</button></p></form>`, { chat: true });
    if (req.method === "GET") return form(tok, "");
    const f = await req.formData();
    const t = String(f.get("tok") || ""), email = String(f.get("email") || "").trim().toLowerCase(), pw = String(f.get("password") || ""), name = String(f.get("name") || "").trim().slice(0, 80);
    if (botCheck(f)) return form(t, "Please try again.");
    if (!(await limit(env, `setup|${req.headers.get("cf-connecting-ip") || "0"}`, 10, 3600))) return form(t, "Too many attempts. Please wait an hour.");
    if (pw.length < 12 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return form(t, "Please give a valid email and a password of at least 12 characters.");
    const row = await env.DB.prepare("SELECT token_hash FROM admin_setup WHERE token_hash=? AND used=0 AND expires>?").bind(await sha256(t), now()).first();
    if (!row) return form("", "This setup link has expired or has already been used.");
    const used = await env.DB.prepare("UPDATE admin_setup SET used=1 WHERE token_hash=? AND used=0").bind(row.token_hash).run();
    if (used.meta.changes !== 1) return form("", "This setup link has already been used.");
    const h = await hashPw(pw);
    const ex = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
    let id;
    if (ex) { await env.DB.prepare("UPDATE users SET pw=?, role='admin', suspended=0, name=COALESCE(NULLIF(?,''),name) WHERE id=?").bind(h, name, ex.id).run(); id = ex.id; }
    else { const r = await env.DB.prepare("INSERT INTO users (email,pw,name,created,role) VALUES (?,?,?,?, 'admin')").bind(email, h, name || "Admin", iso()).run(); id = r.meta.last_row_id; }
    await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(id).run();
    await env.DB.prepare("INSERT INTO audit (at,admin_id,action,target,detail) VALUES (?,?,?,?,?)").bind(iso(), id, "admin_created", `u${id}`, "via one-time setup link").run();
    return redirect("/admin/", { "Set-Cookie": await startSession(env, id) });
  }
  // everything else: server-side role check
  if (!user) return redirect("/login/?next=/admin/");
  if (user.role !== "admin") return shell("Not allowed", `<h1>Not allowed</h1><p>This area is for administrators.</p>`, { user });
  const csrf = await csrfFor(req, env);
  const msg = u.searchParams.get("m") || "", err = u.searchParams.get("e") || "";
  if (path === "/admin/") {
    const q = (u.searchParams.get("q") || "").trim().slice(0, 80);
    const like = `%${q}%`;
    const { results } = await env.DB.prepare(`SELECT u.id,u.email,u.name,u.role,u.sub_status,u.suspended,u.erased,u.created,(SELECT COUNT(*) FROM enquiries e WHERE e.user_id=u.id) AS n FROM users u ${q ? "WHERE u.email LIKE ? OR u.name LIKE ? OR u.parcel LIKE ?" : ""} ORDER BY u.id DESC LIMIT 100`).bind(...(q ? [like, like, like] : [])).all();
    const rows = results.map((r) => `<tr><td><a href="/admin/user/?id=${r.id}">#${r.id}</a></td><td>${esc(r.email)}<br><span class="small">${esc(r.name)}${r.role === "admin" ? " · admin" : ""}</span></td><td>${esc(r.sub_status)}${r.suspended ? "<br><strong>suspended</strong>" : ""}${r.erased ? "<br>erased" : ""}</td><td>${r.n}</td></tr>`).join("");
    return adminShell(user, "Users", `<form class="f" method="get" action="/admin/"><label for="q">Search email, name or parcel</label><input id="q" name="q" value="${esc(q)}"></form>
<table><tr><th>ID</th><th>User</th><th>Subscription</th><th>Enquiries</th></tr>${rows || `<tr><td colspan="4">No users found.</td></tr>`}</table>`, msg, err);
  }
  if (path === "/admin/enquiries/") {
    const { results } = await env.DB.prepare("SELECT ref,user_id,parcel,status,grade,score,created,test FROM enquiries ORDER BY id DESC LIMIT 100").all();
    return adminShell(user, "Enquiries", `<table><tr><th>Ref</th><th>Parcel</th><th>Status</th><th>Grade</th></tr>${results.map((e) => `<tr><td><a href="/admin/user/?id=${e.user_id}">${esc(e.ref)}</a>${e.test ? " (test)" : ""}</td><td>${esc((e.parcel || "").slice(0, 50))}</td><td>${esc(STATUS_LABEL[e.status] || e.status)}</td><td>${esc(e.grade)} ${e.score}</td></tr>`).join("") || `<tr><td colspan="4">None yet.</td></tr>`}</table>`, msg, err);
  }
  if (path === "/admin/audit/") {
    const { results } = await env.DB.prepare("SELECT at,admin_id,action,target,detail FROM audit ORDER BY id DESC LIMIT 200").all();
    return adminShell(user, "Audit log", `<table><tr><th>When (UTC)</th><th>Admin</th><th>Action</th><th>Target</th><th>Detail</th></tr>${results.map((a) => `<tr><td>${esc(a.at)}</td><td>#${a.admin_id}</td><td>${esc(a.action)}</td><td>${esc(a.target)}</td><td>${esc(a.detail)}</td></tr>`).join("") || `<tr><td colspan="5">Nothing yet.</td></tr>`}</table>`, msg, err);
  }
  if (path === "/admin/user/") {
    const id = +u.searchParams.get("id") || 0;
    const t = await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(id).first();
    if (!t) return adminShell(user, "User not found", `<p><a href="/admin/">Back to users</a></p>`);
    const { results: enqs } = await env.DB.prepare("SELECT * FROM enquiries WHERE user_id=? ORDER BY id DESC").bind(id).all();
    const { results: refs } = await env.DB.prepare("SELECT * FROM refunds WHERE target IN (" + ["?"].concat(enqs.map(() => "?")).join(",") + ") ORDER BY id DESC").bind(`u${id}`, ...enqs.map((e) => e.ref)).all();
    const live = !!env.STRIPE_KEY;
    const enqHtml = enqs.map((e) => `<div class="card"><p><strong>${esc(e.ref)}</strong>${e.test ? " (test)" : ""} · ${esc(STATUS_LABEL[e.status] || e.status)} · grade ${esc(e.grade)} (${e.score}/100)</p>
<p class="small">${esc(e.score_notes)}</p><p>${esc(e.parcel)}${e.title_no ? " · title " + esc(e.title_no) : ""}${e.year_lost ? " · lost " + esc(e.year_lost) : ""}</p><p class="small" style="white-space:pre-wrap">${esc((e.happened || "").slice(0, 1500))}</p>
<p class="small">Contact: ${esc(e.contact_name)} · ${esc(e.contact_email)}${e.contact_phone ? " · " + esc(e.contact_phone) : ""} · created ${esc(e.created)}${e.session_id ? ` · <a href="${stripeLink(e.session_id)}">payment in Stripe</a>` : ""}</p>
${["qualified", "in_review", "rejected", "done"].map((s) => btnForm(csrf, "enq_status", { ref: e.ref, status: s, id }, "Mark " + (STATUS_LABEL[s] || s).toLowerCase())).join(" ")}
${e.session_id && e.status !== "refunded" ? btnForm(csrf, "refund_enquiry", { ref: e.ref, id }, live ? "Refund £19.99 now" : "Record refund request", live ? "Refund this payment in Stripe now?" : "") : ""}</div>`).join("") || `<p class="muted">No enquiries.</p>`;
    const refHtml = refs.length ? `<h2>Refunds</h2><table><tr><th>When</th><th>What</th><th>Status</th></tr>${refs.map((r) => `<tr><td>${esc(r.at)}</td><td>${esc(r.kind)} ${esc(r.target)}</td><td>${esc(r.status)}${r.status === "requested" ? ` · <a href="${stripeLink(r.session_id)}">refund it in Stripe</a>` : ""}${r.stripe_refund ? " · " + esc(r.stripe_refund) : ""}</td></tr>`).join("")}</table>` : "";
    const subHtml = `<h2>Subscription</h2><p>${esc(t.sub_status)}${t.sub_at ? " since " + esc(t.sub_at) : ""}${t.sub_session ? ` · <a href="${stripeLink(t.sub_session)}">in Stripe</a>` : ""}</p>
${t.sub_session && ["claimed", "active"].includes(t.sub_status) ? btnForm(csrf, "refund_sub", { id }, live ? "Refund last payment now" : "Record refund request", live ? "Refund the latest subscription payment now?" : "") + " " + btnForm(csrf, "cancel_sub", { id }, live ? "Cancel subscription now" : "Mark cancelled (cancel in Stripe)", "Cancel this subscription?") : ""}`;
    return adminShell(user, `User #${t.id}`, `
<form class="f" method="post" action="/admin/action/"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="action" value="save_profile"><input type="hidden" name="id" value="${t.id}">
<label>Name</label><input name="name" maxlength="80" value="${esc(t.name)}"><label>Email</label><input name="email" type="email" maxlength="160" value="${esc(t.email)}">
<label>Parcel</label><input name="parcel" maxlength="120" value="${esc(t.parcel || "")}"><label>Location</label><input name="location" maxlength="160" value="${esc(t.location || "")}">
<label>Role</label><select name="role"><option${t.role !== "admin" ? " selected" : ""}>user</option><option${t.role === "admin" ? " selected" : ""}>admin</option></select>
<p><button class="btn solid">Save profile</button></p></form>
<p>Status: ${t.suspended ? "<strong>suspended</strong>" : "active"}${t.erased ? " · erased" : ""} · joined ${esc(t.created)}</p>
<p>${t.suspended ? btnForm(csrf, "unsuspend", { id }, "Unsuspend") : btnForm(csrf, "suspend", { id }, "Suspend access", "Suspend this user and sign them out everywhere?")}
${t.erased ? "" : btnForm(csrf, "erase", { id }, "Erase personal data (UK GDPR)", "Erase this user's personal data? This can't be undone. Payment records stay in Stripe for tax law.")}</p>
${subHtml}<h2>Enquiries</h2>${enqHtml}${refHtml}
<p class="small">${live ? "Stripe key present: refunds and cancellations go straight to Stripe." : "No Stripe key on the Worker yet: refund and cancel buttons record the request and link to the payment in the Stripe dashboard, where one click refunds it."}</p>`, msg, err);
  }
  if (path === "/admin/action/" && req.method === "POST") {
    const f = await req.formData();
    if (String(f.get("csrf") || "") !== csrf) return adminShell(user, "Expired form", `<p>That form had expired. Please go back, reload and try again.</p>`);
    const a = String(f.get("action") || ""), id = +f.get("id") || 0, back = (m, e) => redirect(`/admin/user/?id=${id}&${e ? "e" : "m"}=${encodeURIComponent(e || m)}`);
    const t = id ? await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(id).first() : null;
    if (!t) return redirect("/admin/?e=User%20not%20found");
    if (a === "save_profile") {
      const email = String(f.get("email") || "").trim().toLowerCase(), role = f.get("role") === "admin" ? "admin" : "user";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return back("", "Invalid email");
      if (t.id === user.id && role !== "admin") return back("", "You can't remove your own admin role");
      const clash = await env.DB.prepare("SELECT id FROM users WHERE email=? AND id<>?").bind(email, id).first();
      if (clash) return back("", "Another account uses that email");
      await env.DB.prepare("UPDATE users SET name=?, email=?, parcel=NULLIF(?,''), location=NULLIF(?,''), role=? WHERE id=?").bind(String(f.get("name") || "").slice(0, 80), email, String(f.get("parcel") || "").slice(0, 120), String(f.get("location") || "").slice(0, 160), role, id).run();
      await audit(env, user, "save_profile", `u${id}`, `role=${role}${email !== t.email ? "; email changed" : ""}`);
      return back("Profile saved");
    }
    if (a === "suspend" || a === "unsuspend") {
      if (t.id === user.id) return back("", "You can't suspend yourself");
      await env.DB.prepare("UPDATE users SET suspended=? WHERE id=?").bind(a === "suspend" ? 1 : 0, id).run();
      if (a === "suspend") await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(id).run();
      await audit(env, user, a, `u${id}`, a === "suspend" ? "sessions revoked" : "");
      return back(a === "suspend" ? "User suspended and signed out" : "User unsuspended");
    }
    if (a === "erase") {
      if (t.id === user.id) return back("", "You can't erase yourself");
      await env.DB.batch([
        env.DB.prepare("UPDATE users SET email=?, name='Erased user', pw='x$x$1$x$x', parcel=NULL, location=NULL, lat=NULL, lon=NULL, geo_label=NULL, pending_ref=NULL, erased=1, suspended=1 WHERE id=?").bind(`erased-${id}@invalid`, id),
        env.DB.prepare("UPDATE enquiries SET contact_name='[erased]', contact_email='[erased]', contact_phone=NULL, happened='[erased]', parcel='[erased]', title_no=NULL WHERE user_id=?").bind(id),
        env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(id)]);
      await audit(env, user, "erase", `u${id}`, "personal data erased; payment records remain in Stripe");
      return back("Personal data erased");
    }
    if (a === "enq_status") {
      const st = String(f.get("status") || ""), ref = String(f.get("ref") || "");
      if (!["qualified", "in_review", "rejected", "done"].includes(st)) return back("", "Unknown status");
      const r = await env.DB.prepare("UPDATE enquiries SET status=? WHERE ref=? AND user_id=?").bind(st, ref, id).run();
      if (r.meta.changes !== 1) return back("", "Enquiry not found");
      await audit(env, user, "enq_status", ref, st);
      return back(`${ref} marked ${STATUS_LABEL[st] || st}`);
    }
    if (a === "refund_enquiry" || a === "refund_sub" || a === "cancel_sub") {
      let sid, target, kind = a;
      if (a === "refund_enquiry") {
        const e = await env.DB.prepare("SELECT ref,session_id FROM enquiries WHERE ref=? AND user_id=?").bind(String(f.get("ref") || ""), id).first();
        if (!e || !e.session_id) return back("", "No payment on that enquiry");
        sid = e.session_id; target = e.ref;
      } else { sid = t.sub_session; target = `u${id}`; if (!sid) return back("", "No subscription payment"); }
      if (!env.STRIPE_KEY) {
        await env.DB.prepare("INSERT INTO refunds (at,admin_id,kind,target,session_id,status,note) VALUES (?,?,?,?,?,'requested',?)").bind(iso(), user.id, kind, target, sid, "no STRIPE_KEY: do it in the Stripe dashboard").run();
        if (a === "cancel_sub") await env.DB.prepare("UPDATE users SET sub_status='cancelled' WHERE id=?").bind(id).run();
        else if (a === "refund_enquiry") await env.DB.prepare("UPDATE enquiries SET status='refund_requested' WHERE ref=?").bind(target).run();
        await audit(env, user, a + "_requested", target, "recorded; Stripe link shown");
        return back(`${a === "cancel_sub" ? "Cancellation" : "Refund"} recorded. Open the payment in Stripe (link on this page) to finish it in one click.`);
      }
      try {
        let done = "";
        if (a === "cancel_sub") {
          const s = await stripeApi(env, "GET", `/v1/checkout/sessions/${encodeURIComponent(sid)}`);
          if (!s.subscription) throw new Error("no subscription on that checkout");
          const c = await stripeApi(env, "DELETE", `/v1/subscriptions/${s.subscription}`);
          done = c.id; await env.DB.prepare("UPDATE users SET sub_status='cancelled' WHERE id=?").bind(id).run();
        } else {
          const s = await stripeApi(env, "GET", `/v1/checkout/sessions/${encodeURIComponent(sid)}?expand[]=payment_intent&expand[]=invoice.payment_intent`);
          const pi = (s.payment_intent && (s.payment_intent.id || s.payment_intent)) || (s.invoice && s.invoice.payment_intent && (s.invoice.payment_intent.id || s.invoice.payment_intent));
          if (!pi) throw new Error("couldn't find the payment for that checkout; refund it in the Stripe dashboard");
          const rf = await stripeApi(env, "POST", "/v1/refunds", { payment_intent: pi, reason: "requested_by_customer", "metadata[by]": `apps admin #${user.id}` });
          done = rf.id;
          if (a === "refund_enquiry") await env.DB.prepare("UPDATE enquiries SET status='refunded' WHERE ref=?").bind(target).run();
        }
        await env.DB.prepare("INSERT INTO refunds (at,admin_id,kind,target,session_id,status,stripe_refund) VALUES (?,?,?,?,?,'done',?)").bind(iso(), user.id, kind, target, sid, done).run();
        await audit(env, user, a, target, `Stripe ${done}`);
        return back(a === "cancel_sub" ? "Subscription cancelled in Stripe" : `Refunded in Stripe (${done})`);
      } catch (e2) {
        await audit(env, user, a + "_failed", target, String(e2.message || e2).slice(0, 200));
        return back("", `Stripe refused: ${String(e2.message || e2).slice(0, 160)}`);
      }
    }
    return back("", "Unknown action");
  }
  return adminShell(user, "Not found", `<p><a href="/admin/">Back to users</a></p>`);
}

// ---------- router ----------
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    let path = u.pathname;
    if (u.hostname.endsWith("workers.dev")) return redirect(APP + path);
    if (u.hostname === OLD_HOST) return new Response(null, { status: 301, headers: { Location: APP + path + u.search, "cache-control": "public, max-age=3600" } });
    PATHNOW = path;
    if (PROXY.some((re) => re.test(path))) return proxy(req, path);
    if (path === "/demo") return redirect("/demo/");
    if (path === "/demo/" || path === "/webapp/" || path === "/webapp") return proxy(new Request(req.url, { method: "GET", headers: req.headers }), "/webapp/");
    if (path === "/health") return json({ ok: true, stripe_verified_payments: !!env.STRIPE_KEY, mailer: !!env.MAILER });
    if (path !== "/" && !path.endsWith("/") && !path.includes(".")) return redirect(path + "/" + u.search);
    let user = null;
    let dbDown = false;
    try { user = await currentUser(req, env); } catch (e) { dbDown = true; }
    const ip = req.headers.get("cf-connecting-ip") || "0";
    if (req.method === "POST") {
      const o = req.headers.get("origin");
      if (o && o !== APP && !env.ALLOW_ORIGIN_ANY) return new Response("Bad origin", { status: 403 });
      ctx.waitUntil(sweep(env));
    }
    const test = !!env.TEST_TOKEN && req.headers.get("x-apps-test") === env.TEST_TOKEN;
    try {
      if (path.startsWith("/admin/")) return await handleAdmin(req, env, u, user);
      switch (path) {
        case "/": return landing(user);
        case "/pricing/": return pricing(user);
        case "/terms/": return legalPage(user, "Terms of service", TERMS);
        case "/privacy/": return legalPage(user, "Privacy notice", PRIVACY);
        case "/signup/": case "/login/": {
          const kind = path.slice(1, -1), next = (u.searchParams.get("next") || "/dashboard/");
          if (req.method === "GET") return user ? redirect("/dashboard/") : authForm(kind, "", next);
          const f = await req.formData();
          const nx = /^\/[a-z\/]*$/.test(f.get("next") || "") ? f.get("next") : "/dashboard/";
          const email = String(f.get("email") || "").trim().toLowerCase(), pw = String(f.get("password") || "");
          if (botCheck(f)) return authForm(kind, "Please try again.", nx, email);
          if (!(await limit(env, `${kind}|ip|${ip}`, kind === "signup" ? 5 : 15, 3600))) return authForm(kind, "Too many attempts. Please wait an hour and try again.", nx, email);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return authForm(kind, "Please enter a valid email address.", nx, email);
          if (kind === "signup") {
            const name = String(f.get("name") || "").trim().slice(0, 80);
            if (pw.length < 10) return authForm(kind, "Please use a password of at least 10 characters.", nx, email);
            if (!f.get("agree")) return authForm(kind, "Please confirm you agree to the terms.", nx, email);
            const ex = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
            if (ex) return authForm("login", "An account with that email already exists. Please log in.", nx, email);
            const h = await hashPw(pw);
            const r = await env.DB.prepare("INSERT INTO users (email,pw,name,created,test) VALUES (?,?,?,?,?)").bind(email, h, name || "there", iso(), test ? 1 : 0).run();
            return redirect(nx, { "Set-Cookie": await startSession(env, r.meta.last_row_id) });
          }
          if (!(await limit(env, `login|email|${email}`, 10, 3600))) return authForm(kind, "Too many attempts for this account. Please wait an hour.", nx, email);
          const row = await env.DB.prepare("SELECT id,pw,suspended,role FROM users WHERE email=?").bind(email).first();
          if (!row || !(await checkPw(pw, row.pw))) return authForm(kind, "That email and password don't match.", nx, email);
          if (row.suspended) return authForm(kind, "This account is suspended. Please email sales@bucklerfamily.estate.", nx, email);
          return redirect(nx, { "Set-Cookie": await startSession(env, row.id) });
        }
        case "/logout/": {
          const tok = cookies(req).ca_s;
          if (tok) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(tok)).run();
          return redirect("/", { "Set-Cookie": "ca_s=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" });
        }
        case "/dashboard/": return user ? dashboard(user, env, u.searchParams.get("m") === "sub" ? "Thank you. Your base camp is ready below." : u.searchParams.get("m") === "paid" ? "Thank you. Your enquiry is with our team; we reply by email." : "") : redirect("/login/?next=/dashboard/");
        case "/enquire/": {
          if (!user) return redirect("/signup/?next=/enquire/");
          if (req.method === "GET") return enquireForm(user, "");
          const f = await req.formData();
          if (botCheck(f)) return enquireForm(user, "Please try again.");
          if (!(await limit(env, `enq|${user.id}`, 5, 3600))) return enquireForm(user, "Too many enquiries in an hour. Please try again later.");
          const g = (k, n) => String(f.get(k) || "").trim().slice(0, n);
          const e = { parcel: g("parcel", 300), title_no: g("title_no", 20).toUpperCase(), country: g("country", 40), year_lost: g("year_lost", 4), happened: g("happened", 5000), contact_name: g("contact_name", 80), contact_email: g("contact_email", 160).toLowerCase(), contact_phone: g("contact_phone", 30) };
          if (!e.parcel || !e.happened || !e.contact_name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.contact_email)) return enquireForm(user, "Please fill in the parcel, what happened, your name and a valid email.");
          if (!f.get("start")) return enquireForm(user, "Please tick the box to ask us to start.");
          const q = qualify(e), ref = "LS-" + code(6);
          await env.DB.prepare("INSERT INTO enquiries (ref,user_id,parcel,title_no,country,year_lost,happened,contact_name,contact_email,contact_phone,status,created,score,grade,score_notes,test) VALUES (?,?,?,?,?,?,?,?,?,?,'pending',?,?,?,?,?)")
            .bind(ref, user.id, e.parcel, e.title_no, e.country, e.year_lost, e.happened, e.contact_name, e.contact_email, e.contact_phone, iso(), q.score, q.grade, q.notes, test ? 1 : 0).run();
          return redirect(`/enquire/pay/?ref=${ref}`);
        }
        case "/enquire/pay/": {
          if (!user) return redirect("/login/?next=/dashboard/");
          const e = await env.DB.prepare("SELECT ref,contact_email FROM enquiries WHERE ref=? AND user_id=? AND status='pending'").bind(u.searchParams.get("ref") || "", user.id).first();
          if (!e) return redirect("/dashboard/");
          await env.DB.prepare("UPDATE users SET pending_ref=? WHERE id=?").bind(e.ref, user.id).run();
          return redirect(`${CFG.search_link}?client_reference_id=${encodeURIComponent(e.ref)}&prefilled_email=${encodeURIComponent(e.contact_email)}`);
        }
        case "/paid/": {
          if (!user) return redirect("/login/?next=/dashboard/");
          let sid = u.searchParams.get("session_id") || "";
          if (!/^cs_(live|test)_[A-Za-z0-9]{10,120}$/.test(sid)) sid = "";  // Stripe normally fills it; tolerate its absence
          const e = await env.DB.prepare("SELECT * FROM enquiries WHERE ref=? AND user_id=?").bind(user.pending_ref || "", user.id).first();
          if (!e || e.status !== "pending") return redirect("/dashboard/?m=paid");
          let status = "paid_claimed";
          const s = await stripeSession(env, sid, CFG.search_plink, e && e.ref);
          if (s) {
            if (s.id) sid = s.id;
            if (s.error || s.payment_status !== "paid" || s.amount_total !== CFG.search_price_pence || s.currency !== "gbp" || s.payment_link !== CFG.search_plink || s.client_reference_id !== e.ref)
              return shell("Payment not confirmed", `<h1>We couldn't confirm that payment</h1><p>If you were charged, email <a href="mailto:sales@bucklerfamily.estate">sales@bucklerfamily.estate</a> with reference ${esc(e.ref)} and we will sort it out.</p>`, { user, chat: true });
            status = "paid_verified";
          }
          const r = await env.DB.prepare("UPDATE enquiries SET status=?, session_id=?, paid_at=? WHERE id=? AND status='pending'").bind(status, sid || null, iso(), e.id).run();
          if (r.meta.changes === 1) {
            await env.DB.prepare("UPDATE users SET pending_ref=NULL WHERE id=?").bind(user.id).run();
            e.session_id = sid;
            const q = { score: e.score, grade: e.grade, notes: e.score_notes };
            const t = !!e.test;
            const subj = `${t ? "[TEST] " : ""}Paid live search ${e.ref} · grade ${e.grade} · ${e.parcel.slice(0, 50)}`;
            const body = enquiryText(e, q, status === "paid_verified", t);
            if (test && req.headers.get("x-apps-test-mail") === "dry") return json({ dry: true, subject: subj, body_chars: body.length });
            try { await mailSion(env, subj, body); await env.DB.prepare("UPDATE enquiries SET emailed=1 WHERE id=?").bind(e.id).run(); }
            catch (err) { await env.DB.prepare("UPDATE enquiries SET mail_error=? WHERE id=?").bind(String(err).slice(0, 300), e.id).run(); }
          }
          return redirect("/dashboard/?m=paid");
        }
        case "/subscribe/": {
          if (!user) return redirect("/signup/?next=/subscribe/");
          if (["claimed", "active"].includes(user.sub_status)) return redirect("/dashboard/");
          if (req.method === "GET") return subscribeForm(user, "");
          const f = await req.formData();
          if (botCheck(f)) return subscribeForm(user, "Please try again.");
          if (!(await limit(env, `sub|${user.id}`, 6, 3600))) return subscribeForm(user, "Too many tries in an hour. Please try again later.");
          const parcel = String(f.get("parcel") || "").trim().slice(0, 120), location = String(f.get("location") || "").trim().slice(0, 160);
          if (!parcel || !location || !f.get("start")) return subscribeForm({ ...user, parcel, location }, "Please give the parcel name and location, and tick the box.");
          let geo = null;
          if (location !== user.location || user.lat == null) geo = await geocode(env, location);
          await env.DB.prepare("UPDATE users SET parcel=?, location=?, lat=?, lon=?, geo_label=?, sub_status='pending' WHERE id=?")
            .bind(parcel, location, geo ? geo.lat : user.lat ?? null, geo ? geo.lon : user.lon ?? null, geo ? geo.label : user.geo_label ?? null, user.id).run();
          return redirect(`${CFG.sub_link}?client_reference_id=u${user.id}&prefilled_email=${encodeURIComponent(user.email)}`);
        }
        case "/subscribed/": {
          if (!user) return redirect("/login/?next=/dashboard/");
          let sid = u.searchParams.get("session_id") || "";
          if (!/^cs_(live|test)_[A-Za-z0-9]{10,120}$/.test(sid)) sid = "";
          if (user.sub_status !== "pending") return redirect("/dashboard/");
          let st = "claimed";
          const s = await stripeSession(env, sid, CFG.sub_plink, `u${user.id}`);
          if (s) {
            if (s.id) sid = s.id;
            if (s.error || s.status !== "complete" || s.mode !== "subscription" || s.payment_link !== CFG.sub_plink || s.client_reference_id !== `u${user.id}`)
              return shell("Subscription not confirmed", `<h1>We couldn't confirm that subscription</h1><p>If you were charged, email <a href="mailto:sales@bucklerfamily.estate">sales@bucklerfamily.estate</a> and we will sort it out.</p>`, { user, chat: true });
            st = "active";
          }
          const slug = code(8).toLowerCase();
          const r = await env.DB.prepare("UPDATE users SET sub_status=?, sub_session=?, sub_at=?, camp_slug=? WHERE id=? AND sub_status='pending'").bind(st, sid || null, iso(), slug, user.id).run();
          if (r.meta.changes === 1) {
            const t = !!user.test;
            const subj = `${t ? "[TEST] " : ""}New Case Agent subscriber · ${user.parcel}`;
            const body = [`${t ? "[TEST] " : ""}New Case Agent subscriber (£49.99/month)`,
              `Payment: ${st === "active" ? "VERIFIED with Stripe" : "reported by the buyer's return from Stripe, NOT yet verified: check Stripe (Payment Link " + CFG.sub_plink + ")"}`,
              `Stripe session: ${sid}`, "", `Name: ${user.name}`, `Email: ${user.email}`, `Parcel: ${user.parcel}`, `Location: ${user.location}`,
              `Map: ${user.lat != null ? `https://www.openstreetmap.org/?mlat=${user.lat}&mlon=${user.lon}#map=15/${user.lat}/${user.lon}` : "not found; confirm at onboarding"}`,
              `Account: user #${user.id}`, "", "Next: email the subscriber to arrange onboarding. Their base camp shows every stage as queued until then."].join("\n");
            if (test && req.headers.get("x-apps-test-mail") === "dry") return json({ dry: true, subject: subj, body_chars: body.length });
            try { await mailSion(env, subj, body); await env.DB.prepare("UPDATE users SET sub_emailed=1 WHERE id=?").bind(user.id).run(); }
            catch (err) { await env.DB.prepare("UPDATE users SET sub_mail_error=? WHERE id=?").bind(String(err).slice(0, 300), user.id).run(); }
          }
          return redirect("/dashboard/?m=sub");
        }
        case "/camp/": return user && ["claimed", "active"].includes(user.sub_status) ? shell("Your base camp", campBlock(user), { user, chat: true }) : redirect("/dashboard/");
      }
      return shell("Not found", `<h1>Page not found</h1><p><a href="/">Back to the start</a></p>`, { user });
    } catch (err) {
      if (test) return json({ error: String(err), stack: String(err.stack || "").slice(0, 800) }, 500);
      if (/daily row read limit|exceeded D1/i.test(String(err))) return shell("Back shortly", `<h1>Accounts are paused for a few hours</h1><p>Sign-in, enquiries and subscriptions are briefly unavailable while our free database allowance resets (each day at midnight UTC). Nothing you entered before is lost. Please come back later, or email <a href="mailto:sales@bucklerfamily.estate">sales@bucklerfamily.estate</a>.</p>`, { user: null });
      return shell("Something went wrong", `<h1>Something went wrong</h1><p>Please try again in a minute. If it keeps happening, email <a href="mailto:sales@bucklerfamily.estate">sales@bucklerfamily.estate</a>.</p>`, { user: null });
    }
  },
};
