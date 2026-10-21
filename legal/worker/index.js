// ghf-enquire — licensing and estate-item enquiry form for bucklerfamily.estate/enquire/
// Stores each enquiry in D1 (binding DB) and forwards it by Email Routing (binding MAILER, a verified destination),
// plus a copy to Tab's inbound address (binding TAB_MAILER) for the lead playbook. v1.1.0: optional phone + call-back consent.
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
// --- Tab lead copy (Sion's Tab agent, 21 Oct 2026): every enquiry is also copied to Tab's inbound address so leads are handled per the lead playbook.
const TAB_TO = "tymawr.giftshop@mail.tab.bot";
const phoneClean = (v) => String(v == null ? "" : v).replace(/[^0-9+()\- .]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
async function tabCopy(env, from, fromName, replyTo, site, type, name, lines) {
  const binding = env.TAB_MAILER;
  if (!binding) return false;
  try {
    const subject = `[ENQUIRY] ${site} · ${type} · ${name || "(no name)"}`.replace(/[\r\n]+/g, " ").slice(0, 240);
    const text = lines.map(([k, v]) => `${k}: ${v == null || v === "" ? "-" : String(v).replace(/\r\n?/g, "\n")}`).join("\n") + "\n\n--\nCopy for Tab (lead playbook). The same enquiry went to the estate mailbox.\n";
    const id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) + "@bucklerfamily.estate";
    const raw = [`From: "${fromName}" <${from}>`, `To: <${TAB_TO}>`, ...(replyTo ? [`Reply-To: <${replyTo}>`] : []), `Subject: =?UTF-8?B?${b64(subject)}?=`,
      `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`, `Message-ID: <${id}>`, "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: base64", "", wrap(b64(text))].join("\r\n");
    await binding.send(new EmailMessage(from, TAB_TO, raw));
    return true;
  } catch (e) { console.log("tab copy failed", String(e && e.message || e)); return false; }
}
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
    const phone = phoneClean(d.phone), callback = d.callback === "yes" || d.callback === true || d.callback === "on";
    if (!name || !message) return done({ ok: false, error: "Please give your name and a message." }, 400);
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(email)) return done({ ok: false, error: "Please give a valid email address." }, 400);
    if (!consent) return done({ ok: false, error: "Please tick the consent box so we can answer you." }, 400);
    if (callback && phone.replace(/[^0-9]/g, "").length < 7) return done({ ok: false, error: "Please give a phone number for the call back, or untick the call-back box." }, 400);
    const ip = req.headers.get("cf-connecting-ip") || "";
    const ipHash = (await sha((env.SALT || "ghf") + ip)).slice(0, 32);
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE ip_hash = ?1 AND created_at > datetime('now','-1 hour')").bind(ipHash).first();
    if (recent && recent.n >= 5) return done({ ok: false, error: "Too many enquiries from this connection. Please try again later." }, 429);
    const ref = rid(), country = (req.cf && req.cf.country) || "";
    await env.DB.prepare("INSERT INTO enquiries (ref, created_at, type, name, org, email, item, message, consent, ip_hash, country, status, phone, callback) VALUES (?1, datetime('now'), ?2, ?3, ?4, ?5, ?6, ?7, 1, ?8, ?9, 'new', ?10, ?11)")
      .bind(ref, type, name, org, email, item, message, ipHash, country, phone, callback ? 1 : 0).run();
    let mailed = false;
    try {
      const subject = `[${ref}] ${TYPES[type]}: ${name}${org ? " (" + org + ")" : ""}`;
      const text = `New enquiry from bucklerfamily.estate/enquire/\n\nReference: ${ref}\nType: ${TYPES[type]}\nName: ${name}\nOrganisation: ${org || "-"}\nEmail: ${email}\nPhone: ${phone || "-"}\nCALLBACK_CONSENT: ${callback ? "yes" : "no"}\nItem or use: ${item || "-"}\nCountry (from network): ${country || "-"}\nConsent to store and use: yes\n\nMessage:\n${message}\n\n--\nStored in D1 ghf-enquiries (table enquiries). Reply to this email to answer the enquirer.\nghf-enquire Worker, Sion's Tab agent`;
      const raw = [`From: "GHF Enquiries" <${FROM}>`, `To: <${env.MAILER_TO}>`, `Reply-To: <${email}>`, `Subject: =?UTF-8?B?${b64(subject)}?=`,
        `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`, `Message-ID: <${ref.toLowerCase()}.${Date.now()}@bucklerfamily.estate>`, "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: base64", "", wrap(b64(text))].join("\r\n");
      await env.MAILER.send(new EmailMessage(FROM, env.MAILER_TO, raw));
      mailed = true;
    } catch (e) { console.log("mail failed", String(e && e.message || e)); }
    const tabbed = await tabCopy(env, FROM, "GHF Enquiries", email, "bucklerfamily.estate/enquire", TYPES[type], name, [
      ["Site", "bucklerfamily.estate/enquire/"], ["Reference", ref], ["Type", TYPES[type]], ["Name", name], ["Organisation", org], ["Email", email],
      ["Phone", phone], ["CALLBACK_CONSENT", callback ? "yes" : "no"], ["Item or use", item], ["Country (from network)", country],
      ["Consent to store and use", "yes"], ["Received (UTC)", new Date().toISOString()], ["Message", "\n" + message]]);
    await env.DB.prepare("UPDATE enquiries SET mailed = ?1 WHERE ref = ?2").bind(mailed ? 1 : 0, ref).run();
    return done({ ok: true, ref, mailed, copied: tabbed }, 200);
  }
};
