"""Cut the generated shots, narration and score into the finished trailer.

    python3 trailer/hollywood/assemble.py      # -> trailer/hollywood/parcel-a-hollywood-trailer.mp4
Needs stills/<id>.png for every shot (local_stills.py) and vo/*.wav (narrate.py).
"""
import math
import os
import subprocess
import sys
import wave

import imageio_ffmpeg
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from shots import END_LINES, SHOTS, TAGLINE, TITLE

HERE = os.path.dirname(os.path.abspath(__file__))
FD = os.path.join(os.path.dirname(HERE), "fonts")
TMP = os.path.join(HERE, ".build")
os.makedirs(TMP, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS, SR, BAR = 1280, 720, 25, 44100, 72

BEBAS, OSWALD, CINZEL = f"{FD}/BebasNeue-Regular.ttf", f"{FD}/Oswald.ttf", f"{FD}/Cinzel.ttf"
_fonts = {}


def font(path, size, weight=None):
    key = (path, size, weight)
    if key not in _fonts:
        f = ImageFont.truetype(path, size)
        if weight:
            f.set_variation_by_name(weight)
        _fonts[key] = f
    return _fonts[key]


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def text(canvas, s, y, size, path=BEBAS, alpha=1.0, color=(245, 240, 230), track=0, glow=0, weight=None,
         x=None, anchor="mm"):
    if alpha <= 0.01:
        return
    f = font(path, size, weight)
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    xc = W / 2 if x is None else x
    widths = [d.textlength(c, font=f) for c in s]
    total = sum(widths) + track * (len(s) - 1)
    cx = xc - total / 2 if anchor[0] == "m" else (xc - total if anchor[0] == "r" else xc)
    for c, w_ in zip(s, widths):
        d.text((cx, y), c, font=f, fill=color + (255,), anchor="l" + anchor[1])
        cx += w_ + track
    a = layer.getchannel("A")
    out = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sh.putalpha(a.filter(ImageFilter.GaussianBlur(6)))
    out.alpha_composite(sh, (3, 4))
    if glow:
        g = Image.new("RGBA", canvas.size, color + (0,))
        g.putalpha(a.filter(ImageFilter.GaussianBlur(glow)))
        out.alpha_composite(g)
    out.alpha_composite(layer)
    if alpha < 1:
        out.putalpha(out.getchannel("A").point(lambda v: int(v * alpha)))
    canvas.alpha_composite(out)


LABEL_COLORS = {"RECORD": (140, 190, 255), "FAMILY": (240, 195, 110), "CONTENTION": (255, 110, 100)}


def label(canvas, s, alpha):
    if not s or alpha <= 0:
        return
    color = LABEL_COLORS["CONTENTION" if "CONTENTION" in s else "FAMILY" if "FAMILY" in s else "RECORD"]
    f = font(OSWALD, 16, "Regular")
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w = d.textlength(s, font=f)
    x, y = W - 56 - w, BAR + 20
    d.rectangle((x - 9, y - 5, x + w + 9, y + 24), fill=(0, 0, 0, int(150 * alpha)),
                outline=color + (int(220 * alpha),), width=1)
    d.text((x, y), s, font=f, fill=color + (int(255 * alpha),))
    canvas.alpha_composite(layer)


# ------------------------------------------------------------------ timeline

def vo_len(sid):
    p = os.path.join(HERE, "vo", f"{sid}.wav")
    return sf.info(p).duration if os.path.exists(p) else 0.0


COLD, TITLE_LEN, END_LEN = 2.5, 7.0, 8.5
timeline = []  # (start, dur, shot)
t = COLD
for s in SHOTS:
    d = max(s["secs"], vo_len(s["id"]) + 0.9)
    timeline.append((t, d, s))
    t += d
TITLE_AT = t
TOTAL = t + TITLE_LEN + END_LEN
BIG = {"19_letter", "22_trap", "25_verdict", "27_bulldozer", "07_hospital", "26_eviction"}
TRAP_SNAP = 1.2  # seconds into the lock shot at which it clicks shut (matches the on-screen line and the hit)
HIT_AT = {"22_trap": TRAP_SNAP}
HITS = [(st + HIT_AT.get(s["id"], 0), s["id"] in BIG) for st, d, s in timeline if s["year"] or s["id"] in BIG] + [(TITLE_AT, True)]


def hit_energy(t):
    e = 0.0
    for h, big in HITS:
        if 0 <= t - h < 1:
            e = max(e, math.exp(-(t - h) * 9) * (1.5 if big else 1.0))
    return e


# ------------------------------------------------------------------ video prep

def prep(shot, dur):
    src = os.path.join(HERE, "clips", f"{shot['id']}.mp4")
    dst = os.path.join(TMP, f"n_{shot['id']}.mp4")
    if os.path.exists(dst) and os.path.getmtime(dst) > os.path.getmtime(src):
        return dst
    probe = subprocess.run([FFMPEG, "-i", src], capture_output=True, text=True).stderr
    hms = probe.split("Duration: ")[1].split(",")[0].split(":")
    src_len = float(hms[0]) * 3600 + float(hms[1]) * 60 + float(hms[2])
    stretch = max(1.0, dur / max(src_len, 0.1))  # slow motion to fill the beat
    vf = (f"setpts={stretch:.4f}*PTS,scale={W}:{H}:force_original_aspect_ratio=increase,"
          f"crop={W}:{H},fps={FPS},trim=duration={dur:.3f},setpts=PTS-STARTPTS")
    subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-i", src, "-an", "-vf", vf, "-c:v", "libx264",
                    "-crf", "14", "-preset", "fast", dst], check=True)
    return dst


