#!/usr/bin/env python3
"""Build all twelve Diwche animations.

    python3 build/make.py            # build everything
    python3 build/make.py writing    # build one scene

There are two modes, chosen per scene:

*   **layered** — used when `art/NN-slug/layers.json` exists, i.e. once the real art has been
    generated and imported. Every part of the character is its own image and the rig animates
    them independently. This is the real thing.
*   **placeholder** — the fallback, used until then. It crops the scene's panel out of the
    original contact sheet and animates it as a single flat image: a slow camera push, a
    breath, and vector accents. It looks like what it is — a placeholder — but it exercises
    the whole pipeline end to end, so the player, the fallbacks and the preview page are all
    proven working before a single new image is commissioned.

Run it, open `dist/index.html`, and the mode of each scene is labelled there.
"""
from __future__ import annotations

import json
import pathlib
import shutil
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))

import lottie as L          # noqa: E402
import motion as M          # noqa: E402
from _scenes import SCENES, BY_SLUG, frames  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "source" / "diwche.png"
ART = ROOT / "art"
RIG = ROOT / "rig"
DIST = ROOT / "dist"

# The composition matches the frame the art is generated in (see the prompts: 1024 square),
# so a layer's position in its source image maps straight through with no fitting maths and
# no chance of the parts drifting apart from each other.
ART_FRAME = 1024
COMP_W, COMP_H = ART_FRAME, ART_FRAME
PAPER = (0.965, 0.945, 0.894)      # #F6F1E4
INK = (0.227, 0.196, 0.149)        # #3A3226
GOLD = (0.878, 0.729, 0.373)

# Panel boxes in the original contact sheet, measured from its grid rules. The captions
# beneath each panel are deliberately excluded — see the "no text" rule in the character
# bible. Columns and rows are slightly uneven because the sheet itself is.
PANEL_COLS = [(16, 259), (263, 512), (516, 771), (775, 1009)]
PANEL_ROWS = [(16, 184), (211, 361), (389, 518)]


