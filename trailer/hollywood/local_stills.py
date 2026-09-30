"""Generate one hyper-realistic still per shot in shots.py, locally on CPU (free, no key).

epiCRealism (photoreal SD1.5) + LCM-LoRA for 6-step sampling, then upscaled to 1920x1080.
Real archive photos are used instead of generated stills where REAL maps a shot id to a file.

    python3 trailer/hollywood/local_stills.py [shot_id ...] [--variant N]
Outputs stills/<id>.png (or stills/<id>_vN.png for variants).
"""
import os
import sys
import time

import torch
from diffusers import DiffusionPipeline, LCMScheduler
from PIL import Image, ImageFilter

from shots import SHOTS

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), "assets")
OUT = os.path.join(HERE, "stills")
os.makedirs(OUT, exist_ok=True)

BASE = os.environ.get("BASE_MODEL", "emilianJR/epiCRealism")
GEN_W, GEN_H = 896, 512  # generated size; upscaled x2.14 to 1920x1080 (crop to 16:9)
STEPS = 6
torch.set_num_threads(os.cpu_count() or 4)

# Real archive photographs stand in for generated stills on these shots.
REAL = {"02_farmhouse": "cadw-1988-farmhouse.png", "26_eviction": "news-1988-police-outside-farmhouse.jpg"}

# One fixed description so Mary reads as the same woman in every shot she appears in.
MARY = ("a resolute Welsh woman in her forties, strong jaw, grey-streaked dark hair pinned back, "
        "dark wool cardigan, seated in a wooden wheelchair with a tartan blanket over her lap")
MARY_SHOTS = {"07_hospital", "09_door1", "11_refuse1959", "10_offer1959", "14_offer1965", "15_unsigned",
              "17_newspaper", "21_rejects"}

LOOK = "photorealistic, cinematic film still, anamorphic, natural skin, volumetric light, teal and amber grade, 8k"
NEG = ("illustration, painting, cartoon, anime, 3d render, cgi, plastic skin, text, watermark, logo, "
       "deformed hands, extra fingers, extra limbs, duplicate, disfigured face, blurry, lowres, oversaturated")


def pipeline():
    pipe = DiffusionPipeline.from_pretrained(BASE, torch_dtype=torch.float32, safety_checker=None)
    pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
    pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
    pipe.fuse_lora()
    pipe.vae.enable_slicing()
    pipe.set_progress_bar_config(disable=True)
    return pipe


def upscale(im):
    w, h = im.size
    th = round(w * 9 / 16)
    top = (h - th) // 2
    im = im.crop((0, max(top, 0), w, max(top, 0) + min(th, h))).resize((1920, 1080), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    variant = 0
    if "--variant" in sys.argv:
        variant = int(sys.argv[sys.argv.index("--variant") + 1])
        args = [a for a in args if a != str(variant)]
    pipe = None
    for i, shot in enumerate(SHOTS):
        sid = shot["id"]
        name = f"{sid}.png" if not variant else f"{sid}_v{variant}.png"
        dest = os.path.join(OUT, name)
        if (args and sid not in args) or (not args and os.path.exists(dest)):
            continue
        if sid in REAL:
            im = Image.open(os.path.join(ASSETS, REAL[sid])).convert("RGB")
            w, h = im.size
            s = max(1920 / w, 1080 / h)
            im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
            l, t = (im.width - 1920) // 2, (im.height - 1080) // 2
            im.crop((l, t, l + 1920, t + 1080)).save(dest)
            print(f"{sid}: real photo", flush=True)
            continue
        pipe = pipe or pipeline()
        prompt = shot["prompt"]
        if sid in MARY_SHOTS:
            prompt = f"{MARY}, {prompt}"
        t0 = time.time()
        img = pipe(prompt=f"{prompt}, {LOOK}", negative_prompt=NEG, width=GEN_W, height=GEN_H,
                   num_inference_steps=STEPS, guidance_scale=1.5,
                   generator=torch.Generator("cpu").manual_seed(2000 + i + 97 * variant)).images[0]
        upscale(img).save(dest)
        print(f"{sid}: {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