def frames(path, n):
    p = subprocess.Popen([FFMPEG, "-loglevel", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         stdout=subprocess.PIPE)
    last = np.zeros((H, W, 3), np.uint8)
    for _ in range(n):
        buf = p.stdout.read(W * H * 3)
        if len(buf) == W * H * 3:
            last = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        yield last
    p.stdout.close()
    p.wait()


rng = np.random.default_rng(3)
GRAIN = [rng.normal(0, 8, (H, W, 1)).astype(np.float32) for _ in range(6)]
yy, xx = np.mgrid[0:H, 0:W]
VIG = np.clip(1.2 - 0.55 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2), 0.2, 1)[..., None]



# ------------------------------------------------------------------ still -> camera move

VIS_H = H - 2 * BAR
# id: (zoom0, zoom1, (cx0, cy0), (cx1, cy1), handheld)
MOVES = {
    "01_valley": (1.0, 1.25, (0.5, 0.5), (0.5, 0.42), False),
    "02_farmhouse": (1.0, 1.3, (0.5, 0.5), (0.5, 0.46), False),
    "05_silence": (1.3, 1.0, (0.55, 0.46), (0.5, 0.48), False),
    "05b_photo": (1.0, 1.7, (0.5, 0.5), (0.47, 0.43), False),
    "07_hospital": (1.0, 2.0, (0.5, 0.5), (0.5, 0.435), False),
    "08_bailiffs": (1.15, 1.3, (0.4, 0.5), (0.6, 0.5), True),
    "09_door1": (1.25, 1.1, (0.5, 0.5), (0.5, 0.46), False),
    "11_refuse1959": (1.05, 1.7, (0.55, 0.45), (0.58, 0.36), False),
    "22_trap": (1.05, 1.35, (0.5, 0.52), (0.5, 0.52), False),
    "26_eviction": (1.15, 1.3, (0.55, 0.5), (0.45, 0.5), True),
    "29_family": (1.25, 1.25, (0.3, 0.46), (0.7, 0.46), False),
}
DEFAULT_MOVES = [(1.0, 1.22, (0.5, 0.46), (0.5, 0.44), False), (1.18, 1.18, (0.42, 0.46), (0.58, 0.46), False),
                 (1.25, 1.0, (0.55, 0.45), (0.5, 0.46), False)]
FADED = {"01_valley", "02_farmhouse", "03_quarry", "04_handshake", "05_silence", "05b_photo", "06_boardroom", "13_unenforced",
         "18_adjourned", "20_postbox", "21_rejects", "23_register", "24_candle", "28_title"}


def has(shot, *words):
    t = (shot["prompt"] + " " + shot["id"]).lower()
    return any(w in t for w in words)


def soft_noise(w, h, cells, seed):
    g = np.random.default_rng(seed).random((cells[1], cells[0])).astype(np.float32)
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(20))
    return np.asarray(im).astype(np.float32) / 255





