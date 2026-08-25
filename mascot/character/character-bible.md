# Diwche — character bible

The single source of truth for what Diwche looks like. Every prompt in `../prompts/`
inherits from this file. If a generated image disagrees with this document, the image is
wrong — regenerate it, do not adjust the bible.

## Who he is

Diwche (دیوچه — "little div", a small imp from Persian folklore) is the studio's
long-suffering staff creative. He does every job in the content pipeline: writes, edits,
draws, colours, checks proofs, and stamps approvals. He is competent and permanently tired.

**Personality in one line:** a deadpan perfectionist who has seen every deadline and is not
impressed by this one either.

His comedy comes from *understatement*. He does not mug at the camera or do cartoon
double-takes. He sighs, he squints, he keeps working. Animations should feel like a person
concentrating, not a character performing.

## What is fixed, and what deliberately is not

**The twelve panels are twelve different looks on purpose.** Diwche is sage green at the
writing desk, blue at the easel, orange at the whiteboard, red at the drafting table, teal
with the paints, purple over the proofs. His eyes shift between red-brown and blue, and his
proportions move around a little too. That is intentional — each panel is its own drawing for
its own job, not twelve copies of one asset.

So this file does **not** lock a single palette. What holds the set together is the anatomy
and the drawing technique; the colour is free to move.

### Fixed — the things that make him recognisably him

| Feature | Locked value |
|---|---|
| Horns | Two, curving up and slightly back, warm tan fading to cream at the tips, with 3–4 dark ridge lines across each. The left sits a touch lower than the right. |
| Skin texture | A cluster of small raised bumps across the forehead and crown, drawn as little ink circles. Fine stipple on the cheeks. |
| Eyes | Large, round, wide-set, with a warm pink-grey wash in the corners of the sclera. |
| Eyelids | **The signature feature.** Heavy, droopy upper lids covering the top third of each eye at rest — often more. Diwche always looks like he is about to fall asleep. Only two scenes lift them: Submitting, where he is delighted, and Print Check, where he is alarmed. |
| Brow | No hair. A soft ridge above each eye, shaded rather than outlined. |
| Nose | Small, flat, two simple nostril dashes. |
| Mouth | A wide, gentle downward curve at rest. Two small tusks point up from the lower lip, the left slightly longer. |
| Ears | None visible. |
| Head shape | Broad and rounded, wider at the temples, tapering to a soft chin. Roughly as wide as it is tall. |
| Proportions | Big head, short body. Head is roughly 45% of standing height. Short thin arms, chunky three-fingered hands, short legs, simple rounded feet. |
| Build | Pot-bellied and slightly hunched. He is not athletic. |

### Free to vary, scene by scene

Skin colour, eye colour, the exact cut of the outfit, and the palette of the whole panel. A
scene picks whatever suits the job being done. What must not vary is the list above, the
drawing technique below, and his temperament: deadpan, tired, and unimpressed.

## Wardrobe

The base is a **cream dress shirt with the sleeves rolled to the elbow**, under one piece that
changes per scene: a tweed waistcoat, a work apron, a cardigan, a bow tie, a knitted vest.

Rules:
- No logos, no text on clothing, ever.
- Clothing is always slightly rumpled. Nothing about Diwche is crisp.
- Nothing is fully saturated — see the palette note below.

## Palette

Per-scene skin and clothing colour is chosen freely. These are the constants that appear in
every panel regardless:

```
Horn        #C9A35E   warm tan          (tip #E8D9B0)
Paper       #F6F1E4   the cream ground everything sits on
Ink         #3A3226   warm near-black outline, never pure #000
```

And the one rule that governs whatever colour a scene does pick: **nothing is pure black, pure
white, or fully saturated.** Everything sits slightly warm and slightly desaturated, like
coloured pencil on aged paper. That restraint, not a fixed hue, is what makes the twelve read
as one set.

For reference, panel 1 (Writing) uses sage green `#7C9A63` skin (shadow `#5C7A47`, light
`#A8BE8B`) with a red-brown `#8C4A3F` iris and a brown tweed waistcoat.

## Style

Hand-drawn storybook illustration. A loose, slightly wobbly ink contour line of varying
weight — heavier under the chin and along the underside of forms, lighter on top. Inside the
contour, colour is laid in with visible **coloured-pencil hatching**, left deliberately
imperfect: it strays over the line here and there and leaves paper showing through in the
lighter areas. A soft watercolour wash pools in the shadows.

The ground is warm cream paper with faint visible grain. Shadows under objects are a single
soft grey-brown smudge, never a hard shape.

**Do not** render Diwche as: vector flat-design, 3D, Pixar-style, anime, pixel art, glossy
digital airbrush, or with clean uniform line weight. The hand-made imperfection is the brand.

## Framing

Only two compositions exist, and every scene uses one of them:

- **Desk framing** — Diwche centred, seen from the chest up, behind a wooden table that
  crosses the bottom of the frame. Props rest on the table. A loosely sketched bookshelf or
  wall sits behind him, drawn in pale grey pencil with almost no colour, so it never competes
  with the character.
- **Standing framing** — Diwche centred, full body including feet, standing on a plain cream
  ground with a single soft shadow beneath him. Props are held in his hands or stand beside
  him.

In both, he faces the viewer nearly square-on, with a slight turn. Thought bubbles float at
the upper left and/or upper right, drawn as classic cloud outlines with two or three small
trailing circles leading down toward his head.

## Text — the hard rule

**No text is ever drawn inside an illustration.** The source sheet bakes in captions
("Writing", "Approval") and English words inside bubbles ("CHECK", "ERROR", "APPROVED"). Both
are forbidden in regenerated art, for two reasons: the app is multilingual and text direction
must follow the content language via `LanguageDirection`, and baked-in text cannot be
translated or re-laid-out.

Instead:
- Captions are HTML text rendered beside or beneath the animation.
- Words that were inside bubbles become **language-neutral symbols**: ✓, ✗, a medal, a
  lightbulb, a star, a trophy, coloured pencils.
- Where a document or page appears in the art, its writing is drawn as **squiggle lines**,
  never real letterforms.
