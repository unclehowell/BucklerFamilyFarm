"""Generate candidate high-angle aerial views of the farm in woodland (local CPU, free).

The composition follows the family's reference photograph (assets/farm-reference-collage.jpg): a stone barn with a
slate roof, a long low stable range with arched openings, the whitewashed stone farmhouse with chimneys, and more
stables beyond the farmhouse. It is an AI approximation of the place, not a reconstruction of the exact buildings.

    python3 trailer/drone/aerial_stills.py [n_candidates]
"""
import os
import sys

import torch
from diffusers import DiffusionPipeline, LCMScheduler

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "stills")
os.makedirs(OUT, exist_ok=True)
torch.set_num_threads(os.cpu_count() or 4)

PROMPT = ("aerial drone photograph from a high elevated angle of a Welsh stone farm in dense woodland, "
          "stone barn with slate roof, long low stable range with arched openings, whitewashed farmhouse with "
          "chimneys, more stables beyond the farmhouse, courtyard, golden hour, photorealistic, 8k")
NEG = ("illustration, painting, cartoon, 3d render, cgi, text, watermark, people, cars, modern buildings, "
       "blurry, lowres, oversaturated, deformed")


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 4
    pipe = DiffusionPipeline.from_pretrained("emilianJR/epiCRealism", torch_dtype=torch.float32, safety_checker=None)
    pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
    pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
    pipe.fuse_lora()
    pipe.vae.enable_slicing()
    pipe.set_progress_bar_config(disable=True)
    for i in range(n):
        dest = os.path.join(OUT, f"aerial_{i}.png")
        if os.path.exists(dest):
            continue
        img = pipe(prompt=PROMPT, negative_prompt=NEG, width=896, height=512, num_inference_steps=6,
                   guidance_scale=1.5, generator=torch.Generator("cpu").manual_seed(3000 + i)).images[0]
        img.save(dest)
        print(f"aerial_{i}", flush=True)


if __name__ == "__main__":
    main()
