"""Render "The Whole Farm" — a documentary-style trailer built from the
Great House Farm Wiki (greathousefarmwiki.wordpress.com) and its evidence files.

Requires: pillow, numpy, pymupdf, imageio-ffmpeg
    pip install pillow numpy pymupdf imageio-ffmpeg
    python3 trailer/make_trailer.py            # writes trailer/the-whole-farm-trailer.mp4
"""
import math
import os
import subprocess
import sys
import wave

import numpy as np
import pymupdf
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EV = os.path.join(ROOT, "public", "evidence")
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(OUT_DIR, ".build")
os.makedirs(TMP, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

W, H, FPS = 1280, 720, 25
BAR = 60  # letterbox height (2.39:1-ish feel)
SR = 44100

FONT_DIR = "/usr/share/fonts/truetype"
SERIF = f"{FONT_DIR}/liberation/LiberationSerif-Regular.ttf"
SERIF_B = f"{FONT_DIR}/liberation/LiberationSerif-Bold.ttf"
SERIF_I = f"{FONT_DIR}/liberation/LiberationSerif-Italic.ttf"
SANS = f"{FONT_DIR}/dejavu/DejaVuSans.ttf"
SANS_B = f"{FONT_DIR}/dejavu/DejaVuSans-Bold.ttf"
MONO = f"{FONT_DIR}/dejavu/DejaVuSansMono.ttf"

_fonts = {}


def font(path, size):
    key = (path, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(path, size)
    return _fonts[key]


# ---------------------------------------------------------------- assets

def load(path, crop=None, rotate=0):
    im = Image.open(path).convert("RGB")
    if crop:
        im = im.crop(crop)
    if rotate:
        im = im.rotate(rotate, expand=True)
    return im


def pdf_page(rel, page=0, dpi=150):
    doc = pymupdf.open(os.path.join(EV, rel))
    pix = doc[page].get_pixmap(dpi=dpi)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def sepia(im, amount=1.0):
    g = ImageOps.grayscale(im)
    s = ImageOps.colorize(g, (30, 20, 12), (245, 225, 190))
    return Image.blend(im, s, amount)


print("loading assets…")
IMG = {
    "map1824": sepia(load(f"{EV}/maps-photos/1824-map-of-ty-mawr.jpg", (0, 150, 720, 1290)), 0.35),
    "plan1877": sepia(load(f"{EV}/maps-photos/1877-plan-of-williams-parcel.jpg"), 0.25),
    "plan1939": sepia(load(f"{EV}/maps-photos/1939-wgr-tenancy-plan-parcel-to-east.jpg", (360, 860, 960, 1620)), 0.2),
    "crowd": sepia(load(f"{EV}/maps-photos/tree-planting-photograph.jpg"), 0.9),
    "echr": pdf_page("court/1989-04-14-echr-decision-buckler-v-uk-14464-88.pdf"),
    "perm": pdf_page("planning/1990-03-13-outline-planning-permission-89-01396-OUT.pdf"),
    "exc": pdf_page("archaeology/1994-excavations-great-house-farm-preliminary-report.pdf"),
    "ggat93": pdf_page("archaeology/1993-12-15-ggat-letter-condition-18-and-correspondence.pdf"),
}

# ITV clip frames + audio
CLIP = f"{EV}/video/itv-cymru-great-house-farm-clip.mp4"
subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-i", CLIP, "-vf", f"fps={FPS}",
                f"{TMP}/clip_%03d.png"], check=True)
subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-i", CLIP, "-ac", "2", "-ar", str(SR),
                f"{TMP}/clip.wav"], check=True)
CLIP_FRAMES = sorted(f for f in os.listdir(TMP) if f.startswith("clip_"))

# precomputed film grain + vignette
rng = np.random.default_rng(7)
GRAIN = [rng.normal(0, 9, (H, W, 1)).astype(np.float32) for _ in range(6)]
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
VIGNETTE = np.clip(1.15 - 0.55 * r ** 2, 0.25, 1.0)[..., None].astype(np.float32)


