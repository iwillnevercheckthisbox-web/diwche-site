"""The shared motion vocabulary.

Twelve animations built by twelve separate hands would look like twelve different characters.
Everything here exists so that they do not: the same breath, the same head drift, the same
blink rhythm, the same easing, applied to every scene. Only the *action beat* differs.

Every function returns a Lottie property dict ready to drop into a layer, and every one is
built to land back exactly where it started at frame `frames`, because `Comp.check_seamless`
refuses to write a file that would jump at the loop point.

Three principles worth stating, because they are what separates this from a set of pulsing
GIFs:

*   **Nothing is in phase with anything else.** The breath, the head bob and the action beat
    all use different cycle counts, so the character never ticks like a metronome.
*   **Nothing is perfectly even.** Blinks fall at uneven intervals. Taps come in twos with a
    pause. Real bodies are not periodic and the eye notices immediately when they are.
*   **Motion is small.** A 1.5% breath and a 1.2 degree head tilt read clearly at 300 px and
    stay dignified. Diwche is tired, not bouncy.
"""
from __future__ import annotations

from lottie import EASE_IN, EASE_IN_OUT, EASE_OUT, LINEAR, anim, const, hold  # noqa: F401


def _oscillation(frames, cycles, low, high, start_high=False):
    """Keyframes alternating between two values, landing back where it began."""
    steps = int(cycles * 2)
    keys = []
    for i in range(steps + 1):
        t = round(i * frames / steps)
        value = high if (i % 2 == 1) != start_high else low
        keys.append((t, value))
    keys[-1] = (frames, keys[0][1])
    return keys


def breathe(frames, amp=1.5, cycles=2):
    """Body scale. Widens slightly as it settles, the way a chest does.

    Anchor the layer at the feet (or at the table edge for a desk pose) so he swells upward
    rather than growing out of his own middle.
    """
    return anim(_oscillation(frames, cycles, [100.0, 100.0],
                             [100.0 + amp * 0.4, 100.0 - amp]))


def bob(frames, deg=1.2, cycles=1, lead=True):
    """Head rotation, deliberately on a different cycle count from the breath."""
    return anim(_oscillation(frames, cycles, -deg, deg, start_high=lead))


def sway(frames, px=3.0, cycles=1, base=(0, 0), axis="y"):
    """A slow positional drift — thought bubbles, held objects, a shifting weight."""
    bx, by = base
    low = [bx, by + px] if axis == "y" else [bx + px, by]
    high = [bx, by - px] if axis == "y" else [bx - px, by]
    return anim(_oscillation(frames, cycles, low, high))


def blink(frames, at=(0.30, 0.78), dur=4, closed=True):
    """Eyelid opacity, as hard on/off steps rather than a cross-fade.

    `at` is a sequence of positions through the loop, given as fractions. The defaults are
    deliberately uneven — 0.30 and 0.78 rather than 0.25 and 0.75 — because evenly spaced
    blinks read as mechanical.

    Set `closed=False` for the eyes-open layer to get the exact inverse.
    """
    on, off = (100, 0) if closed else (0, 100)
    keys = [(0, off)]
    for fraction in at:
        start = round(frames * fraction)
        keys.append((start, on))
        keys.append((min(start + dur, frames - 1), off))
    keys.append((frames, off))
    return hold(keys)


def act(frames, cycles, deg=6.0, ease=EASE_IN_OUT, rest=0.0):
    """The per-scene limb beat: a rocking arc repeated `cycles` times.

    `rest` biases the arc off centre, for an arm that works to one side of neutral rather
    than either side of it.
    """
    return anim(_oscillation(frames, cycles, rest - deg, rest + deg), ease=ease)


def tap(frames, count=2, deg=5.0, pause=0.45):
    """Two quick taps, then a pause — a finger against a temple, a pen against a page.

    The pause is what makes it read as a person thinking rather than a machine ticking.
    """
    keys = [(0, 0.0)]
    span = frames * (1 - pause)
    for i in range(count):
        start = round(span * (i + 0.15) / count)
        keys.append((start, deg))
        keys.append((round(span * (i + 0.55) / count), 0.0))
    keys.append((frames, 0.0))
    return anim(keys, ease=EASE_OUT)


def pop(frames, at=0.12, settle=0.28, overshoot=8.0):
    """An entrance: scale up past the target, then settle back.

    Held for the rest of the loop, then snapped back to nothing at the very end so the next
    pass can pop again.
    """
    a = round(frames * at)
    b = round(frames * settle)
    return anim([
        (0, [0.0, 0.0], (EASE_OUT[0], EASE_OUT[1])),
        (a, [100.0 + overshoot, 100.0 + overshoot]),
        (b, [100.0, 100.0]),
        (frames - 1, [100.0, 100.0]),
        (frames, [0.0, 0.0]),
    ])


def shine(frames, at=0.5, width=0.12):
    """A travelling highlight — a glint across a lens, a medal catching the light."""
    a = round(frames * (at - width))
    b = round(frames * at)
    c = round(frames * (at + width))
    return anim([(0, 0), (a, 0), (b, 100), (c, 0), (frames, 0)], ease=EASE_IN_OUT)


def flicker(frames, on_at=0.35, stutters=2):
    """A bulb catching: a couple of false starts, then steady, then out at the loop."""
    keys = [(0, 0)]
    for i in range(stutters):
        t = round(frames * (on_at - 0.08 + i * 0.03))
        keys.append((t, 100))
        keys.append((t + 2, 0))
    keys.append((round(frames * on_at), 100))
    keys.append((frames - 2, 100))
    keys.append((frames, 0))
    return hold(keys)


def reveal(frames, at, fade=3):
    """Bring something in and leave it: a squiggle of handwriting, a tick in a box."""
    t = round(frames * at)
    return anim([
        (0, 0), (max(t - 1, 1), 0), (min(t + fade, frames - 1), 100),
        (frames - 1, 100), (frames, 0),
    ], ease=EASE_OUT)


def twinkle(frames, at=0.2, dur=0.18, size=100.0):
    """A star that scales up out of nothing and back down — used for vector accents.

    Returns a *scale* property, so the values are vectors. Starting and ending at zero makes
    it inherently seamless and means the accent never sits there statically between beats.
    """
    a = round(frames * at)
    peak = round(frames * (at + dur * 0.4))
    b = round(frames * (at + dur))
    zero = [0.0, 0.0]
    return anim([
        (0, zero), (max(a, 1), zero),
        (peak, [size, size]),
        (min(b, frames - 1), zero),
        (frames, zero),
    ], ease=EASE_OUT)


def stagger(frames, index, count, span=0.5, **kw):
    """Same beat, offset per item — pencils bouncing in a row, panels lighting up in turn."""
    return reveal(frames, at=span * (index + 1) / (count + 1), **kw)


def drift_in(frames, base, distance=14, at=0.2, axis="y"):
    """A slow settle into place, used for props that arrive rather than pop."""
    bx, by = base
    start = [bx, by + distance] if axis == "y" else [bx + distance, by]
    t = round(frames * at)
    return anim([(0, start), (t, [bx, by]), (frames - 1, [bx, by]), (frames, start)],
                ease=EASE_OUT)


def push_in(frames, amount=1.6):
    """A very slow camera creep. Applied to a whole scene it adds life to otherwise flat art.

    Deliberately the slowest thing on screen — one pass per loop, no reversal until the end.
    """
    return anim([
        (0, [100.0, 100.0]),
        (round(frames * 0.55), [100.0 + amount, 100.0 + amount]),
        (frames, [100.0, 100.0]),
    ], ease=EASE_IN_OUT)
