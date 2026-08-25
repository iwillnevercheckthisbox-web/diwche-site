#!/usr/bin/env python3
"""Cut any panel into a transparent character cutout.

    python3 build/cut_panel.py              # every configured panel
    python3 build/cut_panel.py writing      # one

The machinery is shared; what differs per panel lives in `panels.py`. That split is the whole
point — twelve drawings, one cutter, twelve short configs.

The general shape of the job, and why each step is there:

1.  **Separate the drawing from the scenery.** `not_background` does this on its own, and
    across all twelve: bookshelves, whiteboards, wireframes and stacks of paper are all pale
    *and* colourless, while the character never is — not even his cream shirt.
2.  **Lift the thought bubbles.** They float clear of everything, so they fall out as their
    own connected components with no help.
3.  **Cut the furniture away.** The desk, the chair, the easel and so on are the only things
    the character actually touches, and colour cannot separate them from his clothing — the
    desk and his waistcoat are near enough the same brown. So each panel names a bottom line
    and, occasionally, a prop to drop.
4.  **Fill against those cuts as walls.** His shirt is the same cream as the page, so testing
    ink alone reads his sleeves as background and he comes out with bare arms. Treating the
    desk as solid closes each sleeve's outline into a region that fills.
5.  **Split head from body**, so the head can drift, and paint the eyelids shut for the blink.
"""
from __future__ import annotations

import pathlib
import sys

import numpy as np
from scipy import ndimage

sys.path.insert(0, str(pathlib.Path(__file__).parent))

import cutout as C          # noqa: E402
from panels import PANELS, BY_SLUG   # noqa: E402