# ---------------------------------------------------------------- helpers

def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def fade(t, dur, fin=0.6, fout=0.6):
    """Opacity envelope for a scene/element of length dur at local time t."""
    a = 1.0
    if fin > 0:
        a = min(a, ease(t / fin))
    if fout > 0:
        a = min(a, ease((dur - t) / fout))
    return max(0.0, a)


def kenburns(im, t, dur, z0=1.0, z1=1.15, p0=(0.5, 0.5), p1=(0.5, 0.5)):
    """Cover-fit image to frame then slowly zoom/pan."""
    k = ease(t / dur) * 0.6 + (t / dur) * 0.4
    z = z0 + (z1 - z0) * k
    cx = p0[0] + (p1[0] - p0[0]) * k
    cy = p0[1] + (p1[1] - p0[1]) * k
    iw, ih = im.size
    scale = max(W / iw, H / ih) * z
    cw, ch = W / scale, H / scale
    x0 = min(max(cx * iw - cw / 2, 0), iw - cw)
    y0 = min(max(cy * ih - ch / 2, 0), ih - ch)
    return im.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))


def paper(im, t, dur, z0=1.0, z1=1.12, p0=(0.5, 0.35), p1=(0.5, 0.45), bg=(14, 12, 10)):
    """A document lying on a dark desk, slowly pushed in."""
    k = ease(t / dur)
    z = z0 + (z1 - z0) * k
    frame = Image.new("RGB", (W, H), bg)
    iw, ih = im.size
    base = (H * 1.55) / ih * z
    doc = im.resize((int(iw * base), int(ih * base)), Image.BICUBIC).rotate(-1.2, expand=True,
                                                                            fillcolor=bg)
    cx = p0[0] + (p1[0] - p0[0]) * k
    cy = p0[1] + (p1[1] - p0[1]) * k
    x = int(W / 2 - cx * doc.width)
    y = int(H / 2 - cy * doc.height)
    shadow = Image.new("L", doc.size, 0)
    shadow.paste(140, (10, 10, doc.width - 10, doc.height - 10))
    frame.paste((0, 0, 0), (x + 18, y + 18), shadow.filter(ImageFilter.GaussianBlur(14)))
    frame.paste(doc, (x, y))
    return frame


