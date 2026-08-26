#!/usr/bin/env python3
"""
Turn the source mascot illustrations into transparent, animated SVGs.

Input:  mascot/new resources/*.jpeg   (1024x1024, flat background)
Output: public/mascot/v2/<slug>.svg   (self-contained, animated)

Why the art stays raster inside an SVG: these are hand-drawn panels whose whole
identity is the loose ink contour and the coloured-pencil hatching (see
mascot/character/character-bible.md, and DNA.md section 6 — "the anatomy is the
brand"). A colour-quantised autotrace posterises exactly that away, and lands a
multi-megabyte path soup doing it. So the pixels are kept as drawn, encoded once
as WebP, and the SVG supplies what a flat image cannot: a real coordinate space,
separated layers, and declarative animation that runs even when the file is used
from a plain <img>.

Background removal is a flood fill from the border rather than a global colour
match, so ink and shadow that happen to share the background's value survive as
long as they sit inside the drawing.

Run:  npm run mascot:build
"""

import base64
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "mascot" / "new resources"
OUT_DIR = ROOT / "public" / "mascot" / "v2"

# Longest edge of the exported art. The source is 1024²; past ~840 the WebP grows
# faster than the drawing gains detail.
MAX_EDGE = 840
WEBP_QUALITY = "82"
ALPHA_QUALITY = "92"

# `tolerance` is Euclidean RGB distance from the sampled border colour. Scenes on
# black take a wider one — JPEG ringing around the ink smears the edge further
# than a flat mid-grey does.
#
# `grounded` gives the scene a soft contact shadow: right for a character standing
# on nothing, wrong for a desk panel that is already sitting on its own furniture.
#
# `accent` lifts a rectangle of the drawing onto its own animated layer. Boxes are
# in source pixels, and are erased from the base layer so nothing is drawn twice.
#
# `plate` puts a near-black panel back behind the art. The two scenes drawn on
# black need it: their trousers, ink shading and the inside of the mailbox are the
# same value as the ground, so a flood fill that reaches them cannot tell art from
# background and takes both. On the dark theme the plate is the page colour and
# reads as nothing; on the light theme it becomes a deliberate dark panel — which
# is the honest answer anyway, since those two were drawn in a dark room.
#
# `feather` fades the alpha out over N source pixels from the named edges. The two
# desk scenes are drawn to the edge of their frame, so there is no background left
# to cut once the wall behind them has gone — only the straight line where the
# canvas ends. Fading that line is the difference between a scene that floats and
# one that looks cropped.
SCENES = [
    {
        "slug": "thinking",
        "file": "Thinking.jpeg",
        "tolerance": 46,
        "grounded": True,
        "phase": 0.0,
        "alt": "Diwche, standing with a hand to his chin, deciding whether a story is worth posting.",
    },
    {
        "slug": "connecting",
        "file": "Connecting.jpeg",
        "tolerance": 58,
        "grounded": False,
        "plate": True,
        "phase": 1.3,
        "feather": {"left": 150, "right": 150, "bottom": 130},
        "accent": {"box": [700, 800, 830, 930], "kind": "pulse"},
        "alt": "Diwche slumped at a CRT terminal, chin on his hand, watching the feeds come in.",
    },
    {
        "slug": "working-hard",
        "file": "Working Hard.jpeg",
        "tolerance": 30,
        "grounded": False,
        "phase": 2.1,
        "feather": {"left": 170, "right": 170, "bottom": 150},
        "alt": "Diwche at his desk under a lamp, writing into a ledger with a quill.",
    },
    {
        "slug": "posting",
        "file": "Posting.jpeg",
        "tolerance": 58,
        "grounded": False,
        "plate": True,
        "phase": 3.4,
        "accent": {"box": [735, 195, 975, 465], "kind": "drift"},
        "alt": "Diwche posting a wax-sealed parcel into a mailbox, glyphs curling out of it.",
    },
]


