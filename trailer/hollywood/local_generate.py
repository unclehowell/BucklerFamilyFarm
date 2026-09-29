"""Generate every shot in shots.py locally on CPU — free, no account or key needed.

Uses AnimateDiff-Lightning (ByteDance, 4-step distilled motion module) on a photoreal
Stable Diffusion 1.5 base (epiCRealism). Each shot is 16 frames at 640x384, which
assemble.py slows and upscales to fill its beat.

    pip install torch --index-url https://download.pytorch.org/whl/cpu
    pip install diffusers transformers accelerate safetensors huggingface_hub
    python3 trailer/hollywood/local_generate.py [shot_id ...]
"""
import os
import subprocess
import sys
import time

import imageio_ffmpeg
import numpy as np
import torch
from diffusers import AnimateDiffPipeline, EulerDiscreteScheduler, MotionAdapter
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file

from shots import NEG, SHOTS, STYLE

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "clips")
os.makedirs(OUT, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

BASE = os.environ.get("BASE_MODEL", "emilianJR/epiCRealism")
STEPS = 4
W, H, FRAMES = 640, 384, 16

torch.set_num_threads(os.cpu_count() or 4)


def load():
    adapter = MotionAdapter()
    ckpt = hf_hub_download("ByteDance/AnimateDiff-Lightning", f"animatediff_lightning_{STEPS}step_diffusers.safetensors")
    adapter.load_state_dict(load_file(ckpt, device="cpu"))
    pipe = AnimateDiffPipeline.from_pretrained(BASE, motion_adapter=adapter, torch_dtype=torch.float32)
    pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config, timestep_spacing="trailing",
                                                        beta_schedule="linear")
    pipe.vae.enable_slicing()
    pipe.set_progress_bar_config(disable=True)
    return pipe


def save(frames, dest):
    p = subprocess.Popen([FFMPEG, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", "8", "-i", "-", "-c:v", "libx264", "-crf", "12",
                          "-pix_fmt", "yuv420p", dest], stdin=subprocess.PIPE)
    for f in frames:
        p.stdin.write(np.asarray(f.convert("RGB")).tobytes())
    p.stdin.close()
    p.wait()


def main():
    wanted = set(sys.argv[1:])
    pipe = load()
    for i, shot in enumerate(SHOTS):
        dest = os.path.join(OUT, f"{shot['id']}.mp4")
        if (wanted and shot["id"] not in wanted) or (not wanted and os.path.exists(dest)):
            continue
        t = time.time()
        out = pipe(prompt=f"{shot['prompt']}, {STYLE}", negative_prompt=NEG, num_frames=FRAMES,
                   width=W, height=H, guidance_scale=1.0, num_inference_steps=STEPS,
                   generator=torch.Generator("cpu").manual_seed(1000 + i))
        save(out.frames[0], dest)
        print(f"{shot['id']}: {time.time() - t:.0f}s", flush=True)


if __name__ == "__main__":
    main()
