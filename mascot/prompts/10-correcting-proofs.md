# 10 — Correcting Proofs

> **Framing:** desk · **Loop:** 3.6 s (108 frames at 30 fps) · **Used for:** error and retry states, validation failures

He sits at a desk holding up a proof page covered in red correction marks, shaking his head at it. A large red cross floats beside him.

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
| `arm-left.png` | layer | The left arm, holding up a sheet of paper at chest height. |
| `prop-proof.png` | layer | sheet of paper covered in wavy squiggle lines with several r… |
| `prop-cross.png` | layer | bold red hand-drawn cross mark |
| `bubble-left.png` | layer | Empty thought cloud, trailing circles to the left. |
| `icon-left.png` | layer | a bold red cross mark |
| `bubble-right.png` | layer | Empty thought cloud, trailing circles to the right. |
| `icon-right.png` | layer | a green tick mark |

## What it does when it moves

- His head shakes slowly from side to side — no, no, no.
- The red cross stamps in hard, then shudders and settles.
- The held proof page trembles slightly with the head shake.
- The green tick in the second bubble waits, dim, and never quite arrives.

The rig that implements this lives in `../rig/10-correcting-proofs.rig.json`.

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

WEARING: a cream dress shirt with the sleeves rolled to the elbow, under a dusty plum cardigan.

FRAMING: Seen from the chest up, centred, behind a wooden table that crosses the bottom of the frame. Facing the viewer nearly square-on with a slight turn.

SCENE: He sits at a desk holding up a proof page covered in red correction marks, shaking his head at it. A large red cross floats beside him.

EXPRESSION: heavy-lidded eyes and a distinctly unimpressed downturned mouth.

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
A wooden desk running across the bottom of the frame, with marked-up proof pages scattered on it and a red pen lying across them. A faint sketched bookshelf behind. Empty — no character anywhere in the image.

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
From this illustration, redraw ONLY the character's body: the torso, the shoulders, both arms hanging in a neutral resting position. Wearing a dusty plum cardigan over a cream shirt with sleeves rolled to the elbow.

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
From this illustration, redraw ONLY the character's head and horns, facing forward with heavy-lidded eyes and a distinctly unimpressed downturned mouth. Include the forehead bumps, the flat nose, the mouth and the two tusks.

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
Draw ONLY the pair of eyes that belong in this head's empty sockets, sized and spaced to sit exactly in them. Large round eyes, off-white sclera with a warm pink-grey wash in the corners, red-brown iris, black pupil. Each eye has a HEAVY DROOPY UPPER EYELID covering the top third of it. Both eyes look forward and slightly down, thoroughly unimpressed.

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

## 7. `arm-left.png`

Attach `pose.png`.

```
From this illustration, redraw ONLY the character's left arm, complete from the shoulder joint to the fingertips, holding up a sheet of paper at chest height. Cream shirt sleeve rolled to the elbow, sage green three-fingered hand.

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

### `prop-proof.png`

```
A single sheet of paper covered in wavy squiggle lines with several red correction marks and circles over them, no real letters, drawn on its own, seen from slightly above, at a slight three-quarter tilt. Nothing else in the image.

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

### `prop-cross.png`

```
A single bold red hand-drawn cross mark, drawn on its own, seen from the front, at a slight three-quarter tilt. Nothing else in the image.

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

### `bubble-left.png`

```
An empty thought bubble: a classic cloud outline drawn in a loose wobbly ink line, with three small trailing circles descending from its lower right corner in decreasing size. The inside of the cloud is empty — the flat magenta background shows straight through it. Do not fill the cloud with white.

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

### `icon-left.png`

```
A single a bold red cross mark, drawn small and centred, with nothing around it. No bubble, no cloud, no frame.

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
A single a green tick mark, drawn small and centred, with nothing around it. No bubble, no cloud, no frame.

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
