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
import re
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
    svg.append(f'<circle cx="{sx}" cy="{sy}" r="16" fill="{"#f2c94c" if s["n"] in (1, STOPS[-1]["n"]) else "#000"}" stroke="#f2c94c" stroke-width="2"/>')
    svg.append(f'<text x="{sx}" y="{sy+5.5}" text-anchor="middle" class="num{" dark" if s["n"] in (1, STOPS[-1]["n"]) else ""}">{s["n"]}</text>')
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
<script src="https://bucklerfamily.estate/ghf-lang/ghf-boot.js?v={D["version"]}"></script>
</head>
<body>
<a class="skip" href="#board">Skip to the map</a>
<header class="top">
<div id="lang-slot"></div>
<button class="daybtn" type="button" data-ghf-mode-toggle><span aria-hidden="true">☀</span><span class="ghf-mode-txt">Day</span></button>
<img class="mark" src="/brand/cedwyn-tent-icon-128.png" width="72" height="72" alt="">
<h1 style="position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0" data-ghf-title><b>Cedwyn Estate</b></h1>
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
<script src="https://bucklerfamily.estate/ghf-lang/ghf-lang.js?v={D["version"]}" data-site="basecamp" defer></script>
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
BRAND_PATHS.update({k: v["colors"] for k, v in json.load(open(os.path.join(HERE, "locations.json"), encoding="utf-8"))["brand_paths"].items()})  # /wales/, /patagonia/ (campus/build_locations.py)
TWEAKS = {
  "fcg.bucklerfamily.estate": {"vars": {"--accent": "S"}},
  "projects.bucklerfamily.estate": {"vars": {"--accent": "S"}},
  "ebooks.bucklerfamily.estate": {"vars": {"--accent": "S"}},
  "shop.bucklerfamily.estate": {"vars": {"--accent": "S"}},
  "csscpsg.bucklerfamily.estate": {"vars": {"--gold": "S"}},
  "csscpsgp.bucklerfamily.estate": {"vars": {"--gold": "S"}},
  "chess.bucklerfamily.estate": {"buttons": False, "keep": "#board"},
  "maps.bucklerfamily.estate": {"buttons": False, "header": False, "links": False, "keep": "#map", "native": "dark"},
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
/*__LOCATIONS_INLINE__*/
(function () {
  "use strict";
  if (window.GHFBasecamp) return;
  var STOPS = __STOPS__;
  var TOTAL = STOPS.length, HOME = "https://bucklerfamily.estate/cedwyn/"; // 21 Oct 2026: the apex root is the Disclosure Dartboard; Cedwyn Estate base camp lives at /cedwyn/
  // assets come from the apex, or same-origin where a site serves /ghf-lang/ itself (a strict CSP, e.g. the mail archive)
  var SRC = (document.currentScript && document.currentScript.src) || "", ASSET = "https://bucklerfamily.estate";
  try { var su = new URL(SRC); if (su.origin !== ASSET && /^\/ghf-lang\//.test(su.pathname)) ASSET = su.origin; } catch (e) {}
  window.GHFBasecamp = { version: "__VER__", stops: STOPS };
  var host = (document.documentElement.getAttribute("data-ghf-host") || location.hostname).replace(/^www\./, ""), path = location.pathname || "/"; // a page served on the apex for another site (the dartboard at /) names its own host
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
    var pageNative = de.getAttribute("data-ghf-native"); // a page may pin its own scheme in its markup
    // v2.1.0 hybrid theme (21 Oct 2026): an explicit choice made with the toggle is saved and wins; with no saved choice the
    // page follows the device's light/dark setting (prefers-color-scheme), and where the browser reports none, the local
    // time (day 07:00-19:00, night otherwise). ghf-boot.js runs the same rule in <head> before the first paint.
    function saved() {
      try { var v = localStorage.getItem(KEY); if (v === "day" || v === "night") return v; } catch (e) {}
      var m = /(?:^|; )ghf_theme=(day|night)/.exec(document.cookie || "");
      return m ? m[1] : null;
    }
    function auto() {
      try { if (matchMedia("(prefers-color-scheme: dark)").matches) return "night"; if (matchMedia("(prefers-color-scheme: light)").matches) return "day"; } catch (e) {}
      var h = new Date().getHours(); return h >= 7 && h < 19 ? "day" : "night";
    }
    function mode() { return saved() || auto(); }
    function chrome(m) { // color-scheme (form controls, scrollbars) and the browser bar colour follow the mode
      if (document.body) de.style.colorScheme = native === "dark" ? "dark" : "light"; // the scheme the page itself is drawn in (an inverted page keeps its own: the filter flips the rest)
      var q = document.querySelectorAll('meta[name="theme-color"]'), i, mt = q[0];
      for (i = 1; i < q.length; i++) q[i].parentNode.removeChild(q[i]);
      if (!mt) { mt = document.createElement("meta"); mt.name = "theme-color"; (document.head || de).appendChild(mt); }
      mt.removeAttribute("media"); mt.content = m === "day" ? "#ffffff" : "#000000";
    }
    function save(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
      try { document.cookie = "ghf_theme=" + v + "; path=/; max-age=31536000; SameSite=Lax; Secure" + (/(^|\.)bucklerfamily\.estate$/.test(location.hostname) ? "; domain=.bucklerfamily.estate" : ""); } catch (e) {}
    }
    function rgbOf(c) { var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(c || ""); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; }
    function detect() { // the site's own scheme, read before any theme CSS is applied
      var forced = pageNative || (TWEAKS[host] || {}).native;
      if (forced) return forced;
      de.style.colorScheme = ""; de.removeAttribute("data-ghf-native"); // read the page's own scheme, not the one an earlier pass set (ghf-theme.css paints body by data-ghf-native)
      if (apex && (path === "/" || path === "/index.html" || /^\/(1d|cedwyn)(\/|$)/.test(path))) return "dark";
      var els = [document.body, de], i, c;
      for (i = 0; i < els.length; i++) {
        if (!els[i]) continue;
        c = rgbOf(getComputedStyle(els[i]).backgroundColor);
        if (c && c[3] > 0.5) return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 < 0.45 ? "dark" : "light";
      }
      var mc = document.querySelector('meta[name="color-scheme"]'), cs = (getComputedStyle(de).colorScheme || "") + " " + (mc ? mc.content : "");
      if (/dark/.test(cs) && !/light/.test(cs)) return "dark"; // a transparent page drawn on a dark canvas (color-scheme: dark)
      return "light";
    }
    var crit = null;
    function apply(m) {
      if (!native) native = detect();
      de.setAttribute("data-ghf-native", native);
      de.setAttribute("data-ghf-mode", m);
      de.classList.add("ghf-shell"); chrome(m);
      if (!/^(maps|chess|fb|2026-10-22)\./.test(host)) de.classList.add("ghf-hy"); // the hybrid type/spacing layer (ghf-tokens.css); these four keep their own
      de.classList.toggle("ghf-inv", (m === "day") !== (native === "light"));
      if (!crit) { // critical rules inline, so there is no flash while the shared CSS file loads
        crit = document.createElement("style"); crit.setAttribute("data-ghf-theme-crit", "");
        crit.textContent = "html.ghf-inv{filter:invert(1) hue-rotate(180deg)}" +
          "html.ghf-inv :is(img,video,canvas,iframe,embed,object,svg image,.ghf-ui,.ghf-bgimg,[data-ghf-keep]){filter:invert(1) hue-rotate(180deg)}" +
          "html.ghf-inv :is(.ghf-ui,.ghf-bgimg,[data-ghf-keep]) :is(img,video,canvas,iframe,embed,object,svg image,.ghf-ui,.ghf-bgimg,[data-ghf-keep]){filter:none}" +
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
      native = null; apply(mode()); // re-read the site's own scheme now that its CSS and body have loaded
      var q = document.querySelectorAll("[data-ghf-mode-toggle]"); for (var i = 0; i < q.length; i++) wire(q[i]);
      document.addEventListener("ghf-lang-change", function () { for (var i = 0; i < btns.length; i++) paintBtn(btns[i]); });
      window.addEventListener("load", function () { if (de.classList.contains("ghf-inv")) setTimeout(markBg, 300); });
      window.addEventListener("storage", function (ev) { if (ev.key === KEY && ev.newValue) apply(ev.newValue); });
      try { var mq = matchMedia("(prefers-color-scheme: dark)"), fol = function () { if (!saved()) apply(auto()); }; // no saved choice: follow the device live
        if (mq.addEventListener) mq.addEventListener("change", fol); else if (mq.addListener) mq.addListener(fol); setInterval(fol, 600000); } catch (e) {}
    }
    return { boot: boot, wire: wire, mode: mode, saved: saved, auto: auto, apply: apply, native: function () { return native; } };
  })();
  window.GHFTheme = GT;
  function whenBody(f) { if (document.body && document.readyState !== "loading") f(); else document.addEventListener("DOMContentLoaded", f); }
  // v2.0.3: run as soon as <body> exists (before the first paint when this file is loaded by the synchronous ghf-boot.js in <head>)
  function bodyNow(f) { if (document.body) return f(); var mo0 = new MutationObserver(function () { if (document.body) { mo0.disconnect(); f(); } }); mo0.observe(document.documentElement, { childList: true }); }
  if (apex && /^\/3d(\/|$)/.test(path)) return; // the full-screen 3D walk keeps its own look

  // ---------- header standard v2 (21 Oct 2026, Sion's Tab agent) ----------
  // Every site, top to bottom: (1) a blank bar the height of the WordPress.com bar on the Legal Wiki (45px up to 782px wide,
  // 49px above: measured 21 Oct 2026), (2) WALES | PATAGONIA | AI with the language menu at its right end, (3) ‹ PAGE NAME ›
  // stepping round ONE merry-go-round of every site (campus/site_chain.json → /ghf-lang/chain.json, embedded below), with a
  // full-screen toggle at the left and the menu (slides in from the right) at the right. Then the page's own content.
  var CHAIN = __CHAIN__;
  var TOKENS = __TOKENS__; // copy of ghf-tokens.css, used only where that file cannot load (a strict same-origin CSP)
  var V2 = (function () {
    var de = document.documentElement, wrap = null, chainBar = null, locBar = null, drawer = null, scrim = null, fsx = null, bgx = null;
    var shift = null, fsApi = false, lastFocus = null;
    var L = {
      en: { prev: "Previous site", next: "Next site", of: "of", fs: "Full screen", fsx: "Exit full screen", menu: "Menu", close: "Close menu", here: "On this site", all: "Every site, in order", home: "Cedwyn Estate · Base Camp", mode: "Day / Night", top: "Top of this page", loc: "Location" },
      cy: { prev: "Safle blaenorol", next: "Safle nesaf", of: "o", fs: "Sgrin lawn", fsx: "Gadael y sgrin lawn", menu: "Dewislen", close: "Cau’r ddewislen", here: "Ar y safle hwn", all: "Pob safle, yn eu trefn", home: "Ystâd Cedwyn · Gwersyll Sylfaen", mode: "Dydd / Nos", top: "Brig y dudalen hon", loc: "Lleoliad" },
      es: { prev: "Sitio anterior", next: "Sitio siguiente", of: "de", fs: "Pantalla completa", fsx: "Salir de pantalla completa", menu: "Menú", close: "Cerrar el menú", here: "En este sitio", all: "Todos los sitios, en orden", home: "Finca Cedwyn · Campamento base", mode: "Día / Noche", top: "Inicio de esta página", loc: "Lugar" }
    };
    var IC_FS = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
    var IC_FSX = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
    var IC_MENU = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6.5h16M4 12h16M4 17.5h16"/></svg>';
    function lg() { var l = (de.getAttribute("lang") || "en").slice(0, 2).toLowerCase(); return L[l] ? l : "en"; }
    function mk(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
    function nm(st) { var l = lg(); return (l !== "en" && st[l]) || st.t; }
    function find() {
      var i, j, best = -1, bl = -1, c, ps;
      for (i = 0; i < CHAIN.length; i++) {
        c = CHAIN[i]; ps = c.p || [];
        if (!apex) { for (j = 0; j < c.h.length; j++) if (c.h[j] === host) return i; continue; }
        for (j = 0; j < ps.length; j++) if (path.indexOf(ps[j]) === 0 && ps[j].length > bl) { best = i; bl = ps[j].length; }
      }
      return best;
    }
    function btn(cls, svg, lab, fn) { var b = mk("button", cls); b.type = "button"; b.innerHTML = svg; b.setAttribute("aria-label", lab); b.title = lab; b.addEventListener("click", fn); return b; }
    function fillChain() {
      var s = L[lg()], n = CHAIN.length, k = find(), pv = CHAIN[k < 0 ? n - 1 : (k - 1 + n) % n], nx = CHAIN[k < 0 ? 0 : (k + 1) % n];
      chainBar.textContent = "";
      chainBar.appendChild(btn("ghf-v2-btn ghf-v2-fs", IC_FS, s.fs, toggleFs));
      var arr = function (st, cls, ch, lab) { var a = mk("a", "ghf-v2-arr " + cls); a.href = st.u; a.setAttribute("aria-label", lab + ": " + nm(st)); a.title = lab + ": " + nm(st); a.appendChild(mk("span", null, ch)); a.setAttribute("data-ghf-chain", st.id); return a; };
      chainBar.appendChild(arr(pv, "ghf-v2-prev", "\u2039", s.prev));
      var mid = mk("div", "ghf-v2-name"), b = mk("b", null, k >= 0 ? nm(CHAIN[k]) : ((document.title || host).split(/\s[·|—–-]\s/)[0]));
      mid.appendChild(b); if (k >= 0) mid.appendChild(mk("small", null, (k + 1) + " " + s.of + " " + n));
      chainBar.appendChild(mid);
      chainBar.appendChild(arr(nx, "ghf-v2-next", "\u203A", s.next));
      chainBar.appendChild(btn("ghf-v2-btn ghf-v2-bgr", IC_MENU, s.menu, openDrawer));
      chainBar.setAttribute("aria-label", k >= 0 ? nm(CHAIN[k]) : host);
      if (fsx) { fsx.setAttribute("aria-label", s.fsx); fsx.title = s.fsx; bgx.setAttribute("aria-label", s.menu); bgx.title = s.menu; }
    }
    // ---- full screen: the browser's Fullscreen API where it exists, plus a class that hides bars 1–3 (all iOS Safari gets) ----
    function isFs() { return de.classList.contains("ghf-fs"); }
    function setFs(on) { de.classList.toggle("ghf-fs", on); if (shift) setTimeout(shift, 30); }
    function toggleFs() {
      var on = !isFs(), cur = document.fullscreenElement || document.webkitFullscreenElement;
      var req = de.requestFullscreen || de.webkitRequestFullscreen, ex = document.exitFullscreen || document.webkitExitFullscreen;
      setFs(on);
      try {
        if (on && req && !cur) { var p = req.call(de); if (p && p.catch) p.catch(function () {}); }
        if (!on && ex && cur) { var q = ex.call(document); if (q && q.catch) q.catch(function () {}); }
      } catch (e) {}
    }
    function fsSync() { var cur = document.fullscreenElement || document.webkitFullscreenElement; if (cur) fsApi = true; else if (fsApi) { fsApi = false; if (isFs()) setFs(false); } }
    document.addEventListener("fullscreenchange", fsSync); document.addEventListener("webkitfullscreenchange", fsSync);
    // ---- the menu: slides in from the right; this site's own links, Day/Night, then every site in chain order ----
    // a site's own burger is replaced by this one: its links move into this menu (one burger, top right, on every site)
    var SB = "button.burger, button.hamburger, .menu-toggle, .nav-toggle, button[aria-label='Menu' i], button[aria-label='Open menu' i], button[aria-label='Open the menu' i]";
    function siteBurgers() {
      var out = [], q = document.querySelectorAll(SB), i, b, r, y = window.pageYOffset || 0;
      for (i = 0; i < q.length; i++) { b = q[i]; if (b.closest(".ghf-ui")) continue; r = b.getBoundingClientRect(); if (r.width && r.top + y < 320) out.push(b); }
      return out;
    }
    function hideSiteBurgers() {
      siteBurgers().forEach(function (b) {
        var id = b.getAttribute("aria-controls"), m = id && document.getElementById(id);
        if (!m || m.querySelectorAll("a[href]").length >= 2) b.classList.add("ghf-v2-gone");
      });
    }
    function txt(n) { var w = document.createTreeWalker(n, 4), o = [], c; while ((c = w.nextNode())) o.push(c.nodeValue); return o.join(" "); }
    function harvest() {
      var sel = "header a[href], nav a[href], [role=navigation] a[href], .menu a[href], .nav a[href]";
      document.querySelectorAll(".ghf-v2-gone[aria-controls]").forEach(function (b) { sel = "#" + b.getAttribute("aria-controls") + " a[href], " + sel; });
      var out = [], seen = {}, q = document.querySelectorAll(sel), i, a, t, h;
      for (i = 0; i < q.length && out.length < 24; i++) {
        a = q[i]; if (a.closest(".ghf-ui") || a.closest(".ghf-v2-drawer")) continue;
        t = (a.innerText || txt(a) || a.getAttribute("aria-label") || a.title || "").replace(/\s+/g, " ").trim();
        h = a.getAttribute("href"); if (!t || t.length > 70 || !h || /^javascript:/i.test(h) || h === "#") continue;
        h = a.href; if (seen[h]) continue; seen[h] = 1; out.push([t, h]);
      }
      if (out.length < 2) {
        q = document.querySelectorAll("h2[id], section[id] > h2, section[id] > header > h2");
        for (i = 0; i < q.length && out.length < 24; i++) {
          a = q[i]; if (a.closest(".ghf-ui")) continue; var id = a.id || (a.closest("section[id]") || {}).id; if (!id || seen["#" + id]) continue;
          t = (a.textContent || "").replace(/\s+/g, " ").trim(); if (!t || t.length > 70) continue; seen["#" + id] = 1; out.push([t, "#" + id]);
        }
      }
      return out;
    }
    function fillDrawer() {
      var s = L[lg()], k = find(), inn = drawer.querySelector(".ghf-v2-din"); inn.textContent = "";
      var hd = mk("div", "ghf-v2-dhd"); hd.appendChild(mk("b", null, k >= 0 ? nm(CHAIN[k]) : host));
      var x = mk("button", "ghf-v2-btn ghf-v2-dx", "\u00D7"); x.type = "button"; x.setAttribute("aria-label", s.close); x.title = s.close; x.onclick = closeDrawer; hd.appendChild(x); inn.appendChild(hd);
      var links = harvest();
      var dh1 = mk("div", "ghf-v2-dh", s.here); dh1.setAttribute("role", "heading"); dh1.setAttribute("aria-level", "2"); inn.appendChild(dh1);
      var ul = mk("ul", "ghf-v2-dl"), li, a;
      li = mk("li"); a = mk("a", null, s.top); a.href = "#"; a.onclick = function (e) { e.preventDefault(); closeDrawer(); window.scrollTo(0, 0); }; li.appendChild(a); ul.appendChild(li);
      links.forEach(function (l) { li = mk("li"); a = mk("a", null, l[0]); a.href = l[1]; a.onclick = function () { setTimeout(closeDrawer, 10); }; li.appendChild(a); ul.appendChild(li); });
      inn.appendChild(ul);
      var row = mk("div", "ghf-v2-drow"), mb = mk("button", "ghf-v2-mode"); mb.setAttribute("data-ghf-mode-toggle", ""); row.appendChild(mb); inn.appendChild(row);
      try { GT.wire(mb); } catch (e) {}
      var dh2 = mk("div", "ghf-v2-dh", s.all); dh2.setAttribute("role", "heading"); dh2.setAttribute("aria-level", "2"); inn.appendChild(dh2);
      var ol = mk("ol", "ghf-v2-dl ghf-v2-dall");
      CHAIN.forEach(function (st, i) { li = mk("li"); a = mk("a", null, nm(st)); a.href = st.u; if (i === k) a.setAttribute("aria-current", "page"); li.appendChild(a); ol.appendChild(li); });
      inn.appendChild(ol);
      var hm = mk("a", "ghf-v2-dhome", s.home); hm.href = HOME; inn.appendChild(hm);
    }
    function openDrawer() {
      if (!drawer) {
        scrim = mk("div", "ghf-v2-scrim ghf-ui"); scrim.onclick = closeDrawer;
        drawer = mk("aside", "ghf-v2-drawer ghf-ui"); drawer.setAttribute("role", "dialog"); drawer.setAttribute("aria-modal", "true");
        drawer.setAttribute("data-no-translate", ""); drawer.setAttribute("translate", "no"); drawer.appendChild(mk("div", "ghf-v2-din"));
        document.body.appendChild(scrim); document.body.appendChild(drawer);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape" && de.classList.contains("ghf-v2-open")) closeDrawer(); });
      }
      lastFocus = document.activeElement; fillDrawer(); drawer.setAttribute("aria-label", L[lg()].menu);
      drawer.offsetWidth; de.classList.add("ghf-v2-open");
      var f = drawer.querySelector(".ghf-v2-dx"); if (f) setTimeout(function () { try { f.focus(); } catch (e) {} }, 60);
    }
    function closeDrawer() { de.classList.remove("ghf-v2-open"); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} }
    // ---- a page title that only repeats the name in the bar is hidden (kept for screen readers) ----
    function norm(x) { return (x || "").toLowerCase().replace(/&/g, " and ").replace(/[\u2018\u2019']/g, "").replace(/[^a-z0-9\u00c0-\u024f\u0174-\u0177 ]+/g, " ").replace(/\b(the|a|an|y|yr|la|el)\b/g, " ").replace(/\s+/g, " ").trim(); }
    function dedupe() {
      var k = find(); if (k < 0) return;
      var names = [CHAIN[k].t, CHAIN[k].cy, CHAIN[k].es].concat(CHAIN[k].d || []).filter(Boolean).map(norm);
      var hs = document.querySelectorAll("h1, [data-ghf-title]"), i, h, t, r, y = window.pageYOffset || 0, xs = [];
      // site_chain.json "x": that site's own title block (kicker, brand line) that only repeats the bar's name; hidden the same way
      try { if (CHAIN[k].x && CHAIN[k].x.length) xs = document.querySelectorAll(CHAIN[k].x.join(",")); } catch (e) { xs = []; }
      for (i = 0; i < xs.length && i < 12; i++) {
        h = xs[i]; if (h.closest(".ghf-ui")) continue;
        r = h.getBoundingClientRect(); if (r.top + y > 1100) continue;
        h.classList.add("ghf-v2-dup");
      }
      for (i = 0; i < hs.length && i < 6; i++) {
        h = hs[i]; if (h.closest(".ghf-ui")) continue;
        r = h.getBoundingClientRect(); if (r.top + y > 1100 || (r.width === 0 && r.height === 0)) continue;
        t = norm(h.textContent); if (!t) continue;
        if (h.hasAttribute("data-ghf-title") || names.some(function (n) { return n && (t === n || (n.length > 5 && (t.indexOf(n) === 0 || n.indexOf(t) === 0) && Math.abs(t.length - n.length) <= 14)); })) h.classList.add("ghf-v2-dup");
      }
    }
    // ---- v2.0.3: the bars are built the moment <body> exists; these re-run once the page has parsed ----
    function fitBody() { // cancel the page's own body margin/padding so the bars run edge to edge
      if (!wrap) return;
      var bs = getComputedStyle(document.body), mt = (parseFloat(bs.marginTop) || 0) + (parseFloat(bs.paddingTop) || 0), ml = (parseFloat(bs.marginLeft) || 0) + (parseFloat(bs.paddingLeft) || 0), mr = (parseFloat(bs.marginRight) || 0) + (parseFloat(bs.paddingRight) || 0);
      wrap.style.removeProperty("margin"); wrap.style.removeProperty("width"); wrap.style.removeProperty("margin-bottom");
      if (mt || ml || mr) { wrap.style.setProperty("margin", (-mt) + "px " + (-mr) + "px 0 " + (-ml) + "px", "important"); wrap.style.setProperty("width", "calc(100% + " + (ml + mr) + "px)", "important"); }
      if (mt) wrap.style.setProperty("margin-bottom", mt + "px", "important");
    }
    var pinned = [], pinWired = false;
    function pins() { // keep the bars above any header the site pins to the top of the screen
      if (!wrap) return;
      var q = document.querySelectorAll("body > *, body > * > *, body > * > * > *"), i, e, r, cs;
      for (i = 0; i < q.length && i < 600; i++) {
        e = q[i]; if (e === wrap || e.closest(".ghf-ui") || pinned.indexOf(e) >= 0) continue;
        cs = getComputedStyle(e); if (cs.position !== "fixed" && cs.position !== "sticky") continue;
        r = e.getBoundingClientRect();
        if (r.top <= 2 && r.height > 0 && r.height < 170 && r.width > (window.innerWidth || 390) * 0.5) pinned.push(e);
      }
      shift = function () {
        var off = isFs() ? 0 : Math.max(0, Math.round(wrap.getBoundingClientRect().bottom));
        for (var k2 = 0; k2 < pinned.length; k2++) { if (getComputedStyle(pinned[k2]).position === "fixed") pinned[k2].style.setProperty("top", off + "px", "important"); }
      };
      if (pinned.length) { shift(); if (!pinWired) { pinWired = true; window.addEventListener("scroll", shift, { passive: true }); window.addEventListener("resize", shift); setTimeout(shift, 900); } }
    }
    function watchTitles() { // hide a repeated page title the moment the parser adds it, so it is never painted
      if (document.readyState !== "loading" || !window.MutationObserver) return;
      var kx = find(), XS = kx >= 0 && CHAIN[kx].x && CHAIN[kx].x.length ? CHAIN[kx].x.join(",") : "";
      try { if (XS) document.querySelector(XS); } catch (e) { XS = ""; }
      var mo = new MutationObserver(function (recs) {
        for (var a = 0; a < recs.length; a++) for (var b = 0; b < recs[a].addedNodes.length; b++) {
          var n = recs[a].addedNodes[b];
          if (n.nodeType === 1 && (n.tagName === "H1" || n.hasAttribute("data-ghf-title") || (n.querySelector && n.querySelector("h1,[data-ghf-title]")) || (XS && (n.matches(XS) || n.querySelector(XS))))) { dedupe(); return; }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      document.addEventListener("DOMContentLoaded", function () { mo.disconnect(); });
    }
    // ---- language menu: one switch, always at the right end of the location bar ----
    function moveLang() {
      var slot = wrap && wrap.querySelector(".ghf-v2-lang"), l = document.querySelector(".ghf-lang");
      if (slot && l && !slot.contains(l)) { slot.appendChild(l); l.classList.remove("ghf-fixed"); l.style.top = l.style.right = l.style.left = l.style.bottom = ""; l.style.position = ""; }
    }
    function locs() {
      var box = wrap.querySelector(".ghf-v2-locs");
      var go = function () {
        var have = document.querySelector(".ghf-loc");
        if (have) { if (!box.contains(have)) box.appendChild(have); }
        else if (window.GHFLoc) { var m = mk("span"); box.appendChild(m); window.GHFLoc.strip(m); m.parentNode && m.parentNode.removeChild(m); }
        if (shift) setTimeout(shift, 50);
      };
      if (window.GHFLoc) return go();
      var ls = document.createElement("script"); ls.src = ASSET + "/ghf-lang/locations.js?v=__VER__"; ls.async = true; ls.onload = go;
      (document.head || de).appendChild(ls);
    }
    function mount() {
      if (wrap) return wrap;
      if (!document.body || window.self !== window.top && !/[?&]ghfbars\b/.test(location.search)) return null;
      // the shared type tokens go in inline (same bytes as /ghf-lang/ghf-tokens.css), so sizes and fonts never change after the first paint
      if (!document.querySelector("style[data-ghf-tokens-inline]")) { var ts = document.createElement("style"); ts.setAttribute("data-ghf-tokens-inline", ""); ts.textContent = TOKENS; (document.head || de).appendChild(ts); }
      var st = document.createElement("style"); st.setAttribute("data-ghf-v2", ""); st.textContent = V2CSS; (document.head || de).appendChild(st);
      wrap = mk("div", "ghf-v2 ghf-ui"); wrap.setAttribute("data-no-translate", ""); wrap.setAttribute("translate", "no");
      var sp = mk("div", "ghf-v2-sp"); sp.setAttribute("aria-hidden", "true");
      locBar = mk("nav", "ghf-v2-loc"); locBar.setAttribute("aria-label", L[lg()].loc);
      locBar.appendChild(mk("div", "ghf-v2-locs")); locBar.appendChild(mk("div", "ghf-v2-lang"));
      chainBar = mk("nav", "ghf-v2-chain");
      wrap.appendChild(sp); wrap.appendChild(locBar); wrap.appendChild(chainBar);
      document.body.insertBefore(wrap, document.body.firstChild);
      fitBody();
      fsx = btn("ghf-v2-btn ghf-v2-fsx ghf-ui", IC_FSX, L[lg()].fsx, toggleFs); bgx = btn("ghf-v2-btn ghf-v2-bgx ghf-ui", IC_MENU, L[lg()].menu, openDrawer);
      document.body.appendChild(fsx); document.body.appendChild(bgx);
      de.classList.add("ghf-v2-on"); de.classList.remove("ghf-v2-pre"); if (/^(maps|chess)\./.test(host)) de.classList.add("ghf-keep-type");
      fillChain(); locs(); moveLang();
      var mo = new MutationObserver(moveLang); mo.observe(document.body, { childList: true, subtree: true }); setTimeout(function () { mo.disconnect(); }, 15000);
      document.addEventListener("ghf-lang-change", function () { fillChain(); if (de.classList.contains("ghf-v2-open")) fillDrawer(); });
      pins();
      watchTitles();
      var later = function () { fitBody(); pins(); hideSiteBurgers(); dedupe(); // after parsing, so a page's own ghf-lang.js tag (with its data-site) is seen first
        if (!window.GHFLang && !document.querySelector('script[src*="ghf-lang.js"]')) { var gs = document.createElement("script"); gs.src = ASSET + "/ghf-lang/ghf-lang.js?v=__VER__"; gs.async = true; (document.head || de).appendChild(gs); } };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", later); else setTimeout(later, 0);
      window.addEventListener("load", function () { fitBody(); pins(); setTimeout(function () { fitBody(); pins(); }, 1200); }); // pages whose CSS arrives late (bundled apps)
      hideSiteBurgers(); setTimeout(hideSiteBurgers, 1200); dedupe(); setTimeout(dedupe, 1200); window.addEventListener("load", function () { setTimeout(dedupe, 300); });
      return wrap;
    }
    var V2CSS =
      ".ghf-v2{position:relative;z-index:2147481990;display:block!important;width:100%;margin:0!important;padding:0!important;background:#000;color:#fff;font:400 var(--ghf-fs-sm,14px)/1.2 var(--ghf-font,Barlow,'Helvetica Neue',Arial,system-ui,sans-serif)!important;-webkit-font-smoothing:antialiased;text-align:left;box-sizing:border-box}" +
      ".ghf-v2 *{box-sizing:border-box}" +
      ".ghf-v2-sp{display:block;height:45px;background:#000;border:0;margin:0;padding:0}@media (min-width:783px){.ghf-v2-sp{height:49px}}" +
      ".ghf-v2-loc{display:flex!important;align-items:center;gap:4px;margin:0;padding:0 6px 0 2px!important;height:50px;min-height:50px;max-height:50px;box-sizing:border-box!important;overflow:hidden;background:#000;border-top:1px solid rgba(255,255,255,.14);border-bottom:1px solid rgba(255,255,255,.14)}" +
      ".ghf-v2-locs{flex:1 1 auto;min-width:0;display:flex}.ghf-v2 .ghf-loc{flex:1 1 auto;width:auto!important;background:transparent!important;border:0!important;padding:0!important;z-index:auto}" +
      ".ghf-v2 .ghf-loc a.ghf-loc-ch{display:none!important}.ghf-v2 .ghf-loc a{background:transparent!important;box-shadow:none!important;outline-offset:-2px}" +
      ".ghf-v2-lang{flex:0 0 auto;display:flex;align-items:center;justify-content:flex-end;min-width:58px}" +
      ".ghf-v2 .ghf-lang{position:relative!important;top:auto!important;right:auto!important;left:auto!important;bottom:auto!important;margin:0!important;--ghf-lang-bg:transparent;--ghf-lang-fg:#fff;--ghf-lang-bd:rgba(255,255,255,.4)}" +
      ".ghf-v2 .ghf-lang-btn{min-height:32px!important;padding:4px 8px!important;border-radius:4px!important;font-size:12px!important}" +
      ".ghf-v2 .ghf-lang-menu{right:0!important;left:auto!important}" +
      ".ghf-v2-chain{display:flex!important;align-items:center;gap:2px;margin:0;padding:0 4px!important;height:53px;min-height:53px;max-height:53px;box-sizing:border-box!important;overflow:hidden;background:#000;border-bottom:1px solid var(--ghf-s,#f2c94c)}" +
      ".ghf-v2-name{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2px 2px;overflow:hidden;max-height:52px}" +
      ".ghf-v2-name b{display:block;max-width:100%;font-weight:500;font-size:var(--ghf-fs-md,17px);line-height:1.15;letter-spacing:.08em;text-transform:uppercase;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".ghf-v2-name small{display:block;font-size:10.5px;line-height:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ghf-s,#f2c94c);margin-top:2px}" +
      "@media (max-width:420px){.ghf-v2-name b{font-size:14px;line-height:16px;letter-spacing:.05em;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}}" +
      ".ghf-v2 a.ghf-v2-arr{flex:0 0 40px;display:flex!important;align-items:center;justify-content:center;height:44px;color:#fff!important;text-decoration:none!important;font-size:34px;line-height:1;font-weight:300;border-radius:4px}" +
      ".ghf-v2 a.ghf-v2-arr span{display:block;transform:translateY(-2px)}" +
      ".ghf-v2 a.ghf-v2-arr:hover,.ghf-v2 a.ghf-v2-arr:focus-visible{color:var(--ghf-s,#f2c94c)!important;background:rgba(255,255,255,.08)}" +
      ".ghf-v2-btn{flex:0 0 40px;display:inline-flex!important;align-items:center;justify-content:center;width:40px;height:40px;margin:0!important;padding:0!important;border:1px solid rgba(255,255,255,.28)!important;border-radius:4px!important;background:transparent!important;color:#fff!important;cursor:pointer;font:inherit;line-height:1}" +
      ".ghf-v2-btn:hover,.ghf-v2-btn:focus-visible{border-color:var(--ghf-s,#f2c94c)!important;color:var(--ghf-s,#f2c94c)!important}" +
      ".ghf-v2 :focus-visible,.ghf-v2-drawer :focus-visible,.ghf-v2-btn:focus-visible{outline:2px solid var(--ghf-s,#f2c94c);outline-offset:2px}" +
      ".ghf-v2-fsx,.ghf-v2-bgx{display:none!important;position:fixed!important;top:8px;z-index:2147482500;background:rgba(0,0,0,.72)!important;width:40px;height:40px}" +
      ".ghf-v2-fsx{left:8px}.ghf-v2-bgx{right:8px}" +
      "html.ghf-fs .ghf-v2,html.ghf-fs .ghf-bc{display:none!important}html.ghf-fs .ghf-v2-fsx,html.ghf-fs .ghf-v2-bgx{display:inline-flex!important}" +
      ".ghf-v2-scrim{position:fixed;inset:0;z-index:2147482990;background:rgba(0,0,0,.5);opacity:0;visibility:hidden;transition:opacity .25s,visibility 0s .25s}" +
      ".ghf-v2-drawer{position:fixed;top:0;right:0;bottom:0;z-index:2147483000;width:min(340px,88vw);background:#0b0b0b;color:#fff;border-left:1px solid var(--ghf-s,#f2c94c);transform:translateX(102%);visibility:hidden;transition:transform .28s ease,visibility 0s .28s;overflow-y:auto;-webkit-overflow-scrolling:touch;font:400 var(--ghf-fs-base,16px)/1.4 var(--ghf-font,Barlow,'Helvetica Neue',Arial,system-ui,sans-serif);text-align:left;box-shadow:-8px 0 30px rgba(0,0,0,.5)}" +
      "html.ghf-v2-open .ghf-v2-drawer{transform:none;visibility:visible;transition:transform .28s ease}html.ghf-v2-open .ghf-v2-scrim{opacity:1;visibility:visible;transition:opacity .25s}" +
      ".ghf-v2-din{padding:10px 14px 28px}.ghf-v2-dhd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:2px 0 10px;border-bottom:1px solid rgba(255,255,255,.16)}" +
      ".ghf-v2-dhd b{font-weight:500;letter-spacing:.08em;text-transform:uppercase;font-size:var(--ghf-fs-sm,14px)}.ghf-v2-dx{font-size:24px!important}" +
      ".ghf-v2-dh{margin:16px 0 6px!important;padding:0!important;font:500 11px/1.2 var(--ghf-font,Barlow,Arial,sans-serif)!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:var(--ghf-s,#f2c94c)!important;border:0!important}" +
      ".ghf-v2-dl{list-style:none!important;margin:0!important;padding:0!important}.ghf-v2-dl li{margin:0!important;padding:0!important;list-style:none!important}" +
      ".ghf-v2-dl a,.ghf-v2-dhome{display:block;padding:9px 4px!important;color:#eee!important;text-decoration:none!important;border-bottom:1px solid rgba(255,255,255,.08);font-size:var(--ghf-fs-base,16px)!important;line-height:1.3!important}" +
      ".ghf-v2-dl a:hover,.ghf-v2-dl a:focus-visible,.ghf-v2-dhome:hover{color:var(--ghf-s,#f2c94c)!important}.ghf-v2-dl a[aria-current=page]{color:var(--ghf-s,#f2c94c)!important;font-weight:600}" +
      ".ghf-v2-dall{counter-reset:ghfc}.ghf-v2-dall li{counter-increment:ghfc}.ghf-v2-dall a::before{content:counter(ghfc) '. ';opacity:.55;font-size:.85em}" +
      ".ghf-v2-drow{margin:14px 0 0}.ghf-v2-mode{display:inline-flex!important;align-items:center;gap:6px;height:36px;padding:0 12px!important;border:1px solid rgba(255,255,255,.35)!important;border-radius:4px!important;background:transparent!important;color:#fff!important;cursor:pointer;letter-spacing:.12em;text-transform:uppercase;font-size:12px!important}" +
      ".ghf-v2-dhome{margin-top:18px;border:1px solid rgba(255,255,255,.2)!important;border-radius:4px;text-align:center;letter-spacing:.1em;text-transform:uppercase;font-size:13px!important}" +
      ".ghf-v2-gone{display:none!important}.ghf-v2-dup{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}" +
      "html[data-ghf-mode=day] .ghf-v2,html[data-ghf-mode=day] .ghf-v2-sp,html[data-ghf-mode=day] .ghf-v2-loc,html[data-ghf-mode=day] .ghf-v2-chain{background:#fff;color:#000}" +
      "html[data-ghf-mode=day] .ghf-v2-loc{border-color:#ddd}html[data-ghf-mode=day] .ghf-v2-chain{border-bottom-color:var(--ghf-p,#0a0a0a)}" +
      "html[data-ghf-mode=day] .ghf-v2-name b,html[data-ghf-mode=day] .ghf-v2 a.ghf-v2-arr,html[data-ghf-mode=day] .ghf-v2 .ghf-v2-btn{color:#000!important}html[data-ghf-mode=day] .ghf-v2-name small{color:var(--ghf-p,#0a0a0a)}" +
      "html[data-ghf-mode=day] .ghf-v2-btn{border-color:rgba(0,0,0,.3)!important}html[data-ghf-mode=day] .ghf-v2 .ghf-lang{--ghf-lang-fg:#000;--ghf-lang-bd:rgba(0,0,0,.35)}" +
      "html[data-ghf-mode=day] .ghf-v2-drawer{background:#fff;color:#111;border-left-color:var(--ghf-p,#0a0a0a)}html[data-ghf-mode=day] .ghf-v2-dl a,html[data-ghf-mode=day] .ghf-v2-dhome{color:#111!important;border-color:rgba(0,0,0,.1)!important}" +
      "html[data-ghf-mode=day] .ghf-v2-dh{color:var(--ghf-p,#0a0a0a)!important}html[data-ghf-mode=day] .ghf-v2-mode,html[data-ghf-mode=day] .ghf-v2-dx{color:#111!important;border-color:rgba(0,0,0,.35)!important}" +
      "html[data-ghf-mode=day] .ghf-v2-fsx,html[data-ghf-mode=day] .ghf-v2-bgx{background:rgba(255,255,255,.85)!important;color:#000!important}" +
      "html.ghf-v2-on .ghf-top,html.ghf-v2-on .ghf-sub{display:none!important}html.ghf-v2-on{overflow-x:clip}" +
      "@media print{.ghf-v2,.ghf-v2-fsx,.ghf-v2-bgx,.ghf-v2-drawer,.ghf-v2-scrim{display:none!important}}";
    return { mount: mount, find: find, chain: CHAIN, wrap: function () { return wrap; }, fullscreen: toggleFs, menu: openDrawer };
  })();
  // v2.0.3: theme and bars as soon as <body> exists (no late pop-in, no light-to-dark flash); the full theme pass re-runs after parsing
  if (!(window.self !== window.top && !/[?&]ghfbars\b/.test(location.search))) bodyNow(function () { try { GT.apply(GT.mode()); } catch (e) {} try { V2.mount(); } catch (e) {} });
  if (apex && (path === "/" || path === "/index.html" || /^\/(1d|cedwyn)(\/|$)/.test(path))) { whenBody(GT.boot); whenBody(function () { V2.mount(); }); return; } // this IS base camp (1D list, 2D map)
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
    try { mt.content = GT.mode() === "day" ? "#ffffff" : "#000000"; } catch (e) {} // v2.1.0: the browser bar follows the day/night mode
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
    en: { less: "Close", all: "All sites", prev: "Previous site", nxt: "Next site", site: "Site", sof: "of", home: "Cedwyn Estate · Base Camp", back: "Back to Cedwyn Estate", sub: "Great House", stop: "Stop", of: "of", next: "Next", hide: "Hide", show: "Cedwyn Estate", end: "Journey’s end" },
    cy: { less: "Cau", all: "Pob safle", prev: "Safle blaenorol", nxt: "Safle nesaf", site: "Safle", sof: "o", home: "Ystâd Cedwyn · Gwersyll Sylfaen", back: "Yn ôl i Ystâd Cedwyn", sub: "Tŷ Mawr", stop: "Arhosfan", of: "o", next: "Nesaf", hide: "Cuddio", show: "Ystâd Cedwyn", end: "Diwedd y daith" },
    es: { less: "Cerrar", all: "Todos los sitios", prev: "Sitio anterior", nxt: "Sitio siguiente", site: "Sitio", sof: "de", home: "Finca Cedwyn · Campamento base", back: "Volver a la Finca Cedwyn", sub: "Great House", stop: "Parada", of: "de", next: "Siguiente", hide: "Ocultar", show: "Finca Cedwyn", end: "Fin del recorrido" }
  };
  function lang() {
    var l = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
    return T[l] ? l : "en";
  }
  var KEY = "ghf-bc-min", nav, css, bar, sub = null, shiftNow = null;
  var TWO = !apex && /(^|\.)bucklerfamily\.estate$/.test(host); // a subdomain: master bar collapses, the site's own tier shows
  var RING = STOPS.filter(function (st, i) { return /^https:\/\/[a-z0-9-]+\.bucklerfamily\.estate\//.test(st.u) && STOPS.map(function (x) { return x.u; }).indexOf(st.u) === i; }); // the subdomain sites, in base camp order (the WordPress wiki and external pages cannot show these arrows)
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
    var sh = home.querySelector(".ghf-top-short"); if (sh) sh.textContent = s.show;
    var sn = bar.querySelector(".ghf-top-site"); if (sn) sn.textContent = here ? here.t : "";
    var tg = bar.querySelector(".ghf-top-tog");
    if (tg) { var o = document.documentElement.classList.contains("ghf-open"); tg.setAttribute("aria-expanded", o ? "true" : "false"); tg.setAttribute("aria-label", o ? s.less : s.all); tg.title = o ? s.less : s.all; tg.innerHTML = '<span class="ghf-tog-t">' + (o ? s.less : s.all) + '</span><span class="ghf-tog-i" aria-hidden="true">' + (o ? "\u25B4" : "\u25BE") + "</span>"; }
    if (sub) fillSub();
  }
  function buildBar() {
    bar = el("header", "ghf-top ghf-ui"); bar.setAttribute("data-no-translate", ""); bar.setAttribute("translate", "no");
    bar.setAttribute("aria-label", "Cedwyn Estate");
    var a = el("a", "ghf-top-home"); a.href = HOME;
    var badge = el("span", "ghf-top-badge"); var mk = document.createElement("img"); mk.src = ICON; mk.alt = ""; mk.width = 24; mk.height = 24; badge.appendChild(mk);
    a.appendChild(badge);
    var tx = el("span", "ghf-top-tx"); tx.appendChild(el("span", "ghf-top-name")); tx.appendChild(el("span", "ghf-top-short")); tx.appendChild(el("span", "ghf-top-site"));
    a.appendChild(tx); bar.appendChild(a);
    var right = el("div", "ghf-top-r");
    right.appendChild(el("span", "ghf-top-lang"));
    var mb = el("button", "ghf-top-mode"); mb.setAttribute("data-ghf-mode-toggle", ""); right.appendChild(mb);
    if (TWO) { // two tiers: on a subdomain the master bar starts as a thin strip, one tap to open
      var mn = el("span", "ghf-top-mini"); right.insertBefore(mn, right.firstChild);
      var tg = el("button", "ghf-top-tog"); tg.type = "button"; tg.setAttribute("aria-expanded", "false");
      tg.onclick = function () { var o = !document.documentElement.classList.contains("ghf-open"); document.documentElement.classList.toggle("ghf-open", o); renderBar(); if (shiftNow) shiftNow(); };
      right.appendChild(tg);
      document.documentElement.classList.add("ghf-two");
    }
    bar.appendChild(right);
    document.body.insertBefore(bar, document.body.firstChild);
    if (TWO) { sub = buildSub(); bar.parentNode.insertBefore(sub, bar.nextSibling); }
    GT.wire(mb);
    renderBar();
    moveLang();
    locStrip();
    // keep the bar above any header the site pins to the top of the screen
    var pinned = [], q = document.querySelectorAll("body > *, body > * > *, body > * > * > *"), i, e, r, cs;
    for (i = 0; i < q.length && i < 600; i++) {
      e = q[i]; if (e === bar || e.closest(".ghf-ui")) continue;
      cs = getComputedStyle(e); if (cs.position !== "fixed") continue;
      r = e.getBoundingClientRect();
      if (r.top <= 2 && r.height > 0 && r.height < 170 && r.width > (window.innerWidth || 390) * 0.5) pinned.push(e);
    }
    var bh = function () { var last = sub || bar, r = last.getBoundingClientRect(); return Math.round(r.bottom + (window.pageYOffset || 0)) || bar.offsetHeight || 46; };
    var shift = function () { var off = Math.max(0, bh() - (window.pageYOffset || 0)); for (var k = 0; k < pinned.length; k++) pinned[k].style.setProperty("top", off + "px", "important"); };
    if (pinned.length) { shift(); window.addEventListener("scroll", shift, { passive: true }); window.addEventListener("resize", shift); }
    shiftNow = shift; setTimeout(shift, 900);
    // the floating pill appears only once the bar is out of view, so the way home is always one tap away
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { var away = !en[0].isIntersecting; nav.setAttribute("data-away", away ? "1" : "0"); nav.classList.toggle("ghf-bc-hide", !away); }).observe(bar);
    } else nav.setAttribute("data-away", "1");
  }
  // ---------- second tier (21 Oct 2026): this site's own bar under the master bar ----------
  // "bucklerfamily.estate › maps" shows that every subdomain sits under the master page; ‹ and › step through the sites
  // in base camp order (campus/basecamp_stops.json, wrapping round), so a visitor can browse them all one by one.
  function label(st) { var h = st.h[0]; if (!h) return st.p[0] ? "bucklerfamily.estate" + st.p[0].replace(/\/$/, "") : st.t;
    return /\.bucklerfamily\.estate$/.test(h) ? h.replace(/\.bucklerfamily\.estate$/, "") : h; }
  function buildSub() { var d = el("nav", "ghf-sub ghf-ui"); d.setAttribute("data-no-translate", ""); d.setAttribute("translate", "no"); return d; }
  function fillSub() {
    var s = T[lang()], k = here ? RING.indexOf(here) : -1, n = RING.length;
    var pv = RING[k < 0 ? n - 1 : (k - 1 + n) % n], nx = RING[k < 0 ? 0 : (k + 1) % n];
    sub.textContent = ""; sub.setAttribute("aria-label", here ? here.t : host);
    var mk = function (st, cls, ch, lab) { var a = el("a", "ghf-sub-arr " + cls); a.href = st.u; a.setAttribute("aria-label", lab + ": " + st.t); a.title = lab + ": " + st.t; a.appendChild(el("span", "ghf-sub-ch", ch)); a.setAttribute("aria-hidden", "false"); return a; };
    sub.appendChild(mk(pv, "ghf-sub-prev", "\u2039", s.prev));
    var mid = el("div", "ghf-sub-mid"), cr = el("div", "ghf-sub-crumb"), ap = el("a", "ghf-sub-apex", "bucklerfamily.estate"); ap.href = HOME;
    cr.appendChild(ap); cr.appendChild(el("span", "ghf-sub-sep", " \u203A ")); cr.appendChild(el("span", "ghf-sub-host", here ? label(here) : host.replace(/\.bucklerfamily\.estate$/, "")));
    mid.appendChild(cr);
    var tt = el("div", "ghf-sub-title"); tt.appendChild(el("b", null, here ? here.t : host)); if (k >= 0) tt.appendChild(el("small", null, s.site + " " + (k + 1) + " " + s.sof + " " + n)); mid.appendChild(tt);
    sub.appendChild(mid);
    sub.appendChild(mk(nx, "ghf-sub-next", "\u203A", s.nxt));
  }
  // Cedwyn Estate locations strip (WALES / PATAGONIA / CYBERSPACE) under the shared bar: /ghf-lang/locations.js, generated by campus/build_locations.py
  function locStrip() {
    var go = function () { if (window.GHFLoc && bar) { window.GHFLoc.strip(bar); var m = bar.querySelector(".ghf-top-mini"); if (m && window.GHFLoc.mini) window.GHFLoc.mini(m); if (shiftNow) setTimeout(shiftNow, 50); } };
    if (window.GHFLoc) return go();
    var ls = document.createElement("script"); ls.src = ASSET + "/ghf-lang/locations.js?v=__VER__"; ls.async = true; ls.onload = go;
    (document.head || document.documentElement).appendChild(ls);
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
      ".ghf-top-tog{display:none!important}.ghf-top-mini{display:none!important}.ghf-top-short{display:none}" +
      "html.ghf-two:not(.ghf-open) .ghf-top-name{display:none}html.ghf-two:not(.ghf-open) .ghf-top-short{display:block;font-weight:500;letter-spacing:.12em;text-transform:uppercase;font-size:10.5px;white-space:nowrap}" +
      "html.ghf-two .ghf-top-tog{display:inline-flex!important;align-items:center;gap:5px;height:28px;padding:0 8px!important;margin:0!important;border:1px solid var(--ghf-s,#f2c94c)!important;border-radius:2px!important;background:transparent!important;cursor:pointer;font-size:10px!important;font-weight:500!important;letter-spacing:.12em;text-transform:uppercase;line-height:1!important;white-space:nowrap}" +
      ".ghf-tog-i{font-size:12px;letter-spacing:0}" +
      "html.ghf-two:not(.ghf-open) .ghf-top{min-height:34px;padding:3px 8px!important;transition:min-height .2s,padding .2s}" +
      "html.ghf-two:not(.ghf-open) .ghf-top-badge{width:24px;height:24px;border-width:1.5px}html.ghf-two:not(.ghf-open) .ghf-top-badge img{width:16px!important;height:16px!important}" +
      "html.ghf-two:not(.ghf-open) .ghf-top-site{display:none}html.ghf-two:not(.ghf-open) .ghf-top-name{font-size:10px;letter-spacing:.12em}" +
      "html.ghf-two:not(.ghf-open) .ghf-top-mini{display:inline-flex!important;align-items:center;gap:4px}html.ghf-two:not(.ghf-open) .ghf-loc{display:none!important}" +
      "html.ghf-two:not(.ghf-open) .ghf-top-mode,html.ghf-two:not(.ghf-open) .ghf-top .ghf-lang-btn{height:28px!important;min-height:28px!important}html.ghf-two:not(.ghf-open) .ghf-top-lang{display:none}" +
      ".ghf-top-mini .ghf-loc-ic svg{width:18px!important;height:10.8px!important}.ghf-top-mini .ghf-loc-ic svg[aria-label='AI agent']{width:15px!important;height:15px!important}.ghf-top-mini a{color:inherit!important}" +
      ".ghf-sub{position:relative;z-index:2147481988;display:flex!important;align-items:stretch;justify-content:space-between;box-sizing:border-box;width:100%;margin:0!important;padding:0!important;background:var(--ghf-p,#111)!important;color:#fff!important;border-bottom:1px solid var(--ghf-s,#f2c94c)!important;font:400 12px/1.2 Barlow,'Helvetica Neue',Arial,system-ui,sans-serif!important;-webkit-font-smoothing:antialiased;text-align:center}" +
      ".ghf-sub a{color:#fff!important;text-decoration:none!important;font-family:inherit!important}" +
      ".ghf-sub-arr{flex:0 0 46px;display:flex!important;align-items:center;justify-content:center;min-height:52px;background:rgba(0,0,0,.18)!important}.ghf-sub-arr:hover,.ghf-sub-arr:focus-visible{background:rgba(0,0,0,.4)!important}" +
      ".ghf-sub-ch{font-size:30px;line-height:1;font-weight:300;margin-top:-3px}" +
      ".ghf-sub-mid{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:3px;padding:6px 4px}" +
      ".ghf-sub-crumb{font-size:10.5px;letter-spacing:.08em;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ghf-sub-apex{text-decoration:underline!important;text-underline-offset:2px}.ghf-sub-host{font-weight:700}" +
      ".ghf-sub-title b{display:block;font-weight:500;font-size:14px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ghf-sub-title small{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.8;margin-top:2px}" +
      ".ghf-sub a,.ghf-sub b,.ghf-sub small,.ghf-sub span{color:#fff!important}.ghf-sub-title small{opacity:.85}" +
      ".ghf-sub :focus-visible{outline:2px solid var(--ghf-s,#f2c94c);outline-offset:-2px}" +
      "@media (max-width:440px){html.ghf-two .ghf-tog-t{display:none}.ghf-sub-title b{font-size:13px;letter-spacing:.06em}}@media print{.ghf-sub{display:none!important}}" +
      "@media print{.ghf-top{display:none!important}}";
    (document.head || document.documentElement).appendChild(css);
    nav = el("nav", "ghf-bc ghf-ui ghf-bc-hide");
    nav.setAttribute("aria-label", "Cedwyn Estate");
    nav.setAttribute("data-no-translate", "");
    nav.setAttribute("translate", "no");
    document.body.appendChild(nav);
    render();
    var vw = V2.mount(); // header standard v2: spacer, locations + language, ‹ page name ›, full screen, menu
    if (!vw) buildBar();
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { var away = !en[0].isIntersecting; nav.setAttribute("data-away", away ? "1" : "0"); nav.classList.toggle("ghf-bc-hide", !away); }).observe(vw);
    } else nav.setAttribute("data-away", "1");
    var place = function () {
      var h = nav.querySelector(".ghf-bc-home"), x = nav.querySelector(".ghf-bc-x");
      if (h && x) { x.style.left = (h.offsetLeft + h.offsetWidth - 30) + "px"; x.style.top = h.offsetTop + "px"; x.style.height = h.offsetHeight + "px"; x.style.lineHeight = h.offsetHeight + "px"; }
    };
    nav.style.position = "fixed"; place();
    new MutationObserver(function () { place(); }).observe(nav, { childList: true });
    window.addEventListener("resize", place);
    document.addEventListener("ghf-lang-change", function () { render(); if (bar) renderBar(); });
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
TOKENS_CSS = r"""/* ghf-tokens.css — ONE set of type sizes, colours and spacing for every Great House Farm site (header standard v2,
 * 21 Oct 2026). Generated by campus/build_basecamp.py; loaded on every site by basecamp.js. Each site keeps its own accent
 * (--ghf-p / --ghf-s, from campus/basecamp_stops.json); the type scale is shared. Sion's Tab agent. */
:root{
 --ghf-font:Barlow,'Helvetica Neue',Arial,system-ui,-apple-system,'Segoe UI',sans-serif;
 --ghf-font-serif:Georgia,'Times New Roman',serif;
 --ghf-font-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
 --ghf-fs-xs:12px;--ghf-fs-sm:14px;--ghf-fs-base:16px;--ghf-fs-md:17px;--ghf-fs-lg:20px;--ghf-fs-xl:22px;--ghf-fs-2xl:26px;
 --ghf-lh:1.55;--ghf-lh-tight:1.2;
 --ghf-space-1:4px;--ghf-space-2:8px;--ghf-space-3:12px;--ghf-space-4:16px;--ghf-space-5:24px;--ghf-space-6:32px;--ghf-space-7:48px;
 --ghf-radius:6px;
 --ghf-bg:#000;--ghf-fg:#fff;--ghf-muted:#bdbdbd;--ghf-line:rgba(255,255,255,.18);
 --ghf-day-bg:#fff;--ghf-day-fg:#111;--ghf-day-muted:#555;--ghf-day-line:rgba(0,0,0,.12);
 --ghf-gold:#f2c94c;
 --ghf-wpbar:45px;
}
@media (min-width:783px){:root{--ghf-wpbar:49px;--ghf-fs-md:18px;--ghf-fs-lg:22px;--ghf-fs-xl:28px;--ghf-fs-2xl:36px}}
/* the shared type scale (the map, the chessboard and anything marked data-ghf-keep keep their own) */
html.ghf-shell:not(.ghf-keep-type) body{font-size:var(--ghf-fs-base);line-height:var(--ghf-lh)}
html.ghf-shell:not(.ghf-keep-type) body :where(main,article,section,.content,.container,.wrap,#content) h1:not(.ghf-v2-dup){font-size:var(--ghf-fs-2xl);line-height:var(--ghf-lh-tight)}
html.ghf-shell:not(.ghf-keep-type) body :where(main,article,section,.content,.container,.wrap,#content) h2{font-size:var(--ghf-fs-xl);line-height:var(--ghf-lh-tight)}
html.ghf-shell:not(.ghf-keep-type) body :where(main,article,section,.content,.container,.wrap,#content) h3{font-size:var(--ghf-fs-lg);line-height:1.3}
html.ghf-shell:not(.ghf-keep-type) body :where(main,article,.content,#content) :where(p,li,dd,td){font-size:var(--ghf-fs-base)}
html.ghf-shell:not(.ghf-keep-type) body :where(main,article,.content,#content) :where(small,figcaption,.caption){font-size:var(--ghf-fs-sm)}
/* v2.1.0 HYBRID THEME (21 Oct 2026): the Legal Wiki's reading size and spacing, in the estate's sharp Starlink look.
   Measured live on greathousefarmwiki.wordpress.com: running text uses the theme's "medium" size,
   clamp(1rem, 1rem + (1vw - .2rem) * .545, 1.3rem) = 16.4px on a 390px phone and 20.8px on a laptop; line-height 1.55;
   one line (1em) between paragraphs; a 760px reading column. Spec: work/hybrid-theme/SPEC.md. Applies where basecamp.js
   sets html.ghf-hy (every site except the map, the chessboard, fb. and the 22 Oct meeting site). */
:root{--ghf-fs-text:clamp(1rem,calc(1rem + (1vw - .2rem) * .545),1.3rem);--ghf-lh-text:1.55;--ghf-para:1em;--ghf-measure:760px;--ghf-radius:0px}
html.ghf-hy:not(.ghf-keep-type) body :where(main,article,.content,#content) :where(p,li,dd,blockquote){font-size:var(--ghf-fs-text);line-height:var(--ghf-lh-text)}
html.ghf-hy:not(.ghf-keep-type) body :where(main,article,.content,#content) p:not(:last-child){margin-bottom:var(--ghf-para)}
html.ghf-hy :is(button,input,select,textarea,.btn,.button,.card,.cta):not(.ghf-round){border-radius:0}
"""

# ---------- header standard v2: ONE site chain (campus/site_chain.json) + shared tokens ----------
CHAIN_D = json.load(open(os.path.join(HERE, "site_chain.json"), encoding="utf-8"))
js_chain = [{k: v for k, v in c.items() if k in ("id", "t", "cy", "es", "u", "h", "p", "d", "x")} for c in CHAIN_D["sites"]]  # d/x (21 Oct 2026): extra repeated titles / selectors hidden under the bars
json.dump(CHAIN_D, open(os.path.join(ROOT, "public", "ghf-lang", "chain.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(ROOT, "public", "ghf-lang", "ghf-tokens.css"), "w", encoding="utf-8").write(TOKENS_CSS)
JS = JS.replace("__CHAIN__", json.dumps(js_chain, ensure_ascii=False)).replace("__TOKENS__", json.dumps(re.sub(r"/\*.*?\*/", "", TOKENS_CSS, flags=re.S).strip()))
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
import build_locations  # chooser + /wales/ /patagonia/ /cyberspace/ (campus/locations.json)
print("locations:", build_locations.build(D, ROOT))
# header standard v2: locations.js rides inside basecamp.js too, so sites with a strict same-origin CSP that proxy only
# basecamp.js (email.) still get the WALES | PATAGONIA | AI bar; locations.js guards itself (window.GHFLoc) against a second copy.
_loc = open(os.path.join(ROOT, "public", "ghf-lang", "locations.js"), encoding="utf-8").read()
JS = JS.replace("/*__LOCATIONS_INLINE__*/", "/* ---- locations.js (inlined by build_basecamp.py) ---- */\n" + _loc + "\n/* ---- end locations.js ---- */")
open(os.path.join(ROOT, "public", "ghf-lang", "basecamp.js"), "w", encoding="utf-8").write(JS)
print("index.html", len(PAGE), "bytes; board height", int(H), "; basecamp.js", len(JS), "bytes")

# ---------- ghf-boot.js (v2.0.3): the small SYNCHRONOUS loader every site puts at the end of its <head> ----------
# <script src="https://bucklerfamily.estate/ghf-lang/ghf-boot.js?v=VERSION"></script>
# It reserves the bars' exact height before the first paint, writes the shared theme CSS as a render-blocking stylesheet,
# preloads the header font, then writes basecamp.js as a parser-blocking script, so basecamp.js builds the three bars the
# moment <body> exists: no late pop-in and no content jump. Versioned URLs: a new release is a new URL on every site.
BOOT = r"""/*! ghf-boot.js — header standard v2 loader for every Great House Farm site · v__VER__ (__DATE__) · Sion's Tab agent
 * Put ONE line at the end of <head> (not async, not defer):
 *   <script src="https://bucklerfamily.estate/ghf-lang/ghf-boot.js?v=__VER__"></script>
 * Generated by campus/build_basecamp.py. */
(function () {
  var d = document, de = d.documentElement, me = d.currentScript;
  if (window.GHFBoot) return; window.GHFBoot = "__VER__";
  if (window.self !== window.top && !/[?&]ghfbars\b/.test(location.search)) return; // framed pages carry no bars
  // v2.1.0: day or night before the first paint: a saved toggle choice wins; else the device's setting (prefers-color-scheme);
  // else the local time (day 07:00-19:00). basecamp.js applies the same rule and keeps following the device while nothing is saved.
  var M = null; try { M = localStorage.getItem("ghf-theme"); } catch (e) {}
  if (M !== "day" && M !== "night") { var mc = /(?:^|; )ghf_theme=(day|night)/.exec(d.cookie || ""); M = mc ? mc[1] : null; }
  if (!M) try { M = matchMedia("(prefers-color-scheme: dark)").matches ? "night" : matchMedia("(prefers-color-scheme: light)").matches ? "day" : null; } catch (e) {}
  if (!M) { var hr = new Date().getHours(); M = hr >= 7 && hr < 19 ? "day" : "night"; }
  de.setAttribute("data-ghf-mode", M);
  var tc = d.querySelector('meta[name="theme-color"]'); if (!tc) { tc = d.createElement("meta"); tc.name = "theme-color"; (d.head || de).appendChild(tc); }
  tc.removeAttribute("media"); tc.content = M === "day" ? "#ffffff" : "#000000";
  var B = (me && me.src ? me.src.replace(/[^\/?#]*([?#].*)?$/, "") : "") || "https://bucklerfamily.estate/ghf-lang/";
  var V = "?v=__VER__", sync = d.readyState === "loading" && me && !me.async && !me.defer;
  de.className += (de.className ? " " : "") + "ghf-v2-pre";
  var s = d.createElement("style"); s.setAttribute("data-ghf-boot", "");
  s.textContent = "html.ghf-v2-pre body::before{content:'';display:block;height:148px;background:#000}@media (min-width:783px){html.ghf-v2-pre body::before{height:152px}}";
  (d.head || de).appendChild(s);
  setTimeout(function () { de.classList.remove("ghf-v2-pre"); }, 8000); // never leave an empty band if the bars cannot load
  var F = B.replace(/ghf-lang\/$/, "") + "fonts/barlow-latin-", out = "";
  if (!d.querySelector("link[data-ghf-theme]")) out += '<link rel="stylesheet" href="' + B + "ghf-theme.css" + V + '" data-ghf-theme>';
  out += '<link rel="preload" as="font" type="font/woff2" crossorigin href="' + F + '400-normal.woff2"><link rel="preload" as="font" type="font/woff2" crossorigin href="' + F + '700-normal.woff2">';
  var needBc = !window.GHFBasecamp && !d.querySelector('script[src*="basecamp.js"]');
  if (needBc) out += '<script src="' + B + "basecamp.js" + V + '"><\/script>';
  if (sync) { d.write(out); return; }
  var x, t = d.createElement("template"); t.innerHTML = out; // late or async load: same files, appended
  [].slice.call(t.content.childNodes).forEach(function (n) {
    if (n.tagName === "SCRIPT") { x = d.createElement("script"); x.src = n.src; x.async = false; n = x; }
    (d.head || de).appendChild(n);
  });
})();
"""
BOOT = BOOT.replace("__VER__", D["version"]).replace("__DATE__", D["updated"])
open(os.path.join(ROOT, "public", "ghf-lang", "ghf-boot.js"), "w", encoding="utf-8").write(BOOT)
print("ghf-boot.js", len(BOOT), "bytes")
