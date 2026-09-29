"""Generate every shot in shots.py as an AI video clip into clips/<id>.mp4.

Providers (the first one with a token set is used):
  REPLICATE_API_TOKEN   Replicate; model from REPLICATE_MODEL (default wan-video/wan-2.2-t2v-fast)
  HF_TOKEN              Hugging Face ZeroGPU Space Lightricks/ltx-video-distilled (Pro quota recommended)

Existing clips are kept, so the script can be re-run to fill gaps.
    python3 trailer/hollywood/generate.py [shot_id ...]
"""
import json
import os
import shutil
import sys
import time
import urllib.request

from shots import NEG, SHOTS, STYLE

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "clips")
os.makedirs(OUT, exist_ok=True)


def replicate(prompt, dest):
    token = os.environ["REPLICATE_API_TOKEN"]
    model = os.environ.get("REPLICATE_MODEL", "wan-video/wan-2.2-t2v-fast")
    body = {"input": {"prompt": prompt, "negative_prompt": NEG, "aspect_ratio": "16:9",
                      "resolution": "720p"}}
    req = urllib.request.Request(f"https://api.replicate.com/v1/models/{model}/predictions",
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"Authorization": f"Bearer {token}",
                                          "Content-Type": "application/json", "Prefer": "wait"})
    pred = json.load(urllib.request.urlopen(req, timeout=300))
    while pred["status"] not in ("succeeded", "failed", "canceled"):
        time.sleep(4)
        req = urllib.request.Request(pred["urls"]["get"], headers={"Authorization": f"Bearer {token}"})
        pred = json.load(urllib.request.urlopen(req, timeout=60))
    if pred["status"] != "succeeded":
        raise RuntimeError(pred.get("error") or pred["status"])
    url = pred["output"][0] if isinstance(pred["output"], list) else pred["output"]
    urllib.request.urlretrieve(url, dest)


def hf_space(prompt, dest):
    from gradio_client import Client
    client = Client("Lightricks/ltx-video-distilled", hf_token=os.environ["HF_TOKEN"], verbose=False)
    res = client.predict(prompt=prompt, negative_prompt=NEG, height_ui=512, width_ui=896,
                         mode="text-to-video", duration_ui=5, randomize_seed=True,
                         improve_texture_flag=True, api_name="/text_to_video")
    video = res[0]["video"] if isinstance(res[0], dict) else res[0]
    shutil.copy(video, dest)


def main():
    if os.environ.get("REPLICATE_API_TOKEN"):
        provider = replicate
    elif os.environ.get("HF_TOKEN"):
        provider = hf_space
    else:
        sys.exit("Set REPLICATE_API_TOKEN or HF_TOKEN in the environment first.")
    wanted = set(sys.argv[1:])
    for shot in SHOTS:
        dest = os.path.join(OUT, f"{shot['id']}.mp4")
        if (wanted and shot["id"] not in wanted) or (not wanted and os.path.exists(dest)):
            continue
        prompt = f"{shot['prompt']}, {STYLE}"
        for attempt in range(4):
            try:
                t = time.time()
                provider(prompt, dest)
                print(f"{shot['id']}: ok in {time.time() - t:.0f}s", flush=True)
                break
            except Exception as e:  # network hiccups and busy queues are common
                print(f"{shot['id']}: attempt {attempt + 1} failed: {str(e)[:200]}", flush=True)
                time.sleep(20 * (attempt + 1))


if __name__ == "__main__":
    main()
