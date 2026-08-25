"""Cut a flat drawing into animatable layers.

The twelve panels on the contact sheet are finished drawings, not layered artwork, so to
animate one we have to take it apart: lift the head off the shoulders, lift the hand off the
desk, lift the thought bubble off the wall, and patch the holes left behind.

Everything here works at the panel's **native resolution** (243x168), because that is where
the measurements were taken and where the colour rules are meaningful. Masks are only
upscaled at the very end, and they are upscaled *smoothly* while the colour is upscaled
sharply — which is what keeps cut edges from looking like staircases.

The three things that make a cutout read as one drawing rather than a collage:

*   **Feathered alpha.** A hard-edged cut looks pasted on. Every mask gets a sub-pixel
    softening so the edge sits back into the art.
*   **Generous overlap.** Layers are cut wider than they strictly need to be, so a part can
    move a little without revealing a gap at its own border.
*   **Patched holes.** Wherever something is lifted out, the background beneath is
    reconstructed. Nearest-known-pixel plus a blur is enough here because the areas involved
    are small and sit against flat cream, white paper or plain desk.
"""
from __future__ import annotations

import json
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "source" / "diwche.png"

# The contact sheet's grid, measured from its rule lines. Captions are excluded.
PANEL_COLS = [(16, 259), (263, 512), (516, 771), (775, 1009)]
PANEL_ROWS = [(16, 184), (211, 361), (389, 518)]


