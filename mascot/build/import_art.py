#!/usr/bin/env python3
"""Turn generated scene images into animation-ready layers.

    python3 build/import_art.py            # every scene that has art
    python3 build/import_art.py writing    # one scene

For each `art/NN-slug/*.png` this does four things:

1.  **Cuts the alpha.** The images arrive on flat magenta because image models cannot draw
    transparency — ask one for a transparent background and it paints a checkerboard, having
    learned the visual convention rather than the concept. So we key the magenta out here.
2.  **Despills.** Pixels along an anti-aliased edge pick up a magenta cast. Left alone they
    give every layer a faint pink halo that is very obvious once layers overlap.
3.  **Trims.** Crops away empty margin so the layer's own box is meaningful, which is what
    lets a rig express an anchor as "5% down from the top of this arm" and have that mean the
    shoulder regardless of how the art was framed.
4.  **Writes `layers.json`** with each layer's size and where it sat in the original 1024
    frame, so `make.py` can place it without anyone measuring anything by hand.

Magenta rather than the usual chroma green because Diwche is sage green; keying on green
would eat the character.
"""
from __future__ import annotations

import json
import pathlib
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _scenes import SCENES, BY_SLUG  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
ART = ROOT / "art"
RIG = ROOT / "rig"

KEY_RGB = np.array([255, 0, 255], dtype=np.float32)
NEVER_KEY = {"pose"}          # the reference plate, drawn on cream paper
OPAQUE = {"bg"}               # background plates are meant to be opaque


def _rgb_to_hsv(arr):
    """Vectorised RGB→HSV on a float array in 0..1. Returns hue in degrees."""
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mx, mn = arr.max(-1), arr.min(-1)
    diff = mx - mn
    hue = np.zeros_like(mx)
    mask = diff > 1e-6
    idx = mask & (mx == r)
    hue[idx] = (60 * ((g - b)[idx] / diff[idx])) % 360
    idx = mask & (mx == g)
    hue[idx] = 60 * ((b - r)[idx] / diff[idx]) + 120
    idx = mask & (mx == b)
    hue[idx] = 60 * ((r - g)[idx] / diff[idx]) + 240
    sat = np.where(mx > 1e-6, diff / np.maximum(mx, 1e-6), 0)
    return hue, sat, mx


def _dilate(mask, iterations=2):
    """Grow a boolean mask by one pixel per iteration, using pure NumPy shifts.

    OpenCV would be one call, but it is not installed and this is four lines.
    """
    for _ in range(iterations):
        grown = mask.copy()
        grown[1:, :] |= mask[:-1, :]
        grown[:-1, :] |= mask[1:, :]
        grown[:, 1:] |= mask[:, :-1]
        grown[:, :-1] |= mask[:, 1:]
        mask = grown
    return mask


def chroma_key(img, hue_centre=300.0, hue_width=40.0, sat_min=0.45, val_min=0.30):
    """Cut flat magenta to transparent, then pull the magenta cast out of the edges."""
    rgb = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    hue, sat, val = _rgb_to_hsv(rgb)

    hue_dist = np.abs(((hue - hue_centre + 180) % 360) - 180)
    background = (hue_dist < hue_width) & (sat > sat_min) & (val > val_min)

    # Grow the mask slightly so the semi-keyed anti-aliased fringe goes too, then treat the
    # ring we just ate as partial coverage rather than a hard cut, which keeps edges soft.
    core = _dilate(background, iterations=1)
    alpha = np.where(core, 0.0, 1.0)
    fringe = _dilate(core, iterations=2) & ~core
    alpha[fringe] = np.clip(1.0 - (sat[fringe] - sat_min) / max(sat_min, 1e-6), 0.25, 1.0)

    # Despill: where red and blue both overshoot green, that is magenta contamination.
    r, g, b = rgb[..., 0].copy(), rgb[..., 1], rgb[..., 2].copy()
    spill = np.minimum(r, b) - g
    over = spill > 0.02
    r[over] -= spill[over] * 0.85
    b[over] -= spill[over] * 0.85
    out = np.stack([np.clip(r, 0, 1), g, np.clip(b, 0, 1), np.clip(alpha, 0, 1)], axis=-1)
    return Image.fromarray((out * 255).astype(np.uint8), mode="RGBA")


def trim(img):
    """Crop to the non-transparent content. Returns the image and its offset."""
    alpha = np.asarray(img.split()[-1])
    rows = np.where(alpha.max(axis=1) > 8)[0]
    cols = np.where(alpha.max(axis=0) > 8)[0]
    if not len(rows) or not len(cols):
        return img, (0, 0)
    box = (int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1)
    return img.crop(box), (box[0], box[1])


