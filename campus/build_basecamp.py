#!/usr/bin/env python3
"""Build the bucklerfamily.estate BASE CAMP map (root index.html) and the shared back-link script.

Source of truth: campus/basecamp_stops.json (the numbered path).
Writes:
  index.html                      the base camp map (root of bucklerfamily.estate; Vite input "campus")
  public/ghf-lang/basecamp.js     "Back to base camp" link + "stop N, next" hint + each site's two-colour identity
                                  (band, header, buttons, links), loaded by ghf-lang.js on every GHF site
  public/basecamp.json            the path as JSON, for any site that wants it
The original campus map now lives at campus/index.html (/campus/), built by campus/build_campus.py.
Run: python3 campus/build_basecamp.py      — Sion's Tab agent, 20 Oct 2026
"""
import json, os, html, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
D = json.load(open(os.path.join(HERE, "basecamp_stops.json"), encoding="utf-8"))
STOPS = D["stops"]
SHOP = D["shop"]
esc = lambda s: html.escape(s, quote=True)

# ---------- text wrapping (estimated Barlow widths) ----------
def wrap(text, max_chars):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if len(t) <= max_chars or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

W = 390
TXT_W = 206
TITLE_CH, CAP_CH = 19, 31

# ---------- building icons (line art, ~110x84, centred on cx, base at cy+34) ----------
ST = 'stroke="#fff" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"'
def ground(cx, cy, w=58):
    return f'<ellipse cx="{cx}" cy="{cy+36}" rx="{w}" ry="9" fill="#ffffff" opacity=".07"/>'
def roof_house(cx, cy, w=70, h=40, roof=24, fill="#0d0d0d"):
    x0, x1, yb, yt = cx - w/2, cx + w/2, cy + 34, cy + 34 - h
    return (f'<path d="M{x0} {yb} V{yt} H{x1} V{yb} Z" fill="{fill}" {ST}/>'
            f'<path d="M{x0-3} {yt} L{cx} {yt-roof} L{x1+3} {yt} Z" fill="__ROOF__" {ST}/>')
def door(cx, cy, w=12, h=18):
    return f'<rect x="{cx-w/2}" y="{cy+34-h}" width="{w}" height="{h}" rx="1.5" fill="#f2c94c" opacity=".9"/>'
def win(x, y, w=9, h=9, lit=True):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{"#f2c94c" if lit else "#262626"}" opacity="{".85" if lit else "1"}" stroke="#fff" stroke-width=".8"/>'

def _shade(hx, f):
    """Darken a #rrggbb colour by factor f (0..1 keeps that share of each channel)."""
    hx = hx.lstrip("#"); return "#" + "".join(f"{int(int(hx[i:i+2], 16) * f):02x}" for i in (0, 2, 4))

def paint(svg_str, colors):
    """Two-colour identity (campus/basecamp_stops.json "colors"): walls = primary, roof/trim/door = secondary."""
    if not colors: return svg_str.replace("__ROOF__", "#0d0d0d")
    p, s = colors
    return (svg_str.replace("#0d0d0d", p).replace("#141414", _shade(p, .62))
                   .replace("#f2c94c", s).replace("__ROOF__", s))

def icon(kind, cx, cy, big=False, colors=None):
    return paint(_icon(kind, cx, cy, big), colors)

