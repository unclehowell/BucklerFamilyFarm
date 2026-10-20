#!/usr/bin/env python3
"""build_legal.py — rights, licence and UK compliance pages for bucklerfamily.estate.
Writes public/{licence,privacy,cookies,terms,accessibility,disclaimer,enquire}/index.html.
Usage: python3 legal/build_legal.py  (run from the repo root). Sion's Tab agent, 20 Oct 2026."""
import os, pathlib, html
ROOT = pathlib.Path(__file__).resolve().parent.parent / "public"
VER = "1.0.0"; DATE = "20 October 2026"; BASE = "https://bucklerfamily.estate"
CO = ("DATRO CONSORTIUM LIMITED, a private limited company registered in England and Wales, company number 13775817, "
      "registered office Unit 29 Highcroft Industrial Estate, Enterprise Road, Waterlooville, England, PO8 0BT")
TEMPLATE_NOTE = "Template prepared by Sion's Tab agent; not legal advice; review by a qualified solicitor/attorney recommended."
CSS = """@font-face{font-family:Barlow;src:url(https://bucklerfamily.estate/fonts/barlow-latin-400-normal.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:Barlow;src:url(https://bucklerfamily.estate/fonts/barlow-latin-700-normal.woff2) format("woff2");font-weight:700;font-display:swap}
@font-face{font-family:Barlow;src:url(https://bucklerfamily.estate/fonts/barlow-latin-ext-400-normal.woff2) format("woff2");font-weight:400;font-display:swap;unicode-range:U+0100-024F,U+0174-0177}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:#000;color:#e8e8e8;font:400 17px/1.6 Barlow,system-ui,sans-serif}
a{color:#fff}main{max-width:780px;margin:0 auto;padding:20px 18px 40px}
.k{letter-spacing:.18em;text-transform:uppercase;font-size:12px;color:#9a9a9a;margin:18px 0 6px}
h1{font-size:32px;line-height:1.15;margin:6px 0 14px;font-weight:700;color:#fff}h2{font-size:21px;margin:34px 0 8px;color:#fff;border-top:1px solid #222;padding-top:22px}h3{font-size:18px;margin:20px 0 6px;color:#fff}
.note{border:1px solid #444;border-radius:10px;padding:12px 14px;font-size:14px;color:#cfcfcf;background:#0b0b0b}
.case{border:1px solid #f2c94c;border-radius:10px;padding:12px 14px;font-size:15px;color:#f6e7b0;background:#0d0b02;font-weight:700}
.top{display:flex;gap:14px;flex-wrap:wrap;font-size:14px;padding:12px 18px;border-bottom:1px solid #1a1a1a}.top a{text-decoration:none;color:#cfcfcf}
.toc{font-size:15px}.toc a{color:#cfcfcf}ol.cl{padding-left:0;list-style:none;counter-reset:c}ol.cl>li{margin:0 0 10px;padding-left:44px;position:relative}
ol.cl>li .n{position:absolute;left:0;top:0;color:#9a9a9a;font-variant-numeric:tabular-nums}
table{border-collapse:collapse;width:100%;font-size:15px}td,th{border-bottom:1px solid #222;padding:8px 6px;text-align:left;vertical-align:top}
.btn{display:inline-block;background:#fff;color:#000;font-weight:700;border-radius:999px;padding:14px 22px;text-decoration:none;border:0;font:700 17px Barlow,system-ui,sans-serif;cursor:pointer}
.small{font-size:13px;color:#9a9a9a}ul{padding-left:20px}
label{display:block;font-size:15px;color:#ddd;margin:12px 0 4px}input[type=text],input[type=email],select,textarea{width:100%;padding:13px;border-radius:10px;border:1px solid #444;background:#111;color:#fff;font:17px Barlow,system-ui,sans-serif}
textarea{min-height:150px;resize:vertical}label.c{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:#cfcfcf;margin:14px 0}label.c input{margin-top:4px;width:22px;height:22px;flex:0 0 auto}
.hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}
.card{border:1px solid #2a2a2a;border-radius:14px;padding:18px;background:#070707;margin:18px 0}
.msg{display:none;border-radius:10px;padding:12px 14px;margin:14px 0;font-size:15px}.msg.ok{display:block;background:#0f2a17;border:1px solid #2e7d4f}.msg.err{display:block;background:#2a0f0f;border:1px solid #7d2e2e}
.ghf-legal-foot{border-top:1px solid #222;margin:40px auto 0;max-width:780px;padding:18px 18px 84px;font:400 13.5px/1.6 Barlow,system-ui,sans-serif;color:#a8a8a8}
.ghf-legal-foot a{color:#d8d8d8}.ghf-legal-foot nav{display:flex;flex-wrap:wrap;gap:4px 14px;margin:6px 0}.ghf-legal-foot p{margin:4px 0}"""