def cut_background(rgb: np.ndarray, tolerance: float) -> np.ndarray:
    """Alpha for `rgb`, 0 where the background reaches in from the border.

    Only background *connected to an edge* is removed. A colour match alone would
    punch holes through the drawing wherever the ink matches the ground — which on
    the two black-background scenes is most of the outlines.
    """
    h, w, _ = rgb.shape

    # Median of a border ring, not a single corner pixel: JPEG noise makes any one
    # pixel a poor estimate of the ground.
    ring = np.concatenate(
        [
            rgb[:6].reshape(-1, 3),
            rgb[-6:].reshape(-1, 3),
            rgb[:, :6].reshape(-1, 3),
            rgb[:, -6:].reshape(-1, 3),
        ]
    )
    ground = np.median(ring, axis=0)

    near = np.linalg.norm(rgb.astype(np.float32) - ground, axis=2) < tolerance

    # Keep only the components of `near` that touch an edge.
    labels, count = ndimage.label(near)
    if count == 0:
        return np.full((h, w), 255, np.uint8)

    edge_labels = set(labels[0]) | set(labels[-1]) | set(labels[:, 0]) | set(labels[:, -1])
    edge_labels.discard(0)
    background = np.isin(labels, list(edge_labels))

    opaque = ~background

    # Close specks the flood fill left inside the drawing (a highlight that happens
    # to match the ground), then pull the edge in by a pixel so the JPEG's
    # background-coloured fringe goes with it.
    opaque = ndimage.binary_closing(opaque, np.ones((3, 3), bool))
    opaque = ndimage.binary_fill_holes(opaque)
    opaque = ndimage.binary_erosion(opaque, np.ones((3, 3), bool), iterations=1)

    # Half a pixel of blur: enough to stop the cut looking laser-cut against a
    # near-black page, not enough to leave a halo.
    return (np.clip(ndimage.gaussian_filter(opaque.astype(np.float32), 0.7), 0, 1) * 255).astype(
        np.uint8
    )


def feather_edges(alpha: np.ndarray, sides: dict) -> np.ndarray:
    """Ramp the alpha down to zero over `sides[edge]` pixels at each named edge."""
    h, w = alpha.shape
    ramp = np.ones((h, w), np.float32)

    def falloff(n: int) -> np.ndarray:
        # Smoothstep, so the fade has no visible start or end.
        t = np.linspace(0.0, 1.0, n, dtype=np.float32)
        return t * t * (3 - 2 * t)

    if n := sides.get("left"):
        ramp[:, :n] *= falloff(n)[None, :]
    if n := sides.get("right"):
        ramp[:, -n:] *= falloff(n)[::-1][None, :]
    if n := sides.get("top"):
        ramp[:n] *= falloff(n)[:, None]
    if n := sides.get("bottom"):
        ramp[-n:] *= falloff(n)[::-1][:, None]

    return (alpha.astype(np.float32) * ramp).astype(np.uint8)


def to_webp(img: Image.Image, path: Path) -> bytes:
    png = path.with_suffix(".png")
    img.save(png)
    subprocess.run(
        ["cwebp", "-quiet", "-q", WEBP_QUALITY, "-alpha_q", ALPHA_QUALITY, str(png), "-o", str(path)],
        check=True,
    )
    png.unlink()
    return path.read_bytes()


def data_uri(raw: bytes) -> str:
    return "data:image/webp;base64," + base64.b64encode(raw).decode("ascii")


