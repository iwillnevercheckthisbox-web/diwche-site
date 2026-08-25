# Diwche

Twelve looping animations of the studio mascot, one for each stage of making something:
writing, editing, illustrating, brainstorming, pitching, laying out, colouring, submitting,
reviewing, correcting, approving, and checking the print.

They exist to make waiting legible. Instead of a spinner, the thing you are waiting for has a
face doing the job you asked for.

```
python3 build/cut_panel.py       # cut all twelve into moving parts
python3 build/gen_rigs.py        # write a rig for each
python3 build/make.py            # build the animations
open dist/index.html             # watch them all at once (switch the backdrop to dark)
```

## Where things are

```
source/          the original 12-panel contact sheet, kept for reference
character/       who Diwche is — read character-bible.md before touching anything
prompts/         only needed if you ever want a panel regenerated at higher resolution
art/             the cut layers, one folder per panel
rig/             one file per panel: which layers exist, what they hang off, how they move
build/           the pipeline
dist/            the output, plus index.html to review it
integration/     drop-in Angular pieces
```

## How it works

Each scene is a **paper puppet** cut out of the original drawing, on **full transparency** —
no background of its own, so it drops onto any page. The panel is separated into its moving
parts (body, head, eyelids, thought bubble) and a Lottie file slides and rotates them. Rigid
parts hinged at joints, exactly like cutout animation, which is the right technique for art
that is drawn rather than rendered. Mesh-warping a watercolour texture smears the grain and
looks cheap.

Everything that is *scenery* — the cream page, the bookshelf, the desk, the paper stack — is
discarded. Only the character and his thought bubble survive.

The art is **the original drawing**, not a regeneration. That is free, needs no API, cannot
drift away from the character, and is guaranteed to still be the thing you liked. The cost is
resolution: a panel is 243×168 px, so this is crisp to roughly 500 px on screen and soft past
that. Regenerating a panel larger is possible (`prompts/`) but it produces a reinterpretation,
not a bigger copy.

Blinking deserves a note, because it is most of what makes him feel alive: his eyes already
sit three-quarters shut under heavy lids, so closing them means pulling each lid down over the
remaining crescent — which is done by stretching the lid's *own pixels*, hatching and all,
rather than drawing a new shape over the top.

The layer images ship as external WebP files rather than embedded in the JSON, so the browser
caches them and each scene loads only when something asks for it.

Nothing is keyframed by hand in a GUI. A scene is described by a rig file and built by a
script, which means the art can be regenerated and everything rebuilds around it.

### The pipeline

```
prompts/  ──generate──▶  art/*.png  ──import_art.py──▶  art/*.webp + layers.json
                                                              │
                                    rig/*.rig.json  ──────────┤
                                                              ▼
                                                          make.py
                                                              │
                    ┌─────────────────────────────────────────┼──────────────────┐
                    ▼                                         ▼                  ▼
            dist/lottie/*.json                       dist/index.html    render_fallback.py
            dist/assets/*.webp                        (review page)     dist/fallback/*.webp
                    │
                install.py
                    ▼
           frontend/public/mascot/
```

| file | what it does |
|---|---|
| `build/_scenes.py` | The twelve scenes, described once. Every other script reads this. |
| `build/cutout.py` | The cutting toolkit: masks, feathering, hole-filling, eyelid painting. |
| `build/cut_panel.py` | Cuts a panel into layers. One cutter, twelve panels. |
| `build/panels.py` | The per-panel geometry: bottom line, jaw, props to drop. |
| `build/gen_rigs.py` | Writes a rig per panel from the layers the cut produced. |
| `build/gen_preview.py` | The review page, with a light/checker/grey/dark backdrop switch. |
| `build/gen_prompts.py` | Writes `prompts/NN-slug.md`. |
| `build/gen_rigs.py` | Writes starter rigs. Refuses to overwrite hand-tuning without `--force`. |
| `build/import_art.py` | Cuts alpha, despills, trims, writes `layers.json`. |
| `build/lottie.py` | The Lottie writer. ~200 lines, no dependencies. |
| `build/motion.py` | The shared motion vocabulary. |
| `build/make.py` | Builds the animations. |
| `build/gen_preview.py` | Writes `dist/index.html`. |
| `build/render_fallback.py` | Animated WebP + static posters, for reduced-motion and no-JS. |
| `build/install.py` | Copies the output into `frontend/public/mascot/`. |

