// app.bucklerfamily.estate — Cedwyn Estate (v2, 21 Oct 2026): simple landing (demo or free eligibility check), email verification and
// password reset from onboard-team@bucklerfamily.estate, free eligibility checks with uploads (R2), admin eligibility + one-time codes,
// code-gated £49.99/month subscription with the subscriber base camp, optional £19.99 full deep search. Demo at /demo/ unchanged.
// Bindings: DB (D1), UPLOADS (R2), MAILER (send_email to Sion's verified address), SENDER (send_email, any address once
// Cloudflare Email Sending is onboarded), TAB_MAILER (send_email to Tab's inbound address: lead copies), secrets SALT, MAIL_TO, TEST_TOKEN, optional STRIPE_KEY, RESEND_KEY.
// v2.1.0 (21 Oct 2026): call-back consent on the eligibility check; every lead mail also copied to Tab. — Sion's Tab agent
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


// ---------- email (v2, 21 Oct 2026) ----------
// Sion's notifications: Email Routing send_email binding MAILER (fixed to his verified address, secret MAIL_TO).
// Mail to anyone else (verification, password reset, eligibility codes), tried in this order:
//   1. Resend HTTP API, when a key is stored (Worker secret RESEND_KEY, or the encrypted D1 meta row set through /ops/mailkey);
//   2. Cloudflare send_email binding SENDER (no fixed destination). Cloudflare delivers this only to verified addresses
//      until the zone is onboarded to Cloudflare Email Sending (dashboard: Email > Email Sending > Onboard domain).
// Every send is logged in mail_log (recipient stored as a salted hash only).
const MAIL_FROM_ONBOARD = "onboard-team@bucklerfamily.estate";
const MAIL_NAME = "Cedwyn Estate onboarding team";
function mimeB64(s) { const b = enc.encode(s); let o = ""; for (let i = 0; i < b.length; i++) o += String.fromCharCode(b[i]); return btoa(o).replace(/.{76}/g, "$&\r\n"); }
const hdrB64 = (s) => `=?UTF-8?B?${btoa(String.fromCharCode(...enc.encode(s)))}?=`;
function rawMime(from, fromName, to, subject, text, html) {
  const h = [`From: ${hdrB64(fromName)} <${from}>`, `To: <${to}>`, `Reply-To: <${from}>`, `Subject: ${hdrB64(subject)}`, `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${hex(rand(12))}@bucklerfamily.estate>`, "MIME-Version: 1.0"];
  if (!html) return [...h, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", mimeB64(text)].join("\r\n");
  const bd = "b" + hex(rand(10));
  return [...h, `Content-Type: multipart/alternative; boundary="${bd}"`, "", `--${bd}`, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", mimeB64(text),
    `--${bd}`, "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64", "", mimeB64(html), `--${bd}--`, ""].join("\r\n");
}
async function aesKey(env) {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode((env.SALT || "s") + "|mailkey"));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function sealStr(env, s) { const iv = rand(12); const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(env), enc.encode(s)); return b64(iv) + "." + b64(ct); }
async function openStr(env, v) { const [a, c] = String(v).split("."); const iv = Uint8Array.from(atob(a), (x) => x.charCodeAt(0)); const ct = Uint8Array.from(atob(c), (x) => x.charCodeAt(0)); return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await aesKey(env), ct)); }
async function mailKey(env) {
  if (env.RESEND_KEY) return { provider: "resend", key: env.RESEND_KEY, source: "secret" };
  try { const r = await env.DB.prepare("SELECT v FROM meta WHERE k='mail_key'").first(); if (r) { const o = JSON.parse(await openStr(env, r.v)); o.source = "d1"; return o; } } catch (e) {}
  return null;
}
async function mailLog(env, kind, to, route, ok, error) {
  try { await env.DB.prepare("INSERT INTO mail_log (at,kind,to_hash,route,ok,error) VALUES (?,?,?,?,?,?)").bind(iso(), kind, (await sha256((env.SALT || "s") + "|" + to)).slice(0, 16), route, ok ? 1 : 0, error ? String(error).slice(0, 300) : null).run(); } catch (e) {}
}
// send to anyone; returns { ok, route, error }
async function sendMail(env, { to, subject, text, html, kind = "mail" }) {
  to = String(to || "").trim();
  const errs = [];
  const k = await mailKey(env);
  if (k && k.provider === "resend") {
    try {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${k.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `${MAIL_NAME} <${MAIL_FROM_ONBOARD}>`, to: [to], subject, text, html: html || undefined, reply_to: MAIL_FROM_ONBOARD }) });
      if (r.ok) { await mailLog(env, kind, to, "resend", true); return { ok: true, route: "resend" }; }
      errs.push(`resend ${r.status} ${(await r.text()).slice(0, 160)}`);
    } catch (e) { errs.push("resend " + String(e).slice(0, 160)); }
  }
  if (env.SENDER) {
    try { await env.SENDER.send(new EmailMessage(MAIL_FROM_ONBOARD, to, rawMime(MAIL_FROM_ONBOARD, MAIL_NAME, to, subject, text, html))); await mailLog(env, kind, to, "cloudflare", true); return { ok: true, route: "cloudflare" }; }
    catch (e) { errs.push("cloudflare: " + String(e.message || e).slice(0, 160)); }
  }
  const error = errs.join(" | ") || "no mail route configured";
  await mailLog(env, kind, to, "none", false, error);
  return { ok: false, route: "none", error };
}
// --- Tab lead copy (Sion's Tab agent, 21 Oct 2026): each lead mail to Sion is also copied to Tab's inbound address (binding TAB_MAILER) for the lead playbook.
const TAB_TO = "tymawr.giftshop@mail.tab.bot";
async function tabLead(env, type, name, fields, details) {
  const binding = env.TAB_MAILER;
  if (!binding) return false;
  try {
    const subject = `[ENQUIRY] app.bucklerfamily.estate · ${type} · ${name || "(no name)"}`.replace(/[\r\n]+/g, " ").slice(0, 240);
    const text = ["Site: app.bucklerfamily.estate", `Type: ${type}`, ...fields.map(([k, v]) => `${k}: ${v == null || v === "" ? "-" : String(v)}`), `Received (UTC): ${iso()}`, "", "Details (as sent to the estate mailbox):", details, "", "--", "Copy for Tab (lead playbook). The same lead went to the estate mailbox."].join("\n");
    await binding.send(new EmailMessage(MAIL_FROM_ONBOARD, TAB_TO, rawMime(MAIL_FROM_ONBOARD, "Cedwyn Estate app", TAB_TO, subject, text)));
    return true;
  } catch (e) { console.log("tab lead copy failed", String(e && e.message || e)); return false; }
}
// to Sion only (verified destination fixed in the MAILER binding)
async function mailSion(env, subject, body) {
  await env.MAILER.send(new EmailMessage(MAIL_FROM_ONBOARD, env.MAIL_TO, rawMime(MAIL_FROM_ONBOARD, "Cedwyn Estate app", env.MAIL_TO, subject, body + "\n\n— Sion's Tab agent (app.bucklerfamily.estate)\n")));
}
const emailHtml = (title, paras, btn) => `<!doctype html><html><body style="margin:0;background:#f4f1ec;font-family:Arial,Helvetica,sans-serif;color:#222"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:6px" cellpadding="0" cellspacing="0"><tr><td style="background:#000;color:#fff;padding:18px 24px;font-size:13px;letter-spacing:3px;text-transform:uppercase">Cedwyn Estate</td></tr><tr><td style="padding:24px"><h1 style="font-size:20px;margin:0 0 14px">${esc(title)}</h1>${paras.map((p) => `<p style="font-size:15px;line-height:1.55;margin:0 0 12px">${p}</p>`).join("")}${btn ? `<p style="margin:22px 0"><a href="${esc(btn.href)}" style="background:#000;color:#fff;text-decoration:none;padding:12px 22px;border-radius:3px;display:inline-block;font-size:14px">${esc(btn.label)}</a></p><p style="font-size:12px;color:#666;word-break:break-all">Or paste this link into your browser: ${esc(btn.href)}</p>` : ""}<p style="font-size:12px;color:#777;margin-top:22px">A records and evidence service, not a law firm; nothing in this email is legal advice.</p></td></tr></table></td></tr></table></body></html>`;
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
    ? `${user.role === "admin" ? `<a href="/admin/">Admin</a>` : ""}<a href="/dashboard/">Dashboard</a><a href="/check/">New check</a><form method="post" action="/logout/" class="inl"><button class="lnk">Log out</button></form>`
    : `<a href="/demo/">Demo</a><a href="/pricing/">Pricing</a><a href="/login/">Log in</a><a href="/signup/?next=/check/" class="ghost">Sign up</a>`;
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
.top{position:relative;background:#000;border-bottom:1px solid var(--line);z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1.4rem;padding:1.1rem 1.25rem;font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;font-weight:500}
.top .brand{margin-right:auto;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.22em;font-size:.78rem}
.top nav{display:flex;flex-wrap:wrap;gap:.6rem 1.3rem;align-items:center}.top nav a,.lnk{color:#fff;text-decoration:none;opacity:.9;background:none;border:0;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;padding:0}
.top nav a.ghost{border:1px solid #fff;padding:.42rem .9rem;border-radius:2px;opacity:1}.inl{display:inline;margin:0}
.hero{position:relative;min-height:56vh;display:flex;align-items:flex-end;padding:3.2rem 1.25rem 3rem;color:#fff;overflow:hidden;border-bottom:1px solid var(--line)}
.hero.full{min-height:72vh;min-height:72svh;align-items:flex-end}
.hero-bg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.45) 40%,rgba(0,0,0,.92) 100%),url("${HERO_IMG}") center 35%/cover no-repeat;filter:grayscale(.25) contrast(1.05)}
.hero-in{position:relative;z-index:1;width:100%;max-width:68rem;margin:0 auto}
.hero h1{margin:0 0 1rem;font-weight:500;font-size:clamp(2rem,8vw,4.6rem);line-height:1.04;letter-spacing:.02em;text-transform:uppercase;color:#fff;max-width:18ch}
.hero p{max-width:38rem;margin:0 0 .9rem;color:#e5e5e5;font-size:1.04rem}
.hero .cap{position:absolute;left:1.25rem;right:1.25rem;bottom:.8rem;margin:0;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.55);z-index:1}
.spacer{height:.5rem}
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
.choice{display:grid;grid-template-columns:1fr;gap:1rem;margin:0 0 1rem}@media(min-width:720px){.choice{grid-template-columns:1fr 1fr}}
.opt{border:1px solid var(--line);padding:1.3rem 1.2rem;border-radius:3px}.opt .h{font-size:1.35rem;letter-spacing:.04em;color:#fff;margin:.2rem 0 .6rem;text-transform:uppercase;font-weight:500}.opt p{margin:0 0 1rem}
ol.steps{list-style:none;padding:0;margin:0}ol.steps li{display:flex;gap:.9rem;align-items:flex-start;border-top:1px solid var(--line);padding:.9rem 0}ol.steps .n{flex:0 0 2rem;height:2rem;border:1px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:500}
details.tap{border-top:1px solid var(--line)}details.tap:last-child{border-bottom:1px solid var(--line)}details.tap summary{cursor:pointer;list-style:none;padding:1rem 0;color:#fff;font-weight:500;font-size:1.05rem;display:flex;justify-content:space-between;gap:1rem;align-items:center}details.tap summary::-webkit-details-marker{display:none}
details.tap .more{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);white-space:nowrap}details.tap[open] .more{visibility:hidden}details.tap .tapbody{padding:0 0 1rem}details.tap ul{padding-left:1.1rem}
.actions.center{justify-content:center;margin:2rem 0 1rem}fieldset{border:1px solid var(--line);border-radius:3px;padding:.4rem 1rem 1.1rem;margin:1.2rem 0}legend{color:#fff;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;padding:0 .4rem}
.discbox{border:1px solid var(--acc);padding:1rem 1.1rem;border-radius:3px;margin:1.4rem 0}.disc{padding-left:1.1rem;margin:.6rem 0}.disc li{margin:.35rem 0}.note{border-left:3px solid var(--acc);padding:.2rem 0 .2rem 1rem;margin:1rem 0}
.coins{opacity:.8;margin-top:.8rem}form.f input[type=file]{border:0;padding:.6rem 0}
</style>
<script src="https://bucklerfamily.estate/ghf-lang/ghf-lang.js" defer></script></head>
<body><header class="top"><nav><a href="/">Home</a>${nav}</nav></header>
${heroHtml}<main>${body}</main>
<footer class="af"><p>A records-request and evidence-organising service. Not a law firm; no legal advice.</p>
<p><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><a href="/pricing/">Pricing</a><a href="mailto:sales@bucklerfamily.estate">Contact</a><a href="${ORIGIN}/">Cedwyn Estate</a></p>
<p>Run by DATRO CONSORTIUM LIMITED (company 13775817) for the Williams–Buckler family. ${esc(TEMPLATE_NOTE)}</p><p>— Sion's Tab agent</p></footer></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "referrer-policy": "strict-origin-when-cross-origin" } });
}
let PATHNOW = "/";
const tsField = () => `<input type="hidden" name="t" value="${Date.now()}"><div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>`;
const botCheck = (f) => (f.get("website") || "") !== "" || Date.now() - +(f.get("t") || 0) < 2000;


// ---------- pages (v2, 21 Oct 2026: simple landing, free eligibility check, code-gated subscription) ----------
const DEEP_LABEL = CFG.search_price_label;
const COINS_LINE = `<p class="small coins">Cedwyn estate tokens can also be <a href="https://bucklerfamily.estate/coins/">purchased</a> for use online, in Wales or Patagonia, anywhere within our estate.</p>`;
const STORY = [
  ["For centuries, the land was the family", `<p>For hundreds of years families farmed the same fields, under the same names, in the same parish. The industrial economic era changed that. Farms and smallholdings were turned into dense housing, roads and estates, and towns and cities grew into tightly packed streets.</p><p>Today many people own nothing of the land beneath them, cut off from their history, their heritage, their ancestry and, above all, their ancestral land.</p>`],
  ["A new era, 100 times faster", `<p>The industrial era took two centuries to reshape the countryside. The AI era is a new economic era, and we believe it is sweeping through the land around 100 times faster.</p><p>That same speed can now work for families. AI agents can read archives, tithe maps, land registers, court records and old newspapers in hours rather than years.</p>`],
  ["What happened to one family", `<p>The Williams–Buckler family held Great House Farm (Tŷ Mawr) in Llandough, Vale of Glamorgan, for generations. The family asserts the land was lost through a process that was never fully disclosed.</p><p>What happened to the Williams–Buckler family appears to be repeated across the country: families who may have lost their land to a century of planning and development, often without ever seeing the records.</p>`],
  ["Your estate, reconstructed with AI", `<p>Your subscription uses the Williams–Buckler case as its blueprint. Everything done for Great House Farm becomes the template for your family. We aim to build:</p><ul><li>a personal legal wiki explaining how your family's land may have been lost;</li><li>one chronology, from the earliest record to today;</li><li>records requests (FOI, EIR and subject access) drafted and tracked;</li><li>a title trail linking deeds, plans and registers;</li><li>a search for evidence of concealment, fraud or government involvement;</li><li>and, where evidence is found, a clear report that can be passed to a lawyer, who may seek to reopen the matter and seek reparations or repossession.</li></ul><p>While subscriptions keep coming in, we keep working to find and help other families.</p><p class="small">A records and evidence service, not a law firm. No outcome is promised.</p>`],
  ["Helping reopen the primary cases", `<p>Every subscription also helps fund the family's effort to seek to reopen and set aside the two primary cases: <strong>BP Properties Ltd v Buckler [1987]</strong> and <strong>Buckler v United Kingdom (ECHR, 1989)</strong>, on grounds the family asserts of fraud, concealment and government involvement.</p>`],
  ["Strength in numbers", `<p>Families whose stories echo the Williams–Buckler case may later be invited to join any group action, if one is brought.</p><p class="small">Subscribing does not make you a party to any claim, and no group action has been started.</p>`],
];
function landing(user) {
  const check = user ? "/check/" : "/signup/?next=/check/";
  const story = STORY.map(([t, b]) => `<details class="tap"><summary>${esc(t)}<span class="more">Read more</span></summary><div class="tapbody">${b}</div></details>`).join("");
  return shell("Locate and reclaim your ancestral land parcel", `
<section class="choice"><div class="opt"><p class="k">See it working</p><h2 class="h">Try the demo</h2><p>Explore the real Williams–Buckler evidence tree and chronological bible: Great House Farm (Tŷ Mawr), Llandough, from the first records to today.</p><a class="btn" href="/demo/">Try the demo</a></div>
<div class="opt"><p class="k">Free</p><h2 class="h">Free eligibility check</h2><p>Tell us who you are, where your family's land was, and what you know or remember. Add old photos, deeds or letters. A person reads every check.</p><a class="btn solid" href="${check}">Sign up · free eligibility check</a></div></section>
<h2>How it works</h2>
<ol class="steps"><li><span class="n">1</span><span><strong>Free eligibility check.</strong> Who you are, where the land is, what you remember.</span></li><li><span class="n">2</span><span><strong>If you're eligible, we email you a code.</strong></span></li><li><span class="n">3</span><span><strong>Enter your code and subscribe for £49.99 a month.</strong> We start reconstructing your estate with AI.</span></li></ol>
<p class="muted">In a hurry? <a href="${user ? "/check/" : "/signup/?next=/check/"}">Skip the queue with a full deep search (${DEEP_LABEL})</a>, our most thorough search before we tell you whether your family may have a case paralleling the Williams–Buckler case.</p>
<h2>The story</h2><div class="story">${story}</div>
<div class="actions center"><a class="btn" href="/demo/">Try the demo</a><a class="btn solid" href="${check}">Sign up · free eligibility check</a></div>`,
    { user, hero: { full: true, html: `<p class="k" style="color:#e5e5e5">Cedwyn Estate · Ancestral land</p><h1>Locate and reclaim your ancestral land parcel</h1><p>We are these lands. Families across the country may still hold rights in parcels their ancestors farmed for generations. Our AI agents help locate the records, rebuild your family's story and seek evidence of how the land was lost, so you can seek repossession or reparations.</p><div class="actions"><a class="btn" href="/demo/">Try the demo</a><a class="btn solid" href="${check}">Sign up · free eligibility check</a></div><p class="small" style="color:#d4d4d4">The eligibility check is free. T&amp;Cs apply.</p>` },
      desc: "Locate and reclaim your ancestral land parcel. Free eligibility check, a demo of the Williams–Buckler evidence tree, and AI estate reconstruction for £49.99 a month." });
}
function pricing(user) {
  const check = user ? "/check/" : "/signup/?next=/check/";
  return shell("Pricing", `
<div class="card"><p class="price">Free</p><p><strong>Eligibility check.</strong> Tell us who you are, where the land is and what you know. A person reads it and replies by email. Best-effort lead qualification; some or excessive free checks may be subject to a small fee, and we always ask first.</p><p><a class="btn solid" href="${check}">Start my free check</a></p></div>
<div class="card"><p class="price">${DEEP_LABEL} <small>one-off, including any VAT</small></p><p><strong>Full deep search.</strong> Skip the queue: our most thorough search, to be as sure as we can before we tell you whether your family may have a case paralleling the Williams–Buckler case. Third-party fees, such as an HM Land Registry official copy, are extra and only with your agreement.</p><p><a class="btn" href="${check}">Choose the deep search</a></p></div>
<div class="card"><p class="price">£49.99 <small>a month, including any VAT · by code after eligibility</small></p><p><strong>Estate reconstruction.</strong> Your personal legal wiki, chronology, records requests and evidence search, with the Williams–Buckler case as the blueprint. Renews monthly until you cancel.</p>
<p><strong>Cancel any time</strong> through the <a href="${CFG.portal_url}">customer portal</a> or by emailing <a href="mailto:${MAIL_FROM_ONBOARD}">${MAIL_FROM_ONBOARD}</a>. <strong>14-day cooling-off:</strong> cancel within 14 days of your first payment for a refund, less the value of any service already supplied at your request.</p>
<p><a class="btn" href="/code/">I have a code</a></p></div>
<p class="muted">A records and evidence service, not a law firm; no legal advice; no outcome promised. See the <a href="/terms/">terms</a>.</p>`, { user, hero: { html: `<p class="k" style="color:#e5e5e5">Pricing</p><h1>Simple prices, in pounds</h1>` } });
}
function authForm(kind, err, next, email = "") {
  const up = kind === "signup";
  return shell(up ? "Sign up" : "Log in", `<p class="k">${up ? "Free eligibility check · step 1 of 2" : "Welcome back"}</p><h1>${up ? "Sign up" : "Log in"}</h1>
${up ? `<p class="muted">Create your account, then tell us about your family's land. We email you a link to confirm your address.</p>` : ""}
${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/${kind}/">${tsField()}<input type="hidden" name="next" value="${esc(next || "/dashboard/")}">
${up ? `<label for="n">Your name</label><input id="n" name="name" autocomplete="name" maxlength="80" required>` : ""}
<label for="e">Email</label><input id="e" name="email" type="email" autocomplete="email" maxlength="160" value="${esc(email)}" required>
<label for="p">Password${up ? " (at least 10 characters)" : ""}</label><input id="p" name="password" type="password" autocomplete="${up ? "new-password" : "current-password"}" minlength="${up ? 10 : 1}" maxlength="200" required>
${up ? `<label class="chk"><input type="checkbox" name="agree" value="1" required> I am 18 or over and agree to the <a href="/terms/">terms</a> and <a href="/privacy/">privacy notice</a>.</label>` : ""}
<p><button class="btn solid">${up ? "Create account" : "Log in"}</button></p></form>
<p class="muted">${up ? `Already have an account? <a href="/login/?next=${encodeURIComponent(next || "")}">Log in</a>` : `New here? <a href="/signup/?next=${encodeURIComponent(next || "")}">Sign up</a> · <a href="/forgot/">Forgotten your password?</a>`}</p>`, { chat: false });
}
function forgotForm(msg, err) {
  return shell("Reset your password", `<p class="k">Account</p><h1>Reset your password</h1>${msg ? `<p class="ok">${esc(msg)}</p>` : ""}${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/forgot/">${tsField()}<label for="e">Your account email</label><input id="e" name="email" type="email" autocomplete="email" maxlength="160" required>
<p><button class="btn solid">Email me a reset link</button></p></form><p class="muted"><a href="/login/">Back to log in</a></p>`, { chat: false });
}
function resetForm(tok, err) {
  return shell("Choose a new password", `<p class="k">Account</p><h1>Choose a new password</h1>${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/reset/">${tsField()}<input type="hidden" name="tok" value="${esc(tok)}"><label for="p">New password (at least 10 characters)</label><input id="p" name="password" type="password" autocomplete="new-password" minlength="10" maxlength="200" required>
<p><button class="btn solid">Save new password</button></p></form>`, { chat: false });
}
const DISCLAIMER = `<ul class="disc"><li>Free checks are best-effort lead qualification: a person reads your check and tells you whether we think we can help.</li><li>Some or excessive free checks (for example many from one account, or repeat checks on the same land) may be subject to a small fee. We always ask before charging.</li><li>If we find nothing at first, we may offer a more in-depth search for a small fee. You can also choose the full deep search (${DEEP_LABEL}) at any time.</li><li>This is a records and evidence service, not a law firm. Nothing here is legal advice, and no outcome is promised.</li></ul>`;
function checkForm(user, err, v = {}) {
  const val = (k, d = "") => esc(v[k] ?? d);
  const sel = (k, o) => o.map((x) => `<option${(v[k] || o[0]) === x ? " selected" : ""}>${esc(x)}</option>`).join("");
  return shell("Free eligibility check", `<p class="k">Free eligibility check</p><h1>Tell us about the land</h1>
<p class="muted">The same three questions as our demo: who you are, where the land is, and what you know or remember. You can send more than one check, including for friends and family.</p>
${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/check/" enctype="multipart/form-data" id="chk">${tsField()}
<fieldset><legend>1 · Who</legend>
<label for="fw">Who is this check for?</label><select id="fw" name="for_whom">${sel("for_whom", ["Myself", "A family member", "A friend"])}</select>
<label for="cn">Claimant / representative full name</label><input id="cn" name="claimant_name" maxlength="100" required value="${val("claimant_name", user.name === "there" ? "" : user.name)}" placeholder="e.g. your full legal name">
<label for="rl">Your relationship to them (if not yourself)</label><input id="rl" name="relation" maxlength="80" value="${val("relation")}" placeholder="e.g. grandson, friend">
<label for="fn">Family names in the bloodline</label><input id="fn" name="family_names" maxlength="300" value="${val("family_names")}" placeholder="e.g. Williams, Buckler (include maiden names)"></fieldset>
<fieldset><legend>2 · Where</legend>
<label for="pl">Ancestral holding, farm or estate</label><input id="pl" name="place" maxlength="160" required value="${val("place")}" placeholder="e.g. Great House Farm, tithe plot">
<label for="pa">Parish / town</label><input id="pa" name="parish" maxlength="120" required value="${val("parish")}" placeholder="e.g. Llandough">
<label for="ct">County</label><input id="ct" name="county" maxlength="80" value="${val("county")}" placeholder="e.g. Glamorgan">
<label for="pc">Approximate parcel, field or address</label><input id="pc" name="parcel" maxlength="300" value="${val("parcel")}" placeholder="e.g. the field north of the church; title number if known">
<label for="co">Country</label><select id="co" name="country">${sel("country", ["United Kingdom", "Ireland", "Other"])}</select></fieldset>
<fieldset><legend>3 · What you know or remember</legend>
<label for="kn">In your own words</label><textarea id="kn" name="know" maxlength="6000" required placeholder="Who held the land, what changed, what the family always said, any letters, court cases or sales you know about.">${val("know")}</textarea>
<label for="dt">Dates and documents you know of</label><textarea id="dt" name="dates" maxlength="2000" rows="3" placeholder="e.g. 1840 tithe map; 1916 tenancy; 1969 sale; title WA240304">${val("dates")}</textarea>
<label for="yr">Roughly when was the land lost? (optional)</label><input id="yr" name="year_lost" inputmode="numeric" maxlength="4" value="${val("year_lost")}" placeholder="e.g. 1987">
<label for="fl">Files (optional): photos, scans or PDFs · up to 6 files, 10 MB each</label><input id="fl" name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/heic,application/pdf"></fieldset>
<fieldset><legend>Contact</legend>
<label for="ce">Email for our reply</label><input id="ce" name="contact_email" type="email" maxlength="160" value="${val("contact_email", user.email)}" required>
<label for="cp">Phone (optional)</label><input id="cp" name="contact_phone" type="tel" autocomplete="tel" maxlength="30" inputmode="tel" value="${val("contact_phone")}"><label class="chk"><input type="checkbox" name="callback" value="yes"${val("callback") === "yes" ? " checked" : ""}> Yes, I'd like a call back. The call may be made by an AI assistant on behalf of the Great House Farm team.</label><p class="small">We keep your details, files and check to answer you (your phone number only to call you back, if you ask) for up to 2 years; a copy goes to our AI assistant, which helps with replies and call-backs. To have them deleted, email sales@bucklerfamily.estate.</p></fieldset>
<div class="discbox"><p class="k">Before you send</p>${DISCLAIMER}
<label class="chk"><input type="checkbox" name="disclaimer" value="1" required> I have read this and want to send my check.</label></div>
<p class="actions"><button class="btn solid" name="go" value="free">Send my free check</button><button class="btn alt" name="go" value="deep">Skip the queue: full deep search · ${DEEP_LABEL}</button></p>
<p class="small">The deep search is paid on Stripe's secure page after you press it. If you cancel within 14 days you get a refund less the value of work already done; once the search is fully done the right to cancel ends.</p></form>
<script>document.getElementById("chk").addEventListener("submit",function(e){var f=document.getElementById("fl").files,t=0;if(f.length>6){alert("Please choose up to 6 files.");e.preventDefault();return}for(var i=0;i<f.length;i++){t+=f[i].size;if(f[i].size>10485760){alert(f[i].name+" is over 10 MB.");e.preventDefault();return}}var b=e.submitter;if(b){b.textContent="Sending…";}});</script>`, { user, chat: false });
}
function codeForm(user, err, c = "") {
  return shell("Enter your code", `<p class="k">Estate reconstruction · £49.99 a month</p><h1>Enter your code</h1>
<p>If your free eligibility check shows we may be able to help, we email you a personal code. Enter it here to unlock the subscription.</p>${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/code/">${tsField()}<label for="c">Your code</label><input id="c" name="code" maxlength="20" required value="${esc(c)}" placeholder="CE-XXXX-XXXX" autocapitalize="characters" autocomplete="one-time-code">
<p><button class="btn solid">Unlock</button></p></form>
<p class="muted">No code yet? <a href="/check/">Start a free eligibility check</a>.</p>`, { user, chat: false });
}
function subscribeForm(user, err) {
  return shell("Subscribe", `<p class="k">Estate reconstruction · £49.99 a month</p><h1>Set up your base camp</h1>
<p>Your code is accepted. Tell us which land parcel your base camp is for. We place it on a map, then you pay on Stripe's secure page. Your base camp appears on your dashboard straight after.</p>
${err ? `<p class="err">${esc(err)}</p>` : ""}
<form class="f" method="post" action="/subscribe/">${tsField()}
<label for="pn">Name of the land parcel or farm</label><input id="pn" name="parcel" maxlength="120" required value="${esc(user.parcel || "")}" placeholder="e.g. Great House Farm">
<label for="lo">Where is it? (town, village or postcode area)</label><input id="lo" name="location" maxlength="160" required value="${esc(user.location || "")}" placeholder="e.g. Llandough, Vale of Glamorgan">
<div class="card"><p><strong>£49.99 a month</strong>, renewing monthly until you cancel. Cancel any time in the customer portal or by emailing ${MAIL_FROM_ONBOARD}. You can cancel within 14 days of the first payment for a refund, less the value of any service already supplied.</p></div>
<label class="chk"><input type="checkbox" name="start" value="1" required> I agree to the <a href="/terms/">terms</a> and ask you to start the service during the 14-day cancellation period.</label>
<p><button class="btn solid">Continue to payment · £49.99/month</button></p></form>${COINS_LINE}`, { user, chat: false });
}
const STATUS_LABEL = { received: "Received: a person will read it", pending: "Awaiting payment", paid_claimed: "Deep search paid, being checked", paid_verified: "Deep search paid", in_review: "In review", qualified: "Qualified", rejected: "Not taken forward", done: "Done", refund_requested: "Refund requested", refunded: "Refunded" };
const ELIG_LABEL = { unreviewed: "", eligible: "Eligible: code sent", not_eligible: "Nothing found yet", more_info: "We need more information" };
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
<div class="card" style="border-left-color:${P}"><p class="k">Agent</p><p>Questions about the service, your stages or the worked example? Ask the Agent. It answers from our published pages; it may be wrong and gives no legal advice.</p><p><button class="btn alt" type="button" onclick="window.GHFChat&&window.GHFChat.open?window.GHFChat.open():alert('The Agent is loading; please try again in a moment.')">Ask the Agent</button></p></div>
<p class="small">Modelled on the Great House Farm (Llandough) records work: see the <a href="/demo/">demo</a>.</p></div>`;
}

const legalPage = (user, title, body) => shell(title, `<p class="k">Legal · 20 October 2026</p><h1>${title}</h1><p class="muted">${esc(TEMPLATE_NOTE)}</p>${body}`, { user });
const fmtSize = (n) => n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
const filesOf = (e) => { try { return JSON.parse(e.files || "[]"); } catch (x) { return []; } };
function enqStatus(e) {
  const el = ELIG_LABEL[e.eligibility || "unreviewed"];
  return el || STATUS_LABEL[e.status] || e.status;
}
async function dashboard(user, env, msg, coins) {
  const { results: enqs } = await env.DB.prepare("SELECT * FROM enquiries WHERE user_id=? ORDER BY id DESC LIMIT 50").bind(user.id).all();
  const subbed = ["claimed", "active"].includes(user.sub_status);
  const verify = !user.email_verified ? `<div class="note"><p><strong>Please confirm your email.</strong> We sent a link to ${esc(user.email)}. It can take a few minutes; check your spam folder too.</p><form method="post" action="/verify/resend/" class="inl">${tsField()}<button class="btn alt">Send the link again</button></form></div>` : "";
  const list = enqs.map((e) => {
    const fl = filesOf(e);
    return `<div class="card enq"><p class="k">${esc(e.ref)} · ${e.kind === "deep" ? "Full deep search" : e.kind === "paid" ? "Live search" : "Free eligibility check"} · ${esc((e.created || "").slice(0, 10))}</p>
<p><strong>${esc(e.place || e.parcel || "")}</strong>${e.parish ? ", " + esc(e.parish) : ""}${e.county ? ", " + esc(e.county) : ""}</p>
<p class="small">For: ${esc(e.for_whom || "Myself")}${e.claimant_name ? " · " + esc(e.claimant_name) : e.contact_name ? " · " + esc(e.contact_name) : ""}${fl.length ? ` · ${fl.length} file${fl.length > 1 ? "s" : ""}` : ""}</p>
<p><span class="pill">${esc(enqStatus(e))}</span></p>
${e.status === "pending" ? `<p><a class="btn alt" href="/enquire/pay/?ref=${esc(e.ref)}">Pay for the deep search · ${DEEP_LABEL}</a></p>` : ""}
${fl.length ? `<p class="small">${fl.map((f) => `<a href="/file/?k=${encodeURIComponent(f.key)}">${esc(f.name)}</a> (${fmtSize(f.size)})`).join(" · ")}</p>` : ""}</div>`;
  }).join("") || `<p class="muted">No checks yet.</p>`;
  const unlocked = !!user.unlock_code || user.role === "admin";
  const subBlock = subbed ? campBlock(user) + COINS_LINE
    : unlocked ? `<div class="card"><p class="k">Your code is accepted</p><p>You can now subscribe to estate reconstruction for £49.99 a month.</p><p><a class="btn solid" href="/subscribe/">Subscribe · £49.99/month</a></p></div>`
    : `<div class="card"><p class="k">Have a code?</p><p class="small">If your check shows we may be able to help, we email you a code that unlocks the £49.99 a month subscription.</p><form class="f" method="post" action="/code/">${tsField()}<label for="c">Your code</label><input id="c" name="code" maxlength="20" required placeholder="CE-XXXX-XXXX" autocapitalize="characters"><p><button class="btn">Unlock</button></p></form></div>`;
  return shell("Dashboard", `<p class="k">Signed in as ${esc(user.email)}</p><h1>Your dashboard</h1>
${msg ? `<p class="ok">${esc(msg)}</p>${coins ? COINS_LINE : ""}` : ""}${verify}
<h2>Your checks</h2>${list}
<p class="actions"><a class="btn solid" href="/check/">New free check</a></p><p class="small">You can send checks for friends and family too. Some or excessive free checks may be subject to a small fee; we always ask first.</p>
<h2>Estate reconstruction</h2>${subBlock}`, { user, chat: subbed });
}
function enquiryText(e, user, files, test, paidNote) {
  const L = [`${test ? "[TEST] " : ""}${e.kind === "deep" ? "FULL DEEP SEARCH (paid " + DEEP_LABEL + ")" : "Free eligibility check"} ${e.ref}`];
  if (paidNote) L.push(`Payment: ${paidNote}`);
  L.push(`Lead score: ${e.grade} (${e.score}/100) — ${e.score_notes}`, "",
    "WHO", `For: ${e.for_whom || "Myself"}`, `Claimant / representative: ${e.claimant_name || ""}`, `Relationship: ${e.relation || "-"}`, `Family names: ${e.family_names || "-"}`, "",
    "WHERE", `Holding / farm: ${e.place || ""}`, `Parish / town: ${e.parish || ""}`, `County: ${e.county || "-"}`, `Parcel / address: ${e.parcel || "-"}`, `Country: ${e.country || ""}`, "",
    "WHAT THEY KNOW OR REMEMBER", e.know || "", "", `Dates / documents: ${e.dates || "-"}`, `Year lost: ${e.year_lost || "-"}`, "",
    `FILES (${files.length})`, ...(files.length ? files.map((f) => `- ${f.name} · ${f.type} · ${fmtSize(f.size)} · ${APP}/admin/file/?k=${encodeURIComponent(f.key)}`) : ["- none"]), "",
    "CONTACT", `Email: ${e.contact_email}`, `Phone: ${e.contact_phone || "-"}`, `CALLBACK_CONSENT: ${e.callback ? "yes" : "no"}`, `Account: user #${user.id} (${user.email}; email ${user.email_verified ? "confirmed" : "NOT yet confirmed"})`, "",
    `Disclaimer ticked: ${e.disclaimer_at || "-"}`, "",
    `Review it, mark it eligible or not, and send a code: ${APP}/admin/enquiry/?ref=${e.ref}`);
  return L.join("\n");
}
// ---------- uploads (R2 bucket UPLOADS, private; served only to the owner and admins) ----------
const MAX_FILES = 6, MAX_FILE = 10 * 1024 * 1024, MAX_TOTAL = 30 * 1024 * 1024;
function sniff(b) {
  const s = (i, arr) => arr.every((x, j) => b[i + j] === x);
  if (s(0, [0xff, 0xd8, 0xff])) return ["image/jpeg", "jpg"];
  if (s(0, [0x89, 0x50, 0x4e, 0x47])) return ["image/png", "png"];
  if (s(0, [0x47, 0x49, 0x46, 0x38])) return ["image/gif", "gif"];
  if (s(0, [0x52, 0x49, 0x46, 0x46]) && s(8, [0x57, 0x45, 0x42, 0x50])) return ["image/webp", "webp"];
  if (s(0, [0x25, 0x50, 0x44, 0x46])) return ["application/pdf", "pdf"];
  if (s(4, [0x66, 0x74, 0x79, 0x70])) { const brand = String.fromCharCode(...b.slice(8, 12)); if (/^(heic|heix|mif1|msf1|heim|heis|hevc)$/.test(brand)) return ["image/heic", "heic"]; }
  return null;
}
async function takeFiles(f, env, ref) {
  const items = f.getAll("files").filter((x) => x && typeof x === "object" && x.size > 0);
  if (!items.length) return { files: [] };
  if (items.length > MAX_FILES) return { error: `Please attach up to ${MAX_FILES} files.` };
  let total = 0; const out = [];
  for (const it of items) {
    if (it.size > MAX_FILE) return { error: `${it.name} is over 10 MB. Please make it smaller or leave it out.` };
    total += it.size; if (total > MAX_TOTAL) return { error: "Your files add up to more than 30 MB. Please send fewer." };
  }
  if (!env.UPLOADS) return { error: "File uploads are briefly unavailable. Please send the check without files and email them later." };
  let i = 0;
  for (const it of items) {
    const buf = new Uint8Array(await it.arrayBuffer());
    const t = sniff(buf);
    if (!t) return { error: `${it.name} isn't a photo (JPEG, PNG, WebP, GIF, HEIC) or a PDF.`, partial: out };
    i++;
    const base = String(it.name || "file").replace(/\.[^.]*$/, "").replace(/[^A-Za-z0-9 _-]+/g, "").trim().slice(0, 60) || "file";
    const key = `enq/${ref}/${i}-${base.replace(/\s+/g, "-")}.${t[1]}`;
    await env.UPLOADS.put(key, buf, { httpMetadata: { contentType: t[0] }, customMetadata: { ref, name: base + "." + t[1] } });
    out.push({ key, name: base + "." + t[1], type: t[0], size: buf.length });
  }
  return { files: out };
}
async function serveFile(env, key) {
  const o = await env.UPLOADS.get(key);
  if (!o) return new Response("Not found", { status: 404 });
  const name = (o.customMetadata && o.customMetadata.name) || key.split("/").pop();
  return new Response(o.body, { headers: { "content-type": o.httpMetadata.contentType || "application/octet-stream", "content-disposition": `inline; filename="${name.replace(/"/g, "")}"`, "x-content-type-options": "nosniff", "content-security-policy": "sandbox", "cache-control": "private, no-store" } });
}
// ---------- codes ----------
const newCode = () => `CE-${code(4)}-${code(4)}`;
const DEFAULT_TPL = {
  subject: "Your Cedwyn Estate eligibility code",
  body: "Dear {{name}},\n\nThank you for your free eligibility check{{ref_line}}. We have read it, and we would like to help your family reconstruct its estate.\n\nYour personal code is: {{code}}\n\nTo use it, sign in and enter the code here:\n{{link}}\n\nIt unlocks the Cedwyn Estate reconstruction service at £49.99 a month, which you can cancel at any time. The code works once.\n\nWith best wishes,\nThe Cedwyn Estate onboarding team\n\nOur case, prospective. A records and evidence service, not a law firm; this email is not legal advice and no outcome is promised.",
};
async function getTpl(env) {
  const r = await env.DB.prepare("SELECT k,v FROM meta WHERE k IN ('tpl_code_subject','tpl_code_body')").all();
  const m = Object.fromEntries((r.results || []).map((x) => [x.k, x.v]));
  return { subject: m.tpl_code_subject || DEFAULT_TPL.subject, body: m.tpl_code_body || DEFAULT_TPL.body };
}
const fillTpl = (s, v) => String(s).replace(/\{\{(\w+)\}\}/g, (_, k) => v[k] ?? "");
async function verifyMail(env, user, test) {
  const tok = b64(rand(24)).replace(/[+/=]/g, "");
  await env.DB.prepare("UPDATE users SET verify_hash=?, verify_exp=? WHERE id=?").bind(await sha256(tok), now() + 3 * DAY, user.id).run();
  const link = `${APP}/verify/?t=${tok}`;
  const subj = `${test ? "[TEST] " : ""}Confirm your email for Cedwyn Estate`;
  const text = `Hello ${user.name || ""},\n\nPlease confirm your email address for your Cedwyn Estate account:\n\n${link}\n\nThe link works for 3 days. If you didn't sign up, ignore this email.\n\nThe Cedwyn Estate onboarding team\n\nOur case, prospective. `;
  return await sendMail(env, { to: user.email, subject: subj, text, html: emailHtml("Confirm your email", [`Hello ${esc(user.name || "")},`, "Please confirm your email address for your Cedwyn Estate account. The link works for 3 days.", "If you didn't sign up, you can ignore this email."], { href: link, label: "Confirm my email" }), kind: "verify" });
}
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
<p><a href="/admin/enquiries/">Enquiries</a> · <a href="/admin/codes/">Codes</a> · <a href="/admin/">Users</a> · <a href="/admin/mail/">Email</a> · <a href="/admin/audit/">Audit log</a> · <a href="/dashboard/">My dashboard</a></p>
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
    const fl = u.searchParams.get("f") || "open";
    const where = fl === "all" ? "" : fl === "eligible" ? "WHERE eligibility='eligible'" : "WHERE eligibility IN ('unreviewed','more_info') AND status NOT IN ('pending','rejected','done','refunded')";
    const { results } = await env.DB.prepare(`SELECT ref,user_id,kind,place,parish,parcel,claimant_name,contact_name,status,eligibility,grade,score,created,test,files FROM enquiries ${where} ORDER BY id DESC LIMIT 200`).all();
    const tab = (k, l) => k === fl ? `<strong>${l}</strong>` : `<a href="/admin/enquiries/?f=${k}">${l}</a>`;
    return adminShell(user, "Enquiries", `<p>${tab("open", "To review")} · ${tab("eligible", "Eligible")} · ${tab("all", "All")}</p>
<table><tr><th>Ref</th><th>Who / where</th><th>Status</th><th>Grade</th></tr>${results.map((e) => `<tr><td><a href="/admin/enquiry/?ref=${esc(e.ref)}">${esc(e.ref)}</a><br><span class="small">${esc((e.created || "").slice(0, 10))}${e.kind === "deep" ? " · deep" : ""}${e.test ? " · test" : ""}</span></td><td>${esc(e.claimant_name || e.contact_name || "")}<br><span class="small">${esc([e.place, e.parish].filter(Boolean).join(", ") || (e.parcel || "").slice(0, 50))}${filesOf(e).length ? " · " + filesOf(e).length + " file(s)" : ""}</span></td><td>${esc(enqStatus(e))}</td><td>${esc(e.grade || "")}</td></tr>`).join("") || `<tr><td colspan="4">Nothing here.</td></tr>`}</table>`, msg, err);
  }

  if (path === "/admin/file/") {
    const k = u.searchParams.get("k") || "";
    if (!/^enq\/[A-Z0-9-]+\/[\w.-]+$/.test(k)) return new Response("Not found", { status: 404 });
    return serveFile(env, k);
  }
  if (path === "/admin/enquiry/") {
    const ref = u.searchParams.get("ref") || "";
    const e = await env.DB.prepare("SELECT e.*, us.email AS acct_email, us.email_verified AS acct_verified FROM enquiries e LEFT JOIN users us ON us.id=e.user_id WHERE e.ref=?").bind(ref).first();
    if (!e) return adminShell(user, "Enquiry not found", `<p><a href="/admin/enquiries/">Back to enquiries</a></p>`);
    const fl = filesOf(e);
    const { results: cs } = await env.DB.prepare("SELECT * FROM codes WHERE enquiry_ref=? ORDER BY id DESC").bind(ref).all();
    const tpl = await getTpl(env);
    const to = e.contact_email || e.acct_email || "";
    const vars = { name: e.claimant_name || e.contact_name || "there", ref: e.ref, ref_line: ` (${e.ref})`, code: "{{code}}", link: "{{link}}" };
    const row = (k, v) => v ? `<tr><th>${k}</th><td style="white-space:pre-wrap">${esc(v)}</td></tr>` : "";
    const ef = (a, extra, label, cls = "btn alt") => `<form method="post" action="/admin/enq/" class="inl"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="ref" value="${esc(ref)}"><input type="hidden" name="action" value="${a}">${extra || ""}<button class="${cls}">${label}</button></form>`;
    return adminShell(user, `${e.ref}`, `<p><a href="/admin/enquiries/">← All enquiries</a></p>
<p><span class="pill">${esc(e.kind === "deep" ? "Full deep search" : e.kind === "paid" ? "Live search (v1)" : "Free check")}</span> <span class="pill">${esc(STATUS_LABEL[e.status] || e.status)}</span> <span class="pill">eligibility: ${esc(e.eligibility || "unreviewed")}</span>${e.test ? " <span class=\"pill\">test</span>" : ""}</p>
<p class="small">Lead score ${esc(e.grade)} (${e.score}/100): ${esc(e.score_notes)}</p>
<table>${row("For", e.for_whom)}${row("Claimant", e.claimant_name || e.contact_name)}${row("Relationship", e.relation)}${row("Family names", e.family_names)}${row("Holding / farm", e.place)}${row("Parish / town", e.parish)}${row("County", e.county)}${row("Parcel / address", e.parcel)}${row("Title no.", e.title_no)}${row("Country", e.country)}${row("What they know", e.know || e.happened)}${row("Dates / documents", e.dates)}${row("Year lost", e.year_lost)}${row("Contact email", e.contact_email)}${row("Phone", e.contact_phone)}${row("Account", `#${e.user_id} ${e.acct_email || ""} (email ${e.acct_verified ? "confirmed" : "not confirmed"})`)}${row("Sent", e.created)}${row("Disclaimer ticked", e.disclaimer_at)}${row("Emailed to you", e.emailed ? "yes" : e.mail_error ? "failed: " + e.mail_error : "no")}</table>
${fl.length ? `<h2>Files</h2><p>${fl.map((f) => `<a href="/admin/file/?k=${encodeURIComponent(f.key)}">${esc(f.name)}</a> (${esc(f.type)}, ${fmtSize(f.size)})`).join("<br>")}</p>` : ""}
<h2>Decision</h2><p>${ef("eligible", "", "Mark eligible", "btn")} ${ef("not_eligible", "", "Mark not eligible")} ${ef("more_info", "", "Need more info")} ${ef("in_review", "", "In review")}</p>
<form class="f" method="post" action="/admin/enq/"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="ref" value="${esc(ref)}"><input type="hidden" name="action" value="note"><label>Private note</label><textarea name="note" rows="2" maxlength="2000">${esc(e.admin_note || "")}</textarea><p><button class="btn alt">Save note</button></p></form>
<h2>Generate &amp; email code</h2>
<form class="f" method="post" action="/admin/code/"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="ref" value="${esc(ref)}"><input type="hidden" name="action" value="send">
<label>To</label><input name="to" type="email" maxlength="160" value="${esc(to)}" required><label>Name in the greeting</label><input name="name" maxlength="100" value="${esc(vars.name)}">
<label>Subject</label><input name="subject" maxlength="200" value="${esc(tpl.subject)}"><label>Message ({{name}}, {{code}}, {{link}}, {{ref_line}} are filled in)</label><textarea name="body" rows="12" maxlength="6000">${esc(tpl.body)}</textarea>
<label class="chk"><input type="checkbox" name="save_tpl" value="1"> Save this subject and message as my default template</label>
<p><button class="btn solid">Generate code &amp; send email</button></p><p class="small">Also marks the enquiry eligible. From ${MAIL_FROM_ONBOARD}.</p></form>
${cs.length ? `<h2>Codes for this enquiry</h2><table><tr><th>Code</th><th>To</th><th>Emailed</th><th>Used</th></tr>${cs.map((c) => `<tr><td>${esc(c.code)}${c.revoked ? " (revoked)" : ""}</td><td>${esc(c.email || "-")}</td><td>${c.emailed_at ? esc(c.emailed_at) : c.mail_error ? "failed" : "-"}</td><td>${c.used_at ? "#" + c.used_by + " " + esc(c.used_at) : "-"}</td></tr>`).join("")}</table>` : ""}
<p class="small"><a href="/admin/user/?id=${e.user_id}">Open the account</a> (suspend, erase, refunds).</p>`, msg, err);
  }
  if (path === "/admin/enq/" && req.method === "POST") {
    const f = await req.formData();
    if (String(f.get("csrf") || "") !== csrf) return adminShell(user, "Expired form", `<p>That form had expired. Please go back, reload and try again.</p>`);
    const ref = String(f.get("ref") || ""), a = String(f.get("action") || "");
    const back = (m, e2) => redirect(`/admin/enquiry/?ref=${encodeURIComponent(ref)}&${e2 ? "e" : "m"}=${encodeURIComponent(e2 || m)}`);
    if (["eligible", "not_eligible", "more_info"].includes(a)) { await env.DB.prepare("UPDATE enquiries SET eligibility=?, status=CASE WHEN status IN ('received','in_review') THEN 'in_review' ELSE status END WHERE ref=?").bind(a, ref).run(); await audit(env, user, "eligibility", ref, a); return back("Saved: " + a.replace("_", " ")); }
    if (a === "in_review") { await env.DB.prepare("UPDATE enquiries SET status='in_review' WHERE ref=?").bind(ref).run(); await audit(env, user, "enq_status", ref, "in_review"); return back("Marked in review"); }
    if (a === "note") { await env.DB.prepare("UPDATE enquiries SET admin_note=? WHERE ref=?").bind(String(f.get("note") || "").slice(0, 2000), ref).run(); return back("Note saved"); }
    return back("", "Unknown action");
  }
  if (path === "/admin/code/" && req.method === "POST") {
    const f = await req.formData();
    if (String(f.get("csrf") || "") !== csrf) return adminShell(user, "Expired form", `<p>That form had expired. Please go back, reload and try again.</p>`);
    const ref = String(f.get("ref") || "").trim(), to = String(f.get("to") || "").trim().toLowerCase(), name = String(f.get("name") || "").trim().slice(0, 100);
    const backTo = ref ? `/admin/enquiry/?ref=${encodeURIComponent(ref)}` : "/admin/codes/";
    const back = (m, e2) => redirect(`${backTo}${backTo.includes("?") ? "&" : "?"}${e2 ? "e" : "m"}=${encodeURIComponent(e2 || m)}`);
    if (to && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return back("", "That email address doesn't look right");
    const tpl = await getTpl(env);
    const subject = String(f.get("subject") || tpl.subject).slice(0, 200), body = String(f.get("body") || tpl.body).slice(0, 6000);
    if (f.get("save_tpl")) { await env.DB.batch([env.DB.prepare("INSERT OR REPLACE INTO meta (k,v) VALUES ('tpl_code_subject',?)").bind(subject), env.DB.prepare("INSERT OR REPLACE INTO meta (k,v) VALUES ('tpl_code_body',?)").bind(body)]); await audit(env, user, "template_saved", "codes", ""); }
    const c = newCode();
    const isTest = !!(ref && (await env.DB.prepare("SELECT test FROM enquiries WHERE ref=?").bind(ref).first() || {}).test);
    await env.DB.prepare("INSERT INTO codes (code,enquiry_ref,email,created,created_by,test) VALUES (?,?,?,?,?,?)").bind(c, ref || null, to || null, iso(), user.id, isTest ? 1 : 0).run();
    if (ref) await env.DB.prepare("UPDATE enquiries SET eligibility='eligible', status=CASE WHEN status IN ('received','in_review') THEN 'in_review' ELSE status END WHERE ref=?").bind(ref).run();
    await audit(env, user, "code_created", ref || "unattached", `${c}${to ? " for " + to : ""}`);
    if (!to) return back(`Code created: ${c} (not emailed). Give it to the person; it works once.`);
    const link = `${APP}/code/?c=${c}`;
    const v = { name: name || "there", code: c, link, ref: ref, ref_line: ref ? ` (${ref})` : "" };
    const subj = (isTest ? "[TEST] " : "") + fillTpl(subject, v), text = fillTpl(body, v);
    const paras = text.split(/\n{2,}/).map((p) => esc(p).replace(/\n/g, "<br>"));
    const r = await sendMail(env, { to, subject: subj, text, html: emailHtml(subj, paras), kind: "code" });
    if (r.ok) { await env.DB.prepare("UPDATE codes SET emailed_at=? WHERE code=?").bind(iso(), c).run(); await audit(env, user, "code_emailed", c, `${to} via ${r.route}`); return back(`Code ${c} emailed to ${to}.`); }
    await env.DB.prepare("UPDATE codes SET mail_error=? WHERE code=?").bind(r.error.slice(0, 300), c).run();
    await audit(env, user, "code_email_failed", c, r.error.slice(0, 200));
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(text)}`;
    return adminShell(user, "Code created, email not sent", `<p class="err">The code was created but the email didn't go: ${esc(r.error)}</p><p>Code: <strong>${esc(c)}</strong></p><p><a class="btn solid" href="${esc(mailto)}">Send it from my own email</a></p><p class="small">That opens your own mail app with the message filled in. <a href="${backTo}">Back</a></p>`);
  }
  if (path === "/admin/codes/") {
    const { results: cs } = await env.DB.prepare("SELECT * FROM codes ORDER BY id DESC LIMIT 200").all();
    const tpl = await getTpl(env);
    return adminShell(user, "Codes", `<h2>Generate a code (not tied to an enquiry)</h2>
<form class="f" method="post" action="/admin/code/"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="action" value="send">
<label>Email it to (leave empty to just create it)</label><input name="to" type="email" maxlength="160"><label>Name in the greeting</label><input name="name" maxlength="100">
<label>Subject</label><input name="subject" maxlength="200" value="${esc(tpl.subject)}"><label>Message ({{name}}, {{code}}, {{link}}, {{ref_line}})</label><textarea name="body" rows="12" maxlength="6000">${esc(tpl.body)}</textarea>
<label class="chk"><input type="checkbox" name="save_tpl" value="1"> Save as my default template</label><p><button class="btn solid">Generate code</button></p></form>
<h2>All codes</h2><table><tr><th>Code</th><th>Enquiry</th><th>To</th><th>Emailed</th><th>Used</th><th></th></tr>${cs.map((c) => `<tr><td>${esc(c.code)}${c.test ? " (test)" : ""}</td><td>${c.enquiry_ref ? `<a href="/admin/enquiry/?ref=${esc(c.enquiry_ref)}">${esc(c.enquiry_ref)}</a>` : "-"}</td><td>${esc(c.email || "-")}</td><td>${c.emailed_at ? esc(c.emailed_at.slice(0, 16)) : c.mail_error ? "failed" : "-"}</td><td>${c.used_at ? "#" + c.used_by : c.revoked ? "revoked" : "-"}</td><td>${!c.used_at && !c.revoked ? `<form method="post" action="/admin/revoke/" class="inl"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="code" value="${esc(c.code)}"><button class="lnk">Revoke</button></form>` : ""}</td></tr>`).join("") || `<tr><td colspan="6">No codes yet.</td></tr>`}</table>`, msg, err);
  }
  if (path === "/admin/revoke/" && req.method === "POST") {
    const f = await req.formData();
    if (String(f.get("csrf") || "") !== csrf) return redirect("/admin/codes/?e=Expired%20form");
    const c = String(f.get("code") || "");
    await env.DB.prepare("UPDATE codes SET revoked=1 WHERE code=? AND used_at IS NULL").bind(c).run(); await audit(env, user, "code_revoked", c, "");
    return redirect("/admin/codes/?m=" + encodeURIComponent(c + " revoked"));
  }
  if (path === "/admin/mail/") {
    const k = await mailKey(env);
    const { results: lg } = await env.DB.prepare("SELECT at,kind,route,ok,error FROM mail_log ORDER BY id DESC LIMIT 40").all();
    return adminShell(user, "Email", `<p>Emails to users (confirm email, password reset, codes) go from <strong>${MAIL_FROM_ONBOARD}</strong>.</p>
<p>Route now: ${k ? `<strong>${esc(k.provider)}</strong> (key stored)` : "<strong>Cloudflare only</strong>: Cloudflare delivers only to verified addresses until the domain is onboarded to Cloudflare Email Sending"}. Enquiries reach you through Cloudflare Email Routing.</p>
<table><tr><th>When (UTC)</th><th>Kind</th><th>Route</th><th>Result</th></tr>${lg.map((x) => `<tr><td>${esc(x.at)}</td><td>${esc(x.kind)}</td><td>${esc(x.route)}</td><td>${x.ok ? "sent" : "failed: " + esc((x.error || "").slice(0, 120))}</td></tr>`).join("") || `<tr><td colspan="4">Nothing sent yet.</td></tr>`}</table>`, msg, err);
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
    if (path.startsWith("/ops/") && !path.endsWith("/")) path += "/";
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
      if (path === "/ops/mailkey/" || path === "/ops/mailtest/") {
        if (!test) return new Response("Not found", { status: 404 });
        if (path === "/ops/mailkey/") {
          if (req.method === "GET") { const k = await mailKey(env); return json({ set: !!k, provider: k ? k.provider : null, source: k ? k.source : null }); }
          const b = await req.json().catch(() => ({}));
          if (!["resend"].includes(b.provider) || !/^re_[A-Za-z0-9_]{10,200}$/.test(String(b.key || ""))) return json({ ok: false, why: "provider must be resend and key must look like re_…" }, 400);
          await env.DB.prepare("INSERT OR REPLACE INTO meta (k,v) VALUES ('mail_key',?)").bind(await sealStr(env, JSON.stringify({ provider: b.provider, key: b.key }))).run();
          return json({ ok: true, stored: "d1 meta (AES-GCM sealed)", provider: b.provider });
        }
        const b = await req.json().catch(() => ({}));
        const r = await sendMail(env, { to: b.to, subject: "[TEST] Cedwyn Estate mail route check", text: "Route test from app.bucklerfamily.estate. Please ignore.", kind: "test" });
        return json(r);
      }
      switch (path) {
        case "/": return landing(user);
        case "/pricing/": return pricing(user);
        case "/terms/": return legalPage(user, "Terms of service", TERMS);
        case "/privacy/": return legalPage(user, "Privacy notice", PRIVACY);
        case "/signup/": case "/login/": {
          const kind = path.slice(1, -1), next = (u.searchParams.get("next") || "/dashboard/");
          if (req.method === "GET") return user ? redirect(next.startsWith("/") ? next : "/dashboard/") : authForm(kind, "", next);
          const f = await req.formData();
          const nx = /^\/[a-z\/]*(\?c=[A-Z0-9-]{1,20})?$/.test(f.get("next") || "") ? f.get("next") : "/dashboard/";
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
            const nu = { id: r.meta.last_row_id, email, name };
            ctx.waitUntil(verifyMail(env, nu, test));
            return redirect(nx, { "Set-Cookie": await startSession(env, nu.id) });
          }
          if (!(await limit(env, `login|email|${email}`, 10, 3600))) return authForm(kind, "Too many attempts for this account. Please wait an hour.", nx, email);
          const row = await env.DB.prepare("SELECT id,pw,suspended,role FROM users WHERE email=?").bind(email).first();
          if (!row || !(await checkPw(pw, row.pw))) return authForm(kind, "That email and password don't match.", nx, email);
          if (row.suspended) return authForm(kind, `This account is suspended. Please email ${MAIL_FROM_ONBOARD}.`, nx, email);
          return redirect(nx, { "Set-Cookie": await startSession(env, row.id) });
        }
        case "/logout/": {
          const tok = cookies(req).ca_s;
          if (tok) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(tok)).run();
          return redirect("/", { "Set-Cookie": "ca_s=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" });
        }
        case "/verify/": {
          const t = u.searchParams.get("t") || "";
          const row = t.length > 20 ? await env.DB.prepare("SELECT id FROM users WHERE verify_hash=? AND verify_exp>?").bind(await sha256(t), now()).first() : null;
          if (!row) return shell("Link expired", `<h1>That link has expired</h1><p>Log in and use “Send the link again” on your dashboard.</p><p><a class="btn" href="/dashboard/">Dashboard</a></p>`, { user });
          await env.DB.prepare("UPDATE users SET email_verified=1, verify_hash=NULL, verify_exp=NULL WHERE id=?").bind(row.id).run();
          return user ? redirect("/dashboard/?m=verified") : shell("Email confirmed", `<h1>Email confirmed</h1><p>Thank you. You can now log in and send your free eligibility check.</p><p><a class="btn solid" href="/login/?next=/check/">Log in</a></p>`, {});
        }
        case "/verify/resend/": {
          if (!user) return redirect("/login/?next=/dashboard/");
          if (req.method !== "POST") return redirect("/dashboard/");
          if (user.email_verified) return redirect("/dashboard/");
          if (!(await limit(env, `verify|${user.id}`, 3, 3600))) return redirect("/dashboard/?m=wait");
          const r = await verifyMail(env, user, !!user.test);
          return redirect(r.ok ? "/dashboard/?m=resent" : "/dashboard/?m=mailfail");
        }
        case "/forgot/": {
          if (req.method === "GET") return forgotForm("", "");
          const f = await req.formData();
          const email = String(f.get("email") || "").trim().toLowerCase();
          if (botCheck(f)) return forgotForm("", "Please try again.");
          if (!(await limit(env, `forgot|ip|${ip}`, 5, 3600)) || !(await limit(env, `forgot|em|${email}`, 3, 3600))) return forgotForm("", "Too many requests. Please wait an hour.");
          const row = await env.DB.prepare("SELECT id,name,email,suspended FROM users WHERE email=?").bind(email).first();
          if (row && !row.suspended) {
            const tok = b64(rand(24)).replace(/[+/=]/g, "");
            await env.DB.prepare("UPDATE users SET reset_hash=?, reset_exp=? WHERE id=?").bind(await sha256(tok), now() + 3600, row.id).run();
            const link = `${APP}/reset/?t=${tok}`;
            ctx.waitUntil(sendMail(env, { to: row.email, subject: "Reset your Cedwyn Estate password", kind: "reset",
              text: `Hello ${row.name || ""},\n\nSomeone (hopefully you) asked to reset the password for your Cedwyn Estate account. Choose a new password here:\n\n${link}\n\nThe link works for 1 hour. If you didn't ask, ignore this email and your password stays the same.\n\nThe Cedwyn Estate onboarding team`,
              html: emailHtml("Reset your password", [`Hello ${esc(row.name || "")},`, "Someone (hopefully you) asked to reset the password for your Cedwyn Estate account. The link works for 1 hour.", "If you didn't ask, ignore this email and your password stays the same."], { href: link, label: "Choose a new password" }) }));
          }
          return forgotForm("If an account uses that email, we've sent a reset link. It works for 1 hour.", "");
        }
        case "/reset/": {
          if (req.method === "GET") return resetForm(u.searchParams.get("t") || "", "");
          const f = await req.formData();
          const t = String(f.get("tok") || ""), pw = String(f.get("password") || "");
          if (botCheck(f)) return resetForm(t, "Please try again.");
          if (pw.length < 10) return resetForm(t, "Please use at least 10 characters.");
          const row = t.length > 20 ? await env.DB.prepare("SELECT id FROM users WHERE reset_hash=? AND reset_exp>?").bind(await sha256(t), now()).first() : null;
          if (!row) return forgotForm("", "That reset link has expired. Please ask for a new one.");
          await env.DB.batch([env.DB.prepare("UPDATE users SET pw=?, reset_hash=NULL, reset_exp=NULL, email_verified=1 WHERE id=?").bind(await hashPw(pw), row.id), env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(row.id)]);
          return redirect("/dashboard/", { "Set-Cookie": await startSession(env, row.id) });
        }
        case "/dashboard/": {
          if (!user) return redirect("/login/?next=/dashboard/");
          const m = u.searchParams.get("m") || "";
          const MSG = { sub: "Thank you. Your base camp is ready below.", paid: "Thank you. Your deep search is with our team; we reply by email.", sent: "Thank you. Your free eligibility check is with us. A person will read it and reply by email.", verified: "Thank you, your email is confirmed.", resent: "We've sent the link again.", wait: "Please wait a little before asking for another link.", mailfail: "We couldn't send the email just now. Please try again later.", code: "Code accepted. You can now subscribe." };
          return dashboard(user, env, MSG[m] || "", m === "sub" || m === "paid");
        }
        case "/enquire/": return redirect("/check/");
        case "/check/": {
          if (!user) return redirect("/signup/?next=/check/");
          if (req.method === "GET") return checkForm(user, "");
          const f = await req.formData();
          const g = (k, n) => String(f.get(k) || "").trim().slice(0, n);
          const v = { for_whom: g("for_whom", 30), claimant_name: g("claimant_name", 100), relation: g("relation", 80), family_names: g("family_names", 300), place: g("place", 160), parish: g("parish", 120), county: g("county", 80), parcel: g("parcel", 300), country: g("country", 40), know: g("know", 6000), dates: g("dates", 2000), year_lost: g("year_lost", 4), contact_email: g("contact_email", 160).toLowerCase(), contact_phone: g("contact_phone", 30), callback: f.get("callback") === "yes" ? "yes" : "" };
          if (botCheck(f)) return checkForm(user, "Please try again.", v);
          const deep = f.get("go") === "deep";
          if (!(await limit(env, `chk|${user.id}`, 8, 86400))) return checkForm(user, "You've sent a lot of checks today. Please try again tomorrow, or email us.", v);
          if (!v.claimant_name || !v.place || !v.parish || !v.know || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.contact_email)) return checkForm(user, "Please fill in the name, the holding, the parish, what you know, and a valid email.", v);
          if (!f.get("disclaimer")) return checkForm(user, "Please tick the box to confirm you've read the notes before sending.", v);
          if (v.callback && v.contact_phone.replace(/[^0-9]/g, "").length < 7) return checkForm(user, "Please add a phone number for the call back, or untick the call-back box.", v);
          const ref = (deep ? "DS-" : "EC-") + code(6);
          const up = await takeFiles(f, env, ref);
          if (up.error) { for (const p of up.partial || []) await env.UPLOADS.delete(p.key); return checkForm(user, up.error, v); }
          const tn = ((v.parcel + " " + v.dates).match(/\b([A-Z]{2,3}\d{3,7})\b/i) || [])[1] || "";
          const q = qualify({ ...v, title_no: tn, happened: v.know + " " + v.dates, parcel: [v.place, v.parish, v.county, v.parcel].join(" ") });
          const status = deep ? "pending" : "received";
          try {
            await env.DB.prepare("INSERT INTO enquiries (ref,user_id,kind,for_whom,claimant_name,relation,family_names,place,parish,county,parcel,title_no,country,know,dates,year_lost,happened,contact_name,contact_email,contact_phone,files,status,created,score,grade,score_notes,disclaimer_at,eligibility,test) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'unreviewed',?)")
            .bind(ref, user.id, deep ? "deep" : "free", v.for_whom, v.claimant_name, v.relation, v.family_names, v.place, v.parish, v.county, v.parcel, tn, v.country, v.know, v.dates, v.year_lost, v.know.slice(0, 5000), v.claimant_name, v.contact_email, v.contact_phone, JSON.stringify(up.files), status, iso(), q.score, q.grade, q.notes, iso(), test ? 1 : 0).run();
          } catch (insErr) { for (const p of up.files) await env.UPLOADS.delete(p.key); throw insErr; }
          try { await env.DB.prepare("UPDATE enquiries SET callback=? WHERE ref=?").bind(v.callback ? 1 : 0, ref).run(); } catch (cbErr) { console.log("callback column", String(cbErr)); }
          if (deep) return redirect(`/enquire/pay/?ref=${ref}`);
          const e = await env.DB.prepare("SELECT * FROM enquiries WHERE ref=?").bind(ref).first();
          const subj = `${test ? "[TEST] " : ""}Free eligibility check ${ref} · grade ${q.grade} · ${v.claimant_name.slice(0, 40)} · ${v.place.slice(0, 40)}`;
          if (test && req.headers.get("x-apps-test-mail") === "dry") return json({ dry: true, ref, subject: subj, files: up.files.length });
          try { await mailSion(env, subj, enquiryText(e, user, up.files, test)); await env.DB.prepare("UPDATE enquiries SET emailed=1 WHERE ref=?").bind(ref).run(); }
          catch (err) { await env.DB.prepare("UPDATE enquiries SET mail_error=? WHERE ref=?").bind(String(err).slice(0, 300), ref).run(); }
          await tabLead(env, "Free eligibility check", v.claimant_name, [["Reference", ref], ["Name", v.claimant_name], ["Email", v.contact_email], ["Phone", v.contact_phone], ["CALLBACK_CONSENT", v.callback ? "yes" : "no"], ["Holding", v.place], ["Parish", v.parish], ["Grade", `${q.grade} (${q.score}/100)`], ["Test submission", test ? "yes" : "no"]], enquiryText(e, user, up.files, test));
          return redirect("/dashboard/?m=sent");
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
          if (!/^cs_(live|test)_[A-Za-z0-9]{10,120}$/.test(sid)) sid = "";
          const e = await env.DB.prepare("SELECT * FROM enquiries WHERE ref=? AND user_id=?").bind(user.pending_ref || "", user.id).first();
          if (!e || e.status !== "pending") return redirect("/dashboard/?m=paid");
          let status = "paid_claimed";
          const s = await stripeSession(env, sid, CFG.search_plink, e.ref);
          if (s) {
            if (s.id) sid = s.id;
            if (s.error || s.payment_status !== "paid" || s.amount_total !== CFG.search_price_pence || s.currency !== "gbp" || s.payment_link !== CFG.search_plink || s.client_reference_id !== e.ref)
              return shell("Payment not confirmed", `<h1>We couldn't confirm that payment</h1><p>If you were charged, email <a href="mailto:${MAIL_FROM_ONBOARD}">${MAIL_FROM_ONBOARD}</a> with reference ${esc(e.ref)} and we will sort it out.</p>`, { user });
            status = "paid_verified";
          }
          const r = await env.DB.prepare("UPDATE enquiries SET status=?, session_id=?, paid_at=? WHERE id=? AND status='pending'").bind(status, sid || null, iso(), e.id).run();
          if (r.meta.changes === 1) {
            await env.DB.prepare("UPDATE users SET pending_ref=NULL WHERE id=?").bind(user.id).run();
            const t = !!e.test;
            const subj = `${t ? "[TEST] " : ""}PAID deep search ${e.ref} · grade ${e.grade} · ${(e.claimant_name || "").slice(0, 40)} · ${(e.place || e.parcel || "").slice(0, 40)}`;
            const body = enquiryText(e, user, filesOf(e), t, status === "paid_verified" ? "VERIFIED with Stripe" : `reported by the buyer's return from Stripe, NOT yet verified: check Stripe (Payment Link ${CFG.search_plink})${sid ? ", session " + sid : ""}`);
            if (test && req.headers.get("x-apps-test-mail") === "dry") return json({ dry: true, subject: subj });
            try { await mailSion(env, subj, body); await env.DB.prepare("UPDATE enquiries SET emailed=1 WHERE id=?").bind(e.id).run(); }
            catch (err) { await env.DB.prepare("UPDATE enquiries SET mail_error=? WHERE id=?").bind(String(err).slice(0, 300), e.id).run(); }
            await tabLead(env, "Paid deep search", e.claimant_name, [["Reference", e.ref], ["Name", e.claimant_name], ["Email", e.contact_email], ["Phone", e.contact_phone], ["CALLBACK_CONSENT", e.callback ? "yes" : "no"], ["Holding", e.place], ["Parish", e.parish], ["Payment", status], ["Test submission", t ? "yes" : "no"]], body);
          }
          return redirect("/dashboard/?m=paid");
        }
        case "/code/": {
          const c0 = (u.searchParams.get("c") || "").toUpperCase().slice(0, 20);
          if (!user) return redirect(`/signup/?next=${encodeURIComponent("/code/" + (c0 ? "?c=" + c0 : ""))}`);
          if (req.method === "GET") return codeForm(user, "", c0);
          const f = await req.formData();
          const c = String(f.get("code") || "").trim().toUpperCase().replace(/\s+/g, "");
          if (!(await limit(env, `code|${user.id}`, 10, 3600)) || !(await limit(env, `code|ip|${ip}`, 20, 3600))) return codeForm(user, "Too many tries. Please wait an hour.", c);
          const row = await env.DB.prepare("SELECT * FROM codes WHERE code=?").bind(c).first();
          if (!row || row.revoked) return codeForm(user, "That code isn't valid. Please check it, or email us.", c);
          if (row.used_at && row.used_by !== user.id) return codeForm(user, "That code has already been used.", c);
          if (!row.used_at) {
            const r = await env.DB.prepare("UPDATE codes SET used_by=?, used_at=? WHERE code=? AND used_at IS NULL").bind(user.id, iso(), c).run();
            if (r.meta.changes !== 1) return codeForm(user, "That code has already been used.", c);
          }
          await env.DB.prepare("UPDATE users SET unlock_code=?, unlock_at=?, email_verified=CASE WHEN lower(email)=lower(?) THEN 1 ELSE email_verified END WHERE id=?").bind(c, iso(), row.email || "", user.id).run();
          return redirect("/subscribe/");
        }
        case "/subscribe/": {
          if (!user) return redirect("/signup/?next=/code/");
          if (["claimed", "active"].includes(user.sub_status)) return redirect("/dashboard/");
          if (!user.unlock_code && user.role !== "admin") return codeForm(user, "");
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
            await tabLead(env, "Case Agent subscription", user.name, [["Name", user.name], ["Email", user.email], ["Phone", ""], ["CALLBACK_CONSENT", "no (not asked on the subscription form)"], ["Parcel", user.parcel], ["Location", user.location], ["Payment", st], ["Test submission", t ? "yes" : "no"]], body);
          }
          return redirect("/dashboard/?m=sub");
        }
        case "/file/": {
          if (!user) return redirect("/login/?next=/dashboard/");
          const k = u.searchParams.get("k") || "";
          const m = k.match(/^enq\/([A-Z0-9-]+)\/[\w.-]+$/);
          if (!m) return new Response("Not found", { status: 404 });
          const own = await env.DB.prepare("SELECT 1 AS ok FROM enquiries WHERE ref=? AND user_id=?").bind(m[1], user.id).first();
          if (!own && user.role !== "admin") return new Response("Not found", { status: 404 });
          return serveFile(env, k);
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