FOOT_LINKS = [("Licence", "/licence/"), ("Privacy", "/privacy/"), ("Cookies", "/cookies/"), ("Terms", "/terms/"),
              ("Disclaimer", "/disclaimer/"), ("Accessibility", "/accessibility/"), ("Enquire", "/enquire/")]

def footer():
    links = " ".join(f'<a href="{BASE}{u}">{t}</a>' for t, u in FOOT_LINKS)
    return (f'<footer class="ghf-legal-foot" data-ghf-legal-foot="1"><p><strong>© Williams–Buckler family. All rights reserved. Licence terms apply.</strong></p>'
            f'<nav aria-label="Legal">{links}</nav>'
            f'<p>Published by DATRO CONSORTIUM LIMITED (company 13775817) for the Williams–Buckler family. Our case, prospective. Not a finding of any court.</p>'
            f'<p>{TEMPLATE_NOTE} — Sion\'s Tab agent</p></footer>')

def page(slug, title, desc, body, kicker="Legal"):
    nav = ('<div class="top"><a href="https://bucklerfamily.estate/">← Cedwyn Estate</a><a href="/licence/">Licence</a>'
           '<a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/legal/">Terms of sale</a><a href="/enquire/">Enquire</a></div>')
    t = html.escape(title)
    doc = f"""<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{t} · Great House Farm (Tŷ Mawr)</title><meta name="description" content="{html.escape(desc)}"><link rel="canonical" href="{BASE}/{slug}/"><meta property="og:title" content="{t} · Great House Farm (Tŷ Mawr)"><meta property="og:description" content="{html.escape(desc)}"><meta property="og:url" content="{BASE}/{slug}/"><meta property="og:type" content="website"><meta name="theme-color" content="#000000"><style>{CSS}</style><script src="https://bucklerfamily.estate/basecamp.js" defer></script></head>
<body>{nav}<main><p class="k">{kicker} · v{VER} · {DATE}</p><h1>{t}</h1><p class="note">{TEMPLATE_NOTE}</p>
{body}
<p class="small">Version {VER}, {DATE}. Compiled by Sion's Tab agent.</p></main>{footer()}</body></html>
"""
    d = ROOT / slug; d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(doc, encoding="utf-8")
    return d / "index.html"

def clauses(items, prefix):
    out = ['<ol class="cl">']
    for i, it in enumerate(items, 1):
        out.append(f'<li><span class="n">{prefix}.{i}</span>{it}</li>')
    out.append('</ol>')
    return "".join(out)

WIKI = "https://greathousefarmwiki.wordpress.com"
TEL74 = WIKI + "/evidence-library/press-archive-transcripts/n03-1974-open-day-to-save-ancient-welsh-house/"
EV80 = WIKI + "/evidence/ev-0080-bp-properties-v-buckler-judgment/"