def _icon(kind, cx, cy, big=False):
    g = [ground(cx, cy, 64 if big else 56)]
    if kind == "library":   # classical library, columns
        g.append(f'<path d="M{cx-48} {cy+34} H{cx+48} V{cy+28} H{cx-48} Z" fill="#0d0d0d" {ST}/>')
        g.append(f'<path d="M{cx-44} {cy-6} H{cx+44} L{cx} {cy-30} Z" fill="__ROOF__" {ST}/>')
        g.append(f'<rect x="{cx-44}" y="{cy-6}" width="88" height="6" fill="#0d0d0d" {ST}/>')
        for i in range(5):
            x = cx - 36 + i*18
            g.append(f'<rect x="{x-3.5}" y="{cy}" width="7" height="28" fill="#141414" {ST}/>')
        g.append(f'<circle cx="{cx}" cy="{cy-17}" r="4" fill="#f2c94c"/>')
    elif kind == "book":
        g.append(roof_house(cx, cy, 64, 36, 20))
        g.append(f'<path d="M{cx-22} {cy-8} q11 -6 22 0 q11 -6 22 0 v26 q-11 -6 -22 0 q-11 -6 -22 0 Z" fill="#141414" {ST}/>')
        g.append(f'<path d="M{cx} {cy-8} v26" {ST}/>')
        g.append(f'<path d="M{cx-17} {cy-1} h12 M{cx-17} {cy+5} h12 M{cx+5} {cy-1} h12 M{cx+5} {cy+5} h12" stroke="#f2c94c" stroke-width="1.2"/>')
    elif kind == "frog":    # pond hut with a frog on a lily pad: leads checked and set aside
        g.append(roof_house(cx, cy, 58, 34, 18))
        g.append(f'<ellipse cx="{cx}" cy="{cy+30}" rx="40" ry="7" fill="#0b2a1a" {ST}/>')
        g.append(f'<ellipse cx="{cx+18}" cy="{cy+29}" rx="11" ry="3.5" fill="#1f5c3a"/>')
        g.append(f'<ellipse cx="{cx}" cy="{cy+6}" rx="14" ry="10" fill="#2f7d4f" {ST}/>')
        g.append(f'<circle cx="{cx-7}" cy="{cy-4}" r="4.5" fill="#2f7d4f" {ST}/><circle cx="{cx+7}" cy="{cy-4}" r="4.5" fill="#2f7d4f" {ST}/>')
        g.append(f'<circle cx="{cx-7}" cy="{cy-4}" r="1.6" fill="#0d0d0d"/><circle cx="{cx+7}" cy="{cy-4}" r="1.6" fill="#0d0d0d"/>')
        g.append(f'<path d="M{cx-6} {cy+8} q6 4 12 0" stroke="#f2c94c" stroke-width="1.4" fill="none"/>')
    elif kind == "chess":
        g.append(f'<path d="M{cx-44} {cy+34} L{cx-30} {cy-14} H{cx+30} L{cx+44} {cy+34} Z" fill="#0d0d0d" {ST}/>')
        s = 8
        for r in range(5):
            for c in range(8):
                if (r + c) % 2 == 0:
                    y = cy - 10 + r*s*1.1
                    shrink = (4 - r) * 2.6
                    x = cx - 32 - (r*2.8) + c*(8 + r*0.7) + 0
                    g.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{7+r*0.7:.1f}" height="{s:.1f}" fill="#fff" opacity=".85"/>')
        g.append(f'<path d="M{cx+18} {cy-14} v-10 h-4 v-4 h12 v4 h-4 v10" fill="#0d0d0d" {ST}/>')
    elif kind == "court":
        g.append(f'<path d="M{cx-50} {cy+34} H{cx+50} V{cy+28} H{cx-50} Z" fill="#0d0d0d" {ST}/>')
        g.append(f'<path d="M{cx-46} {cy-8} H{cx+46} L{cx} {cy-34} Z" fill="__ROOF__" {ST}/>')
        for i in range(4):
            x = cx - 33 + i*22
            g.append(f'<rect x="{x-4}" y="{cy-8}" width="8" height="36" fill="#141414" {ST}/>')
        g.append(f'<circle cx="{cx+30}" cy="{cy-34}" r="11" fill="#0d0d0d" stroke="#f2c94c" stroke-width="2"/>')
        g.append(f'<path d="M{cx+38} {cy-26} l9 9" stroke="#f2c94c" stroke-width="3" stroke-linecap="round"/>')
    elif kind == "cabinet":
        g.append(roof_house(cx, cy, 70, 44, 14))
        for i in range(3):
            y = cy - 6 + i*13
            g.append(f'<rect x="{cx-18}" y="{y}" width="36" height="11" fill="#141414" {ST}/>')
            g.append(f'<rect x="{cx-5}" y="{y+4}" width="10" height="3" fill="#f2c94c"/>')
    elif kind == "vault":
        g.append(f'<rect x="{cx-38}" y="{cy-16}" width="76" height="50" rx="4" fill="#0d0d0d" {ST}/>')
        g.append(f'<rect x="{cx-42}" y="{cy-22}" width="84" height="7" rx="2" fill="__ROOF__" {ST}/>')
        g.append(f'<circle cx="{cx}" cy="{cy+8}" r="17" fill="#141414" {ST}/>')
        g.append(f'<circle cx="{cx}" cy="{cy+8}" r="5" fill="#f2c94c"/>')
        for a in range(0, 360, 60):
            import math
            x2 = cx + 13*math.cos(math.radians(a)); y2 = cy + 8 + 13*math.sin(math.radians(a))
            g.append(f'<path d="M{cx} {cy+8} L{x2:.1f} {y2:.1f}" stroke="#fff" stroke-width="1.2"/>')
    elif kind == "post":
        g.append(roof_house(cx, cy, 70, 40, 18))
        g.append(f'<rect x="{cx-20}" y="{cy-4}" width="40" height="26" fill="#141414" {ST}/>')
        g.append(f'<path d="M{cx-20} {cy-4} L{cx} {cy+10} L{cx+20} {cy-4}" fill="none" stroke="#f2c94c" stroke-width="1.6"/>')
    elif kind == "columns":
        g.append(f'<path d="M{cx-44} {cy+34} H{cx+44} V{cy+29} H{cx-44} Z" fill="#0d0d0d" {ST}/>')
        g.append(f'<path d="M{cx-40} {cy-10} H{cx+40} L{cx} {cy-28} Z" fill="__ROOF__" {ST}/>')
        for i in range(3):
            x = cx - 26 + i*26
            g.append(f'<rect x="{x-5}" y="{cy-10}" width="10" height="39" fill="#141414" {ST}/>')
        g.append(f'<path d="M{cx} {cy-28} v-12 l12 4 l-12 4" fill="#f2c94c" stroke="#f2c94c" stroke-width="1"/>')
    elif kind == "target":
        g.append(f'<rect x="{cx-4}" y="{cy+6}" width="8" height="28" fill="#141414" {ST}/>')
        for r, f in ((28, "#0d0d0d"), (20, "#141414"), (12, "#0d0d0d"), (5, "#f2c94c")):
            g.append(f'<circle cx="{cx}" cy="{cy-8}" r="{r}" fill="{f}" stroke="#fff" stroke-width="1.4"/>')
        g.append(f'<path d="M{cx+30} {cy-30} L{cx+3} {cy-10}" stroke="#fff" stroke-width="1.6"/><path d="M{cx+30} {cy-30} l6 -2 m-6 2 l2 -6" stroke="#fff" stroke-width="1.6"/>')
    elif kind == "hall":
        g.append(roof_house(cx, cy, 76, 38, 22))
        g.append(f'<text x="{cx}" y="{cy+16}" text-anchor="middle" class="ic">Q&amp;A</text>')
    elif kind == "council":
        g.append(roof_house(cx, cy, 72, 40, 20))
        g.append(f'<rect x="{cx-6}" y="{cy-36}" width="12" height="14" fill="#0d0d0d" {ST}/>')
        g.append(f'<circle cx="{cx}" cy="{cy-29}" r="3.5" fill="#f2c94c"/>')
        g.append(win(cx-26, cy+2)); g.append(win(cx+17, cy+2))
        g.append(door(cx, cy))
    elif kind == "chamber":
        g.append(f'<path d="M{cx-40} {cy+34} V{cy-4} A40 26 0 0 1 {cx+40} {cy-4} V{cy+34} Z" fill="#0d0d0d" {ST}/>')
        for i in range(4):
            g.append(win(cx-31+i*17, cy+4, 8, 12, i % 2 == 0))
        g.append(f'<text x="{cx}" y="{cy-12}" text-anchor="middle" class="ic2">22·10</text>')
    elif kind == "magnifier":
        g.append(roof_house(cx, cy, 64, 36, 18))
        g.append(f'<circle cx="{cx-3}" cy="{cy+6}" r="11" fill="#141414" stroke="#f2c94c" stroke-width="2"/>')
        g.append(f'<path d="M{cx+5} {cy+14} l9 9" stroke="#f2c94c" stroke-width="3" stroke-linecap="round"/>')
    elif kind == "search":
        g.append(f'<path d="M{cx-40} {cy+34} V{cy-10} H{cx+40} V{cy+34} Z" fill="#0d0d0d" {ST}/>')
        g.append(f'<path d="M{cx-40} {cy-10} L{cx} {cy-30} L{cx+40} {cy-10} Z" fill="__ROOF__" {ST}/>')
        for i in range(6):
            g.append(f'<rect x="{cx-30+i*10}" y="{cy}" width="6" height="22" fill="{"#f2c94c" if i in (1,4) else "#2a2a2a"}" stroke="#fff" stroke-width=".7"/>')
    elif kind == "office":
        g.append(f'<rect x="{cx-26}" y="{cy-30}" width="52" height="64" fill="#0d0d0d" {ST}/>')
        g.append(f'<rect x="{cx-30}" y="{cy-36}" width="60" height="6" fill="__ROOF__" {ST}/>')
        for r in range(4):
            for c in range(3):
                g.append(win(cx-19+c*14, cy-24+r*13, 8, 8, (r+c) % 3 != 0))
    elif kind == "film":
        g.append(roof_house(cx, cy, 72, 38, 14))
        g.append(f'<rect x="{cx-22}" y="{cy-2}" width="44" height="24" fill="#141414" {ST}/>')
        g.append(f'<path d="M{cx-22} {cy-2} l6 -10 h44 l-6 10" fill="__ROOF__" {ST}/>')
        g.append(f'<path d="M{cx-12} {cy-12} l-5 10 M{cx} {cy-12} l-5 10 M{cx+12} {cy-12} l-5 10" stroke="#f2c94c" stroke-width="2"/>')
        g.append(f'<path d="M{cx-5} {cy+4} v12 l11 -6 Z" fill="#f2c94c"/>')
    elif kind == "album":
        g.append(roof_house(cx, cy, 64, 36, 20))
        g.append(f'<rect x="{cx-18}" y="{cy-4}" width="36" height="26" fill="#141414" {ST}/>')
        g.append(f'<path d="M{cx-14} {cy+18} l9 -10 l6 6 l5 -5 l8 9 Z" fill="#f2c94c"/>')
        g.append(f'<circle cx="{cx+8}" cy="{cy+3}" r="3" fill="#fff"/>')
    elif kind == "campus":
        g.append(f'<path d="M{cx-44} {cy+30} L{cx-28} {cy-14} L{cx-8} {cy-4} L{cx+12} {cy-16} L{cx+44} {cy+30} Z" fill="#0d0d0d" {ST}/>')
        g.append(f'<path d="M{cx-28} {cy-14} L{cx-20} {cy+30} M{cx+12} {cy-16} L{cx+4} {cy+30}" stroke="#fff" stroke-width=".8" opacity=".6"/>')
        g.append(f'<path d="M{cx+20} {cy-6} c0 -12 18 -12 18 0 c0 8 -9 16 -9 20 c0 -4 -9 -12 -9 -20 Z" fill="#f2c94c"/>')
        g.append(f'<circle cx="{cx+29}" cy="{cy-6}" r="3" fill="#0d0d0d"/>')
    elif kind == "treasury":   # domed treasury with a coin: Cedwyn Estate coins (store credit), /coins/
        g.append(f'<rect x="{cx-40}" y="{cy+28}" width="80" height="6" fill="#0d0d0d" {ST}/>')
        g.append(f'<rect x="{cx-36}" y="{cy-4}" width="72" height="32" fill="#141414" {ST}/>')
        for i in range(4):
            g.append(f'<rect x="{cx-30+i*18}" y="{cy-2}" width="6" height="30" fill="#0d0d0d" {ST}/>')
        g.append(f'<rect x="{cx-40}" y="{cy-10}" width="80" height="6" fill="#0d0d0d" {ST}/>')
        g.append(f'<path d="M{cx-30} {cy-10} A30 24 0 0 1 {cx+30} {cy-10} Z" fill="__ROOF__" {ST}/>')
        g.append(f'<circle cx="{cx}" cy="{cy-40}" r="7" fill="#f2c94c" {ST}/>')
        g.append(f'<text x="{cx}" y="{cy-36.5}" text-anchor="middle" style="font:700 9px Barlow,Arial,sans-serif" fill="#0d0d0d">C</text>')
    elif kind == "counting":   # Georgian counting house with a pound-sign plaque and an open ledger: public accounts, accounts.bucklerfamily.estate
        g.append(f'<rect x="{cx-42}" y="{cy+28}" width="84" height="6" fill="#0d0d0d" {ST}/>')
        g.append(f'<rect x="{cx-38}" y="{cy-8}" width="76" height="36" fill="#141414" {ST}/>')
        g.append(f'<path d="M{cx-44} {cy-8} H{cx+44} L{cx} {cy-32} Z" fill="__ROOF__" {ST}/>')
        g.append(f'<circle cx="{cx}" cy="{cy-17}" r="6.5" fill="#0d0d0d" {ST}/>')
        g.append(f'<text x="{cx}" y="{cy-13.5}" text-anchor="middle" style="font:700 9px Barlow,Arial,sans-serif" fill="#f2c94c">£</text>')
        g.append(win(cx-31, cy-1, 10, 12)); g.append(win(cx+21, cy-1, 10, 12))
        g.append(f'<path d="M{cx-17} {cy+2} h14 v12 h-14 Z M{cx+3} {cy+2} h14 v12 h-14 Z" fill="#f2c94c" stroke="#fff" stroke-width=".8"/>')
        g.append(f'<path d="M{cx-14} {cy+6} h8 M{cx-14} {cy+9} h8 M{cx+6} {cy+6} h8 M{cx+6} {cy+9} h8" stroke="#0d0d0d" stroke-width=".9"/>')
        g.append(door(cx, cy, 12, 14))
    elif kind == "shop":
        w = 120
        g.append(f'<rect x="{cx-w/2}" y="{cy-22}" width="{w}" height="56" fill="#0d0d0d" {ST}/>')
        g.append(f'<path d="M{cx-w/2-6} {cy-22} H{cx+w/2+6} L{cx+w/2} {cy-40} H{cx-w/2} Z" fill="__ROOF__" {ST}/>')
        n = 8
        for i in range(n):
            x = cx - w/2 - 6 + i*(w+12)/n
            g.append(f'<path d="M{x:.1f} {cy-22} q{(w+12)/n/2:.1f} 12 {(w+12)/n:.1f} 0" fill="{"#f2c94c" if i % 2 == 0 else "#fff"}" stroke="#fff" stroke-width="1"/>')
        g.append(f'<rect x="{cx-44}" y="{cy-62}" width="88" height="18" rx="2" fill="#000" stroke="#f2c94c" stroke-width="1.4"/><path d="M{cx-30} {cy-44} v4 M{cx+30} {cy-44} v4" stroke="#f2c94c" stroke-width="1.4"/>')
        g.append(f'<text x="{cx}" y="{cy-49}" text-anchor="middle" class="ic3">GIFT SHOP</text>')
        g.append(f'<rect x="{cx-46}" y="{cy-2}" width="30" height="24" fill="#141414" {ST}/>')
        g.append(f'<rect x="{cx+16}" y="{cy-2}" width="30" height="24" fill="#141414" {ST}/>')
        g.append(f'<rect x="{cx-40}" y="{cy+4}" width="9" height="14" fill="#f2c94c"/><rect x="{cx-29}" y="{cy+7}" width="8" height="11" fill="#fff"/>')
        g.append(f'<path d="M{cx+22} {cy+6} h18 l-3 12 h-12 Z" fill="#fff"/><path d="M{cx+40} {cy+9} c5 0 5 6 0 6" fill="none" stroke="#fff" stroke-width="1.4"/>')
        g.append(door(cx, cy, 14, 24))
    else:
        g.append(roof_house(cx, cy))
        g.append(door(cx, cy))
    return "".join(g)

