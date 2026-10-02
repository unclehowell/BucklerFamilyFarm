"""Drone fly-around of the farm in woodland, with a Welsh and an Argentine flag.

A photoreal aerial view (aerial_stills.py) is lifted into 3D with a depth map (prep_scene.py) and the camera is flown
around it with true parallax. Flags, chimney smoke, birds and mist are rendered on top in the same 3D camera.

    python3 trailer/drone/make_drone.py            # 10 s clip -> great-house-farm-drone.mp4 / .webm
    python3 trailer/drone/make_drone.py --preview  # a few frames -> .build/preview.png
"""
import math
import os
import subprocess
import sys
import wave

import cv2
import imageio_ffmpeg
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
BUILD = os.path.join(HERE, ".build")
ASSETS = os.path.join(os.path.dirname(HERE), "assets")
os.makedirs(BUILD, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

Wo, Ho, FPS, SR, DUR = 1280, 720, 25, 44100, 10.0
Ws, Hs = 1920, 1097
FOV, ZOOM = 62.0, 1.22
F_S = 0.5 * Ws / math.tan(math.radians(FOV / 2))
F_O = F_S * (Wo / Ws) * ZOOM
CXS, CYS, CXO, CYO = Ws / 2, Hs / 2, Wo / 2, Ho / 2
ZNEAR, ZFAR = 50.0, 260.0
PREV = 1.5  # preview-grid coordinates (1280 wide) -> source pixels

src = cv2.resize(cv2.imread(os.path.join(CACHE, "aerial_up.png")), (Ws, Hs), interpolation=cv2.INTER_AREA)
dep = cv2.GaussianBlur(cv2.resize(np.load(os.path.join(CACHE, "aerial_depth.npy")), (Ws, Hs)).astype(np.float32), (0, 0), 4)
Zmap = (1.0 / (1.0 / ZFAR + dep * (1.0 / ZNEAR - 1.0 / ZFAR))).astype(np.float32)
ZC = float(Zmap[int(420 * PREV), int(800 * PREV)])  # the camera orbits the farm buildings

uo, vo = np.meshgrid(np.arange(Wo, dtype=np.float32), np.arange(Ho, dtype=np.float32))
su0 = (uo - CXO) * F_S / F_O + CXS
sv0 = (vo - CYO) * F_S / F_O + CYS


def smooth(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def camera(t):
    """t in seconds. A slow, rising orbit around the farm with a touch of hand-held drift."""
    p = t / DUR
    e = smooth(p) * 0.85 + p * 0.15
    return dict(th=math.radians(-10.5 + 21 * e + 0.2 * math.sin(t * 1.7)), rise=2.5 * e + 0.12 * math.sin(t * 2.3),
                push=9.0 * e, dx=0.12 * math.sin(t * 1.3))


def xform(X, Y, Z, cam):
    c, s = math.cos(cam["th"]), math.sin(cam["th"])
    X1 = c * X + s * (Z - ZC) - cam["dx"]
    Z1 = -s * X + c * (Z - ZC) + ZC - cam["push"]
    return X1, Y + cam["rise"], Z1


def proj(P, cam):
    X1, Y1, Z1 = xform(P[0], P[1], P[2], cam)
    return F_O * X1 / Z1 + CXO, F_O * Y1 / Z1 + CYO, Z1


def anchor(pu, pv):
    """Source-image point (preview coords) -> 3D point on the surface seen there."""
    su, sv = pu * PREV, pv * PREV
    Z = float(Zmap[int(sv), int(su)])
    return np.array([(su - CXS) / F_S * Z, (sv - CYS) / F_S * Z, Z], np.float64)


def warp(cam):
    su, sv = su0.copy(), sv0.copy()
    for _ in range(6):  # fixed-point inverse of the depth-based reprojection
        Z = cv2.remap(Zmap, su, sv, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        X1, Y1, Z1 = xform((su - CXS) / F_S * Z, (sv - CYS) / F_S * Z, Z, cam)
        su = su + (uo - (F_O * X1 / Z1 + CXO)) * (F_S / F_O)
        sv = sv + (vo - (F_O * Y1 / Z1 + CYO)) * (F_S / F_O)
    su, sv = np.clip(su, 0, Ws - 1), np.clip(sv, 0, Hs - 1)
    img = cv2.remap(src, su, sv, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    return img, cv2.remap(dep, su, sv, cv2.INTER_LINEAR)


# ---------------------------------------------------------------- scene dressing (all in the same 3D camera)

def load_tex(name):
    t = cv2.imread(os.path.join(ASSETS, name), cv2.IMREAD_COLOR)
    return cv2.resize(t, (252, 189), interpolation=cv2.INTER_AREA)


TEX = [load_tex("flag-wales.png"), load_tex("flag-argentina.png")]
POLE_BASE = anchor(455, 560)  # open ground in the foreground
POLE_H, FW, FH, NC = 9.5, 4.8, 3.6, 28
CHIMNEYS = [anchor(390, 302), anchor(850, 318), anchor(1050, 252)]


def draw_flags(frame, t, cam):
    for k, tex in enumerate(TEX):
        B = POLE_BASE + np.array([2.5 * k, 0, 0])
        T = B + np.array([0, -POLE_H, 0])
        bx, by, bz = proj(B, cam)
        tx, ty, _ = proj(T, cam)
        ppm = F_O / bz
        cv2.ellipse(frame, (int(bx), int(by)), (int(ppm * 0.5), int(ppm * 0.18)), 0, 0, 360, (20, 25, 20), -1, cv2.LINE_AA)
        cv2.line(frame, (int(bx), int(by)), (int(tx), int(ty)), (205, 208, 205), max(2, int(ppm * 0.16)), cv2.LINE_AA)
        cv2.circle(frame, (int(tx), int(ty) - 2), max(2, int(ppm * 0.14)), (80, 200, 235), -1, cv2.LINE_AA)  # gilt finial
        A = T + np.array([0.12, 0.25, 0])
        tops, bots, phs = [], [], []
        for i in range(NC + 1):
            u = i / NC
            ph = 2 * math.pi * (1.6 * u - 1.25 * t) + k * 0.9
            top = A + np.array([u * FW, 0.18 * u * FH + 0.10 * u * math.sin(ph + 1.2), 0.55 * u * math.sin(ph)])
            bot = top + np.array([0, FH * (1 - 0.04 * u), 0.07 * u * math.sin(ph + 0.4)])
            tops.append(proj(top, cam)[:2])
            bots.append(proj(bot, cam)[:2])
            phs.append(ph)
        allp = np.array(tops + bots)
        x0, y0 = np.floor(allp.min(0) - 6).astype(int)
        x1, y1 = np.ceil(allp.max(0) + 6).astype(int)
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, Wo), min(y1, Ho)
        if x1 <= x0 or y1 <= y0:
            continue
        roi = frame[y0:y1, x0:x1]
        th_, tw_ = tex.shape[:2]
        for i in range(NC):
            q = np.array([tops[i], tops[i + 1], bots[i + 1], bots[i]], np.float32) - np.array([x0, y0], np.float32)
            sx0, sx1 = i * tw_ / NC, (i + 1) * tw_ / NC
            M = cv2.getAffineTransform(np.float32([[sx0, 0], [sx1, 0], [sx0, th_]]), q[[0, 1, 3]])
            w = cv2.warpAffine(tex, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            shade = 0.80 + 0.24 * math.cos(phs[i] + 0.8)
            mask = np.zeros((y1 - y0, x1 - x0), np.uint8)
            cv2.fillConvexPoly(mask, np.round(q).astype(np.int32), 255)
            mask = cv2.dilate(mask, np.ones((3, 3), np.uint8)).astype(np.float32)[..., None] / 255
            roi[:] = roi * (1 - mask) + w.astype(np.float32) * shade * mask


def draw_smoke(frame, t, cam):
    layer = np.zeros((Ho, Wo), np.float32)
    for ci, B in enumerate(CHIMNEYS):
        for k in range(34):
            age = (t / 6.5 + k / 34 + ci * 0.31) % 1.0
            life = age * 6.5
            P = B + np.array([0.9 * life + 0.5 * math.sin(life * 1.7 + k), -1.1 * life, 0.4 * math.sin(life + k * 2.0)])
            x, y, z = proj(P, cam)
            r = (0.45 + 2.6 * age) * F_O / z
            cv2.circle(layer, (int(x), int(y)), max(1, int(r)), 0.20 * (1 - age) * min(1.0, age * 9), -1, cv2.LINE_AA)
    layer = cv2.GaussianBlur(layer, (0, 0), 5)[..., None]
    frame[:] = frame * (1 - layer) + np.array([208, 210, 212], np.float32) * layer


_rng = np.random.default_rng(5)
BIRDS = [(_rng.uniform(-45, 45), _rng.uniform(-38, -14), _rng.uniform(55, 120), _rng.uniform(2.5, 4.5),
          _rng.uniform(0, 6.28)) for _ in range(7)]


def draw_birds(frame, t, cam):
    for x0, y0, z0, vx, ph in BIRDS:
        P = np.array([((x0 + vx * t + 60) % 120) - 60, y0 + 1.5 * math.sin(t * 0.8 + ph), z0])
        x, y, z = proj(P, cam)
        s = 0.55 * F_O / z
        flap = math.sin(2 * math.pi * 3.2 * t + ph)
        cv2.line(frame, (int(x), int(y)), (int(x - s * 2), int(y - s * (0.6 + 0.9 * flap))), (30, 30, 36), 1, cv2.LINE_AA)
        cv2.line(frame, (int(x), int(y)), (int(x + s * 2), int(y - s * (0.6 + 0.9 * flap))), (30, 30, 36), 1, cv2.LINE_AA)


def soft_noise(w, h, cells, seed):
    g = np.random.default_rng(seed).random((cells[1], cells[0])).astype(np.float32)
    return cv2.GaussianBlur(cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC), (0, 0), 25)


FOGTEX = soft_noise(1800, 900, (10, 5), 11)
yy, xx = np.mgrid[0:Ho, 0:Wo]
VIG = np.clip(1.12 - 0.34 * (((xx - Wo / 2) / (Wo / 2)) ** 2 + ((yy - Ho / 2) / (Ho / 2)) ** 2), 0.25, 1)[..., None].astype(np.float32)
GRAIN = [np.random.default_rng(i).normal(0, 6, (Ho, Wo, 1)).astype(np.float32) for i in range(6)]


def frame_at(i):
    t = i / FPS
    cam = camera(t)
    img, d = warp(cam)
    # aerial perspective: distant woodland sinks into mist, drifting slowly
    off = int(t * 22)
    fog = FOGTEX[40:40 + Ho, off:off + Wo]
    amt = ((1 - d) ** 1.6 * 0.30 + fog * 0.10)[..., None]
    img = img * (1 - amt) + np.array([188, 176, 160], np.float32) * amt
    draw_smoke(img, t, cam)
    draw_birds(img, t, cam)
    draw_flags(img, t, cam)
    # grade: lift the exposure, teal shadows / amber highlights, vignette, grain
    img = 255 * np.clip(img / 255, 0, 1) ** 0.78 * 1.10
    lum = img.mean(2, keepdims=True) / 255
    img = img * (np.array([0.93, 1.0, 1.06]) * (1 - lum) + np.array([1.07, 1.0, 0.92]) * lum)
    img = img * VIG + GRAIN[i % 6]
    fade = min(smooth(t / 0.7), smooth((DUR - t) / 0.9))
    return np.clip(img * fade, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------- sound: wind, rotors, birdsong, a soft pad

def audio():
    n = int((DUR + 0.5) * SR)
    tt = np.arange(n) / SR
    rng = np.random.default_rng(9)
    spec = np.fft.rfft(rng.normal(0, 1, n))
    f = np.fft.rfftfreq(n, 1 / SR)
    wind = np.fft.irfft(spec * np.exp(-f / 380.0) * (f > 40), n)
    wind *= 0.55 + 0.45 * np.sin(2 * np.pi * 0.17 * tt + 1) ** 2
    wind /= np.abs(wind).max()
    rotor = sum(np.sin(2 * np.pi * 96 * h * tt + 0.3 * h) / h for h in (1, 2, 3, 4)) * (0.7 + 0.3 * np.sin(2 * np.pi * 7.3 * tt))
    pad = sum(np.sin(2 * np.pi * fr * d * tt) for fr in (73.4, 110.0, 146.8, 220.0) for d in (0.997, 1.003))
    birds = np.zeros(n)
    for t0 in rng.uniform(0.4, DUR - 0.8, 14):
        m = int(rng.uniform(0.08, 0.2) * SR)
        s = np.arange(m) / SR
        fr = rng.uniform(2300, 3700) + rng.uniform(600, 1500) * s / s[-1]
        i0 = int(t0 * SR)
        birds[i0:i0 + m] += 0.10 * np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * s / s[-1]) ** 2
    out = 0.55 * wind + 0.05 * rotor + 0.012 * pad + birds
    out *= np.clip(tt / 0.8, 0, 1) * np.clip((DUR + 0.5 - tt) / 1.0, 0, 1)
    out = np.tanh(out * 1.3) / np.abs(np.tanh(out * 1.3)).max() * 0.85
    st = np.stack([out, np.roll(out, 60)], 1)
    with wave.open(os.path.join(BUILD, "drone.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def main():
    if "--preview" in sys.argv:
        ts = [0, 2.5, 5, 7.5, 9.5, 9.9]
        ims = [frame_at(int(t * FPS)) for t in ts]
        c = np.zeros((Ho * 3, Wo * 2, 3), np.uint8)
        for k, im in enumerate(ims):
            c[(k // 2) * Ho:(k // 2 + 1) * Ho, (k % 2) * Wo:(k % 2 + 1) * Wo] = im
        cv2.imwrite(os.path.join(BUILD, "preview.png"), cv2.resize(c, (Wo, Ho * 3 // 2)))
        print("preview written", flush=True)
        return
    audio()
    out = os.path.join(HERE, "great-house-farm-drone.mp4")
    common = [FFMPEG, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{Wo}x{Ho}",
              "-r", str(FPS), "-i", "-", "-i", os.path.join(BUILD, "drone.wav")]
    encs = [subprocess.Popen(common + ["-c:v", "libx264", "-preset", "slow", "-b:v", "3500k", "-maxrate", "4500k", "-bufsize", "9000k", "-pix_fmt", "yuv420p",
                                       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out],
                             stdin=subprocess.PIPE),
            subprocess.Popen(common + ["-c:v", "libvpx-vp9", "-b:v", "3000k", "-maxrate", "4000k", "-row-mt", "1",
                                       "-deadline", "good", "-cpu-used", "3", "-pix_fmt", "yuv420p", "-c:a", "libopus",
                                       "-b:a", "128k", "-shortest", out.replace(".mp4", ".webm")],
                             stdin=subprocess.PIPE)]
    n = int(DUR * FPS)
    for i in range(n):
        buf = frame_at(i).tobytes()
        for e in encs:
            e.stdin.write(buf)
        if i % 25 == 0:
            print(f"  {i}/{n}", flush=True)
    for e in encs:
        e.stdin.close()
    for e in encs:
        e.wait()
    print("wrote", out)


if __name__ == "__main__":
    main()