def panel(num):
    """Scene `num` (1-based) as an RGB float array in 0..1, plus the PIL image."""
    idx = num - 1
    x0, x1 = PANEL_COLS[idx % 4]
    y0, y1 = PANEL_ROWS[idx // 4]
    img = Image.open(SOURCE).convert("RGB").crop((x0, y0, x1, y1))
    return np.asarray(img).astype(np.float32) / 255.0, img


def channels(a):
    """Convenience: red, green, blue, max, saturation."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    sat = np.where(mx > 1e-6, (mx - mn) / np.maximum(mx, 1e-6), 0.0)
    return r, g, b, mx, sat


def not_background(a, value=0.62, sat=0.12):
    """Anything that isn't the pale, unsaturated stuff the scene is drawn *on*.

    The two thresholds together are doing something more useful than "is it light": the
    scenery in these panels — bookshelves, whiteboards, wireframe pages, stacks of paper, the
    sheet he is writing on — is all drawn in pale grey pencil and is both light *and* almost
    colourless. The character is not. Even his cream shirt, which is no darker than a
    bookshelf, is a good deal warmer than one (saturation around 0.20 against 0.08).

    Testing lightness alone cannot separate those; testing lightness and colour together
    separates them across all twelve panels, which is what makes one rule serve the whole set.
    """
    _, _, _, mx, s = channels(a)
    return ~((mx > value) & (s < sat))


def find_eyes(a, region=None, min_area=8, max_area=400):
    """Locate the pair of eyes by their whites.

    Every panel gives the character a different skin colour, so nothing keyed to green would
    survive the set. The sclera, though, is the same in all twelve — a bright, nearly
    colourless patch sitting inside a saturated face — and the two of them are the only such
    pair at matching height in the upper half of the frame.

    Returns [(x0, y0, x1, y1), ...] for the two eyes, left to right, or [] if unsure.
    """
    _, _, _, mx, sat = channels(a)
    h, w = mx.shape
    bright = (mx > 0.68) & (sat < 0.28)
    if region is not None:
        bright &= region
    bright[int(h * 0.62):] = False
    bright = ndimage.binary_opening(bright, np.ones((2, 2)))
    lab, n = ndimage.label(bright)
    blobs = []
    for i in range(1, n + 1):
        m = lab == i
        area = int(m.sum())
        if not (min_area <= area <= max_area):
            continue
        sl = ndimage.find_objects(m)[0]
        ys, xs = ndimage.center_of_mass(m)
        blobs.append(dict(area=area, cx=xs, cy=ys,
                          box=(sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)))
    # The eyes are the pair sitting at the same height, side by side, near the middle.
    best, score = None, None
    for i in range(len(blobs)):
        for j in range(i + 1, len(blobs)):
            p, q = blobs[i], blobs[j]
            gap = abs(p["cx"] - q["cx"])
            if not (12 < gap < w * 0.45):
                continue
            if abs(p["cy"] - q["cy"]) > 6:
                continue
            centre = abs((p["cx"] + q["cx"]) / 2 - w / 2)
            s = centre - (p["area"] + q["area"]) * 0.25
            if score is None or s < score:
                score, best = s, sorted([p, q], key=lambda z: z["cx"])
    return [b["box"] for b in best] if best else []


def skin(a, lo=0.25, hi=0.85):
    """The character's green. Tuned loose, because the pencil hatching varies a lot."""
    r, g, b, mx, s = channels(a)
    return (g > r + 0.01) & (g > b + 0.03) & (s > 0.13) & (mx > lo) & (mx < hi)


def solid(mask, close=5, iterations=3):
    """Close the gaps hatching leaves in a mask, then fill the interior."""
    mask = ndimage.binary_closing(mask, np.ones((close, close)), iterations=iterations)
    return ndimage.binary_fill_holes(mask)


def fill_small_holes(mask, max_area):
    """Close gaps inside a shape without swallowing the room around it.

    Plain hole-filling is too eager here. Once the desk is treated as a wall, the empty space
    between the character and the bookshelf behind him becomes an enclosed region too, and
    filling it drags the whole set into the cutout. Only genuinely small gaps — the inside of
    a sleeve, a gap between fingers — should close.
    """
    holes = ~mask
    lab, n = ndimage.label(holes)
    if n == 0:
        return mask
    out = mask.copy()
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    sizes = ndimage.sum(holes, lab, range(1, n + 1))
    for i in range(1, n + 1):
        if i in edge:
            continue                       # open to the outside, so not a hole
        if sizes[i - 1] <= max_area:
            out[lab == i] = True
    return out


def largest(mask):
    """Keep only the biggest connected piece — drops speckle for free."""
    lab, n = ndimage.label(mask)
    if n == 0:
        return mask
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    return lab == (int(np.argmax(sizes)) + 1)


def box(shape, x0, y0, x1, y1):
    m = np.zeros(shape[:2], bool)
    m[y0:y1, x0:x1] = True
    return m


def poly(shape, points):
    """A filled polygon, for the cuts that colour alone cannot make."""
    img = Image.new("1", (shape[1], shape[0]), 0)
    ImageDraw.Draw(img).polygon([tuple(p) for p in points], fill=1)
    return np.asarray(img, bool)


def grow(mask, px=1):
    return ndimage.binary_dilation(mask, np.ones((3, 3)), iterations=px)


def feather(mask, radius=0.8):
    """Bool mask to a soft 0..1 alpha."""
    alpha = ndimage.gaussian_filter(mask.astype(np.float32), radius)
    return np.clip((alpha - 0.15) / 0.7, 0, 1)


def defringe(rgb, alpha, paper, floor=0.12):
    """Pull the paper colour back out of semi-transparent edge pixels.

    This is the one step a cutout taken from a finished drawing cannot skip. The art was drawn
    *on* cream paper, so every anti-aliased edge pixel is already a blend of ink and cream:
    `C = F*a + paper*(1-a)`. Lifting it onto transparency without undoing that blend keeps the
    cream in the edge, and the result wears a pale halo the moment it is placed on anything
    darker than the paper it was drawn on.

    Solving the same equation for F recovers the un-blended colour. Pixels below `floor` alpha
    are left alone: dividing by a very small number amplifies noise into confetti.
    """
    paper = np.asarray(paper, np.float32).reshape(1, 1, 3)
    a = alpha[..., None]
    safe = np.maximum(a, 1e-3)
    recovered = (rgb - paper * (1.0 - a)) / safe
    return np.where(a > floor, np.clip(recovered, 0.0, 1.0), rgb)


def fade_edge(alpha, start, end, axis="bottom"):
    """Ramp alpha to zero across a few rows, so a cut ends deliberately.

    A hard straight cut on transparency reads as a sticker with its feet chopped off. Two or
    three rows of ramp is enough to make it look like a decision.
    """
    out = alpha.copy()
    h, w = alpha.shape
    if axis != "bottom":
        raise ValueError("only a bottom fade is needed so far")
    for y in range(min(start, h), min(end, h)):
        t = (y - start) / max(end - start, 1)
        out[y] *= 1.0 - (t * t * (3 - 2 * t))      # smoothstep
    if end < h:
        out[end:] = 0.0
    return out


def inpaint(a, holes, blur=1.2):
    """Fill `holes` with the nearest known pixel, then soften the join.

    Crude in principle and entirely adequate in practice: every hole here is small and opens
    onto a flat area — cream wall, white paper, plain desk — so 'copy the nearest thing that
    isn't a hole' produces something indistinguishable from the real background once blurred.
    """
    if not holes.any():
        return a.copy()
    _, (iy, ix) = ndimage.distance_transform_edt(holes, return_indices=True)
    filled = a[iy, ix]
    smoothed = np.stack([ndimage.gaussian_filter(filled[..., c], blur) for c in range(3)], -1)
    out = a.copy()
    wide = grow(holes, 1)
    out[wide] = smoothed[wide]
    return out


class Cut:
    """Accumulates the layers of one scene and writes them out.

    Output matches what `import_art.py` produces — trimmed WebP files plus a `layers.json` of
    sizes and positions — so `make.py`'s existing layered mode consumes it with no changes.
    """

    def __init__(self, scene_num, slug, scale=4):
        self.a, self.img = panel(scene_num)
        self.h, self.w = self.a.shape[:2]
        self.scale = scale
        self.slug = slug
        self.dir = ROOT / "art" / slug
        self.layers = {}
        self.removed = np.zeros((self.h, self.w), bool)
        self.base = self.a.copy()
        self.painted = np.zeros((self.h, self.w), bool)
        # The paper the drawing was made on. Every soft edge is partly this colour, and
        # `defringe` needs to know it in order to take it back out.
        self.paper = np.median(self.a[4:16, 4:16].reshape(-1, 3), axis=0)

    # -- authoring ---------------------------------------------------------------------

    def take(self, name, mask, *, rgb=None, radius=0.8, remove=True, dilate=0):
        """Lift `mask` out as a layer. By default the area is also cut from the background."""
        if dilate:
            mask = grow(mask, dilate)
        alpha = feather(mask, radius)
        self.add(name, self.a if rgb is None else rgb, alpha)
        if remove:
            self.removed |= mask
        return mask

    def add(self, name, rgb, alpha):
        """Register a layer from explicit colour and alpha, without touching the background."""
        self.layers[name] = (rgb.astype(np.float32), alpha.astype(np.float32))

    def paint(self, mask, sample_box, grain=True):
        """Fill an area with a flat colour sampled from elsewhere in the drawing.

        Where a lifted layer sat against a plain field — the cream wall behind the thought
        bubble — reconstructing it is not a job for an inpainter. Sampling the real wall
        colour and laying it in flat is both simpler and exactly right, where nearest-pixel
        filling would smear whatever happened to border the hole into a visible bruise.
        """
        x0, y0, x1, y1 = sample_box
        patch = self.a[y0:y1, x0:x1].reshape(-1, 3)
        colour = np.median(patch, axis=0)
        self.base[mask] = colour
        if grain:
            # The paper has a faint grain, and a perfectly flat patch reads as a hole. Faint
            # is the operative word: matching the sample's full standard deviation puts the
            # drawn detail back as speckle, so this is a fraction of it.
            amount = float(patch.std(axis=0).mean()) * 0.22
            noise = np.random.default_rng(7).normal(0, amount, (self.h, self.w, 1))
            self.base[mask] = np.clip(self.base[mask] + noise[mask], 0, 1)
        self.painted |= mask

    def background(self, name="bg"):
        """Whatever is left, with the lifted areas reconstructed."""
        patched = inpaint(self.base, self.removed & ~self.painted)
        self.add(name, patched, np.ones((self.h, self.w), np.float32))

    # -- output ------------------------------------------------------------------------

    def _render(self, rgb, alpha):
        """Un-matte the edge, upscale colour sharply and alpha smoothly, then trim."""
        rgb = defringe(rgb, alpha, self.paper)
        s = self.scale
        size = (self.w * s, self.h * s)
        colour = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).resize(
            size, Image.LANCZOS)
        # A little unsharp puts back the bite that upscaling takes off the ink lines.
        colour = colour.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
        soft = Image.fromarray((np.clip(alpha, 0, 1) * 255).astype(np.uint8)).resize(
            size, Image.BILINEAR)
        out = colour.convert("RGBA")
        out.putalpha(soft)

        arr = np.asarray(out)[..., 3]
        rows = np.where(arr.max(axis=1) > 6)[0]
        cols = np.where(arr.max(axis=0) > 6)[0]
        if not len(rows) or not len(cols):
            return out, (0, 0)
        b = (int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1)
        return out.crop(b), (b[0], b[1])

    def write(self, margin=16):
        """Render every layer, then tighten the composition around what was actually drawn.

        `margin` leaves room for parts to move without clipping at the frame edge.
        """
        self.dir.mkdir(parents=True, exist_ok=True)
        for old in self.dir.glob("*.webp"):
            old.unlink()

        rendered = {name: self._render(rgb, alpha)
                    for name, (rgb, alpha) in self.layers.items()}

        # Trim the frame to the union of the content rather than keeping the whole panel. A
        # transparent mascot should fill its box wherever it is dropped, not sit in a large
        # empty rectangle it inherited from the page it was cut out of.
        full_w, full_h = self.w * self.scale, self.h * self.scale
        x0 = max(0, min(off[0] for _, off in rendered.values()) - margin)
        y0 = max(0, min(off[1] for _, off in rendered.values()) - margin)
        x1 = min(full_w, max(off[0] + img.width for img, off in rendered.values()) + margin)
        y1 = min(full_h, max(off[1] + img.height for img, off in rendered.values()) + margin)
        frame_w, frame_h = int(x1 - x0), int(y1 - y0)

        meta = {"_frame": [frame_w, frame_h]}
        for name, (img, (ox, oy)) in rendered.items():
            img.save(self.dir / f"{name}.webp", format="WEBP", quality=92, method=6)
            meta[name] = {
                "w": img.width, "h": img.height,
                "pos": [(ox - x0 + img.width / 2) / frame_w,
                        (oy - y0 + img.height / 2) / frame_h],
            }
            print(f"    {name:18s} {img.width:4d}x{img.height:<4d} "
                  f"{(self.dir / f'{name}.webp').stat().st_size / 1024:6.1f} KB")
        print(f"    {'frame':18s} {frame_w:4d}x{frame_h:<4d}")
        (self.dir / "layers.json").write_text(json.dumps(meta, indent=2))
        return meta


