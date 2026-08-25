"""A minimal Lottie (bodymovin) writer.

Small enough to read in one sitting, and it emits exactly the fields we need and no others.
The alternative — the `lottie` package on PyPI — is aimed at Telegram stickers and at
vectorising raster art, which is the opposite of what this project wants, and it ships about
one release a year. This file is ~200 lines and we control every byte.

Four rules that the format gets wrong-looking-right if you are not careful:

1.  Easing handles are **arrays** for vector properties (one entry per dimension) and plain
    **numbers** for scalar ones. Mixing these up produces a file that loads and then animates
    wrongly, which is much harder to debug than one that fails outright.
2.  Every keyframe carries `i`/`o` **except the last**, which carries neither.
3.  There is no `e` (end value) field on a modern keyframe. The end value is simply the next
    keyframe's `s`. Emitting `e` is a legacy habit and a common source of bugs.
4.  A parented layer inherits its parent's position, rotation, scale and anchor — but **not
    its opacity**. To fade a whole rig you must key opacity on every layer individually.

Units: scale is a percent, rotation is degrees, opacity is 0–100, position and anchor are
pixels. For an image layer, the anchor `ks.a` is in the *source image's own* pixel space with
the origin at its top-left — so to rotate an arm around its shoulder, set the anchor to where
the shoulder sits inside `arm.png`.
"""
from __future__ import annotations

import json

SCHEMA_VERSION = "5.7.4"

# Cubic bezier handles. Lottie's convention: `o` is the tangent leaving this keyframe, `i` is
# the tangent arriving at the next one.
EASE_IN_OUT = ((0.33, 0.0), (0.67, 1.0))
EASE_OUT = ((0.0, 0.0), (0.4, 1.0))     # leaves fast, arrives gently
EASE_IN = ((0.6, 0.0), (1.0, 1.0))      # leaves gently, arrives fast
LINEAR = ((0.0, 0.0), (1.0, 1.0))


def const(value):
    """A property that never changes."""
    return {"a": 0, "k": value}


def anim(keys, ease=EASE_IN_OUT):
    """An animated property.

    `keys` is a sequence of `(frame, value)`, or `(frame, value, ease)` to override the easing
    on that segment. A scalar value (rotation, opacity) may be given as a bare number; vector
    values (position, scale) as a list.
    """
    keys = [k if len(k) == 3 else (k[0], k[1], ease) for k in keys]
    out = []
    for idx, (t, value, seg) in enumerate(keys):
        scalar = isinstance(value, (int, float))
        kf = {"t": int(t), "s": [value] if scalar else list(value)}
        if idx < len(keys) - 1:
            (ox, oy), (ix, iy) = seg
            if scalar:
                kf["o"] = {"x": ox, "y": oy}
                kf["i"] = {"x": ix, "y": iy}
            else:
                d = len(value)
                kf["o"] = {"x": [ox] * d, "y": [oy] * d}
                kf["i"] = {"x": [ix] * d, "y": [iy] * d}
        out.append(kf)
    return {"a": 1, "k": out}


def hold(keys):
    """An animated property that steps between values instead of interpolating.

    Used for eye blinks: an eyelid is open or shut, never 40% shut.
    """
    out = []
    for idx, (t, value) in enumerate(keys):
        scalar = isinstance(value, (int, float))
        kf = {"t": int(t), "s": [value] if scalar else list(value)}
        if idx < len(keys) - 1:
            kf["h"] = 1
        out.append(kf)
    return {"a": 1, "k": out}


class Layer:
    def __init__(self, comp, ind, name, *, pos, anchor, scale=None, rot=None, opacity=None,
                 parent=None):
        self.comp = comp
        self.ind = ind
        self.name = name
        self.parent = parent
        self.ks = {
            "a": anchor if isinstance(anchor, dict) else const(list(anchor)),
            "p": pos if isinstance(pos, dict) else const(list(pos)),
            "s": scale if isinstance(scale, dict) else const(list(scale or [100, 100])),
            "r": rot if isinstance(rot, dict) else const(rot or 0),
            "o": opacity if isinstance(opacity, dict) else const(100 if opacity is None else opacity),
        }

    def _base(self):
        d = {
            "ddd": 0, "ind": self.ind, "nm": self.name, "sr": 1, "ao": 0,
            "ks": self.ks, "ip": 0, "op": self.comp.frames, "st": 0, "bm": 0,
        }
        if self.parent is not None:
            d["parent"] = self.parent.ind
        return d


class ImageLayer(Layer):
    def __init__(self, comp, ind, name, ref_id, **kw):
        super().__init__(comp, ind, name, **kw)
        self.ref_id = ref_id

    def to_dict(self):
        d = self._base()
        d["ty"] = 2
        d["refId"] = self.ref_id
        return d


class ShapeLayer(Layer):
    def __init__(self, comp, ind, name, shapes, **kw):
        super().__init__(comp, ind, name, **kw)
        self.shapes = shapes

    def to_dict(self):
        d = self._base()
        d["ty"] = 4
        d["shapes"] = self.shapes
        return d