def text(draw_im, s, y, size=44, path=SERIF, alpha=1.0, color=(240, 232, 215), x=None,
         spacing=0, shadow=True, anchor="ma"):
    if alpha <= 0:
        return
    f = font(path, size)
    layer = Image.new("RGBA", draw_im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if spacing:
        s = (" " * spacing).join(s) if spacing > 0 else s
    xx_ = W / 2 if x is None else x
    if shadow:
        d.text((xx_ + 2, y + 3), s, font=f, fill=(0, 0, 0, int(200 * alpha)), anchor=anchor)
    d.text((xx_, y), s, font=f, fill=color + (int(255 * alpha),), anchor=anchor)
    draw_im.alpha_composite(layer)


def tag(im, label, alpha, color):
    """Evidence-key badge, as used on the wiki: [Record] / [Family account] / [Contention]."""
    if alpha <= 0:
        return
    f = font(MONO, 18)
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w = d.textlength(label, font=f)
    x, y = 70, BAR + 26
    d.rectangle((x - 10, y - 6, x + w + 10, y + 26), fill=(0, 0, 0, int(150 * alpha)),
                outline=color + (int(255 * alpha),), width=2)
    d.text((x, y), label, font=f, fill=color + (int(255 * alpha),))
    im.alpha_composite(layer)


REC = (150, 200, 255)
FAM = (240, 200, 120)
CON = (255, 120, 110)


_g = np.clip((np.arange(H) - (H - BAR - 230)) / 170, 0, 1) ** 1.4 * 215
SHADE = Image.fromarray(np.dstack([np.zeros((H, W, 3), np.uint8),
                                   np.repeat(_g[:, None], W, 1).astype(np.uint8)]), "RGBA")


def shade(im):
    """Darken the lower third so captions stay legible over bright documents."""
    im.alpha_composite(SHADE)


def black():
    return Image.new("RGB", (W, H), (0, 0, 0))


# ---------------------------------------------------------------- scenes
# Each scene: (duration, render(t) -> RGBA image). Captions sit above the lower bar.

CAP_Y = H - BAR - 118
CAP2_Y = H - BAR - 64


def s_open(t, d=5.0):
    im = black().convert("RGBA")
    text(im, "LLANDOUGH  ·  VALE OF GLAMORGAN", H / 2 - 30, 26, SANS, fade(t - 0.6, 3.6, 1.0, 0.9),
         (200, 190, 170))
    text(im, "Wales", H / 2 + 14, 22, SERIF_I, fade(t - 1.4, 2.8, 1.0, 0.9), (150, 140, 125))
    return im


def s_map(t, d=6.0):
    im = kenburns(IMG["map1824"], t, d, 1.05, 1.5, (0.5, 0.55), (0.62, 0.62)).convert("RGBA")
    shade(im)
    tag(im, "1824 · MAP OF TŶ MAWR", fade(t, d, 0.8, 0.5), (220, 210, 190))
    text(im, "For nine generations,", CAP_Y, 44, SERIF, fade(t - 0.5, d - 0.5, 0.8, 0.6))
    text(im, "one family called it home.", CAP2_Y, 44, SERIF, fade(t - 1.6, d - 1.6, 0.8, 0.6))
    return im


def s_title1(t, d=4.0):
    im = black().convert("RGBA")
    a = fade(t, d, 0.3, 0.8)
    text(im, "TŶ MAWR", H / 2 - 70, 96, SERIF_B, a, (245, 236, 215), spacing=1)
    text(im, "GREAT HOUSE FARM", H / 2 + 50, 28, SANS, fade(t - 0.6, d - 0.6, 0.6, 0.8),
         (190, 175, 150), spacing=1)
    return im


def s_crowd(t, d=6.0):
    im = kenburns(IMG["crowd"], t, d, 1.0, 1.18, (0.4, 0.5), (0.55, 0.45)).convert("RGBA")
    shade(im)
    tag(im, "FAMILY ACCOUNT", fade(t, d, 0.6, 0.5), FAM)
    text(im, "1877. The farm is sold for quarrying.", CAP_Y, 42, SERIF, fade(t - 0.3, d - 0.3, 0.7, 0.6))
    text(im, "The family says a promise came with it.", CAP2_Y, 42, SERIF_I,
         fade(t - 1.7, d - 1.7, 0.7, 0.6), (240, 205, 150))
    return im


def s_1877(t, d=5.5):
    im = kenburns(IMG["plan1877"], t, d, 1.3, 1.9, (0.55, 0.52), (0.6, 0.55)).convert("RGBA")
    shade(im)
    tag(im, "CONTENTION", fade(t, d, 0.6, 0.5), CON)
    text(im, "1928. The last quarry machine leaves.", CAP_Y, 42, SERIF, fade(t - 0.3, d - 0.3, 0.7, 0.6))
    text(im, "The rent on the house stops. For good.", CAP2_Y, 42, SERIF,
         fade(t - 1.6, d - 1.6, 0.7, 0.6))
    return im


def s_parcels(t, d=6.5):
    im = kenburns(IMG["plan1939"], t, d, 1.0, 1.35, (0.5, 0.5), (0.45, 0.62)).convert("RGBA")
    shade(im)
    tag(im, "1939 · TENANCY PLAN", fade(t, d, 0.6, 0.5), REC)
    text(im, "Two parcels of land…", CAP_Y, 46, SERIF, fade(t - 0.3, d - 0.3, 0.7, 0.6))
    text(im, "…or one “whole farm”?", CAP2_Y, 46, SERIF_B, fade(t - 2.2, d - 2.2, 0.5, 0.6),
         (255, 225, 190))
    return im


SLAMS = [
    ("1955", "a possession order — enforced on everything but the house"),
    ("1962", "a county court order — never enforced"),
    ("1974", "a licence letter she never accepted"),
    ("1982", "the land is registered — as one"),
]
SLAM_LEN = 1.6


def s_slams(t, d=SLAM_LEN * 4):
    i = min(int(t // SLAM_LEN), 3)
    lt = t - i * SLAM_LEN
    year, line = SLAMS[i]
    im = Image.new("RGB", (W, H), (8, 6, 6)).convert("RGBA")
    flash = max(0.0, 1 - lt / 0.25)
    if flash > 0:
        im.alpha_composite(Image.new("RGBA", (W, H), (120, 20, 15, int(120 * flash))))
    z = 1.0 + 0.06 * (1 - ease(lt / 0.4))
    text(im, year, H / 2 - 110, int(150 * z), SERIF_B, fade(lt, SLAM_LEN, 0.05, 0.25),
         (240, 228, 205))
    text(im, line, H / 2 + 70, 30, SERIF_I, fade(lt - 0.2, SLAM_LEN - 0.2, 0.25, 0.25),
         (215, 190, 160))
    return im


def s_court(t, d=6.5):
    im = paper(IMG["echr"], t, d, 1.0, 1.15, (0.5, 0.22), (0.45, 0.32)).convert("RGBA")
    im.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, 90)))
    shade(im)
    tag(im, "RECORD", fade(t, d, 0.6, 0.5), REC)
    text(im, "The High Court ruled for BP. The Court of Appeal dismissed the appeal.", CAP_Y, 34, SERIF_B, fade(t - 0.3, d - 0.3, 0.7, 0.6))
    text(im, "1987 appeal dismissed · 1989 ECHR application inadmissible", CAP2_Y, 28, SANS,
         fade(t - 1.4, d - 1.4, 0.7, 0.6), (200, 215, 235))
    return im


