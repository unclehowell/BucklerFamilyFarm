#!/usr/bin/env python3
"""Generate the bucklerfamily.estate campus map (root index.html).

Edit BUILDINGS below, then run:  python3 campus/build_campus.py
The Great House WebApp itself lives at /webapp/ (webapp/index.html).
"""
import html, os, random

e = html.escape
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "index.html")

WIKI = "https://greathousefarmwiki.wordpress.com"

# id, name, department, what it holds, url, x, y, w, h, roof, status, extra
BUILDINGS = [
    ("hq", "Headquarters", "Knowledge base and PRINCE2 planning",
     "The Great House Farm Wiki: evidence library, registers, chronology, project plans and highlight reports.",
     WIKI + "/", 620, 150, 340, 150, "slate", "live", "flag"),
    ("museum", "The Museum", "Exhibition",
     "The whole story as an interactive timeline, from the Iron Age to the records requests of 2026.",
     "https://bpvsbuckler.bucklerfamily.estate/", 170, 160, 320, 140, "copper", "live", ""),
    ("ops", "Operations Room", "The quest for evidence",
     "Disclosure rings: every body and every family source asked for records, and how far each request has gone.",
     "https://dartboard.bucklerfamily.estate/", 1020, 150, 190, 140, "green", "live", "radar"),
    ("briefing", "Briefing Hall", "Llandough Community Council, 22 October 2026",
     "The meeting toolkit: the briefing, the asks, the running order and the pack for the Clerk.",
     "https://2026-10-22.bucklerfamily.estate/", 960, 420, 200, 140, "red", "live", ""),
    ("signals", "Signals", "Public authority correspondence",
     "Correspondence with public authorities, catalogued.",
     "https://authorities.bucklerfamily.estate/", 1250, 380, 150, 110, "concrete", "provisioned", "mast"),
    ("records", "Records Registry", "Primary record register",
     "The primary records register: deeds, plans, court and registry documents, and their status.",
     "https://records.bucklerfamily.estate/", 200, 410, 200, 110, "slate", "provisioned", ""),
    ("review", "Review Board", "Independent review register",
     "The independent review register: findings tested against the evidence.",
     "https://review.bucklerfamily.estate/", 440, 410, 150, 110, "green", "provisioned", ""),
    ("inspectorate", "Inspectorate", "The Clerk's record",
     "How the Llandough Community Council Clerk's information replies compare with other bodies.",
     "https://clerk.bucklerfamily.estate/", 1230, 600, 170, 110, "concrete", "live", ""),
    ("audit", "Audit Office", "Llandough Community Council review",
     "The Wiki's forensic institutional review of the Council, its Clerk and councillors.",
     WIKI + "/scrutiny-and-accountability/government-public-authority-involvement/llandough-community-council-forensic-institutional-review/",
     1010, 620, 160, 100, "slate", "live", ""),
    ("vault", "Archive Vault", "The wayback archive",
     "Copies of every page, letter and image kept outside the live sites.",
     "https://wayback.bucklerfamily.estate/", 250, 620, 170, 110, "concrete", "live", ""),
    ("bunker", "Reserve Bunker", "Wiki mirror",
     "A mirror of the Wiki, rebuilt from the archive, in case the live Wiki is unavailable.",
     "https://wiki.bucklerfamily.estate/", 500, 690, 150, 90, "earth", "live", "mound"),
    ("quartermaster", "Quartermaster's Store", "The Great House WebApp",
     "Search whether your own family has land with a story like Tŷ Mawr's.",
     "/webapp/", 890, 800, 170, 100, "copper", "live", ""),
    ("enquiry", "Enquiry Office", "QA Graph: FOI questions & answers",
     "Every FOI and EIR question asked and the answer given, each with a stable reference, searchable as one graph.",
     "https://qa.bucklerfamily.estate/", 840, 615, 150, 105, "slate", "live", ""),
    ("press", "Print Works", "FCG Edge CMS: project mandate & GraphQL",
     "The FCG Edge CMS: the Great House Farm Evidence Recovery project mandate, with a GraphQL endpoint for agents.",
     "https://fcg.bucklerfamily.estate/", 450, 812, 170, 88, "green", "live", ""),
    ("library", "The Library", "DATRO Docs Library",
     "The DATRO document library: consortium contracts, finances, legal, operations and project papers.",
     "https://library.bucklerfamily.estate/", 200, 812, 200, 88, "slate", "live", ""),
    # Sion, 19 Oct 2026 23:24 BST: "make projects bucklerfamily.estate ... migrate all the prince 2 to projects bucklerfamily.estate"
    ("projects", "Project Office", "PRINCE2 project management",
     "The PRINCE2 record moved from the Wiki: mandate, business case, PIDs, plans, highlight reports and control registers.",
     "https://projects.bucklerfamily.estate/", 638, 812, 130, 88, "earth", "live", ""),
    # Farmbook went live 19 Oct 2026 (fb.bucklerfamily.estate returned 200 at 23:50 BST); added with its sign.
    ("quarters", "Family Quarters", "Farmbook: the Williams/Buckler family wall",
     "The Williams/Buckler family profile and wall: every event as a post, dated to the event.",
     "https://fb.bucklerfamily.estate/", 1096, 800, 90, 95, "red", "live", ""),
    # Sion, 20 Oct 2026 00:27 BST: "ebook as a small sub building (place it in wayback)" — annex on the Archive Vault
    ("ebook", "E-book", "The Great House Farm e-book",
     "The whole wiki as one book: evidence, chronology and case record (v0.1), from the e-book shop.",
     "https://bucklerfamily.estate/ebook/", 150, 650, 64, 58, "concrete", "live", "annex"),
]
# --- Website-name signboards (Sion, 19 Oct 2026: "Put the respective website names on the buildings or next
# to them as signs (olive green/ yellow text)"). One olive board with yellow lettering per building, linking to
# its site. Since 19 Oct 2026 23:19 the board shows the site's title (SIGN_TITLE below); the full title and the address
# are always in the tooltip/aria-label, and a title too wide for its roof wraps onto two lines instead of being cut.
SIGN_FONT = 15          # map units; about 12.5 px on a 390 px-wide phone, 13.5 px on a 1440 px desktop
SIGN_LINE = 17
SIGN_PAD_X = 8
SIGN_PAD_Y = 6
# Arial/Liberation Sans Bold advance widths per 1000 em, for the characters a web address uses.
_SIGN_W = {"a": 556, "b": 611, "c": 556, "d": 611, "e": 556, "f": 333, "g": 611, "h": 611, "i": 278, "j": 278,
           "k": 556, "l": 278, "m": 889, "n": 611, "o": 611, "p": 611, "q": 611, "r": 389, "s": 556, "t": 333,
           "u": 611, "v": 556, "w": 778, "x": 556, "y": 556, "z": 500, ".": 278, "-": 333, "/": 278, "\u203a": 333,
           " ": 278,
           # capitals and punctuation used by the website titles (signs show titles since 19 Oct 2026, 23:19)
           "&": 722, "(": 333, ")": 333, "A": 722, "B": 722, "C": 722, "D": 722, "E": 667, "F": 611, "G": 778, "H": 722, "I": 278, "L": 611, "M": 833, "O": 778, "P": 667, "Q": 778, "R": 722, "S": 667, "T": 611, "W": 944, "U": 722, "K": 722, "N": 722, "\u0177": 556, "\u2013": 556, "\u2014": 1000}