def kb_frames(shot, idx, n):
    """Animate the still with a camera move and atmosphere (rain, dust, fog, flicker, handheld)."""
    im = Image.open(os.path.join(HERE, "stills", f"{shot['id']}.png")).convert("RGB")
    IW, IH = im.size
    z0, z1, (cx0, cy0), (cx1, cy1), hand = MOVES.get(shot["id"], DEFAULT_MOVES[idx % 3])
    g = np.random.default_rng(100 + idx)
    fog = soft_noise(1800, VIS_H + 40, (9, 4), 7 + idx) if has(shot, "mist", "fog", "smoke", "steam") else None
    motes = g.random((70, 4)) if has(shot, "dust", "sunbeam", "light", "archive", "smoke") else None
    rain = has(shot, "rain")
    flick = has(shot, "candle", "fire", "lamp", "flame", "lit by a desk")
    for k in range(n):
        p = k / max(n - 1, 1)
        e = 0.65 * p + 0.35 * p * p * (3 - 2 * p)
        z = z0 + (z1 - z0) * e
        if shot["id"] == "22_trap" and k / FPS > TRAP_SNAP:  # the lock clicks shut: hard punch-in
            z *= 1 + 0.10 * min(1.0, (k / FPS - TRAP_SNAP) / 0.06)
        cx, cy = cx0 + (cx1 - cx0) * e, cy0 + (cy1 - cy0) * e
        cw = IW / z
        ch = cw * VIS_H / W
        dx = dy = 0.0
        if hand:
            dx = 9 * math.sin(k * 0.21) + 5 * math.sin(k * 0.53 + 1)
            dy = 7 * math.sin(k * 0.17 + 2) + 4 * math.sin(k * 0.47)
        x0 = min(max(cx * IW - cw / 2 + dx, 0), IW - cw)
        y0 = min(max(cy * IH - ch / 2 + dy, 0), IH - ch)
        vis = np.asarray(im.resize((W, VIS_H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))).astype(np.float32)
        if fog is not None:
            off = int(p * 120)
            vis += fog[20:20 + VIS_H, off:off + W, None] * np.array([62, 66, 72], np.float32) * 0.55
        layer = None
        if rain or motes is not None:
            layer = Image.new("L", (W, VIS_H), 0)
            d = ImageDraw.Draw(layer)
            if rain:
                r = np.random.default_rng(5000 + k)
                for _ in range(90):
                    x, y = r.integers(0, W), r.integers(0, VIS_H)
                    L = int(r.integers(14, 34))
                    d.line([(x, y), (x - L * 0.12, y + L)], fill=int(r.integers(40, 95)), width=1)
            if motes is not None:
                for m in motes:
                    mx = (m[0] * W + p * 40 * (m[2] - 0.5) * 6 + k * 0.3 * (m[3] - 0.5)) % W
                    my = (m[1] * VIS_H - p * 70 * (0.3 + m[2])) % VIS_H
                    rr = 1 + 2.2 * m[3]
                    d.ellipse((mx - rr, my - rr, mx + rr, my + rr), fill=int(60 + 120 * m[2]))
            layer = layer.filter(ImageFilter.GaussianBlur(0.7))
            vis += np.asarray(layer).astype(np.float32)[..., None] * np.array([1.0, 0.97, 0.9], np.float32)
        if flick:
            vis *= 1 + 0.06 * math.sin(k * 0.9) * math.sin(k * 0.37 + 1) + 0.03 * math.sin(k * 2.3)
        out = np.zeros((H, W, 3), np.uint8)
        out[BAR:H - BAR] = np.clip(vis, 0, 255).astype(np.uint8)
        yield out


def finish(arr, t, i):
    arr = arr.astype(np.float32)
    lum = arr.mean(2, keepdims=True) / 255
    arr = arr * (np.array([0.82, 1.0, 1.08]) * (1 - lum) + np.array([1.1, 1.0, 0.85]) * lum)
    arr = (arr - 128) * 1.1 + 128
    e = hit_energy(t)
    if e > 0.02:
        dx, dy = rng.normal(0, 12 * e, 2).astype(int)
        arr = np.roll(arr, (dy, dx), (0, 1))
        s = int(7 * e)
        if s:
            arr[..., 0] = np.roll(arr[..., 0], s, 1)
            arr[..., 2] = np.roll(arr[..., 2], -s, 1)
        arr += 255 * max(0, e - 0.55)
    arr = arr * VIG + GRAIN[i % 6]
    arr[:BAR] = 0
    arr[H - BAR:] = 0
    return np.clip(arr, 0, 255).astype(np.uint8)