def licence():
    toc = ('<p class="toc"><strong>Contents</strong><br>1 Definitions · 2 Rights in the Materials · 3 What you may do without a licence · '
           '4 Commercial use, story and life rights · 5 Master Terms and sub-licences · 6 Artificial intelligence and data mining · '
           '7 The Family\'s position on Parcel A and the estate · 8 Holders of estate items · 9 Public interest · 10 Remedies · 11 General · Schedule</p>')
    s1 = clauses([
        '<strong>“Rights Holder”</strong> means Sion Buckler, heir and successor of the Williams–Buckler family of Tŷ Mawr, acting for himself and on behalf of the Williams–Buckler family (the <strong>“Family”</strong>), and any successor or assignee he appoints in writing.',
        '<strong>“Administrator”</strong> means ' + CO + ', which publishes and administers the Materials for the Family, pro bono and at cost.',
        '<strong>“Materials”</strong> means all text, research, compilations, the centralised chronology, timelines, evidence registers, catalogues, indices, transcriptions, translations, commentary, photographs, images, maps, plans, audio, video, e-books, games (including the chessboard and the case sudoku), datasets, databases, websites and software published on or from bucklerfamily.estate and its sub-domains, the Legal Wiki at greathousefarmwiki.wordpress.com, the Family\'s associated social-media pages, and the GitHub repositories listed in the Schedule, and every part, edition and version of them.',
        '<strong>“Family Story”</strong> means the history, events, experiences and personal and family narratives of the Family in connection with Tŷ Mawr (Great House Farm), Llandough-juxta-Penarth, Vale of Glamorgan, and the land known as Parcel A, as researched, compiled, arranged and expressed in the Materials.',
        '<strong>“Commercial Use”</strong> means any use made for, or with a view to, direct or indirect financial gain or commercial advantage, including any book, film, television or streaming programme, documentary, stage work, podcast, broadcast, article or feature written or published for payment, advertising, merchandise, game, paid course or event, and any use of the Materials to train, fine-tune, evaluate or ground an artificial-intelligence or machine-learning system offered commercially.',
        '<strong>“Licence”</strong> means a written licence signed by or for the Rights Holder; <strong>“Licensee”</strong> means its holder; <strong>“Master Terms”</strong> means these terms; and <strong>“Sub-licence”</strong> means any permission granted by a Licensee to another person.',
        'Headings are for convenience only. “Including” means including without limitation. References to legislation are to it as amended.'], "1")
    s2 = clauses([
        'Copyright subsists under the Copyright, Designs and Patents Act 1988 (<strong>“CDPA”</strong>) in the original literary, artistic, dramatic and other works comprised in the Materials, including the selection, arrangement and expression of the research and the centralised chronology. All rights are reserved.',
        'Database right subsists under the Copyright and Rights in Databases Regulations 1997 (SI 1997/3032) in the databases comprised in the Materials, including the centralised chronology, the evidence registers and the catalogues, by reason of the substantial investment made in obtaining, verifying and presenting their contents. Extraction or re-utilisation of all or a substantial part of their contents without a Licence is not permitted.',
        'The research, compilation and centralised chronology of the Family Story are carried out by, and under the direction and control of, the Rights Holder as heir and successor of the Family. Context: when Tŷ Mawr was opened to the public in April 1974 by Mary (Nancy) Williams, The Daily Telegraph reported that the house\'s “history has never been adequately chronicled” (Godfrey Francis, <em>The Daily Telegraph</em>, 16 April 1974; <a href="' + TEL74 + '">Legal Wiki GHF-E090-N03</a>). The Materials set out to supply that chronology.',
        'Where any part of the Materials is computer-generated within section 9(3) and section 178 CDPA, including work compiled with the assistance of the AI agent named “Sion\'s Tab agent”, the Rights Holder is the person by whom the arrangements necessary for its creation are undertaken, and is its author for the purposes of the CDPA.',
        'The Rights Holder asserts, to the extent the law allows, the right to be identified as author or compiler of the Materials and the right to object to derogatory treatment of them (sections 77 and 80 CDPA).',
        'The Materials quote, reproduce or link to works belonging to others, including judgments, public records, Crown copyright material (published under the Open Government Licence where so marked), newspaper reports and archive items. Those works remain the property of their owners. The Rights Holder asserts no rights in them beyond the selection, arrangement, transcription, translation and commentary that the Materials add.',
        'Software published in the repositories that comes from third parties (libraries, frameworks, fonts and similar) remains under its own licence, which is shown in or beside that software. Nothing in these Master Terms changes those licences.',
        '<strong>Exception:</strong> the Williams–Buckler crest artwork (and the Cedwyn Estate proposed-reconstruction arms) is adapted from Wikimedia Commons works by Sodacan, Glasshouse, Vexald, VIGNERON (after ZigeunerAlt) and 117-M-I-K-E, and is licensed CC BY-SA 4.0 (<a href="https://creativecommons.org/licenses/by-sa/4.0/">https://creativecommons.org/licenses/by-sa/4.0/</a>). The licence covers the drawing\'s copyright only; it grants no arms and does not license the device as a brand mark.',
        'Icon adapted from a People’s Collection Wales photograph; Creative Archive Licence. The Cedwyn Estate tent-and-slide icon is a cartoon drawn from <a href="https://www.peoplescollection.wales/items/871431">People’s Collection Wales item 871431</a> (Great House Farm, Llandough: a chapel Sale of Work; copyright details: Mary Godfrey). The Creative Archive Licence is non-commercial, so the icon is used on these websites only, never on merchandise or anything sold, and it is outside any Licence granted under these Master Terms.'], "2")
    s3 = clauses([
        'You may, without a Licence, read, view and browse the Materials for your own personal, non-commercial purposes, and share links to them.',
        'You may do any act the law permits without a licence, including fair dealing for non-commercial research and private study (section 29 CDPA), text and data analysis for non-commercial research (section 29A), fair dealing for criticism, review or quotation (section 30(1) and (1ZA)), fair dealing for the purpose of reporting current events (section 30(2)), and caricature, parody or pastiche (section 30A), in each case with sufficient acknowledgement. A suitable acknowledgement is: “© Williams–Buckler family, bucklerfamily.estate”.',
        'Editions priced at £0.00 may be downloaded and shared unchanged, free of charge, for non-commercial purposes.',
        'Copyright does not protect bare facts or ideas, and public court records and judgments may be read and reported by anyone. These Master Terms do not seek to restrict those freedoms. They govern your access to and use of these Materials: their expression, their compilation and arrangement, and their databases.'], "3")
    s4 = clauses([
        'Any Commercial Use of the Materials, or of the Family Story as researched, compiled and expressed in the Materials, requires a Licence obtained before the use begins.',
        'By accessing or using the Materials you agree to these Master Terms. In particular, you agree not to use the Materials as the source, research base or basis of a work about the Family Story made for Commercial Use without first obtaining a Licence, whether or not your work reproduces any part of the Materials. This undertaking is a contractual term of use of these Materials and an invitation to license. It does not give the Family any right in facts or public records beyond what the law gives.',
        'The Rights Holder was present at Tŷ Mawr in 1988 as one of the Family\'s children. Producers, publishers and authors who wish to portray identifiable members of the Family, to draw on the Family\'s first-hand accounts or private archive, or to have the Family\'s consultation, co-operation or endorsement, are invited to seek a life-story and consultancy agreement with the Rights Holder. Nothing in these Master Terms limits the rights of any member of the Family under the general law, including the law of privacy and data protection.',
        'Licences are granted, refused or priced at the Rights Holder\'s discretion. Applications are made through the <a href="/enquire/">enquiry form</a>.'], "4")
    s5 = clauses([
        'Every Licence is granted subject to these Master Terms, which prevail over any inconsistent term unless the Licence expressly provides otherwise.',
        'A Licensee may grant a Sub-licence only with the prior written consent of the Rights Holder. Every Sub-licence is derived from and subordinate to the Licensee\'s Licence and these Master Terms; may not exceed the scope, territory, media or term of the Licence; must contain terms no less protective of the Family than these Master Terms; and ends automatically when the Licence ends.',
        'Unless the Licence provides otherwise, every Licensee shall: (a) credit “Licensed by the Williams–Buckler family” in a reasonably prominent place; (b) keep accurate records of the use made and of all revenue derived from it, and account to the Rights Holder as the Licence requires; (c) present the Family\'s case as the Family\'s case, and not as a finding of any court, unless and until a court so finds; and (d) not present the Family or any of its members in a way that is false or defamatory.',
        'The Rights Holder may terminate a Licence by written notice if the Licensee commits a material breach and fails to remedy it within 14 days of notice.'], "5")
    s6 = clauses([
        'No person may copy, scrape, mine, index for training, or otherwise use the Materials to train, fine-tune, evaluate or ground an artificial-intelligence or machine-learning system for Commercial Use without a Licence.',
        'For readers and services in the European Union, the Rights Holder expressly reserves the use of the Materials for text and data mining under Article 4(3) of Directive (EU) 2019/790. This page and the robots.txt file of each site are the machine-readable reservation.',
        'Search and answer services that link back to the Materials, and non-commercial research permitted by section 29A CDPA, are not restricted by this clause.'], "6")
    s7 = ('<p class="case">Our case, prospective. Not a finding of any court.</p>' + clauses([
        'The Family asserts unextinguished equitable ownership of the land known as Parcel A at Tŷ Mawr (Great House Farm), Llandough-juxta-Penarth, and of everything on and within it; and of the items the Family asserts were removed from the home without its consent, including furniture and artefacts now held by others or by institutions.',
        'The Family\'s position is that, although it lost possession and the legal title, its equitable ownership was never extinguished. It is seeking the restoration of its property and intends to bring its case before the High Court, in the King\'s Bench Division and the Chancery Division.',
        'The Family is also researching the wider Tŷ Mawr / Cedwyn estate in Leckwith and Llandough, and reserves its position in respect of that estate.',
        'The Family records that in <em>BP Properties Ltd v Buckler</em> [1987] EWCA Civ 2 the Court of Appeal decided against the Family on possession (judgment: <a href="' + EV80 + '">Legal Wiki EV-0080</a>). That decision stands as the court\'s ruling unless and until it is set aside or overtaken.',
        'This section is a statement of the Family\'s position and of the claim it intends to pursue. It does not state or imply that any named person, company or institution has acted unlawfully.'], "7"))
    s8 = ('<div class="card">' + clauses([
        'If you hold furniture, artefacts, documents, photographs or records from Tŷ Mawr, including items the Family asserts were removed from the home without its consent, you are invited to register the item with the Family through the <a href="/enquire/">enquiry form</a>.',
        'Registration opens a conversation about one or more of: (a) recording the item and its provenance; (b) acknowledgement of the Family\'s connection with it; (c) access, photography or research; (d) a licence or acknowledgement arrangement under these Master Terms for its continued holding or display; and (e) its return.',
        'There is no charge for registering an item. Correspondence about a registered item is without prejudice to the position of either party, and registering an item is not an admission by anyone.'], "8") +
        '<p><a class="btn" href="/enquire/?type=holder">Register an item</a></p></div>')
    s9 = clauses([
        'The Materials are published openly, in the public interest, and in exercise of the right to freedom of expression (Article 10 of the European Convention on Human Rights, given effect by the Human Rights Act 1998).',
        'The Family discusses and publishes information about itself, its history and its property, including information received from public bodies, archives, museums and other institutions.',
        'Where information has been released to the Family subject to conditions, the Family reserves its position on the scope, application and enforceability of those conditions, having regard to: its asserted ownership of the items and records concerned; the rights of its members in their own personal data (Article 15 UK GDPR); the principle that information disclosed under the Freedom of Information Act 2000 is disclosed to the world; and the public interest. Any holder with a concern about a publication is invited to raise it through the <a href="/enquire/?type=correction">enquiry form</a>, and the Family will consider it promptly.',
        'The Family corrects errors of fact when they are shown to it, and logs each correction publicly.'], "9")
    s10 = clauses([
        'Use of the Materials outside clause 3 without a Licence may infringe copyright or database right and is a breach of these Master Terms. The Rights Holder reserves all rights and remedies, including an injunction, damages (including additional damages under section 97(2) CDPA) or an account of profits.',
        'Before taking any step, the Rights Holder will normally write to the person concerned and invite them to obtain a Licence.'], "10")
    s11 = clauses([
        'These Master Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes) are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction, save that a consumer keeps any mandatory protection of the law of their home country.',
        'If any provision is held invalid or unenforceable, the rest continue in force. No failure or delay in exercising a right is a waiver of it.',
        'The Rights Holder may update these Master Terms by publishing a new version on this page. The version in force when a Licence is signed applies to that Licence.',
        'Licensing contact: the <a href="/enquire/">enquiry form</a>, or <a href="mailto:licensing@bucklerfamily.estate">licensing@bucklerfamily.estate</a>. Personal contact details are not published.'], "11")
    sched = ('<table><tr><th>Surface</th><th>Address</th></tr>' + "".join(f'<tr><td>{a}</td><td>{b}</td></tr>' for a, b in [
        ("Cedwyn Estate (base camp) and e-book shop", "bucklerfamily.estate"), ("Legal Wiki", "greathousefarmwiki.wordpress.com"),
        ("Sub-domain sites", "every *.bucklerfamily.estate site linked from the Cedwyn Estate map"),
        ("GitHub", "github.com/unclehowell/BucklerFamilyFarm and the Great House Farm branches of github.com/unclehowell/datro, each carrying LICENSE and NOTICE files that refer to these Master Terms")]) + '</table>')
    body = (f'<p>These are the rights and licence terms (the <strong>Master Terms</strong>) for the research, records, writing, images, games, books, sites and code published by the Williams–Buckler family about Tŷ Mawr (Great House Farm). Everyone may read them free. Anyone who wants to profit from them, or from the Family Story told in them, needs a licence first.</p>'
            f'<p><a class="btn" href="/enquire/?type=licence">Apply for a licence</a></p>{toc}'
            f'<h2 id="definitions">1. Definitions</h2>{s1}<h2 id="rights">2. Rights in the Materials</h2>{s2}'
            f'<h2 id="permitted">3. What you may do without a licence</h2>{s3}<h2 id="commercial">4. Commercial use, story and life rights</h2>{s4}'
            f'<h2 id="master">5. Master Terms and sub-licences</h2>{s5}<h2 id="ai">6. Artificial intelligence and data mining</h2>{s6}'
            f'<h2 id="position">7. The Family\'s position on Parcel A and the estate</h2>{s7}<h2 id="holders">8. Holders of estate items</h2>{s8}'
            f'<h2 id="public-interest">9. Public interest</h2>{s9}<h2 id="remedies">10. Remedies</h2>{s10}<h2 id="general">11. General</h2>{s11}'
            f'<h2 id="schedule">Schedule: sites and repositories</h2>{sched}')
    return page("licence", "Rights and licence terms", "Copyright, database right, story and life rights, and the licence required for any commercial use of the Williams–Buckler family's Tŷ Mawr materials.", body, "Rights")

