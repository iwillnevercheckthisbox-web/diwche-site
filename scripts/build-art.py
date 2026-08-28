#!/usr/bin/env python3
"""
Turn the landing-page illustrations into web-sized WebP.

Input:  art/source/*.png        (hand-drawn, already cut out, transparent)
Output: public/art/<slug>.webp  + public/art/manifest.json
        public/brand/horns.png  (the mark, trimmed — needs to stay PNG so it can
                                 also serve as the touch icon)

This is the sibling of build-mascot.py and deliberately much smaller. That script
exists because the four mascot scenes arrive as JPEGs on a flat background and
have to be cut out, layered and animated. These arrive already cut out and stay
still, so all that is left is trim, resize, encode.

Run:  npm run art:build
"""

import json
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "art" / "source"
OUT_DIR = ROOT / "public" / "art"
BRAND_DIR = ROOT / "public" / "brand"

# Longest edge of the exported art. Same ceiling as the mascot build: past ~840
# the file grows faster than the drawing gains detail, and nothing on the page
# renders one of these wider than 500px anyway.
MAX_EDGE = 840
QUALITY = "82"
ALPHA_QUALITY = "92"

# Alt text lives here rather than in the page, so a drawing carries its own
# description wherever it is used. No text is ever drawn inside the art itself
# (DNA §6), which is what makes these descriptions honest.
ART = [
    (
        "hero-camera",
        "Diwche at his desk, one eye behind a camera and a quill in the other hand, "
        "a clockwork owl on his shoulder.",
    ),
    (
        "pilot-crowd",
        "Diwche standing still while a dozen small people climb over him, measuring "
        "and mending as they go.",
    ),
    (
        "topics-thinking",
        "Diwche with a finger to his temple, deciding whether a topic is worth the day.",
    ),
    (
        "create-writing",
        "Diwche hunched over a ledger under a lamp, writing by quill among charts and maps.",
    ),
    (
        "publish-mailbox",
        "Diwche posting a wax-sealed parcel into a mailbox, glyphs curling out of the slot.",
    ),
]

# The mark. Trimmed to the horns themselves — the source has about a third of its
# height in empty margin, which would render as a mysteriously small logo.
MARK_EDGE = 256


def encode(png: Path, webp: Path) -> None:
    subprocess.run(
        [
            "cwebp",
            "-quiet",
            "-q",
            QUALITY,
            "-alpha_q",
            ALPHA_QUALITY,
            str(png),
            "-o",
            str(webp),
        ],
        check=True,
    )


def fit(im: Image.Image, max_edge: int) -> Image.Image:
    """Trim the transparent margin, then bound the longest edge."""
    box = im.getbbox()
    if box:
        im = im.crop(box)
    if max(im.size) > max_edge:
        scale = max_edge / max(im.size)
        im = im.resize(
            (round(im.width * scale), round(im.height * scale)),
            Image.LANCZOS,
        )
    return im


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    BRAND_DIR.mkdir(parents=True, exist_ok=True)

    manifest = []
    tmp = OUT_DIR / "_tmp.png"

    for slug, alt in ART:
        src = SRC_DIR / f"{slug}.png"
        if not src.exists():
            raise SystemExit(f"missing source: {src}")

        im = fit(Image.open(src).convert("RGBA"), MAX_EDGE)
        im.save(tmp)
        encode(tmp, OUT_DIR / f"{slug}.webp")

        manifest.append({"slug": slug, "width": im.width, "height": im.height, "alt": alt})
        print(f"{slug}.webp  {im.width}x{im.height}")

    tmp.unlink(missing_ok=True)
    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    mark = fit(Image.open(SRC_DIR / "horns.png").convert("RGBA"), MARK_EDGE)
    mark.save(BRAND_DIR / "horns.png")
    print(f"horns.png  {mark.width}x{mark.height}")


if __name__ == "__main__":
    main()
