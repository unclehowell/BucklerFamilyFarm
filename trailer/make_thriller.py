"""Render "PARCEL A" — a cinematic legal-thriller trailer telling the Great House Farm
story from greathousefarmwiki.wordpress.com, using real photographs of the farm and
press clippings from the unclehowell/datro wayback archive (see trailer/assets/).

Requires: pillow, numpy, pymupdf, imageio-ffmpeg
    python3 trailer/make_thriller.py [--stills]   # writes trailer/parcel-a-thriller-trailer.mp4
"""
import math
import os
import subprocess
import sys
import wave

import imageio_ffmpeg
import numpy as np
import pymupdf
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EV = os.path.join(ROOT, "public", "evidence")
AS = os.path.join(HERE, "assets")
FD = os.path.join(HERE, "fonts")
TMP = os.path.join(HERE, ".build")
os.makedirs(TMP, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

W, H, FPS, SR = 1280, 720, 25, 44100
BAR = 72  # 2.4:1 letterbox

BEBAS = f"{FD}/BebasNeue-Regular.ttf"
OSWALD = f"{FD}/Oswald.ttf"
CINZEL = f"{FD}/Cinzel.ttf"
TYPE = f"{FD}/SpecialElite.ttf"
SERIF_I = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"

_fonts = {}


def font(path, size, weight=None):
    key = (path, size, weight)
    if key not in _fonts:
        f = ImageFont.truetype(path, size)
        if weight:
            try:
                f.set_variation_by_name(weight)
            except Exception:
                pass
        _fonts[key] = f
    return _fonts[key]


# ------------------------------------------------------------------ assets

def load(path, crop=None, rotate=0):
    im = Image.open(path).convert("RGB")
    if crop:
        im = im.crop(crop)
    if rotate:
        im = im.rotate(rotate, expand=True)
    return im


def pdf_page(path, page=0, dpi=150):
    doc = pymupdf.open(path)
    pix = doc[page].get_pixmap(dpi=dpi)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


print("loading assets…")
IMG = {
    "farmhouse": load(f"{AS}/cadw-1988-farmhouse.png"),
    "barn": load(f"{AS}/cadw-1988-barn.png"),
    "ggat_cover": load(f"{AS}/ggat-1990-p1.png"),
    "ggat_plan": load(f"{AS}/ggat-1990-p5.png"),
    "ggat_map": load(f"{AS}/ggat-1990-p4.png"),
    "open_day": load(f"{AS}/news-open-day-to-save-ancient-welsh-house.jpg"),
    "police": load(f"{AS}/news-1988-police-outside-farmhouse.jpg"),
    "fails": load(f"{AS}/news-1988-farmer-fails-final-eviction-hearing.jpg"),
    "tears": load(f"{AS}/news-1988-tears-flow-farmhouse-razed.jpg", (0, 330, 379, 654)),
    "history": load(f"{AS}/news-1988-12-03-history-fight-to-save-farm.jpg"),
    "death": load(f"{AS}/death-index-mar-1983-mary-williams.jpg"),
    "map1824": load(f"{EV}/maps-photos/1824-map-of-ty-mawr.jpg", (0, 150, 720, 1290)),
    "plan1877": load(f"{EV}/maps-photos/1877-plan-of-williams-parcel.jpg"),
    "plan1939": load(f"{EV}/maps-photos/1939-wgr-tenancy-plan-parcel-to-east.jpg", (360, 860, 960, 1620)),
    "crowd": load(f"{EV}/maps-photos/tree-planting-photograph.jpg"),
    "echr": pdf_page(f"{EV}/court/1989-04-14-echr-decision-buckler-v-uk-14464-88.pdf"),
    "perm": pdf_page(f"{EV}/planning/1990-03-13-outline-planning-permission-89-01396-OUT.pdf"),
    "title_reg": pdf_page(f"{EV}/land-registry/WA231076-title-register-2026-09.pdf"),
    "title_plan": pdf_page(f"{EV}/land-registry/WA231076-title-plan-2026-09.pdf", 1),
    "hmlr_sched": pdf_page(f"{EV}/land-registry/2026-07-30-hmlr-schedule-first-registration-documents-WA231076-WA240304.pdf"),
}

CLIP = f"{EV}/video/itv-cymru-great-house-farm-clip.mp4"
subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-i", CLIP, "-vf", f"fps={FPS}",
                f"{TMP}/clip_%03d.png"], check=True)
subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-i", CLIP, "-ac", "2", "-ar", str(SR),
                f"{TMP}/clip.wav"], check=True)
CLIP_FRAMES = sorted(f for f in os.listdir(TMP) if f.startswith("clip_"))

rng = np.random.default_rng(11)
GRAIN = [rng.normal(0, 10, (H, W, 1)).astype(np.float32) for _ in range(8)]
yy, xx = np.mgrid[0:H, 0:W]
_r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
VIGNETTE = np.clip(1.2 - 0.6 * _r ** 2, 0.18, 1.0)[..., None].astype(np.float32)


# ------------------------------------------------------------------ helpers

def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def fade(t, dur, fin=0.4, fout=0.4):
    a = 1.0
    if fin > 0:
        a = min(a, ease(t / fin))
    if fout > 0:
        a = min(a, ease((dur - t) / fout))
    return max(0.0, a)


def win(t, start, dur, fin=0.25, fout=0.3):
    """Opacity of an element shown from `start` for `dur` seconds (local scene time)."""
    return fade(t - start, dur, fin, fout) if start <= t <= start + dur else 0.0


def cover(im, t, dur, z0=1.0, z1=1.15, p0=(0.5, 0.5), p1=(0.5, 0.5)):
    k = ease(t / dur) * 0.5 + (t / dur) * 0.5
    z = z0 + (z1 - z0) * k
    cx = p0[0] + (p1[0] - p0[0]) * k
    cy = p0[1] + (p1[1] - p0[1]) * k
    iw, ih = im.size
    scale = max(W / iw, H / ih) * z
    cw, ch = W / scale, H / scale
    x0 = min(max(cx * iw - cw / 2, 0), iw - cw)
    y0 = min(max(cy * ih - ch / 2, 0), ih - ch)
    return im.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))


def darken(im, k):
    return Image.eval(im, lambda v: int(v * k))