def s_clip(t, d=5.0):
    n = min(int(t * FPS), len(CLIP_FRAMES) - 1)
    im = Image.open(os.path.join(TMP, CLIP_FRAMES[n])).convert("RGB")
    im = kenburns(im, t, d, 1.0, 1.06).convert("RGBA")
    shade(im)
    tag(im, "ARCHIVE FOOTAGE · ITV CYMRU", fade(t, d, 0.3, 0.5), (220, 220, 220))
    text(im, "29 November 1988. Possession is taken.", CAP_Y, 42, SERIF, fade(t - 0.3, d - 0.3, 0.5, 0.5))
    text(im, "Days later, the bulldozers arrive.", CAP2_Y, 42, SERIF_I, fade(t - 2.2, d - 2.2, 0.5, 0.5),
         (240, 205, 150))
    return im


def s_demolish(t, d=3.5):
    im = black().convert("RGBA")
    text(im, "6 DECEMBER 1988", H / 2 - 40, 58, SERIF_B, fade(t, d, 0.2, 0.8), (240, 228, 205),
         spacing=1)
    text(im, "Demolition begins.", H / 2 + 40, 30, SERIF_I, fade(t - 0.7, d - 0.7, 0.5, 0.8),
         (200, 180, 150))
    return im


def s_exc(t, d=6.0):
    im = paper(IMG["exc"], t, d, 0.95, 1.1, (0.5, 0.3), (0.5, 0.4), bg=(20, 18, 14)).convert("RGBA")
    im.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, 90)))
    shade(im)
    tag(im, "RECORD · COTSWOLD ARCHAEOLOGICAL TRUST, 1994", fade(t, d, 0.6, 0.5), REC)
    text(im, "Beneath the farm lay an early-medieval cemetery.", CAP_Y, 38, SERIF,
         fade(t - 0.3, d - 0.3, 0.7, 0.6))
    text(im, "814 burials excavated. Then 20 houses were built.", CAP2_Y, 38, SERIF_B,
         fade(t - 1.8, d - 1.8, 0.7, 0.6), (255, 225, 190))
    return im


