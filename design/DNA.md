# Diwche — design DNA

The rules everything on diwche.com follows.

**2026-08-26 — the identity moved.** The site, the product and the login page all wear
**Sapphire & Champagne** now: a near-black neutral ladder, sapphire as the one loud accent,
champagne gold as a highlight only. The warm-paper look this document used to describe is
gone. §1 records where the old identity came from and why it was replaced; §2 and §4 are the
current rules. §3 (type), §5 (motion), §6 (mascot) and §7 (voice) are unchanged — the faces,
the easing and the imp all survived the repaint, because none of them was ever about colour.

---

## 1. Where this came from

### The identity it replaced

The reference brief was craft.do, and three independent sources agreed on a warm palette
before this site existed:

| | craft.do (measured in-browser) | the app, `frontend/src/styles.scss` | the mascot, `character-bible.md` |
|---|---|---|---|
| Ground | `#FCF9F7` | `#f6f5f1` | `#F6F1E4` |
| Ink | `#030302` | `#1a1a17` | `#3A3226` |
| Display | serif at weight **400**, 66px, tracking `-1.98px` | — | — |
| Weight rule | — | "**no bold, mostly**" — 400/500 only, never 700 | — |
| Radius rule | `10px` | "**no pills, mostly**" — max 10px on content | — |
| Governing rule | — | — | "nothing is pure black, pure white, or fully saturated" |

That identity was not invented either — it was the app's own token system, warmed toward the
mascot's cream paper, with a serif display face added on top.

### Why it changed

The same reasoning still holds, and it is why this was a repaint rather than a rebrand:
**the site follows the product.** The product moved to Sapphire & Champagne, so the site did
too. What carried over untouched is everything that was never about colour — a serif display at
weight 400 with tight negative tracking, generous vertical rhythm, one accent and no more,
radius capped at 10px, and the rule that nothing is pure black, pure white, or fully saturated
(`--paper` is `#05070C`, not `#000`; `--ink` is `#EEF1F9`, not `#FFF`).

What we still reject is craft.do's identity itself. Diwche is a production studio staffed by a
tired imp. Same discipline, different room — the room is just darker now.

---

## 2. Palette — Sapphire & Champagne

A neutral ladder carries every large surface. Two accents, each with exactly one job.

```
--paper       #05070C   page ground
--paper-2     #0E131E   raised cards, framed screenshots
--paper-3     #090D15   sunken wells, code, quiet bands
--paper-4     #141A28   hover on a raised surface
--ink         #EEF1F9   primary text
--ink-2       #97A2BD   secondary text
--ink-3       #55607D   metadata, captions
--rule        #2A3450   hairlines
--rule-soft   #171E2D   the quieter hairline
--horn        #C9A668   champagne — the highlight
--horn-soft   #E6C98C   light gold — labels, tag text
--horn-deep   #6B5527   deep bronze — borders, dim states
--accent      #0F52BA   sapphire — primary action
--accent-soft #5B8FF9   periwinkle — glow, hover text, icon fill
--accent-dim  #0A2F6E   midnight sapphire — gradient ends, borders
--alarm       #E05A6A   negative states only
```

**Neither accent is ever a large flat fill.** Sapphire appears as gradients, glows, and small
elements — the primary button, a focus ring, a link. Champagne appears only as hairlines, tag
text and borders, stat left-rules, hover underlines, and small marks. `--horn` is a
*highlight*, not a button colour: it underlines, it marks, it fills a small dot, and it draws
the 1px line around a sapphire button. `--alarm` never appears except to describe a failure.

**Two effects are load-bearing, not decoration.**

1. **The sheen.** Every raised surface carries
   `linear-gradient(150deg, var(--shine) 0%, transparent 40%)` over it. A flat `--paper-2`
   fill with no sheen reads as a grey box, not as glass. Do not skip it.
2. **The ambient glow.** Two wide radial washes on the page ground — sapphire top-left
   (`--glow-1`), champagne top-right (`--glow-2`). They are what give the page a light source
   and stop `#05070C` reading as dead charcoal. The grain still tiles over the top.

**Dark is the identity, and now there is a switch.** Light-on-near-black is still what Diwche
looks like, and it is what a reader gets with no JS and no stated preference. But as of
2026-08-27 the site carries a theme toggle in the nav — a reversal of the rule this section
used to state ("a marketing page should make one confident choice, not ask"), made
deliberately rather than by drift.