# Sion, 19 Oct 2026 23:19 BST: "Sorry not urls. But website title names on buildings." Each sign shows the linked
# site's own title (its <title>, read live 19 Oct 2026, with the " · bucklerfamily.estate" style suffix dropped).
# bid -> (full title, lines on the board or None to wrap automatically). Lines are a faithful shortening of the
# site's own name where the full title is too long for the roof; the full title and the address are in the
# tooltip and the screen-reader label.
SIGN_TITLE = {
    "hq": ("Great House Farm Wiki – Public documentary archive of Great House Farm (Tŷ Mawr), Llandough-juxta-Penarth, South Wales: land, ownership, litigation, archaeology and family evidence.",
          ["Great House Farm Wiki"]),
    "museum": ("Tŷ Mawr — The Great House Farm Story",
              None),
    "ops": ("Disclosure Rings",
           None),
    "briefing": ("Tŷ Mawr at Council",
                None),
    "signals": ("Great House Farm — Public Authority Correspondence",
               ["Public Authority", "Correspondence"]),
    "records": ("Great House Farm — Primary Record Register",
               ["Primary Record", "Register"]),
    "review": ("Great House Farm — Independent Review Register",
              ["Independent", "Review Register"]),
    "inspectorate": ("Llandough Community Council — Forensic Assessment › the Clerk: documented role and casework assessment",
                    ["Forensic Assessment", "› the Clerk"]),
    "audit": ("Llandough Community Council — Forensic Assessment",
             ["Forensic Assessment", "Llandough Council"]),
    "vault": ("DATRO Wayback Archive",
             ["DATRO Wayback", "Archive"]),
    "bunker": ("Great House Farm Wiki – archive",
              ["Great House Farm", "Wiki – archive"]),
    "quartermaster": ("FOI Evidence Tree & Chronological Bible",
                     ["FOI Evidence Tree &", "Chronological Bible"]),
    "enquiry": ("Great House Farm Q&A — FOI questions and answers",
               ["Great House", "Farm Q&A"]),
    "press": ("FCG Edge CMS",
             None),
    # Sion, 19 Oct 2026 23:24 BST: "make library bucklerfamily.estate (corresponding buildings in bucklerfamily.estate too)"
    "library": ("DATRO Docs Library",
               None),
    "projects": ("Great House Farm Projects — PRINCE2",
                ["Great House Farm", "Projects — PRINCE2"]),
    "ebook": ("E-book",
              ["E-book"]),
    "quarters": ("Williams / Buckler family · Great House Farm (Tŷ Mawr) · farmbook",
                ["Williams / Buckler", "family · farmbook"]),
}

