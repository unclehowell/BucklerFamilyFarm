"""Restore the family's two real photographs and compose them as 1920x1080 stills for the trailer.

  assets/family-photo-crowd.jpg            -> stills/05b_photo.png   (the 1928 scene)
  assets/family-photo-mary-wheelchair.jpg  -> stills/07_hospital.png (the 1955 scene)

Restoration: crop away the photographed border, correct the colour cast, denoise, local-contrast (CLAHE),
upscale and sharpen. The print is then laid on a darkened, blurred copy of itself so the camera can push in.

    python3 trailer/hollywood/prepare_photos.py
"""
import os

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), "assets")
OUT = os.path.join(HERE, "stills")
os.makedirs(OUT, exist_ok=True)


def to_cv(im):
    return cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)


def to_pil(a):
    return Image.fromarray(cv2.cvtColor(a, cv2.COLOR_BGR2RGB))


def white_balance(a, strength=0.75, lo=0.5, hi=99.5):
    """Pull each channel towards the grey mean, then stretch levels per channel."""
    f = a.astype(np.float32)
    means = f.reshape(-1, 3).mean(0)
    f *= (1 - strength) + strength * (means.mean() / means)
    for c in range(3):
        l, h = np.percentile(f[..., c], (lo, hi))
        f[..., c] = (f[..., c] - l) * 255 / max(h - l, 1)
    return np.clip(f, 0, 255).astype(np.uint8)


def clahe(a, clip=2.0):
    lab = cv2.cvtColor(a, cv2.COLOR_BGR2LAB)
    lab[..., 0] = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8)).apply(lab[..., 0])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def unsharp(a, sigma=2.0, amount=0.8):
    blur = cv2.GaussianBlur(a, (0, 0), sigma)
    return cv2.addWeighted(a, 1 + amount, blur, -amount, 0)


def saturate(a, k):
    hsv = cv2.cvtColor(a, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * k, 0, 255)
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)


def compose(print_im, height=1000, border=6):
    """Lay the print on a darkened, blurred copy of itself at 1920x1080."""
    bg = ImageOps.fit(print_im, (1920, 1080), Image.LANCZOS).filter(ImageFilter.GaussianBlur(38))
    bg = Image.eval(bg, lambda v: int(v * 0.28))
    w = round(print_im.width * height / print_im.height)
    p = print_im.resize((w, height), Image.LANCZOS)
    framed = ImageOps.expand(p, border=border, fill=(238, 232, 218))
    x, y = (1920 - framed.width) // 2, (1080 - framed.height) // 2
    shadow = Image.new("L", (1920, 1080), 0)
    shadow.paste(190, (x + 16, y + 20, x + framed.width + 16, y + framed.height + 20))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    bg.paste((0, 0, 0), (0, 0), shadow)
    bg.paste(framed, (x, y))
    return bg


def gentle_balance(a, strength=0.55):
    """Colour-cast correction by channel gain only, then a luminance-only levels stretch (no colour blow-out)."""
    f = a.astype(np.float32)
    means = f.reshape(-1, 3).mean(0)
    f = np.clip(f * ((1 - strength) + strength * (means.mean() / means)), 0, 255).astype(np.uint8)
    lab = cv2.cvtColor(f, cv2.COLOR_BGR2LAB)
    l = lab[..., 0].astype(np.float32)
    lo, hi = np.percentile(l, (1, 99.5))
    lab[..., 0] = np.clip((l - lo) * 255 / max(hi - lo, 1), 0, 255).astype(np.uint8)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def mary():
    im = ImageOps.exif_transpose(Image.open(os.path.join(ASSETS, "family-photo-mary-wheelchair.jpg")))
    im = im.crop((60, 530, 2990, 3880))  # inside the print, clear of the cream border and rounded corners
    im.thumbnail((2000, 2400), Image.LANCZOS)
    a = to_cv(im)
    a = gentle_balance(a, 0.55)
    a = cv2.fastNlMeansDenoisingColored(a, None, 3, 3, 7, 21)
    a = clahe(a, 1.2)
    a = unsharp(a, 2.0, 0.7)
    return to_pil(a)


def crowd():
    im = Image.open(os.path.join(ASSETS, "family-photo-crowd.jpg"))
    a = to_cv(im)
    a = cv2.fastNlMeansDenoisingColored(a, None, 3, 3, 5, 15)
    a = cv2.resize(a, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
    a = cv2.fastNlMeansDenoisingColored(a, None, 4, 4, 7, 21)
    a = clahe(a, 2.2)
    a = unsharp(a, 3.0, 1.0)
    return to_pil(a)


def main():
    m = mary()
    m.save(os.path.join(ASSETS, "family-photo-mary-wheelchair-enhanced.png"))
    compose(m).save(os.path.join(OUT, "07_hospital.png"))
    c = crowd()
    c.save(os.path.join(ASSETS, "family-photo-crowd-enhanced.png"))
    compose(c).save(os.path.join(OUT, "05b_photo.png"))
    print("done")


if __name__ == "__main__":
    main()