def bubble_layers(cut, a, ink, loose, boxes=None):
    """Every floating thing above the character: clouds, and the icons inside them.

    Anything that is not connected to the main mass and sits in the upper part of the frame is
    floating by definition. Clusters are split left and right of centre so the two sides can
    drift on their own timing rather than as one block.
    """
    H, W = a.shape[:2]
    if boxes:
        # Where a bubble touches the scenery it cannot be found by connectivity, so the panel
        # names it outright.
        taken = np.zeros((H, W), bool)
        for i, bx in enumerate(boxes):
            mask = C.solid(ink & C.box(a.shape, *bx), close=3, iterations=2)
            if mask.sum() < 40:
                continue
            mask = complete_outline(mask, loose & C.box(a.shape, *bx))
            side = "l" if (bx[0] + bx[2]) / 2 < W / 2 else "r"
            cloud_rgb, cloud_mask, contents = split_cloud(a, ink, mask)
            cut.add(f"bubble-{side}", cloud_rgb, C.feather(cloud_mask, 0.7))
            if contents is not None:
                cut.take(f"icons-{side}", contents, radius=0.6, remove=False)
            taken |= cloud_mask
        return taken

    filled = C.solid(ink, close=3, iterations=2)
    lab, n = ndimage.label(filled)
    if n == 0:
        return np.zeros((H, W), bool)
    sizes = ndimage.sum(filled, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1

    # A real bubble is a substantial shape. Anything small only counts if it is sitting right
    # next to one — which is exactly what the little trailing circles are, and is not true of
    # the odd speck left over from a pencil line.
    candidates = []
    for i in range(1, n + 1):
        if i == main or sizes[i - 1] < 8:
            continue
        piece = lab == i
        ys, xs = np.where(piece)
        if ys.mean() > H * 0.62:          # too low to be floating above him
            continue
        candidates.append((sizes[i - 1], piece, xs.mean(), ys.mean()))

    seeds = [c for c in candidates if c[0] >= 150]
    kept = list(seeds)
    for c in candidates:
        if c in seeds:
            continue
        if any(abs(c[2] - s[2]) < 40 and abs(c[3] - s[3]) < 40 for s in seeds):
            kept.append(c)

    clusters = {"l": np.zeros((H, W), bool), "r": np.zeros((H, W), bool)}
    for _, piece, cx, _cy in kept:
        clusters["l" if cx < W / 2 else "r"] |= piece

    taken = np.zeros((H, W), bool)
    for side, mask in clusters.items():
        if mask.sum() < 40:
            continue
        mask = complete_outline(mask, loose)
        cloud_rgb, cloud_mask, contents = split_cloud(a, ink, mask)
        cut.add(f"bubble-{side}", cloud_rgb, C.feather(cloud_mask, 0.7))
        if contents is not None:
            cut.take(f"icons-{side}", contents, radius=0.6, remove=False)
        taken |= mask
    return taken


def complete_outline(mask, loose):
    """Recover a thought bubble's full outline before trying to fill it.

    The clouds are drawn in a pale grey line — pale enough that the test which keeps
    bookshelves out of the character also punches gaps in them. A ring with gaps in it has no
    inside: the fill leaks straight out through the holes, and what comes back is a blobby
    fragment of the cloud with the quill hanging outside it in mid-air.

    Once the bubble has been *located*, though, its neighbourhood is just paper — the scenery
    has already been cut away — so a far more permissive test is safe there, and it closes the
    line. Locate strictly, then trace loosely.
    """
    ys, xs = np.where(mask)
    pad = 6
    box = np.zeros_like(mask)
    box[max(0, ys.min() - pad):ys.max() + pad + 1,
        max(0, xs.min() - pad):xs.max() + pad + 1] = True

    near = C.solid(loose & box, close=3, iterations=2)
    lab, n = ndimage.label(near)
    if not n:
        return mask
    keep = set(np.unique(lab[mask & near])) - {0}
    if not keep:
        return mask
    grown = np.isin(lab, list(keep))

    # Keep the loose trace on a short leash. Being permissive is safe *near* the bubble and
    # reckless further out: a bookshelf a few pixels away merges into the same blob at this
    # threshold and gets carried along as part of the cloud. Bounding the growth to a short
    # distance from where the bubble was strictly found closes the outline without annexing
    # the furniture behind it.
    reach = ndimage.binary_dilation(mask, np.ones((3, 3)), iterations=8)
    return ndimage.binary_fill_holes(grown & reach)


def split_cloud(a, ink, mask):
    """Separate a thought bubble's cloud from whatever is floating inside it.

    Two traps here, both of which the first attempt fell into.

    The contents are not simply "ink far enough inside the shape". Measuring by distance from
    the edge, a stack of books sitting in the middle counts and a quill reaching up toward the
    rim does not — so half the contents stay welded to the cloud. What actually distinguishes
    them is connectivity: the outline is one connected ring that touches the shape's border,
    and everything else inside is a separate island.

    And the cloud must not have its contents *subtracted*. Cutting them out leaves a
    book-shaped hole through the white fill, which against a dark page is a hole you can see
    straight through. The contents are painted over in the cloud's own interior colour
    instead, and drawn again on top as their own layer.
    """
    filled = ndimage.binary_fill_holes(mask)
    inside = ink & filled
    rim = filled & ~ndimage.binary_erosion(filled, np.ones((3, 3)), iterations=2)

    lab, n = ndimage.label(inside)
    if n:
        outline_ids = set(np.unique(lab[rim & inside])) - {0}
        contents = inside & ~np.isin(lab, list(outline_ids)) if outline_ids else np.zeros_like(inside)
        contents = ndimage.binary_opening(contents, np.ones((2, 2)))
        contents = C.grow(contents, 1) & filled
    else:
        contents = np.zeros_like(inside)

    cloud_rgb = a.copy()
    # Only worth its own layer if there is a real amount of it. Most of these bubbles have
    # contents drawn touching the rim, which makes them part of the outline by the test above
    # — and a bubble that drifts as one piece is no worse than one that drifts in two.
    if contents.sum() > 400:
        # The interior is the paper showing through the cloud; paint the contents out with it
        # so the fill stays whole.
        blank = filled & ~ink
        interior = (np.median(a[blank], axis=0) if blank.sum() > 20
                    else np.median(a[filled], axis=0))
        cloud_rgb[contents] = interior
        return cloud_rgb, filled, contents
    return cloud_rgb, filled, None


def head_polygon(shape, jaw_y, neck_x0, neck_x1):
    """Where the head ends and the shoulders begin.

    Expressed as three numbers per panel rather than a traced outline: a jaw height, and the
    two sides of the neck. The taper is what keeps the shoulders from being dragged along when
    the head drifts.
    """
    H, W = shape[:2]
    return [
        (0, 0), (W, 0), (W, jaw_y - 8),
        (neck_x1 + 12, jaw_y - 2), (neck_x1, jaw_y + 10),
        (neck_x0, jaw_y + 10), (neck_x0 - 12, jaw_y - 2),
        (0, jaw_y - 8),
    ]


def cut_one(cfg):
    slug = f"{cfg['num']:02d}-{cfg['slug']}"
    print(f"  {slug}")
    cut = C.Cut(cfg["num"], slug, scale=4)
    a, H, W = cut.a, cut.h, cut.w
    r, g, b, mx, sat = C.channels(a)
    ink = C.not_background(a)

    # ------------------------------------------------------------------- the cuts
    excluded = np.zeros((H, W), bool)
    # Everything below the panel's bottom line: desk, table, ground, whatever he sits behind.
    bottom = list(cfg["bottom"])
    excluded |= C.poly(a.shape, [(0, bottom[0][1])] + bottom + [(W, bottom[-1][1]), (W, H), (0, H)])
    for box in cfg.get("drop", []):
        excluded |= C.box(a.shape, *box)
    for pts in cfg.get("drop_poly", []):
        excluded |= C.poly(a.shape, pts)
    if cfg.get("chair"):
        # Upholstery runs redder than anything he wears, which is the only thing that tells
        # a chair back from a tweed waistcoat.
        x0, y0, x1, y1 = cfg["chair"]
        chair = ((r > g + 0.09) & (g > b + 0.01) & (mx > 0.22) & (mx < 0.64)
                 & C.box(a.shape, x0, y0, x1, y1))
        excluded |= C.grow(ndimage.binary_opening(chair, np.ones((2, 2))), 1)

    # Only now look for what is floating. Done before the cuts, a bookshelf breaks into
    # dozens of little line fragments, every one of them "not connected to the character and
    # sitting up high" — which is exactly the test for a thought bubble, so the shelf gets
    # collected as one.
    # Anything at all darker than the paper. Too blunt to find a character with, but the right
    # tool once we already know where a bubble is.
    paper = np.median(a[2:10, 2:10].reshape(-1, 3), axis=0)
    loose = mx < (float(paper.max()) - 0.03)
    excluded |= bubble_layers(cut, a, ink & ~excluded, loose & ~excluded, cfg.get("bubbles"))

    # ---------------------------------------------------------------- the figure
    # Find him by colour, not by ink. The scenery in these panels is drawn in grey pencil —
    # bookshelves, whiteboards, wireframes, stacks of paper — and grey is the one thing the
    # character never is. Even his cream shirt carries noticeably more colour than a
    # bookshelf. Working from a saturated core and then growing out to pick up his own dark
    # outline separates him from the room in a way no brightness threshold can, because the
    # shelf *lines* are as dark as he is.
    # A couple of panels dress him in grey, which is exactly the colour this test uses to
    # recognise scenery, so the threshold is adjustable per panel.
    core = (sat > cfg.get("sat", 0.17)) & ~excluded
    core = ndimage.binary_closing(core, np.ones((3, 3)), iterations=2)
    core = C.largest(ndimage.binary_opening(core, np.ones((2, 2))))

    gap = int(H * W * 0.02)
    figure = C.grow(core, 2) & ink & ~excluded
    figure = C.fill_small_holes(
        ndimage.binary_closing(figure, np.ones((3, 3)), iterations=2), gap)
    figure = C.largest(figure)

    jaw_y, neck_x0, neck_x1 = cfg["jaw"]
    head = C.largest(ndimage.binary_fill_holes(
        figure & C.poly(a.shape, head_polygon(a.shape, jaw_y, neck_x0, neck_x1))))
    body = figure & C.box(a.shape, 0, jaw_y - 14, W, H)

    body_alpha = C.feather(body, 0.9)
    cut_at = int(max(y for _, y in bottom))
    body_alpha = C.fade_edge(body_alpha, cut_at - 4, cut_at)
    cut.add("body", a, body_alpha)
    cut.add("head", a, C.feather(head, 0.9))

    # ------------------------------------------------------------------- the blink
    eyes = [] if cfg.get("blink") is False else (cfg.get("eyes") or C.find_eyes(a, region=head))
    if len(eyes) < 1:
        if cfg.get("blink") is not False:
            print("    ! no eyes found — this panel gets no blink")
    else:
        # The eye is its white, plus whatever that white encloses — the iris and pupil.
        # Trying to name the iris by colour does not generalise: across twelve panels the
        # irises are red-brown, blue and black on skin of six different hues, and any rule
        # loose enough to catch them all also catches most of the face, which is what turned
        # these blinks into a bar across the eyes.
        lids = np.zeros((H, W), np.float32)
        lid_rgb = a.copy()
        for (x0, y0, x1, y1) in eyes:
            pad = 2
            window = C.box(a.shape, x0 - pad, y0 - pad, x1 + pad, y1 + pad) & head
            if not window.any():
                continue
            # Brightest-in-the-box rather than brightest-in-the-panel. An absolute threshold
            # works while the character is dark green, and falls apart the moment he is drawn
            # in pale tan — then his whole face passes for eye-white. Judging each eye against
            # its own surroundings holds across all twelve.
            level = np.percentile(mx[window], 55)
            eye = window & (mx >= level)
            eye = ndimage.binary_fill_holes(
                ndimage.binary_closing(eye, np.ones((3, 3)), iterations=2))
            if not eye.any():
                continue
            slit = C.grow(C.largest(eye), 1)
            rgb, alpha = C.close_eye(a, slit)
            lid_rgb = np.where(alpha[..., None] > 0, rgb, lid_rgb)
            lids = np.maximum(lids, alpha)
        if lids.any():
            cut.add("eyes-closed", lid_rgb, C.feather(lids > 0.5, 0.6))

    cut.write()
    return sorted(cut.layers)


def main(argv):
    wanted = argv[1:]
    todo = [BY_SLUG[s] for s in wanted] if wanted else PANELS
    for cfg in todo:
        cut_one(cfg)
        print()


if __name__ == "__main__":
    main(sys.argv)