# Where a building's footprint in index.html differs from BUILDINGS (hand-edited artwork), sign against this box.
SIGN_BOX = {"vault": (234, 614, 194, 126)}
# Signs that sit across the front edge of the building instead of on its roof (artwork roofs).
SIGN_FRONT = {"vault", "ebook"}


def sign_width(s, size=SIGN_FONT):
    return sum(_SIGN_W.get(c, 556) for c in s) * size / 1000


def sign_name(u):
    """The website name shown on the sign: the address without scheme or trailing slash."""
    if u.startswith("/"):
        return "bucklerfamily.estate" + u.rstrip("/")
    return u.split("://", 1)[-1].rstrip("/")


def sign_lines(bid, u, w):
    title, lines = SIGN_TITLE.get(bid, (sign_name(u), None))
    if lines:
        return lines
    if sign_width(title) + 2 * SIGN_PAD_X <= w - 12:
        return [title]
    words = title.split(" ")                       # two lines, split at the word that balances them best
    best = min(range(1, len(words)), key=lambda k: max(sign_width(" ".join(words[:k])), sign_width(" ".join(words[k:]))))
    return [" ".join(words[:best]), " ".join(words[best:])]


def sign(b):
    bid, name, dept, what, url, x, y, w, h, roof, status, extra = b
    x, y, w, h = SIGN_BOX.get(bid, (x, y, w, h))
    lines = sign_lines(bid, url, w)
    addr = sign_name(url)
    title = SIGN_TITLE.get(bid, (addr, None))[0]
    bw = round(max(sign_width(l) for l in lines) + 2 * SIGN_PAD_X)
    bh = len(lines) * SIGN_LINE + 2 * SIGN_PAD_Y
    cx = x + w / 2
    if bid in SIGN_FRONT:
        by = y + h - bh / 2 + 4           # straddles the front edge
    elif extra == "mound":
        by = y + h / 2 + 6 - bh / 2       # middle of the mound
    else:
        by = y + h - 8 - bh               # lower part of the roof, clear of the number plate
    bx = cx - bw / 2
    ext = not url.startswith("/")
    tgt = ' target="_blank" rel="noopener"' if ext else ""
    where = url if len(url) > len(addr) + 9 else addr
    s = [f'<a class="sign" href="{e(url)}"{tgt} aria-label="{e(title)} — {e(addr)} (website sign for {e(name)})">'
         f'<title>{e(title)}\n{e(where)}</title>']
    s.append(f'<rect x="{bx + 2:.1f}" y="{by + 3:.1f}" width="{bw}" height="{bh}" rx="3" fill="#000" opacity=".35"/>')
    s.append(f'<rect class="bd" x="{bx:.1f}" y="{by:.1f}" width="{bw}" height="{bh}" rx="3" fill="#556b2f" stroke="#2e3b17" stroke-width="2.5"/>')
    s.append(f'<rect x="{bx + 3:.1f}" y="{by + 3:.1f}" width="{bw - 6}" height="{bh - 6}" rx="2" fill="none" stroke="#ffd700" stroke-opacity=".35" stroke-width="1"/>')
    for i, l in enumerate(lines):
        ty = by + SIGN_PAD_Y + SIGN_LINE * i + SIGN_FONT - 2
        s.append(f'<text x="{cx:.1f}" y="{ty:.1f}" text-anchor="middle">{e(l)}</text>')
    s.append("</a>")
    return "".join(s)


