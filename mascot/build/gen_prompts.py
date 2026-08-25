#!/usr/bin/env python3
"""Write prompts/NN-slug.md for all twelve scenes.

The prompts are fully expanded — style blocks inlined, no placeholders left to fill in — so
each block can be copied straight into Google AI Studio or passed to the API without any
assembly. Regenerate with:  python3 build/gen_prompts.py
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _scenes import SCENES, frames  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent

STYLE_A = """STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
near-black (#3A3226) with varying weight — heavier under forms, lighter on top. Colour laid
in with visible coloured-pencil hatching that strays a little over the line and lets paper
grain show through in the light areas. Soft watercolour wash pooling in the shadows. Warm,
desaturated palette: nothing pure black, pure white, or fully saturated.

NOT: vector flat design, 3D render, Pixar style, anime, pixel art, glossy airbrush, uniform
line weight, clean digital lineart.

BACKGROUND: Solid, flat, uniform chroma-key magenta, EXACTLY #FF00FF, filling the entire
frame behind the subject. Completely even — no gradient, no shading, no texture, no paper
grain, no vignette, no shadow cast onto it. The magenta must not appear anywhere on the
subject itself.

OUTPUT: Subject centred with an even margin of magenta on all sides. No drop shadow. No text,
no letters, no numbers, no caption, no watermark, no signature, no border, no frame. Square
image, 1024 x 1024."""

STYLE_B = """STYLE: Hand-drawn storybook illustration on warm cream paper (#F6F1E4) with faint visible
grain. Background elements drawn loosely in pale grey pencil with almost no colour, so they
stay far behind the subject and never compete with it. Soft grey-brown smudge shadows, never
hard-edged.

NOT: vector flat design, 3D render, photographic, high contrast, saturated colour, busy
detail, uniform line weight.

OUTPUT: No character in frame — background only. No text, no letters, no numbers, no caption,
no watermark, no signature, no border, no frame. Square image, 1024 x 1024."""

CHARACTER = """CHARACTER: A small, tired imp. Muted sage green skin (#7C9A63), slightly mottled, with a
cluster of small raised bumps across the forehead. Two tan horns (#C9A35E) curving up and
back, each with three or four dark ridge lines, the left sitting slightly lower than the
right. Large round wide-set eyes with red-brown irises (#8C4A3F) under HEAVY DROOPY UPPER
EYELIDS that cover the top third of each eye. Small flat nose. Wide gently downturned mouth
with two small tusks pointing up from the lower lip. No hair, no visible ears. Big head,
short pot-bellied body, short thin arms, chunky three-fingered hands."""

FRAMING = {
    "desk": "Seen from the chest up, centred, behind a wooden table that crosses the bottom "
            "of the frame. Facing the viewer nearly square-on with a slight turn.",
    "standing": "Full body including the feet, centred, standing on a plain cream ground "
                "with a single soft shadow beneath. Facing the viewer nearly square-on with "
                "a slight turn.",
}


def block(text):
    return "```\n" + text + "\n```"


def layer_table(s):
    rows = [
        ("`pose.png`", "reference only", "The whole scene, flat, on cream paper. Never shipped."),
        ("`bg.png`", "background", "The set, with no character and no moving props."),
        ("`body.png`", "layer", "Torso and resting arms" + (", legs and feet" if s["rig"] == "standing" else "") + ", no head."),
        ("`head.png`", "layer", "Head and horns, eye sockets left empty."),
        ("`eyes-open.png`", "layer", "The two eyes at rest."),
        ("`eyes-closed.png`", "layer", "The two eyes shut."),
        (f"`arm-{s['arm'][0].replace(' ', '-')}.png`", "layer", f"The {s['arm'][0]} arm, {s['arm'][1]}."),
    ]
    for name, desc, _ in s["props"]:
        rows.append((f"`prop-{name}.png`", "layer", desc[:60].rstrip(", ") + ("…" if len(desc) > 60 else "")))
    for side, icon in s["bubbles"]:
        rows.append((f"`bubble-{side}.png`", "layer", f"Empty thought cloud, trailing circles to the {side}."))
        rows.append((f"`icon-{side}.png`", "layer", icon[:60].rstrip(", ") + ("…" if len(icon) > 60 else "")))
    out = ["| file | role | what it is |", "|---|---|---|"]
    out += [f"| {a} | {b} | {c} |" for a, b, c in rows]
    return "\n".join(out)


def render(s):
    n, slug = s["num"], s["slug"]
    arm_side, arm_hold = s["arm"]
    L = []
    A = L.append

    A(f"# {n:02d} — {s['title']}")
    A("")
    A(f"> **Framing:** {s['rig']} · **Loop:** {s['loop']} s ({frames(s)} frames at 30 fps) · "
      f"**Used for:** {s['usage']}")
    A("")
    A(s["scene"])
    A("")
    A("Read `../character/character-bible.md` first. Generate in the order below — `pose.png` "
      "comes first because every later prompt is matched against it.")
    A("")
    A("## Layers")
    A("")
    A(layer_table(s))
    A("")
    A("## What it does when it moves")
    A("")
    for m in s["motion"]:
        A(f"- {m}")
    A("")
    A("The rig that implements this lives in `../rig/%02d-%s.rig.json`." % (n, slug))
    A("")
    A("---")
    A("")

    # 1 — pose
    A("## 1. `pose.png` — the reference")
    A("")
    A("Attach `../source/diwche.png`. This one is drawn on normal cream paper, not magenta — "
      "it is a reference for the later prompts, never an animated layer.")
    A("")
    A(block(
        "Redraw this character consistently and cleanly in one new illustration.\n\n"
        + CHARACTER + "\n\n"
        + f"WEARING: a cream dress shirt with the sleeves rolled to the elbow, under {s['outfit']}.\n\n"
        + f"FRAMING: {FRAMING[s['rig']]}\n\n"
        + f"SCENE: {s['scene']}\n\n"
        + f"EXPRESSION: {s['expression']}.\n\n"
        + STYLE_B.replace("OUTPUT: No character in frame — background only. ", "OUTPUT: ")
    ))
    A("")

    # 2 — background
    A("## 2. `bg.png` — the background plate")
    A("")
    A(block(f"{s['background']} Empty — no character anywhere in the image.\n\n{STYLE_B}"))
    A("")

    # 3 — body
    legs = ", and the legs and feet" if s["rig"] == "standing" else ""
    A("## 3. `body.png`")
    A("")
    A("Attach `pose.png`.")
    A("")
    A(block(
        f"From this illustration, redraw ONLY the character's body: the torso, the shoulders, "
        f"both arms hanging in a neutral resting position{legs}. Wearing {s['outfit']} over a "
        f"cream shirt with sleeves rolled to the elbow.\n\n"
        "Do NOT include the head, the horns or the neck — the body ends at a clean flat cut "
        "straight across the base of the neck. Do not include the background, the desk, or any "
        "props.\n\n" + STYLE_A))
    A("")

    # 4 — head
    A("## 4. `head.png`")
    A("")
    A("Attach `pose.png`.")
    A("")
    A(block(
        f"From this illustration, redraw ONLY the character's head and horns, facing forward "
        f"with {s['expression']}. Include the forehead bumps, the flat nose, the mouth and the "
        f"two tusks.\n\n"
        "Leave the EYE SOCKETS EMPTY — draw the socket shape and its shading, but no eyeball, "
        "no iris, no pupil and no eyelid. The eyes are added as a separate layer.\n\n"
        "Include a short neck stub at the bottom so the head overlaps the body cleanly. No "
        "body, no shoulders, no background.\n\n" + STYLE_A))
    A("")

    # 5 — eyes open
    A("## 5. `eyes-open.png`")
    A("")
    A("Attach `head.png`.")
    A("")
    lids = ("Both eyes are OPEN WIDE and bright — this scene is the exception where the droopy "
            "lids lift." if slug in ("submitting", "print-check")
            else "Each eye has a HEAVY DROOPY UPPER EYELID covering the top third of it.")
    A(block(
        "Draw ONLY the pair of eyes that belong in this head's empty sockets, sized and spaced "
        "to sit exactly in them. Large round eyes, off-white sclera with a warm pink-grey wash "
        f"in the corners, red-brown iris, black pupil. {lids} {s['gaze']}\n\n"
        "Nothing else in the image — no face, no head, no skin. Just the two eyes.\n\n" + STYLE_A))
    A("")

    # 6 — eyes closed
    A("## 6. `eyes-closed.png`")
    A("")
    A("Attach `eyes-open.png`.")
    A("")
    A(block(
        "Draw the same pair of eyes fully closed, at exactly the same position, size and "
        "spacing as the attached image. Each closed eye is a single downward-curving ink lash "
        "line with a soft crease above it. No sclera, no iris, no pupil visible.\n\n"
        "Nothing else in the image. Just the two closed eyes.\n\n" + STYLE_A))
    A("")

    # 7 — action arm
    A(f"## 7. `arm-{arm_side.replace(' ', '-')}.png`")
    A("")
    A("Attach `pose.png`.")
    A("")
    A(block(
        f"From this illustration, redraw ONLY the character's {arm_side} arm, complete from "
        f"the shoulder joint to the fingertips, {arm_hold}. Cream shirt sleeve rolled to the "
        "elbow, sage green three-fingered hand.\n\n"
        "The shoulder end is a clean flat cut where it meets the torso. No body, no head, no "
        "background, and nothing else the hand is touching.\n\n" + STYLE_A))
    A("")

    # 8 — props
    A("## 8. Props")
    A("")
    for name, desc, angle in s["props"]:
        A(f"### `prop-{name}.png`")
        A("")
        A(block(f"A single {desc}, drawn on its own, seen from {angle}, at a slight "
                f"three-quarter tilt. Nothing else in the image.\n\n{STYLE_A}"))
        A("")

    # 9 — bubbles
    A("## 9. Thought bubbles")
    A("")
    for side, icon in s["bubbles"]:
        other = "left" if side == "right" else "right"
        A(f"### `bubble-{side}.png`")
        A("")
        A(block(
            "An empty thought bubble: a classic cloud outline drawn in a loose wobbly ink "
            f"line, with three small trailing circles descending from its lower {other} corner "
            "in decreasing size. The inside of the cloud is empty — the flat magenta "
            "background shows straight through it. Do not fill the cloud with white.\n\n"
            + STYLE_A))
        A("")
        A(f"### `icon-{side}.png`")
        A("")
        A(block(f"A single {icon}, drawn small and centred, with nothing around it. No bubble, "
                f"no cloud, no frame.\n\n{STYLE_A}"))
        A("")

    A("---")
    A("")
    A("Before importing, check every image against the list in `_layer-recipe.md`: no stray "
      "lettering, flat even magenta, no magenta on the character, skin at `#7C9A63`, and clean "
      "cuts at the joints.")
    return "\n".join(L) + "\n"


def main():
    out = ROOT / "prompts"
    for s in SCENES:
        path = out / f"{s['num']:02d}-{s['slug']}.md"
        path.write_text(render(s))
        print(f"wrote {path.relative_to(ROOT)}  ({len(path.read_text().splitlines())} lines)")


if __name__ == "__main__":
    main()