def matte_via_birefnet(path):
    """Cut alpha using the BiRefNet service this repo already runs.

    Better than chroma key for a clean single-subject silhouette; worse for thin, detached or
    multi-part subjects, since it assumes there is exactly one subject. Opt in per layer with
    `"matte": "birefnet"` in the rig.
    """
    import os
    import urllib.request

    url = os.environ.get("BGREMOVAL_URL", "http://localhost:8081") + "/remove-bg"
    key = os.environ.get("BGREMOVAL_API_KEY")
    if not key:
        raise SystemExit(
            "BGREMOVAL_API_KEY is not set. The service refuses to start without it, so it "
            "must be in your environment (see .env.local) to use matte=birefnet.")
    boundary = "----diwche"
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
        f"filename=\"{path.name}\"\r\nContent-Type: image/png\r\n\r\n".encode()
        + path.read_bytes() + f"\r\n--{boundary}--\r\n".encode())
    req = urllib.request.Request(url, data=body, headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}", "X-API-Key": key})
    import io
    with urllib.request.urlopen(req, timeout=120) as resp:
        return Image.open(io.BytesIO(resp.read())).convert("RGBA")


def rig_hints(scene):
    path = RIG / f"{scene['num']:02d}-{scene['slug']}.rig.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text()).get("layers", {})


def process_scene(scene):
    folder = ART / f"{scene['num']:02d}-{scene['slug']}"
    pngs = sorted(folder.glob("*.png")) if folder.exists() else []
    if not pngs:
        return None

    hints = rig_hints(scene)
    meta = {}
    for png in pngs:
        name = png.stem
        if name in NEVER_KEY:
            continue
        img = Image.open(png)
        source_w, source_h = img.size

        keyed = None
        if name in OPAQUE:
            layer = img.convert("RGBA")
            offset = (0, 0)
        else:
            strategy = (hints.get(name) or {}).get("matte", "chroma")
            if strategy == "birefnet":
                try:
                    layer = matte_via_birefnet(png)
                except Exception as exc:      # service down, no key, timeout
                    print(f"    ! {name}: BiRefNet unavailable ({exc}); using chroma key")
                    layer = chroma_key(img)
            else:
                layer = chroma_key(img)
            keyed = layer
            layer, offset = trim(layer)

        # Measured against the whole original frame, not the trimmed box — a solid prop
        # legitimately fills its own box, so trimming first would flag every one of them.
        coverage = float((np.asarray((keyed or layer).split()[-1]) > 8).mean())
        # Two failure modes worth catching, both checked against something absolute rather
        # than a guess at how big a layer "should" be — eyes are legitimately tiny, and a
        # solid prop is legitimately solid.
        if layer.width < 8 or layer.height < 8:
            print(f"    ! {name}: nothing survived the key. The background was probably not "
                  f"flat magenta — regenerate it.")
        elif coverage > 0.98 and name not in OPAQUE:
            print(f"    ! {name}: nothing was keyed out. Check the background is magenta "
                  f"and not cream paper.")

        out = folder / f"{name}.webp"
        layer.save(out, format="WEBP", quality=90, method=6, lossless=False)
        meta[name] = {
            "w": layer.width, "h": layer.height,
            # Where this layer sat in its own 1024 frame, as fractions — so make.py can drop
            # it in the right place without anyone measuring pixels.
            "pos": [(offset[0] + layer.width / 2) / source_w,
                    (offset[1] + layer.height / 2) / source_h],
            "coverage": round(coverage, 4),
        }
        print(f"    {name:18s} {layer.width:4d}x{layer.height:<4d} "
              f"{out.stat().st_size / 1024:6.1f} KB  {coverage:5.1%} opaque")

    (folder / "layers.json").write_text(json.dumps(meta, indent=2))
    return meta


def main(argv):
    wanted = argv[1:]
    scenes = [BY_SLUG[s] for s in wanted] if wanted else SCENES
    done = 0
    for scene in scenes:
        print(f"  {scene['num']:02d}-{scene['slug']}")
        result = process_scene(scene)
        if result is None:
            print("    (no art yet)")
        else:
            done += 1
    if done:
        print(f"\n  imported {done} scene(s). Now run: python3 build/make.py")
    else:
        print("\n  No art found. Generate it first — see prompts/how-to-generate.md")


if __name__ == "__main__":
    main(sys.argv)