def privacy():
    s = clauses([
        '<strong>Who we are.</strong> The data controller for these sites is ' + CO + ' (<strong>“DATRO”</strong>, <strong>“we”</strong>), which publishes the Great House Farm (Tŷ Mawr) sites for the Williams–Buckler family. Contact: <a href="mailto:privacy@bucklerfamily.estate">privacy@bucklerfamily.estate</a> or the <a href="/enquire/?type=privacy">enquiry form</a>.',
        '<strong>Scope.</strong> This policy covers bucklerfamily.estate and its sub-domains, the e-book shop and the enquiry form. The Legal Wiki on WordPress.com is also subject to WordPress.com\'s own privacy policy. Our <a href="/ai-policy/">AI use and provenance policy</a> (section 5) and our <a href="/legal/">terms of sale</a> say more about AI and orders, and are consistent with this policy.',
        '<strong>What we collect and why.</strong><table><tr><th>Data</th><th>Purpose</th><th>Lawful basis (UK GDPR Art 6)</th><th>Kept for</th></tr>'
        '<tr><td>Enquiry form: name, organisation, email, the item or use, your message</td><td>To answer you, and to discuss a licence or an estate item</td><td>Steps at your request before a contract (6(1)(b)); legitimate interests in answering and keeping a record (6(1)(f))</td><td>2 years after the matter closes; longer only if needed for a legal claim</td></tr>'
        '<tr><td>£0.00 e-book and updates: email, first name</td><td>To send the book and updates you asked for</td><td>Consent (6(1)(a); PECR reg 22)</td><td>Until you unsubscribe</td></tr>'
        '<tr><td>Orders: name, email, country, what you bought</td><td>To supply the e-book or item and keep tax records</td><td>Contract (6(1)(b)); legal obligation (6(1)(c))</td><td>6 years</td></tr>'
        '<tr><td>Technical data: IP address, browser, pages requested</td><td>Security, abuse prevention and cookie-free visit counts</td><td>Legitimate interests (6(1)(f))</td><td>Short-lived logs at our hosting provider; the enquiry form keeps only a one-way hash of your IP address</td></tr>'
        '<tr id="comments"><td>Comments on the farm album (fb.bucklerfamily.estate): the name you choose to give (optional), your comment, the post it is on, the time</td><td>To show moderated comments under each post</td><td>Legitimate interests (6(1)(f)) in hosting a moderated public discussion</td><td>Waiting comments until moderated (rejected ones are deleted at once); approved comments while the post is online, or until you ask us to remove one. No email and no IP address are stored; to stop flooding, a one-way code made from your connection, which changes every day, is kept for up to 24 hours. Stored with Cloudflare (R2).</td></tr></table>',
        '<strong>People named in the records.</strong> The sites publish historical records, court judgments and correspondence about Tŷ Mawr. Where these contain personal data, we publish them for journalistic, academic and historical purposes and in the public interest (Data Protection Act 2018, Schedule 2, Part 5, paragraph 26, and Article 89 UK GDPR). We remove personal contact details, and we will consider any request to correct, restrict or remove personal data about you.',
        '<strong>Who we share it with.</strong> Our processors: Cloudflare (hosting, security, the enquiry database and email routing), our email provider (to read enquiries), Stripe and Gumroad (payments), Mailchimp (email updates), WordPress.com (the Legal Wiki) and AI model providers that process case records (not customer lists). We do not sell personal data. Several processors are in the United States; transfers rely on the UK Extension to the EU–US Data Privacy Framework, the UK International Data Transfer Addendum or Standard Contractual Clauses, as each offers.',
        '<strong>Automated decisions.</strong> We make no decision about you based solely on automated processing that has legal or similarly significant effects (Article 22 UK GDPR), and we do not use AI to profile you.',
        '<strong>Your rights.</strong> You may ask for access to, correction or erasure of your personal data, restriction of or objection to its use, and a portable copy, and you may withdraw consent at any time. Write to <a href="mailto:privacy@bucklerfamily.estate">privacy@bucklerfamily.estate</a>. We answer within one month.',
        '<strong>Complaints.</strong> Please tell us first, so we can put it right. You may also complain to the Information Commissioner\'s Office: <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk/make-a-complaint</a>, telephone 0303 123 1113, Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF.',
        '<strong>Children.</strong> These sites are not directed at children under 13, and we do not knowingly collect their data.',
        '<strong>Changes.</strong> We publish any change on this page with a new version number.'], "P")
    return page("privacy", "Privacy policy", "How DATRO CONSORTIUM LIMITED handles personal data on the Great House Farm (Tŷ Mawr) sites: UK GDPR and the Data Protection Act 2018.", s)