def overlay(img, shot, lt, d):
    im = Image.fromarray(img).convert("RGBA")
    fade = min(ease(lt / 0.2), ease((d - lt) / 0.2))
    if shot["year"]:
        a = min(ease(lt / 0.08), ease((d - 0.4 - lt) / 0.4)) if lt < d - 0.4 else 0
        text(im, shot["year"], H - BAR - 80, 84, BEBAS, a, (250, 240, 220), track=10, glow=12)
    if shot["id"] == "25_verdict":
        text(im, "“…WHETHER OR NOT SHE ACCEPTED THEM.”", BAR + 80, 44, BEBAS,
             ease((lt - 3.5) / 0.3), (255, 120, 100), track=3, glow=8)
    if shot["id"] == "22_trap":
        text(im, "SHE NEVER SAID YES.", H / 2, 72, BEBAS, ease((lt - 1.2) / 0.2) * ease((d - lt) / 0.3),
             (255, 235, 210), track=8, glow=14)
    label(im, shot["label"], fade)
    return np.asarray(im.convert("RGB"))


def card(t, kind):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    if kind == "title":
        text(im, TITLE, H / 2 - 40, 150, CINZEL, min(1, ease(t / 0.05), ease((TITLE_LEN - t) / 1.0)),
             (240, 225, 195), track=26, glow=26, weight="Black")
        text(im, TAGLINE, H / 2 + 90, 36, OSWALD, ease((t - 1.4) / 0.8) * ease((TITLE_LEN - t) / 1.0),
             (215, 195, 160), track=10, weight="Light")
    else:
        a = min(ease(t / 0.6), ease((END_LEN - t) / 1.2))
        text(im, END_LINES[0], H / 2 - 60, 42, OSWALD, a, (255, 225, 175), weight="Regular")
        for k, s in enumerate(END_LINES[1:]):
            text(im, s, H / 2 + 20 + k * 28, 18, OSWALD, a * 0.85, (160, 155, 145), weight="Light")
    return np.asarray(im.convert("RGB"))


# ------------------------------------------------------------------ audio