def signs():
    return '<g class="signs">' + "".join(sign(b) for b in BUILDINGS) + "</g>"


SIGN_CSS = (".sign{cursor:pointer}.sign text{font:700 15px Arial,\"Liberation Sans\",sans-serif;fill:#ffd700}"
            ".sign:hover .bd,.sign:focus-visible .bd{stroke:#ffd700}.sign:focus{outline:none}")

# NOTE: index.html's vault building (WAYBACK MEDIA LIBRARY artwork and wording) was hand-edited after the last
# generation; regenerating from this file would revert it. Carry that change in here before a full regeneration.

ROOFS = {
    "slate": ("#4a5560", "#5a6672"),
    "copper": ("#4f7a6b", "#5f8b7b"),
    "green": ("#3f5a3a", "#4e6b48"),
    "red": ("#7c3a31", "#8f463c"),
    "concrete": ("#8a8a80", "#9a9a90"),
    "earth": ("#5d6b3e", "#6c7a4a"),
}

random.seed(1667)


def trees():
    out = []
    zones = [(0, 0, 1600, 110), (0, 0, 110, 1000), (1490, 0, 110, 1000), (0, 930, 640, 70), (960, 930, 640, 70),
             (130, 780, 280, 130), (1180, 760, 300, 150), (1420, 120, 60, 220), (680, 860, 150, 60)]
    for x0, y0, w, h in zones:
        n = int(w * h / 1800)
        for _ in range(n):
            x = x0 + random.random() * w
            y = y0 + random.random() * h
            r = 9 + random.random() * 14
            g = random.choice(["#2f4a2b", "#34522f", "#3b5a34", "#2a4327"])
            if 194 <= x <= 406 and 806 <= y <= 906:   # clearing for The Library (15), added 19 Oct 2026
                continue
            if 632 <= x <= 776 and 806 <= y <= 906:   # clearing for the Project Office (16), added 19 Oct 2026
                continue
            if 1088 <= x <= 1214 and 794 <= y <= 906:  # clearing for the Family Quarters (17), added 19 Oct 2026
                continue
            if 140 <= x <= 234 and 640 <= y <= 716:    # clearing for the E-book annex (18), added 20 Oct 2026
                continue
            out.append(f'<circle cx="{x:.0f}" cy="{y + 4:.0f}" r="{r:.0f}" fill="#000" opacity=".22"/>'
                       f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{g}"/>'
                       f'<circle cx="{x - r * .3:.0f}" cy="{y - r * .3:.0f}" r="{r * .45:.0f}" fill="#fff" opacity=".06"/>')
    return "".join(out)


def vehicles():
    out = []
    for row in range(3):
        for col in range(7):
            x = 1215 + col * 34
            y = 800 + row * 40
            c = random.choice(["#5a6448", "#4b5540", "#6b705a", "#3e4636"])
            out.append(f'<rect x="{x}" y="{y}" width="22" height="30" rx="3" fill="{c}"/>'
                       f'<rect x="{x + 3}" y="{y + 4}" width="16" height="9" rx="2" fill="#000" opacity=".25"/>')
    return "".join(out)


