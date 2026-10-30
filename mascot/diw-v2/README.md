# Diw v2 — character brief

The new mascot. This replaces the tired storybook imp in `../character/`. Nothing here is drawn
by code: the art is generated from `prompts.md`, then cut and animated by the existing pipeline
in `../build/`.

## Who Diw is

A **Diw** (دیو) from Persian stories, made lovable. Diw is the one inside the app who does the
work: listens to you, thinks it through, makes the post, sends it out. Diw is not scary, not
cute-for-babies, and not a monster. Think of the best craftsperson you know: grumpy face,
proud of the work, an answer for every question.

## What is fixed (every image, no exceptions)

| Trait | Detail |
|---|---|
| Gender | None. No male or female cues: no beard, no lashes, no lipstick, no breasts, no muscles-as-masculinity. |
| Head | **The main mass of the figure, about half of the total height.** Deformed: a tall onion-dome skull that rises from wide cheeks to a soft rounded point at the top, leaning very slightly back. This is where the thinking happens. |
| Horns | **Two small horns**, pointing up, on the upper forehead where the dome starts to narrow. Short, smooth, cream-coloured, slightly curved. Small next to the head. |
| Eyes | **Big**, set low on the dome, wide apart. Warm olive-green irises. Heavy upper lids that sit a little low, which gives the frown. |
| Brows | Thick, short, knitted toward the nose. |
| Ears | **Big**, long and pointed, swept back and slightly out, like the reference. Thin enough that light glows pink through them. |
| Nose | Big, soft and rounded, drooping a little. A friendly nose, not a witch's nose. |
| Mouth | Closed, a small satisfied half-smile on one side. At most one tiny fang showing. |
| Expression | **A frown of concentration together with pride in the finished job.** Not angry, not sad. |
| Skin | Warm rosy-peach, `#E6A08C` base, `#C97B6A` shade, `#F4C3B0` light. A few soft forehead wrinkles. No warts, no wet or slimy shine. |
| Body | Small and compact under the big head, a soft round belly, short arms and legs, four fingers per hand. |
| Clothing | **Half-bare.** Bare arms, shoulders and upper chest. A **burnt-orange canvas work vest** (`#D9772F`) worn open, with many pockets and loops. Dark charcoal trousers (`#2A2E3A`) rolled at the ankle. Bare feet. |
| Tools on the vest | A **vernier caliper**, a small **camera** on a strap, a **microphone** clipped to the chest, two **paintbrushes**, a pencil, a folding ruler. Every pose shows at least three of them. |

## What may change between images

Pose, hand props, which tool is in use, ear angle, eye direction, how much the smile shows.

## Style

Polished 2D, the level of a feature-animation model sheet. Clean, confident ink line with
tapered ends, heavier under forms and lighter on top. Flat colour with two-tone cel shading and
one soft rim light. A faint paper grain. Limited palette. A crisp silhouette that reads at 48 px.

**The reference photo is for the head only:** the tall pointed dome, the big ears, the big soft
nose, the low warm eyes, the gentle smile. Do not copy its realism, wet skin, wrinkled neck or
overalls.

## Colour against the site

Diw's warm pink-peach and burnt orange sit opposite the app's deep green idea cards
(`#1D2B25`). Diw on a dark green card is the brand's strongest pairing; use it for the app icon
and the hero.

## Review checklist (reject the image if any line fails)

- [ ] Head is about half the height and clearly dome-shaped with a soft point.
- [ ] Exactly two small horns, pointing up.
- [ ] Big eyes, big ears, big soft nose.
- [ ] Reads as a frown and satisfied at the same time.
- [ ] No gender cues.
- [ ] Arms and chest bare, open orange vest, at least three tools visible.
- [ ] 2D, tapered line, cel shading. Not 3D, not photo-real, not a child's drawing, not clip art.
- [ ] Background is flat pure blue `#0000FF` with no shadow, gradient or texture.
- [ ] No text, letters, numbers, logos or watermark anywhere.

## Pipeline note

The old pipeline keys out magenta. Diw's pink skin sits too close to magenta, so these prompts
use **pure blue `#0000FF`**, which appears nowhere in Diw's palette. When the art arrives, change
`KEY_RGB` in `../build/import_art.py` to `[0, 0, 255]`.