def tent(cx, cy):
    # Cedwyn Estate mark: a cartoon adapted from People's Collection Wales item 871431 (chapel Sale of Work at
    # Great House Farm: the chute slide and the refreshment tent). Creative Archive Licence; credit on /licence/.
    return (f'<ellipse cx="{cx}" cy="{cy+32}" rx="62" ry="9" fill="#fff" opacity=".07"/>'
            f'<image href="/brand/cedwyn-tent-icon-256.webp" x="{cx-50}" y="{cy-62}" width="100" height="100">'
            '<title>Cedwyn Estate: the tent and the slide at Great House Farm</title></image>')

# ---------- layout ----------
rows = []
y = 236
for i, s in enumerate(STOPS):
    left = (i % 2 == 0)
    big = s["key"] == "shop"
    title_l = wrap(s["title"].upper(), TITLE_CH)
    cap_l = wrap(s["caption"], CAP_CH)
    h_txt = 16 + len(title_l)*19 + 6 + len(cap_l)*17 + 22
    h = max(150, h_txt + 26) + (40 if big else 0)
    if big: y += 50
    bx = 88 if left else W - 88
    if big: bx = W/2
    rows.append(dict(s=s, left=left, big=big, cy=y, bx=bx, title=title_l, cap=cap_l, h=h, htxt=h_txt))
    y += h
H = y + 30

def stone_xy(r):
    return (r["bx"], r["cy"] + 56) if not r["big"] else (r["bx"], r["cy"] - 96)

def path_d():
    pts = [(W/2, 150)] + [stone_xy(r) for r in rows]
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        k = (y1 - y0) * 0.55
        d += f" C{x0:.1f} {y0 + k:.1f} {x1:.1f} {y1 - k:.1f} {x1:.1f} {y1:.1f}"
    return d

GO_SHORT = {"fcg": "the FCG department", "csscpsg": "the Grammar House", "kissed-frogs": "Kissed Frogs", "apps": "the Case Office"}
def go_label(s):
    """Readable link label for a map stop (the visible words; the href keeps the real URL)."""
    if s.get("go"): return s["go"]
    name = GO_SHORT.get(s["key"]) or re.sub(r"\s*\(.*?\)", "", s["title"]).strip()
    if name.startswith("The "): name = "the " + name[4:]
    return "Open " + name

def host_of(u):
    m = re.match(r"https?://([^/]+)(/[^#?]*)?", u)
    h = m.group(1).replace("www.", "")
    p = (m.group(2) or "/").rstrip("/")
    return (h + p) if p else h

svg = []
svg.append(f'<svg id="board" viewBox="0 0 {W} {H}" role="img" aria-labelledby="bt bd" xmlns="http://www.w3.org/2000/svg">')
svg.append(f'<title id="bt">Cedwyn Estate map: a numbered path of {len(STOPS)} buildings</title>')
svg.append('<desc id="bd">Start at the Legal Wiki and follow the stepping stones through each part of the Great House Farm record, ending at the gift shop and marketplace.</desc>')
svg.append('<defs><pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="#fff" stroke-opacity=".045" stroke-width="1"/></pattern>'
           '<radialGradient id="glow" cx="50%" cy="0%" r="70%"><stop offset="0" stop-color="#f2c94c" stop-opacity=".10"/><stop offset="1" stop-color="#f2c94c" stop-opacity="0"/></radialGradient></defs>')
svg.append(f'<rect width="{W}" height="{H}" fill="url(#grid)"/><rect width="{W}" height="420" fill="url(#glow)"/>')
# contour doodles (hills / woodland)
import random
random.seed(7)
for k in range(26):
    cx = random.choice([22, 30, 360, 368, 195]); cy = random.randint(180, int(H) - 120)
    if cx == 195: continue
    svg.append(f'<path d="M{cx-10} {cy} l5 -9 l5 9 Z M{cx-2} {cy+4} l5 -10 l5 10 Z" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1"/>')
d = path_d()
svg.append(f'<path d="{d}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="30" stroke-linecap="round"/>')
svg.append(f'<path d="{d}" fill="none" stroke="#e8e2cc" stroke-opacity=".55" stroke-width="9" stroke-dasharray="1 15" stroke-linecap="round"/>')
svg.append(f'<path class="trail" d="{d}" fill="none" stroke="#f2c94c" stroke-width="2" stroke-dasharray="6 10" stroke-linecap="round"/>')
# base camp
svg.append('<g class="camp">' + tent(W/2, 92) + f'<text x="{W/2}" y="146" text-anchor="middle" class="here">YOU ARE HERE · CEDWYN ESTATE</text></g>')
for r in rows:
    s = r["s"]; sx, sy = stone_xy(r)
    a_lbl = f'Stop {s["n"]}: {s["title"]}. {s["caption"]}'
    ext = not s["url"].startswith("https://bucklerfamily.estate/")
    href = s["url"]
    svg.append(f'<a class="stop" href="{esc(href)}" aria-label="{esc(a_lbl)}" data-stop="{s["n"]}">')
    svg.append(f'<rect class="hit" x="6" y="{r["cy"]-58 - (60 if r["big"] else 0)}" width="{W-12}" height="{r["h"]-8}" rx="10"/>')
    svg.append(icon(s["icon"], r["bx"], r["cy"] - (12 if not r["big"] else 0), r["big"], s.get("colors")))
    # stepping stone with number
    svg.append(f'<circle cx="{sx}" cy="{sy}" r="16" fill="{"#f2c94c" if s["n"] in (1, 19) else "#000"}" stroke="#f2c94c" stroke-width="2"/>')
    svg.append(f'<text x="{sx}" y="{sy+5.5}" text-anchor="middle" class="num{" dark" if s["n"] in (1, 19) else ""}">{s["n"]}</text>')
    # text block
    if r["big"]:
        tx, anchor = W/2, "middle"; ty = r["cy"] + 64
    else:
        tx, anchor = (168, "start") if r["left"] else (16, "start"); ty = r["cy"] - 40
    cP, cS = s.get("colors") or ("#f2c94c", "#f2c94c")
    bx0 = tx - 20 if anchor == "middle" else tx
    t = [f'<rect x="{bx0}" y="{ty-18}" width="24" height="4" rx="1" fill="{cP}" stroke="#fff" stroke-opacity=".35" stroke-width=".6"/><rect x="{bx0+24}" y="{ty-18}" width="16" height="4" rx="1" fill="{cS}"/>',
         f'<text x="{tx}" y="{ty}" text-anchor="{anchor}" class="tag" style="fill:{cS}">{esc(s["tag"])}</text>']
    yy = ty + 20
    for ln in r["title"]:
        t.append(f'<text x="{tx}" y="{yy}" text-anchor="{anchor}" class="ttl">{esc(ln)}</text>'); yy += 19
    yy += 4
    for ln in r["cap"]:
        t.append(f'<text x="{tx}" y="{yy}" text-anchor="{anchor}" class="cap">{esc(ln)}</text>'); yy += 17
    lbl = ("Enter the shop" if r["big"] else go_label(s)) + " →"
    if s["key"] == "film": lbl = "Watch on Facebook →"
    t.append(f'<text x="{tx}" y="{yy+6}" text-anchor="{anchor}" class="go" style="fill:{cS}">{esc(lbl)}</text>')
    svg.append("".join(t))
    svg.append('</a>')
svg.append('</svg>')
SVG = "\n".join(svg)

route_li = "\n".join(
    f'<li><a href="{esc(s["url"])}"><i class="sw" aria-hidden="true" style="--p:{(s.get("colors") or ["#f2c94c"]*2)[0]};--s:{(s.get("colors") or ["#f2c94c"]*2)[1]}"></i><b>{s["n"]}. {esc(s["title"])}</b> — {esc(s["caption"])}</a></li>' for s in STOPS)

merch = SHOP["merch"]
if merch.get("url"):
    merch_html = f'<a class="card" href="{esc(merch["url"])}"><span class="k">Merchandise</span><b>{esc(merch["title"])}</b><span class="s">T-shirts, mugs, prints and more.</span><span class="btn">Visit the merch shop →</span></a>'
else:
    merch_html = f'<div class="card soon" aria-disabled="true"><span class="k">Merchandise</span><b>{esc(merch["title"])}</b><span class="s">T-shirts, mugs, prints and more.</span><span class="btn ghost">Merch, opening soon</span></div>'

