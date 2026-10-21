#!/usr/bin/env python3
"""Build the generated parts of the app.bucklerfamily.estate Worker (Cedwyn Estate Case Office) (work/apps/worker/gen.js):
- the Terms of service and Privacy notice bodies, reusing CO, TEMPLATE_NOTE and clauses() from
  BucklerFamilyFarm legal/build_legal.py (the shared legal templates);
- the "virtual base camp" board SVG, drawn with the same icon(), tent() and path style as
  campus/build_basecamp.py (the Cedwyn Estate map), so a subscriber's camp looks like the estate map.
Run: python3 work/apps/build_apps.py <path to a BucklerFamilyFarm checkout>— Sion's Tab agent, 20 Oct 2026
"""
import sys, os, json, html, importlib.util, re
BFF = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "worker", "gen.js")
CFG = json.load(open(os.path.join(HERE, "config.json"), encoding="utf-8"))

# --- legal templates (import only; build_legal.py writes files only when run as a script) ---
src = open(os.path.join(BFF, "legal", "build_legal.py"), encoding="utf-8").read()
head = src.split("def licence():")[0]
L = {"__file__": os.path.join(BFF, "legal", "build_legal.py"), "__name__": "build_legal_head"}
exec(compile(head, "build_legal.py", "exec"), L)
CO, TEMPLATE_NOTE, clauses = L["CO"], L["TEMPLATE_NOTE"], L["clauses"]

# --- base camp drawing helpers (everything above the layout section) ---
bsrc = open(os.path.join(BFF, "campus", "build_basecamp.py"), encoding="utf-8").read()
bhead = bsrc.split("# ---------- layout ----------")[0]
B = {"__file__": os.path.join(BFF, "campus", "build_basecamp.py"), "__name__": "build_basecamp_head"}
exec(compile(bhead, "build_basecamp.py", "exec"), B)
icon, tent, wrap = B["icon"], B["tent"], B["wrap"]
P, S = CFG["colors"]
esc = lambda s: html.escape(s, quote=True)

STAGES = CFG["stages"]
Wd = 390
y = 250
rows = []
for i, st in enumerate(STAGES):
    left = i % 2 == 0
    bx = 88 if left else Wd - 88
    rows.append((st, left, bx, y)); y += 150
H = y + 20
pts = [(Wd/2, 170)] + [(bx, cy + 56) for _, _, bx, cy in rows]
d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
    k = (y1 - y0) * 0.55
    d += f" C{x0:.1f} {y0+k:.1f} {x1:.1f} {y1-k:.1f} {x1:.1f} {y1:.1f}"
g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {Wd} {H}" width="100%" role="img" aria-labelledby="campT campD" style="max-width:520px;display:block;margin:0 auto;background:#0A0A0A;border-radius:14px">',
     '<title id="campT">Your virtual base camp: __PARCEL__</title><desc id="campD">The six stages of your case agent, each queued until onboarding is complete.</desc>',
     f'<path d="{d}" fill="none" stroke="{S}" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" opacity=".9"/>',
     tent(Wd/2, 70),
     f'<text x="{Wd/2}" y="134" text-anchor="middle" font-family="Barlow,Arial,sans-serif" font-size="13" letter-spacing="2" fill="{S}">YOUR BASE CAMP</text>',
     f'<text x="{Wd/2}" y="156" text-anchor="middle" font-family="Barlow,Arial,sans-serif" font-size="16" font-weight="700" fill="#fff">__PARCEL_SHORT__</text>']
for i, (st, left, bx, cy) in enumerate(rows, 1):
    g.append(icon(st["icon"], bx, cy, False, [P, S]))
    sx, sy = bx, cy + 56
    g.append(f'<circle cx="{sx}" cy="{sy}" r="12" fill="{S}" stroke="#0A0A0A" stroke-width="2"/><text x="{sx}" y="{sy+4.5}" text-anchor="middle" font-family="Barlow,Arial,sans-serif" font-size="13" font-weight="700" fill="#0A0A0A">{i}</text>')
    tx = 182 if left else 22
    yy = cy - 18
    for ln in wrap(st["title"].upper(), 19):
        g.append(f'<text x="{tx}" y="{yy}" font-family="Barlow,Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="1" fill="#fff">{esc(ln)}</text>'); yy += 19
    for ln in wrap(st["caption"], 30):
        g.append(f'<text x="{tx}" y="{yy+2}" font-family="Barlow,Arial,sans-serif" font-size="12.5" fill="#d9d9d9">{esc(ln)}</text>'); yy += 16
    g.append(f'<rect x="{tx}" y="{yy+8}" width="70" height="20" rx="10" fill="{S}"/><text x="{tx+35}" y="{yy+22}" text-anchor="middle" font-family="Barlow,Arial,sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" fill="#0A0A0A">QUEUED</text>')
