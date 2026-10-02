"""AI-restore the family's two real photographs and build the trailer stills that use them.

Restoration (all local, CPU, open models):
  1. crop the print out of the phone photo, colour-cast correction, grain removal
  2. Real-ESRGAN x4plus upscale (tiled)
  3. blended 65/35 with a plain bicubic upscale so skin keeps a natural, photographic softness
  4. gentle local contrast
No generative face restoration is used: it was tried and invented details (it drew glasses on Mary), so her
face is only ever cleaned and upscaled, never reconstructed.

Stills written to stills/:
  05b_photo      the crowd photograph (after the 1928 scene)
  07_hospital    Mary's photograph, WHOLE print incl. wheelchair, push in            (1955)
  11_refuse1959  close-up of her face                                                (1959 refusal)
  14_offer1965   starts on her clasped hands, pulls back to the whole print          (1965 offer)
  15_unsigned    pan from the climbing rose down to her                              (never signed)
  17_newspaper   her photograph beside the real 1974 press clipping                  (1974 press)
  21_rejects     lamp-lit close-up                                                   (she writes back)

    python3 trailer/hollywood/prepare_photos.py
"""
import os

import cv2
import numpy as np
import torch
from huggingface_hub import hf_hub_download
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from spandrel import ModelLoader

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), "assets")
OUT = os.path.join(HERE, "stills")
CACHE = os.path.join(HERE, ".cache")
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)
torch.set_num_threads(os.cpu_count() or 4)

AI_WEIGHT = 0.4  # share of the Real-ESRGAN result in the blend with a plain upscale


def to_cv(im):
    return cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2BGR)


def to_pil(a):
    return Image.fromarray(cv2.cvtColor(a, cv2.COLOR_BGR2RGB))


def gentle_balance(a, strength=0.55):
    """Colour-cast correction by channel gain only, then a luminance-only levels stretch."""
    f = a.astype(np.float32)
    means = f.reshape(-1, 3).mean(0)
    f = np.clip(f * ((1 - strength) + strength * (means.mean() / means)), 0, 255).astype(np.uint8)
    lab = cv2.cvtColor(f, cv2.COLOR_BGR2LAB)
    l = lab[..., 0].astype(np.float32)
    lo, hi = np.percentile(l, (1, 99.5))
    lab[..., 0] = np.clip((l - lo) * 255 / max(hi - lo, 1), 0, 255).astype(np.uint8)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def clahe(a, clip=1.5):
    lab = cv2.cvtColor(a, cv2.COLOR_BGR2LAB)
    lab[..., 0] = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8)).apply(lab[..., 0])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def unsharp(a, sigma=2.0, amount=0.6):
    return cv2.addWeighted(a, 1 + amount, cv2.GaussianBlur(a, (0, 0), sigma), -amount, 0)


_models = {}


def model(name):
    if name not in _models:
        p = hf_hub_download("Comfy-Org/Real-ESRGAN_repackaged", "RealESRGAN_x4plus.safetensors", local_dir=CACHE)
        m = ModelLoader().load_from_file(p)
        m.eval()
        _models[name] = m
    return _models[name]


def esrgan_x4(rgb, tile=192, pad=16):
    """Tiled Real-ESRGAN x4 on an RGB uint8 array."""
    m = model("esrgan")
    h, w, _ = rgb.shape
    x = torch.from_numpy(np.pad(rgb, ((pad, pad), (pad, pad), (0, 0)), mode="reflect")).permute(2, 0, 1)[None].float() / 255
    core = tile - 2 * pad
    out = np.zeros((h * 4, w * 4, 3), np.float32)
    ys, xs = list(range(0, h, core)), list(range(0, w, core))
    n = 0
    for y0 in ys:
        for x0 in xs:
            t = x[:, :, y0:y0 + tile, x0:x0 + tile]
            with torch.no_grad():
                y = m(t)[0].permute(1, 2, 0).numpy()
            ch, cw = min(core, h - y0), min(core, w - x0)
            out[y0 * 4:(y0 + ch) * 4, x0 * 4:(x0 + cw) * 4] = y[pad * 4:(pad + ch) * 4, pad * 4:(pad + cw) * 4]
            n += 1
        print(f"    esrgan {n}/{len(ys) * len(xs)}", flush=True)
    return np.clip(out * 255, 0, 255).astype(np.uint8)


