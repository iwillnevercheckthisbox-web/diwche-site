# 00 — The model sheet

**Only needed if you want regenerated, high-resolution art.** The twelve animations are built
by cutting up the original drawings, which needs none of this — see `../README.md`. Keep this
route for the day a panel has to be reproduced larger than the source allows.

## What this is not for

It is not for making the twelve panels consistent with each other. **They are deliberately
different** — a different palette and a different look per panel, one per job. See
`../character/character-bible.md` for what is actually fixed (the horns, the droopy lids, the
tusks, the proportions, the drawing technique) and what is free to move (skin colour, eye
colour, outfit, scene palette).

If you regenerate a panel, match **that panel**, not some averaged canon.

## The real constraint

Each panel is about 256×186 px, so the character inside is roughly 100×130 px. There is not
enough information there to upscale faithfully — a regenerated panel will be a
reinterpretation, not a bigger copy of the same drawing. That is the trade, and it is why
cutting up the original is the default and this is the exception.

## Step 1 — crop the panel you are reproducing

Crop the specific panel you need to regenerate. It is the reference; the goal is to match it,
including its own colour.

```bash
python3 - <<'PY'
from PIL import Image
im = Image.open("../source/diwche.png")
# 4 x 3 grid of 256 x 186 panels; (col, row) zero-indexed
col, row = 0, 0          # Writing; (col, row) zero-indexed, left to right, top to bottom
im.crop((col*256, row*186, (col+1)*256, (row+1)*186)).save("canon.png")
PY
```

## Step 2 — generate the turnaround

Attach `canon.png`. Iterate until you would call it the same character in every view — and
the same *version* of the character, wearing that panel's colour, not a house style.

```
Redraw this character as a clean character model sheet: three views of the SAME character
side by side on one image — front view, three-quarter view, and side profile — all at the
same height, standing in a neutral A-pose, all facing consistently.

CHARACTER: A small, tired imp. Skin colour taken from the attached reference, slightly mottled, with a
cluster of small raised bumps across the forehead. Two tan horns (#C9A35E) curving up and
back, each with three or four dark ridge lines, the left sitting slightly lower than the
right. Large round wide-set eyes with red-brown irises (#8C4A3F) under HEAVY DROOPY UPPER
EYELIDS that cover the top third of each eye. Small flat nose. Wide gently downturned mouth
with two small tusks pointing up from the lower lip. No hair, no visible ears. Big head
(about 45% of total height), short pot-bellied body, short thin arms, chunky three-fingered
hands, short legs with simple rounded feet.

WEARING: a cream dress shirt with the sleeves rolled to the elbow, under a brown tweed
waistcoat. Slightly rumpled. No logos, no writing on the clothing.

STYLE: Hand-drawn storybook illustration. Loose, slightly wobbly ink contour line in warm
near-black (#3A3226) with varying weight. Colour laid in with visible coloured-pencil
hatching that lets paper grain show through in the light areas. Soft watercolour wash in the
shadows. Warm, desaturated palette: nothing pure black, pure white, or fully saturated.

NOT: vector flat design, 3D render, Pixar style, anime, pixel art, glossy airbrush, uniform
line weight, clean digital lineart.

OUTPUT: All three views on flat cream paper (#F6F1E4). No text, no letters, no numbers, no
labels, no caption, no watermark, no border. 1024 x 1024.
```

Save the accepted result as `../character/model-sheet.png`.

## Step 3 — an expression sheet

Attach `model-sheet.png`. The twelve scenes need a known-good version of each face, so the
per-scene head prompts have something exact to match.

```
Using this character, draw a sheet of NINE head-and-shoulders expressions of the SAME
character, arranged in a three by three grid, all the same size, all facing forward:

1. neutral, heavy droopy lids
2. concentrating, lids low, mouth a flat line
3. unimpressed, mouth downturned at one corner
4. thinking, one brow ridge raised, eyes unfocused and looking up
5. small private satisfied smile
6. openly delighted, wide grin showing both tusks, eyes fully open
7. alarmed, eyes wide open, brows up, mouth a small dismayed oval
8. sceptical, eyes narrowed
9. eyes fully closed, each a single downward-curving lash line

Keep the horns, skin colour, tusks and proportions identical in all nine.

[same STYLE / NOT / OUTPUT block as above]
```

Save as `../character/expression-sheet.png`.

## Step 4 — the honest checkpoint

Put the result next to the panel it came from and ask: *is this the same drawing, bigger?* If
the answer is no, go back to step 2 or accept that cutting up the original is the better
route for this panel.

## If consistency still drifts across the twelve scenes

Prompting plus a reference image gets you most of the way. If it is not enough, the next step
up is training a small LoRA locally on twenty or thirty images derived from the model sheet,
and generating the scene layers through that. It is free, it runs on Apple Silicon, and it is
what actually delivers hard consistency — but it is a considerably larger undertaking, so
only reach for it if the simpler route visibly fails. See `how-to-generate.md`.