def building(b):
    bid, name, dept, desc, url, x, y, w, h, roof, status, extra = b
    dark, light = ROOFS[roof]
    s = [f'<g class="bld" id="b-{bid}" tabindex="0" role="button" aria-label="{e(name)}: {e(dept)}" data-id="{bid}">']
    if extra == "mound":
        s.append(f'<ellipse cx="{x + w / 2}" cy="{y + h / 2 + 6}" rx="{w / 2 + 18}" ry="{h / 2 + 14}" fill="#000" opacity=".25"/>'
                 f'<ellipse cx="{x + w / 2}" cy="{y + h / 2}" rx="{w / 2 + 18}" ry="{h / 2 + 14}" fill="#56653a"/>'
                 f'<ellipse cx="{x + w / 2 - 10}" cy="{y + h / 2 - 8}" rx="{w / 2 - 6}" ry="{h / 2 - 8}" fill="#62723f"/>'
                 f'<rect x="{x + w / 2 - 22}" y="{y + h - 8}" width="44" height="22" fill="#3a3f36"/>')
    else:
        s.append(f'<rect x="{x + 8}" y="{y + 10}" width="{w}" height="{h}" fill="#000" opacity=".32"/>'
                 f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{dark}"/>'
                 f'<rect x="{x}" y="{y}" width="{w}" height="{h / 2}" fill="{light}"/>'
                 f'<line x1="{x}" y1="{y + h / 2}" x2="{x + w}" y2="{y + h / 2}" stroke="#000" stroke-opacity=".25" stroke-width="2"/>')
        for i in range(1, int(w // 40)):
            s.append(f'<line x1="{x + i * 40}" y1="{y + 4}" x2="{x + i * 40}" y2="{y + h - 4}" stroke="#000" stroke-opacity=".08"/>')
        s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="#1d2420" stroke-opacity=".5" stroke-width="2"/>')
    if extra == "annex":   # small sub-building joined to the Archive Vault by a covered walkway
        s = [s[0], f'<rect x="{x + w}" y="{y + 20}" width="{234 - x - w}" height="16" fill="#d6b15f" stroke="#191716" stroke-width="2"/>'
             f'<rect x="{x + 6}" y="{y + 8}" width="{w}" height="{h}" fill="#000" opacity=".38"/>'
             f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#191716" stroke="#d6b15f" stroke-width="3"/>'
             f'<rect x="{x}" y="{y}" width="{w}" height="10" fill="#a20f21"/>'
             f'<path d="M{x + w - 15} {y + 28} q-6 -4 -12 0 v14 q6 -4 12 0 q6 -4 12 0 v-14 q-6 -4 -12 0z" fill="#fff4d3" stroke="#d6b15f" stroke-width="1.5"/>'
             f'<line x1="{x + w - 15}" y1="{y + 28}" x2="{x + w - 15}" y2="{y + 42}" stroke="#d6b15f" stroke-width="1.5"/>']
    if extra == "radar":
        s.append(f'<circle cx="{x + w + 34}" cy="{y + 40}" r="28" fill="#000" opacity=".3"/>'
                 f'<circle cx="{x + w + 30}" cy="{y + 34}" r="28" fill="#e7e4da"/><circle cx="{x + w + 22}" cy="{y + 26}" r="10" fill="#fff" opacity=".6"/>')
    if extra == "mast":
        s.append(f'<line x1="{x + w + 30}" y1="{y + 10}" x2="{x + w + 30}" y2="{y + 90}" stroke="#c9c6bb" stroke-width="3"/>'
                 f'<line x1="{x + w + 36}" y1="{y + 16}" x2="{x + w + 36}" y2="{y + 96}" stroke="#000" stroke-opacity=".3" stroke-width="3"/>'
                 f'<circle cx="{x + w + 30}" cy="{y + 10}" r="5" fill="#c8102e"/>')
    if extra == "flag":
        s.append(f'<line x1="{x + w / 2}" y1="{y + h + 70}" x2="{x + w / 2}" y2="{y + h + 22}" stroke="#ddd" stroke-width="3"/>'
                 f'<path d="M{x + w / 2} {y + h + 22} l34 8 l-34 8z" fill="#c8102e"/>')
    # number plate
    s.append(f'<rect class="plate" x="{x + 8}" y="{y + 8}" width="34" height="20" rx="3" fill="#f2efe6"/>'
             f'<text x="{x + 25}" y="{y + 22}" text-anchor="middle" class="pn">{BUILDINGS.index(b) + 1}</text>')
    s.append(f'<rect class="hit" x="{x - 6}" y="{y - 6}" width="{w + 12}" height="{h + 12}" fill="transparent"/>')
    s.append('</g>')
    return "".join(s)


def page():
    data = ",".join(
        '{"id":"%s","n":"%s","d":"%s","t":"%s","u":"%s","s":"%s"}' % tuple(
            x.replace("\\", "\\\\").replace('"', '\\"') for x in (b[0], b[1], b[2], b[3], b[4], b[10]))
        for b in BUILDINGS)
    directory = "".join(
        f'<li><a href="{e(b[4])}"{"" if b[4].startswith("/") else " target=\"_blank\" rel=\"noopener\""}>'
        f'<span class="dn">{BUILDINGS.index(b) + 1}</span><span class="dt"><b>{e(b[1])}</b> {e(b[2])}</span>'
        f'<span class="du">{e(b[4].replace("https://", "").rstrip("/") if b[4] != "/webapp/" else "bucklerfamily.estate/webapp")}</span></a></li>'
        for b in BUILDINGS)
    blds = "".join(building(b) for b in BUILDINGS)
    return f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Tŷ Mawr Campus · bucklerfamily.estate</title>
<meta name="description" content="Great House Farm / Tŷ Mawr, Llandough: every part of the case in one place. The museum, the evidence quest, the council briefing, the records and the Wiki.">
<meta property="og:title" content="Tŷ Mawr Campus">
<meta property="og:description" content="Great House Farm / Tŷ Mawr, Llandough: the museum, the evidence quest, the council briefing, the records and the Wiki.">
<meta name="theme-color" content="#2b3a26">
<script>
(function(){{var q=location.search;if(/payment_status=/.test(q)){{location.replace('/webapp/'+q+location.hash);}}}})();
</script>
<style>
*{{box-sizing:border-box}}
html,body{{margin:0;height:100%;background:#3a4a32;color:#f2efe6;font-family:"Archivo","Arial Narrow",Arial,sans-serif;overflow:hidden}}
a{{color:inherit}}
:focus-visible{{outline:3px solid #f2c94c;outline-offset:3px}}
.wrap{{position:fixed;inset:0;overflow:hidden}}
.wrap.pan{{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}}
#map{{display:block;width:100%;height:100%}}
.wrap.pan #map{{width:auto;height:100%;aspect-ratio:1.6}}
.bld{{cursor:pointer}}
.bld:focus{{outline:none}}
.bld .hit{{transition:stroke .15s}}
.bld:hover .hit,.bld:focus-visible .hit{{stroke:#f2c94c;stroke-width:4;stroke-dasharray:10 6}}
.bld.sel .hit{{stroke:#f2c94c;stroke-width:5}}
.pn{{font:800 13px Arial,sans-serif;fill:#1d2420}}
.road-label{{font:700 13px Arial,sans-serif;fill:#d8d4c6;opacity:.55;letter-spacing:.2em}}
{SIGN_CSS}
.brand{{position:fixed;left:16px;top:14px;max-width:min(420px,calc(100vw - 32px));pointer-events:none;text-shadow:0 1px 6px #000a}}
.brand h1{{margin:0;font-size:clamp(1.5rem,3.4vw,2.4rem);line-height:1;font-weight:900;letter-spacing:-.01em}}
.brand p{{margin:6px 0 0;font-size:.92rem;color:#e6e2d4}}
.tools{{position:fixed;right:16px;top:14px;display:flex;gap:8px}}
.btn{{background:#1d2420e6;color:#f2efe6;border:1px solid #f2efe633;font:700 .85rem Arial,sans-serif;padding:9px 13px;cursor:pointer;border-radius:3px;text-decoration:none}}
.btn:hover{{border-color:#f2c94c}}
.callout{{position:fixed;z-index:5;width:min(330px,calc(100vw - 24px));background:#f2efe6;color:#1d2420;border-top:5px solid #c8102e;padding:14px 16px 14px;box-shadow:0 10px 30px #0008;display:none}}
.callout.on{{display:block}}
.callout .k{{font-size:.78rem;font-weight:800;color:#c8102e;margin:0 0 2px;padding-right:22px}}
.callout h2{{margin:0 0 6px;font-size:1.35rem;line-height:1.1}}
.callout p{{margin:0 0 10px;font-size:.92rem;line-height:1.4}}
.callout .url{{display:block;font-weight:800;font-size:.92rem;word-break:break-all;margin-bottom:10px}}
.callout .open{{display:inline-block;background:#c8102e;color:#fff;font-weight:800;text-decoration:none;padding:8px 12px;font-size:.9rem}}
.callout .st{{font-size:.78rem;color:#5b6670;margin-left:8px}}
.callout .x{{position:absolute;right:8px;top:6px;background:none;border:0;font-size:1.4rem;cursor:pointer;color:#1d2420}}
.dir{{position:fixed;right:16px;top:58px;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 150px);overflow:auto;background:#1d2420f2;border:1px solid #f2efe633;padding:6px 0;display:none;z-index:6}}
.dir.on{{display:block}}
.dir ul{{list-style:none;margin:0;padding:0}}
.dir a{{display:grid;grid-template-columns:28px 1fr;gap:2px 10px;padding:9px 14px;text-decoration:none;border-bottom:1px solid #ffffff12}}
.dir a:hover{{background:#ffffff10}}
.dn{{grid-row:1/3;font-weight:900;color:#f2c94c}}
.dt{{font-size:.92rem}}.dt b{{margin-right:4px}}
.du{{font-size:.8rem;color:#c9c6bb;word-break:break-all}}
.webapp{{position:fixed;right:16px;bottom:16px;display:flex;align-items:center;gap:10px;background:#f2efe6;color:#1d2420;text-decoration:none;padding:8px 14px 8px 8px;border-radius:40px;box-shadow:0 8px 24px #0009;font-weight:800}}
.webapp svg{{width:40px;height:40px;flex:none}}
.webapp span{{display:flex;flex-direction:column;line-height:1.1;font-size:.95rem}}
.webapp small{{font-weight:600;font-size:.78rem;color:#5b6670}}
.webapp:hover{{outline:3px solid #f2c94c}}
.hint{{position:fixed;left:16px;bottom:16px;font-size:.82rem;color:#e6e2d4;text-shadow:0 1px 4px #000;max-width:calc(100vw - 260px)}}
@media (max-width:600px){{.brand p{{display:none}}.hint{{display:none}}.webapp span{{font-size:.85rem}}}}
@media (prefers-reduced-motion:reduce){{*{{transition:none!important}}}}
</style>
</head>
<body>
<div class="wrap" id="wrap"><svg id="map" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="mt">
<title id="mt">Aerial map of the Tŷ Mawr case campus. Each building is a part of the case; select one to see its address.</title>
<defs>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .16 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<pattern id="field" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><rect width="60" height="60" fill="#4a5c3d"/><rect width="60" height="30" fill="#4f6241"/></pattern>
</defs>
<rect width="1600" height="1000" fill="#3f5035"/>
<rect x="-200" y="-200" width="2000" height="1400" fill="url(#field)" opacity=".55"/>
<rect width="1600" height="1000" filter="url(#grain)" fill="#000"/>
<!-- base ground -->
<rect x="130" y="120" width="1340" height="800" rx="26" fill="#5b6a4b"/>
<rect x="130" y="120" width="1340" height="800" rx="26" fill="none" stroke="#c9c6bb" stroke-width="3" stroke-dasharray="3 7" opacity=".7"/>
<rect x="142" y="132" width="1316" height="776" rx="20" fill="none" stroke="#2e3829" stroke-width="2" opacity=".6"/>
<!-- roads -->
<g fill="#6f6e66">
<rect x="160" y="350" width="1280" height="34"/>
<rect x="160" y="565" width="1280" height="30"/>
<rect x="780" y="310" width="40" height="690"/>
<rect x="150" y="760" width="1300" height="26"/>
<rect x="590" y="384" width="26" height="380"/>
<rect x="1190" y="300" width="26" height="470"/>
</g>
<g stroke="#e8e4d6" stroke-width="2" stroke-dasharray="18 14" opacity=".6">
<line x1="160" y1="367" x2="1440" y2="367"/><line x1="160" y1="580" x2="1440" y2="580"/><line x1="800" y1="310" x2="800" y2="1000"/>
</g>
<text class="road-label" x="250" y="375">NORTH ROAD</text>
<text class="road-label" x="1250" y="587">SOUTH ROAD</text>
<!-- parade square -->
<rect x="640" y="410" width="300" height="140" fill="#9b9a90"/>
<rect x="640" y="410" width="300" height="140" fill="none" stroke="#e8e4d6" stroke-width="2" opacity=".5"/>
<!-- helipad -->
<circle cx="1355" cy="230" r="58" fill="#6f6e66"/><circle cx="1355" cy="230" r="46" fill="none" stroke="#e8e4d6" stroke-width="4"/>
<text x="1355" y="248" text-anchor="middle" font-family="Arial" font-weight="900" font-size="46" fill="#e8e4d6">H</text>
<!-- vehicle park -->
<rect x="1200" y="785" width="250" height="125" fill="#6f6e66"/>{vehicles()}
<!-- gate -->
<rect x="760" y="900" width="80" height="34" fill="#4a5560"/><rect x="740" y="912" width="120" height="6" fill="#c8102e"/>
{trees()}
{blds}
<!-- website-name signboards (generated by campus/build_campus.py signs()) -->
{signs()}
</svg></div>

<div class="brand">
  <h1>Tŷ Mawr Campus</h1>
  <p>Great House Farm, Llandough. Every part of the case, one building each. Select a building to see where it lives.</p>
</div>
<div class="tools">
  <button class="btn" type="button" id="dirbtn" aria-expanded="false" aria-controls="dir">Directory</button>
</div>
<nav class="dir" id="dir" aria-label="Directory of buildings"><ul>{directory}</ul></nav>

<div class="callout" id="co" role="dialog" aria-live="polite" aria-labelledby="co-h">
  <button class="x" type="button" aria-label="Close">×</button>
  <p class="k" id="co-k"></p>
  <h2 id="co-h"></h2>
  <p id="co-d"></p>
  <a class="url" id="co-u" href="#"></a>
  <a class="open" id="co-o" href="#">Open</a><span class="st" id="co-s"></span>
</div>

<p class="hint">Not Llandough-juxta-Cowbridge, nor the Great House at Llandow or Aberthin.</p>

<a class="webapp" href="/webapp/" aria-label="Great House WebApp: search whether your family has land too">
  <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#c8102e"/><path d="M10 21 20 12l10 9v9h-7v-6h-6v6h-7z" fill="#fff"/></svg>
  <span>Great House WebApp<small>Search: has your family land too?</small></span>
</a>

<script>
(function(){{
var wrap=document.getElementById('wrap'),svg=document.getElementById('map');
function fit(){{var pan=innerWidth/innerHeight<1.25;wrap.classList.toggle('pan',pan);svg.setAttribute('preserveAspectRatio',pan?'xMidYMid meet':'xMidYMid slice');if(pan&&!wrap.dataset.c){{wrap.scrollLeft=(wrap.scrollWidth-wrap.clientWidth)/2;wrap.dataset.c=1;}}}}
fit();addEventListener('resize',fit);
wrap.addEventListener('scroll',function(){{if(cur)place(cur);}});
var B=[{data}];
var by={{}};B.forEach(function(b){{by[b.id]=b;}});
var co=document.getElementById('co'),cur=null;
function label(u){{if(u.charAt(0)==='/')return 'bucklerfamily.estate'+u.replace(/\\/$/,'');var t=u.replace('https://','').replace(/\\/$/,'');if(t.length<=46)return t;var parts=t.split('/');var last=parts[parts.length-1].replace(/-/g,' ');return parts[0]+' › '+last.charAt(0).toUpperCase()+last.slice(1);}}
function place(g){{
  var r=g.getBoundingClientRect(),w=co.offsetWidth,h=co.offsetHeight,vw=innerWidth,vh=innerHeight;
  var x=r.left+r.width/2-w/2,y=r.top-h-12;
  if(y<70)y=r.bottom+12;
  if(y+h>vh-80)y=Math.max(70,vh-80-h);
  x=Math.max(12,Math.min(vw-w-12,x));
  co.style.left=x+'px';co.style.top=y+'px';
}}
function select(id){{
  var b=by[id];if(!b)return;
  if(cur)cur.classList.remove('sel');
  cur=document.getElementById('b-'+id);cur.classList.add('sel');
  document.getElementById('co-k').textContent=b.d;
  document.getElementById('co-h').textContent=b.n;
  document.getElementById('co-d').textContent=b.t;
  var u=document.getElementById('co-u'),o=document.getElementById('co-o');
  u.textContent=label(b.u);u.href=b.u;o.href=b.u;
  var ext=b.u.charAt(0)!=='/';
  [u,o].forEach(function(a){{if(ext){{a.target='_blank';a.rel='noopener';}}else{{a.removeAttribute('target');}}}});
  document.getElementById('co-s').textContent=b.s==='provisioned'?'Being set up':'';
  co.classList.add('on');place(cur);
  try{{history.replaceState(null,'','#'+id);}}catch(e){{}}
}}
function close(){{co.classList.remove('on');if(cur){{cur.classList.remove('sel');cur.focus();}}cur=null;try{{history.replaceState(null,'',location.pathname);}}catch(e){{}}}}
Array.prototype.forEach.call(document.querySelectorAll('.bld'),function(g){{
  g.addEventListener('click',function(ev){{ev.stopPropagation();select(g.dataset.id);}});
  g.addEventListener('keydown',function(ev){{if(ev.key==='Enter'||ev.key===' '){{ev.preventDefault();select(g.dataset.id);}}}});
}});
co.querySelector('.x').addEventListener('click',close);
document.getElementById('map').addEventListener('click',function(){{if(cur)close();}});
addEventListener('keydown',function(ev){{if(ev.key==='Escape'){{if(cur)close();dir.classList.remove('on');db.setAttribute('aria-expanded','false');}}}});
addEventListener('resize',function(){{if(cur)place(cur);}});
var db=document.getElementById('dirbtn'),dir=document.getElementById('dir');
db.addEventListener('click',function(){{var on=dir.classList.toggle('on');db.setAttribute('aria-expanded',on?'true':'false');}});
var h=location.hash.slice(1);if(by[h])setTimeout(function(){{select(h);}},60);
}})();
</script>
</body>
</html>
"""


if __name__ == "__main__":
    open(OUT, "w", encoding="utf-8").write(page())
    print("wrote", os.path.relpath(OUT))