PAGE = f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Cedwyn Estate · Great House</title>
<meta name="description" content="Cedwyn Estate — the Williams–Buckler family base camp, for Great House Farm / Tŷ Mawr, Llandough. Follow the numbered path from the Legal Wiki through every part of the record to the gift shop and marketplace.">
<meta property="og:title" content="Cedwyn Estate · Great House">
<meta property="og:site_name" content="Cedwyn Estate">
<meta name="twitter:title" content="Cedwyn Estate · Great House">
<meta property="og:description" content="Follow the path: the Legal Wiki, the story, the chessboard, the records, the archives and the gift shop.">
<meta property="og:url" content="https://bucklerfamily.estate/">
<meta name="theme-color" content="#000000">
<link rel="canonical" href="https://bucklerfamily.estate/">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="application-name" content="Cedwyn Estate">
<meta name="apple-mobile-web-app-title" content="Cedwyn Estate">
<link rel="preload" href="/fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/barlow-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>
(function(){{var q=location.search;if(/payment_status=/.test(q)){{location.replace('/webapp/'+q+location.hash);return;}}try{{if(localStorage.getItem('ghf-view')==='list'&&!/[?&]view=map/.test(q))location.replace('/1d/'+location.hash);}}catch(e){{}}}})();
</script>
<style>
@font-face{{font-family:"Barlow";font-weight:300;font-display:swap;src:url(/fonts/barlow-latin-300-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215}}
@font-face{{font-family:"Barlow";font-weight:400;font-display:swap;src:url(/fonts/barlow-latin-400-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215}}
@font-face{{font-family:"Barlow";font-weight:700;font-display:swap;src:url(/fonts/barlow-latin-700-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215}}
@font-face{{font-family:"Barlow";font-weight:400;font-display:swap;src:url(/fonts/barlow-latin-ext-400-normal.woff2) format("woff2");unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}}
@font-face{{font-family:"Barlow";font-weight:700;font-display:swap;src:url(/fonts/barlow-latin-ext-700-normal.woff2) format("woff2");unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}}
:root{{--bg:#000;--ink:#fff;--body:#d4d4d4;--muted:#a3a3a3;--line:rgba(255,255,255,.16);--gold:#f2c94c;--font:"Barlow","Helvetica Neue",Arial,system-ui,sans-serif}}
*,*::before,*::after{{box-sizing:border-box}}
html{{background:var(--bg);color-scheme:dark;-webkit-text-size-adjust:100%}}
body{{margin:0;background:var(--bg);color:var(--body);font-family:var(--font);font-size:16px;line-height:1.55;overflow-x:hidden}}
a{{color:inherit}}
:focus-visible{{outline:3px solid var(--gold);outline-offset:3px}}
.skip{{position:absolute;left:-999px;top:8px;background:var(--gold);color:#000;padding:8px 12px;z-index:9}}.skip:focus{{left:8px}}
header.top{{max-width:560px;margin:0 auto;padding:22px 18px 6px;position:relative}}#lang-slot{{position:absolute;top:16px;right:14px}}
.mode{{display:inline-flex;margin:14px 0 0;border:1px solid var(--line);border-radius:999px;padding:3px;gap:2px}}.mode>*{{padding:7px 14px;border-radius:999px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;color:var(--muted)}}.mode .on{{background:#fff;color:#000;font-weight:700}}.mode a:hover{{color:#fff}}
.top .mark{{display:block;width:72px;height:72px;margin:0 0 10px}}
.eyebrow.sub{{margin:10px 0 0}}
.eyebrow{{font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--gold);margin:0 0 8px}}
h1{{margin:0;color:var(--ink);font-weight:300;text-transform:uppercase;letter-spacing:.06em;font-size:clamp(1.65rem,7.4vw,2.5rem);line-height:1.08}}
h1 b{{font-weight:700;display:block}}
.lead{{margin:12px 0 0;color:var(--body);font-size:1rem}}
.note{{margin:10px 0 0;font-size:.82rem;color:var(--muted);border-left:2px solid var(--gold);padding-left:10px}}
.jump{{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0}}
.pill{{display:inline-block;border:1px solid var(--line);color:var(--ink);text-decoration:none;text-transform:uppercase;letter-spacing:.14em;font-size:11.5px;padding:8px 12px;border-radius:999px}}
.pill.solid{{background:var(--gold);color:#000;border-color:var(--gold);font-weight:700}}
.pill:hover{{border-color:var(--gold)}}
main{{max-width:560px;margin:0 auto}}
#board{{display:block;width:100%;height:auto}}
#board .hit{{fill:transparent;stroke:transparent;stroke-width:1.5}}
#board .stop:hover .hit,#board .stop:focus-visible .hit{{fill:rgba(255,255,255,.04);stroke:rgba(242,201,76,.55);stroke-dasharray:6 6}}
#board .stop:focus{{outline:none}}
#board text{{font-family:var(--font);paint-order:stroke;stroke:#000;stroke-width:4px;stroke-linejoin:round}}#board .stop text.num,#board .ic,#board .ic2,#board .ic3{{stroke:none}}
#board .tag{{font-size:10.5px;letter-spacing:.24em;fill:var(--gold);font-weight:700}}
#board .ttl{{font-size:15.5px;letter-spacing:.05em;fill:#fff;font-weight:700}}
#board .cap{{font-size:13.2px;fill:#cfcfcf;font-weight:400}}
#board .go{{font-size:12px;letter-spacing:.02em;fill:#a8a8a8}}
#board .stop:hover .go,#board .stop:focus-visible .go{{fill:var(--gold)}}
#board .num{{font-size:15px;font-weight:700;fill:#fff}}#board .num.dark{{fill:#000}}
#board .here{{font-size:11px;letter-spacing:.26em;fill:#fff;font-weight:700}}
#board .ic{{font-size:15px;font-weight:700;fill:var(--gold)}}#board .ic2{{font-size:11px;font-weight:700;fill:var(--gold);letter-spacing:.08em}}#board .ic3{{font-size:10.5px;font-weight:700;fill:#f2c94c;letter-spacing:.22em}}
@media (prefers-reduced-motion:no-preference){{#board .trail{{animation:march 1.6s linear infinite}}@keyframes march{{to{{stroke-dashoffset:-32}}}}}}
section{{max-width:560px;margin:0 auto;padding:8px 18px 18px}}
h2{{color:var(--ink);font-weight:300;text-transform:uppercase;letter-spacing:.12em;font-size:1.25rem;margin:18px 0 10px}}
h2 b{{font-weight:700}}
.cards{{display:grid;gap:12px}}
.card{{display:block;border:1px solid var(--line);border-radius:12px;padding:16px;text-decoration:none;background:#0a0a0a}}
.card:hover{{border-color:var(--gold)}}
.card .k{{display:block;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold)}}
.card b{{display:block;color:var(--ink);font-size:1.12rem;margin:4px 0 2px;letter-spacing:.02em}}
.card .s{{display:block;font-size:.92rem;color:var(--body)}}
.card .btn{{display:inline-block;margin-top:10px;background:var(--gold);color:#000;font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:9px 14px;border-radius:999px}}
.card .btn.ghost{{background:transparent;color:var(--muted);border:1px dashed var(--line)}}
.card.soon{{opacity:.85}}
details{{border-top:1px solid var(--line);margin-top:18px;padding-top:10px}}
summary{{cursor:pointer;color:var(--ink);text-transform:uppercase;letter-spacing:.14em;font-size:.82rem;padding:6px 0}}
ol.route{{margin:8px 0 0;padding-left:0;list-style:none}}
ol.route li{{margin:0 0 8px;font-size:.92rem}}
ol.route a{{text-decoration:none;color:var(--body)}}ol.route a:hover b{{color:var(--gold)}}
ol.route b{{color:var(--ink)}}
.sw{{display:inline-block;width:26px;height:10px;margin:0 8px 0 0;border-radius:2px;vertical-align:middle;background:linear-gradient(90deg,var(--p) 0 60%,var(--s) 60% 100%);box-shadow:0 0 0 1px rgba(255,255,255,.25)}}
footer{{max-width:560px;margin:0 auto;padding:18px 18px 40px;font-size:.82rem;color:var(--muted);border-top:1px solid var(--line)}}
footer a{{color:var(--ink)}}
footer p{{margin:6px 0}}
.daybtn{{position:absolute;top:14px;left:14px;display:inline-flex;align-items:center;gap:6px;height:34px;min-width:36px;justify-content:center;padding:0 11px;border:1px solid #fff;border-radius:2px;background:transparent;color:#fff;font:500 11px/1 Barlow,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;z-index:3}}
.daybtn:hover{{border-color:#f2c94c}}@media (max-width:440px){{.daybtn .ghf-mode-txt{{display:none}}}}
.mode>*{{font-weight:500}}
</style>
</head>
<body>
<a class="skip" href="#board">Skip to the map</a>
<header class="top">
<div id="lang-slot"></div>
<button class="daybtn" type="button" data-ghf-mode-toggle><span aria-hidden="true">☀</span><span class="ghf-mode-txt">Day</span></button>
<img class="mark" src="/brand/cedwyn-tent-icon-128.png" width="72" height="72" alt="">
<h1><b>Cedwyn Estate</b></h1>
<p class="eyebrow sub">Great House</p>
<p class="lead">Follow the numbered stepping stones. Each building opens one part of the record. Every site has a link back here, so you can always return to Cedwyn Estate.</p>
<p class="note">Case theories on these sites are our case, prospective. Not a finding of any court.</p>
<div class="jump"><a class="pill solid" href="https://greathousefarmwiki.wordpress.com/">Start at stop 1 →</a><a class="pill" href="#shop">Gift shop</a><a class="pill" href="/campus/">Estate campus</a></div>
<div class="mode" role="group" aria-label="Choose a view"><a href="/1d/" data-view="list">1D list</a><span class="on" aria-current="page">2D map</span><a href="/3d/" data-view="3d">3D walk</a></div>
</header>
<main id="map">
{SVG}
</main>
<section id="shop" aria-labelledby="shop-h">
<h2 id="shop-h"><b>Gift shop</b> &amp; marketplace</h2>
<div class="cards">
<a class="card" href="{esc(SHOP["ebook"]["url"])}"><span class="k">E-book · {esc(SHOP["ebook"]["price"])}</span><b>{esc(SHOP["ebook"]["title"])}</b><span class="s">Nearly 2,000 pages: the whole Legal Wiki as one book, with the evidence register.</span><span class="btn">Get the e-book →</span></a>
<a class="card" href="{esc(SHOP["ebooks"]["url"])}"><span class="k">E-book shelf</span><b>{esc(SHOP["ebooks"]["title"])}</b><span class="s">{esc(SHOP["ebooks"]["note"])}</span><span class="btn">Browse the shelf →</span></a>
{merch_html}
</div>
<details>
<summary>The route as a list</summary>
<ol class="route">
{route_li}
</ol>
</details>
</section>
<footer>
<p>Great House Farm (Tŷ Mawr), Llandough. Our case, prospective. Not a finding of any court.</p>
<p>More: <a href="/campus/">the estate campus map</a> · <a href="/enemy/">the enemy camp</a> · <a href="/webapp/">the Great House web app</a> · <a href="https://wiki.bucklerfamily.estate/">the wiki archive</a> · <a href="https://library.bucklerfamily.estate/">the library</a></p>
<p>— Sion's Tab agent</p>
</footer>
<script>(function(){{var v=document.querySelectorAll("[data-view]");for(var i=0;i<v.length;i++)v[i].addEventListener("click",function(){{try{{localStorage.setItem("ghf-view",this.getAttribute("data-view"))}}catch(e){{}}}});try{{localStorage.setItem("ghf-view","map")}}catch(e){{}}}})();</script>
<link rel="stylesheet" href="/ghf-lang/ghf-theme.css?v={D["version"]}" data-ghf-theme>
<script src="https://bucklerfamily.estate/ghf-lang/ghf-lang.js" data-site="basecamp" defer></script>
</body>
</html>
"""
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(PAGE)

# ---------- basecamp.js ----------
js_stops = [{"n": s["n"], "t": s["title"], "u": s["url"], "h": s.get("hosts", []), "p": s.get("paths", []), "c": s.get("colors")} for s in STOPS]
# Two-colour identity: per-site tweaks for the brand layer in basecamp.js ("P"/"S" = that site's primary/secondary).
# vars: the site's own CSS custom properties re-pointed at its pair; header/buttons/links: false = leave alone,
# or a CSS selector to use instead of the generic one. Pages under BRAND_PATHS on the apex take that stop's pair.
_by_key = {s["key"]: s for s in STOPS}
BRAND_PATHS = {"/enemy/": _by_key["authorities"]["colors"]}
TWEAKS = {
  "fcg.bucklerfamily.estate": {"vars": {"--accent": "S"}},
  "projects.bucklerfamily.estate": {"vars": {"--accent": "S"}},
  "ebooks.bucklerfamily.estate": {"vars": {"--accent": "S"}},
  "shop.bucklerfamily.estate": {"vars": {"--accent": "S"}},
  "csscpsg.bucklerfamily.estate": {"vars": {"--gold": "S"}},
  "csscpsgp.bucklerfamily.estate": {"vars": {"--gold": "S"}},
  "chess.bucklerfamily.estate": {"buttons": False, "keep": "#board"},
  "qa.bucklerfamily.estate": {"vars": {"--navy": "P", "--blue": "P"}},
  "fb.bucklerfamily.estate": {"vars": {"--blue": "P"}},
  "2026-10-22.bucklerfamily.estate": {"vars": {"--slate": "P", "--moss": "P"}},
  "email.bucklerfamily.estate": {"vars": {"--blue": "P", "--navy": "P"}, "forceHeader": True},
  "records.bucklerfamily.estate": {"forceHeader": True},
  "authorities.bucklerfamily.estate": {"forceHeader": True},
  "review.bucklerfamily.estate": {"forceHeader": True},
  "research.bucklerfamily.estate": {"forceHeader": True}
}
JS = r"""/*! basecamp.js — "Back to Cedwyn Estate" link for every Great House Farm (Tŷ Mawr) site, plus a
 * "stop N, next stop" hint along the numbered path on bucklerfamily.estate. Dependency-free.
 * Loaded automatically by ghf-lang.js (same folder); can also be tagged directly:
 *   <script src="https://bucklerfamily.estate/basecamp.js" defer></script>
 * Generated by campus/build_basecamp.py from campus/basecamp_stops.json · v__VER__ (__DATE__) · Sion's Tab agent
 */
(function () {
  "use strict";
  if (window.GHFBasecamp) return;
  var STOPS = __STOPS__;
  var TOTAL = STOPS.length, HOME = "https://bucklerfamily.estate/";
  // assets come from the apex, or same-origin where a site serves /ghf-lang/ itself (a strict CSP, e.g. the mail archive)
  var SRC = (document.currentScript && document.currentScript.src) || "", ASSET = "https://bucklerfamily.estate";
  try { var su = new URL(SRC); if (su.origin !== ASSET && /^\/ghf-lang\//.test(su.pathname)) ASSET = su.origin; } catch (e) {}
  window.GHFBasecamp = { version: "__VER__", stops: STOPS };
  var host = location.hostname.replace(/^www\./, ""), path = location.pathname || "/";
  var apex = host === "bucklerfamily.estate" || /(^|\.)bucklerfamilyfarm\.pages\.dev$/.test(host);
  var BRAND_PATHS = __BRANDPATHS__, TWEAKS = __TWEAKS__;

  // ---------- Cedwyn Estate shell: one theme for every site (20 Oct 2026) ----------
  // Starlink-style base: black ground, white thin uppercase headings, ghost buttons; a Day/Night toggle remembered in
  // localStorage plus a .bucklerfamily.estate cookie (so the choice follows you from site to site); each site keeps one
  // signature hue (colors in campus/basecamp_stops.json). A site whose own design is light is shown in night mode with a
  // colour inversion that keeps photos, maps and the chessboard as they are; a dark site is inverted the same way for day.
  // Shared CSS: https://bucklerfamily.estate/ghf-lang/ghf-theme.css (generated by campus/build_basecamp.py).
  var GT = (function () {
    var KEY = "ghf-theme", de = document.documentElement, native = null, btns = [];
    function mode() {
      try { var v = localStorage.getItem(KEY); if (v === "day" || v === "night") return v; } catch (e) {}
      var m = /(?:^|; )ghf_theme=(day|night)/.exec(document.cookie || "");
      return m ? m[1] : "night";
    }
    function save(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
      try { document.cookie = "ghf_theme=" + v + "; path=/; max-age=31536000; SameSite=Lax; Secure" + (/(^|\.)bucklerfamily\.estate$/.test(location.hostname) ? "; domain=.bucklerfamily.estate" : ""); } catch (e) {}
    }
    function rgbOf(c) { var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(c || ""); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; }
    function detect() { // the site's own scheme, read before any theme CSS is applied
      var forced = de.getAttribute("data-ghf-native") || (TWEAKS[host] || {}).native;
      if (forced) return forced;
      if (apex && (path === "/" || path === "/index.html" || /^\/1d(\/|$)/.test(path))) return "dark";
      var els = [document.body, de], i, c;
      for (i = 0; i < els.length; i++) {
        if (!els[i]) continue;
        c = rgbOf(getComputedStyle(els[i]).backgroundColor);
        if (c && c[3] > 0.5) return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 < 0.45 ? "dark" : "light";
      }
      return "light";
    }
    var crit = null;
    function apply(m) {
      if (!native) native = detect();
      de.setAttribute("data-ghf-native", native);
      de.setAttribute("data-ghf-mode", m);
      de.classList.add("ghf-shell");
      de.classList.toggle("ghf-inv", (m === "day") !== (native === "light"));
      if (!crit) { // critical rules inline, so there is no flash while the shared CSS file loads
        crit = document.createElement("style"); crit.setAttribute("data-ghf-theme-crit", "");
        crit.textContent = "html.ghf-inv{filter:invert(1) hue-rotate(180deg)}" +
          "html.ghf-inv :is(img,video,canvas,iframe,embed,object,svg image,.ghf-ui,.ghf-bgimg,[data-ghf-keep]){filter:invert(1) hue-rotate(180deg)}" +
          "html.ghf-inv :is(.ghf-ui,.ghf-bgimg,[data-ghf-keep]) :is(img,video,canvas,iframe,embed,object,svg image,.ghf-bgimg,[data-ghf-keep]){filter:none}" +
          "html[data-ghf-native=dark]:not(.ghf-inv),html[data-ghf-native=dark]:not(.ghf-inv) body{background-color:#000!important}";
        (document.head || de).appendChild(crit);
        if (!document.querySelector("link[data-ghf-theme]")) {
          var l = document.createElement("link"); l.rel = "stylesheet"; l.href = ASSET + "/ghf-lang/ghf-theme.css?v=__VER__"; l.setAttribute("data-ghf-theme", "");
          (document.head || de).appendChild(l);
        }
      }
      if (de.classList.contains("ghf-inv")) markBg();
      for (var i = 0; i < btns.length; i++) paintBtn(btns[i]);
      try { document.dispatchEvent(new CustomEvent("ghf-theme-change", { detail: { mode: m, native: native } })); } catch (e) {}
    }
    function markBg() { // elements painted with a photo keep their real colours
      var q = document.querySelectorAll("body *"), i, e, n = 0;
      for (i = 0; i < q.length && n < 3000; i++) {
        e = q[i]; if (e.classList.contains("ghf-bgimg") || e.closest(".ghf-ui")) continue;
        var bi = getComputedStyle(e).backgroundImage;
        if (bi && bi !== "none" && /url\(/.test(bi)) { e.classList.add("ghf-bgimg"); n++; }
      }
    }
    function L() { var l = (de.getAttribute("lang") || "en").slice(0, 2).toLowerCase(); return { cy: 1, es: 1 }[l] ? l : "en"; }
    var TT = { en: ["Day", "Night", "Switch to day mode", "Switch to night mode"], cy: ["Dydd", "Nos", "Newid i’r modd dydd", "Newid i’r modd nos"], es: ["Día", "Noche", "Cambiar al modo día", "Cambiar al modo noche"] };
    function paintBtn(b) {
      var m = mode(), t = TT[L()], toDay = m === "night";
      b.setAttribute("aria-pressed", m === "day" ? "true" : "false");
      b.setAttribute("aria-label", toDay ? t[2] : t[3]); b.title = toDay ? t[2] : t[3];
      b.innerHTML = '<span aria-hidden="true" class="ghf-mode-ico">' + (toDay ? "☀" : "☾") + '</span><span class="ghf-mode-txt">' + (toDay ? t[0] : t[1]) + "</span>";
    }
    function wire(b) {
      if (!b || b.getAttribute("data-ghf-wired")) return; b.setAttribute("data-ghf-wired", "1"); b.type = "button";
      b.addEventListener("click", function () { var m = mode() === "night" ? "day" : "night"; save(m); apply(m); });
      btns.push(b); paintBtn(b);
    }
    function boot() {
      var kp = (TWEAKS[host] || {}).keep; if (kp) { var kq = document.querySelectorAll(kp); for (var ki = 0; ki < kq.length; ki++) kq[ki].setAttribute("data-ghf-keep", ""); }
      apply(mode());
      var q = document.querySelectorAll("[data-ghf-mode-toggle]"); for (var i = 0; i < q.length; i++) wire(q[i]);
      document.addEventListener("ghf-lang-change", function () { for (var i = 0; i < btns.length; i++) paintBtn(btns[i]); });
      window.addEventListener("load", function () { if (de.classList.contains("ghf-inv")) setTimeout(markBg, 300); });
      window.addEventListener("storage", function (ev) { if (ev.key === KEY && ev.newValue) apply(ev.newValue); });
    }
    return { boot: boot, wire: wire, mode: mode, apply: apply, native: function () { return native; } };
  })();
  window.GHFTheme = GT;
  function whenBody(f) { if (document.body && document.readyState !== "loading") f(); else document.addEventListener("DOMContentLoaded", f); }
  if (apex && /^\/3d(\/|$)/.test(path)) return; // the full-screen 3D walk keeps its own look
  if (apex && (path === "/" || path === "/index.html" || /^\/1d(\/|$)/.test(path))) { whenBody(GT.boot); return; } // this IS base camp (1D list, 2D map)
  var here = null, i, j;
  for (i = 0; i < STOPS.length && !here; i++) {
    for (j = 0; j < STOPS[i].h.length; j++) if (STOPS[i].h[j] === host) { here = STOPS[i]; break; }
    if (!here && apex) for (j = 0; j < STOPS[i].p.length; j++) if (path.indexOf(STOPS[i].p[j]) === 0) { here = STOPS[i]; break; }
  }

  // ---------- two-colour identity (colors = [primary, secondary] in campus/basecamp_stops.json) ----------
  // primary is deep (white text passes WCAG AA on it); secondary is bright (black text passes AA on it, and it
  // passes AA as text on black). Styling only: no words are changed. Opt out per page with <html data-ghf-brand="off">.
  function rgb(c) { var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(c || ""); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; }
  function lumi(a) { var f = function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(a[0]) + 0.7152 * f(a[1]) + 0.0722 * f(a[2]); }
  function hexL(h) { h = h.replace("#", ""); return lumi([parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]); }
  function ratio(a, b) { var x = Math.max(a, b), y = Math.min(a, b); return (x + 0.05) / (y + 0.05); }
  function bgOf(e) { // effective background colour behind an element
    for (; e && e.nodeType === 1; e = e.parentElement) {
      var cs = getComputedStyle(e), c = rgb(cs.backgroundColor);
      if (cs.backgroundImage && cs.backgroundImage !== "none" && !/gradient/.test(cs.backgroundImage)) return null;
      if (c && c[3] > 0.6) return c;
    }
    return [255, 255, 255, 1];
  }
  function brand(stop) {
    var de = document.documentElement;
    if (de.getAttribute("data-ghf-brand") === "off") return;
    var pair = null, k;
    for (k in BRAND_PATHS) if (apex && path.indexOf(k) === 0) pair = BRAND_PATHS[k];
    if (!pair && stop) pair = stop.c;
    if (!pair) return;
    var P = pair[0], S = pair[1], tw = TWEAKS[host] || {};
    window.GHFBasecamp.colors = pair;
    de.style.setProperty("--ghf-p", P); de.style.setProperty("--ghf-s", S);
    de.setAttribute("data-ghf-brand", "on");
    var css = el("style"); css.setAttribute("data-ghf-brand", "");
    var vars = "";
    for (k in (tw.vars || {})) vars += k + ":" + (tw.vars[k] === "P" ? P : tw.vars[k] === "S" ? S : tw.vars[k]) + "!important;";
    css.textContent =
      (vars ? ":root{" + vars + "}" : "") +
      ".ghf-band{position:fixed;left:0;right:0;top:0;height:6px;z-index:2147481991;pointer-events:none;background:linear-gradient(90deg," + P + " 0 62%," + S + " 62% 100%)}" +
      "html[data-ghf-brand=on] ::selection{background:" + S + ";color:#000}" +
      "html[data-ghf-brand=on] :focus-visible{outline-color:" + S + "}" +
      ".ghf-hdr,.ghf-hdr-edge{border-bottom:1px solid var(--ghf-line," + S + ")!important}" +
      ".ghf-btn,.ghf-ghost{background:transparent!important;background-image:none!important;border:1px solid var(--ghf-line," + S + ")!important;color:inherit!important;border-radius:2px!important;text-transform:uppercase;letter-spacing:.08em;font-weight:500!important;box-shadow:none!important;max-width:100%;box-sizing:border-box;white-space:normal}" +
      ".ghf-btn:hover,.ghf-ghost:hover{background:var(--ghf-line," + S + ")!important;color:var(--ghf-on-line,#000)!important}" +
      ".ghf-bc-home,.ghf-bc-open{border-color:" + S + "!important}.ghf-bc-arrow{color:" + S + "!important}" +
      "@media print{.ghf-band{display:none}}" + (tw.css || "").replace(/__P__/g, P).replace(/__S__/g, S);
    (document.head || de).appendChild(css);
    var mt = document.querySelector('meta[name="theme-color"]');
    if (!mt) { mt = document.createElement("meta"); mt.name = "theme-color"; (document.head || de).appendChild(mt); }
    mt.content = P;
    function paintPage() {
      if (!document.body) return;
      if (!document.querySelector(".ghf-glow")) { var gl = el("div", "ghf-glow ghf-ui"); gl.setAttribute("aria-hidden", "true"); document.body.appendChild(gl); }
      var lP = hexL(P), lS = hexL(S), vw = window.innerWidth || 390, q, i, e, r;
      // 1. the header / nav bar at the top of the page
      if (tw.header !== false) {
        q = document.querySelectorAll(tw.header || "header, [role=banner], .site-header, .topbar, .navbar, .nav, .navrow, body > nav");
        for (i = 0; i < q.length; i++) {
          e = q[i]; if (e.closest(".ghf-bc")) continue;
          r = e.getBoundingClientRect();
          if (r.width < vw * 0.6 || r.height < 24 || r.top > 160 || r.height > 260) continue;
          var cs = getComputedStyle(e), img = cs.backgroundImage && cs.backgroundImage !== "none" && !/gradient/.test(cs.backgroundImage);
          var fg = rgb(cs.color), light = fg && lumi(fg) > 0.5;
          // a plain header whose own text is already light (dark theme), or a plain light bar: paint it primary
          if (!img && (light || tw.forceHeader)) e.classList.add("ghf-hdr"); else e.classList.add("ghf-hdr-edge");
          break;
        }
      }
      // 2. buttons and calls to action
      if (tw.buttons !== false) {
        q = document.querySelectorAll(tw.buttons || "a.btn, button.btn, .button, a.cta, .cta, .buy, a[class*='btn-'], button[type=submit], input[type=submit]");
        for (i = 0; i < q.length && i < 400; i++) {
          e = q[i]; if (e.closest(".ghf-bc, .ghf-hdr")) continue;
          var bc = rgb(getComputedStyle(e).backgroundColor);
          if (bc && bc[3] > 0.6) e.classList.add("ghf-btn"); else e.classList.add("ghf-ghost");
        }
      }
      // 3. links in running text: secondary on dark ground, primary on light ground (whichever passes AA)
      if (tw.links !== false) {
        q = document.querySelectorAll("p a:not([class]), li a:not([class]), td a:not([class]), dd a:not([class]), figcaption a:not([class]), blockquote a:not([class])");
        for (i = 0; i < q.length && i < 1500; i++) {
          e = q[i]; if (e.closest(".ghf-bc, .ghf-hdr, .ghf-btn, nav, header, footer")) continue;
          var g = bgOf(e); if (!g) continue;
          var lg = lumi(g);
          if (ratio(lS, lg) >= 4.5) e.style.setProperty("color", S, "important");
          else if (ratio(lP, lg) >= 4.5) e.style.setProperty("color", P, "important");
        }
      }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paintPage); else paintPage();
    window.addEventListener("load", function () { setTimeout(paintPage, 400); });
  }
  whenBody(GT.boot);
  brand(here);
  var next = here && here.n < TOTAL ? STOPS[here.n] : null;
  var T = {
    en: { home: "Cedwyn Estate · Base Camp", back: "Back to Cedwyn Estate", sub: "Great House", stop: "Stop", of: "of", next: "Next", hide: "Hide", show: "Cedwyn Estate", end: "Journey’s end" },
    cy: { home: "Ystâd Cedwyn · Gwersyll Sylfaen", back: "Yn ôl i Ystâd Cedwyn", sub: "Tŷ Mawr", stop: "Arhosfan", of: "o", next: "Nesaf", hide: "Cuddio", show: "Ystâd Cedwyn", end: "Diwedd y daith" },
    es: { home: "Finca Cedwyn · Campamento base", back: "Volver a la Finca Cedwyn", sub: "Great House", stop: "Parada", of: "de", next: "Siguiente", hide: "Ocultar", show: "Finca Cedwyn", end: "Fin del recorrido" }
  };
  function lang() {
    var l = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
    return T[l] ? l : "en";
  }
  var KEY = "ghf-bc-min", nav, css, bar;
  function mini() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function setMini(v) { try { sessionStorage.setItem(KEY, v ? "1" : "0"); } catch (e) {} render(); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var ICON = ASSET + "/brand/cedwyn-tent-icon-64.png";
  // floating pill (shown once the header has scrolled away): home + "stop N, next stop"
  function render() {
    var s = T[lang()];
    nav.textContent = "";
    nav.className = "ghf-bc ghf-ui" + (mini() ? " ghf-bc-min" : "") + (nav.getAttribute("data-away") === "1" ? "" : " ghf-bc-hide");
    if (mini()) {
      var b = el("button", "ghf-bc-open", "⟵ " + s.show);
      b.type = "button"; b.setAttribute("aria-label", s.back);
      b.onclick = function () { setMini(false); };
      nav.appendChild(b); return;
    }
    var a = el("a", "ghf-bc-home");
    a.href = HOME;
    a.appendChild(el("span", "ghf-bc-arrow", "⟵"));
    var mk = document.createElement("img"); mk.src = ICON; mk.alt = ""; mk.width = 22; mk.height = 22; mk.className = "ghf-bc-mk";
    a.appendChild(mk);
    var t = el("span", "ghf-bc-txt");
    t.appendChild(el("b", null, s.home));
    t.appendChild(el("small", null, s.sub));
    a.appendChild(t);
    nav.appendChild(a);
    if (here) {
      var n = el(next ? "a" : "span", "ghf-bc-next");
      if (next) { n.href = next.u; n.textContent = s.stop + " " + here.n + " " + s.of + " " + TOTAL + " · " + s.next + ": " + next.t + " →"; }
      else n.textContent = s.stop + " " + here.n + " " + s.of + " " + TOTAL + " · " + s.end;
      nav.appendChild(n);
    }
    var x = el("button", "ghf-bc-x", "×");
    x.type = "button"; x.setAttribute("aria-label", s.hide); x.title = s.hide;
    x.onclick = function () { setMini(true); };
    nav.appendChild(x);
  }
  // the shared header bar: "Cedwyn Estate · Base Camp" home link (tent mark in this site's hue ring), language, Day/Night
  function renderBar() {
    var s = T[lang()], home = bar.querySelector(".ghf-top-home");
    home.setAttribute("aria-label", s.back);
    home.querySelector(".ghf-top-name").textContent = s.home;
    var sn = bar.querySelector(".ghf-top-site"); if (sn) sn.textContent = here ? here.t : "";
  }
  function buildBar() {
    bar = el("header", "ghf-top ghf-ui"); bar.setAttribute("data-no-translate", ""); bar.setAttribute("translate", "no");
    bar.setAttribute("aria-label", "Cedwyn Estate");
    var a = el("a", "ghf-top-home"); a.href = HOME;
    var badge = el("span", "ghf-top-badge"); var mk = document.createElement("img"); mk.src = ICON; mk.alt = ""; mk.width = 24; mk.height = 24; badge.appendChild(mk);
    a.appendChild(badge);
    var tx = el("span", "ghf-top-tx"); tx.appendChild(el("span", "ghf-top-name")); tx.appendChild(el("span", "ghf-top-site"));
    a.appendChild(tx); bar.appendChild(a);
    var right = el("div", "ghf-top-r");
    right.appendChild(el("span", "ghf-top-lang"));
    var mb = el("button", "ghf-top-mode"); mb.setAttribute("data-ghf-mode-toggle", ""); right.appendChild(mb);
    bar.appendChild(right);
    document.body.insertBefore(bar, document.body.firstChild);
    GT.wire(mb);
    renderBar();
    moveLang();
    // keep the bar above any header the site pins to the top of the screen
    var pinned = [], q = document.querySelectorAll("body > *, body > * > *, body > * > * > *"), i, e, r, cs;
    for (i = 0; i < q.length && i < 600; i++) {
      e = q[i]; if (e === bar || e.closest(".ghf-ui")) continue;
      cs = getComputedStyle(e); if (cs.position !== "fixed") continue;
      r = e.getBoundingClientRect();
      if (r.top <= 2 && r.height > 0 && r.height < 170 && r.width > (window.innerWidth || 390) * 0.5) pinned.push(e);
    }
    var bh = function () { return bar.offsetHeight || 46; };
    var shift = function () { var off = Math.max(0, bh() - (window.pageYOffset || 0)); for (var k = 0; k < pinned.length; k++) pinned[k].style.setProperty("top", off + "px", "important"); };
    if (pinned.length) { shift(); window.addEventListener("scroll", shift, { passive: true }); window.addEventListener("resize", shift); }
    // the floating pill appears only once the bar is out of view, so the way home is always one tap away
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { var away = !en[0].isIntersecting; nav.setAttribute("data-away", away ? "1" : "0"); nav.classList.toggle("ghf-bc-hide", !away); }).observe(bar);
    } else nav.setAttribute("data-away", "1");
  }
  function moveLang() { // one language switch, always in the same place: the shared header
    var slot = bar && bar.querySelector(".ghf-top-lang"), l = document.querySelector(".ghf-lang");
    if (slot && l && !slot.contains(l)) { slot.appendChild(l); l.classList.remove("ghf-fixed"); l.style.top = l.style.right = l.style.left = l.style.bottom = ""; l.style.position = ""; }
  }
  function start() {
    if (!document.body || document.querySelector(".ghf-bc")) return;
    css = el("style"); css.setAttribute("data-ghf-bc", "");
    css.textContent =
      ".ghf-bc{position:fixed;left:10px;bottom:10px;z-index:2147481990;display:flex;flex-direction:column;align-items:flex-start;gap:4px;max-width:calc(100vw - 20px);font:400 13px/1.25 Barlow,'Helvetica Neue',Arial,system-ui,sans-serif;-webkit-font-smoothing:antialiased}" +
      ".ghf-bc a,.ghf-bc button{font:inherit;color:#fff;text-decoration:none;cursor:pointer}" +
      ".ghf-bc-home{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.88);border:1px solid rgba(242,201,76,.75);border-radius:999px;padding:7px 34px 7px 12px;box-shadow:0 4px 18px rgba(0,0,0,.45)}" +
      ".ghf-bc-home:hover,.ghf-bc-home:focus-visible{border-color:#f2c94c;background:#000}" +
      ".ghf-bc-arrow{color:#f2c94c;font-size:15px;line-height:1}" +
      ".ghf-bc-txt b{display:block;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:11.5px}" +
      ".ghf-bc-txt small{display:block;font-size:11px;color:#bdbdbd;letter-spacing:.02em}" +
      ".ghf-bc-next{display:block;max-width:300px;background:rgba(0,0,0,.82);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 11px;font-size:11.5px;color:#e6e6e6!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "a.ghf-bc-next:hover,a.ghf-bc-next:focus-visible{border-color:#f2c94c}" +
      ".ghf-bc-x{position:absolute;left:auto;top:0;width:30px;height:38px;border:0;background:transparent;color:#bdbdbd!important;font-size:17px;line-height:38px;padding:0}" +
      ".ghf-bc-open{background:rgba(0,0,0,.85);border:1px solid rgba(242,201,76,.75);border-radius:999px;padding:6px 11px;font-size:11.5px!important;letter-spacing:.06em;text-transform:uppercase}" +
      ".ghf-bc :focus-visible{outline:3px solid #f2c94c;outline-offset:2px}" +
      "@media print{.ghf-bc{display:none!important}}" +
      ".ghf-bc-hide{opacity:0!important;visibility:hidden!important;transform:translateY(10px);transition:opacity .2s,transform .2s,visibility 0s .2s}" +
      ".ghf-bc{transition:opacity .2s,transform .2s}.ghf-bc img.ghf-bc-mk{width:22px!important;height:22px!important;margin:0 6px 0 0!important;vertical-align:middle!important;border:0!important;display:inline-block!important}" +
      ".ghf-bc-home,.ghf-bc-open{border-color:var(--ghf-s,#f2c94c)!important}.ghf-bc-arrow{color:var(--ghf-s,#f2c94c)!important}" +
      "html[data-ghf-mode=day] .ghf-bc-home,html[data-ghf-mode=day] .ghf-bc-next,html[data-ghf-mode=day] .ghf-bc-open{background:rgba(255,255,255,.94)!important;color:#000!important;border-color:var(--ghf-p,#0a0a0a)!important}" +
      "html[data-ghf-mode=day] .ghf-bc a,html[data-ghf-mode=day] .ghf-bc button{color:#000!important}html[data-ghf-mode=day] .ghf-bc-arrow{color:var(--ghf-p,#0a0a0a)!important}html[data-ghf-mode=day] .ghf-bc-txt small{color:#444!important}" +
      ".ghf-top{position:relative;z-index:2147481990;display:flex!important;align-items:center;justify-content:space-between;gap:8px;box-sizing:border-box;width:100%;min-height:48px;margin:0!important;padding:7px 10px!important;background:#000!important;color:#fff!important;border:0!important;border-bottom:1px solid var(--ghf-s,#f2c94c)!important;font:400 12px/1.2 Barlow,'Helvetica Neue',Arial,system-ui,sans-serif!important;-webkit-font-smoothing:antialiased;text-align:left;box-shadow:none!important}" +
      "html[data-ghf-mode=day] .ghf-top{background:#fff!important;color:#000!important;border-bottom-color:var(--ghf-p,#0a0a0a)!important}" +
      ".ghf-top a,.ghf-top button{color:inherit!important;text-decoration:none!important;font-family:inherit!important}" +
      ".ghf-top-home{display:flex!important;align-items:center;gap:9px;min-width:0;padding:0!important;background:none!important}" +
      ".ghf-top-badge{flex:0 0 auto;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--ghf-s,#f2c94c);box-sizing:border-box;background:#111}" +
      "html[data-ghf-mode=day] .ghf-top-badge{background:#f3f3f3;border-color:var(--ghf-p,#0a0a0a)}" +
      ".ghf-top-badge img{width:22px!important;height:22px!important;border:0!important;margin:0!important;padding:0!important;display:block!important;max-width:none!important}" +
      ".ghf-top-tx{display:flex;flex-direction:column;min-width:0;gap:2px}" +
      ".ghf-top-name{font-weight:500;letter-spacing:.14em;text-transform:uppercase;font-size:11.5px;white-space:nowrap;line-height:1.15}" +
      ".ghf-top-site{font-weight:400;letter-spacing:.1em;text-transform:uppercase;font-size:10px;line-height:1.15;color:var(--ghf-s,#f2c94c);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52vw}" +
      ".ghf-top-site:empty{display:none}html[data-ghf-mode=day] .ghf-top-site{color:var(--ghf-p,#0a0a0a)}" +
      ".ghf-top-r{display:flex;align-items:center;gap:6px;flex:0 0 auto}.ghf-top-lang:empty{display:none}" +
      ".ghf-top-mode{display:inline-flex!important;align-items:center;gap:6px;height:32px;min-width:34px;justify-content:center;padding:0 10px!important;margin:0!important;border:1px solid currentColor!important;border-radius:2px!important;background:transparent!important;cursor:pointer;letter-spacing:.14em;text-transform:uppercase;font-size:10.5px!important;font-weight:500!important;line-height:1!important}" +
      ".ghf-top-mode:hover{border-color:var(--ghf-s,#f2c94c)!important}.ghf-mode-ico{font-size:14px;letter-spacing:0}" +
      ".ghf-top :focus-visible{outline:2px solid var(--ghf-s,#f2c94c);outline-offset:2px}" +
      ".ghf-top .ghf-lang{position:relative!important;top:auto!important;right:auto!important;left:auto!important;margin:0!important;--ghf-lang-bg:transparent;--ghf-lang-fg:#fff;--ghf-lang-bd:rgba(255,255,255,.7)}" +
      "html[data-ghf-mode=day] .ghf-top .ghf-lang{--ghf-lang-fg:#000;--ghf-lang-bd:rgba(0,0,0,.6)}" +
      ".ghf-top .ghf-lang-btn{border-radius:2px!important;box-shadow:none!important;min-height:32px!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;font-family:Barlow,'Helvetica Neue',Arial,sans-serif!important;letter-spacing:.08em!important}" +
      "@media (max-width:440px){.ghf-mode-txt{display:none}.ghf-top-mode{padding:0 9px!important}.ghf-top-name{letter-spacing:.09em;font-size:10.5px}.ghf-top{padding:7px 8px!important;gap:6px}}" +
      "@media print{.ghf-top{display:none!important}}";
    (document.head || document.documentElement).appendChild(css);
    nav = el("nav", "ghf-bc ghf-ui ghf-bc-hide");
    nav.setAttribute("aria-label", "Cedwyn Estate");
    nav.setAttribute("data-no-translate", "");
    nav.setAttribute("translate", "no");
    document.body.appendChild(nav);
    render();
    buildBar();
    var place = function () {
      var h = nav.querySelector(".ghf-bc-home"), x = nav.querySelector(".ghf-bc-x");
      if (h && x) { x.style.left = (h.offsetLeft + h.offsetWidth - 30) + "px"; x.style.top = h.offsetTop + "px"; x.style.height = h.offsetHeight + "px"; x.style.lineHeight = h.offsetHeight + "px"; }
    };
    nav.style.position = "fixed"; place();
    new MutationObserver(function () { place(); }).observe(nav, { childList: true });
    window.addEventListener("resize", place);
    document.addEventListener("ghf-lang-change", function () { render(); renderBar(); });
    var mo = new MutationObserver(moveLang); mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 15000);
  }
  // Shared legal footer on every Great House Farm site: licence, privacy, cookies, terms, disclaimer (Sion's Tab agent, 20 Oct 2026).
  // Skipped where the page already carries it (data-ghf-legal-foot) and on the full-screen 3D walk.
  function legalFoot() {
    if (!document.body || document.querySelector("[data-ghf-legal-foot]") || /^\/3d(\/|$)/.test(path)) return;
    var B = "https://bucklerfamily.estate", L = [["Licence", "/licence/"], ["Privacy", "/privacy/"], ["Cookies", "/cookies/"], ["Terms", "/terms/"], ["Disclaimer", "/disclaimer/"], ["Accessibility", "/accessibility/"], ["Enquire", "/enquire/"]];
    var st = el("style"); st.setAttribute("data-ghf-lf", "");
    st.textContent = ".ghf-lf{display:block!important;clear:both;position:relative;z-index:2;box-sizing:border-box;width:100%;flex:0 0 auto;margin:32px 0 0!important;padding:16px 16px 76px!important;background:#0a0a0a!important;border-top:1px solid #333!important;color:#b8b8b8!important;font:400 12.5px/1.6 Barlow,'Helvetica Neue',Arial,system-ui,sans-serif!important;text-align:center!important;letter-spacing:0!important;text-transform:none!important}" +
      ".ghf-lf p{margin:3px auto!important;max-width:760px;color:#b8b8b8!important;font:inherit!important}.ghf-lf b{color:#eaeaea!important;font-weight:700}" +
      ".ghf-lf a{color:#eaeaea!important;text-decoration:underline!important;margin:0 6px;display:inline-block;padding:3px 0;font:inherit!important}.ghf-lf a:focus-visible{outline:2px solid #f2c94c;outline-offset:2px}@media print{.ghf-lf{padding-bottom:16px!important}}";
    (document.head || document.documentElement).appendChild(st);
    var f = el("footer", "ghf-lf ghf-ui"); f.setAttribute("data-ghf-legal-foot", "1");
    var p1 = el("p"); p1.appendChild(el("b", null, "\u00a9 Williams\u2013Buckler family. All rights reserved. Licence terms apply.")); f.appendChild(p1);
    var nv = el("p"); nv.setAttribute("role", "navigation"); nv.setAttribute("aria-label", "Legal");
    L.forEach(function (x) { var a = el("a", null, x[0]); a.href = B + x[1]; nv.appendChild(a); }); f.appendChild(nv);
    f.appendChild(el("p", null, "Our case, prospective. Not a finding of any court. Not legal advice. \u2014 Sion's Tab agent"));
    document.body.appendChild(f);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", legalFoot); else legalFoot();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
/* "Ask the archive" AI chat widget loader (Sion's Tab agent, 20 Oct 2026): AI answers from our published pages, with
 * source links; may be wrong. Served by chat.bucklerfamily.estate. Opt out per site or page with <html data-ghf-chat="off">
 * or <meta name="ghf-chat" content="off">. Never loaded on clerk., chess. or email. */
(function () {
  try {
    var h = location.hostname, d = document.documentElement;
    if (window.GHFChat || /^(clerk|chess|email)\./.test(h) || !/(^|\.)bucklerfamily\.estate$/.test(h)) return;
    if (d.getAttribute("data-ghf-chat") === "off") return;
    var m = document.querySelector('meta[name="ghf-chat"]'); if (m && /off/i.test(m.getAttribute("content") || "")) return;
    var s = document.createElement("script"); s.src = "https://chat.bucklerfamily.estate/widget.js"; s.async = true;
    (document.head || d).appendChild(s);
  } catch (e) {}
})();
"""
JS = JS.replace("__BRANDPATHS__", json.dumps(BRAND_PATHS)).replace("__TWEAKS__", json.dumps(TWEAKS, ensure_ascii=False))
JS = JS.replace("__STOPS__", json.dumps(js_stops, ensure_ascii=False)).replace("__VER__", D["version"]).replace("__DATE__", D["updated"])
open(os.path.join(ROOT, "public", "ghf-lang", "basecamp.js"), "w", encoding="utf-8").write(JS)
est = json.load(open(os.path.join(ROOT, "public", "ghf-lang", "sites", "estate.json"), encoding="utf-8"))
bc = {k: v for k, v in est.items() if k not in ("strings", "patterns")}; bc["site"] = "basecamp"
bc["strings"] = {
  "Cedwyn Estate": {"cy": "Ystâd Cedwyn", "es": "Finca Cedwyn"},
  "Great House": {"cy": "Tŷ Mawr", "es": "Great House"},
  "Gift shop": {"cy": "Siop anrhegion", "es": "Tienda de regalos"},
  "Estate campus": {"cy": "Campws yr ystad", "es": "Campus de la finca"},
  "Skip to the map": {"cy": "Neidio i’r map", "es": "Ir al mapa"},
  "The route as a list": {"cy": "Y llwybr fel rhestr", "es": "La ruta en forma de lista"},
  "Get the e-book →": {"cy": "Cael yr e-lyfr →", "es": "Obtener el libro electrónico →"},
  "Browse the shelf →": {"cy": "Pori’r silff →", "es": "Ver la estantería →"},
  "Merch, opening soon": {"cy": "Nwyddau, yn agor cyn bo hir", "es": "Artículos, muy pronto"}
}
bc["patterns"] = []; bc["mount"] = "#lang-slot"; bc["mountMode"] = "append"; bc.pop("fixedBelow", None); bc.pop("fixed", None); bc.pop("inlineStyle", None)
bc["note"] = est.get("note", "") + " Cedwyn Estate (base camp) map page: a few header strings, mounted in the header (generated by campus/build_basecamp.py)."
json.dump(bc, open(os.path.join(ROOT, "public", "ghf-lang", "sites", "basecamp.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(D, open(os.path.join(ROOT, "public", "basecamp.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
import sys; sys.path.insert(0, HERE); import ghf_shell
n1d = ghf_shell.build(D, ROOT)
print("1d/index.html", n1d, "bytes; ghf-theme.css written")
print("index.html", len(PAGE), "bytes; board height", int(H), "; basecamp.js", len(JS), "bytes")