def mary_restored():
    cache = os.path.join(CACHE, "mary_restored.png")
    if os.path.exists(cache):
        return Image.open(cache).convert("RGB")
    im = ImageOps.exif_transpose(Image.open(os.path.join(ASSETS, "family-photo-mary-wheelchair.jpg")))
    im = im.crop((60, 530, 2990, 3880))  # inside the print, clear of the cream border and rounded corners
    a = np.asarray(im.convert("RGB"))
    # the print has a woven surface texture: remove it at full resolution, before shrinking
    a = cv2.GaussianBlur(cv2.bilateralFilter(a, 15, 40, 9), (0, 0), 2.2)
    h = round(1000 * a.shape[0] / a.shape[1])
    a = cv2.resize(a, (1000, h), interpolation=cv2.INTER_AREA)
    a = cv2.fastNlMeansDenoisingColored(gentle_balance(cv2.cvtColor(a, cv2.COLOR_RGB2BGR), 0.55), None, 5, 5, 7, 21)
    rgb = cv2.cvtColor(a, cv2.COLOR_BGR2RGB)
    print("  Mary: Real-ESRGAN x4", flush=True)
    raw = os.path.join(CACHE, "mary_esrgan_raw.npy")
    if os.path.exists(raw):
        up = np.load(raw).astype(np.float32)
    else:
        up = esrgan_x4(rgb)
        np.save(raw, up)
        up = up.astype(np.float32)
    plain = cv2.resize(rgb, (1000 * 4, h * 4), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    out = np.clip(AI_WEIGHT * up + (1 - AI_WEIGHT) * plain, 0, 255).astype(np.uint8)
    a = unsharp(clahe(cv2.cvtColor(out, cv2.COLOR_RGB2BGR), 1.0), 2.5, 0.35)
    res = to_pil(a)
    res = res.resize((2000, round(2000 * res.height / res.width)), Image.LANCZOS)
    res.save(cache)
    return res


def crowd_restored():
    cache = os.path.join(CACHE, "crowd_restored.png")
    if os.path.exists(cache):
        return Image.open(cache).convert("RGB")
    a = cv2.fastNlMeansDenoisingColored(to_cv(Image.open(os.path.join(ASSETS, "family-photo-crowd.jpg"))),
                                        None, 3, 3, 5, 15)
    print("  crowd: Real-ESRGAN x4", flush=True)
    up = esrgan_x4(cv2.cvtColor(a, cv2.COLOR_BGR2RGB))
    a = unsharp(clahe(cv2.cvtColor(up, cv2.COLOR_RGB2BGR), 2.0), 2.5, 0.6)
    res = to_pil(a)
    res.save(cache)
    return res


# ------------------------------------------------------------------ compositions

def backdrop(print_im, dark=0.28):
    bg = ImageOps.fit(print_im, (1920, 1080), Image.LANCZOS).filter(ImageFilter.GaussianBlur(38))
    return Image.eval(bg, lambda v: int(v * dark))


def lay_print(bg, im, height, cx=960, border=6, shadow=True):
    w = round(im.width * height / im.height)
    framed = ImageOps.expand(im.resize((w, height), Image.LANCZOS), border=border, fill=(238, 232, 218))
    x, y = cx - framed.width // 2, (1080 - framed.height) // 2
    if shadow:
        sh = Image.new("L", (1920, 1080), 0)
        sh.paste(190, (x + 16, y + 20, x + framed.width + 16, y + framed.height + 20))
        bg.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(24)))
    bg.paste(framed, (x, y))
    return bg


def whole_print(print_im, height=836):
    """The entire photograph on a blurred backdrop. 836 px keeps top-to-bottom (wheelchair included) inside
    the 864 px visible band, so nothing of the photograph is cropped away at the start of the move."""
    return lay_print(backdrop(print_im), print_im, height)


