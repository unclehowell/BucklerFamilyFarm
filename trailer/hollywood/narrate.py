"""Generate the narrator track, one WAV per shot, with Kokoro TTS (runs locally on CPU).

    pip install kokoro-onnx soundfile huggingface_hub
    python3 trailer/hollywood/narrate.py
"""
import os

import numpy as np
import soundfile as sf
from huggingface_hub import hf_hub_download
from kokoro_onnx import Kokoro

from shots import SHOTS, TITLE_VO

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "vo")
CACHE = os.path.join(HERE, ".cache")
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)

REPO = "onnx-community/Kokoro-82M-v1.0-ONNX"
VOICE = os.environ.get("NARRATOR_VOICE", "bm_george")  # deep British male
SPEED = 0.86


def voices_npz():
    path = os.path.join(CACHE, "voices.npz")
    if not os.path.exists(path):
        vs = {}
        for v in ("bm_george", "bm_lewis", "bm_fable", "bm_daniel"):
            p = hf_hub_download(REPO, f"voices/{v}.bin", local_dir=CACHE)
            vs[v] = np.fromfile(p, dtype=np.float32).reshape(-1, 1, 256)
        np.savez(path, **vs)
    return path


def main():
    model = hf_hub_download(REPO, "onnx/model.onnx", local_dir=CACHE)
    k = Kokoro(model, voices_npz())
    lines = [(s["id"], s["vo"]) for s in SHOTS if s["vo"]] + [("99_title", TITLE_VO)]
    for sid, line in lines:
        audio, sr = k.create(line, voice=VOICE, speed=SPEED, lang="en-gb")
        sf.write(os.path.join(OUT, f"{sid}.wav"), audio, sr)
        print(f"{sid}: {len(audio) / sr:.1f}s  {line}")


if __name__ == "__main__":
    main()