def s_ggat(t, d=6.0):
    im = paper(IMG["ggat93"], t, d, 1.05, 1.3, (0.4, 0.4), (0.4, 0.5)).convert("RGBA")
    im.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, 100)))
    shade(im)
    tag(im, "RECORD · GGAT, 15 DECEMBER 1993", fade(t, d, 0.6, 0.5), REC)
    text(im, "Groundworks began before the", CAP_Y, 40, SERIF, fade(t - 0.3, d - 0.3, 0.7, 0.6))
    text(im, "archaeological condition was met.", CAP2_Y, 40, SERIF, fade(t - 0.9, d - 0.9, 0.7, 0.6))
    return im


QUOTES = ["“Not held.”", "“Out of scope.”", "“Most likely destroyed.”"]
Q_LEN = 1.7


def s_quotes(t, d=Q_LEN * 3 + 2.3):
    im = Image.new("RGB", (W, H), (10, 10, 12)).convert("RGBA")
    shade(im)
    tag(im, "RECORDS REQUESTS · 2025–26", fade(t, d, 0.4, 0.5), REC)
    for i, q in enumerate(QUOTES):
        a = fade(t - i * Q_LEN, d - i * Q_LEN, 0.15, 0.5)
        text(im, q, H / 2 - 150 + i * 90, 60, SERIF_I, a, (235, 225, 205))
    text(im, "What the public bodies told the family.", H / 2 + 150, 28, SANS,
         fade(t - 3 * Q_LEN, d - 3 * Q_LEN, 0.5, 0.5), (170, 160, 145))
    return im


def s_thesis(t, d=7.0):
    im = kenburns(IMG["map1824"], t, d, 2.2, 2.5, (0.62, 0.62), (0.6, 0.6))
    im = im.filter(ImageFilter.GaussianBlur(3)).point(lambda v: int(v * 0.35)).convert("RGBA")
    shade(im)
    tag(im, "CONTENTION", fade(t, d, 0.6, 0.5), CON)
    text(im, "Was the evidence overlooked…", H / 2 - 80, 48, SERIF, fade(t - 0.2, d - 0.2, 0.7, 0.6))
    text(im, "…or was it hidden?", H / 2 - 10, 58, SERIF_B, fade(t - 1.8, d - 1.8, 0.5, 0.6),
         (255, 150, 130))
    text(im, "One family. One archive. Every document.", H / 2 + 90, 28, SANS,
         fade(t - 3.4, d - 3.4, 0.7, 0.6), (200, 190, 170))
    return im


def s_title(t, d=7.0):
    im = black().convert("RGBA")
    a = fade(t, d, 1.2, 1.0)
    text(im, "THE WHOLE FARM", H / 2 - 60, 80, SERIF_B, a, (245, 236, 215), spacing=1)
    text(im, "The fight for Great House Farm", H / 2 + 60, 34, SERIF_I,
         fade(t - 1.0, d - 1.0, 0.8, 1.0), (215, 195, 160))
    return im


def s_end(t, d=6.5):
    im = black().convert("RGBA")
    a = fade(t, d, 0.6, 1.2)
    text(im, "greathousefarmwiki.wordpress.com", H / 2 - 60, 38, SANS_B, a, (235, 225, 205))
    text(im, "Read the documents. Decide for yourself.", H / 2, 28, SERIF_I, a, (200, 185, 160))
    small = ("Labels follow the wiki’s evidence key. [Contention] items are the family’s case and are "
             "unproven;", "the Court of Appeal’s 1987 judgment for BP Properties Ltd remains binding.")
    text(im, small[0], H / 2 + 100, 17, SANS, a * 0.8, (140, 135, 125), shadow=False)
    text(im, small[1], H / 2 + 124, 17, SANS, a * 0.8, (140, 135, 125), shadow=False)
    return im


