// ghf-enquire — licensing and estate-item enquiry form for bucklerfamily.estate/enquire/
// Stores each enquiry in D1 (binding DB) and forwards it by Email Routing (binding MAILER, a verified destination).
// Route: bucklerfamily.estate/enquire/api/*  ·  Sion's Tab agent, 20 Oct 2026
import { EmailMessage } from "cloudflare:email";
const TYPES = { licence: "Licence request", holder: "Holder of an estate item", media: "Press or media", correction: "Correction or concern", privacy: "Privacy", accessibility: "Accessibility", other: "Other" };
const FROM = "enquiries@bucklerfamily.estate";
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
const clean = (v, n) => String(v == null ? "" : v).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, n);
const oneLine = (v, n) => clean(v, n).replace(/\s+/g, " ");
const b64 = (s) => { const b = new TextEncoder().encode(s); let x = ""; for (let i = 0; i < b.length; i++) x += String.fromCharCode(b[i]); return btoa(x); };
const wrap = (s) => s.replace(/.{1,76}/g, "$&\r\n");
async function sha(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join(""); }
function rid() { const a = new Uint8Array(4); crypto.getRandomValues(a); return "GHF-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + [...a].map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase(); }
async function readBody(req) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await req.json();
  const f = await req.formData(); const o = {}; for (const [k, v] of f.entries()) o[k] = typeof v === "string" ? v : ""; return o;
}
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === "/enquire/api/health") return json({ ok: true, service: "ghf-enquire" });
    if (url.pathname !== "/enquire/api/submit") return json({ ok: false, error: "Not found" }, 404);
    if (req.method !== "POST") return json({ ok: false, error: "Use the form at /enquire/" }, 405);
    const wantsHtml = !(req.headers.get("accept") || "").includes("application/json");
    const done = (o, s) => wantsHtml ? Response.redirect(url.origin + "/enquire/?sent=" + (o.ok ? "1" : "0"), 303) : json(o, s);
    const origin = req.headers.get("origin");
    if (origin && !/^https:\/\/([a-z0-9-]+\.)*bucklerfamily\.estate$/.test(origin)) return json({ ok: false, error: "Forbidden" }, 403);
    let d; try { d = await readBody(req); } catch (e) { return done({ ok: false, error: "Could not read the form." }, 400); }
    // honeypot and time trap: answer as if sent, store nothing
    const ts = Number(d.ts || 0);
    if (clean(d.website, 200) || (ts && Date.now() - ts < 3000)) return done({ ok: true, ref: rid() }, 200);
    const type = TYPES[d.type] ? d.type : "other";
    const name = oneLine(d.name, 120), org = oneLine(d.org, 160), email = oneLine(d.email, 200).toLowerCase();
    const item = oneLine(d.item, 300), message = clean(d.message, 5000), consent = d.consent === "yes" || d.consent === true || d.consent === "on";
    if (!name || !message) return done({ ok: false, error: "Please give your name and a message." }, 400);
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(email)) return done({ ok: false, error: "Please give a valid email address." }, 400);
    if (!consent) return done({ ok: false, error: "Please tick the consent box so we can answer you." }, 400);
    const ip = req.headers.get("cf-connecting-ip") || "";
    const ipHash = (await sha((env.SALT || "ghf") + ip)).slice(0, 32);
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE ip_hash = ?1 AND created_at > datetime('now','-1 hour')").bind(ipHash).first();
    if (recent && recent.n >= 5) return done({ ok: false, error: "Too many enquiries from this connection. Please try again later." }, 429);
    const ref = rid(), country = (req.cf && req.cf.country) || "";
    await env.DB.prepare("INSERT INTO enquiries (ref, created_at, type, name, org, email, item, message, consent, ip_hash, country, status) VALUES (?1, datetime('now'), ?2, ?3, ?4, ?5, ?6, ?7, 1, ?8, ?9, 'new')")
      .bind(ref, type, name, org, email, item, message, ipHash, country).run();
    let mailed = false;
    try {
      const subject = `[${ref}] ${TYPES[type]}: ${name}${org ? " (" + org + ")" : ""}`;
      const text = `New enquiry from bucklerfamily.estate/enquire/\n\nReference: ${ref}\nType: ${TYPES[type]}\nName: ${name}\nOrganisation: ${org || "-"}\nEmail: ${email}\nItem or use: ${item || "-"}\nCountry (from network): ${country || "-"}\nConsent to store and use: yes\n\nMessage:\n${message}\n\n--\nStored in D1 ghf-enquiries (table enquiries). Reply to this email to answer the enquirer.\nghf-enquire Worker, Sion's Tab agent`;
      const raw = [`From: "GHF Enquiries" <${FROM}>`, `To: <${env.MAILER_TO}>`, `Reply-To: <${email}>`, `Subject: =?UTF-8?B?${b64(subject)}?=`,
        `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`, `Message-ID: <${ref.toLowerCase()}.${Date.now()}@bucklerfamily.estate>`, "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: base64", "", wrap(b64(text))].join("\r\n");
      await env.MAILER.send(new EmailMessage(FROM, env.MAILER_TO, raw));
      mailed = true;
    } catch (e) { console.log("mail failed", String(e && e.message || e)); }
    await env.DB.prepare("UPDATE enquiries SET mailed = ?1 WHERE ref = ?2").bind(mailed ? 1 : 0, ref).run();
    return done({ ok: true, ref, mailed }, 200);
  }
};