class NullLayer(Layer):
    """An invisible layer that exists only to be a parent.

    Lottie gives each layer exactly one transform, so a body cannot both breathe and be
    pushed in by a slow camera move — both want `ks.s`. Parenting the body to a null solves
    it: the null carries the camera, the body carries the breath, and they compose.
    """

    def to_dict(self):
        d = self._base()
        d["ty"] = 3
        return d


class Comp:
    """One animation. Add layers back-to-front; they are reordered on output."""

    def __init__(self, name, width, height, frames, fps=30):
        self.name = name
        self.width = int(width)
        self.height = int(height)
        self.frames = int(frames)
        self.fps = fps
        self.assets = []
        self.layers = []       # back-to-front, i.e. the order you would paint them
        self._ind = 0

    def _next_ind(self):
        self._ind += 1
        return self._ind

    def asset(self, ref_id, filename, width, height):
        """Register an external image.

        `u` is deliberately left empty: the player sets `assetsPath` at load time, which
        overrides it. That keeps the JSON independent of where it ends up being served from,
        which matters because lottie-web resolves a non-empty `u` relative to the *document*
        URL rather than to the JSON's own location — so a relative path silently 404s on any
        route deeper than the root.
        """
        self.assets.append({
            "id": ref_id, "w": int(width), "h": int(height), "u": "", "p": filename, "e": 0,
        })
        return ref_id

    def image(self, name, ref_id, **kw):
        layer = ImageLayer(self, self._next_ind(), name, ref_id, **kw)
        self.layers.append(layer)
        return layer

    def shape(self, name, shapes, **kw):
        layer = ShapeLayer(self, self._next_ind(), name, shapes, **kw)
        self.layers.append(layer)
        return layer

    def null(self, name, **kw):
        kw.setdefault("pos", [self.width / 2, self.height / 2])
        kw.setdefault("anchor", [self.width / 2, self.height / 2])
        layer = NullLayer(self, self._next_ind(), name, **kw)
        self.layers.append(layer)
        return layer

    def check_seamless(self):
        """Fail loudly if any property would visibly jump at the loop point.

        A seam is the single most noticeable defect in a looping animation and the easiest to
        introduce by accident, so it is checked rather than eyeballed.
        """
        problems = []
        for layer in self.layers:
            for prop, value in layer.ks.items():
                if value.get("a") != 1:
                    continue
                keys = value["k"]
                first, last = keys[0], keys[-1]
                if first["s"] != last["s"]:
                    problems.append(
                        f"{self.name}/{layer.name}.{prop}: starts {first['s']} "
                        f"but ends {last['s']}")
                if last["t"] != self.frames:
                    problems.append(
                        f"{self.name}/{layer.name}.{prop}: last keyframe at frame "
                        f"{last['t']}, loop is {self.frames}")
        return problems

    def to_dict(self):
        problems = self.check_seamless()
        if problems:
            raise ValueError("loop would seam:\n  " + "\n  ".join(problems))
        return {
            "v": SCHEMA_VERSION, "nm": self.name, "ddd": 0,
            "fr": self.fps, "ip": 0, "op": self.frames,
            "w": self.width, "h": self.height,
            "assets": self.assets,
            # Lottie paints the array front-to-back: element 0 is the topmost layer. We author
            # back-to-front because that is how you think about a stack of cutouts.
            "layers": [layer.to_dict() for layer in reversed(self.layers)],
        }

    def write(self, path):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_dict(), separators=(",", ":")))
        return path


def rect(width, height, colour=(0.965, 0.945, 0.894), opacity=100, radius=0):
    """A filled rectangle — used for the paper ground behind a scene."""
    return [{
        "ty": "gr", "nm": "rect", "it": [
            {"ty": "rc", "p": const([0, 0]), "s": const([width, height]), "r": const(radius)},
            {"ty": "fl", "c": const([*colour, 1]), "o": const(opacity), "r": 1},
            {"ty": "tr", "a": const([0, 0]), "p": const([0, 0]), "s": const([100, 100]),
             "r": const(0), "o": const(100)},
        ],
    }]


def star(points=4, outer=40, inner=12, colour=(1.0, 0.93, 0.6), opacity=100):
    """A filled star, as a shape group. Pure vector — costs a few hundred bytes."""
    return [{
        "ty": "gr", "nm": "star", "it": [
            {"ty": "sr", "sy": 1, "pt": const(points), "p": const([0, 0]), "r": const(0),
             "or": const(outer), "ir": const(inner), "os": const(0), "is": const(0)},
            {"ty": "fl", "c": const([*colour, 1]), "o": const(opacity), "r": 1},
            {"ty": "tr", "a": const([0, 0]), "p": const([0, 0]), "s": const([100, 100]),
             "r": const(0), "o": const(100)},
        ],
    }]


def dot(radius=8, colour=(0.23, 0.20, 0.15), opacity=100):
    """A filled circle."""
    return [{
        "ty": "gr", "nm": "dot", "it": [
            {"ty": "el", "p": const([0, 0]), "s": const([radius * 2, radius * 2])},
            {"ty": "fl", "c": const([*colour, 1]), "o": const(opacity), "r": 1},
            {"ty": "tr", "a": const([0, 0]), "p": const([0, 0]), "s": const([100, 100]),
             "r": const(0), "o": const(100)},
        ],
    }]