def cookies():
    s = ('<p>The Privacy and Electronic Communications Regulations 2003 (PECR) require consent before a website stores or reads non-essential information on your device. These sites set no advertising or tracking cookies, so there is no cookie banner.</p>'
         '<table><tr><th>What</th><th>Where</th><th>Why</th><th>Consent needed?</th></tr>'
         '<tr><td>Cloudflare security cookies (for example <code>__cf_bm</code>, <code>cf_clearance</code>)</td><td>All sites</td><td>Bot and attack protection</td><td>No: strictly necessary (PECR reg 6(4))</td></tr>'
         '<tr><td>Browser storage for your settings (language, the Cedwyn Estate link, game progress such as the sudoku)</td><td>Sites you use them on</td><td>Remembers a choice you made or a game you started</td><td>No: needed for the feature you asked for; nothing is sent to us</td></tr>'
         '<tr><td>Visit counts</td><td>All sites</td><td>Cloudflare\'s cookie-free analytics</td><td>No cookie is set</td></tr>'
         '<tr><td>Stripe cookies</td><td>Stripe\'s own checkout pages only</td><td>Payment and fraud prevention</td><td>Set by Stripe under its own policy</td></tr></table>'
         '<p>If we ever add an advertising or social-media pixel, it will load only after you agree in a cookie banner, and this page will list it. You can clear cookies and site storage at any time in your browser settings.</p>'
         '<p>Questions: see the <a href="/privacy/">privacy policy</a>.</p>')
    return page("cookies", "Cookie notice", "Cookies and device storage on the Great House Farm (Tŷ Mawr) sites, under PECR.", s)

