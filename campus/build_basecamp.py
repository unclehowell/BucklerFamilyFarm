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
    return (f'<ellipse cx="{cx}" cy="{cy+30}" rx="70" ry="10" fill="#fff" opacity=".07"/>'
            f'<path d="M{cx-46} {cy+30} L{cx} {cy-26} L{cx+46} {cy+30} Z" fill="#0d0d0d" {ST}/>'
            f'<path d="M{cx} {cy-26} L{cx-12} {cy+30} M{cx} {cy-26} L{cx+12} {cy+30}" stroke="#fff" stroke-width="1"/>'
            f'<path d="M{cx-12} {cy+30} L{cx} {cy+2} L{cx+12} {cy+30} Z" fill="#f2c94c"/>'
            f'<path d="M{cx} {cy-26} v-16" {ST}/><path d="M{cx} {cy-42} l16 5 l-16 5 Z" fill="#f2c94c"/>'
            f'<path d="M{cx+60} {cy+26} l6 -10 l6 10 Z M{cx+63} {cy+20} h6" stroke="#f2c94c" stroke-width="1.4" fill="none"/>')

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

def host_of(u):
    m = re.match(r"https?://([^/]+)(/[^#?]*)?", u)
    h = m.group(1).replace("www.", "")
    p = (m.group(2) or "/").rstrip("/")
    return (h + p) if p else h

