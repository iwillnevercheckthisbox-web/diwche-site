#!/usr/bin/env python3
"""
Turn the landing-page illustrations into web-sized WebP.

Input:  art/source/*.png        (hand-drawn, already cut out, transparent)
Output: public/art/<slug>.webp  + public/art/manifest.json
        public/brand/horns.png  (the mark, trimmed — the nav and the OG cards)
        public/brand/icon-*.png (the tab and home-screen icon, cut from the mark)

A new drawing is one line in ART and one file in art/source named after its slug.

This is the sibling of build-mascot.py and deliberately much smaller. That script
exists because the four mascot scenes arrive as JPEGs on a flat background and
have to be cut out, layered and animated. These arrive already cut out and stay
still, so all that is left is trim, resize, encode.

Run:  npm run art:build
"""

import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

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
        "pilot-thinking",
        "Diwche standing with a finger to his temple, weighing whether a page is worth "
        "his morning.",
    ),
    (
        "studio-writing",
        "Diwche hunched over a ledger under a lamp, writing by quill among charts and maps.",
    ),
    (
        "replies-mailbox",
        "Diwche posting a wax-sealed parcel into a mailbox, letters waiting at his feet.",
    ),
    (
        "analytics-robot",
        "Diwche in a tinkered-together instrument vest, a colander on his head and dials "
        "on his chest, reading his own numbers.",
    ),
    # "How Diwche thinks" (#approach). The drawing is "Replace 2.png" on Trello #379 and is
    # not in the repo yet: save it as art/source/approach-thinking.png, describe it here in
    # place of the None, and rebuild. Until then it is PENDING and the section has no picture.
    ("approach-thinking", None),
]

# Drawings that are planned but whose file has not arrived yet.
#
# A pending slug with no art/source/<slug>.png is left out of the manifest, loudly, and the
# page that wants it renders without it (Home.astro asks the manifest) — never with some other
# drawing standing in, which on the homepage meant the same figure twice. Once the file
# exists it builds like any other and this entry stops mattering.
PENDING = {"approach-thinking"}

# The mark. Trimmed to the horns themselves — the source has about a third of its
# height in empty margin, which would render as a mysteriously small logo.
MARK_EDGE = 256

# The tab icon.
#
# It used to be a hand-drawn `favicon.svg`: two thin open curls that were meant to
# be the horns and at 16px read as a pair of goggles, which is not the mark on any
# other surface. So the icon is now cut from the mark itself — same drawing as the
# nav — and there is no second artwork that can drift away from the first.
#
# 32 is the tab, 180 is the iOS home screen, 512 is everything that wants a big one.
#
# The horns stand on nothing (#379). They were plated on a near-black tile, which in a
# light browser tab is a black square with the mark somewhere inside it. The one
# exception is the home-screen icon: iOS fills transparency with black itself, so 180
# keeps the plate it would otherwise be given, and the mark on it is the same drawing.
ICON_SIZES = (32, 180, 512)
ICON_PLATED = {180}
ICON_GROUND = (5, 7, 12, 255)  # --paper in the dark theme; the plated sizes only
ICON_RADIUS = 7 / 32  # the corner of an app tile, as a fraction of the edge
# A plate needs a margin to read as a tile. Bare horns do not, and at 32px every pixel of
# margin is a pixel less of the mark.
ICON_PAD = 0.13
ICON_PAD_BARE = 0.03
# Drawn large and reduced once: composing at the final 32px loses the taper.
ICON_SUPERSAMPLE = 8


def icon(mark: Image.Image, size: int) -> Image.Image:
    """The mark at one edge length — on a rounded ground only where the platform needs one."""
    big = size * ICON_SUPERSAMPLE
    tile = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    plated = size in ICON_PLATED
    if plated:
        ImageDraw.Draw(tile).rounded_rectangle(
            [0, 0, big - 1, big - 1], radius=round(big * ICON_RADIUS), fill=ICON_GROUND
        )

    inner = big - 2 * round(big * (ICON_PAD if plated else ICON_PAD_BARE))
    scale = min(inner / mark.width, inner / mark.height)
    horns = mark.resize((round(mark.width * scale), round(mark.height * scale)), Image.LANCZOS)
    tile.alpha_composite(horns, ((big - horns.width) // 2, (big - horns.height) // 2))

    return tile.resize((size, size), Image.LANCZOS)


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
        if not src.exists() and slug in PENDING:
            print(f"!! PENDING: {slug} has no art/source/{slug}.png yet — left out of the manifest.")
            continue
        if not src.exists():
            raise SystemExit(f"missing source: {src}")
        if alt is None:
            # An illustration nobody has described is decorative until somebody does. An
            # invented description would be worse than none: DNA §6 is what makes these true.
            print(f"!! {slug} has no alt text yet — describe the drawing in ART.")
            alt = ""

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

    for size in ICON_SIZES:
        icon(mark, size).save(BRAND_DIR / f"icon-{size}.png")
        print(f"icon-{size}.png")


if __name__ == "__main__":
    main()