def window(print_im, cx, cy, width_frac):
    """A 16:9 crop of the restored photograph, centred on (cx, cy) as fractions of the print."""
    W, H = print_im.size
    cw = width_frac * W
    ch = cw * 9 / 16
    x0 = min(max(cx * W - cw / 2, 0), W - cw)
    y0 = min(max(cy * H - ch / 2, 0), H - ch)
    return print_im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch))).resize((1920, 1080), Image.LANCZOS)


def shallow_dof(print_im, radius=15):
    """Soften the background like a fast lens: Mary (head, shoulders, body, chair) stays sharp, the plaster falls
    off. Used on the close-ups, where the wall texture is magnified the most."""
    W, H = print_im.size
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((0.38 * W, 0.355 * H, 0.62 * W, 0.53 * H), fill=255)  # head
    d.polygon([(0.30 * W, 0.50 * H), (0.70 * W, 0.50 * H), (0.80 * W, 0.78 * H), (0.78 * W, 1.0 * H),
               (0.22 * W, 1.0 * H), (0.20 * W, 0.78 * H)], fill=255)  # shoulders, body, chair
    m = m.filter(ImageFilter.GaussianBlur(0.035 * W))
    blurred = print_im.filter(ImageFilter.GaussianBlur(radius))
    return Image.composite(print_im, blurred, m)


def lamplit(im):
    """Night, one lamp to the left: warm, dark and heavily vignetted."""
    a = np.asarray(im).astype(np.float32)
    yy, xx = np.mgrid[0:1080, 0:1920]
    lamp = np.exp(-(((xx - 330) / 900) ** 2 + ((yy - 380) / 700) ** 2))[..., None]
    a = a * (0.18 + 0.95 * lamp) * np.array([1.12, 0.96, 0.78], np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def newspaper_scene(mary):
    bg = backdrop(mary, 0.22)
    lay_print(bg, mary, 760, cx=640)
    clip = Image.open(os.path.join(ASSETS, "news-open-day-to-save-ancient-welsh-house.jpg")).convert("RGB")
    clip = clip.crop((0, 0, clip.width, int(clip.height * 0.97)))
    clip = ImageEnhanceContrast(clip)
    w = round(clip.width * 860 / clip.height)
    c = clip.resize((w, 860), Image.LANCZOS).convert("RGBA").rotate(2.5, expand=True, resample=Image.BICUBIC)
    sh = Image.new("RGBA", c.size, (0, 0, 0, 0))
    sh.putalpha(c.getchannel("A").point(lambda v: int(v * 0.7)))
    bg.paste(sh.filter(ImageFilter.GaussianBlur(18)), (1290 - c.width // 2 + 14, 540 - c.height // 2 + 18),
             sh.filter(ImageFilter.GaussianBlur(18)))
    bg.paste(c, (1290 - c.width // 2, 540 - c.height // 2), c)
    return bg


def ImageEnhanceContrast(im):
    from PIL import ImageEnhance
    return ImageEnhance.Contrast(im).enhance(1.25)


def main():
    m = mary_restored()
    m.save(os.path.join(ASSETS, "family-photo-mary-wheelchair-restored.png"))
    c = crowd_restored()
    c.save(os.path.join(ASSETS, "family-photo-crowd-restored.png"))

    lay_print(backdrop(c), c, 1000).save(os.path.join(OUT, "05b_photo.png"))
    whole_print(m).save(os.path.join(OUT, "07_hospital.png"))
    window(shallow_dof(m), 0.50, 0.44, 0.92).save(os.path.join(OUT, "11_refuse1959.png"))
    whole_print(m).save(os.path.join(OUT, "14_offer1965.png"))
    whole_print(m).save(os.path.join(OUT, "15_unsigned.png"))
    newspaper_scene(m).save(os.path.join(OUT, "17_newspaper.png"))
    lamplit(window(shallow_dof(m), 0.48, 0.46, 0.80)).save(os.path.join(OUT, "21_rejects.png"))
    print("done")


if __name__ == "__main__":
    main()