def terms():
    s = clauses([
        '<strong>Who runs these sites.</strong> The Great House Farm (Tŷ Mawr) sites are published by ' + CO + ', for the Williams–Buckler family. By using them you agree to these terms of use. Purchases are also governed by our <a href="/legal/">terms of sale</a>.',
        '<strong>Rights in the content.</strong> The content is protected by copyright and database right. Your use of it is governed by our <a href="/licence/">rights and licence terms</a>, which form part of these terms. In short: read, share links and quote fairly with credit; any commercial use needs a licence first.',
        '<strong>Acceptable use.</strong> You must not: use the sites unlawfully; attempt to gain unauthorised access to them or to any system behind them; introduce malicious code; scrape or bulk-download content except as the licence terms allow; or use the enquiry form to send spam, abuse or unlawful material.',
        '<strong>Nature of the content.</strong> The sites present the Family\'s case and the records it rests on. Our case, prospective. Not a finding of any court. Nothing on the sites is legal, financial or professional advice. See the <a href="/disclaimer/">disclaimer</a>.',
        '<strong>Availability and changes.</strong> We may change, suspend or withdraw any site or content at any time. We do not promise the sites will be uninterrupted or free of errors.',
        '<strong>Links.</strong> Links to other sites are provided for information. We are not responsible for their content.',
        '<strong>Liability.</strong> Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or any other liability that cannot be excluded by law, or affects your statutory rights as a consumer under the Consumer Rights Act 2015. Subject to that, we are not liable for any loss arising from use of the free content of the sites, and for business users our total liability is limited to £100.',
        '<strong>Corrections and complaints.</strong> Use the <a href="/enquire/?type=correction">enquiry form</a>. We correct errors of fact and log each correction.',
        '<strong>Law.</strong> These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction; a consumer keeps the mandatory protections and courts of their home country.'], "T")
    return page("terms", "Terms of use", "Terms of use for the Great House Farm (Tŷ Mawr) sites.", s)

