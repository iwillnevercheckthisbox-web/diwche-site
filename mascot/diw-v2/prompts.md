# Diw v2 — generation prompts

Use these in Google AI Studio with an image-capable Gemini model (see `../prompts/how-to-generate.md`),
or any image model that accepts a reference image. Generate in this order and do not move on until
the current step passes the checklist in `README.md`.

1. Model sheet → pick one and call it `canon.png`.
2. Expression sheet, with `canon.png` attached.
3. The six poses, each with `canon.png` attached.
4. The app mark.

Save results into `art/` in this folder with the filenames given under each prompt.

Every prompt ends with the **STYLE BLOCK** at the bottom of this file, pasted verbatim.

---

## 1. Model sheet → `art/model-sheet.png`

Attach the head reference photo, and say it is for head shape only.

```
Design an original 2D cartoon character and draw a clean character model sheet: the SAME
character four times side by side, all at the same height, standing relaxed — front view,
three-quarter view, side profile, back view.

The attached photo is inspiration for the HEAD SHAPE ONLY (the tall pointed dome skull, the big
swept-back ears, the big soft nose, the low warm eyes, the gentle closed smile). Do not copy its
realism, wet skin, neck wrinkles or overalls.

CHARACTER: Diw, a lovable genderless div (a creature from Persian folklore), the hard-working
craftsperson of a small studio. Short and compact. The HEAD is the main mass of the figure,
about half of its total height: a tall onion-dome skull rising from wide cheeks to a soft
rounded point that leans very slightly back. Two SMALL smooth cream horns point straight up
from the upper forehead. Big olive-green eyes set low and wide on the face, heavy upper lids
sitting a little low, thick short brows knitted toward the nose. Big long pointed ears swept
back and out, thin enough that light shows pink through them. A big, soft, rounded nose. Closed
mouth with a small satisfied half-smile, one tiny fang. Expression: a concentrated frown mixed
with quiet pride in a job well done. Warm rosy-peach skin with a few soft forehead wrinkles.
Small round belly, short arms and legs, four fingers per hand, bare feet.
Half-bare: bare shoulders, arms and upper chest. An open burnt-orange canvas work vest with many
pockets and loops, carrying a vernier caliper, a small camera on a strap, a microphone clipped
to the chest, two paintbrushes, a pencil and a folding ruler. Dark charcoal trousers rolled at
the ankle. No gender cues of any kind.

[STYLE BLOCK]
Wide image, 2048 x 1024.
```

## 2. Expression sheet → `art/expressions.png`

Attach `canon.png`.

```
Using the attached character exactly as drawn (same head shape, horns, ears, nose, colours and
line style), draw an expression sheet: eight head-and-shoulders portraits of this character in a
4 x 2 grid, same size and same three-quarter angle.

1. Focused: knitted brows, heavy lids, mouth flat.
2. Satisfied: same frown, half-smile, eyes slightly narrowed.
3. Thinking: one brow raised, eyes up and to the side, finger on chin.
4. Listening: ears perked up and forward, eyes wide and attentive.
5. Surprised: brows up, eyes wide, small round mouth.
6. Waiting: eyelids half closed, patient, slightly bored.
7. Laughing: eyes squeezed shut, mouth open, shoulders up.
8. Proud: eyes closed, chin up, satisfied smile.

[STYLE BLOCK]
Wide image, 2048 x 1024.
```

## 3. Poses — one image each, attach `canon.png` every time

Begin every pose prompt with:

```
Using the attached character exactly as drawn (same head shape, horns, ears, nose, vest, tools,
colours and line style), draw ONE full-body image of this character:
```

Then add one of these lines, then the STYLE BLOCK and `Square image, 1024 x 1024.`

| File | Pose line |
|---|---|
| `art/listening.png` | standing, ears perked forward, holding the microphone out toward the viewer, attentive eyes, small frown. |
| `art/thinking.png` | standing, one hand on chin, the other hand on hip, eyes up and to the side, one brow raised. |
| `art/making.png` | standing three-quarter, painting with a brush in one hand and measuring with the caliper in the other, tongue at the corner of the mouth, deep focus. |
| `art/posting.png` | standing, holding up a phone-sized card toward the viewer with both hands, satisfied half-smile, frown softened. |
| `art/waiting.png` | sitting cross-legged, arms folded, eyes half closed, ears drooping slightly. |
| `art/done.png` | standing, eyes closed, chin up, arms folded, proud satisfied smile, one tool tucked under the arm. |

## 4. App mark → `art/mark.png`

Attach `canon.png`.

```
Using the attached character exactly as drawn, draw only the HEAD and the top of the shoulders,
front view, centred, the satisfied-frown expression. Simplify slightly so it reads at 48 pixels:
fewer wrinkles, bolder outline, the dome, horns, ears and nose silhouette very clear.

[STYLE BLOCK]
Square image, 1024 x 1024.
```

---

## STYLE BLOCK (paste verbatim at the end of every prompt)

```
STYLE: Polished professional 2D character art at the level of a feature-animation model sheet.
Clean, confident ink contour in warm dark brown (#2A1E22) with tapered ends, heavier under forms
and lighter on top. Flat colour with two-tone cel shading and one soft warm rim light. A very
faint paper grain. Limited palette: rosy-peach skin (#E6A08C, shade #C97B6A, light #F4C3B0),
burnt-orange vest (#D9772F), charcoal trousers (#2A2E3A), cream horns (#EFE6CF), olive-green
eyes, steel-grey tools. Crisp, readable silhouette. Appealing, charming, well-proportioned.

NOT: 3D render, photo-real, Pixar or clay style, glossy or wet skin, anime, chibi kawaii,
emoji, clip art, a child's drawing, wobbly amateur lines, uniform line weight, horror, gore,
scary teeth, any blue in the character.

BACKGROUND: Solid, flat, uniform pure blue, EXACTLY #0000FF, filling the whole frame behind the
subject. Completely even: no gradient, no texture, no vignette, no floor, no cast shadow. The
blue must not appear anywhere on the character.

OUTPUT: Subject centred with an even margin on all sides. No text, no letters, no numbers, no
labels, no captions, no logo, no watermark, no signature, no border, no frame.
```
