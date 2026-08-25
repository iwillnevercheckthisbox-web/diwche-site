# Shared style block

Every prompt in `../prompts/` ends with this text verbatim. Keeping it identical across all
ninety-odd generations is most of what holds the twelve scenes together as one set.

## Read this before you write a prompt: image models cannot draw transparency

Gemini's image models — and every other current text-to-image model — output **flat RGB with
no alpha channel**. When you ask one for "a transparent background" it does not produce
transparency; it *draws a grey-and-white checkerboard*, because it learned the visual
convention for transparency rather than the concept. Asking politely does not fix this.

So we never ask for transparency. We ask for a **flat chroma-key background** and cut the
alpha ourselves in `../build/import_art.py`.

**The key colour is magenta `#FF00FF`, not the usual green.** Diwche is sage green; keying on
green would eat the character. Magenta appears nowhere in his palette, which is exactly why
it was chosen.

Two variants below: **A** for anything that becomes an animated layer (chroma background,
alpha cut locally), **B** for the one flat background plate per scene (which is opaque anyway,
so no keying needed).

---

## Variant A — character and prop layers (chroma key)

```
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

## Variant B — background plates (opaque, no keying)

```
STYLE: Hand-drawn storybook illustration on warm cream paper (#F6F1E4) with faint visible
grain. Background elements drawn loosely in pale grey pencil with almost no colour, so they
stay far behind the subject and never compete with it. Soft grey-brown smudge shadows, never
hard-edged.

NOT: vector flat design, 3D render, photographic, high contrast, saturated colour, busy
detail, uniform line weight.

OUTPUT: No character in frame — background only. No text, no letters, no numbers, no caption,
no watermark, no signature, no border, no frame. Square image, 1024 x 1024.
```

---

## Why 1024 and not 2048

`gemini-3.1-flash-image` is a 1024px-class model; 2048 is not available from it without a
separate upscale pass, and the only Gemini that renders natively at 2K is a premium model.
More to the point, Diwche renders at roughly 200–400 px in the app. Twelve scenes × seven
layers at 2048 px is a punishing payload for a mascot nobody views at full size. 1024 px
source, shipped as WebP, is the right trade. Upscaling is available later if a hero use ever
needs it, and costs nothing to defer.

## Why "no text" is repeated so insistently

Image models add captions to illustrations unprompted, especially when the prompt describes a
labelled scene. Every generation must be checked for stray lettering before it is imported;
see the hard rule in `character-bible.md`.