def disclaimer():
    s = clauses([
        '<strong>Not legal advice.</strong> The sites, books and games set out the Williams–Buckler family\'s case and the records it rests on. They are not legal advice. Anyone with a legal problem of their own should consult a qualified solicitor.',
        '<strong>Our case, not a finding.</strong> Theories, timelines, questions and assessments on the sites are the Family\'s case. Our case, prospective. Not a finding of any court. Where a court has decided a point, we say so and cite the decision, including <em>BP Properties Ltd v Buckler</em> [1987] EWCA Civ 2.',
        '<strong>Questions, not accusations.</strong> We describe what the records show and ask questions. We do not state that any named living person, company or public body has committed a crime or acted unlawfully, unless a court has so found and we cite the finding.',
        '<strong>Accuracy.</strong> We aim to cite a record for every statement of fact and to mark anything not yet sourced as pending. Records can be incomplete, and errors happen. Tell us through the <a href="/enquire/?type=correction">enquiry form</a> and we will correct and log it.',
        '<strong>Historic material.</strong> Historic photographs, documents and press cuttings are shown as found, with their source. Their copyright may belong to others.',
        '<strong>AI assistance.</strong> The sites are compiled with an AI agent, “Sion\'s Tab agent”, under human direction. See our <a href="/ai-policy/">AI use and provenance policy</a>.',
        '<strong>External links.</strong> We do not control and are not responsible for other sites we link to.'], "D")
    return page("disclaimer", "Disclaimer", "Disclaimer for the Great House Farm (Tŷ Mawr) sites: not legal advice; our case, not a finding of any court.", s)

def accessibility():
    s = ('<p>We want everyone to be able to use the Great House Farm (Tŷ Mawr) sites. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA, and we check new pages on a 390-pixel phone screen and by keyboard.</p>'
         '<h2>What works</h2><ul><li>Text can be enlarged to 200% without loss of content on our standard pages.</li><li>Colour pairs for each site were chosen to pass WCAG AA contrast.</li><li>Pages can be navigated by keyboard, and form fields have labels.</li><li>A language switcher offers English, Welsh and Spanish on most sites.</li></ul>'
         '<h2>Known limitations</h2><ul><li>The 3D walk at /3d/ is a visual experience and is not usable with a screen reader. The 2D map and the list of stops on the Cedwyn Estate map give the same links.</li><li>The chessboard and the sudoku rely on visual layout; each square\'s full text is available in its “Read more” window.</li><li>Some scanned documents and press cuttings are images. Where we have a transcription, it is on the same page.</li><li>Older PDF e-books may not be fully tagged for screen readers.</li><li>The Legal Wiki runs on WordPress.com, whose theme we do not fully control.</li></ul>'
         '<h2>Feedback and alternative formats</h2><p>If you cannot use part of a site, or need content in another format, tell us through the <a href="/enquire/?type=accessibility">enquiry form</a>. We aim to reply within 10 working days.</p>'
         '<h2>Enforcement</h2><p>We are a private organisation with duties under the Equality Act 2010. If you are not happy with our response, you can contact the <a href="https://www.equalityadvisoryservice.com/">Equality Advisory and Support Service (EASS)</a>.</p>'
         '<p class="small">This statement was prepared on 20 October 2026 from our own checks; it has not been independently audited.</p>')
    return page("accessibility", "Accessibility statement", "Accessibility statement for the Great House Farm (Tŷ Mawr) sites (WCAG 2.2 AA aim).", s)