def paper(im, t, dur, z0=1.0, z1=1.12, p0=(0.5, 0.35), p1=(0.5, 0.45), bg=(10, 12, 14), tilt=-1.5,
          height=1.5):
    k = ease(t / dur)
    z = z0 + (z1 - z0) * k
    frame = Image.new("RGB", (W, H), bg)
    iw, ih = im.size
    base = (H * height) / ih * z
    doc = im.resize((max(1, int(iw * base)), max(1, int(ih * base))), Image.BICUBIC)
    doc = doc.rotate(tilt, expand=True, fillcolor=bg)
    cx = p0[0] + (p1[0] - p0[0]) * k
    cy = p0[1] + (p1[1] - p0[1]) * k
    frame.paste(doc, (int(W / 2 - cx * doc.width), int(H / 2 - cy * doc.height)))
    return frame


def spin_in(im, t, spin_dur=0.9, final_h=520, turns=1.5, bg=(8, 8, 10), drift=0.05):
    """Classic newspaper spin: rotates and flies in towards the camera, then holds."""
    k = ease_out(t / spin_dur)
    ang = (1 - k) * 360 * turns
    s = 0.05 + 0.95 * k + drift * max(0, t - spin_dur)
    iw, ih = im.size
    sc = final_h / ih * s
    doc = im.resize((max(1, int(iw * sc)), max(1, int(ih * sc))), Image.BICUBIC).convert("RGBA")
    doc = doc.rotate(ang - 3, expand=True, resample=Image.BICUBIC)
    frame = Image.new("RGBA", (W, H), bg + (255,))
    sh = Image.new("RGBA", doc.size, (0, 0, 0, 0))
    sh.putalpha(doc.getchannel("A").point(lambda v: int(v * 0.7)))
    frame.alpha_composite(sh.filter(ImageFilter.GaussianBlur(12)),
                          (W // 2 - doc.width // 2 + 14, H // 2 - doc.height // 2 + 16))
    frame.alpha_composite(doc, (W // 2 - doc.width // 2, H // 2 - doc.height // 2))
    return frame.convert("RGB")


def blinds(im, t, strength=0.75, angle_shift=0.0):
    """Venetian-blind light across the frame — the 'behind closed doors' look."""
    arr = np.asarray(im).astype(np.float32)
    y = np.arange(H)[:, None] + (np.arange(W)[None, :] * (0.35 + angle_shift))
    stripes = (np.sin((y + t * 12) / 11.0) > 0.25).astype(np.float32)
    stripes = np.clip(stripes * 1.0 + 0.0, 0, 1)
    light = 1 - strength + strength * stripes
    return Image.fromarray(np.clip(arr * light[..., None], 0, 255).astype(np.uint8))


def text(canvas, s, y, size, path=BEBAS, alpha=1.0, color=(245, 240, 230), x=None, track=0,
         glow=0, weight=None, anchor="mm", shadow=True):
    if alpha <= 0.01:
        return
    f = font(path, size, weight)
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    xc = W / 2 if x is None else x
    if track:
        widths = [d.textlength(c, font=f) for c in s]
        total = sum(widths) + track * (len(s) - 1)
        if anchor[0] == "m":
            cx = xc - total / 2
        elif anchor[0] == "r":
            cx = xc - total
        else:
            cx = xc
        for c, w_ in zip(s, widths):
            d.text((cx, y), c, font=f, fill=color + (255,), anchor="l" + anchor[1])
            cx += w_ + track
    else:
        d.text((xc, y), s, font=f, fill=color + (255,), anchor=anchor)
    a = layer.getchannel("A")
    out = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    if shadow:
        sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        sh.putalpha(a.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * 0.9)))
        out.alpha_composite(sh, (3, 4))
    if glow:
        g = Image.new("RGBA", canvas.size, color + (0,))
        g.putalpha(a.filter(ImageFilter.GaussianBlur(glow)).point(lambda v: min(255, int(v * 1.2))))
        out.alpha_composite(g)
    out.alpha_composite(layer)
    if alpha < 1:
        out.putalpha(out.getchannel("A").point(lambda v: int(v * alpha)))
    canvas.alpha_composite(out)


def typewriter(canvas, s, y, size, t, start, cps=22, path=TYPE, color=(235, 228, 210), alpha=1.0,
               x=None, anchor="mm"):
    n = int(max(0, t - start) * cps)
    if n <= 0:
        return
    shown = s[:n]
    # keep the line anchored as if fully typed (avoid re-centering jitter)
    f = font(path, size)
    full_w = ImageDraw.Draw(canvas).textlength(s, font=f)
    xl = (W / 2 if x is None else x) - (full_w / 2 if anchor[0] == "m" else 0)
    cursor = "▌" if n < len(s) and int(t * 6) % 2 == 0 else ""
    text(canvas, shown + cursor, y, size, path, alpha, color, x=xl, anchor="l" + anchor[1])


def stamp(canvas, s, cx, cy, t, start, size=64, color=(200, 30, 30), angle=-9):
    """A rubber stamp that slams onto the frame."""
    lt = t - start
    if lt < 0:
        return
    sc = 1.0 + 0.9 * (1 - ease_out(lt / 0.14))
    a = min(1.0, lt / 0.06)
    f = font(OSWALD, size, "Bold")
    d0 = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    tw = d0.textlength(s, font=f)
    pad = 22
    im = Image.new("RGBA", (int(tw + pad * 2), int(size * 1.35 + pad)), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle((3, 3, im.width - 4, im.height - 4), outline=color + (255,), width=6)
    d.text((im.width / 2, im.height / 2), s, font=f, fill=color + (255,), anchor="mm")
    # ink texture
    noise = (rng.random((im.height, im.width)) > 0.18).astype(np.uint8) * 255
    im.putalpha(ImageChops.multiply(im.getchannel("A"), Image.fromarray(noise).filter(ImageFilter.GaussianBlur(0.6))))
    im = im.resize((int(im.width * sc), int(im.height * sc)), Image.BICUBIC).rotate(angle, expand=True,
                                                                                    resample=Image.BICUBIC)
    im.putalpha(im.getchannel("A").point(lambda v: int(v * a * 0.92)))
    canvas.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def tag(canvas, label, alpha, color):
    """Case-file label in the corner, keeping the wiki's evidence key visible."""
    if alpha <= 0:
        return
    f = font(OSWALD, 17, "Regular")
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w = d.textlength(label, font=f)
    x, y = W - 60 - w, BAR + 22
    d.rectangle((x - 10, y - 5, x + w + 10, y + 25), fill=(0, 0, 0, int(160 * alpha)),
                outline=color + (int(230 * alpha),), width=1)
    d.text((x, y), label, font=f, fill=color + (int(255 * alpha),))
    canvas.alpha_composite(layer)


REC = (140, 190, 255)
FAM = (240, 195, 110)
CON = (255, 110, 100)

_shade = np.clip((np.arange(H) - (H - BAR - 260)) / 200, 0, 1) ** 1.3 * 225
SHADE = Image.fromarray(np.dstack([np.zeros((H, W, 3), np.uint8),
                                   np.repeat(_shade[:, None], W, 1).astype(np.uint8)]), "RGBA")


def bg(color=(6, 7, 9)):
    return Image.new("RGBA", (W, H), color + (255,))


CAP1 = H - BAR - 130
CAP2 = H - BAR - 70


# ------------------------------------------------------------------ boardroom silhouettes

def boardroom(t, dur):
    """Men in suits around a table, backlit through blinds. Drawn, not photographed."""
    im = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(im)
    drift = t * 6
    # backlit window
    for i in range(H):
        c = int(40 + 70 * math.exp(-((i - 250) / 220) ** 2))
        d.line([(0, i), (W, i)], fill=(int(c * 0.55), int(c * 0.75), int(c * 0.95)))
    im = blinds(im, t, 0.85, 0.02)
    d = ImageDraw.Draw(im)
    # table
    d.polygon([(170 - drift, 560), (1110 - drift, 560), (1400, 720), (-120, 720)], fill=(3, 3, 4))
    d.rectangle((0, 548, W, 562), fill=(14, 14, 16))
    # figures (x, scale)
    for x, s in [(250, 1.0), (430, 1.12), (640, 1.25), (850, 1.1), (1030, 0.98)]:
        x = x - drift * (0.6 + 0.4 * s)
        hy = 545 - 205 * s
        d.ellipse((x - 38 * s, hy - 48 * s, x + 38 * s, hy + 40 * s), fill=(2, 2, 3))
        d.rounded_rectangle((x - 105 * s, hy + 38 * s, x + 105 * s, 600), radius=int(60 * s), fill=(2, 2, 3))
        d.polygon([(x - 18 * s, hy + 40 * s), (x + 18 * s, hy + 40 * s), (x, hy + 95 * s)], fill=(10, 10, 12))
    # cigarette smoke
    sm = Image.new("L", (W // 4, H // 4), 0)
    ds = ImageDraw.Draw(sm)
    for k in range(9):
        px = (160 + k * 23 + 18 * math.sin(t * 0.8 + k)) - drift / 4
        py = 120 - k * 12 - (t * 9) % 12
        ds.ellipse((px - 10 - k, py - 6, px + 10 + k, py + 6), fill=40 + 10 * (k % 3))
    sm = sm.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(14))
    im = Image.composite(Image.new("RGB", (W, H), (150, 160, 170)), im, sm)
    return im.filter(ImageFilter.GaussianBlur(0.8))


# ------------------------------------------------------------------ scenes

def s_cold(t, d):
    im = bg((0, 0, 0))
    typewriter(im, "BASED ON THE PUBLIC RECORD", H / 2 - 26, 30, t, 0.4, 20, color=(200, 195, 180))
    typewriter(im, "AND THE FAMILY WHO LIVED IT", H / 2 + 22, 30, t, 2.0, 20, color=(200, 195, 180))
    return im


def s_farm(t, d):
    im = cover(IMG["farmhouse"], t, d, 1.02, 1.22, (0.5, 0.55), (0.5, 0.45)).convert("RGBA")
    im.alpha_composite(SHADE)
    text(im, "TŶ MAWR  ·  LLANDOUGH  ·  WALES", BAR + 40, 22, OSWALD, fade(t, d, 0.8, 0.6),
         (220, 210, 190), track=4, weight="Regular")
    text(im, "SOME HOMES ARE BUILT.", CAP1 + 10, 64, BEBAS, win(t, 0.8, 2.6), track=6)
    text(im, "SOME ARE INHERITED.", CAP1 + 10, 64, BEBAS, win(t, 3.4, 2.4), (255, 215, 150), track=6,
         glow=10)
    text(im, "CADW SURVEY PHOTOGRAPH · 29 JULY 1988", CAP2 + 36, 15, OSWALD, fade(t, d, 1, 0.5) * 0.7,
         (180, 175, 165), weight="Light")
    return im


def s_map(t, d):
    im = cover(IMG["map1824"], t, d, 1.3, 1.8, (0.55, 0.55), (0.63, 0.62)).convert("RGBA")
    im.alpha_composite(SHADE)
    text(im, "NINE GENERATIONS.", CAP1 + 30, 78, BEBAS, fade(t, d, 0.3, 0.4), track=8, glow=8)
    tag(im, "FAMILY ACCOUNT", fade(t, d, 0.3, 0.3), FAM)
    return im


def s_1877(t, d):
    im = cover(IMG["crowd"], t, d, 1.05, 1.25, (0.4, 0.5), (0.55, 0.45)).convert("RGBA")
    im.alpha_composite(SHADE)
    tag(im, "FAMILY ACCOUNT", fade(t, d, 0.3, 0.3), FAM)
    text(im, "1877.  A QUARRY DEAL.", CAP1, 56, BEBAS, fade(t, d, 0.3, 0.3), track=4)
    text(im, "A PROMISE: WHEN THE QUARRYING STOPS, THE HOUSE COMES BACK.", CAP2 + 6, 28, OSWALD,
         win(t, 1.0, d - 1.0), (255, 215, 150), weight="Regular")
    return im


def s_1928(t, d):
    im = cover(IMG["plan1877"], t, d, 1.5, 2.2, (0.55, 0.52), (0.62, 0.55)).convert("RGBA")
    im.alpha_composite(SHADE)
    tag(im, "CONTENTION", fade(t, d, 0.3, 0.3), CON)
    text(im, "1928.  THE QUARRY FALLS SILENT.", CAP1, 56, BEBAS, fade(t, d, 0.3, 0.3), track=4)
    text(im, "THE RENT STOPS. THE HOUSE IS THEIRS.", CAP2 + 6, 32, OSWALD, win(t, 1.2, d - 1.2),
         (255, 215, 150), weight="Regular")
    return im


def s_parcels(t, d):
    im = cover(IMG["plan1939"], t, d, 1.0, 1.3, (0.5, 0.5), (0.45, 0.6)).convert("RGBA")
    im = Image.fromarray((np.asarray(im).astype(np.float32) * 0.8).astype(np.uint8))
    im.alpha_composite(SHADE)
    tag(im, "1939 TENANCY PLAN · FAMILY ACCOUNT", fade(t, d, 0.3, 0.3), FAM)
    text(im, "TWO PARCELS.", H / 2 - 150, 92, BEBAS, fade(t, d, 0.2, 0.3), track=10, glow=12)
    text(im, "PARCEL A — HER HOME. HER LAND.", CAP1, 46, BEBAS, win(t, 1.0, d - 1.0), (255, 225, 170),
         track=3)
    text(im, "PARCEL B — THE FIELDS NEXT DOOR, RENTED FROM A LANDLORD.", CAP2 + 6, 28, OSWALD,
         win(t, 2.2, d - 2.2), (215, 215, 220), weight="Regular")
    return im


def s_board(t, d):
    im = boardroom(t, d).convert("RGBA")
    text(im, "THE LANDLORD OF THE FIELDS", CAP1, 50, BEBAS, win(t, 0.4, d - 0.4), track=5)
    text(im, "HAD PLANS FOR THE HOUSE AS WELL.", CAP2 + 4, 34, OSWALD, win(t, 1.8, d - 1.8), (255, 120, 100),
         weight="Regular")
    return im


def s_1955(t, d):
    im = bg((4, 4, 6))
    text(im, "1955", H / 2 - 120, 150, BEBAS, win(t, 0.0, d, 0.05, 0.4), track=12, glow=14)
    text(im, "SHE LOSES A LEG.", H / 2 + 20, 44, BEBAS, win(t, 0.9, d - 0.9), (255, 225, 190), track=4)
    text(im, "THEY TAKE BACK THEIR FIELDS —", H / 2 + 80, 34, OSWALD, win(t, 2.2, d - 2.2), weight="Regular")
    text(im, "THEN THEY COME FOR HER HOUSE.", H / 2 + 128, 34, OSWALD, win(t, 3.4, d - 3.4), (255, 120, 100),
         weight="Regular")
    tag(im, "FAMILY ACCOUNT · RECORD", fade(t, d, 0.3, 0.3), FAM)
    return im


def s_mary(t, d):
    im = cover(IMG["barn"], t, d, 1.05, 1.25, (0.5, 0.4), (0.5, 0.55)).convert("RGBA")
    im.alpha_composite(SHADE)
    text(im, "MARY WILLIAMS", H / 2 - 40, 118, CINZEL, win(t, 0.3, d - 0.3, 0.6), (250, 240, 220), track=10,
         glow=18, weight="Bold")
    text(im, "ONE LEG.   A WHEELCHAIR.   A FARM TO RUN.", CAP1 + 20, 36, OSWALD, win(t, 1.8, 2.6),
         (230, 225, 215), weight="Regular")
    text(im, "SHE WOULD NOT MOVE.", CAP1 + 20, 60, BEBAS, win(t, 4.6, d - 4.6), (255, 215, 150), track=6,
         glow=10)
    tag(im, "FAMILY ACCOUNT", fade(t, d, 0.3, 0.3), FAM)
    return im


ATTEMPTS = [
    ("1955", "A POSSESSION ORDER — AGAINST HER HUSBAND'S TENANCY", "HOUSE NOT TAKEN", "perm"),
    ("1959", "A TENANCY OF HER OWN HOME", "REFUSED", "ggat_plan"),
    ("1962", "A COUNTY COURT ORDER", "NEVER ENFORCED", "echr"),
    ("1965", "£2 A WEEK TO RENT HER OWN HOUSE", "NEVER SIGNED", "ggat_map"),
    ("1969", "SOLD ON — WITH HER HOME INSIDE THE DEAL", "SHE STAYS", "title_reg"),
    ("1974", "A NEW POSSESSION ACTION", "ADJOURNED", "hmlr_sched"),
]
ATT_LEN = 1.9


def s_attempts(t, d):
    i = min(int(t // ATT_LEN), len(ATTEMPTS) - 1)
    lt = t - i * ATT_LEN
    year, what, verdict, key = ATTEMPTS[i]
    base = paper(IMG[key], lt, ATT_LEN, 1.2, 1.35, (0.3 + 0.1 * (i % 3), 0.3), (0.35 + 0.1 * (i % 3), 0.4),
                 tilt=(-3 if i % 2 else 2))
    base = blinds(darken(base, 0.45), t, 0.6)
    im = base.convert("RGBA")
    text(im, f"ATTEMPT  #{i + 1}", BAR + 60, 30, OSWALD, fade(lt, ATT_LEN, 0.08, 0.2), (255, 120, 100),
         track=6, weight="Bold")
    text(im, year, H / 2 - 60, 150, BEBAS, fade(lt, ATT_LEN, 0.05, 0.2), track=10, glow=10)
    text(im, what, H / 2 + 60, 36, OSWALD, fade(lt - 0.15, ATT_LEN - 0.15, 0.1, 0.2), weight="Regular")
    stamp(im, verdict, W / 2 + 250, H / 2 + 150, lt, 0.75, size=54)
    return im


def s_seventh(t, d):
    im = bg((0, 0, 0))
    text(im, "ATTEMPT  #7", BAR + 60, 30, OSWALD, fade(t, d, 0.1, 0.3), (255, 120, 100), track=6, weight="Bold")
    typewriter(im, "31 OCTOBER 1974.", H / 2 - 70, 40, t, 0.3, 18)
    typewriter(im, "A LETTER FROM BP:", H / 2 - 10, 34, t, 1.5, 22, color=(200, 200, 205))
    typewriter(im, "SHE MAY STAY — UNDER LICENCE.", H / 2 + 50, 40, t, 2.5, 20, color=(255, 215, 150))
    tag(im, "RECORD", fade(t, d, 0.3, 0.3), REC)
    return im


def s_quote(t, d):
    im = spin_in(IMG["open_day"], t, 0.9, 600, 1.25).convert("RGBA")
    if t > 1.6:
        im = Image.blend(im.convert("RGB"), Image.new("RGB", (W, H)), min(0.72, (t - 1.6) * 1.5)).convert("RGBA")
    text(im, "SHE TOLD THE PAPERS:", BAR + 70, 30, OSWALD, win(t, 1.6, d - 1.6), (220, 215, 205), track=4,
         weight="Regular")
    text(im, "“I WILL REFUSE TO MOVE.”", H / 2 - 40, 76, BEBAS, win(t, 2.0, d - 2.0), (255, 240, 215), track=4,
         glow=12)
    text(im, "“My solicitors tell me I have a valid claim to it.”", H / 2 + 45, 34, SERIF_I,
         win(t, 3.6, d - 3.6), (235, 220, 190))
    text(im, "— MARY WILLIAMS, AGED 60, IN THE PRESS", H / 2 + 100, 20, OSWALD, win(t, 4.4, d - 4.4),
         (180, 175, 165), track=3, weight="Light")
    tag(im, "RECORD · NEWSPAPER CLIPPING", fade(t, d, 0.3, 0.3), REC)
    return im


def s_reply(t, d):
    im = paper(IMG["perm"], t, d, 1.3, 1.5, (0.35, 0.45), (0.4, 0.55), tilt=4)
    im = blinds(darken(im, 0.3), t, 0.7).convert("RGBA")
    text(im, "SHE WROTE BACK.", H / 2 - 50, 84, BEBAS, win(t, 0.2, d - 0.2), track=6, glow=10)
    text(im, "THAT LETTER HAS NEVER BEEN PRODUCED.", H / 2 + 40, 40, OSWALD, win(t, 1.6, d - 1.6),
         (255, 120, 100), weight="Regular")
    tag(im, "FAMILY ACCOUNT", fade(t, d, 0.3, 0.3), FAM)
    return im


def s_ruling(t, d):
    im = paper(IMG["echr"], t, d, 1.0, 1.2, (0.5, 0.25), (0.45, 0.35))
    im = darken(im, 0.35).convert("RGBA")
    text(im, "1987.  THE COURT OF APPEAL RULES:", H / 2 - 90, 40, OSWALD, win(t, 0.1, d - 0.1), weight="Regular",
         track=2)
    text(im, "HER HOME WAS HELD UNDER LICENCE", H / 2 - 10, 64, BEBAS, win(t, 1.0, d - 1.0), (255, 240, 215),
         track=4)
    text(im, "— WHETHER SHE ACCEPTED IT OR NOT.", H / 2 + 60, 52, BEBAS, win(t, 2.4, d - 2.4), (255, 120, 100),
         track=4, glow=8)
    tag(im, "RECORD · BP PROPERTIES LTD v BUCKLER", fade(t, d, 0.3, 0.3), REC)
    return im


def s_register(t, d):
    im = paper(IMG["title_plan"], t, d, 1.1, 1.3, (0.45, 0.45), (0.55, 0.5), tilt=-2)
    im = darken(im, 0.5).convert("RGBA")
    # redaction bars sweeping across
    dr = ImageDraw.Draw(im)
    for k, (yb, st) in enumerate([(200, 0.3), (262, 0.6), (324, 0.9), (386, 1.2)]):
        p = ease_out((t - st) / 0.4)
        if p > 0:
            dr.rectangle((180, yb, 180 + int(560 * p) + k * 60, yb + 34), fill=(0, 0, 0))
    im.alpha_composite(SHADE)
    text(im, "1982.  BP REGISTERS THE LAND.", CAP1 - 20, 56, BEBAS, fade(t, d, 0.2, 0.3), track=4)
    text(im, "HER HOUSE INSIDE IT. SHE IS LIVING THERE. SHE IS NOT TOLD.", CAP2 + 6, 28, OSWALD,
         win(t, 1.4, d - 1.4), (255, 120, 100), weight="Regular")
    tag(im, "RECORD · FAMILY ACCOUNT", fade(t, d, 0.3, 0.3), FAM)
    return im


def s_death(t, d):
    im = paper(IMG["death"], t, d, 1.0, 1.25, (0.35, 0.45), (0.3, 0.45), tilt=0, height=0.55,
               bg=(4, 4, 6))
    im = darken(im, 0.55).convert("RGBA")
    text(im, "23 FEBRUARY 1983 — THE LAST APPLICATION.", BAR + 80, 34, OSWALD, win(t, 0.2, d - 0.2),
         weight="Regular")
    text(im, "26 MARCH 1983 — MARY DIES.", CAP1 - 10, 64, BEBAS, win(t, 1.6, d - 1.6), (255, 240, 215),
         track=5, glow=10)
    text(im, "THIRTY-ONE DAYS. HER OWNERSHIP CLAIM NEVER GETS ITS DAY IN COURT.", CAP2 + 8, 26, OSWALD,
         win(t, 3.0, d - 3.0), (255, 120, 100), weight="Regular")
    tag(im, "RECORD · CONTENTION", fade(t, d, 0.3, 0.3), CON)
    return im


def s_whole(t, d):
    im = bg((5, 6, 8))
    text(im, "“ONE WHOLE FARM,”", H / 2 - 120, 88, BEBAS, win(t, 0.1, d - 0.1), track=6, glow=10)
    text(im, "THEY SAID.", H / 2 - 45, 44, OSWALD, win(t, 0.8, d - 0.8), (200, 200, 205), weight="Regular")
    text(im, "YET THE TWO TITLES WERE ONLY MERGED IN 1987 —", H / 2 + 40, 36, OSWALD, win(t, 2.0, d - 2.0),
         weight="Regular")
    text(im, "IN THE MIDDLE OF THE APPEAL.", H / 2 + 100, 52, BEBAS, win(t, 3.2, d - 3.2), (255, 120, 100),
         track=4, glow=8)
    tag(im, "RECORD · HM LAND REGISTRY", fade(t, d, 0.3, 0.3), REC)
    return im


def s_root(t, d):
    im = paper(IMG["hmlr_sched"], t, d, 1.15, 1.35, (0.5, 0.35), (0.5, 0.5), tilt=1.5)
    im = blinds(darken(im, 0.35), t, 0.55).convert("RGBA")
    text(im, "THE ROOT DEED: 31 DECEMBER 1969.", H / 2 - 110, 50, BEBAS, win(t, 0.1, d - 0.1), track=4)
    stamp(im, "NOT ON THE FILE", W / 2, H / 2 - 20, t, 1.0, size=60)
    text(im, "A CHAIN OF TRANSFERS.  BP TO BP.", H / 2 + 95, 40, OSWALD, win(t, 2.2, d - 2.2), weight="Regular")
    text(im, "THE FAMILY'S CASE: A PARCEL MADE TO LOOK LIKE HERS.", H / 2 + 150, 28, OSWALD, win(t, 3.6, d - 3.6),
         (255, 120, 100), weight="Regular")
    tag(im, "RECORD · CONTENTION", fade(t, d, 0.3, 0.3), CON)
    return im


def s_police(t, d):
    im = cover(IMG["police"], t, d, 1.05, 1.3, (0.5, 0.4), (0.55, 0.45)).convert("RGBA")
    im.alpha_composite(SHADE)
    text(im, "29 NOVEMBER 1988", CAP1 + 20, 72, BEBAS, fade(t, d, 0.05, 0.3), (255, 240, 215), track=8, glow=10)
    tag(im, "RECORD · PRESS PHOTOGRAPH", fade(t, d, 0.3, 0.3), REC)
    return im


def s_clip(t, d):
    n = min(int(t * FPS), len(CLIP_FRAMES) - 1)
    im = Image.open(os.path.join(TMP, CLIP_FRAMES[n])).convert("RGB")
    im = cover(im, t, d, 1.0, 1.08).convert("RGBA")
    im.alpha_composite(SHADE)
    text(im, "THEY TAKE THE HOUSE.", CAP1 + 20, 60, BEBAS, win(t, 1.4, d - 1.4), track=5)
    tag(im, "ARCHIVE · ITV CYMRU", fade(t, d, 0.3, 0.3), (220, 220, 220))
    return im


HEADLINES = [("fails", 560), ("tears", 440), ("history", 560)]
HL_LEN = 1.7


def s_headlines(t, d):
    i = min(int(t // HL_LEN), len(HEADLINES) - 1)
    lt = t - i * HL_LEN
    key, hgt = HEADLINES[i]
    return spin_in(IMG[key], lt, 0.55, hgt, 1.0 + 0.25 * i).convert("RGBA")


def s_demolish(t, d):
    im = bg((0, 0, 0))
    text(im, "6 DECEMBER 1988", H / 2 - 40, 96, BEBAS, fade(t, d, 0.05, 0.6), track=10, glow=12)
    text(im, "THE BULLDOZERS MOVE IN.", H / 2 + 50, 36, OSWALD, win(t, 0.8, d - 0.8), (255, 120, 100),
         weight="Regular")
    return im


def s_but(t, d):
    im = cover(IMG["farmhouse"], t, d, 1.3, 1.45, (0.5, 0.45), (0.5, 0.5))
    im = darken(im.filter(ImageFilter.GaussianBlur(4)), 0.25).convert("RGBA")
    text(im, "THEY TOOK THE HOUSE.", H / 2 - 50, 72, BEBAS, win(t, 0.2, d - 0.2), track=6)
    text(im, "THEY NEVER TOOK HER TITLE.", H / 2 + 40, 72, BEBAS, win(t, 1.8, d - 1.8), (255, 215, 150), track=6,
         glow=14)
    tag(im, "CONTENTION", fade(t, d, 0.3, 0.3), CON)
    return im


QUOTES = ["“NOT HELD.”", "“OUT OF SCOPE.”", "“MOST LIKELY DESTROYED.”"]


def s_now(t, d):
    im = paper(IMG["ggat_cover"], t, d, 1.0, 1.2, (0.5, 0.3), (0.5, 0.4), tilt=-2)
    im = blinds(darken(im, 0.3), t, 0.5).convert("RGBA")
    text(im, "NOW HER FAMILY IS ASKING FOR THE FILES.", BAR + 70, 30, OSWALD, fade(t, d, 0.3, 0.3),
         (220, 215, 205), weight="Regular", track=2)
    for k, q in enumerate(QUOTES):
        text(im, q, H / 2 - 70 + k * 80, 64, BEBAS, win(t, 0.7 + k * 0.9, d - 0.7 - k * 0.9, 0.05, 0.3),
             (255, 240, 215), track=4)
    tag(im, "RECORD · RECORDS REQUESTS 2025–26", fade(t, d, 0.3, 0.3), REC)
    return im


def s_lastline(t, d):
    im = bg((0, 0, 0))
    text(im, "EVERY PLOY HAS A PAPER TRAIL.", H / 2, 60, BEBAS, fade(t, d, 0.3, 0.2), track=6, glow=10)
    return im


def s_title(t, d):
    im = bg((0, 0, 0))
    a = fade(t, d, 0.05, 1.0)
    text(im, "PARCEL A", H / 2 - 40, 150, CINZEL, a, (240, 225, 195), track=26, glow=26, weight="Black")
    text(im, "SHE NEVER SAID YES.", H / 2 + 90, 36, OSWALD, win(t, 1.4, d - 1.4, 0.8, 1.0), (215, 195, 160),
         track=10, weight="Light")
    return im


def s_end(t, d):
    im = bg((0, 0, 0))
    a = fade(t, d, 0.6, 1.2)
    text(im, "THE EVIDENCE IS PUBLIC.", H / 2 - 110, 40, BEBAS, a, (220, 215, 205), track=6)
    text(im, "greathousefarmwiki.wordpress.com", H / 2 - 50, 40, OSWALD, a, (255, 225, 175), weight="Regular")
    lines = ["A dramatised trailer drawn from the Great House Farm Wiki, the public record and the family's account.",
             "Items marked FAMILY ACCOUNT or CONTENTION are the family's case and have not been proved in court.",
             "BP Properties Ltd v Buckler [1987] EWCA Civ 2 was decided in BP's favour and remains binding.",
             "Photographs: Cadw survey 1988; press clippings 1974–88 via the datro wayback archive; ITV Cymru."]
    for k, s in enumerate(lines):
        text(im, s, H / 2 + 40 + k * 26, 17, OSWALD, a * 0.85, (150, 145, 135), weight="Light", shadow=False)
    return im


SCENES = [
    (5.0, s_cold), (6.5, s_farm), (3.2, s_map), (5.0, s_1877), (4.4, s_1928), (6.0, s_parcels),
    (5.0, s_board), (5.6, s_1955), (7.6, s_mary), (ATT_LEN * len(ATTEMPTS), s_attempts), (5.2, s_seventh),
    (7.2, s_quote), (4.8, s_reply), (5.6, s_ruling), (5.6, s_register), (6.2, s_death), (5.6, s_whole),
    (6.2, s_root), (3.2, s_police), (5.0, s_clip), (HL_LEN * len(HEADLINES), s_headlines), (3.6, s_demolish),
    (4.8, s_but), (4.4, s_now), (2.6, s_lastline), (7.5, s_title), (8.5, s_end),
]
STARTS = np.cumsum([0] + [d for d, _ in SCENES])
TOTAL = float(STARTS[-1])
FNS = [f for _, f in SCENES]


def at(fn, off=0.0):
    return float(STARTS[FNS.index(fn)]) + off


# moments that hit hard: shake, flash, colour split, and a braam in the score
HITS = ([at(s_map), at(s_1955), at(s_mary, 0.3)]
        + [at(s_attempts, i * ATT_LEN) for i in range(len(ATTEMPTS))]
        + [at(s_attempts, i * ATT_LEN + 0.75) for i in range(len(ATTEMPTS))]
        + [at(s_seventh), at(s_quote, 0.9), at(s_ruling, 2.4), at(s_death, 1.6), at(s_whole, 3.2),
           at(s_root, 1.0), at(s_police), at(s_demolish), at(s_but, 1.8), at(s_title)]
        + [at(s_headlines, i * HL_LEN + 0.55) for i in range(len(HEADLINES))])
BIG = {at(s_1955), at(s_seventh), at(s_ruling, 2.4), at(s_police), at(s_demolish), at(s_title), at(s_mary, 0.3)}
# hard cuts (no dip to black) for the fast sections
HARD = {s_attempts, s_headlines, s_police, s_clip, s_demolish, s_title, s_1955, s_seventh}


def hit_energy(t):
    e = 0.0
    for h in HITS:
        if 0 <= t - h < 1.0:
            e = max(e, math.exp(-(t - h) * 9) * (1.6 if h in BIG else 1.0))
    return e


# ------------------------------------------------------------------ audio

def synth_audio():
    n = int((TOTAL + 1) * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)

    def seg(t0, t1):
        return slice(int(t0 * SR), min(n, int(t1 * SR)))

    def add(t0, sig):
        i0 = int(t0 * SR)
        m = min(len(sig), n - i0)
        if m > 0:
            out[i0:i0 + m] += sig[:m]

    def braam(length=3.2, gain=1.0):
        s = np.arange(int(length * SR)) / SR
        env = np.minimum(s / 0.015, 1) * np.exp(-s / (length / 3))
        sig = np.zeros_like(s)
        for f in (32.7, 49.0, 65.4, 98.0):
            sig += np.sign(np.sin(2 * np.pi * f * s)) * 0.3 + np.sin(2 * np.pi * f * 1.004 * s) * 0.6
        sig += rng.normal(0, 0.6, len(s)) * np.exp(-s * 18)
        sig = np.tanh(sig * 0.9)
        return gain * 0.55 * env * sig

    def hit(gain=0.8):
        s = np.arange(int(0.7 * SR)) / SR
        body = np.sin(2 * np.pi * (110 * np.exp(-s * 18) + 38) * s) * np.exp(-s * 7)
        crack = rng.normal(0, 1, len(s)) * np.exp(-s * 40)
        return gain * (0.9 * body + 0.35 * crack)

    def whoosh(length=0.8, gain=0.3):
        s = np.arange(int(length * SR)) / SR
        env = (s / length) ** 3
        noise = rng.normal(0, 1, len(s))
        noise = np.diff(np.concatenate([[0], noise]))  # brighten
        return gain * env * noise

    def heartbeat(t0, t1, bpm=62, gain=0.7):
        for b in np.arange(t0, t1, 60 / bpm):
            for off, g in ((0, 1.0), (0.18, 0.7)):
                s = np.arange(int(0.25 * SR)) / SR
                add(b + off, gain * g * np.sin(2 * np.pi * 48 * s) * np.exp(-s * 22))

    # --- pad: dark detuned minor chord across the whole piece
    pad = np.zeros(n)
    for f in (55.0, 65.41, 82.41, 110.0, 130.81):
        for det in (0.997, 1.003):
            pad += np.sin(2 * np.pi * f * det * tt + 0.4 * np.sin(2 * np.pi * 0.09 * tt))
    swell = 0.35 + 0.25 * np.sin(2 * np.pi * 0.03 * tt) ** 2
    out += 0.05 * pad * swell

    # --- cold open heartbeat
    heartbeat(0.3, at(s_farm) + 2.0)

    # --- piano motif under the family history
    notes = [220.0, 261.63, 329.63, 293.66, 220.0, 261.63, 349.23, 329.63]
    t = at(s_farm, 0.5)
    k = 0
    while t < at(s_board):
        f = notes[k % len(notes)]
        s = np.arange(int(2.4 * SR)) / SR
        env = np.exp(-s * 1.6) * np.minimum(s / 0.005, 1)
        add(t, 0.13 * env * (np.sin(2 * np.pi * f * s) + 0.35 * np.sin(4 * np.pi * f * s) +
                            0.1 * np.sin(6 * np.pi * f * s)))
        t += 0.9
        k += 1

    # --- ostinato: driving 16th-note bass from the boardroom to the eviction
    def ostinato(t0, t1, bpm, gain, root=55.0):
        step = 60 / bpm / 4
        pattern = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1]
        pitches = [root, root, root * 1.189, root]
        for j, b in enumerate(np.arange(t0, t1, step)):
            if not pattern[j % 16]:
                continue
            f = pitches[(j // 16) % 4]
            s = np.arange(int(step * 0.9 * SR)) / SR
            env = np.exp(-s * 14)
            sig = (np.sign(np.sin(2 * np.pi * f * s)) * 0.4 + np.sin(2 * np.pi * f * 2 * s) * 0.4)
            add(b, gain * env * sig)

    ostinato(at(s_board), at(s_quote), 100, 0.16)
    ostinato(at(s_ruling), at(s_clip), 112, 0.18)
    ostinato(at(s_headlines), at(s_but), 124, 0.2)

    # --- ticking clock under the documents
    for b in np.arange(at(s_register), at(s_police), 0.5):
        s = np.arange(int(0.03 * SR)) / SR
        add(b, 0.22 * np.sin(2 * np.pi * 2400 * s) * np.exp(-s * 160))

    # --- hits, braams and whooshes into them
    for h in HITS:
        if h in BIG:
            add(h, braam(3.4, 1.0))
        else:
            add(h, hit(0.55))
        add(max(0, h - 0.6), whoosh(0.6, 0.12))

    # --- typewriter clicks
    for t0, dur in ((at(s_cold, 0.4), 1.3), (at(s_cold, 2.0), 1.3), (at(s_seventh, 0.3), 3.8)):
        for b in np.arange(t0, t0 + dur, 1 / 20):
            s = np.arange(int(0.02 * SR)) / SR
            add(b, 0.18 * rng.normal(0, 1, len(s)) * np.exp(-s * 300))

    # --- risers
    def riser(t0, t1, gain=0.18):
        sl = seg(t0, t1)
        p = (tt[sl] - t0) / (t1 - t0)
        out[sl] += gain * p ** 2 * (np.sin(2 * np.pi * (180 + 900 * p ** 2) * tt[sl]) +
                                    0.5 * rng.normal(0, 1, len(p)))

    riser(at(s_attempts) - 2.0, at(s_attempts))
    riser(at(s_lastline) - 1.5, at(s_title) - 0.35, 0.22)

    # --- silence before the title slam
    sl = seg(at(s_title) - 0.35, at(s_title))
    out[sl] *= 0.03

    # --- the ITV clip keeps its own sound; score ducks under it
    sl = seg(at(s_clip), at(s_clip) + 5.0)
    out[sl] *= 0.35
    with wave.open(f"{TMP}/clip.wav") as w:
        clip = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).mean(1) / 32768
    clip = clip[: int(5.0 * SR)]
    ramp = np.minimum(1, np.minimum(np.arange(len(clip)), len(clip) - np.arange(len(clip))) / (0.2 * SR))
    add(at(s_clip), 0.95 * clip * ramp)

    fo = np.clip((TOTAL - tt) / 5.0, 0, 1)
    out *= fo
    out = np.tanh(out * 1.3)
    out /= np.max(np.abs(out)) + 1e-9
    out *= 0.9
    stereo = np.stack([out, np.roll(out, 120)], axis=1)
    with wave.open(f"{TMP}/thriller.wav", "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())


# ------------------------------------------------------------------ render

def grade(arr):
    """Teal-and-amber thriller grade with lifted blacks and punchy contrast."""
    lum = arr.mean(axis=2, keepdims=True) / 255.0
    teal = np.array([0.80, 1.0, 1.10], np.float32)
    amber = np.array([1.12, 1.0, 0.82], np.float32)
    tint = teal * (1 - lum) + amber * lum
    arr = arr * tint
    arr = (arr - 128) * 1.12 + 128
    return arr


def frame_at(i):
    t = i / FPS
    k = int(min(np.searchsorted(STARTS, t, side="right") - 1, len(SCENES) - 1))
    d, fn = SCENES[k]
    lt = t - STARTS[k]
    im = fn(lt, d).convert("RGB")
    if fn not in HARD:
        a = fade(lt, d, 0.25, 0.25)
        if a < 1:
            im = Image.blend(Image.new("RGB", (W, H)), im, a)
    e = hit_energy(t)
    arr = np.asarray(im).astype(np.float32)
    arr = grade(arr)
    if e > 0.02:
        # shake
        dx, dy = (rng.normal(0, 14 * e, 2)).astype(int)
        arr = np.roll(arr, (dy, dx), axis=(0, 1))
        # chromatic split
        sh = int(8 * e)
        if sh:
            arr[..., 0] = np.roll(arr[..., 0], sh, axis=1)
            arr[..., 2] = np.roll(arr[..., 2], -sh, axis=1)
        # flash
        arr = arr + 255 * max(0, e - 0.55) * 0.9
    # light leak drifting across on the warm scenes
    if fn in (s_farm, s_mary, s_1877, s_but):
        lx = W * (0.2 + 0.6 * ((t * 0.07) % 1))
        leak = np.exp(-(((xx - lx) / 380) ** 2 + ((yy - 120) / 300) ** 2))[..., None]
        arr = arr + leak * np.array([90, 45, 10], np.float32) * 0.6
    arr = arr * VIGNETTE + GRAIN[i % len(GRAIN)]
    # occasional film scratch
    if (i * 7919) % 97 < 3:
        x = (i * 131) % W
        arr[:, x:x + 1] += 60
    arr[:BAR] = 0
    arr[H - BAR:] = 0
    return np.clip(arr, 0, 255).astype(np.uint8)


def main():
    print(f"length {TOTAL:.1f}s, {len(SCENES)} scenes")
    synth_audio()
    out = os.path.join(HERE, "parcel-a-thriller-trailer.mp4")
    proc = subprocess.Popen(
        [FFMPEG, "-loglevel", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-i", f"{TMP}/thriller.wav",
         "-c:v", "libx264", "-preset", "slow", "-b:v", "2800k", "-maxrate", "4000k", "-bufsize", "8000k",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out],
        stdin=subprocess.PIPE)
    nframes = int(TOTAL * FPS)
    for i in range(nframes):
        proc.stdin.write(frame_at(i).tobytes())
        if i % 250 == 0:
            print(f"  frame {i}/{nframes}", flush=True)
    proc.stdin.close()
    proc.wait()
    print("wrote", out)


def stills():
    for fn in FNS:
        d = SCENES[FNS.index(fn)][0]
        Image.fromarray(frame_at(int((at(fn) + d * 0.72) * FPS))).save(f"{TMP}/t_{fn.__name__}.png")


if __name__ == "__main__":
    if "--stills" in sys.argv:
        stills()
    else:
        main()