def audio():
    n = int((TOTAL + 1) * SR)
    tt = np.arange(n) / SR
    music = np.zeros(n)
    vo = np.zeros(n)

    def add(buf, t0, sig):
        i0 = int(t0 * SR)
        m = min(len(sig), n - i0)
        if m > 0:
            buf[i0:i0 + m] += sig[:m]

    pad = sum(np.sin(2 * np.pi * f * dt * tt + 0.4 * np.sin(2 * np.pi * 0.09 * tt))
              for f in (55.0, 65.41, 82.41, 110.0) for dt in (0.997, 1.003))
    music += 0.045 * pad * np.clip(tt / 8, 0, 1)
    # driving pulse, faster through each act
    def T(sid):
        return next(st for st, d, sh in timeline if sh["id"] == sid)

    acts = [(T("06_boardroom"), T("19_letter"), 96), (T("19_letter"), T("23_register"), 0),
            (T("23_register"), TITLE_AT - 1.5, 118)]
    for a0, a1, bpm in acts:
        if not bpm:
            continue
        step = 60 / bpm / 4
        for j, b in enumerate(np.arange(a0, a1, step)):
            if j % 16 in (1, 4, 9, 12):
                continue
            s = np.arange(int(step * 0.9 * SR)) / SR
            f = [55.0, 55.0, 65.4, 49.0][(j // 16) % 4]
            add(music, b, 0.15 * np.exp(-s * 14) * (np.sign(np.sin(2 * np.pi * f * s)) * 0.4 +
                                                     np.sin(4 * np.pi * f * s) * 0.4))
    # ticking clock under the gotcha
    for b in np.arange(T("19_letter"), T("23_register"), 0.5):
        s = np.arange(int(0.03 * SR)) / SR
        add(music, b, 0.25 * np.sin(2 * np.pi * 2400 * s) * np.exp(-s * 160))
    # hits and braams
    for h, big in HITS:
        L = 3.4 if big else 0.8
        s = np.arange(int(L * SR)) / SR
        if big:
            sig = sum(np.sign(np.sin(2 * np.pi * f * s)) * 0.3 + np.sin(2 * np.pi * f * 1.004 * s) * 0.6
                      for f in (32.7, 49.0, 65.4, 98.0))
            sig = np.tanh(sig) * np.minimum(s / 0.015, 1) * np.exp(-s / 1.1) * 0.6
        else:
            sig = (np.sin(2 * np.pi * (110 * np.exp(-s * 18) + 38) * s) * np.exp(-s * 7) +
                   0.3 * rng.normal(0, 1, len(s)) * np.exp(-s * 40)) * 0.55
        add(music, h, sig)
        w = np.arange(int(0.6 * SR)) / SR
        add(music, h - 0.6, 0.1 * (w / 0.6) ** 3 * np.diff(np.concatenate([[0], rng.normal(0, 1, len(w))])))
    # riser and silence before the title
    r0 = TITLE_AT - 3.0
    m = (tt >= r0) & (tt < TITLE_AT - 0.4)
    p = (tt[m] - r0) / 2.6
    music[m] += 0.2 * p ** 2 * (np.sin(2 * np.pi * (180 + 900 * p ** 2) * tt[m]) + 0.4 * rng.normal(0, 1, m.sum()))
    music[(tt > TITLE_AT - 0.4) & (tt < TITLE_AT)] *= 0.03
    # narration
    for st, d, s in timeline + [(TITLE_AT + 1.2, 0, {"id": "99_title"})]:
        p = os.path.join(HERE, "vo", f"{s['id']}.wav")
        if os.path.exists(p):
            a, sr = sf.read(p)
            if sr != SR:
                a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a)
            add(vo, st + 0.3, a * 1.1)
    # duck the score under the voice
    env = np.convolve(np.abs(vo), np.ones(SR // 5) / (SR // 5), mode="same")
    music *= 1 - 0.6 * np.clip(env * 12, 0, 1)
    out = music + vo
    out *= np.clip((TOTAL - tt) / 5, 0, 1)
    out = np.tanh(out * 1.2)
    out = out / (np.abs(out).max() + 1e-9) * 0.9
    st = np.stack([out, np.roll(out, 90)], 1)
    with wave.open(f"{TMP}/mix.wav", "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def main():
    missing = [s["id"] for s in SHOTS if not os.path.exists(os.path.join(HERE, "stills", f"{s['id']}.png"))]
    if missing:
        sys.exit(f"missing stills: {', '.join(missing)} — run local_stills.py first")
    print(f"length {TOTAL:.1f}s")
    audio()
    out = os.path.join(HERE, "parcel-a-hollywood-trailer.mp4")
    common = [FFMPEG, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
              "-r", str(FPS), "-i", "-", "-i", f"{TMP}/mix.wav"]
    encs = [subprocess.Popen(common + ["-c:v", "libx264", "-preset", "slow", "-b:v", "2600k", "-maxrate", "3600k",
                                       "-bufsize", "7000k", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                                       "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE),
            # WebM: VP9 + Opus from the same frames, so it is not a re-encode of the MP4
            subprocess.Popen(common + ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "31", "-row-mt", "1",
                                       "-deadline", "good", "-cpu-used", "3", "-pix_fmt", "yuv420p",
                                       "-c:a", "libopus", "-b:a", "128k", "-shortest",
                                       out.replace(".mp4", ".webm")], stdin=subprocess.PIPE)]

    class _Both:
        def write(self, buf):
            for e in encs:
                e.stdin.write(buf)

    enc = type("Enc", (), {"stdin": _Both()})()
    i = 0
    for _ in range(int(COLD * FPS)):
        enc.stdin.write(finish(np.zeros((H, W, 3), np.uint8), i / FPS, i).tobytes())
        i += 1
    for si, (st, d, s) in enumerate(timeline):
        n = int(round((st + d) * FPS)) - i
        for k, fr in enumerate(kb_frames(s, si, n)):
            if s["id"] in FADED:
                a = min(ease(k / FPS / 0.3), ease((d - k / FPS) / 0.3))
                fr = (fr.astype(np.float32) * a).astype(np.uint8)
            enc.stdin.write(finish(overlay(fr, s, k / FPS, d), i / FPS, i).tobytes())
            i += 1
        print(f"  {s['id']}", flush=True)
    for kind, L in (("title", TITLE_LEN), ("end", END_LEN)):
        for k in range(int(L * FPS)):
            enc.stdin.write(finish(card(k / FPS, kind), i / FPS, i).tobytes())
            i += 1
    for e in encs:
        e.stdin.close()
    for e in encs:
        e.wait()
    print("wrote", out, "and", out.replace(".mp4", ".webm"))


if __name__ == "__main__":
    main()
