#!/usr/bin/env python3
"""Generate the ENEMY CAMP page of the bucklerfamily.estate campus (public/enemy/index.html → /enemy/).

Sion, 20 Oct 2026 00:55 BST: "make a toggle between allied camp (my urls) and enemy camp. Enemy camp is to be another
page of buildings ... with a building for each institution involved ... when selecting any it must go to the
institution page of the websites listed ... be sure bpvsbuckler.bucklerfamily.estate is one of the urls on each
building ... And when I select it I must go to the filter of the institution corresponding."

Edit campus/enemy_links.json (one entry per institution: name, sign, links[]), then run:
    python3 campus/build_enemy.py
Same art style as the Tŷ Mawr campus (build_campus.py): roofs, plates, olive #556b2f / yellow #ffd700 signs.
Generic buildings with name signs only; no institution logos.
"""
import html, json, os, random

e = html.escape
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = json.load(open(os.path.join(HERE, "enemy_links.json"), encoding="utf-8"))
OUT = os.path.join(HERE, "..", "public", "enemy", "index.html")

ROOFS = {
    "slate": ("#4a5560", "#5a6672"),
    "copper": ("#4f7a6b", "#5f8b7b"),
    "green": ("#3f5a3a", "#4e6b48"),
    "red": ("#7c3a31", "#8f463c"),
    "concrete": ("#8a8a80", "#9a9a90"),
    "earth": ("#5d6b3e", "#6c7a4a"),
}
ROOF_CYCLE = ["slate", "concrete", "red", "copper", "slate", "green", "concrete", "earth", "red"]

# Three rows of buildings between the roads (map units, viewBox 1600 x 1000).
ROWS = [(150, 135, 8), (402, 135, 7), (622, 125, 7)]
X0, X1 = 170, 1430

_W = {c: 556 for c in "abcdeghknopqsuvxyzABCDEFGHKNOPRSUVXYZ0123456789"}
_W.update({"f": 333, "i": 278, "j": 278, "l": 278, "m": 889, "r": 389, "t": 333, "w": 778, " ": 278, "/": 278,
           "I": 278, "J": 556, "M": 833, "W": 944, "Q": 778, "'": 238, "-": 333, ".": 278, "(": 333, ")": 333})
FONT, LINE = 15, 17


def tw(s):
    return sum(_W.get(c, 611) for c in s) * FONT / 1000


def wrap(name, width):
    words, lines, cur = name.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if tw(t) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = wd
    lines.append(cur)
    return lines


def layout():
    slugs = list(DATA)
    out, k = [], 0
    for y, h, n in ROWS:
        gap = 22
        w = (X1 - X0 - gap * (n - 1)) / n
        for i in range(n):
            if k >= len(slugs):
                break
            out.append((slugs[k], X0 + i * (w + gap), y, w, h, ROOF_CYCLE[k % len(ROOF_CYCLE)], k + 1))
            k += 1
    return out