SCENES = [
    (5.0, s_open), (6.0, s_map), (4.0, s_title1), (6.0, s_crowd), (5.5, s_1877),
    (6.5, s_parcels), (SLAM_LEN * 4, s_slams), (6.5, s_court), (5.0, s_clip), (3.5, s_demolish),
    (6.0, s_exc), (6.0, s_ggat), (Q_LEN * 3 + 2.3, s_quotes), (7.0, s_thesis), (7.0, s_title),
    (6.5, s_end),
]
STARTS = np.cumsum([0] + [d for d, _ in SCENES])
TOTAL = float(STARTS[-1])


def scene_start(fn):
    return float(STARTS[[f for _, f in SCENES].index(fn)])


# ---------------------------------------------------------------- audio

def synth_audio():
    n = int(TOTAL * SR) + SR
    tt = np.arange(n) / SR
    out = np.zeros(n, dtype=np.float64)

    def env_at(start, attack, length):
        e = np.zeros(n)
        i0 = int(start * SR)
        seg = np.arange(int(length * SR)) / SR
        seg_e = np.minimum(seg / attack, 1.0) * np.exp(-seg / (length / 3.5))
        e[i0:i0 + len(seg_e)] = seg_e[: max(0, n - i0)]
        return e

    # 1. dark drone: D minor, slowly swelling, with a gentle LFO
    swell = np.clip(tt / 20, 0, 1) * 0.6 + 0.4
    lfo = 0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * tt)
    for f, a in [(36.71, 0.28), (73.42, 0.18), (110.0, 0.09), (146.83, 0.05), (174.61, 0.035)]:
        out += a * np.sin(2 * np.pi * f * tt + 0.3 * np.sin(2 * np.pi * 0.07 * tt)) * swell * lfo
    # soft piano-like motif through the first act (D, F, A, E …)
    notes = [293.66, 349.23, 440.0, 329.63, 293.66, 349.23, 392.0, 329.63]
    for k in range(18):
        st = 1.2 + k * 1.8
        if st > scene_start(s_slams) - 0.5:
            break
        f = notes[k % len(notes)]
        e = env_at(st, 0.01, 3.0)
        out += 0.10 * e * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))

    # 2. braams on the date slams, the court, the demolition and the title
    def braam(at, gain=0.9, length=2.8):
        e = env_at(at, 0.02, length)
        s = np.zeros(n)
        for f in (36.71, 55.0, 73.42, 110.0):
            s += np.sign(np.sin(2 * np.pi * f * tt)) * 0.25 + np.sin(2 * np.pi * f * 1.003 * tt) * 0.5
        s += rng.normal(0, 0.25, n) * np.exp(-((tt - at) * 6) ** 2)
        return gain * e * s * 0.35

    hits = [scene_start(s_slams) + i * SLAM_LEN for i in range(4)]
    hits += [scene_start(s_court), scene_start(s_demolish), scene_start(s_title) + 0.1]
    for h in hits:
        out += braam(h)

    # 3. ticking pulse under the investigation section
    t0, t1 = scene_start(s_exc), scene_start(s_title)
    for b in np.arange(t0, t1, 0.5):
        i0 = int(b * SR)
        seg = np.arange(int(0.05 * SR)) / SR
        out[i0:i0 + len(seg)] += 0.18 * np.sin(2 * np.pi * 1800 * seg) * np.exp(-seg * 90)
        if int((b - t0) / 0.5) % 2 == 0:
            seg = np.arange(int(0.35 * SR)) / SR
            out[i0:i0 + len(seg)] += 0.35 * np.sin(2 * np.pi * (60 - 30 * seg) * seg) * np.exp(-seg * 12)

    # 4. rising tension before the title
    rs, re_ = scene_start(s_thesis), scene_start(s_title)
    m = (tt >= rs) & (tt < re_)
    p = (tt[m] - rs) / (re_ - rs)
    out[m] += 0.12 * p ** 2 * np.sin(2 * np.pi * (200 + 600 * p ** 2) * tt[m])
    out[m] += 0.08 * p ** 2 * rng.normal(0, 1, m.sum())

    # silence right before the title hit
    gap = (tt > re_ - 0.35) & (tt < re_ + 0.1)
    out[gap] *= 0.05

    # 5. duck the score under the ITV clip and mix its own audio in
    cs = scene_start(s_clip)
    ce = cs + 5.0
    duck = np.ones(n)
    duck[(tt > cs) & (tt < ce)] = 0.35
    out *= duck
    with wave.open(f"{TMP}/clip.wav") as w:
        clip = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2)
    clip = clip.mean(axis=1) / 32768.0
    clip = clip[: int(5.0 * SR)]
    ramp = np.minimum(1, np.minimum(np.arange(len(clip)), len(clip) - np.arange(len(clip))) / (0.3 * SR))
    i0 = int(cs * SR)
    out[i0:i0 + len(clip)] += 0.9 * clip * ramp

    # master fade-out and normalise
    fo = np.clip((TOTAL - tt) / 4.0, 0, 1)
    out *= fo
    out = np.tanh(out * 1.2)
    out /= np.max(np.abs(out)) + 1e-9
    out *= 0.89
    stereo = np.stack([out, np.roll(out, 90)], axis=1)
    pcm = (stereo * 32767).astype(np.int16)
    with wave.open(f"{TMP}/score.wav", "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ---------------------------------------------------------------- render

def frame_at(i):
    t = i / FPS
    k = int(np.searchsorted(STARTS, t, side="right") - 1)
    k = min(k, len(SCENES) - 1)
    d, fn = SCENES[k]
    lt = t - STARTS[k]
    im = fn(lt, d).convert("RGB")
    # scene-level dip to black at hard cuts (except the slams, which cut hard)
    if fn not in (s_slams,):
        a = fade(lt, d, 0.35, 0.35)
        if a < 1:
            im = Image.blend(Image.new("RGB", (W, H)), im, a)
    arr = np.asarray(im).astype(np.float32)
    arr = arr * VIGNETTE + GRAIN[i % len(GRAIN)]
    # subtle warm grade
    arr[..., 0] *= 1.03
    arr[..., 2] *= 0.95
    arr[:BAR] = 0
    arr[H - BAR:] = 0
    return np.clip(arr, 0, 255).astype(np.uint8)


def main():
    print(f"trailer length {TOTAL:.1f}s")
    synth_audio()
    out = os.path.join(OUT_DIR, "the-whole-farm-trailer.mp4")
    proc = subprocess.Popen(
        [FFMPEG, "-loglevel", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-i", f"{TMP}/score.wav",
         "-c:v", "libx264", "-preset", "slow", "-b:v", "2200k", "-maxrate", "3000k", "-bufsize", "6000k", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out],
        stdin=subprocess.PIPE)
    nframes = int(TOTAL * FPS)
    for i in range(nframes):
        proc.stdin.write(frame_at(i).tobytes())
        if i % 250 == 0:
            print(f"  frame {i}/{nframes}", flush=True)
    proc.stdin.close()
    proc.wait()
    if "--stills" in sys.argv:
        for fn in [f for _, f in SCENES]:
            s = scene_start(fn) + 2.5
            Image.fromarray(frame_at(int(s * FPS))).save(f"{TMP}/still_{fn.__name__}.png")
    print("wrote", out)


if __name__ == "__main__":
    main()
