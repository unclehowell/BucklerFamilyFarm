"""Prepare the chosen aerial view for the fly-around: AI upscale (Real-ESRGAN) and monocular depth (Depth Anything).

    python3 trailer/drone/prep_scene.py [candidate_index]
Writes .cache/aerial_up.png (2560x1463) and .cache/aerial_depth.npy (inverse depth 0..1, higher = nearer).
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "hollywood"))
from prepare_photos import esrgan_x4  # noqa: E402  (tiled Real-ESRGAN x4)

CACHE = os.path.join(HERE, ".cache")
os.makedirs(CACHE, exist_ok=True)
W, H = 2560, 1463


def main():
    idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    src = Image.open(os.path.join(HERE, "stills", f"aerial_{idx}.png")).convert("RGB")
    print("upscaling…", flush=True)
    up = Image.fromarray(esrgan_x4(np.asarray(src)))
    # blend with a plain upscale so foliage keeps a natural look rather than an over-sharpened one
    plain = src.resize(up.size, Image.BICUBIC)
    up = Image.blend(plain, up, 0.7).resize((W, H), Image.LANCZOS)
    up.save(os.path.join(CACHE, "aerial_up.png"))

    print("estimating depth…", flush=True)
    from transformers import pipeline
    out = pipeline("depth-estimation", model="LiheYoung/depth-anything-small-hf")(src)
    d = np.asarray(out["depth"]).astype(np.float32)
    d = (d - d.min()) / max(d.max() - d.min(), 1e-6)
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
    d = cv2.bilateralFilter(d, 9, 0.08, 9)
    d = cv2.GaussianBlur(d, (0, 0), 3)
    np.save(os.path.join(CACHE, "aerial_depth.npy"), d)
    Image.fromarray((d * 255).astype(np.uint8)).resize((640, 366)).save(os.path.join(CACHE, "aerial_depth_preview.png"))
    print("done")


if __name__ == "__main__":
    main()