def building(slug, x, y, w, h, roof, num):
    d = DATA[slug]
    dark, light = ROOFS[roof]
    s = [f'<g class="bld" id="b-{slug}" tabindex="0" role="button" aria-label="{e(d["name"])}: {len(d["links"])} links" data-id="{slug}">',
         f'<rect x="{x + 8:.1f}" y="{y + 10}" width="{w:.1f}" height="{h}" fill="#000" opacity=".32"/>'
         f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="{h}" fill="{dark}"/>'
         f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="{h / 2}" fill="{light}"/>'
         f'<line x1="{x:.1f}" y1="{y + h / 2}" x2="{x + w:.1f}" y2="{y + h / 2}" stroke="#000" stroke-opacity=".25" stroke-width="2"/>']
    for i in range(1, int(w // 40)):
        s.append(f'<line x1="{x + i * 40:.1f}" y1="{y + 4}" x2="{x + i * 40:.1f}" y2="{y + h - 4}" stroke="#000" stroke-opacity=".08"/>')
    s.append(f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="{h}" fill="none" stroke="#1d2420" stroke-opacity=".5" stroke-width="2"/>')
    # roof plant: two vents
    s.append(f'<rect x="{x + w - 46:.1f}" y="{y + 12}" width="16" height="12" fill="#2b302b" opacity=".55"/>'
             f'<rect x="{x + w - 26:.1f}" y="{y + 12}" width="16" height="12" fill="#2b302b" opacity=".55"/>')
    s.append(f'<rect class="plate" x="{x + 8:.1f}" y="{y + 8}" width="34" height="20" rx="3" fill="#f2efe6"/>'
             f'<text x="{x + 25:.1f}" y="{y + 22}" text-anchor="middle" class="pn">{num}</text>')
    # name sign (olive board, yellow letters), centred on the lower roof
    lines = wrap(d["sign"], w - 28)
    bw = max(tw(t) for t in lines) + 16
    bh = len(lines) * LINE + 12
    cx = x + w / 2
    by = y + h - bh - 12
    s.append(f'<g class="sign"><rect x="{cx - bw / 2 + 2:.1f}" y="{by + 3:.1f}" width="{bw:.0f}" height="{bh}" rx="3" fill="#000" opacity=".35"/>'
             f'<rect class="bd" x="{cx - bw / 2:.1f}" y="{by:.1f}" width="{bw:.0f}" height="{bh}" rx="3" fill="#556b2f" stroke="#2e3b17" stroke-width="2.5"/>'
             f'<rect x="{cx - bw / 2 + 3:.1f}" y="{by + 3:.1f}" width="{bw - 6:.0f}" height="{bh - 6}" rx="2" fill="none" stroke="#ffd700" stroke-opacity=".35" stroke-width="1"/>')
    for i, t in enumerate(lines):
        s.append(f'<text x="{cx:.1f}" y="{by + 6 + 13 + i * LINE:.1f}" text-anchor="middle">{e(t)}</text>')
    s.append('</g>')
    s.append(f'<rect class="hit" x="{x - 6:.1f}" y="{y - 6}" width="{w + 12:.1f}" height="{h + 12}" fill="transparent"/>')
    s.append('</g>')
    return "".join(s)


random.seed(1987)


def trees():
    out = []
    zones = [(0, 0, 1600, 110), (0, 0, 110, 1000), (1490, 0, 110, 1000), (0, 930, 1600, 70), (170, 800, 1260, 110)]
    for x0, y0, w, h in zones:
        for _ in range(int(w * h / 2400)):
            x, y = x0 + random.random() * w, y0 + random.random() * h
            r = 9 + random.random() * 13
            g = random.choice(["#30402c", "#36462f", "#3b4b33", "#2b3a28"])
            out.append(f'<circle cx="{x:.0f}" cy="{y + 4:.0f}" r="{r:.0f}" fill="#000" opacity=".22"/>'
                       f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{g}"/>')
    return "".join(out)


def page():
    L = layout()
    blds = "".join(building(*b) for b in L)
    data = json.dumps(DATA, ensure_ascii=False).replace("</", "<\\/")
    directory = "".join(f'<li><a href="#{s}" data-open="{s}"><span class="dn">{n}</span><span class="dt"><b>{e(DATA[s]["name"])}</b></span>'
                        f'<span class="du">{len(DATA[s]["links"])} links</span></a></li>' for s, *_r, n in L)
    return TEMPLATE.replace("{{BUILDINGS}}", blds).replace("{{TREES}}", trees()).replace("{{DATA}}", data) \
        .replace("{{DIRECTORY}}", directory).replace("{{COUNT}}", str(len(L)))


TEMPLATE = open(os.path.join(HERE, "enemy_template.html"), encoding="utf-8").read()

if __name__ == "__main__":
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(page())
    print("wrote", os.path.relpath(OUT), len(DATA), "buildings")