## Current state

**All twelve are done** — transparent cutouts of the original drawings, each a seamless loop
of 3.2 to 4 seconds. He breathes, his head drifts, his thought bubbles float, and nine of the
twelve blink. Roughly 150 KB per scene, 2 MB for the set.

Motion is deliberately restrained: about half a percent of breath and half a degree of head
drift, so it registers on second glance rather than first. Blink timings are staggered panel
by panel, and the loops are three different lengths, so a page showing several never falls
into step.

Four do not blink. One is too pleased with himself; the other three are drawn with skin so
close in tone to their own eye-whites that a painted eyelid reads as a patch rather than a lid,
and a bad blink is worse than none.

## Things worth knowing

**The twelve looks are intentional.** Diwche is green at the writing desk, blue at the easel,
orange at the whiteboard, purple over the proofs. Each panel is its own drawing for its own
job. What holds the set together is his anatomy — horns, droopy lids, tusks, proportions — and
the drawing technique, not a fixed palette. See `character/character-bible.md`.

**A thought bubble has to be found strictly and traced loosely.** The clouds are drawn in a
pale grey line — pale enough that the same test which keeps bookshelves out of the character
also punches gaps in them, and a ring with gaps has no inside for the fill to find. So a
bubble is *located* with the strict test and then *traced* with a permissive one, bounded to
a short distance from where it was found so the trace cannot wander into the furniture behind
it. And its contents are painted over in the cloud's own colour rather than cut out of it:
subtracting them leaves a hole you can see through on a dark page.

**The animated fallbacks do not ship.** `render_fallback.py` still builds them, and they are
useful for a page that wants no JavaScript at all, but a transparent animated WebP of one of
these runs past a megabyte — alpha defeats the compression — against about 150 KB for the
Lottie it stands in for. `install.py` copies only the posters, which is what the
reduced-motion branch actually shows and costs around 30 KB.

**Judge a cutout on a dark backdrop, never on white.** The drawing was made *on* cream paper,
so every soft edge is part cream; lifted onto transparency without correction it wears a pale
halo that is invisible on a light page and obvious on a dark one. `cutout.defringe` solves the
blend equation to take the paper back out, and `dist/index.html` has a backdrop switch so the
result can actually be checked.

**Captions are HTML, never art.** The original sheet bakes a caption under each panel, and a
few panels have English words inside the thought bubbles. The cut panels exclude the captions,
and any label belongs in HTML so it localises and follows `LanguageDirection`.

**Image models cannot draw transparency** — relevant only if you regenerate a panel. Ask one
for a transparent background and it paints a grey-and-white checkerboard. That is why the
prompts ask for flat magenta and `import_art.py` keys it out; magenta and not the usual green
because Diwche is often green.

## Using them in the app

```ts
import { DiwcheDirective } from './core/diwche.directive';
import { sceneForJob } from './core/diwche-situations';

@Component({ imports: [DiwcheDirective], template: `
  <div class="mascot" [diwche]="sceneForJob(job.tag)"></div>
` })
```

Copy `integration/` into `frontend/src/app/core/`, add `lottie-web` to the frontend, and run
`build/install.py`. The directive lazy-loads the player, keeps it out of Angular's change
detection, pauses when scrolled off screen, and shows a static poster instead of loading
anything at all when the viewer prefers reduced motion.

`diwche-situations.ts` maps the app's existing `JobTag` union onto scenes, so the tray shows
the right character for whatever is running.