def build_svg(scene: dict, base: bytes, w: int, h: int, accent=None) -> str:
    """A standalone animated SVG.

    Motion follows DNA.md section 5: transform and opacity only, never ease-in,
    and `prefers-reduced-motion` removes the movement while the art stays put. The
    phase offset per scene keeps two mascots on one page from breathing in unison.
    """
    p = scene["phase"]
    shadow = ""
    if scene["grounded"]:
        shadow = (
            f'<ellipse class="ground" cx="{w / 2:.0f}" cy="{h - 6}" '
            f'rx="{w * 0.30:.0f}" ry="{h * 0.022:.0f}" />'
        )

    # Radius is in viewBox units, sized so it lands near the system's 10px cap once
    # the scene is drawn at its usual few-hundred-pixel width.
    plate = ""
    if scene.get("plate"):
        # The hairline is what makes this a panel rather than a vaguely darker
        # rectangle. On the dark theme the page carries an ambient wash, so a plate
        # of exactly --paper still shows as a patch; the light edge gives it an
        # intended border. On the light theme it sits inside the dark panel and
        # reads as a highlight. One value, right in both rooms.
        plate = (
            f'<rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="{w * 0.022:.0f}" '
            f'fill="#05070C" stroke="rgba(255,255,255,0.10)" stroke-width="1" />'
        )

    accent_layer = ""
    if accent:
        ax, ay, aw, ah, uri = accent
        accent_layer = (
            f'<g class="accent accent--{scene["accent"]["kind"]}">'
            f'<image x="{ax}" y="{ay}" width="{aw}" height="{ah}" href="{uri}" />'
            f"</g>"
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{scene['alt']}">
<title>{scene['alt']}</title>
<style>
  .float {{ animation: float 7.2s var(--ease, cubic-bezier(0.45, 0, 0.55, 1)) {-p:.2f}s infinite; }}
  .breathe {{ animation: breathe 4.6s cubic-bezier(0.45, 0, 0.55, 1) {-p * 0.7:.2f}s infinite; transform-origin: 50% 100%; }}
  /* Neutral and light enough to read as a contact shadow on either theme. The file
     is referenced as an image, so it cannot see the page theme attribute.
     Keep this block free of angle brackets — SVG is parsed as strict XML, and a
     bare one inside style content kills the whole document. */
  .ground {{ fill: #14171F; opacity: 0.32; animation: ground 7.2s cubic-bezier(0.45, 0, 0.55, 1) {-p:.2f}s infinite; transform-origin: 50% 100%; }}
  .accent--pulse {{ animation: pulse 2.8s cubic-bezier(0.45, 0, 0.55, 1) {-p:.2f}s infinite; transform-origin: 50% 50%; }}
  .accent--drift {{ animation: drift 6.4s cubic-bezier(0.45, 0, 0.55, 1) {-p:.2f}s infinite; }}

  @keyframes float {{ 0%, 100% {{ transform: translateY(0); }} 50% {{ transform: translateY(-1.4%); }} }}
  @keyframes breathe {{ 0%, 100% {{ transform: scaleY(1); }} 50% {{ transform: scaleY(1.008); }} }}
  @keyframes ground {{ 0%, 100% {{ transform: scaleX(1); opacity: 0.32; }} 50% {{ transform: scaleX(0.94); opacity: 0.24; }} }}
  @keyframes pulse {{ 0%, 100% {{ opacity: 0.55; transform: scale(0.98); }} 50% {{ opacity: 1; transform: scale(1.03); }} }}
  @keyframes drift {{ 0%, 100% {{ transform: translateY(0); opacity: 0.85; }} 50% {{ transform: translateY(-2.2%); opacity: 1; }} }}

  @media (prefers-reduced-motion: reduce) {{
    .float, .breathe, .ground, .accent--pulse, .accent--drift {{ animation: none; }}
  }}
</style>
{shadow}
<g class="float"><g class="breathe">
{plate}
<image width="{w}" height="{h}" href="{data_uri(base)}" />
{accent_layer}
</g></g>
</svg>
"""


def main() -> int:
    if not SRC_DIR.is_dir():
        print(f"no source directory: {SRC_DIR}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = []

    for scene in SCENES:
        src = SRC_DIR / scene["file"]
        img = Image.open(src).convert("RGB")
        rgb = np.asarray(img)

        alpha = cut_background(rgb, scene["tolerance"])
        if "feather" in scene:
            alpha = feather_edges(alpha, scene["feather"])
        cut = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")

        # Lift the accent out before the base is trimmed, so its box still refers
        # to source coordinates.
        accent_img = None
        if "accent" in scene:
            x0, y0, x1, y1 = scene["accent"]["box"]
            accent_img = cut.crop((x0, y0, x1, y1))
            cleared = Image.new("RGBA", accent_img.size, (0, 0, 0, 0))
            cut.paste(cleared, (x0, y0))

        box = cut.getbbox()
        if box is None:
            print(f"{scene['slug']}: nothing left after the cut — check the tolerance", file=sys.stderr)
            return 1

        # Pad, then clamp back inside the canvas.
        pad = 10
        box = (
            max(0, box[0] - pad),
            max(0, box[1] - pad),
            min(cut.width, box[2] + pad),
            min(cut.height, box[3] + pad),
        )
        cut = cut.crop(box)

        scale = MAX_EDGE / max(cut.size)
        if scale < 1:
            cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
        else:
            scale = 1.0

        w, h = cut.size
        base = to_webp(cut, OUT_DIR / f"{scene['slug']}.webp")

        accent = None
        if accent_img is not None:
            x0, y0, x1, y1 = scene["accent"]["box"]
            ax = round((x0 - box[0]) * scale)
            ay = round((y0 - box[1]) * scale)
            aw = round((x1 - x0) * scale)
            ah = round((y1 - y0) * scale)
            accent_img = accent_img.resize((aw, ah), Image.LANCZOS)
            raw = to_webp(accent_img, OUT_DIR / f"{scene['slug']}-accent.webp")
            accent = (ax, ay, aw, ah, data_uri(raw))

        svg = build_svg(scene, base, w, h, accent)
        out = OUT_DIR / f"{scene['slug']}.svg"
        out.write_text(svg, encoding="utf-8")

        # The .webp files are build intermediates — everything ships inside the SVG.
        for tmp in OUT_DIR.glob(f"{scene['slug']}*.webp"):
            tmp.unlink()

        manifest.append({"slug": scene["slug"], "width": w, "height": h, "alt": scene["alt"]})
        print(f"{scene['slug']:<13} {w}x{h}  {out.stat().st_size / 1024:6.1f} KB")

    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