def close_eye(a, slit, lash_at=0.60, blur=0.5):
    """Paint an eye shut, using the skin around it.

    Where the character already sits under heavy lids — only a crescent of eye showing — you
    can get away with carrying the lid down over the gap. Most of these twelve do not: several
    are drawn wide-eyed, and there the whole eye has to be covered. Filling that with a single
    sampled colour produces a flat bar across the face, which is what the first attempt did.

    A closed eye is really three things: lid skin above the seam, lid skin below it, and a
    dark lash line where the two meet, sitting a little below centre. Drawing it that way —
    with the skin tone taken from a ring *around* the eye rather than from the brow directly
    above it, which is usually darker than the lid — reads as an eye rather than a smudge.

    Returns (rgb, alpha) for a patch covering just the eye.
    """
    h, w = slit.shape
    out = a.copy()
    alpha = np.zeros((h, w), np.float32)
    cols = np.where(slit.any(axis=0))[0]
    if not len(cols):
        return out, alpha

    # Skin tone from a ring hugging the eye: above, below and to the sides. The brow alone is
    # usually in shadow, and sampling only there is what turned several of these into a dark
    # band across the face.
    ring = ndimage.binary_dilation(slit, np.ones((3, 3)), iterations=3) & ~slit
    ring &= ~ndimage.binary_dilation(slit, np.ones((3, 3)), iterations=1)
    skin = np.median(a[ring], axis=0) if ring.sum() > 8 else a[slit].mean(axis=0)

    tops = np.array([np.where(slit[:, x])[0].min() for x in cols], float)
    bottoms = np.array([np.where(slit[:, x])[0].max() for x in cols], float)
    if len(cols) >= 5:
        k = np.ones(5) / 5
        tops = np.convolve(np.pad(tops, 2, mode="edge"), k, mode="valid")
        bottoms = np.convolve(np.pad(bottoms, 2, mode="edge"), k, mode="valid")

    for i, x in enumerate(cols):
        y0, y1 = int(round(tops[i])), int(round(bottoms[i]))
        if y1 <= y0:
            continue
        seam = y0 + (y1 - y0) * lash_at
        for y in range(y0, y1 + 1):
            t = (y - y0) / max(y1 - y0, 1)
            # Both lids are skin; the upper one catches a little more light than the lower.
            shade = 1.03 - 0.13 * t
            out[y, x] = np.clip(skin * shade, 0, 1)
            alpha[y, x] = 1.0
        lash = int(round(seam))
        if y0 <= lash <= y1:
            dark = np.clip(skin * 0.30, 0, 1)
            out[lash, x] = dark
            if lash + 1 <= y1:
                out[lash + 1, x] = np.clip(skin * 0.55, 0, 1)
            if lash - 1 >= y0:                       # a soft crease above the seam
                out[lash - 1, x] = np.clip(skin * 0.86, 0, 1)

    if blur:
        painted = alpha > 0
        smoothed = np.stack([ndimage.gaussian_filter(out[..., c], blur) for c in range(3)], -1)
        out[painted] = smoothed[painted]
    return out, alpha