The light room is the same identity in different light: the neutral ladder inverts, sapphire is
unchanged because it holds on both grounds, and champagne darkens to `#8A6A2C` — `#C9A668` on
near-white is a highlight nobody can see. Everything else in this section still applies,
including that nothing is pure black or pure white.

Mechanically: the light values live in one block in `tokens.css` under `[data-theme='light']`,
an inline script in `Base.astro` resolves stored choice → system preference → dark before first
paint, and `color-scheme` and `theme-color` follow.

---

## 3. Type

**Display — Fraunces Variable** (self-hosted, `@fontsource-variable/fraunces`)
Fraunces has `SOFT` and `WONK` axes: softened terminals and a slightly off-kilter cut. That
is the closest a typeface gets to the mascot's "loose, slightly wobbly ink contour."

```css
font-family: 'Fraunces Variable', Georgia, ui-serif, serif;
font-weight: 400;                                    /* only ever 400 */
font-variation-settings: 'SOFT' 40, 'WONK' 1, 'opsz' 120;
letter-spacing: -0.03em;
```

**Body / UI — Geist Variable** (self-hosted, `@fontsource-variable/geist`) — the same face
the app uses, so the site and the product speak in one voice. Weights 400 and 500. Never 600+.

**Scale** (clamped for viewport, values below are the desktop ceiling):

| Role | Size | Line-height | Face |
|---|---|---|---|
| Hero | 66px | 1.00 | Fraunces |
| Section | 52px | 1.08 | Fraunces |
| Subhead | 34px | 1.18 | Fraunces |
| Lead paragraph | 21px | 1.55 | Geist |
| Body | 17px | 1.65 | Geist |
| Meta / caption | 14px | 1.45 | Geist |
| Eyebrow | 13px, `0.08em` tracking, uppercase | 1 | Geist 500 |

Tracking tightens as size grows: `-0.035em` at hero, `-0.01em` at body, `+0.08em` at eyebrow.

---

## 4. Space and shape

Rhythm: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 140`.

- Section padding: 140px vertical desktop, 80px tablet, 56px mobile.
- Content max width 1120px; prose max width 68ch; hero copy max 20ch per line.
- **Radius max 10px** on content surfaces. The one pill on the site is the nav CTA.
- Borders are 1px hairlines: `--rule-soft` around a raised surface, `--rule` where a divider
  has to be seen, `--horn-deep` where a mark is meant to be noticed.
- Shadows exist only under framed screenshots. Still wide and faint, but deeper than the old
  warm ones — a shadow on a near-black ground barely registers otherwise — and paired with a
  1px inset white highlight that gives the surface its top edge (`--shadow-frame`).
- Grain: a single tiled SVG noise at ~5% over the ground, under the two glow washes. Same job
  as before, one step stronger because near-black shows less of it than cream did.

---

## 5. Motion

Governed by the `emil-design-eng` and `animate` skills. The site is *marketing* — seen once,
not a hundred times a day — so motion is allowed, but it explains rather than decorates.

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);    /* enters — strong, not CSS's weak ease-out */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* on-screen movement */
--dur-fast: 160ms;   /* press feedback */
--dur:      220ms;   /* hovers, small reveals */
--dur-slow: 420ms;   /* scroll reveals, section entrances */
```

Rules, all of them enforced at review time by `review-animations`:

1. **Only `transform` and `opacity`.** Never `all`, never height/width/margin.
2. **Never `ease-in`.** It delays the first frame — the moment the eye is on it.
3. **Never `scale(0)`.** Entrances start at `0.96` with `opacity: 0`.
4. **Scroll reveals fire once**, `IntersectionObserver` with `once: true` and a `-80px`
   margin. Opacity plus 8px of travel. No parallax anywhere.
5. **Stagger 50ms** between siblings, never more. Stagger never blocks interaction.
6. **Press feedback** `scale(0.98)` at 160ms on every button and card link.
7. **Hover motion is gated** behind `@media (hover: hover) and (pointer: fine)`.
8. **`prefers-reduced-motion: reduce` removes movement, keeps opacity.** The mascot does not
   merely pause — the Lottie player is never downloaded, and the poster image renders instead.

---

## 6. Diwche in the layout

Canon lives in `mascot/character/character-bible.md`. What matters for the site:

- He is "a deadpan perfectionist who has seen every deadline and is not impressed by this one
  either." His comedy is understatement. **He never mugs at the camera.**
