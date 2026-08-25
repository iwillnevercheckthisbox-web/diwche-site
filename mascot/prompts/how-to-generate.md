# How to generate the art

## Read this first: models cannot draw transparency

Every current text-to-image model, Gemini included, outputs **flat RGB with no alpha
channel**. Ask one for a transparent background and it will cheerfully paint you a
grey-and-white checkerboard, because it learned what transparency *looks like* rather than
what it *is*.

So none of the prompts ask for transparency. They ask for a flat **magenta `#FF00FF`**
background, and `../build/import_art.py` cuts the alpha locally. Magenta rather than the
usual chroma green because Diwche is sage green — keying on green would eat the character.

## The order of work

1. `00-model-sheet.md` — establish canon. **Do not skip this.** Everything else is matched
   against it.
2. For each scene, `NN-slug.md` in order: `pose` → `bg` → `body` → `head` → `eyes-open` →
   `eyes-closed` → `arm` → props → bubbles.
3. Drop the files into `../art/NN-slug/` using exactly the filenames in each scene's layer
   table.
4. `python3 ../build/import_art.py` — keys out the magenta, trims, finds anchors, writes WebP.
5. `python3 ../build/make.py` — builds the animations.

## Route A — free, in the browser

[Google AI Studio](https://aistudio.google.com) with an image-capable Gemini model.

- Attach the reference image the prompt names, paste the prompt block, generate, download.
- Save into `../art/NN-slug/` under the exact filename from the scene's layer table.
- Check each result against the list at the bottom of `_layer-recipe.md` before moving on. It
  is much cheaper to regenerate now than after you have built a rig around a bad layer.

Cost: nothing. The limit is the free tier's daily quota.

**On quotas:** Google no longer publishes per-tier rate limits publicly — the rate-limits page
now points you at your own dashboard. Check yours at
`aistudio.google.com/rate-limit` rather than trusting any number quoted elsewhere. Budget for
this taking more than one sitting: twelve scenes at roughly seven to eleven layers each is
about ninety to a hundred and twenty generations, plus retries.

**One thing to be aware of:** free-tier usage may be used to improve Google's models. If
Diwche is meant to be proprietary brand IP, use route B or a paid tier instead.

## Route B — scripted, using the key this repo already has

The backend already talks to Gemini: `app.gemini.api-key` in
`backend/src/main/resources/application-local.properties`, model `gemini-3.1-flash-image`, via
`backend/src/main/java/com/sma/config/GeminiClient.java`.

Two caveats before wiring anything to it:

- `GeminiImageGeneratorService.generateImage()` is **text-prompt only** today — it builds
  `contents:[{parts:[{text:...}]}]` with no image part. These prompts all need an attached
  reference image, so they need an `inlineData` part. `GeminiClient.generateContent()` takes a
  raw body map, so no client change is needed, but the image-editing path itself does not
  exist yet.
- That service **falls back to OpenAI on 429/503**. For banner generation that is a sensible
  degradation; for character-consistent layer art it would silently produce something in a
  completely different style. Any script written for this must bypass the fallback.

Given both, the cleaner option is a small standalone Python script under `../build/` that
reads the key from the properties file and calls the API directly, rather than routing through
the backend service.

Cost: a few dollars for the full set at current flash-image pricing.

## If consistency will not hold

Prompt + reference image is the cheap route and usually enough. When it is not, the escalation
path, in order of effort:

1. **Regenerate the model sheet.** Most drift traces back to a weak canon, not to the scene
   prompts.
2. **Feed two references** — the model sheet *and* the scene's `pose.png` — so the model has
   both the character design and the exact pose to match.
3. **Train a LoRA locally.** Twenty to thirty images derived from the model sheet, then
   generate every scene layer through it with a fixed seed. This is what actually delivers
   hard consistency. It runs free on Apple Silicon via MLX or ComfyUI, needs roughly 16 GB of
   unified memory, and costs a day of setup.

There is also a newer class of models that decompose a scene into separate RGBA strata
natively — real layers with real alpha, which is exactly this project's shape. Worth checking
the state of that before committing to a LoRA, since it would remove the chroma-key step
entirely.

## Cutting the alpha

`import_art.py` handles this, with two strategies:

- **Chroma key** (default) — an HSV mask on the magenta, dilated a couple of pixels to catch
  the anti-aliased fringe, then a despill pass that pulls the magenta cast out of edge pixels.
  Pure NumPy. Works on anything: props, detached arms, thought bubbles.
- **BiRefNet matting** — this repo already runs one at `bg-removal-service/app.py`
  (`POST /remove-bg`, multipart `file`, `X-API-Key`). It is the best free matting model
  available and it is already containerised. Better than chroma key for clean single-subject
  silhouettes like `body` and `head`; worse for thin or multi-part subjects, since it assumes
  one subject. Opt in per layer with `"matte": "birefnet"` in the scene's rig file.

## What to check before importing

The full checklist is at the bottom of `_layer-recipe.md`. The two that catch the most
failures: **stray lettering anywhere in the image**, and **a background that is painted paper
texture rather than flat magenta** — the second cannot be recovered and has to be regenerated.