def panel_box(num):
    """The crop box for scene `num` (1-based), laid out left-to-right, top-to-bottom."""
    idx = num - 1
    x0, x1 = PANEL_COLS[idx % 4]
    y0, y1 = PANEL_ROWS[idx // 4]
    return (x0, y0, x1, y1)


# ----------------------------------------------------------------------------- placeholder


def build_placeholder(scene):
    """One flat panel, gently animated. Proves the pipeline; not the final look."""
    from PIL import Image

    n = frames(scene)
    slug = scene["slug"]
    out_assets = DIST / "assets" / slug
    out_assets.mkdir(parents=True, exist_ok=True)

    sheet = Image.open(SOURCE).convert("RGB")
    panel = sheet.crop(panel_box(scene["num"]))
    # Fitted to the square composition on its own cream ground, keeping the panel's aspect.
    # Upscaled well past its native size, which is exactly why this is a placeholder.
    pw, ph = COMP_W, round(COMP_W * panel.height / panel.width)
    panel = panel.resize((pw, ph), Image.LANCZOS)
    panel.save(out_assets / "panel.webp", format="WEBP", quality=88, method=6)

    comp = L.Comp(slug, COMP_W, COMP_H, n)
    comp.asset("panel", "panel.webp", pw, ph)

    # A camera null so the push and the breath can coexist — one transform each.
    camera = comp.null("camera", scale=M.push_in(n, amount=1.8))

    comp.shape("paper", L.rect(COMP_W * 1.1, COMP_H * 1.1, colour=PAPER),
               pos=[COMP_W / 2, COMP_H / 2], anchor=[0, 0])
    comp.image("panel", "panel",
               pos=[COMP_W / 2, (COMP_H + ph) / 2],
               anchor=[pw / 2, ph],                # anchored at the floor, so it swells upward
               scale=M.breathe(n, amp=1.1, cycles=2),
               parent=camera)

    _add_accents(comp, n, camera, COMP_W, COMP_H, "sparkle")
    return comp, "placeholder"


def _add_accents(comp, n, parent, cw, ch, kind="sparkle", at=(0.5, 0.5)):
    """Small vector flourishes. A few hundred bytes each, and no artwork needed.

    Which one suits depends entirely on the scene: gold twinkles are right over a finished
    piece and quite wrong over a man doing paperwork, where a couple of flicked ink dots say
    the same thing in the scene's own language.
    """
    if kind == "none":
        return

    if kind == "ink":
        ax, ay = at
        for i, (dx, dy, delay) in enumerate([(-0.010, -0.020, 0.20),
                                             (0.014, -0.030, 0.55),
                                             (-0.024, -0.012, 0.78)]):
            start = [cw * (ax + dx), ch * (ay + dy)]
            comp.shape(
                f"ink-{i}", L.dot(radius=2.2 + i * 0.5, colour=INK),
                pos=M.anim([
                    (0, start),
                    (round(n * delay), start),
                    (round(n * (delay + 0.16)), [start[0] + 5 - i * 4, start[1] + 16]),
                    (n, start),
                ], ease=L.EASE_IN),
                anchor=[0, 0],
                opacity=M.anim([
                    (0, 0), (round(n * delay), 0), (round(n * (delay + 0.03)), 85),
                    (round(n * (delay + 0.16)), 0), (n, 0),
                ]),
                parent=parent,
            )
        return

    spots = [(0.16, 0.16), (0.84, 0.13), (0.90, 0.29)]
    for i, (fx, fy) in enumerate(spots):
        comp.shape(
            f"sparkle-{i}", L.star(points=4, outer=15 - i * 3, inner=4, colour=GOLD),
            pos=[cw * fx, ch * fy], anchor=[0, 0],
            # Offset so they twinkle in sequence rather than together, and tilted a little
            # differently each so they do not read as three copies of one shape.
            scale=M.twinkle(n, at=0.14 + 0.24 * i, dur=0.22),
            rot=18 * i - 12,
            parent=parent,
        )


# --------------------------------------------------------------------------------- layered


def build_layered(scene, layers_meta):
    """The real build: every part on its own layer, driven by the scene's rig file."""
    n = frames(scene)
    slug = scene["slug"]
    rig = json.loads((RIG / f"{scene['num']:02d}-{slug}.rig.json").read_text())

    # A cut-up drawing keeps its own proportions rather than the square frame that generated
    # art comes in, so the composition size travels with the art.
    frame = layers_meta.get("_frame", [ART_FRAME, ART_FRAME])
    cw, ch = int(frame[0]), int(frame[1])
    layers_meta = {k: v for k, v in layers_meta.items() if not k.startswith("_")}

    comp = L.Comp(slug, cw, ch, n)
    push = rig.get("camera_push", 1.4)
    camera = (comp.null("camera", scale=M.push_in(n, amount=push)) if push
              else comp.null("camera"))

    made = {}
    world = {}          # each layer's top-left in composition coordinates

    def place(name, spec):
        meta = layers_meta[name]
        ref = comp.asset(name, f"{name}.webp", meta["w"], meta["h"])

        # Anchors are fractions of the layer's own box, so "[0.5, 0.06]" means the top centre
        # of an arm — its shoulder — and keeps meaning that if the art is regenerated bigger.
        ax, ay = spec.get("anchor", [0.5, 0.5])
        anchor = [meta["w"] * ax, meta["h"] * ay]

        # Where the layer belongs. The importer recorded where it actually sat in the frame it
        # was drawn in, and that composition is authoritative — the artist already solved it.
        # A rig only supplies `pos` to override that deliberately.
        cx, cy = spec.get("pos", meta.get("pos", [0.5, 0.5]))
        top_left = [cw * cx - meta["w"] / 2, ch * cy - meta["h"] / 2]

        # A child's position is expressed in its parent's space, not the composition's. Lottie
        # composes transforms as translate(pos - anchor) down the chain, so a child has to
        # subtract wherever its parent ended up or every parented layer lands twice-offset.
        parent_name = spec.get("parent")
        parent = made.get(parent_name) or camera
        origin = world.get(parent_name, [0.0, 0.0])
        pos = [top_left[0] + anchor[0] - origin[0], top_left[1] + anchor[1] - origin[1]]

        world[name] = top_left
        kw = dict(pos=pos, anchor=anchor, parent=parent)
        kw.update(_motion_for(spec, n, pos))
        made[name] = comp.image(name, ref, **kw)

    for name, spec in rig["layers"].items():
        if name not in layers_meta:
            raise SystemExit(
                f"{slug}: rig wants layer '{name}' but "
                f"art/{scene['num']:02d}-{slug}/ has no such image.\n"
                f"        available: {', '.join(sorted(layers_meta))}")
        place(name, spec)

    _add_accents(comp, n, camera, cw, ch, rig.get("accents", "sparkle"),
                 rig.get("accent_at", [0.5, 0.5]))
    return comp, "layered"


def _motion_for(spec, n, pos):
    """Translate a rig entry's motion names into properties from the motion library."""
    out = {}
    for kind, args in (spec.get("motion") or {}).items():
        args = dict(args or {})
        if kind == "breathe":
            out["scale"] = M.breathe(n, **args)
        elif kind == "bob":
            out["rot"] = M.bob(n, **args)
        elif kind == "act":
            out["rot"] = M.act(n, **args)
        elif kind == "tap":
            out["rot"] = M.tap(n, **args)
        elif kind == "sway":
            out["pos"] = M.sway(n, base=pos, **args)
        elif kind == "drift_in":
            out["pos"] = M.drift_in(n, base=pos, **args)
        elif kind == "pop":
            out["scale"] = M.pop(n, **args)
        elif kind == "blink":
            out["opacity"] = M.blink(n, **args)
        elif kind == "reveal":
            out["opacity"] = M.reveal(n, **args)
        elif kind == "shine":
            out["opacity"] = M.shine(n, **args)
        elif kind == "flicker":
            out["opacity"] = M.flicker(n, **args)
        else:
            raise SystemExit(f"unknown motion '{kind}' in rig")
    return out


# ------------------------------------------------------------------------------------ main


def build(scene):
    meta_path = ART / f"{scene['num']:02d}-{scene['slug']}" / "layers.json"
    if meta_path.exists():
        comp, mode = build_layered(scene, json.loads(meta_path.read_text()))
    else:
        comp, mode = build_placeholder(scene)

    name = f"{scene['num']:02d}-{scene['slug']}"
    path = comp.write(DIST / "lottie" / f"{name}.json")

    # Assets live under dist/assets/<slug>/ and the player points assetsPath at that folder.
    src_assets = DIST / "assets" / scene["slug"]
    if mode == "layered":
        src_assets.mkdir(parents=True, exist_ok=True)
        for webp in (ART / name).glob("*.webp"):
            shutil.copy2(webp, src_assets / webp.name)

    size = path.stat().st_size
    asset_bytes = sum(f.stat().st_size for f in src_assets.glob("*.webp"))
    comp = json.loads(path.read_text())
    return dict(name=name, slug=scene["slug"], mode=mode, frames=frames(scene),
                loop=scene["loop"], json_bytes=size, asset_bytes=asset_bytes,
                title=scene["title"], usage=scene["usage"], rig=scene["rig"],
                w=comp["w"], h=comp["h"])


def main(argv):
    wanted = argv[1:]
    scenes = [BY_SLUG[s] for s in wanted] if wanted else SCENES
    DIST.mkdir(parents=True, exist_ok=True)

    built = []
    for scene in scenes:
        built.append(build(scene))
        b = built[-1]
        print(f"  {b['name']:22s} {b['mode']:12s} {b['frames']:3d}f  "
              f"json {b['json_bytes'] / 1024:6.1f} KB  art {b['asset_bytes'] / 1024:7.1f} KB")

    (DIST / "manifest.json").write_text(json.dumps(built, indent=2))
    total = sum(b["json_bytes"] + b["asset_bytes"] for b in built)
    placeholders = sum(1 for b in built if b["mode"] == "placeholder")
    print(f"\n  {len(built)} scenes, {total / 1024 / 1024:.2f} MB total"
          + (f", {placeholders} still on placeholder art" if placeholders else ""))
    return built


if __name__ == "__main__":
    main(sys.argv)