def enquire():
    s = ('<p>Use this form to apply for a licence to use the Family\'s materials or story, to register an item from Tŷ Mawr that you hold, or to contact us about a correction, privacy or accessibility. Enquiries go to the Family\'s rights team. Personal contact details are not published.</p>'
         '<div id="m" class="msg" role="status" aria-live="polite"></div>'
         '<form id="f" class="card" method="post" action="/enquire/api/submit" novalidate>'
         '<label for="type">What is your enquiry about?</label><select id="type" name="type" required>'
         '<option value="licence">A licence to use the materials or the Family Story (book, film, TV, podcast, article, AI and similar)</option>'
         '<option value="holder">I hold furniture, an artefact or records from Tŷ Mawr</option>'
         '<option value="media">Press or media</option><option value="correction">A correction or a concern about something published</option>'
         '<option value="privacy">Privacy or my personal data</option><option value="accessibility">Accessibility</option><option value="other">Something else</option></select>'
         '<label for="name">Your name</label><input id="name" name="name" type="text" autocomplete="name" maxlength="120" required>'
         '<label for="org">Organisation (optional)</label><input id="org" name="org" type="text" autocomplete="organization" maxlength="160">'
         '<label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="200" required>'
         '<label for="item">The item you hold, or the use you propose</label><input id="item" name="item" type="text" maxlength="300" placeholder="e.g. oak dresser from the farmhouse; documentary for broadcast">'
         '<label for="message">Message</label><textarea id="message" name="message" maxlength="5000" required></textarea>'
         '<div class="hp" aria-hidden="true"><label for="website">Leave this empty</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>'
         '<input type="hidden" name="ts" id="ts" value="">'
         '<label class="c"><input type="checkbox" id="consent" name="consent" value="yes" required><span>I agree that DATRO CONSORTIUM LIMITED may store and use these details to answer my enquiry, as set out in the privacy notice below.</span></label>'
         '<button class="btn" type="submit" id="go">Send enquiry</button></form>'
         '<h2 id="privacy-notice">Privacy notice for this form</h2><p class="small">Controller: DATRO CONSORTIUM LIMITED (company 13775817). We use your name, organisation, email and message only to answer your enquiry and, where relevant, to discuss a licence or an item. Lawful basis: steps you ask us to take before a contract, and our legitimate interest in answering and keeping a record (UK GDPR Art 6(1)(b) and (f)). Your enquiry is stored in our Cloudflare database and forwarded to the Family\'s mailbox; we keep only a one-way hash of your IP address, to stop abuse. We keep enquiries for 2 years after the matter closes. You can ask for access, correction or erasure at any time. Full details and how to complain to the ICO: <a href="/privacy/">privacy policy</a>.</p>'
         '<p class="small">Sending an enquiry does not create a licence or any obligation on either side. Correspondence about items is without prejudice. See the <a href="/licence/">rights and licence terms</a>.</p>'
         """<script>(function(){var f=document.getElementById('f'),m=document.getElementById('m'),ts=document.getElementById('ts');ts.value=String(Date.now());
var q=new URLSearchParams(location.search),t=q.get('type');if(t){var s=document.getElementById('type');for(var i=0;i<s.options.length;i++)if(s.options[i].value===t)s.selectedIndex=i;}
if(q.get('sent')==='1'){m.className='msg ok';m.textContent='Thank you. Your enquiry has been received and will be answered by email.';}
function show(ok,txt){m.className='msg '+(ok?'ok':'err');m.textContent=txt;m.scrollIntoView({behavior:'smooth',block:'center'});}
f.addEventListener('submit',function(e){e.preventDefault();if(!f.checkValidity()){f.reportValidity();return;}
var b=document.getElementById('go');b.disabled=true;b.textContent='Sending…';var d={};new FormData(f).forEach(function(v,k){d[k]=v;});
fetch('/enquire/api/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(d)}).then(function(r){return r.json().then(function(j){return [r.ok,j];});})
.then(function(a){if(a[0]&&a[1].ok){f.reset();ts.value=String(Date.now());show(true,'Thank you. Your enquiry has been received (reference '+(a[1].ref||'')+') and will be answered by email.');}else{show(false,(a[1]&&a[1].error)||'Sorry, that did not send. Please try again.');}})
.catch(function(){show(false,'Sorry, that did not send. Please check your connection and try again.');}).then(function(){b.disabled=false;b.textContent='Send enquiry';});});})();</script>""")
    return page("enquire", "Licensing and estate-item enquiries", "Apply for a licence to use the Williams–Buckler family's Tŷ Mawr materials, or register an item from Tŷ Mawr that you hold.", s, "Enquire")

if __name__ == "__main__":
    for fn in (licence, privacy, cookies, terms, disclaimer, accessibility, enquire):
        print(fn())