- The signature feature is the heavy droopy eyelids. Only two scenes lift them: `08-submitting`
  (delighted) and `12-print-check` (alarmed). Those two are therefore the punctuation of the
  site — use them where the copy earns a change of expression, nowhere else.
- **No text is ever drawn inside an illustration.** Every caption is HTML. This is a canon rule
  and it also keeps the site translatable later.
- Do not recolour him to brand him; the anatomy is the brand, not the palette.

**2026-08-27 — the art was redrawn.** The twelve flat panels are gone. The character is now
four hand-drawn scenes in `mascot/new resources/`, with curled ram's horns rather than the
earlier tapering pair. The rules above did not move; only the drawings did.

**Production reality:** `npm run mascot:build` turns those four JPEGs into self-contained
animated SVGs in `public/mascot/v2/`. Each carries the cut-out drawing, a float and breathe
loop, and its own `prefers-reduced-motion` rule, so the site needs no animation player at all —
`Mascot.astro` is an `<img>`.

The art stays raster inside the SVG on purpose. Autotracing a colour-quantised copy would
posterise away the loose ink contour and the pencil hatching, which is the one thing this
section says is the brand.

Two of the four were drawn on black. Their trousers, ink shading and interiors are the same
value as the ground, so no flood fill can separate art from background — those two keep a
near-black panel of their own, with a hairline. On the dark theme it reads as nothing; on the
light theme it is a deliberate dark panel. The other two cut free and float on either ground.

**2026-08-27, later the same day — the homepage moved to a second set of drawings.**
Five new illustrations arrived with the landing-page copy, already cut out on transparency.
They live in `art/source/`, are built to WebP by `npm run art:build`, and are placed by
`Art.astro`. The mascot pipeline (`mascot/`, `public/mascot/v2/`, `Mascot.astro`) is
untouched and still the canon build for the four animated scenes — the homepage simply no
longer uses it. Every rule in this section still applies to both sets.

| Placement | Drawing | Treatment |
|---|---|---|
| Hero | `hero-camera` | cut out, ≤460px, eager |
| Ten-creator pilot | `pilot-crowd` | cut out, ≤340px |
| Discover your next big topic | `topics-thinking` | cut out, ≤360px |
| Create it your way | `create-writing` | cut out, ≤360px |
| Publish and schedule | `publish-mailbox` | cut out, ≤360px |

The horns from the same set are the nav mark and the touch icon (`public/brand/horns.png`).
The favicon stays the drawn SVG — it has to hold at 16px, which a painting does not.

---

## 7. Voice

Diwche's register, applied to copy: plain, dry, faintly weary. Short sentences.

- No exclamation marks. No "supercharge", "revolutionize", "effortlessly", "unleash".
- Say the mechanism, not the adjective. "It reads 40 feeds every hour and throws away the
  38 stories that don't match you" beats "powerful intelligent filtering".
- Headlines are sentences, not slogans. Sentence case, never Title Case.
- The product is **Diwche**. Never "the platform", never "our solution".

**2026-08-27 — the homepage copy is a stated exception.** The landing-page text was written
outside this document and adopted as given: it is Title Case, it says "effortlessly", "ultimate
content engine" and "high-performing", and the hero is a slogan rather than a sentence. That is
a deliberate decision about the marketing page, not drift — everything else on the site, and
every section of the homepage that was not replaced, still follows the rules above. Revisit it
when the copy is next rewritten.

**2026-08-28 — rewritten, exception lifted.** The hero, the pilot section, the capability
names, and the AI-positioning section were rewritten to follow the rules above: sentence case,
no hype adjectives, mechanism over adjective, product named as Diwche. The two remaining
untouched pillar rows and the reliability/pricing sections were already in voice and did not
need changing.

---

## 8. Screenshots

Real captures of the app, framed in CSS rather than baked into the PNG — so the frame stays
crisp at any DPR, the callouts stay editable HTML, and the chrome restyles with the tokens.

- Capture at `deviceScaleFactor: 2`, **dark theme** (the app's default), one curated demo
  account, English content.
- Never publish a capture containing a real Instagram handle, token, follower count belonging
  to a client, or any credential. This is a public site.
- Frames get the wide faint shadow, a 1px `--rule-soft` hairline, 10px radius, and a 28px
  title bar with three dots in `--horn`.