g.append('</svg>')
CAMP_SVG = "".join(g)

PRICE = CFG["search_price_label"]; SUB = CFG["sub_price_label"]
terms = clauses([
    f'<strong>Who we are.</strong> app.bucklerfamily.estate, the Cedwyn Estate Case Office (<strong>“the Service”</strong>) is run by {CO} (<strong>“DATRO”</strong>, <strong>“we”</strong>) for the Williams–Buckler family. Contact: <a href="mailto:sales@bucklerfamily.estate">sales@bucklerfamily.estate</a>.',
    '<strong>What the Service is.</strong> A records-request and evidence-organising service. It helps you request records (for example under the Freedom of Information Act 2000, the Environmental Information Regulations 2004 and the UK GDPR right of access) and organise what comes back into a title trail, an evidence log and a timeline. <strong>We are not a law firm, we are not regulated by the Solicitors Regulation Authority, and nothing in the Service is legal advice.</strong> We do not promise any outcome, including any finding, possession, compensation, reparation or recovery of land or property. Your case remains prospective until a court or tribunal decides it.',
    f'<strong>Accounts.</strong> You must be 18 or over and give accurate details. Keep your password private; you are responsible for activity on your account. We may suspend an account used unlawfully or abusively.',
    f'<strong>Live search ({PRICE}, one-off).</strong> After you submit the enquiry form and pay, a person on our team reviews your enquiry and runs a live search of the public and paid-for records we judge relevant, then tells you by email what we found and what we suggest next. Any third-party fee (for example an HM Land Registry official copy) is extra and needs your agreement first. We aim to reply within 10 working days.',
    f'<strong>Case Agent subscription ({SUB}).</strong> The price is {SUB} including any VAT due. It renews automatically each month on the same date until you cancel. It gives you a dashboard with your own virtual base camp for your land parcel and, once onboarding is complete, help to prepare and track records requests and to organise your evidence. Work starts after onboarding, which we arrange with you by email; until then each stage shows as queued.',
    '<strong>How to cancel the subscription.</strong> Cancel at any time through the customer portal linked from your dashboard (it stops at the end of the month you have paid for), or email <a href="mailto:sales@bucklerfamily.estate">sales@bucklerfamily.estate</a>. No further payments are taken after cancellation takes effect.',
    '<strong>Your 14-day right to cancel.</strong> Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 you may cancel within 14 days of the day the contract is made (for the subscription, the first payment) without giving a reason. To cancel, tell us clearly, for example by email to sales@bucklerfamily.estate; you may use the model form in Schedule 3 to the Regulations but you do not have to. By paying you ask us to start the service during the 14 days. If you cancel within that time we refund you within 14 days, less a proportionate amount for the service supplied before you told us (regulation 36). Once a live search has been fully carried out within the 14 days, the right to cancel it ends, and you acknowledged this when you asked us to start.',
    '<strong>Your part.</strong> You will only ask us to request records you are entitled to request, and you confirm that anything you give us is accurate. A subject access request can only be made by the data subject or with their written authority. You must not use the Service to harass anyone or to publish personal data unlawfully.',
    '<strong>Wording.</strong> Material in your base camp records what you assert and what documents show. It is We will not describe any person or body as having acted unlawfully unless a court has so found.',
    '<strong>Liability.</strong> Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or any liability that cannot be limited by law, or affects your statutory rights under the Consumer Rights Act 2015 (a service must be carried out with reasonable care and skill). Subject to that, our total liability to you is limited to the amount you paid us in the 12 months before the claim, and we are not liable for losses that were not foreseeable or for the outcome of any legal matter.',
    '<strong>Complaints.</strong> Email sales@bucklerfamily.estate. We reply within 14 days.',
    '<strong>Law.</strong> These terms are governed by the law of England and Wales. You keep the mandatory consumer protections and courts of the part of the UK where you live.'], "A")