svg = []
svg.append(f'<svg id="board" viewBox="0 0 {W} {H}" role="img" aria-labelledby="bt bd" xmlns="http://www.w3.org/2000/svg">')
svg.append('<title id="bt">Base camp map: a numbered path of 19 buildings</title>')
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
svg.append('<g class="camp">' + tent(W/2, 92) + f'<text x="{W/2}" y="146" text-anchor="middle" class="here">YOU ARE HERE · BASE CAMP</text></g>')
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
    lbl = ("Enter the shop" if r["big"] else host_of(s["url"])) + " →"
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
<title>Base camp · Great House Farm (Tŷ Mawr) · bucklerfamily.estate</title>
<meta name="description" content="Base camp for Great House Farm / Tŷ Mawr, Llandough. Follow the numbered path from the Legal Wiki through every part of the record to the gift shop and marketplace.">
<meta property="og:title" content="Base camp · Great House Farm (Tŷ Mawr)">
<meta property="og:description" content="Follow the path: the Legal Wiki, the story, the chessboard, the records, the archives and the gift shop.">
<meta property="og:url" content="https://bucklerfamily.estate/">
<meta name="theme-color" content="#000000">
<link rel="canonical" href="https://bucklerfamily.estate/">
<link rel="preload" href="/fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/barlow-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>
(function(){{var q=location.search;if(/payment_status=/.test(q)){{location.replace('/webapp/'+q+location.hash);}}}})();
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
</style>
</head>
<body>
<a class="skip" href="#board">Skip to the map</a>
<header class="top">
<div id="lang-slot"></div>
<p class="eyebrow">Base camp</p>
<h1>Great House Farm <b>Tŷ Mawr</b></h1>
<p class="lead">Follow the numbered stepping stones. Each building opens one part of the record. Every site has a link back here, so you can always return to base camp.</p>
<p class="note">Case theories on these sites are our case, prospective. Not a finding of any court.</p>
<div class="jump"><a class="pill solid" href="https://greathousefarmwiki.wordpress.com/">Start at stop 1 →</a><a class="pill" href="#shop">Gift shop</a><a class="pill" href="/campus/">Estate campus</a></div>
<div class="mode" role="group" aria-label="Choose a view"><span class="on" aria-current="page">2D map</span><a href="/3d/">3D walk · game mode</a></div>
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
  "chess.bucklerfamily.estate": {"buttons": False},
  "qa.bucklerfamily.estate": {"vars": {"--navy": "P", "--blue": "P"}},
  "fb.bucklerfamily.estate": {"vars": {"--blue": "P"}},
  "2026-10-22.bucklerfamily.estate": {"vars": {"--slate": "P", "--moss": "P"}},
  "email.bucklerfamily.estate": {"vars": {"--blue": "P", "--navy": "P"}, "forceHeader": True},
  "records.bucklerfamily.estate": {"forceHeader": True},
  "authorities.bucklerfamily.estate": {"forceHeader": True},
  "review.bucklerfamily.estate": {"forceHeader": True},
  "research.bucklerfamily.estate": {"forceHeader": True},
  "wayback.bucklerfamily.estate": {"css": "body{background-color:__P__!important}"},
}
JS = r"""/*! basecamp.js — "Back to base camp" link for every Great House Farm (Tŷ Mawr) site, plus a
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
  window.GHFBasecamp = { version: "__VER__", stops: STOPS };
  var host = location.hostname.replace(/^www\./, ""), path = location.pathname || "/";
  var apex = host === "bucklerfamily.estate" || /(^|\.)bucklerfamilyfarm\.pages\.dev$/.test(host);
  if (apex && (path === "/" || path === "/index.html" || /^\/3d(\/|$)/.test(path))) return; // this IS base camp (2D or 3D)
  var here = null, i, j;
  for (i = 0; i < STOPS.length && !here; i++) {
    for (j = 0; j < STOPS[i].h.length; j++) if (STOPS[i].h[j] === host) { here = STOPS[i]; break; }
    if (!here && apex) for (j = 0; j < STOPS[i].p.length; j++) if (path.indexOf(STOPS[i].p[j]) === 0) { here = STOPS[i]; break; }
  }

  // ---------- two-colour identity (colors = [primary, secondary] in campus/basecamp_stops.json) ----------
  // primary is deep (white text passes WCAG AA on it); secondary is bright (black text passes AA on it, and it
  // passes AA as text on black). Styling only: no words are changed. Opt out per page with <html data-ghf-brand="off">.
  var BRAND_PATHS = __BRANDPATHS__, TWEAKS = __TWEAKS__;
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
      ".ghf-hdr{background-color:" + P + "!important;border-bottom:3px solid " + S + "!important;color:#fff!important}" +
      ".ghf-hdr :is(a,span,b,strong,small,em,i,h1,h2,h3,h4,p,li,label,div,summary):not(.ghf-keep){color:#fff!important}" +
      ".ghf-hdr a:hover,.ghf-hdr a:focus-visible{color:" + S + "!important}" +
      ".ghf-hdr-edge{border-bottom:4px solid " + S + "!important;box-shadow:inset 0 -7px 0 " + P + "}" +
      ".ghf-btn{background:" + S + "!important;color:#000!important;border-color:" + S + "!important}" +
      ".ghf-btn *{color:#000!important}" +
      ".ghf-ghost{border-color:" + S + "!important}" +
      ".ghf-bc-home,.ghf-bc-open{border-color:" + S + "!important}.ghf-bc-arrow{color:" + S + "!important}" +
      "@media print{.ghf-band{display:none}}" + (tw.css || "").replace(/__P__/g, P).replace(/__S__/g, S);
    (document.head || de).appendChild(css);
    var mt = document.querySelector('meta[name="theme-color"]');
    if (!mt) { mt = document.createElement("meta"); mt.name = "theme-color"; (document.head || de).appendChild(mt); }
    mt.content = P;
    function paintPage() {
      if (!document.body) return;
      if (!document.querySelector(".ghf-band")) { var b = el("div", "ghf-band"); b.setAttribute("aria-hidden", "true"); document.body.appendChild(b); }
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
  brand(here);
  var next = here && here.n < TOTAL ? STOPS[here.n] : null;
  var T = {
    en: { back: "Back to base camp", stop: "Stop", of: "of", next: "Next", hide: "Hide", show: "Base camp", end: "Journey’s end" },
    cy: { back: "Yn ôl i’r gwersyll", stop: "Arhosfan", of: "o", next: "Nesaf", hide: "Cuddio", show: "Gwersyll", end: "Diwedd y daith" },
    es: { back: "Volver al campamento base", stop: "Parada", of: "de", next: "Siguiente", hide: "Ocultar", show: "Campamento", end: "Fin del recorrido" }
  };
  function lang() {
    var l = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
    return T[l] ? l : "en";
  }
  var KEY = "ghf-bc-min", nav, css;
  function mini() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function setMini(v) { try { sessionStorage.setItem(KEY, v ? "1" : "0"); } catch (e) {} render(); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function render() {
    var s = T[lang()];
    nav.textContent = "";
    nav.className = "ghf-bc" + (mini() ? " ghf-bc-min" : "");
    if (mini()) {
      var b = el("button", "ghf-bc-open", "⟵ " + s.show);
      b.type = "button"; b.setAttribute("aria-label", s.back + " (bucklerfamily.estate)");
      b.onclick = function () { setMini(false); };
      nav.appendChild(b); return;
    }
    var a = el("a", "ghf-bc-home");
    a.href = HOME;
    a.appendChild(el("span", "ghf-bc-arrow", "⟵"));
    var t = el("span", "ghf-bc-txt");
    t.appendChild(el("b", null, s.back));
    t.appendChild(el("small", null, "bucklerfamily.estate"));
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
      "@media print{.ghf-bc{display:none!important}}";
    (document.head || document.documentElement).appendChild(css);
    nav = el("nav", "ghf-bc");
    nav.setAttribute("aria-label", "Base camp");
    nav.setAttribute("data-no-translate", "");
    nav.setAttribute("translate", "no");
    document.body.appendChild(nav);
    render();
    // the × sits inside the pill, at its right edge
    var place = function () {
      var h = nav.querySelector(".ghf-bc-home"), x = nav.querySelector(".ghf-bc-x");
      if (h && x) { x.style.left = (h.offsetLeft + h.offsetWidth - 30) + "px"; x.style.top = h.offsetTop + "px"; x.style.height = h.offsetHeight + "px"; x.style.lineHeight = h.offsetHeight + "px"; }
    };
    nav.style.position = "fixed"; place();
    var obs = new MutationObserver(function () { place(); });
    obs.observe(nav, { childList: true });
    window.addEventListener("resize", place);
    document.addEventListener("ghf-lang-change", function () { render(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
"""
JS = JS.replace("__BRANDPATHS__", json.dumps(BRAND_PATHS)).replace("__TWEAKS__", json.dumps(TWEAKS, ensure_ascii=False))
JS = JS.replace("__STOPS__", json.dumps(js_stops, ensure_ascii=False)).replace("__VER__", D["version"]).replace("__DATE__", D["updated"])
open(os.path.join(ROOT, "public", "ghf-lang", "basecamp.js"), "w", encoding="utf-8").write(JS)
est = json.load(open(os.path.join(ROOT, "public", "ghf-lang", "sites", "estate.json"), encoding="utf-8"))
bc = {k: v for k, v in est.items() if k not in ("strings", "patterns")}; bc["site"] = "basecamp"
bc["strings"] = {
  "Base camp": {"cy": "Gwersyll", "es": "Campamento base"},
  "Gift shop": {"cy": "Siop anrhegion", "es": "Tienda de regalos"},
  "Estate campus": {"cy": "Campws yr ystad", "es": "Campus de la finca"},
  "Skip to the map": {"cy": "Neidio i’r map", "es": "Ir al mapa"},
  "The route as a list": {"cy": "Y llwybr fel rhestr", "es": "La ruta en forma de lista"},
  "Get the e-book →": {"cy": "Cael yr e-lyfr →", "es": "Obtener el libro electrónico →"},
  "Browse the shelf →": {"cy": "Pori’r silff →", "es": "Ver la estantería →"},
  "Merch, opening soon": {"cy": "Nwyddau, yn agor cyn bo hir", "es": "Artículos, muy pronto"}
}
bc["patterns"] = []; bc["mount"] = "#lang-slot"; bc["mountMode"] = "append"; bc.pop("fixedBelow", None); bc.pop("fixed", None); bc.pop("inlineStyle", None)
bc["note"] = est.get("note", "") + " Base camp map page: a few header strings, mounted in the header (generated by campus/build_basecamp.py)."
json.dump(bc, open(os.path.join(ROOT, "public", "ghf-lang", "sites", "basecamp.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(D, open(os.path.join(ROOT, "public", "basecamp.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("index.html", len(PAGE), "bytes; board height", int(H), "; basecamp.js", len(JS), "bytes")
