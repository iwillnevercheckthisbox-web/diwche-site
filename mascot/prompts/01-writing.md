# 01 — Writing

> **Framing:** desk · **Loop:** 4.0 s (120 frames at 30 fps) · **Used for:** script and rewrite jobs (`step-rewrite`), any long text generation

He sits at a wooden desk, hunched over a sheet of paper, writing with a quill. A tall untidy stack of paper sits to his right, an inkpot and a closed green book to his left.

Read `../character/character-bible.md` first. Generate in the order below — `pose.png` comes first because every later prompt is matched against it.

## Layers

| file | role | what it is |
|---|---|---|
| `pose.png` | reference only | The whole scene, flat, on cream paper. Never shipped. |
| `bg.png` | background | The set, with no character and no moving props. |
| `body.png` | layer | Torso and resting arms, no head. |
| `head.png` | layer | Head and horns, eye sockets left empty. |
| `eyes-open.png` | layer | The two eyes at rest. |
| `eyes-closed.png` | layer | The two eyes shut. |
| `arm-right.png` | layer | The right arm, loosely holding a long feather quill pen, forearm resting on a desk. |
| `prop-quill.png` | layer | long feather quill pen |
| `prop-sheet.png` | layer | single sheet of paper with a few short wavy squiggle lines o… |
| `bubble-right.png` | layer | Empty thought cloud, trailing circles to the right. |
| `icon-right.png` | layer | a feather quill crossed over a small stack of three books |

## What it does when it moves

- The quill arm rocks through a short scribbling arc, five times per loop.
- Squiggle lines appear on the sheet one after another, then reset at the loop.
- Two or three tiny ink dots flick off the nib and fade.
- The bubble drifts up and down; the quill icon inside rocks against it.

The rig that implements this lives in `../rig/01-writing.rig.json`.

---

## 1. `pose.png` — the reference

Attach `../source/diwche.png`. This one is drawn on normal cream paper, not magenta — it is a reference for the later prompts, never an animated layer.

```
Redraw this character consistently and cleanly in one new illustration.

CHARACTER: A small, tired imp. Muted sage green skin (#7C9A63), slightly mottled, with a
cluster of small raised bumps across the forehead. Two tan horns (#C9A35E) curving up and
back, each with three or four dark ridge lines, the left sitting slightly lower than the
right. Large round wide-set eyes with red-brown irises (#8C4A3F) under HEAVY DROOPY UPPER
EYELIDS that cover the top third of each eye. Small flat nose. Wide gently downturned mouth
with two small tusks pointing up from the lower lip. No hair, no visible ears. Big head,
short pot-bellied body, short thin arms, chunky three-fingered hands.

WEARING: a cream dress shirt with the sleeves rolled to the elbow, under a brown tweed waistcoat.

FRAMING: Seen from the chest up, centred, behind a wooden table that crosses the bottom of the frame. Facing the viewer nearly square-on with a slight turn.

SCENE: He sits at a wooden desk, hunched over a sheet of paper, writing with a quill. A tall untidy stack of paper sits to his right, an inkpot and a closed green book to his left.

EXPRESSION: heavy-lidded eyes and a flat, concentrating mouth.

STYLE: Hand-drawn storybook illustration on warm cream paper (#F6F1E4) with faint visible
grain. Background elements drawn loosely in pale grey pencil with almost no colour, so they
stay far behind the subject and never compete with it. Soft grey-brown smudge shadows, never
hard-edged.

NOT: vector flat design, 3D render, photographic, high contrast, saturated colour, busy
detail, uniform line weight.

OUTPUT: No text, no letters, no numbers, no caption,
no watermark, no signature, no border, no frame. Square image, 1024 x 1024.
```

## 2. `bg.png` — the background plate

```
A wooden desk running across the bottom of the frame. Behind it, a loosely sketched bookshelf full of books. On the desk: an inkpot, a closed book, and a tall stack of loose paper on the right. Empty — no character anywhere in the image.

STYLE: Hand-drawn storybook illustration on warm cream paper (#F6F1E4) with faint visible
grain. Background elements drawn loosely in pale grey pencil with almost no colour, so they
stay far behind the subject and never compete with it. Soft grey-brown smudge shadows, never
hard-edged.

NOT: vector flat design, 3D render, photographic, high contrast, saturated colour, busy
detail, uniform line weight.

OUTPUT: No character in frame — background only. No text, no letters, no numbers, no caption,
no watermark, no signature, no border, no frame. Square image, 1024 x 1024.
```

## 3. `body.png`

Attach `pose.png`.

```
From this illustration, redraw ONLY the character's body: the torso, the shoulders, both arms hanging in a neutral resting position. Wearing a brown tweed waistcoat over a cream shirt with sleeves rolled to the elbow.

Do NOT include the head, the horns or the neck — the body ends at a clean flat cut straight across the base of the neck. Do not include the background, the desk, or any props.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

## 4. `head.png`

Attach `pose.png`.

```
From this illustration, redraw ONLY the character's head and horns, facing forward with heavy-lidded eyes and a flat, concentrating mouth. Include the forehead bumps, the flat nose, the mouth and the two tusks.

Leave the EYE SOCKETS EMPTY — draw the socket shape and its shading, but no eyeball, no iris, no pupil and no eyelid. The eyes are added as a separate layer.

Include a short neck stub at the bottom so the head overlaps the body cleanly. No body, no shoulders, no background.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

## 5. `eyes-open.png`

Attach `head.png`.

```
Draw ONLY the pair of eyes that belong in this head's empty sockets, sized and spaced to sit exactly in them. Large round eyes, off-white sclera with a warm pink-grey wash in the corners, red-brown iris, black pupil. Each eye has a HEAVY DROOPY UPPER EYELID covering the top third of it. Both eyes look downward, as if at something on a desk below.

Nothing else in the image — no face, no head, no skin. Just the two eyes.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

## 6. `eyes-closed.png`

Attach `eyes-open.png`.

```
Draw the same pair of eyes fully closed, at exactly the same position, size and spacing as the attached image. Each closed eye is a single downward-curving ink lash line with a soft crease above it. No sclera, no iris, no pupil visible.

Nothing else in the image. Just the two closed eyes.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

## 7. `arm-right.png`

Attach `pose.png`.

```
From this illustration, redraw ONLY the character's right arm, complete from the shoulder joint to the fingertips, loosely holding a long feather quill pen, forearm resting on a desk. Cream shirt sleeve rolled to the elbow, sage green three-fingered hand.

The shoulder end is a clean flat cut where it meets the torso. No body, no head, no background, and nothing else the hand is touching.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

## 8. Props

### `prop-quill.png`

```
A single long feather quill pen, drawn on its own, seen from the side, at a slight three-quarter tilt. Nothing else in the image.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

### `prop-sheet.png`

```
A single single sheet of paper with a few short wavy squiggle lines of handwriting on it, no real letters, drawn on its own, seen from slightly above, at a slight three-quarter tilt. Nothing else in the image.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

## 9. Thought bubbles

### `bubble-right.png`

```
An empty thought bubble: a classic cloud outline drawn in a loose wobbly ink line, with three small trailing circles descending from its lower left corner in decreasing size. The inside of the cloud is empty — the flat magenta background shows straight through it. Do not fill the cloud with white.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

### `icon-right.png`

```
A single a feather quill crossed over a small stack of three books, drawn small and centred, with nothing around it. No bubble, no cloud, no frame.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
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
image, 1024 x 1024.
```

---

Before importing, check every image against the list in `_layer-recipe.md`: no stray lettering, flat even magenta, no magenta on the character, skin at `#7C9A63`, and clean cuts at the joints.