privacy = clauses([
    f'<strong>Who we are.</strong> The data controller for app.bucklerfamily.estate (the Cedwyn Estate Case Office) is {CO} (<strong>“DATRO”</strong>, <strong>“we”</strong>). Contact: <a href="mailto:privacy@bucklerfamily.estate">privacy@bucklerfamily.estate</a>. Our main <a href="https://bucklerfamily.estate/privacy/">privacy policy</a> covers the other Cedwyn Estate sites.',
    '<strong>What we collect and why.</strong><table><tr><th>Data</th><th>Purpose</th><th>Lawful basis (UK GDPR Art 6)</th><th>Kept for</th></tr>'
    '<tr><td>Account: email, name, a salted one-way hash of your password (PBKDF2), sign-in session</td><td>To run your account</td><td>Contract (6(1)(b))</td><td>Until you close your account, then 30 days</td></tr>'
    '<tr><td>Live search enquiry: parcel or address, title number, your description, contact details</td><td>To run the search you paid for and reply to you</td><td>Contract (6(1)(b))</td><td>6 years after the last payment (tax records); description deleted earlier on request</td></tr>'
    '<tr><td>Subscription: parcel name, location and its map position</td><td>To build your base camp and carry out the service</td><td>Contract (6(1)(b))</td><td>While subscribed, then 6 years for payment records</td></tr>'
    '<tr><td>Payment details</td><td>Taken and held by Stripe; we see only the outcome, your email and the amount</td><td>Contract; legal obligation (6(1)(c))</td><td>6 years</td></tr>'
    '<tr><td>IP address</td><td>Abuse prevention: turned into a salted one-way code for rate limits</td><td>Legitimate interests (6(1)(f))</td><td>Up to 1 day</td></tr></table>',
    '<strong>Special care.</strong> A description of what happened to your land may mention other people. Give only what the search needs. We do not publish anything you send us.',
    '<strong>Who we share it with.</strong> Cloudflare (hosting, database, email delivery to our team), Stripe (payments), HubSpot (our customer records, to follow up your enquiry) and the OpenStreetMap Foundation\'s Nominatim service (the parcel location you type, to place it on a map). Public bodies receive a records request only when you ask us to send one in your name. Some processors are in the United States; transfers rely on the UK Extension to the EU–US Data Privacy Framework or the UK International Data Transfer Addendum. We do not sell personal data.',
    '<strong>Automated decisions.</strong> A simple scoring rule helps us order enquiries for review. A person always reviews each enquiry; no decision with legal or similar effect is made by automated means alone (Article 22 UK GDPR).',
    '<strong>Cookies.</strong> One strictly necessary sign-in cookie (<code>ca_s</code>, HttpOnly, 30 days) and Cloudflare security cookies. No advertising or tracking cookies.',
    '<strong>Your rights.</strong> Access, correction, erasure, restriction, objection and portability, and withdrawal of consent where we rely on it. Email <a href="mailto:privacy@bucklerfamily.estate">privacy@bucklerfamily.estate</a>. We answer within one month.',
    '<strong>Complaints.</strong> Please tell us first. You may complain to the Information Commissioner\'s Office: <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk/make-a-complaint</a>.',
    '<strong>Changes.</strong> We publish any change on this page with a new date.'], "D")
js = ("// GENERATED by work/apps/build_apps.py — do not edit by hand. — Sion's Tab agent\n"
      f"export const CO = {json.dumps(CO, ensure_ascii=False)};\n"
      f"export const TEMPLATE_NOTE = {json.dumps(TEMPLATE_NOTE, ensure_ascii=False)};\n"
      f"export const TERMS = {json.dumps(terms, ensure_ascii=False)};\n"
      f"export const PRIVACY = {json.dumps(privacy, ensure_ascii=False)};\n"
      f"export const CAMP_SVG = {json.dumps(CAMP_SVG, ensure_ascii=False)};\n"
      f"export const CFG = {json.dumps(CFG, ensure_ascii=False)};\n")
open(OUT, "w", encoding="utf-8").write(js)
print("wrote", OUT, len(js))
