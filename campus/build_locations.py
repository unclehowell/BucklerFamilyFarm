#!/usr/bin/env python3
"""Cedwyn Estate locations, part of campus/build_basecamp.py (imported and run by it; can also run on its own).

Sion, 21:43 BST 20 Oct 2026: on first visit bucklerfamily.estate asks where to go: Great House Farm, Llandough, Wales
(a guided virtual-reality tour) / Great House Farm II, Cedwyn Estate, Puerto Madryn, Patagonia (a planned replica with a
wax museum, weddings, stables and a B&B) / Cyberspace (all the digital sites). A WALES / PATAGONIA / CYBERSPACE toggle
sits at the top of every page.

Source of truth: campus/locations.json (strings EN + CY/ES, prices, Stripe links, hues, credits) and
campus/basecamp_stops.json (the site list for Cyberspace). Writes:
  public/ghf-lang/locations.js            chooser overlay + location strip (loaded by basecamp.js on every site, and by
                                          the root and /1d/ pages, which carry their own header)
  public/ghf-lang/sites/locations.json    EN/CY/ES strings for ghf-lang.js (data-site="locations")
  public/choose/ public/wales/ public/wales/vouchers/terms/ public/wales/vouchers/thank-you/
  public/patagonia/ public/cyberspace/    the pages
and adds one <script> tag to the generated root index.html and public/1d/index.html (idempotent).
Forms post to /visit/api/* (Worker cedwyn-visit, KV storage; source in Tab's work/visit/worker).   — Sion's Tab agent
"""
import json, os, html, re
HERE = os.path.dirname(os.path.abspath(__file__))
E = html.escape
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
MKEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

CSS = """
*{box-sizing:border-box}html,body{margin:0;background:#000;color:#fff}
body{font:300 17px/1.6 Barlow,"Helvetica Neue",Arial,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:#fff}img{max-width:100%;height:auto;display:block}
.wrap{max-width:780px;margin:0 auto;padding:0 20px}
.hero{position:relative;min-height:78vh;display:flex;align-items:flex-end;padding:90px 0 44px;background:#000 center/cover no-repeat;overflow:hidden}
.hero:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0,rgba(0,0,0,.55) 45%,#000 100%)}
.hero .wrap{position:relative;width:100%}
.kick{font-size:11.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--ghf-s,#f2c94c);margin:0 0 14px;font-weight:500}
h1{font-weight:300;font-size:clamp(34px,9vw,64px);letter-spacing:.08em;text-transform:uppercase;line-height:1.05;margin:0 0 14px}
h2{font-weight:300;font-size:clamp(22px,5.6vw,32px);letter-spacing:.08em;text-transform:uppercase;line-height:1.2;margin:0 0 18px}
h3{font-weight:500;font-size:15px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 8px}
.lede{font-size:19px;max-width:560px;margin:0 0 20px;color:#e6e6e6}
.soon{display:inline-block;border:1px solid var(--ghf-s,#f2c94c);color:var(--ghf-s,#f2c94c);padding:5px 12px;font-size:11.5px;letter-spacing:.24em;text-transform:uppercase;margin:0 0 22px}
.btns{display:flex;flex-wrap:wrap;gap:10px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 22px;border:1px solid #fff;color:#fff;background:transparent;text-decoration:none;font:500 12.5px/1 Barlow,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;border-radius:0}
.btn:hover,.btn:focus-visible{background:#fff;color:#000}
.btn.solid{background:#fff;color:#000}.btn.solid:hover{background:var(--ghf-s,#f2c94c);border-color:var(--ghf-s,#f2c94c)}
section.s{padding:56px 0;border-top:1px solid rgba(255,255,255,.12)}
p{margin:0 0 16px}.muted{color:#a9a9a9;font-size:14.5px}
ul.ticks{list-style:none;padding:0;margin:0 0 18px}ul.ticks li{padding:9px 0;border-bottom:1px solid rgba(255,255,255,.1);letter-spacing:.06em}
ul.ticks li:before{content:"";display:inline-block;width:7px;height:7px;background:var(--ghf-s,#f2c94c);margin:0 12px 2px 0}
.gal{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0 6px}.gal img{width:100%;height:auto;aspect-ratio:1/1;object-fit:cover}
.gal figure,.fig{margin:0}.fig img{width:100%;height:auto}figcaption{font-size:12.5px;color:#9a9a9a;margin:6px 0 0;letter-spacing:.02em}
.cards{display:grid;grid-template-columns:1fr;gap:12px}@media(min-width:620px){.cards{grid-template-columns:1fr 1fr}}
.card{border:1px solid rgba(255,255,255,.22);padding:22px 20px;display:flex;flex-direction:column;gap:8px;text-decoration:none;color:#fff}
a.card:hover,a.card:focus-visible{border-color:var(--ghf-s,#f2c94c)}
.card .price{font-size:30px;font-weight:300;letter-spacing:.04em}.card p{margin:0;color:#cfcfcf;font-size:15.5px}
.card .go{margin-top:auto;padding-top:10px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--ghf-s,#f2c94c)}
form.enq{display:grid;gap:14px;max-width:560px}
form.enq label{display:grid;gap:6px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#cfcfcf}
form.enq input,form.enq select,form.enq textarea{font:400 16px/1.4 Barlow,Arial,sans-serif;color:#fff;background:#0b0b0b;border:1px solid rgba(255,255,255,.35);border-radius:0;padding:12px;width:100%}
form.enq select option{color:#000}
form.enq input:focus,form.enq select:focus,form.enq textarea:focus{outline:none;border-color:var(--ghf-s,#f2c94c)}
form.enq .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
form.enq .tick{display:flex;gap:10px;align-items:flex-start;text-transform:none;letter-spacing:0;font-size:14.5px;color:#d8d8d8}
form.enq .tick input{width:20px;height:20px;margin:2px 0 0;flex:0 0 auto;accent-color:var(--ghf-s,#f2c94c)}
.hp{position:absolute!important;left:-5000px!important;width:1px;height:1px;overflow:hidden}
.note{padding:14px 16px;border:1px solid var(--ghf-s,#f2c94c);display:none}.note.on{display:block}.note.bad{border-color:#ff6b6b}
.src{font-size:13.5px;color:#a9a9a9}.src a{color:#cfcfcf}.src li{margin:0 0 6px}
.chg{display:inline-block;margin:26px 0 0;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#bdbdbd}
#lang-slot{position:absolute;top:14px;right:14px;z-index:3}
details.site{border-bottom:1px solid rgba(255,255,255,.14)}details.site summary{list-style:none;cursor:pointer;padding:14px 0;display:flex;gap:12px;align-items:center;letter-spacing:.08em;text-transform:uppercase;font-size:14px}
details.site summary::-webkit-details-marker{display:none}details.site summary .dot{width:10px;height:10px;border-radius:50%;flex:0 0 auto}
details.site summary:after{content:"+";margin-left:auto;font-size:20px;color:#9a9a9a}details.site[open] summary:after{content:"–"}
details.site .d{padding:0 0 16px 22px;color:#cfcfcf;font-size:15.5px}details.site .d a{color:var(--ghf-s,#f2c94c);letter-spacing:.14em;text-transform:uppercase;font-size:12px;text-decoration:none}
.views{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.views .btn{padding:0 8px}
.terms h2{margin-top:30px}.terms li{margin:0 0 10px}
"""

def head(title, desc, canon, img, site="locations", extra=""):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{canon}">
<meta property="og:site_name" content="Cedwyn Estate">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="https://bucklerfamily.estate{img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#000000">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/barlow-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/ghf-lang/ghf-theme.css?v=2.0.3" data-ghf-theme>
<style>
@font-face{{font-family:"Barlow";font-weight:300;font-display:swap;src:url(/fonts/barlow-latin-300-normal.woff2) format("woff2")}}
@font-face{{font-family:"Barlow";font-weight:400;font-display:swap;src:url(/fonts/barlow-latin-400-normal.woff2) format("woff2")}}
@font-face{{font-family:"Barlow";font-weight:500 700;font-display:swap;src:url(/fonts/barlow-latin-700-normal.woff2) format("woff2")}}
{CSS}
</style>
{extra}
<script src="https://bucklerfamily.estate/ghf-lang/ghf-lang.js?v=2.0.3" data-site="{site}" defer></script>
<script src="https://bucklerfamily.estate/ghf-lang/ghf-boot.js?v=2.0.3"></script>
</head>
"""

FORM_JS = r"""<script>
(function(){
  var f=document.querySelectorAll("form.enq");
  for(var i=0;i<f.length;i++)(function(form){
    var ts=form.querySelector("[name=ts]"); if(ts) ts.value=String(Date.now());
    form.addEventListener("submit",function(ev){
      ev.preventDefault();
      var ok=form.querySelector(".note.ok"),bad=form.querySelector(".note.bad"),btn=form.querySelector("button[type=submit]");
      ok.classList.remove("on");bad.classList.remove("on");
      if(!form.checkValidity()){form.reportValidity();return;}
      var d={};new FormData(form).forEach(function(v,k){d[k]=v;});
      d.lang=(document.documentElement.getAttribute("lang")||"en").slice(0,2);
      var label=btn.textContent;btn.disabled=true;btn.textContent=btn.getAttribute("data-busy")||"…";
      fetch(form.action,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(d)})
        .then(function(r){return r.json().catch(function(){return {ok:false};});})
        .then(function(j){
          btn.disabled=false;btn.textContent=label;
          if(j&&j.ok){form.reset();if(ts)ts.value=String(Date.now());ok.classList.add("on");var rf=ok.querySelector(".ref");if(rf)rf.textContent=j.ref||"";ok.scrollIntoView({block:"center",behavior:"smooth"});}
          else{bad.classList.add("on");var m=bad.querySelector(".msg");if(m&&j&&j.error)m.textContent=j.error;}
        })
        .catch(function(){btn.disabled=false;btn.textContent=label;bad.classList.add("on");});
    });
  })(f[i]);
  // a plain (no-script) post comes back with ?sent=1 or 0
  var m=/[?&]sent=([01])/.exec(location.search);
  if(m){var n=document.querySelector(m[1]==="1"?".note.ok":".note.bad");if(n)n.classList.add("on");}
  // offer buttons pre-select the form's interest
  var ob=document.querySelectorAll("[data-offer]");
  for(var k=0;k<ob.length;k++)ob[k].addEventListener("click",function(){var s=document.querySelector("form.enq select[name=offer]");if(s)s.value=this.getAttribute("data-offer");});
})();
</script>"""

def form(cfg, loc, offers, month_label):
    opts = "".join(f'<option value="{k}">{E(v)}</option>' for k, v in offers)
    months = '<option value="any">Any month</option>' + "".join(f'<option value="{k}">{m}</option>' for k, m in zip(MKEYS, MONTHS))
    sel = f'<label>What are you interested in?<select name="offer">{opts}</select></label>' if len(offers) > 1 else f'<input type="hidden" name="offer" value="{offers[0][0]}">'
    return f"""<form class="enq" method="post" action="{cfg['endpoint']}enquiry" novalidate>
<input type="hidden" name="loc" value="{loc}"><input type="hidden" name="ts" value="">
{sel}
<label>Your name<input name="name" autocomplete="name" required maxlength="120"></label>
<label>Email<input name="email" type="email" autocomplete="email" required maxlength="160"></label>
<label>Phone (optional)<input name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="40" placeholder="Only if you would like a call back"></label>
<div class="row"><label>Group size<input name="group" type="number" min="1" max="500" value="2" inputmode="numeric"></label>
<label>{month_label}<select name="month">{months}</select></label></div>
<label>Message (optional)<textarea name="message" rows="4" maxlength="2000"></textarea></label>
<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
<label class="tick"><input type="checkbox" name="callback" value="yes"><span>Yes, I'd like a call back. The call may be made by an AI assistant on behalf of the Great House Farm team.</span></label>
<label class="tick"><input type="checkbox" name="consent" value="1" required><span>I agree that Cedwyn Estate may store this enquiry and email me about it.</span></label>
<p class="muted">We keep your details and enquiry to reply to you (your phone number only to call you back, if you ask), for up to 2 years; a copy goes to our AI assistant, which helps with replies and call-backs. To have them deleted, email sales@bucklerfamily.estate. <a href="/privacy/#visits">Privacy notice</a></p>
<div><button class="btn solid" type="submit" data-busy="Sending…">Send</button></div>
<div class="note ok" role="status"><span>Thank you. Your interest is registered. We will email you when there is news.</span> <span class="muted">Reference</span> <b class="ref"></b></div>
<div class="note bad" role="alert"><span class="msg">That did not send. Please check the form and try again, or email sales@bucklerfamily.estate.</span></div>
</form>"""

def credit(c):
    return f'<a href="{c["url"]}" rel="noopener">{E(c["title"])}</a>, {E(c["author"])}, {E(c["licence"])}'

def sources(lst):
    return "<ul class=\"src\">" + "".join(f'<li><a href="{s["url"]}" rel="noopener">{E(s["text"])}</a></li>' for s in lst) + "</ul>"

def page_wales(cfg):
    C = cfg["credits"]
    vc = "".join(f"""<div class="card"><h3>{E(v['label'])}</h3><div class="price">£{v['pence']/100:.2f}</div>
<a class="btn solid" href="{v['url']}" rel="noopener">Buy voucher</a></div>""" for v in cfg["vouchers"])
    body = f"""<body>
<main>
<header class="hero" style="background-image:url(/locations-img/album-098.webp)"><span id="lang-slot"></span><div class="wrap">
<p class="kick">Wales · Llandough, Vale of Glamorgan</p>
<h1>Great House Farm</h1>
<p class="lede">Cedwyn Estate · Tŷ Mawr. A guided tour in virtual reality.</p>
<span class="soon">Coming soon</span>
<div class="btns"><a class="btn solid" href="#enquire">Register interest</a><a class="btn" href="#vouchers">Gift vouchers</a></div>
</div></header>
<section class="s"><div class="wrap">
<h2>The tour</h2>
<p>Great House Farm (Tŷ Mawr) stood in Llandough, near Penarth. The farmhouse and its yard are being rebuilt in virtual reality from the family album, survey plans and archive records.</p>
<p>Guests will wear a VR headset and walk the house and yard with a guide who tells its story.</p>
<ul class="ticks"><li>Guided small groups</li><li>VR headsets provided</li><li>Dates, times and prices to be announced</li></ul>
<p>Tickets are not on sale yet. Register your interest and you will hear first when booking opens.</p>
<div class="gal"><figure><img src="/locations-img/album-101.webp" alt="Great House Farm farmhouse, side and porch" loading="lazy" width="660" height="660"></figure>
<figure><img src="/locations-img/album-128.webp" alt="The stable range at Great House Farm" loading="lazy" width="640" height="660"></figure></div>
<p class="muted">The farmhouse, from the family album</p>
</div></section>
<section class="s"><div class="wrap">
<h2>Next door to history: Marconi, May 1897</h2>
<p>In May 1897 Guglielmo Marconi and William Preece, engineer-in-chief of the Post Office, tested wireless telegraphy across the Bristol Channel at Lavernock Point, about 5 km south of Llandough.</p>
<p>Signals crossed open sea from Flat Holm island to Lavernock, and on 18 May from Lavernock to Brean Down in Somerset. A plaque at St Lawrence’s church, Lavernock, marks the trials.</p>
<p>The tour will tell this story beside the farm’s own.</p>
<figure class="fig"><img src="/locations-img/marconi-1897.webp" alt="Post Office engineers with wireless equipment on Flat Holm, May 1897" loading="lazy" width="1400" height="966"><figcaption><span>Post Office engineers at the wireless trials, Flat Holm, May 1897</span> · {credit(C['marconi-1897'])}</figcaption></figure>
<figure class="fig" style="margin-top:14px"><img src="/locations-img/flat-holm.webp" alt="Flat Holm island seen from the beach at Lavernock" loading="lazy" width="1400" height="934"><figcaption><span>Flat Holm from Lavernock</span> · {credit(C['flat-holm'])}</figcaption></figure>
<h3 style="margin-top:22px">Sources</h3>{sources(cfg['sources']['marconi'])}
</div></section>
<section class="s" id="vouchers"><div class="wrap">
<h2>Gift vouchers</h2>
<p>Give a place on the tour. Each voucher can be exchanged for tour tickets when tours open.</p>
<div class="cards">{vc}</div>
<p class="muted" style="margin-top:16px">Valid 24 months. Full refund on request if tours have not opened within 12 months. 14-day right to cancel.</p>
<p class="muted">Stripe emails your receipt at once. Your voucher code follows by email within 2 working days.</p>
<p><a href="/wales/vouchers/terms/">Voucher terms</a></p>
</div></section>
<section class="s" id="enquire"><div class="wrap">
<h2>Register interest in the tour</h2>
{form(cfg, "wales", [("tour", "Wales: guided virtual tour (Llandough)")], "Preferred month")}
<a class="chg" href="/choose/">Change location</a>
<p class="src" style="margin-top:22px"><span>Photo credits</span>: {credit(C['album'])}.</p>
</div></section>
</main>
{FORM_JS}
</body>
</html>
"""
    return head("Great House Farm, Llandough · Virtual tour · Cedwyn Estate", "Cedwyn Estate, Wales: a guided virtual-reality tour of Great House Farm (Tŷ Mawr), Llandough. Coming soon. Register interest or buy a gift voucher.", "https://bucklerfamily.estate/wales/", "/locations-img/album-098.webp") + body


PATAGONIA_EXTRA_STYLE = """<style>
.status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:22px 0 0}.status-item{border:1px solid rgba(255,255,255,.24);padding:13px;background:rgba(0,0,0,.5)}.status-item b{display:block;color:#9ad0f5;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px}.status-item span{display:block;font-size:14px;line-height:1.4}
.estate-plan{border:1px solid rgba(255,255,255,.2);padding:8px;background:#101820}.estate-plan svg{display:block;width:100%;height:auto}.eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#9ad0f5}.step-grid{display:grid;grid-template-columns:1fr;gap:12px}.step-card{padding:16px;border:1px solid rgba(255,255,255,.2)}.step-card h3{margin-bottom:8px}.step-card p{font-size:14.5px;color:#d1d1d1;margin:0}.disclaimer{border:1px solid rgba(154,208,245,.6);padding:14px;color:#e5e0d1;font-size:14px}
@media(min-width:640px){.status-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.step-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>"""

PATAGONIA_LAND_SECTION = """<section class="s" id="estate-plan"><div class="wrap"><p class="eyebrow">The grounds · concept masterplan</p><h2>A manor house within a whole estate</h2><p>The aim is to restore the relationship between the house, yard, garden, orchard, paths and working land—not just reproduce a façade.</p>
<figure class="estate-plan"><svg viewBox="0 0 760 290" role="img" aria-labelledby="p-title p-desc" xmlns="http://www.w3.org/2000/svg"><title id="p-title">Illustrative Cedwyn Estate museum landscape</title><desc id="p-desc">Not-to-scale concept showing a farmhouse museum, garden, orchard, visitor welcome and paths. Not a survey or selected site.</desc><rect x="4" y="4" width="752" height="282" rx="8" fill="#101820" stroke="#63747e" stroke-width="2"/><path d="M20 28Q120 2 213 28T390 26T570 25T742 30L735 55Q635 47 555 60T385 55T210 61T20 55Z" fill="#234b43" stroke="#4e8174"/><path d="M30 230Q115 203 230 237T420 230T730 240" fill="none" stroke="#9ad0f5" stroke-width="2" stroke-dasharray="7 7"/><path d="M65 80Q180 62 257 76T390 77T580 72T710 94L700 210Q595 228 520 215T367 225T210 218T75 190Z" fill="none" stroke="#f2c94c" stroke-width="3" stroke-dasharray="10 7"/><path d="M82 105l130-10 22 52-20 42-95 8-44-35Z" fill="#3b6b54" stroke="#82a98c" stroke-width="2"/><text x="146" y="145" fill="#edf7ee" font-size="16" text-anchor="middle">Garden</text><text x="146" y="164" fill="#c9e3d0" font-size="12" text-anchor="middle">kitchen plot</text><path d="M545 82l104-4 27 38-13 43-94 8-36-32Z" fill="#375a47" stroke="#82a98c" stroke-width="2"/><g fill="#75aa7b" stroke="#c4dfad"><circle cx="575" cy="107" r="8"/><circle cx="604" cy="100" r="8"/><circle cx="632" cy="111" r="8"/><circle cx="572" cy="132" r="8"/><circle cx="602" cy="129" r="8"/><circle cx="630" cy="137" r="8"/></g><text x="604" y="182" fill="#edf7ee" font-size="15" text-anchor="middle">Orchard</text><rect x="290" y="92" width="170" height="96" rx="5" fill="#3c4f58" stroke="#9ad0f5" stroke-width="3"/><rect x="309" y="110" width="132" height="60" fill="#8d785e" stroke="#e5d4b5" stroke-width="2"/><path d="M298 111l77-38 77 38" fill="#6e3d34" stroke="#d49a82" stroke-width="3"/><path d="M357 170v-28h38v28" fill="#25343b" stroke="#e7d8b6" stroke-width="2"/><text x="375" y="208" fill="#fff4d1" font-size="16" text-anchor="middle">Tŷ Mawr museum</text><rect x="478" y="190" width="96" height="36" rx="4" fill="#293d47" stroke="#9ad0f5" stroke-width="2"/><text x="526" y="212" fill="#f1f7fc" font-size="12" text-anchor="middle">Welcome &amp; shop</text><path d="M375 262v-27q0-20-24-32l-56-15" fill="none" stroke="#cbbd9d" stroke-width="7" stroke-linecap="round"/><text x="20" y="270" fill="#b8c4ca" font-size="11">SCHEMATIC ONLY · NOT A SURVEY OR TITLE PLAN</text><text x="738" y="270" fill="#b8c4ca" font-size="11" text-anchor="end">NOT TO SCALE</text></svg><figcaption>Concept only. No site selected; not a survey, title plan, planning submission or building design.</figcaption></figure>
<div class="step-grid" style="margin-top:14px"><div class="step-card"><h3>House and courtyard</h3><p>Evidence-led architectural reconstruction with uncertain features labelled.</p></div><div class="step-card"><h3>Garden and orchard</h3><p>A living interpretation of food, shelter and seasonal work, adapted to Patagonia.</p></div><div class="step-card"><h3>Landscape trail</h3><p>Accessible paths and habitat corridors connect visitors with the setting.</p></div><div class="step-card"><h3>Visitor facilities</h3><p>Access, toilets, parking, shop and later amenities require local service and environmental review.</p></div></div>
<p class="disclaimer" style="margin-top:16px"><b>Area and land status:</b> the research brief retains both 106 acres and 166 acres as possibilities to reconcile against primary records. Neither is an established Argentine boundary. No land purchase, lease or planning approval is represented as complete.</p></div></section>
<section class="s" id="coast-parallel"><div class="wrap"><p class="eyebrow">A poetic parallel</p><h2>Two shores, one remembered home</h2><p>From Cardiff and the sea to Tŷ Mawr; from Puerto Madryn and the Atlantic to a house that remembers Wales.</p><p>The search south of Puerto Madryn will test whether the relationship between the original house, town and coast can be echoed in a new landscape. This is a geographic hypothesis, not a measured fact yet. GIS work will compare georeferenced points, routes, topography, access, utilities and protected-area constraints.</p></div></section>"""

PATAGONIA_VISITOR_ADDONS = """<div class="cards" style="margin-top:12px"><a class="card" href="#enquire" data-offer="virtual"><h3>Wales in virtual reality</h3><p>A guided digital reconstruction of the original Llandough estate, available before the Argentine museum opens.</p><span class="go">Help shape the virtual tour</span></a><a class="card" href="#enquire" data-offer="merch"><h3>The museum shop</h3><p>Books, maps, architectural prints and locally made Welsh-Patagonian products with makers credited.</p><span class="go">Suggest a product</span></a><a class="card" href="#enquire" data-offer="research"><h3>Learning and research</h3><p>Bilingual interpretation, school resources, oral history and a public catalogue of sources.</p><span class="go">Contribute research</span></a><a class="card" href="#enquire" data-offer="partnership"><h3>Community and culture</h3><p>Welsh-Patagonian associations, local museums, schools, universities and craftspeople help shape the programme.</p><span class="go">Explore a partnership</span></a></div>"""

PATAGONIA_ROADMAP_FUNDING = """<section class="s" id="project-roadmap"><div class="wrap"><p class="eyebrow">Delivery plan</p><h2>From tribute to a buildable project</h2><div class="step-grid"><div class="step-card"><h3>1 · Research and reconnaissance</h3><p>Reconcile the acreage history; screen areas south of Puerto Madryn for title, zoning, habitat, climate risks, water, access and services.</p></div><div class="step-card"><h3>2 · Concept and community</h3><p>Prepare a measured Welsh house brief, climate-adapted options and early local cultural conversations.</p></div><div class="step-card"><h3>3 · Business case and permissions</h3><p>Obtain local quotations, planning and legal advice, operating costs, visitor-demand evidence and a funding strategy.</p></div><div class="step-card"><h3>4 · Phased opening</h3><p>Prioritise an accessible core museum and grounds. Add later amenities only when justified and funded.</p></div></div><p class="muted" style="margin-top:14px">No construction budget or opening date is published. Cost and schedule baselines follow site, feasibility and permissions work.</p></div></section>
<section class="s" id="philanthropy"><div class="wrap"><p class="eyebrow">Philanthropy · partnership · grants</p><h2>A founder-funded act of remembrance</h2><p>The founding intention is for Sion Buckler to finance early work as philanthropy: UK legal research, the Welsh virtual reconstruction, documentary preservation, the online presence and initial Argentina feasibility studies. Expenditure will be recorded by workstream through the Project Office.</p><p>This is a proposed funding model, not a statement that construction costs are secured. Land, architecture, engineering, operations and staffing need independent local estimates before capital commitment.</p><h3>Partners to approach</h3><ul class="ticks">
<li><a href="https://asociaciongalesamadryn.org/">Asociación Galesa de Puerto Madryn</a> — a possible local Welsh-language and cultural contact; not yet approached.</li>
<li><a href="https://turismo.madryn.gob.ar/servicio/museos-y-centros-de-interpretacion/">Puerto Madryn's museum and interpretation-centre network</a> — potential dialogue on local collections, visitor needs and educational programming; confirm each institution's current status.</li>
<li><a href="https://ecocentropampazul.com.ar/">Ecocentro Puerto Madryn</a> — a possible environmental-education conversation if it fits local priorities.</li>
<li><a href="https://register-of-charities.charitycommission.gov.uk/en/charity-search/-/charity-details/507737">Wales–Argentina Association / Cymdeithas Cymru-Ariannin</a> — a possible Wales-side education and research contact.</li>
<li>Chubut-based architect, surveyor, lawyer and environmental specialist; local universities, educators, craftspeople and tourism operators.</li>
</ul><p class="muted">These are prospective contacts only. No organisation listed here is represented as a partner, sponsor or endorser.</p><h3>Grant leads — eligibility still to check</h3><ul class="src"><li><a href="https://cultura.chubut.gov.ar/segunda-convocatoria-culturales/">Chubut cultural-space funding</a> — check if a new call is open; the linked notice is a prior call.</li><li><a href="https://www.argentina.gob.ar/cultura/patrimonio/activar-patrimonio">Argentina's Activar Patrimonio</a> — assess fit with an eligible heritage institution.</li><li><a href="https://globalebafund.org/small-size-grants/">Global EbA Fund small grants</a> — advertised deadline 26 October 2026; only a distinct ecosystem-adaptation work package could fit, not house construction.</li><li><a href="https://www.patagonia.com/how-we-fund/international-grant/">Patagonia International Grants</a> — not a general route to land purchase or museum construction.</li></ul><p class="disclaimer">No grant, sponsor, public subsidy, partnership or land agreement is shown as secured. These are screening leads, not funding promises.</p></div></section>"""

def page_patagonia(cfg):
    C = cfg["credits"]
    offers = [("museum", "Museum visit", "House museum and guided tours", "Source-led rooms and interpretation about the farmhouse, working land, family history and the Welsh landscape."),
              ("weddings", "Future events", "Events and hospitality", "Talks, cultural gatherings and possible celebrations, subject to site, permissions, local consultation and a separate operating plan."),
              ("stables", "Optional equestrian facilities", "Landscape and horses", "Stables or paddocks only if suitable for the land, lawful, ecologically acceptable and financially viable."),
              ("bnb", "Future stays", "Potential stays and hospitality", "Guest accommodation is a later option to test; no rooms, service model or opening date is promised.")]
    cards = "".join(f"""<a class="card" href="#enquire" data-offer="{k}"><h3>{E(t)}</h3><p>{E(d)}</p><span class="go">Register interest</span></a>""" for k, _, t, d in offers)
    body = f"""<body>
<main>
<header class="hero" style="background-image:url(/locations-img/madryn-sunrise.webp)"><span id="lang-slot"></span><div class="wrap">
<p class="kick">Patagonia · Puerto Madryn, Chubut, Argentina</p>
<h1>Great House Farm II</h1>
<p class="lede">A Welsh house, imagined anew beneath Patagonian skies.</p>
<span class="soon">Digital project live · physical site at feasibility stage</span>
<div class="btns"><a class="btn solid" href="#estate-plan">Explore the masterplan</a><a class="btn" href="#enquire" data-offer="partnership">Help shape the project</a></div>
<div class="status-grid" aria-label="Project status"><div class="status-item"><b>Digital experience</b><span>Website and planning in development</span></div><div class="status-item"><b>Land</b><span>South of Puerto Madryn is a search area, not a selected site</span></div><div class="status-item"><b>Design</b><span>Concept stage; no approved plans</span></div><div class="status-item"><b>Opening</b><span>No date set</span></div></div>
</div></header>
<section class="s"><div class="wrap">
<p>The proposal is to interpret Great House Farm / Tŷ Mawr through a researched farmhouse reconstruction and landscape near Puerto Madryn. The public page presents a visitor proposition, not an operating venue.</p>
<p>The core offer is the house and guided interpretation. Events, accommodation, wax figures and equestrian facilities are options to assess, not a fixed build specification.</p>
<div class="cards" style="margin-top:20px">{cards}</div>
{PATAGONIA_VISITOR_ADDONS}
<p class="disclaimer">Visitor-experience reference: the <a href="https://marktwainhouse.org/">Mark Twain House &amp; Museum</a> shows how a historic home can be supported by guided tours, education and a shop. Adapt the model to Welsh heritage and Patagonian community priorities; do not copy the building or assume equal scale. <a href="https://marktwainhouse.org/admission/">Tour information</a> · <a href="https://marktwainhouse.org/edu/">education programmes</a>.</p>
<p class="muted" style="margin-top:14px">No prices, bookings or opening dates have been set.</p>
</div></section>
{PATAGONIA_LAND_SECTION}
<section class="s"><div class="wrap">
<figure class="fig"><img src="/locations-img/album-096.webp" alt="Entrance gate and farmhouse of Great House Farm, Llandough" loading="lazy" width="680" height="668"><figcaption>The original: Great House Farm, Llandough (family album)</figcaption></figure>
</div></section>
<section class="s"><div class="wrap">
<h2>The Welsh in Patagonia</h2>
<p>On 28 July 1865 the ship Mimosa landed about 150 Welsh settlers at Puerto Madryn (Porth Madryn). They founded Y Wladfa, the Welsh settlement of the Chubut valley, and Welsh is still spoken there today.</p>
<p>A Welsh farmhouse rebuilt in Puerto Madryn would bring Tŷ Mawr to the town where that story began.</p>
<figure class="fig"><img src="/locations-img/punta-cuevas.webp" alt="Punta Cuevas headland, Puerto Madryn" loading="lazy" width="1400" height="1050"><figcaption><span>Punta Cuevas, Puerto Madryn, the shore where the 1865 settlers first sheltered</span> · {credit(C['punta-cuevas'])}</figcaption></figure>
<h3 style="margin-top:22px">Sources</h3>{sources(cfg['sources']['patagonia'])}
</div></section>
{PATAGONIA_ROADMAP_FUNDING}
<section class="s" id="enquire"><div class="wrap">
<h2>Register interest in Patagonia</h2>
{form(cfg, "patagonia", [(k, l) for k, l in [("museum", "Museum, guided tour or education"), ("land", "Land, property or reconnaissance"), ("research", "History, architecture or landscape research"), ("partnership", "Partnership, professional services or volunteering"), ("philanthropy", "Philanthropy, sponsorship or funding"), ("virtual", "Wales virtual reconstruction"), ("merch", "Museum shop or merchandise"), ("weddings", "Future events or gatherings"), ("stables", "Landscape or equestrian facilities"), ("bnb", "Future accommodation or hospitality"), ("general", "General interest")]], "Preferred month or date")}
<a class="chg" href="/choose/">Change location</a>
<p class="src" style="margin-top:22px"><span>Photo credits</span>: {credit(C['madryn-sunrise'])}; {credit(C['punta-cuevas'])}; {credit(C['album'])}.</p>
</div></section>
</main>
<script>
// Spanish first on the Patagonia page for Spanish-speaking browsers, unless a language was already chosen
(function(){{try{{if(!localStorage.getItem("ghf_lang")&&!/(^|; )ghf_lang=/.test(document.cookie)&&/^es/i.test(navigator.language||"")){{var t=setInterval(function(){{if(window.GHFLang){{clearInterval(t);window.GHFLang.set("es");}}}},150);setTimeout(function(){{clearInterval(t);}},6000);}}}}catch(e){{}}}})();
</script>
{FORM_JS}
</body>
</html>
"""
    return head("Great House Farm II · Cedwyn Estate, Patagonia · Argentina", "The planned Great House Farm II museum and landscape in Patagonia: researched Tŷ Mawr concept, visitor experience, land reconnaissance, philanthropic funding and phased delivery.", "https://bucklerfamily.estate/patagonia/", "/locations-img/madryn-sunrise.webp", extra=PATAGONIA_EXTRA_STYLE) + body

ARCADE_CSS = """
@font-face{font-family:"Press Start 2P";font-weight:400;font-display:swap;src:url(/fonts/press-start-2p-latin-400-normal.woff2) format("woff2")}
html body.arcade{--px:"Press Start 2P",ui-monospace,Menlo,Consolas,monospace;--mg:#ff3ddb;--cy:#00f0ff;--yl:#ffe94a;--bg:#07060f;--ink:#f4f1ff;--dim:#c9c4e6;
 background:var(--bg);color:var(--ink);font:400 16px/1.6 Barlow,"Helvetica Neue",Arial,system-ui,sans-serif}
html:has(body.arcade){background:#07060f!important}
html body.arcade :is(.stage,.segs,.bar,.drawer,.foot) :is(h1,h2,h3,.px,summary,button,.btn,.tag,.chg,.start,.logo,.play,.coin,.kick,.seg-link){font-family:var(--px)!important;font-weight:400!important;text-transform:uppercase;letter-spacing:.04em}
body.arcade a{color:var(--cy)}
body.arcade :focus-visible{outline:3px solid var(--yl);outline-offset:3px}
.skip{position:absolute;left:-9999px;top:0}.skip:focus{left:8px;top:8px;z-index:20;background:var(--yl);color:#000;padding:8px 10px}
/* CRT: scanlines + soft vignette, a very slight flicker (off with reduced motion or the FX switch) */
body.arcade:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483640;background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,0,0,.28) 3px,rgba(0,0,0,0) 4px)}
body.arcade:after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483641;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 60%,rgba(0,0,0,.45) 100%);animation:flick 4s steps(2) infinite}
@keyframes flick{0%,96%,100%{opacity:1}97%{opacity:.82}98%{opacity:.95}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:.15}}
.glow-c{color:var(--cy);text-shadow:0 0 6px rgba(0,240,255,.7),0 0 18px rgba(0,240,255,.35)}
.glow-m{color:var(--mg);text-shadow:0 0 6px rgba(255,61,219,.75),0 0 18px rgba(255,61,219,.35)}
.glow-y{color:var(--yl);text-shadow:0 0 6px rgba(255,233,74,.7)}
/* top bar */
.bar{position:sticky;top:0;z-index:12;display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(7,6,15,.94);border-bottom:2px solid var(--mg);box-shadow:0 2px 14px rgba(255,61,219,.35)}
.bar .logo{font-size:11px;color:var(--yl);text-decoration:none;margin-right:auto}
.bar button{background:none;border:2px solid var(--cy);color:var(--cy);font-size:11px;padding:9px 10px;cursor:pointer;min-height:40px}
.bar button[aria-pressed=false]{border-color:#6d6890;color:#a39fc2}
#lang-slot{position:static}
/* landing */
.stage{max-width:620px;margin:0 auto;padding:26px 18px 10px;text-align:center}
.stage .kick{font-family:var(--px)!important;font-size:10px;letter-spacing:.12em;color:var(--mg);margin:0 0 14px}
.stage h1{font-size:clamp(24px,8vw,44px);line-height:1.25;margin:0 0 10px}
.stage .lede{font-size:17px;color:var(--dim);margin:0 auto 18px;max-width:30em}
.screen{margin:0 auto 10px;max-width:420px;border:3px solid var(--cy);padding:6px;background:#000;box-shadow:0 0 0 3px var(--bg),0 0 0 6px var(--mg),0 0 26px rgba(0,240,255,.4)}
.screen img{width:100%;height:auto;display:block;image-rendering:auto}
.cap{font-size:13px;color:#b9b4da;margin:8px auto 22px;max-width:420px}.cap a{color:var(--yl)}
.coin{font-family:var(--px)!important;font-size:12px;color:var(--yl);margin:0 0 12px;animation:blink 1.2s steps(1) infinite}
.start{display:inline-block;background:var(--mg);color:#07060f!important;border:0;font-size:15px!important;padding:16px 22px;cursor:pointer;text-decoration:none;box-shadow:0 0 0 3px #07060f,0 0 0 5px var(--yl),0 0 22px rgba(255,61,219,.6)}
.start:hover,.start:focus-visible{background:var(--yl)}
/* top-level segments: every option visible, each opens in place */
.segs{max-width:620px;margin:26px auto 0;padding:0 18px 20px;display:grid;gap:12px}
details.seg{border:2px solid var(--cy);background:#0c0a1d;scroll-margin-top:120px}
details.seg[open]{border-color:var(--yl);box-shadow:0 0 18px rgba(255,233,74,.25)}
details.seg>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:18px 16px;font-size:13px;line-height:1.5;color:var(--cy)}
details.seg>summary::-webkit-details-marker{display:none}
details.seg>summary .n{color:var(--mg);flex:0 0 auto}
details.seg>summary:after{content:"\\25B6";margin-left:auto;color:var(--yl);font-size:11px}
details.seg[open]>summary:after{content:"\\25BC"}
details.seg[open]>summary{color:var(--yl)}
.seg .in{padding:2px 14px 16px}
.seg .hint{font-size:14px;color:var(--dim);margin:0 0 12px}
a.seg-link{display:flex;align-items:center;gap:12px;padding:18px 16px;border:2px solid var(--cy);background:#0c0a1d;color:var(--cy);text-decoration:none;font-family:var(--px)!important;font-size:13px;text-transform:uppercase}
a.seg-link .n{color:var(--mg)}a.seg-link:after{content:"\\21A9";margin-left:auto;color:var(--yl)}
.back{display:block;width:100%;margin:14px 0 0;background:none;border:2px dashed #6d6890;color:#d7d3f2;font-size:10px;padding:12px;cursor:pointer}
.back:hover,.back:focus-visible{border-color:var(--yl);color:var(--yl)}
/* level 2: featured games */
.games{display:grid;gap:10px}
.games details{border:2px solid #3a3466}.games details[open]{border-color:var(--mg)}
.games summary{list-style:none;cursor:pointer;padding:14px 12px;font-size:11px;line-height:1.5;color:var(--ink);display:flex;gap:10px}
.games summary::-webkit-details-marker{display:none}.games summary:after{content:"+";margin-left:auto;color:var(--yl)}.games details[open] summary:after{content:"\\2013"}
.games .d{padding:0 12px 14px;color:var(--dim);font-size:15px}
.play{display:inline-block;margin-top:8px;font-family:var(--px)!important;font-size:11px;color:#07060f!important;background:var(--cy);padding:10px 12px;text-decoration:none}
.play:hover,.play:focus-visible{background:var(--yl)}
.views{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.views .btn{display:flex;align-items:center;justify-content:center;min-height:52px;border:2px solid var(--cy);color:var(--cy);text-decoration:none;font-size:10px;text-align:center;padding:4px;background:none}
.views .btn:hover,.views .btn:focus-visible{background:var(--cy);color:#07060f}
/* level 2: high-score table of every site */
.hs-head{display:flex;gap:10px;font-family:var(--px)!important;font-size:9px;color:var(--mg);padding:0 10px 8px;border-bottom:2px solid var(--mg)}
.hs-head span:last-child{margin-left:auto}
ol.hs{list-style:none;margin:0;padding:0}
ol.hs>li{border-bottom:1px dashed #3a3466}
ol.hs details>summary{list-style:none;cursor:pointer;display:flex;gap:10px;align-items:baseline;padding:13px 10px;font-size:10.5px;line-height:1.6;color:var(--ink)}
ol.hs details>summary::-webkit-details-marker{display:none}
ol.hs .rk{color:var(--yl);flex:0 0 auto;min-width:2.6em}
ol.hs .dot{width:9px;height:9px;flex:0 0 auto;align-self:center}
ol.hs .nm{flex:1 1 auto}
ol.hs summary:after{content:"+";color:var(--cy);flex:0 0 auto}ol.hs details[open]>summary:after{content:"\\2013"}
ol.hs details[open]>summary{color:var(--cy)}
ol.hs li:nth-child(1) .rk{color:var(--yl)}ol.hs li:nth-child(2) .rk{color:var(--cy)}ol.hs li:nth-child(3) .rk{color:var(--mg)}
ol.hs .d{padding:0 10px 14px 50px;color:var(--dim);font-size:15px}
/* side menu */
.drawer{position:fixed;inset:0;z-index:2147483600;display:none}
.drawer.on{display:block}
.drawer .shade{position:absolute;inset:0;background:rgba(0,0,0,.6)}
.drawer nav{position:absolute;top:0;left:0;bottom:0;width:min(86vw,330px);background:#0c0a1d;border-right:3px solid var(--mg);padding:16px;overflow:auto;box-shadow:0 0 30px rgba(255,61,219,.4)}
.drawer h2{font-size:12px!important;line-height:1.5!important;color:var(--yl);margin:10px 60px 16px 0!important}
.drawer ol{list-style:none;margin:0;padding:0}
.drawer li a,.drawer li button{display:block;width:100%;text-align:left;font-family:var(--px)!important;font-size:11px;text-transform:uppercase;color:var(--cy);background:none;border:0;border-bottom:1px dashed #3a3466;padding:16px 4px;text-decoration:none;cursor:pointer}
.drawer li a:hover,.drawer li button:hover{color:var(--yl)}
.drawer .x{position:absolute;top:10px;right:10px;background:none;border:2px solid var(--mg);color:var(--mg);font-family:var(--px)!important;font-size:11px;padding:8px 10px;cursor:pointer}
/* footer */
.foot{max-width:620px;margin:10px auto 0;padding:22px 18px 40px;border-top:2px solid var(--mg);text-align:center;color:#b9b4da;font-size:14px}
.foot .px{font-size:9px;color:var(--mg);margin:0 0 10px}
.foot p{margin:0 0 8px}
/* reduced motion: no flicker, no blink (system setting or the FX switch) */
@media (prefers-reduced-motion:reduce){body.arcade:after,.coin{animation:none!important}html{scroll-behavior:auto}}
body.arcade.calm:after,body.arcade.calm .coin{animation:none!important}
body.arcade.calm:before{opacity:.5}
@media (min-width:760px){.stage{padding-top:40px}.segs{gap:14px}}
"""

ARCADE_EXTRA_CSS = r"""
/* 1987 cyber-grid cabinet refresh */
html body.arcade{background:#050711;color:#eaf7ff;background-image:radial-gradient(ellipse at 50% -10%,rgba(25,73,139,.34),transparent 54%),linear-gradient(180deg,#070816 0%,#050711 55%,#0a0717 100%);font-family:Barlow,"Helvetica Neue",Arial,sans-serif}
body.arcade:before,body.arcade:after{z-index:9;pointer-events:none}
body.arcade:before{opacity:.22;background:repeating-linear-gradient(180deg,transparent 0,transparent 3px,rgba(0,0,0,.16) 4px)}
body.arcade:after{animation:flick 7s steps(2) infinite;opacity:.3}
.arcade-page{position:relative;isolation:isolate;overflow:hidden;padding:22px 18px 46px}
.arcade-page:before{content:"";position:absolute;z-index:-1;left:-18%;right:-18%;bottom:80px;height:42vh;min-height:220px;transform:perspective(310px) rotateX(62deg);transform-origin:bottom;background-image:linear-gradient(rgba(0,240,255,.23) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,.23) 1px,transparent 1px);background-size:38px 28px;mask-image:linear-gradient(transparent,#000 30%,#000 82%,transparent)}
.arcade-hero{max-width:1160px;margin:0 auto 24px;text-align:center;padding:12px 0 18px}
.arcade-hero .eyebrow{font:400 10px/1.8 var(--px);letter-spacing:.2em;color:var(--mg);margin:0 0 14px}
.arcade-hero h1{font:700 clamp(27px,5vw,48px)/1.07 Barlow,Arial,sans-serif;letter-spacing:.16em;margin:0 0 12px;color:#f4f7ff;text-shadow:0 0 4px #fff,0 0 16px rgba(0,240,255,.6),0 0 32px rgba(255,61,219,.4)}
.arcade-hero h1 span{color:var(--cy)}
.arcade-hero p:last-child{font-size:16px;color:#9eb9d3;margin:0}
.arcade-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.8fr);gap:20px;max-width:1160px;margin:0 auto;align-items:start}
.cabinet{position:relative;min-width:0;padding:15px 15px 12px;border-radius:20px 20px 12px 12px;border:2px solid #29365e;background:linear-gradient(145deg,#202741 0%,#0e1224 24%,#080b17 65%,#18152d 100%);box-shadow:0 24px 70px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18),inset 0 0 32px rgba(0,240,255,.06)}
.cabinet:before{content:"";position:absolute;inset:5px;border-radius:14px 14px 7px 7px;border:1px solid rgba(255,61,219,.26);pointer-events:none}
.machine-top,.machine-bottom{display:flex;justify-content:space-between;gap:12px;align-items:center;color:#8499b6;font:400 8px/1.5 var(--px);letter-spacing:.12em;padding:4px 2px 12px}
.machine-top span:last-child{color:var(--yl)}
.marquee{position:relative;overflow:hidden;text-align:center;padding:14px 10px 12px;margin:0 1px 14px;border:1px solid #435180;background:radial-gradient(ellipse at 50% 0%,rgba(0,240,255,.18),transparent 62%),linear-gradient(120deg,#090c1a,#17102a 65%,#080b18);box-shadow:inset 0 0 18px rgba(0,240,255,.07),0 0 19px rgba(255,61,219,.14)}
.marquee:before,.marquee:after{content:"";position:absolute;top:0;bottom:0;width:3px;background:linear-gradient(transparent,var(--cy),var(--mg),transparent);box-shadow:0 0 10px var(--cy)}
.marquee:before{left:0}.marquee:after{right:0}
.marquee .marquee-kicker{font:400 8px/1.6 var(--px);letter-spacing:.2em;color:var(--mg)}
.marquee h2{font:700 clamp(18px,3.5vw,31px)/1.25 Barlow,Arial,sans-serif;letter-spacing:.2em;margin:4px 0;color:#f4f7ff;text-shadow:0 0 5px #fff,0 0 18px rgba(0,240,255,.65),0 0 25px rgba(255,61,219,.45)}
.marquee p{font:400 8px/1.6 var(--px);letter-spacing:.15em;color:var(--yl);margin:0}
.bezel{padding:9px;border-radius:12px;border:2px solid #262d4d;background:linear-gradient(135deg,#080a13,#171b2b 50%,#05060c);box-shadow:inset 0 0 0 2px #05060c,inset 0 0 24px #000}
.screen-wrap{position:relative;overflow:hidden;aspect-ratio:16/9;background:#03050c;border:2px solid #344263;box-shadow:0 0 0 1px #02030a,0 0 24px rgba(0,240,255,.1)}
#game-canvas{display:block;width:100%;height:100%;image-rendering:pixelated;background:#03050c}
.screen-hud{position:absolute;z-index:4;top:0;left:0;right:0;display:flex;justify-content:space-between;gap:8px;padding:8px 10px;background:linear-gradient(#03050ce8,transparent);font:400 8px/1.5 var(--px);letter-spacing:.05em;color:#b7faff;text-shadow:0 0 8px var(--cy);pointer-events:none}
.screen-hud span:nth-child(2){color:var(--yl)}.screen-hud span:last-child{color:var(--mg)}
.screen-overlay{position:absolute;z-index:3;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;gap:8px;padding:28px 20px;background:radial-gradient(ellipse at center,rgba(9,20,43,.80),rgba(4,5,13,.94))}
.screen-overlay .screen-label{font:400 8px/1.7 var(--px);color:var(--mg);letter-spacing:.18em;margin:0}
.screen-overlay h3{font:700 clamp(20px,4vw,32px)/1.15 Barlow,Arial,sans-serif;letter-spacing:.16em;color:#fff;text-shadow:0 0 9px var(--cy),0 0 20px rgba(255,61,219,.65);margin:0}
.screen-overlay p.copy{max-width:420px;font-size:13px;color:#bfcee8;margin:0 0 4px}
.screen-overlay .start{font:400 10px/1.5 var(--px)!important;letter-spacing:.08em;padding:12px 15px;border:1px solid var(--yl);box-shadow:0 0 18px rgba(0,240,255,.25);cursor:pointer}
.screen-overlay.hidden{display:none}
.control-deck{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 8px 12px}
.joystick-art{position:relative;flex:0 0 66px;height:66px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#353d60,#101425 60%,#04050c);border:2px solid #303b5b;box-shadow:inset 0 0 12px #000,0 0 0 2px #080b16}
.joystick-art:before{content:"";position:absolute;width:11px;height:31px;left:26px;top:10px;border-radius:8px;background:linear-gradient(90deg,#464d70,#101426,#697395);transform:rotate(-14deg);box-shadow:0 0 8px rgba(0,240,255,.2)}
.joystick-art:after{content:"";position:absolute;width:25px;height:20px;left:19px;top:3px;border-radius:60% 60% 48% 48%;background:linear-gradient(145deg,#ff79df,#ab1b89 55%,#4b1049);box-shadow:0 0 10px rgba(255,61,219,.45)}
.controls-copy{flex:1;min-width:0;color:#9db4cd;font-size:12px;line-height:1.6}.controls-copy strong{display:block;color:#e7f6ff;font:400 8px/1.8 var(--px);letter-spacing:.06em;margin-bottom:3px}
.deck-buttons{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}
.deck-btn{min-height:38px;border:1px solid #344866;background:linear-gradient(#171e35,#090d1a);color:var(--cy);padding:8px 10px;font:400 8px/1.4 var(--px);cursor:pointer}
.deck-btn:hover,.deck-btn:focus-visible{border-color:var(--yl);color:var(--yl);box-shadow:0 0 12px rgba(0,240,255,.16)}
.machine-bottom{padding:10px 2px 2px;border-top:1px solid rgba(128,159,204,.15);font-size:7px}
.machine-bottom span:nth-child(2){color:var(--cy)}
.selector{min-width:0;overflow:hidden;border:1px solid #293a61;border-radius:12px;background:linear-gradient(160deg,rgba(15,20,40,.97),rgba(7,9,20,.98));box-shadow:0 15px 42px rgba(0,0,0,.32)}
.selector-head{padding:20px 18px 15px;border-bottom:1px solid #26304e;background:linear-gradient(120deg,rgba(0,240,255,.06),transparent 55%,rgba(255,61,219,.07))}
.selector-head .kicker{font:400 8px/1.8 var(--px);letter-spacing:.13em;color:var(--mg);margin:0 0 7px}
.selector-head h2{font:700 23px/1.2 Barlow,Arial,sans-serif;letter-spacing:.08em;color:#edf7ff;margin:0 0 7px}
.selector-head p{font-size:13px;color:#92a8c6;margin:0}
.game-list{display:grid}
.game-option{display:grid;grid-template-columns:28px minmax(0,1fr) 14px;gap:10px;width:100%;text-align:left;align-items:start;padding:15px 15px 14px;border:0;border-bottom:1px solid rgba(75,97,143,.28);background:transparent;color:#d9e8f9;cursor:pointer}
.game-option:last-child{border-bottom:0}
.game-option:hover,.game-option:focus-visible{background:rgba(0,240,255,.055)}
.game-option[aria-pressed=true]{background:linear-gradient(90deg,rgba(0,240,255,.1),rgba(255,61,219,.04));box-shadow:inset 3px 0 var(--cy)}
.game-index{font:400 9px/2 var(--px);color:var(--mg)}
.game-copy strong{display:block;font:700 15px/1.25 Barlow,Arial,sans-serif;letter-spacing:.09em;color:#eaf8ff}
.game-copy small{display:block;font:400 7px/1.8 var(--px);color:var(--yl);letter-spacing:.06em;margin:3px 0 6px}
.game-copy em{display:block;font-style:normal;font-size:12px;line-height:1.45;color:#91a6c4}
.game-option>span:last-child{align-self:center;color:var(--cy);font-size:15px}
.selector-load{padding:15px 16px 17px;border-top:1px solid #26304e;background:rgba(2,4,11,.45)}
.selector-load .load-label{display:block;font:400 7px/1.8 var(--px);color:#839ab8;letter-spacing:.13em}
.selector-load output{display:block;color:var(--cy);font:400 9px/1.8 var(--px);margin:3px 0 12px}
.load-game{width:100%;min-height:43px;border:1px solid var(--mg);background:linear-gradient(100deg,rgba(255,61,219,.16),rgba(0,240,255,.09));color:#fff;font:400 9px/1.5 var(--px);letter-spacing:.07em;cursor:pointer;text-shadow:0 0 8px rgba(0,240,255,.35)}
.load-game:hover,.load-game:focus-visible{background:var(--mg);color:#080916}
.game-instructions{max-width:1160px;margin:22px auto 0;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.instruction{padding:16px 17px;border:1px solid rgba(67,92,143,.45);background:rgba(8,12,27,.75)}
.instruction h2{font:400 8px/1.8 var(--px);color:var(--yl);letter-spacing:.08em;margin:0 0 8px}
.instruction p{font-size:13px;color:#9db1ca;margin:0}
.touch-pad{display:none;grid-template-columns:repeat(3,42px);grid-template-rows:repeat(2,38px);gap:4px;margin:0 auto}
.touch-pad button{border:1px solid #3a4c73;border-radius:6px;background:#10172b;color:var(--cy);font-size:16px;touch-action:none}
.touch-pad [data-dir=up]{grid-column:2;grid-row:1}.touch-pad [data-dir=left]{grid-column:1;grid-row:2}.touch-pad [data-dir=down]{grid-column:2;grid-row:2}.touch-pad [data-dir=right]{grid-column:3;grid-row:2}
.game-disclaimer{max-width:1160px;margin:15px auto 0;color:#7589a8;font-size:11.5px;line-height:1.5}
body.arcade .foot{max-width:1160px;margin-top:22px;border-top:1px solid rgba(0,240,255,.3)}
body.arcade .foot .px{font:400 8px/1.8 var(--px);letter-spacing:.1em;color:var(--cy)}
@media(max-width:850px){.arcade-grid{grid-template-columns:minmax(0,1fr)}.selector{order:2}.cabinet{order:1}.game-list{grid-template-columns:1fr 1fr}.game-option{border-right:1px solid rgba(75,97,143,.25)}.game-option:nth-child(even){border-right:0}.game-option:nth-last-child(-n+2){border-bottom:0}}
@media(max-width:570px){.arcade-page{padding:12px 10px 35px}.arcade-hero{margin-bottom:14px;padding:8px 0 12px}.arcade-hero h1{font-size:25px;letter-spacing:.1em}.arcade-hero p:last-child{font-size:14px}.cabinet{padding:10px;border-radius:14px}.machine-top{font-size:6px}.marquee{padding:11px 5px}.marquee h2{font-size:21px}.marquee p,.marquee .marquee-kicker{font-size:6px}.bezel{padding:5px}.screen-hud{font-size:6px;padding:6px}.screen-overlay{padding:22px 12px}.screen-overlay p.copy{font-size:11px}.screen-overlay .start{font-size:8px!important;padding:10px 9px}.control-deck{flex-wrap:wrap;gap:10px;padding:12px 4px}.joystick-art{flex-basis:48px;height:48px}.joystick-art:before{left:18px;top:7px;height:24px}.joystick-art:after{left:13px;top:2px;width:21px;height:17px}.controls-copy{font-size:10px;min-width:145px}.controls-copy strong{font-size:6px}.deck-buttons{width:100%;justify-content:stretch}.deck-btn{flex:1;font-size:7px;padding:7px 4px}.machine-bottom{font-size:5.5px;gap:4px}.selector-head{padding:16px}.game-list{grid-template-columns:1fr}.game-option{border-right:0!important;border-bottom:1px solid rgba(75,97,143,.28)!important;padding:13px}.game-option:last-child{border-bottom:0!important}.game-instructions{grid-template-columns:1fr;margin-top:14px}.touch-pad{display:grid}.game-disclaimer{font-size:10px}}
@media(prefers-reduced-motion:reduce){body.arcade:after{animation:none!important}.game-option,.deck-btn{transition:none!important}}
"""

ARCADE_JS = r"""<script>
(function(){
  var segs=[].slice.call(document.querySelectorAll("details.seg"));
  function only(d){segs.forEach(function(s){if(s!==d)s.open=false;});}
  segs.forEach(function(d){d.addEventListener("toggle",function(){if(d.open)only(d);});});
  function openSeg(id){var d=document.getElementById(id);if(!d)return;d.open=true;only(d);d.scrollIntoView({block:"start",behavior:mq()?"auto":"smooth"});var s=d.querySelector("summary");if(s)s.focus({preventScroll:true});}
  function mq(){return document.body.classList.contains("calm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);}
  function closeAll(){segs.forEach(function(s){s.open=false;[].forEach.call(s.querySelectorAll("details[open]"),function(x){x.open=false;});});var t=document.getElementById("top-level");if(t)t.scrollIntoView({block:"start",behavior:mq()?"auto":"smooth"});}
  [].forEach.call(document.querySelectorAll("[data-open]"),function(b){b.addEventListener("click",function(e){e.preventDefault();hideMenu();openSeg(b.getAttribute("data-open"));});});
  [].forEach.call(document.querySelectorAll("[data-back]"),function(b){b.addEventListener("click",function(){var d=b.closest("details.seg");if(d){d.open=false;var s=d.querySelector("summary");if(s){s.scrollIntoView({block:"center",behavior:mq()?"auto":"smooth"});s.focus({preventScroll:true});}}});});
  [].forEach.call(document.querySelectorAll("[data-collapse]"),function(b){b.addEventListener("click",function(){hideMenu();closeAll();});});
  var dr=document.getElementById("menu"),mb=document.getElementById("menu-btn");
  function showMenu(){dr.classList.add("on");mb.setAttribute("aria-expanded","true");var f=dr.querySelector("nav a,nav button");if(f)f.focus();}
  function hideMenu(){if(!dr.classList.contains("on"))return;dr.classList.remove("on");mb.setAttribute("aria-expanded","false");mb.focus({preventScroll:true});}
  mb.addEventListener("click",function(){dr.classList.contains("on")?hideMenu():showMenu();});
  [].forEach.call(dr.querySelectorAll("[data-close]"),function(b){b.addEventListener("click",hideMenu);});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")hideMenu();});
  var fx=document.getElementById("fx-btn");
  function setFx(on){document.body.classList.toggle("calm",!on);fx.setAttribute("aria-pressed",on?"true":"false");fx.textContent=on?"FX ON":"FX OFF";}
  var saved=null;try{saved=localStorage.getItem("arcade_fx");}catch(e){}
  setFx(saved?saved==="on":!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches));
  fx.addEventListener("click",function(){var on=fx.getAttribute("aria-pressed")!=="true";setFx(on);try{localStorage.setItem("arcade_fx",on?"on":"off");}catch(e){}});
  if(location.hash){var h=location.hash.slice(1);if(document.getElementById(h)&&/^seg-/.test(h))openSeg(h);}
})();
</script>"""

ARCADE_GAME_JS = r"""<script>
(function(){
  "use strict";
  var $=function(id){return document.getElementById(id);};
  var canvas=$("game-canvas"),ctx=canvas&&canvas.getContext("2d");
  if(!canvas||!ctx)return;
  var overlay=$("screen-overlay"),overlayTitle=$("overlay-title"),overlayCopy=$("overlay-copy"),startBtn=$("btn-start");
  var marquee=$("marquee-title"),hudGame=$("hud-game"),hudScore=$("hud-score"),hudTime=$("hud-time"),status=$("machine-status");
  var musicBtn=$("music-toggle"),pauseBtn=$("btn-pause"),loadBtn=$("load-game"),profileOut=$("loaded-profile");
  var W=640,H=360,selected="farm-attack",keys={},touch={},last=0,stars=[],audioCtx=null,musicLoop=null,musicEnabled=true,beat=0;
  var configs={
    "farm-attack":{name:"FARM ATTACK",genre:"EVICTION RUN / ACTION",kind:"attack",goal:5,time:75,pickup:"FAMILY",hazard:"RECORD",copy:"Route the notice crew through the property. Collect a family marker, then escort it to the exit portal."},
    "hold-house":{name:"HOLD THE HOUSE",genre:"DEFENCE / SURVIVAL",kind:"defend",goal:10,time:75,pickup:"RECORD",hazard:"NOTICE",copy:"Stay on the grid, collect the records, and avoid the incoming notices. How many can you preserve?"},
    "registry-rush":{name:"REGISTRY RUSH",genre:"COLLECTION / SPEED",kind:"records",goal:12,time:60,pickup:"FILE FRAGMENT",hazard:"MISSING FILE",copy:"Race across the archive grid to gather twelve file fragments before the clock runs out."},
    "courtroom-87":{name:"COURTROOM 87",genre:"DEADLINE DODGER / ARCADE",kind:"appeal",goal:9,time:65,pickup:"APPEAL POINT",hazard:"DEADLINE",copy:"Collect the appeal points, dodge deadline pulses and try to build a new high score."}
  };
  var state={running:false,paused:false,score:0,lives:3,time:0,player:{x:320,y:285},targets:[],hazards:[],carried:null,done:0,goal:0,shield:0,invuln:0,won:false};
  for(var i=0;i<58;i++)stars.push({x:(i*97+41)%W,y:(i*53+11)%H,r:.5+(i%3)*.4,p:i*.91});
  function random(min,max){return min+Math.random()*(max-min);}
  function dist(a,b){var dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy);}
  function showOverlay(title,copy,label){overlayTitle.textContent=title;overlayCopy.textContent=copy;startBtn.textContent=label||"PRESS START";overlay.classList.remove("hidden");}
  function chooseGame(id){
    if(!configs[id])return;selected=id;var c=configs[id];
    Array.prototype.forEach.call(document.querySelectorAll("[data-game-select]"),function(b){var on=b.getAttribute("data-game-select")===id;b.setAttribute("aria-pressed",on?"true":"false");b.classList.toggle("selected",on);});
    marquee.textContent=c.name;hudGame.textContent=c.name;profileOut.textContent=c.genre;showOverlay(c.name,c.copy,"PRESS START");
    status.textContent="READY / "+c.genre;if(state.running){state.running=false;state.paused=false;}updateHud();
  }
  function spawnTargets(){
    state.targets=[];state.hazards=[];state.carried=null;state.done=0;var c=configs[selected],n=c.goal;
    for(var i=0;i<n;i++){var x=c.kind==="attack"?random(108,235):random(45,595),y=c.kind==="attack"?random(135,208):random(68,315);state.targets.push({x:x,y:y,homeX:x,homeY:y,phase:random(0,7),type:"pickup"});}
    var count=c.kind==="attack"?5:6;
    for(var j=0;j<count;j++)state.hazards.push({x:random(70,590),y:random(60,320),vx:random(-75,75),vy:random(-55,55),phase:random(0,7)});
  }
  function startGame(){
    var c=configs[selected];state={running:true,paused:false,score:0,lives:3,time:c.time,player:{x:320,y:286},targets:[],hazards:[],carried:null,done:0,goal:c.goal,shield:0,invuln:0,won:false};
    spawnTargets();overlay.classList.add("hidden");status.textContent="PLAYING / "+c.genre;startMusic();updateHud();last=performance.now();
  }
  function updateHud(){var c=configs[selected];hudScore.textContent="SCORE "+String(state.score||0).padStart(6,"0");hudTime.textContent="TIME "+String(Math.max(0,Math.ceil(state.time||c.time))).padStart(2,"0")+" · "+(state.lives==null?3:state.lives)+" ♥";}
  function finish(won){
    state.running=false;state.paused=false;state.won=won;var c=configs[selected];status.textContent=won?"MISSION COMPLETE":"GAME OVER";
    showOverlay(won?"STAGE CLEAR":"GAME OVER",won?("Score "+state.score+" · "+state.done+" / "+state.goal+" objective units complete."):("Score "+state.score+" · "+(selected==="farm-attack"?"The exit portal stays open. Try another run.":"The cabinet is ready for another run.")),won?"PLAY AGAIN":"TRY AGAIN");
  }
  function update(dt){
    var p=state.player,c=configs[selected],speed=190;
    var dx=(keys.ArrowRight||keys.d||touch.right?1:0)-(keys.ArrowLeft||keys.a||touch.left?1:0);
    var dy=(keys.ArrowDown||keys.s||touch.down?1:0)-(keys.ArrowUp||keys.w||touch.up?1:0);
    if(dx&&dy){dx*=.7071;dy*=.7071;}p.x=Math.max(20,Math.min(W-20,p.x+dx*speed*dt));p.y=Math.max(32,Math.min(H-18,p.y+dy*speed*dt));
    state.time-=dt;state.shield=Math.max(0,state.shield-dt);state.invuln=Math.max(0,state.invuln-dt);
    state.hazards.forEach(function(h){h.x+=h.vx*dt;h.y+=h.vy*dt;if(h.x<28||h.x>W-28)h.vx*=-1;if(h.y<48||h.y>H-22)h.vy*=-1;});
    if(c.kind==="attack"){
      if(state.carried){state.carried.x=p.x;state.carried.y=p.y-22;state.carried.phase+=dt*5;if(p.x>520&&p.y<110){state.done++;state.score+=100;state.carried=null;if(state.done>=state.goal){updateHud();finish(true);return;}}}
      else{for(var i=state.targets.length-1;i>=0;i--){if(dist(p,state.targets[i])<20){state.carried=state.targets.splice(i,1)[0];break;}}}
    }else{
      for(var k=state.targets.length-1;k>=0;k--){if(dist(p,state.targets[k])<18){state.targets.splice(k,1);state.done++;state.score+=100;if(state.done>=state.goal){updateHud();finish(true);return;}state.targets.push({x:random(45,595),y:random(65,320),homeX:0,homeY:0,phase:random(0,7),type:"pickup"});}}
    }
    if(state.invuln<=0&&state.shield<=0){for(var j=0;j<state.hazards.length;j++){if(dist(p,state.hazards[j])<17){state.lives--;state.invuln=1.15;p.x=320;p.y=286;if(state.lives<=0){updateHud();finish(false);return;}break;}}}
    if(state.time<=0){updateHud();finish(false);return;}updateHud();
  }
  function text(txt,x,y,size,color,align){ctx.font="700 "+size+"px Barlow,Arial,sans-serif";ctx.textAlign=align||"center";ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.fillText(txt,x,y);ctx.shadowBlur=0;}
  function drawGrid(t){
    var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#07091a");g.addColorStop(.55,"#080d20");g.addColorStop(1,"#03040c");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    stars.forEach(function(s){ctx.globalAlpha=.25+.4*(.5+.5*Math.sin(t*.0009+s.p));ctx.fillStyle="#aefaff";ctx.fillRect(s.x,s.y,s.r,s.r);});ctx.globalAlpha=1;
    var horizon=206,shift=(t*.018)%26;ctx.lineWidth=1;ctx.strokeStyle="rgba(0,240,255,.21)";
    for(var i=-13;i<=13;i++){ctx.beginPath();ctx.moveTo(W/2+i*5,horizon);ctx.lineTo(W/2+i*34,H);ctx.stroke();}
    for(var y=0;y<8;y++){var yy=horizon+Math.pow(y/7,1.7)*(H-horizon)+shift%16;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke();}
    var vg=ctx.createLinearGradient(0,horizon,0,H);vg.addColorStop(0,"rgba(255,61,219,0)");vg.addColorStop(1,"rgba(255,61,219,.09)");ctx.fillStyle=vg;ctx.fillRect(0,horizon,W,H-horizon);
  }
  function drawHouse(t){
    var x=96,y=89,w=156,h=100;ctx.save();ctx.shadowColor="#00f0ff";ctx.shadowBlur=10;ctx.lineWidth=2;ctx.strokeStyle="#00f0ff";
    ctx.beginPath();ctx.moveTo(x-8,y+21);ctx.lineTo(x+w/2,y-20);ctx.lineTo(x+w+8,y+21);ctx.lineTo(x+w+8,y+100);ctx.lineTo(x-8,y+100);ctx.closePath();ctx.stroke();
    ctx.strokeStyle="#ff3ddb";ctx.beginPath();ctx.moveTo(x+10,y+22);ctx.lineTo(x+w/2,y-9);ctx.lineTo(x+w-10,y+22);ctx.stroke();
    ctx.strokeStyle="rgba(0,240,255,.65)";ctx.strokeRect(x+13,y+39,27,26);ctx.strokeRect(x+w-40,y+39,27,26);ctx.strokeStyle="#ffe94a";ctx.strokeRect(x+w/2-12,y+57,24,43);
    ctx.shadowBlur=0;ctx.fillStyle="#0b152a";ctx.fillRect(x+1,y+25,w-2,74);ctx.fillStyle="rgba(0,240,255,.18)";ctx.fillRect(x+14,y+40,25,24);ctx.fillRect(x+w-39,y+40,25,24);ctx.strokeStyle="#ff3ddb";ctx.strokeRect(x+w/2-12,y+57,24,43);ctx.restore();text("TŶ MAWR",x+w/2,y+14,10,"#e6fbff");
  }
  function drawExit(){ctx.save();ctx.shadowColor="#ffe94a";ctx.shadowBlur=15;ctx.strokeStyle="#ffe94a";ctx.lineWidth=2;ctx.strokeRect(530,43,83,59);ctx.shadowBlur=0;ctx.fillStyle="rgba(255,233,74,.10)";ctx.fillRect(530,43,83,59);text("EXIT",571,68,13,"#ffe94a");text("ZONE",571,84,7,"#ffe94a");ctx.restore();}
  function drawPickup(o,t){
    var c=configs[selected],farm=c.kind==="attack",color=farm?"#ff3ddb":c.kind==="defend"?"#00f0ff":c.kind==="records"?"#ffe94a":"#a38bff";
    var bob=Math.sin(t*.004+o.phase)*3,x=o.x,y=o.y+bob;ctx.save();ctx.translate(x,y);ctx.shadowColor=color;ctx.shadowBlur=13;ctx.strokeStyle=color;ctx.lineWidth=1.7;
    if(farm){ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(0,-12);ctx.lineTo(8,-5);ctx.lineTo(7,8);ctx.lineTo(-7,8);ctx.closePath();ctx.stroke();text("F",0,4,9,color);}
    else{ctx.strokeRect(-8,-10,16,20);ctx.beginPath();ctx.moveTo(-4,-4);ctx.lineTo(4,-4);ctx.moveTo(-4,0);ctx.lineTo(4,0);ctx.moveTo(-4,4);ctx.lineTo(2,4);ctx.stroke();}ctx.restore();
  }
  function drawHazard(h,t){
    var c=configs[selected],color=c.kind==="attack"?"#a7f5ff":c.kind==="defend"?"#ff3d83":c.kind==="records"?"#9a8bff":"#ff6e53";
    ctx.save();ctx.translate(h.x,h.y);ctx.rotate(t*.001+h.phase);ctx.shadowColor=color;ctx.shadowBlur=10;ctx.strokeStyle=color;ctx.fillStyle="rgba(255,61,219,.12)";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(9,0);ctx.lineTo(0,10);ctx.lineTo(-9,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }
  function drawPlayer(t){
    var p=state.player,c=configs[selected],color=c.kind==="attack"?"#ffe94a":"#00f0ff";if(state.invuln>0&&Math.floor(t/90)%2===0)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.shadowColor=color;ctx.shadowBlur=14;ctx.fillStyle=color;ctx.strokeStyle="#f6fbff";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(11,9);ctx.lineTo(0,5);ctx.lineTo(-11,9);ctx.closePath();ctx.fill();ctx.stroke();
    if(state.shield>0){ctx.strokeStyle="#ffe94a";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,21,0,Math.PI*2);ctx.stroke();}
    if(state.carried){ctx.strokeStyle="#ff3ddb";ctx.strokeRect(-11,-32,22,15);text("F",0,-21,9,"#ff3ddb");}ctx.restore();
  }
  function draw(t){drawGrid(t);drawHouse(t);if(configs[selected].kind==="attack")drawExit();state.targets.forEach(function(o){drawPickup(o,t);});state.hazards.forEach(function(h){drawHazard(h,t);});if(state.running)drawPlayer(t);if(!state.running)text("FREE PLAY",W/2,286,10,"#4e6b96");if(state.paused){ctx.fillStyle="rgba(4,6,17,.8)";ctx.fillRect(0,0,W,H);text("PAUSED",W/2,H/2,24,"#00f0ff");}}
  function frame(now){var dt=Math.min(.035,(now-(last||now))/1000);last=now;if(state.running&&!state.paused)update(dt);draw(now);requestAnimationFrame(frame);}
  function action(){if(state.paused){state.paused=false;if(pauseBtn)pauseBtn.textContent="PAUSE";overlay.classList.add("hidden");return;}if(!state.running){startGame();return;}state.shield=.85;}
  startBtn.addEventListener("click",action);
  if(loadBtn)loadBtn.addEventListener("click",function(){chooseGame(selected);var cabinet=$("console");if(cabinet)cabinet.scrollIntoView({behavior:"smooth",block:"start"});});
  Array.prototype.forEach.call(document.querySelectorAll("[data-game-select]"),function(b){b.addEventListener("click",function(){chooseGame(b.getAttribute("data-game-select"));});b.addEventListener("dblclick",function(){chooseGame(b.getAttribute("data-game-select"));startGame();});});
  if(pauseBtn)pauseBtn.addEventListener("click",function(){if(!state.running){showOverlay(configs[selected].name,"Press start to begin this game.","PRESS START");return;}state.paused=!state.paused;pauseBtn.textContent=state.paused?"RESUME":"PAUSE";status.textContent=state.paused?"PAUSED":"PLAYING / "+configs[selected].genre;if(state.paused)showOverlay("PAUSED","Take a breath. Resume when ready.","RESUME");else overlay.classList.add("hidden");});
  document.addEventListener("keydown",function(e){
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].indexOf(e.key)>=0&&!(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)))e.preventDefault();
    if(e.key==="Enter"&&!state.running){startGame();return;}if(e.key.toLowerCase()==="p"){if(state.running){state.paused=!state.paused;if(pauseBtn)pauseBtn.textContent=state.paused?"RESUME":"PAUSE";if(state.paused)showOverlay("PAUSED","Resume when you're ready.","RESUME");else overlay.classList.add("hidden");}return;}
    if(e.key===" "&&state.running){state.shield=.85;return;}keys[e.key]=true;keys[e.key.toLowerCase()]=true;
  });
  document.addEventListener("keyup",function(e){keys[e.key]=false;keys[e.key.toLowerCase()]=false;});
  Array.prototype.forEach.call(document.querySelectorAll("[data-dir]"),function(b){
    var d=b.getAttribute("data-dir");function on(){touch[d]=true;}function off(){touch[d]=false;}
    b.addEventListener("pointerdown",function(e){e.preventDefault();on();try{b.setPointerCapture(e.pointerId);}catch(_e){}});
    ["pointerup","pointercancel","pointerleave","lostpointercapture"].forEach(function(ev){b.addEventListener(ev,off);});
  });
  function musicLabel(){if(!musicBtn)return;musicBtn.textContent=musicEnabled?(musicLoop?"♫ MUSIC ON":"♫ MUSIC ON · TAP"):"♫ MUSIC OFF";musicBtn.setAttribute("aria-pressed",musicEnabled?"true":"false");}
  function tone(freq,when,dur,wave,vol){
    if(!audioCtx)return;var osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,when);gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(vol,when+.018);gain.gain.exponentialRampToValueAtTime(.0001,when+dur);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(when);osc.stop(when+dur+.02);
  }
  function scheduleMusic(){
    if(musicLoop||!audioCtx||audioCtx.state!=="running"||!musicEnabled)return;var melody=[220,277.18,329.63,440,392,329.63,277.18,246.94,329.63,392,493.88,440,329.63,277.18,220,196],bass=[110,110,138.59,138.59,164.81,164.81,146.83,146.83];
    musicLoop=window.setInterval(function(){if(!musicEnabled||!audioCtx||audioCtx.state!=="running")return;var t=audioCtx.currentTime+.025;tone(melody[beat%melody.length],t,.16,"square",.023);if(beat%2===0)tone(bass[Math.floor(beat/2)%bass.length],t,.24,"triangle",.035);if(beat%4===2)tone(880,t,.045,"square",.007);beat++;},190);musicLabel();
  }
  function startMusic(){
    if(!musicEnabled)return;try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC){musicLabel();return;}if(!audioCtx)audioCtx=new AC();var r=audioCtx.state==="suspended"?audioCtx.resume():Promise.resolve();if(r&&r.then)r.then(scheduleMusic).catch(musicLabel);else scheduleMusic();if(audioCtx.state==="running")scheduleMusic();musicLabel();}catch(e){musicLabel();}
  }
  function stopMusic(){if(musicLoop){clearInterval(musicLoop);musicLoop=null;}musicLabel();}
  if(musicBtn)musicBtn.addEventListener("click",function(){if(musicLoop){musicEnabled=false;stopMusic();}else{musicEnabled=true;startMusic();}});
  window.addEventListener("pointerdown",function(e){if(e.target&&e.target.closest&&e.target.closest("#music-toggle"))return;startMusic();},{once:true});
  window.addEventListener("keydown",function(){startMusic();},{once:true});
  chooseGame(selected);musicLabel();startMusic();requestAnimationFrame(frame);
})();
</script>"""


def page_cyber(cfg, D):
    """Cyberspace: a focused, mobile-friendly 1980s cyber-grid arcade cabinet. The shared three-row header is unchanged."""
    body = f"""<body class="arcade">
<a class="skip" href="#top-level">Skip to the menu</a>
<div class="bar"><button id="menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Open the menu">☰</button><a class="logo" href="/cyberspace/">Cedwyn·Net</a><span id="lang-slot"></span><button id="fx-btn" type="button" aria-pressed="true" title="Screen flicker and blinking on or off">FX ON</button></div>
<div class="drawer" id="menu" role="dialog" aria-modal="true" aria-label="Arcade menu"><div class="shade" data-close></div><nav>
<button class="x" type="button" data-close aria-label="Close the menu">✕</button>
<h2>ARCADE SELECT</h2>
<ol>
<li><a href="#console">1P · Arcade cabinet</a></li>
<li><a href="#game-select">2P · Select game</a></li>
<li><a href="#how-to-play">Controls &amp; rules</a></li>
<li><a href="/choose/">Change location ↩</a></li>
<li><button type="button" data-collapse>▲ Back to top</button></li>
</ol></nav></div>
<main id="top-level" class="arcade-page">
<header class="arcade-hero">
<p class="eyebrow">CEDWYN·NET / ARCADE SYSTEM 1987</p>
<h1>CYBERSPACE <span>ARCADE</span></h1>
<p>Pick a cabinet. Load a game. Chase a high score.</p>
</header>
<div class="arcade-grid">
<section class="cabinet" id="console" aria-label="Playable arcade cabinet">
<div class="machine-top"><span>MODEL 87 · DIGITAL EDITION</span><span>FREE PLAY / NO COINS</span></div>
<div class="marquee"><div class="marquee-kicker">CEDWYN·NET PRESENTS</div><h2 id="marquee-title">FARM ATTACK</h2><p>ONE PLAYER · INSERT IMAGINATION</p></div>
<div class="bezel"><div class="screen-wrap">
<canvas id="game-canvas" width="640" height="360" aria-label="Playable neon grid arcade game">Your browser does not support the game canvas.</canvas>
<div class="screen-hud" aria-live="polite"><span id="hud-game">FARM ATTACK</span><span id="hud-score">SCORE 000000</span><span id="hud-time">TIME 75</span></div>
<div class="screen-overlay" id="screen-overlay"><p class="screen-label">READY PLAYER ONE</p><h3 id="overlay-title">FARM ATTACK</h3><p class="copy" id="overlay-copy">Route the notice crew through the property. Collect a family marker, then escort it to the exit portal.</p><button class="start" id="btn-start" type="button">PRESS START</button></div>
</div></div>
<div class="control-deck"><div class="joystick-art" aria-hidden="true"></div><div class="controls-copy"><strong>CONTROLS / PLAYER 1</strong>ARROWS or WASD to move · SPACE for a shield · P to pause</div><div class="deck-buttons"><button class="deck-btn" id="btn-pause" type="button">PAUSE</button><button class="deck-btn" id="music-toggle" type="button" aria-pressed="true">♫ MUSIC ON · TAP</button></div></div>
<div class="touch-pad" aria-label="Touch movement controls"><button type="button" data-dir="up" aria-label="Move up">▲</button><button type="button" data-dir="left" aria-label="Move left">◀</button><button type="button" data-dir="down" aria-label="Move down">▼</button><button type="button" data-dir="right" aria-label="Move right">▶</button></div>
<div class="machine-bottom"><span>ARCADE OS 87</span><span id="machine-status">READY / SELECT GAME</span><span>FREE PLAY</span></div>
</section>
<aside class="selector" id="game-select" aria-label="Game selector">
<div class="selector-head"><p class="kicker">GAME SELECT / 01—04</p><h2>Choose your game</h2><p>Select a title, then load it into the cabinet.</p></div>
<div class="game-list" role="group" aria-label="Available games">
<button class="game-option" type="button" data-game-select="farm-attack" aria-pressed="true"><span class="game-index">01</span><span class="game-copy"><strong>FARM ATTACK</strong><small>EVICTION RUN / ACTION</small><em>Route the notice crew through the house. Collect a family marker and escort it to the exit portal.</em></span><span aria-hidden="true">▶</span></button>
<button class="game-option" type="button" data-game-select="hold-house" aria-pressed="false"><span class="game-index">02</span><span class="game-copy"><strong>HOLD THE HOUSE</strong><small>DEFENCE / SURVIVAL</small><em>Collect the records, protect the door, and dodge incoming notices.</em></span><span aria-hidden="true">▶</span></button>
<button class="game-option" type="button" data-game-select="registry-rush" aria-pressed="false"><span class="game-index">03</span><span class="game-copy"><strong>REGISTRY RUSH</strong><small>COLLECTION / SPEED</small><em>Race across the archive grid and gather file fragments before time runs out.</em></span><span aria-hidden="true">▶</span></button>
<button class="game-option" type="button" data-game-select="courtroom-87" aria-pressed="false"><span class="game-index">04</span><span class="game-copy"><strong>COURTROOM 87</strong><small>DEADLINE DODGER / ARCADE</small><em>Collect appeal points, evade deadline pulses, and chase a new high score.</em></span><span aria-hidden="true">▶</span></button>
</div>
<div class="selector-load"><span class="load-label">LOADED PROFILE</span><output id="loaded-profile">EVICTION RUN / ACTION</output><button class="load-game" id="load-game" type="button">LOAD SELECTED GAME ↗</button></div>
</aside>
</div>
<section class="game-instructions" id="how-to-play" aria-label="How to play"><div class="instruction"><h2>01 / MOVE</h2><p>Use the arrow keys or W, A, S, D. On phones, use the directional pad beneath the cabinet.</p></div><div class="instruction"><h2>02 / ACTION</h2><p>In Farm Attack, collect each family marker and carry it to the glowing EXIT zone. In the other games, collect the glowing records and avoid the moving hazards.</p></div></section>
<p class="game-disclaimer">Original browser mini-games inspired by themes in the BP v Buckler dispute. The gameplay is fictionalised and does not represent findings about the legal case. No ROMs or downloads required.</p>
</main>
<footer class="foot"><p class="px">THANKS FOR PLAYING</p><p>CEDWYN·NET ARCADE SYSTEM / FREE PLAY</p><p style="font-size:11px">Music is an original synthesised loop. A browser may require a tap before it allows playback.</p></footer>
{ARCADE_JS}
{ARCADE_GAME_JS}
<script>
(function(){var d=document.querySelector(".drawer");if(!d)return;Array.prototype.forEach.call(d.querySelectorAll('a[href^="#"]'),function(a){a.addEventListener("click",function(){d.classList.remove("on");var b=document.getElementById("menu-btn");if(b)b.setAttribute("aria-expanded","false");});});})();
</script>
</body>
</html>
"""
    return head("Cyberspace Arcade · Cedwyn Estate", "An original neon-grid browser arcade for the Cedwyn Estate digital campus.", "https://bucklerfamily.estate/cyberspace/", "/locations-img/album-098-wireframe.webp",
                extra='<link rel="preload" href="/fonts/press-start-2p-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>\n<meta name="color-scheme" content="dark">\n<style>' + ARCADE_CSS + '</style><style id="arcade-console-theme">' + ARCADE_EXTRA_CSS + '</style>') + body

def page_choose(cfg):
    """Cyberspace in a retro cyberpunk arcade theme (Sion, 00:26 BST 21 Oct 2026), built on the progressive-disclosure
    design rule for every site: a minimal landing view; detail only by opening the side menu or a segment; each tap
    reveals the next level; every top-level option stays visible; a collapse control at every level.
    The hero is a wireframe rendering (Canny edge trace) of family album photo no. 098; the original file is kept."""
    L = cfg["links"]
    cards = [("Online library", "Every record, page by page: the Legal Wiki.", L["library"]), ("E-book shop", "The case books and archive editions, from £0.00.", L["ebooks"]),
             ("Merch shop", "T-shirts, mugs and prints from the farm album.", L["shop"]), ("The app", "Request the records and organise the evidence.", L["app"]),
             ("Chess and puzzles", "The case as a chessboard.", L["chess"]), ("Farm album", "Photos and posts from the farm.", L["album"])]
    games = "".join(f'<details><summary><span class="glow-m">P{i}</span><span>{E(t)}</span></summary><div class="d"><p>{E(d)}</p><a class="play" href="{u}">Open ▶</a></div></details>' for i, (t, d, u) in enumerate(cards, 1))
    rows = "".join(f"""<li><details><summary><span class="rk">{i:02d}</span><span class="dot" style="background:{(s.get('colors') or ['#000','#f2c94c'])[1]}" aria-hidden="true"></span><span class="nm">{E(s['title'])}</span></summary><div class="d"><p>{E(s.get('desc') or s.get('caption') or '')}</p><a class="play" href="{s['url']}" rel="noopener">Visit ↗</a></div></details></li>""" for i, s in enumerate(D["stops"], 1))
    n_sites = len(D["stops"])
    body = f"""<body class="arcade">
<a class="skip" href="#top-level">Skip to the menu</a>
<div class="bar"><button id="menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Open the menu">☰</button><a class="logo" href="/cyberspace/">Cedwyn·Net</a><span id="lang-slot"></span><button id="fx-btn" type="button" aria-pressed="true" title="Screen flicker and blinking on or off">FX ON</button></div>
<div class="drawer" id="menu" role="dialog" aria-modal="true" aria-label="Menu"><div class="shade" data-close></div><nav>
<button class="x" type="button" data-close aria-label="Close the menu">✕</button>
<h2>Select stage</h2>
<ol>
<li><a href="#seg-start" data-open="seg-start">1P · Start here</a></li>
<li><a href="#seg-maps" data-open="seg-maps">2P · Maps of the estate</a></li>
<li><a href="#seg-sites" data-open="seg-sites">Hi-score · Every site</a></li>
<li><a href="/choose/">Change location ↩</a></li>
<li><button type="button" data-collapse>▲ Collapse all</button></li>
</ol></nav></div>
<main>
<header class="stage">
<p class="kick">Cyberspace · The digital estate</p>
<h1 class="glow-c" style="position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0" data-ghf-title>The digital estate</h1>
<p class="lede">Everything Cedwyn Estate publishes online: the record, the library, the shops and the maps.</p>
<figure class="screen" style="margin-bottom:0"><img src="/locations-img/album-098-wireframe.webp" width="840" height="887" alt="Neon wireframe line drawing of the farmhouse, traced from a family album photograph"></figure>
<p class="cap">Wireframe rendering: edges traced by computer from family album photo no. 098 (Great House Farm Part 1, Wayback Vault). <a href="/locations-img/album-098.webp">Original photograph</a></p>
<p class="coin" aria-hidden="true">Insert coin</p>
<a class="start" href="#seg-start" data-open="seg-start">Press start ▶</a>
</header>
<section class="segs" id="top-level" aria-label="Menu">
<details class="seg" id="seg-start"><summary><span class="n">1P</span><span>Start here</span></summary><div class="in">
<p class="hint">Six places to begin. Tap one for more.</p>
<div class="games">{games}</div>
<button class="back" type="button" data-back>▲ Back to all options</button>
</div></details>
<details class="seg" id="seg-maps"><summary><span class="n">2P</span><span>Maps of the estate</span></summary><div class="in">
<p class="hint">Walk the estate in one, two or three dimensions.</p>
<div class="views"><a class="btn" href="/?map">2D map</a><a class="btn" href="/3d/">3D walk</a><a class="btn" href="/1d/">1D list</a></div>
<button class="back" type="button" data-back>▲ Back to all options</button>
</div></details>
<details class="seg" id="seg-sites"><summary><span class="n">HI</span><span>Every site ({n_sites})</span></summary><div class="in">
<p class="hint">The whole estate as a high-score table. Tap a row for what it holds.</p>
<div class="hs-head" aria-hidden="true"><span>Rank</span><span>Site</span><span>Info</span></div>
<ol class="hs">{rows}</ol>
<button class="back" type="button" data-back>▲ Back to all options</button>
</div></details>
<a class="seg-link" href="/choose/"><span class="n">↩</span><span>Change location</span></a>
</section>
</main>
<footer class="foot">
<p class="px">Thanks for playing</p>

<p>— Sion's Tab agent</p>
<p style="font-size:12px">Pixel font: Press Start 2P (SIL Open Font License 1.1, <a href="/fonts/OFL-press-start-2p.txt">licence</a>).</p>
</footer>
{ARCADE_JS}
</body>
</html>
"""
    return head("Cyberspace · The digital estate · Cedwyn Estate", "Cedwyn Estate online: the Legal Wiki library, e-book shop, merch shop, the app, chess and the 1D, 2D and 3D maps of every site.", "https://bucklerfamily.estate/cyberspace/", "/locations-img/album-098-wireframe.webp",
                extra='<link rel="preload" href="/fonts/press-start-2p-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>\n<meta name="color-scheme" content="dark">\n<style>' + ARCADE_CSS + '</style>') + body

def page_choose(cfg):
    return head("Choose your destination · Cedwyn Estate", "Cedwyn Estate: Great House Farm, Llandough, Wales; Great House Farm II, Puerto Madryn, Patagonia; or Cyberspace.", "https://bucklerfamily.estate/choose/", "/locations-img/album-098.webp", extra='<script src="/ghf-lang/locations.js?v=2.0.3"></script>') + """<body>
<main class="wrap" style="padding:60px 20px">
<noscript><h1>Choose your destination</h1><p><a class="btn" href="/wales/">Wales</a> <a class="btn" href="/patagonia/">Patagonia</a> <a class="btn" href="/cyberspace/">Cyberspace</a></p></noscript>
</main>
<script>window.GHFLoc&&window.GHFLoc.choose(true);</script>
</body>
</html>
"""

def page_terms(cfg):
    t = cfg["voucher_terms"]
    rows = "".join(f"<li><b>{E(v['label'])}</b>: £{v['pence']/100:.2f}</li>" for v in cfg["vouchers"])
    return head("Gift voucher terms · Cedwyn Estate", "Terms for Cedwyn Estate guided virtual tour gift vouchers.", "https://bucklerfamily.estate/wales/vouchers/terms/", "/locations-img/album-098.webp") + f"""<body>
<main class="wrap terms" style="padding:70px 20px 40px"><span id="lang-slot"></span>
<p class="kick">Wales · Llandough</p>
<h1 style="font-size:clamp(28px,7vw,44px)">Gift voucher terms</h1>
<p class="muted">Version 1.0, 20 October 2026. Plain English; your statutory rights are not affected.</p>
<h2>What the voucher is for</h2>
<p>A Cedwyn Estate gift voucher can be exchanged for tickets for the guided virtual-reality tour of Great House Farm (Tŷ Mawr), Llandough, Wales, for the number of guests shown on it:</p>
<ul>{rows}</ul>
<h2>Tours are not open yet</h2>
<p>The tour is in preparation. No date is fixed. You are buying a voucher to use once booking opens; we will email voucher holders when it does.</p>
<h2>How long it lasts</h2>
<p>The voucher is valid for {t['valid_months']} months from the date of purchase. If tours have not opened, or no date you can attend is offered, before it expires, you can have a full refund.</p>
<h2>Refund if tours do not open</h2>
<p>If tours have not opened within {t['refund_if_not_open_months']} months of your purchase, you can ask for a full refund at any time after that, until the voucher expires.</p>
<h2>Your 14-day right to cancel</h2>
<p>You can cancel within {t['cooling_off_days']} days of purchase for any reason and get a full refund (Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013).</p>
<h2>How to ask for a refund</h2>
<p>Email <a href="mailto:{t['contact']}">{t['contact']}</a> with your name, the email you paid with and your voucher code or Stripe receipt number. Refunds go back to the card you paid with, normally within 14 days of your request.</p>
<h2>Delivery</h2>
<p>Stripe emails your receipt at once. Your voucher code is emailed to the address you paid with within {t['code_delivery_working_days']} working days. If it has not arrived, check spam, then email {t['contact']}.</p>
<h2>Using the voucher</h2>
<ul><li>One code per voucher. It can be given to anyone; the person who books uses it.</li><li>It cannot be exchanged for cash, except for the refunds above.</li><li>Lost codes can be reissued: email {t['contact']} with your receipt.</li></ul>
<h2>Who sells it</h2>
<p>Vouchers are sold for Cedwyn Estate by DATRO Consortium Ltd, which takes card payments through Stripe. Questions: <a href="mailto:{t['contact']}">{t['contact']}</a>.</p>
<p><a class="btn" href="/wales/#vouchers">Back to vouchers</a></p>
<p class="muted" style="margin-top:20px">Template prepared by Sion's Tab agent.</p>
</main>
</body>
</html>
"""

def page_thanks(cfg):
    return head("Thank you · Gift voucher · Cedwyn Estate", "Thank you for buying a Cedwyn Estate gift voucher.", "https://bucklerfamily.estate/wales/vouchers/thank-you/", "/locations-img/album-098.webp", extra='<meta name="robots" content="noindex">') + f"""<body>
<main class="wrap" style="padding:80px 20px 40px"><span id="lang-slot"></span>
<p class="kick">Wales · Llandough</p>
<h1 style="font-size:clamp(28px,7vw,44px)">Thank you for your order</h1>
<p>Stripe emails your receipt at once. Your voucher code follows by email within 2 working days.</p>
<div class="note on" id="vc" style="display:none"><span class="muted">Your voucher code</span><div style="font-size:26px;letter-spacing:.12em;margin-top:6px" id="code"></div></div>
<p class="muted" id="ref"></p>
<p><a href="/wales/vouchers/terms/">Voucher terms</a></p>
<p><a class="btn" href="/wales/">Back to the tour</a></p>
</main>
<script>
(function(){{
  var q=new URLSearchParams(location.search),sid=q.get("session_id"),v=q.get("v");
  if(!sid||!/^cs_/.test(sid))return;
  var k="cev_"+sid.slice(-16);try{{if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1");}}catch(e){{}}
  fetch("{cfg['endpoint']}voucher-claim",{{method:"POST",headers:{{"Content-Type":"application/json","Accept":"application/json"}},body:JSON.stringify({{session_id:sid,v:v}})}})
   .then(function(r){{return r.json();}}).then(function(j){{
     if(j&&j.ref)document.getElementById("ref").textContent="Ref. "+j.ref;
     if(j&&j.code){{document.getElementById("code").textContent=j.code;document.getElementById("vc").style.display="block";}}
   }}).catch(function(){{}});
}})();
</script>
</body>
</html>
"""

LOC_JS = r"""/*! locations.js — Cedwyn Estate: where would you like to go? (generated by campus/build_locations.py · v__VER__ · Sion's Tab agent)
 * 1. A WALES / PATAGONIA / CYBERSPACE strip under the shared header bar on every site (basecamp.js calls GHFLoc.strip).
 * 2. On bucklerfamily.estate/ : the full-screen chooser on a first visit; afterwards a visitor arriving from outside goes
 *    to the location they chose. ?map shows the 2D map, ?choose shows the chooser. Choice kept in localStorage + a
 *    .bucklerfamily.estate cookie (ghf_loc).
 */
(function () {
  if (window.GHFLoc) return;
  var T = __T__;
  var ICO = __ICO__, LICO = __LICO__; // inline SVG flags and the robot icon for the strip (campus/build_locations.py ICONS)
  function ic(k) { var sp = document.createElement("span"); sp.className = "ghf-loc-ic"; sp.setAttribute("aria-hidden", "true"); sp.innerHTML = (LICO[k] || []).map(function (n) { return ICO[n] || ""; }).join(""); return sp; }
  var LOCS = [["wales", "/wales/"], ["patagonia", "/patagonia/"], ["cyberspace", "/cyberspace/"]];
  var BASE = "https://bucklerfamily.estate", host = (document.documentElement.getAttribute("data-ghf-host") || location.hostname).replace(/^www\./, ""), path = location.pathname || "/"; // the dartboard served at the apex root names its own host (21 Oct 2026)
  var apex = host === "bucklerfamily.estate" || /(^|\.)bucklerfamilyfarm\.pages\.dev$/.test(host);
  var href = function (p) { return apex ? p : BASE + p; };
  function lang() { var l = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase(); return T[l] ? l : "en"; }
  function get() { var v = null; try { v = localStorage.getItem("ghf_loc"); } catch (e) {} if (!v) { var m = /(?:^|; )ghf_loc=([a-z]+)/.exec(document.cookie); v = m && m[1]; } return /^(wales|patagonia|cyberspace)$/.test(v || "") ? v : null; }
  function set(v) { try { localStorage.setItem("ghf_loc", v); } catch (e) {} try { document.cookie = "ghf_loc=" + v + "; path=/; max-age=31536000; SameSite=Lax; Secure" + (/(^|\.)bucklerfamily\.estate$/.test(location.hostname) ? "; domain=.bucklerfamily.estate" : ""); } catch (e) {} }
  function here() { if (apex && /^\/wales(\/|$)/.test(path)) return "wales"; if (apex && /^\/patagonia(\/|$)/.test(path)) return "patagonia"; if (apex && /^\/choose(\/|$)/.test(path)) return ""; return "cyberspace"; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var CSS = ".ghf-loc{display:flex!important;align-items:stretch;justify-content:center;gap:0;width:100%;box-sizing:border-box;margin:0!important;padding:0 6px!important;background:#000!important;border-bottom:1px solid rgba(255,255,255,.18)!important;position:relative;z-index:2147481989;font:500 11px/1 Barlow,'Helvetica Neue',Arial,sans-serif!important;-webkit-font-smoothing:antialiased}" +
    ".ghf-loc a{flex:1 1 0;display:flex!important;align-items:center;justify-content:center;min-height:38px;padding:0 4px!important;color:#cfcfcf!important;text-decoration:none!important;letter-spacing:.2em;text-transform:uppercase;border-bottom:2px solid transparent;white-space:nowrap;font:inherit!important}" +
    ".ghf-loc a:hover,.ghf-loc a:focus-visible{color:#fff!important}.ghf-loc a[aria-current=page]{color:#fff!important;border-bottom-color:var(--ghf-s,#f2c94c)}" +
    ".ghf-loc a.ghf-loc-ch{flex:0 0 40px;font-size:15px!important;letter-spacing:0}" +
    ".ghf-loc a:not(.ghf-loc-ch){flex-direction:column;gap:4px;min-height:48px;padding:6px 3px 5px!important;letter-spacing:.14em;white-space:normal;text-align:center;line-height:1.15}" +
    ".ghf-loc-ic{display:inline-flex!important;align-items:center;justify-content:center;gap:3px;height:14px;line-height:0}.ghf-loc-ic svg{display:block!important;width:21px!important;height:12.6px!important;border-radius:1px;box-shadow:0 0 0 1px rgba(255,255,255,.28)}" +
    ".ghf-loc-ic svg[aria-label='AI agent']{width:17px!important;height:17px!important;box-shadow:none;border-radius:0}html[data-ghf-mode=day] .ghf-loc-ic svg{box-shadow:0 0 0 1px rgba(0,0,0,.25)}html[data-ghf-mode=day] .ghf-loc-ic svg[aria-label='AI agent']{box-shadow:none}" +
    ".ghf-loc-t{display:block}a.ghf-loc-mini{display:inline-flex!important;align-items:center;padding:4px 3px!important;text-decoration:none!important;border-radius:2px;color:inherit!important}a.ghf-loc-mini:hover,a.ghf-loc-mini:focus-visible{background:rgba(255,255,255,.12)}" +
    ".ghf-cho-ic{margin:0 10px 0 0;vertical-align:-1px}.ghf-cho-ic svg{width:26px!important;height:15.6px!important}.ghf-cho-ic svg[aria-label='AI agent']{width:20px!important;height:20px!important}" +
    "html[data-ghf-mode=day] .ghf-loc{background:#fff!important;border-bottom-color:#ddd!important}html[data-ghf-mode=day] .ghf-loc a{color:#555!important}html[data-ghf-mode=day] .ghf-loc a[aria-current=page]{color:#000!important;border-bottom-color:var(--ghf-p,#0a0a0a)}" +
    "@media (max-width:440px){.ghf-loc a:not(.ghf-loc-ch){letter-spacing:.08em;font-size:10px!important}}@media (max-width:380px){.ghf-loc a{letter-spacing:.05em;font-size:9.5px!important}}@media print{.ghf-loc{display:none!important}}" +
    ".ghf-cho{position:fixed;inset:0;z-index:2147483000;background:#000;color:#fff;overflow:auto;-webkit-overflow-scrolling:touch;font:300 16px/1.5 Barlow,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased}" +
    ".ghf-cho-bg{position:fixed;inset:0;background:#000 url(" + BASE + "/locations-img/album-098.webp) center/cover;opacity:.22;filter:grayscale(1)}" +
    ".ghf-cho-in{position:relative;max-width:560px;margin:0 auto;padding:28px 20px 40px;min-height:100%;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box}" +
    ".ghf-cho-top{display:flex;align-items:center;justify-content:space-between;margin:0 0 30px}.ghf-cho-brand{display:flex;align-items:center;gap:10px;letter-spacing:.24em;text-transform:uppercase;font-size:12px;font-weight:500}" +
    ".ghf-cho-brand img{width:30px;height:30px}.ghf-cho-lang{display:flex;gap:4px}.ghf-cho-lang button{font:500 11px/1 Barlow,Arial,sans-serif;letter-spacing:.14em;color:#bbb;background:none;border:1px solid transparent;padding:7px 8px;cursor:pointer}" +
    ".ghf-cho-lang button[aria-pressed=true]{color:#fff;border-color:#fff}" +
    ".ghf-cho h1{font-weight:300;font-size:clamp(26px,7.4vw,40px);letter-spacing:.1em;text-transform:uppercase;line-height:1.1;margin:0 0 22px}" +
    ".ghf-cho-opt{display:block;text-decoration:none;color:#fff!important;border:1px solid rgba(255,255,255,.55);padding:18px 18px 16px;margin:0 0 12px;background:rgba(0,0,0,.55);transition:background .15s,border-color .15s}" +
    ".ghf-cho-opt:hover,.ghf-cho-opt:focus-visible{background:#fff;color:#000!important;border-color:#fff}.ghf-cho-opt:hover small,.ghf-cho-opt:focus-visible small{color:#333}" +
    ".ghf-cho-opt b{display:block;font-weight:400;font-size:19px;letter-spacing:.14em;text-transform:uppercase;margin:4px 0 4px}" +
    ".ghf-cho-opt span{display:block;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#f2c94c}.ghf-cho-opt:hover span{color:#000}" +
    ".ghf-cho-opt small{display:block;font-size:14px;color:#c8c8c8;letter-spacing:.02em}.ghf-cho-opt i{font-style:normal;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;border:1px solid currentColor;padding:2px 6px;margin-left:6px;vertical-align:2px}" +
    ".ghf-cho-note{font-size:12.5px;color:#9a9a9a;margin:10px 0 0;letter-spacing:.04em}" +
    /* day mode (hybrid theme v2.1.1): same photo and layout, light scrim, dark text; night mode unchanged */
    "html[data-ghf-mode=day] .ghf-cho{background:#f4f3ef;color:#111}" +
    "html[data-ghf-mode=day] .ghf-cho-bg{background:#f4f3ef url(" + BASE + "/locations-img/album-098.webp) center/cover;opacity:.3;filter:grayscale(.35)}" +
    "html[data-ghf-mode=day] .ghf-cho-bg:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(244,243,239,.55) 0,rgba(244,243,239,.25) 50%,rgba(244,243,239,.6) 100%)}" +
    "html[data-ghf-mode=day] .ghf-cho h1,html[data-ghf-mode=day] .ghf-cho-brand{color:#111}" +
    "html[data-ghf-mode=day] .ghf-cho-lang button{color:#555}html[data-ghf-mode=day] .ghf-cho-lang button[aria-pressed=true]{color:#000;border-color:#000}" +
    "html[data-ghf-mode=day] .ghf-cho-opt{color:#111!important;background:rgba(255,255,255,.9);border-color:rgba(0,0,0,.4)}" +
    "html[data-ghf-mode=day] .ghf-cho-opt span{color:#7a5300}html[data-ghf-mode=day] .ghf-cho-opt small{color:#3d3d3d}" +
    "html[data-ghf-mode=day] .ghf-cho-opt:hover,html[data-ghf-mode=day] .ghf-cho-opt:focus-visible{background:#000;color:#fff!important;border-color:#000}" +
    "html[data-ghf-mode=day] .ghf-cho-opt:hover span,html[data-ghf-mode=day] .ghf-cho-opt:focus-visible span{color:#f2c94c}html[data-ghf-mode=day] .ghf-cho-opt:hover small,html[data-ghf-mode=day] .ghf-cho-opt:focus-visible small{color:#ddd}" +
    "html[data-ghf-mode=day] .ghf-cho-note{color:#4a4a4a}";
  function css() { if (document.querySelector("style[data-ghf-loc]")) return; var s = el("style"); s.setAttribute("data-ghf-loc", ""); s.textContent = CSS; (document.head || document.documentElement).appendChild(s); }
  var strips = [];
  function fill(nav) {
    var s = T[lang()], cur = here(); nav.textContent = "";
    nav.setAttribute("aria-label", s.loc);
    LOCS.forEach(function (x) { var a = el("a"); a.appendChild(ic(x[0])); a.appendChild(el("span", "ghf-loc-t", s[x[0]])); a.setAttribute("data-loc", x[0]); a.href = href(x[1]); if (x[0] === cur) a.setAttribute("aria-current", "page"); a.addEventListener("click", function () { set(x[0]); }); nav.appendChild(a); });
    var c = el("a", "ghf-loc-ch", "◎"); c.href = href("/choose/"); c.title = s.choose; c.setAttribute("aria-label", s.choose); nav.appendChild(c);
  }
  var minis = [];
  function fillMini(box) { var s = T[lang()]; box.textContent = ""; LOCS.forEach(function (x) { var a = el("a", "ghf-loc-mini"); a.href = href(x[1]); a.title = s[x[0]]; a.setAttribute("aria-label", s[x[0]]); a.appendChild(ic(x[0])); a.addEventListener("click", function () { set(x[0]); }); box.appendChild(a); }); }
  function mini(box) { if (!box) return; css(); fillMini(box); if (minis.indexOf(box) < 0) minis.push(box); }
  function strip(after) {
    if (!document.body) return;
    if (document.querySelector(".ghf-loc")) return;
    css();
    var nav = el("nav", "ghf-loc ghf-ui"); nav.setAttribute("data-no-translate", ""); nav.setAttribute("translate", "no");
    fill(nav); strips.push(nav);
    if (after && after.parentNode) after.parentNode.insertBefore(nav, after.nextSibling); else document.body.insertBefore(nav, document.body.firstChild);
  }
  var box = null;
  function render() {
    if (!box) return;
    var s = T[lang()], l = lang(); box.querySelector(".ghf-cho-in").innerHTML = "";
    var inn = box.querySelector(".ghf-cho-in");
    var top = el("div", "ghf-cho-top"), br = el("div", "ghf-cho-brand"); var im = document.createElement("img"); im.src = BASE + "/brand/cedwyn-tent-icon-64.png"; im.alt = ""; br.appendChild(im); br.appendChild(el("span", null, s.estate)); top.appendChild(br);
    var lg = el("div", "ghf-cho-lang"); ["en", "cy", "es"].forEach(function (k) { var b = el("button", null, k.toUpperCase()); b.type = "button"; b.setAttribute("aria-pressed", k === l ? "true" : "false"); b.onclick = function () { if (window.GHFLang) window.GHFLang.set(k); else { document.documentElement.setAttribute("lang", k); } setTimeout(render, 60); }; lg.appendChild(b); }); top.appendChild(lg);
    inn.appendChild(top);
    inn.appendChild(el("h1", null, s.title));
    [["wales", "/wales/", s.w_kick, s.w_name, s.w_line], ["patagonia", "/patagonia/", s.p_kick, s.p_name, s.p_line], ["cyberspace", "/cyberspace/", s.c_kick, s.c_name, s.c_line]].forEach(function (o) {
      var a = el("a", "ghf-cho-opt"); a.href = href(o[1]);
      a.appendChild(el("span", null, o[2] + (o[0] !== "cyberspace" ? " · " + s.soon : ""))); var nb = el("b", null, o[3]); var ci = ic(o[0]); ci.className = "ghf-loc-ic ghf-cho-ic"; nb.insertBefore(ci, nb.firstChild); a.appendChild(nb); a.appendChild(el("small", null, o[4]));
      a.addEventListener("click", function () { set(o[0]); });
      inn.appendChild(a);
    });
    inn.appendChild(el("p", "ghf-cho-note", s.note));
  }
  function choose(fixed) {
    if (!document.body) { document.addEventListener("DOMContentLoaded", function () { choose(fixed); }); return; }
    if (box) return;
    css();
    box = el("div", "ghf-cho ghf-ui"); box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", T[lang()].title);
    box.setAttribute("data-no-translate", ""); box.setAttribute("translate", "no");
    box.appendChild(el("div", "ghf-cho-bg")); box.appendChild(el("div", "ghf-cho-in"));
    document.body.appendChild(box); document.documentElement.style.overflow = "hidden";
    render();
      }
  document.addEventListener("ghf-lang-change", function () { strips.forEach(fill); minis.forEach(fillMini); render(); });
  window.GHFLoc = { strip: strip, mini: mini, icon: ic, choose: choose, get: get, set: set, version: "__VER__" };
  // pages that carry their own header (the base camp map and the 1D list) get the strip at the top here;
  // every other page gets it from basecamp.js, under the shared header bar
  var own = apex && (path === "/" || path === "/index.html" || /^\/(1d|cedwyn)(\/|$)/.test(path));
  if (own) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { strip(null); }); else strip(null); }
  if (apex && (path === "/" || path === "/index.html" || /^\/cedwyn\/?$/.test(path))) { // base camp (now also at /cedwyn/)
    var q = location.search || "";
    if (/[?&]choose\b/.test(q)) choose(false);
    else if (!/[?&]map\b/.test(q)) {
      var c = get(), ref = document.referrer || "";
      var inside = /^https:\/\/([a-z0-9-]+\.)*bucklerfamily\.estate\//.test(ref) || /\.pages\.dev\//.test(ref);
      if (!c) choose(false);
      else if (!inside) location.replace("/" + c + "/");
    }
  }
})();
"""

# Header icons (inline SVG; the Welsh flag emoji does not render on many devices). Also written to public/brand/flags/
# for pages that cannot run scripts (the WordPress Legal Wiki header). Drawn by Sion's Tab agent, 21 Oct 2026.
ICONS = {
 "wales": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 36\" width=\"24\" height=\"14.4\" role=\"img\" aria-label=\"Flag of Wales\"><rect width=\"60\" height=\"18\" fill=\"#fff\"/><rect y=\"18\" width=\"60\" height=\"18\" fill=\"#00B140\"/><path fill=\"#D30731\" d=\"M13 24c2-1 4-3 5-6-2 0-4-1-5-3 3 1 5 1 7 0l3-6c1-2 3-3 5-2l-2 2c1 1 3 1 4 0l3 1-3 2c-1 3-1 5 1 7 3-2 6-5 9-9 0 4-2 7-4 10 3 0 6-1 9-3-1 3-4 5-8 6l3 3-3 1-2-3c-3 1-6 1-9 0l-2 4-3-1 2-4c-3-1-5-1-7 1-1 1-2 2-4 2l1-2z\"/></svg>",
 "uk": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 36\" width=\"24\" height=\"14.4\" role=\"img\" aria-label=\"Union Flag\"><rect width=\"60\" height=\"36\" fill=\"#012169\"/><path d=\"M0 0L60 36M60 0L0 36\" stroke=\"#fff\" stroke-width=\"7\"/><path d=\"M0 0L60 36M60 0L0 36\" stroke=\"#C8102E\" stroke-width=\"2.6\"/><path d=\"M30 0v36M0 18h60\" stroke=\"#fff\" stroke-width=\"11\"/><path d=\"M30 0v36M0 18h60\" stroke=\"#C8102E\" stroke-width=\"6.5\"/></svg>",
 "argentina": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 36\" width=\"24\" height=\"14.4\" role=\"img\" aria-label=\"Flag of Argentina\"><rect width=\"60\" height=\"36\" fill=\"#74ACDF\"/><rect y=\"12\" width=\"60\" height=\"12\" fill=\"#fff\"/><g fill=\"#F6B40E\"><circle cx=\"30\" cy=\"18\" r=\"3.6\"/><path d=\"M30 12.2l.9 2.4h-1.8zM30 23.8l.9-2.4h-1.8zM24.2 18l2.4.9v-1.8zM35.8 18l-2.4.9v-1.8zM25.9 13.9l2.3 1.1-1.2 1.2zM34.1 22.1l-2.3-1.1 1.2-1.2zM34.1 13.9l-1.1 2.3-1.2-1.2zM25.9 22.1l1.1-2.3 1.2 1.2z\"/></g></svg>",
 "robot": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" role=\"img\" aria-label=\"AI agent\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2.5v3\"/><circle cx=\"12\" cy=\"2.5\" r=\"1\" fill=\"currentColor\"/><rect x=\"4.5\" y=\"5.5\" width=\"15\" height=\"12\" rx=\"3\"/><circle cx=\"9.2\" cy=\"11\" r=\"1.5\" fill=\"currentColor\"/><circle cx=\"14.8\" cy=\"11\" r=\"1.5\" fill=\"currentColor\"/><path d=\"M9.5 14.6h5M2.5 10v4M21.5 10v4M8 17.5v3h8v-3\"/></svg>"
}
LOC_ICONS = {"wales": ["wales", "uk"], "patagonia": ["wales", "argentina"], "cyberspace": ["robot"]}

T_JS = {
 "en": {"loc": "Location", "wales": "Wales", "patagonia": "Patagonia", "cyberspace": "AI", "choose": "Choose a location", "estate": "Cedwyn Estate",
        "title": "Choose your destination", "soon": "Coming soon",
        "w_kick": "Llandough, Wales", "w_name": "Great House Farm", "w_line": "Virtual-reality guided tour",
        "p_kick": "Puerto Madryn, Patagonia, Argentina", "p_name": "Great House Farm II", "p_line": "Cedwyn Estate: replica farmhouse, wax museum, weddings, stables, B&B",
        "c_kick": "Online", "c_name": "AI", "c_line": "The digital estate: maps, library, shops, app",
        "note": "Your choice is remembered on this device. Change it any time with the bar at the top."},
 "cy": {"loc": "Lleoliad", "wales": "Cymru", "patagonia": "Patagonia", "cyberspace": "DA", "choose": "Dewiswch leoliad", "estate": "Ystâd Cedwyn",
        "title": "Dewiswch eich cyrchfan", "soon": "Yn dod cyn hir",
        "w_kick": "Llandochau, Cymru", "w_name": "Tŷ Mawr", "w_line": "Taith dywys rhith-wirionedd",
        "p_kick": "Porth Madryn, Patagonia, yr Ariannin", "p_name": "Tŷ Mawr II", "p_line": "Ystâd Cedwyn: ffermdy replica, amgueddfa gwyr, priodasau, stablau, gwely a brecwast",
        "c_kick": "Ar-lein", "c_name": "DA", "c_line": "Yr ystâd ddigidol: mapiau, llyfrgell, siopau, ap",
        "note": "Cofir eich dewis ar y ddyfais hon. Newidiwch ef unrhyw bryd gyda’r bar ar y brig."},
 "es": {"loc": "Lugar", "wales": "Gales", "patagonia": "Patagonia", "cyberspace": "IA", "choose": "Elija un lugar", "estate": "Finca Cedwyn",
        "title": "Elija su destino", "soon": "Próximamente",
        "w_kick": "Llandough, Gales", "w_name": "Great House Farm", "w_line": "Visita guiada en realidad virtual",
        "p_kick": "Puerto Madryn, Patagonia, Argentina", "p_name": "Great House Farm II", "p_line": "Finca Cedwyn: réplica de la casa, museo de cera, bodas, caballerizas, B&B",
        "c_kick": "En línea", "c_name": "IA", "c_line": "La finca digital: mapas, biblioteca, tiendas, app",
        "note": "Su elección se recuerda en este dispositivo. Cámbiela cuando quiera con la barra superior."}
}

def inject(fn, tag, marker):
    if not os.path.exists(fn): return False
    s = open(fn, encoding="utf-8").read()
    if marker in s: return False
    s = s.replace("</head>", tag + "\n</head>", 1)
    open(fn, "w", encoding="utf-8").write(s); return True

def build(D=None, ROOT=None):
    ROOT = ROOT or os.path.dirname(HERE)
    D = D or json.load(open(os.path.join(HERE, "basecamp_stops.json"), encoding="utf-8"))
    cfg = json.load(open(os.path.join(HERE, "locations.json"), encoding="utf-8"))
    pub = os.path.join(ROOT, "public")
    pages = {"wales": page_wales(cfg), "patagonia": page_patagonia(cfg), "cyberspace": page_cyber(cfg, D), "choose": page_choose(cfg),
             "wales/vouchers/terms": page_terms(cfg), "wales/vouchers/thank-you": page_thanks(cfg)}
    for p, h in pages.items():
        d = os.path.join(pub, p); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(h)
    open(os.path.join(pub, "ghf-lang", "locations.js"), "w", encoding="utf-8").write(LOC_JS.replace("__T__", json.dumps(T_JS, ensure_ascii=False)).replace("__ICO__", json.dumps(ICONS, ensure_ascii=False)).replace("__LICO__", json.dumps(LOC_ICONS)).replace("__VER__", cfg["version"]))
    fd = os.path.join(pub, "brand", "flags"); os.makedirs(fd, exist_ok=True)
    for k, v in ICONS.items(): open(os.path.join(fd, k + ".svg"), "w", encoding="utf-8").write(v + "\n")
    open(os.path.join(fd, "robot-light.svg"), "w", encoding="utf-8").write(ICONS["robot"].replace("currentColor", "#ffffff") + "\n")  # for <img> on dark bars (WordPress wiki)
    # ghf-lang dictionary: every visible English string on the location pages
    strings = dict(cfg["strings"])
    for v in cfg["vouchers"]: strings.setdefault(v["label"], strings.get(v["label"], {}))
    dic = {"site": "locations", "version": cfg["version"], "updated": cfg["updated"],
           "note": "Cedwyn Estate locations (/wales/, /patagonia/, /cyberspace/, voucher pages): interface strings. Generated by campus/build_locations.py from campus/locations.json.",
           "mount": "#lang-slot", "mountMode": "append", "patterns": [], "strings": {k: v for k, v in strings.items() if v}}
    json.dump(dic, open(os.path.join(pub, "ghf-lang", "sites", "locations.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    tag = '<script src="/ghf-lang/locations.js?v=' + cfg["version"] + '" data-ghf-locations></script>'
    a = inject(os.path.join(ROOT, "index.html"), tag, "data-ghf-locations")
    b = inject(os.path.join(pub, "1d", "index.html"), tag, "data-ghf-locations")
    # sitemap
    sm = os.path.join(pub, "sitemap.xml")
    if os.path.exists(sm):
        s = open(sm, encoding="utf-8").read(); add = ""
        for p in ["wales/", "patagonia/", "cyberspace/", "wales/vouchers/terms/"]:
            u = "https://bucklerfamily.estate/" + p
            if "<loc>" + u + "</loc>" not in s: add += f"  <url><loc>{u}</loc><lastmod>{cfg['updated']}</lastmod></url>\n"
        if add: open(sm, "w", encoding="utf-8").write(s.replace("</urlset>", add + "</urlset>"))
    return {"pages": list(pages), "root_tag": a, "1d_tag": b}

if __name__ == "__main__":
    print(build())
