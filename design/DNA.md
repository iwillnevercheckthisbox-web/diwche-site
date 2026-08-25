# Diwche — design DNA

The reference brief was craft.do. This document is what we actually took from it, what we
rejected, and the rules everything on diwche.com follows.

---

## 1. Why this looks the way it does

Three independent sources already agreed on a palette before this site existed:

| | craft.do (measured in-browser) | the app, `frontend/src/styles.scss` | the mascot, `character-bible.md` |
|---|---|---|---|
| Ground | `#FCF9F7` | `#f6f5f1` | `#F6F1E4` |
| Ink | `#030302` | `#1a1a17` | `#3A3226` |
| Display | serif at weight **400**, 66px, tracking `-1.98px` | — | — |
| Weight rule | — | "**no bold, mostly**" — 400/500 only, never 700 | — |
| Radius rule | `10px` | "**no pills, mostly**" — max 10px on content | — |
| Governing rule | — | — | "nothing is pure black, pure white, or fully saturated" |

So the identity was not invented. It is the app's own token system, warmed toward the
mascot's cream paper, with a serif display face added on top.

**What we took from craft.do:** warm paper instead of white. A serif display at weight 400 —
never bold — with tight negative tracking. Generous vertical rhythm: one idea per screen,
sections that breathe. Restraint in colour: one accent, everything else ink on paper.

**What we rejected:** craft.do's identity itself. Their warm-paper serif look reads "calm
personal notebook", and the illustrated sky-and-mountains hero is theirs. Diwche is a
production studio staffed by a tired imp. Same discipline, different room.

---

## 2. Palette

Warm paper, warm ink, one accent. Nothing saturated, nothing pure.

```
--paper      #F6F1E4   page ground (the mascot's cream)
--paper-2    #FBFAF7   raised cards, framed screenshots
--paper-3    #EFE8D6   sunken wells, code, quiet bands
--ink        #3A3226   primary text (the mascot's warm near-black)
--ink-2      #6B6459   secondary text
--ink-3      #8F8676   metadata, captions
--rule       #DCD2BC   hairlines
--horn       #C9A35E   the accent — Diwche's horn tan
--horn-deep  #A8823F   accent hover / small text on paper
--accent     #2A3A5A   deep slate — links and focus rings
--alarm      #B4463C   negative states only
```

**Accent discipline.** `--horn` is a *highlight*, not a button colour. It underlines, it
marks, it fills a small dot. Primary buttons are ink on paper, the way the app does it.
`--alarm` never appears except to describe a failure state.

**No dark mode.** The whole identity is ink on paper — a dark version would be a different
brand, not a variant. The site is light-only and says so honestly with
`color-scheme: light`.

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
- Borders are 1px `--rule` hairlines. Shadows exist only under framed screenshots, and even
  there they are wide and faint: `0 24px 60px -24px rgba(58,50,38,.28)`.
- Paper grain: a single tiled SVG noise at ~2% opacity over the ground. It is what stops
  `#F6F1E4` from reading as flat beige.

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
- The twelve panels are deliberately twelve different colour schemes. Do not recolour him to
  brand him; the anatomy is the brand, not the palette.

**Production reality:** only `01-writing` is real cut-out animation. The other eleven are one
flat upscaled panel with a camera push and the project itself says they are "not to be
shipped." So — `01-writing` animates in the hero at ≤500px; everywhere else uses the static
posters from `mascot/dist/fallback/`. Cutting real layers for the other pillar scenes is a
follow-up job, not a blocker.

**Scene mapping** (from `mascot/integration/diwche-situations.ts`):

| Placement | Scene |
|---|---|
| Hero | `01-writing` — animated |
| Know what to post | `04-brainstorming` |
| Make it | `07-coloring` |
| Publish it | `08-submitting` — eyes open, the payoff |
| Keep it yours | `11-approval` |
| Error / empty / 404 | `12-print-check` |

---

## 7. Voice

Diwche's register, applied to copy: plain, dry, faintly weary. Short sentences.

- No exclamation marks. No "supercharge", "revolutionize", "effortlessly", "unleash".
- Say the mechanism, not the adjective. "It reads 40 feeds every hour and throws away the
  38 stories that don't match you" beats "powerful intelligent filtering".
- Headlines are sentences, not slogans. Sentence case, never Title Case.
- The product is **Diwche**. Never "the platform", never "our solution".

---

## 8. Screenshots

Real captures of the app, framed in CSS rather than baked into the PNG — so the frame stays
crisp at any DPR, the callouts stay editable HTML, and the chrome restyles with the tokens.

- Capture at `deviceScaleFactor: 2`, light theme, one curated demo account, English content.
- Never publish a capture containing a real Instagram handle, token, follower count belonging
  to a client, or any credential. This is a public site.
- Frames get the wide faint shadow, a 1px `--rule` hairline, 10px radius, and a 28px title bar
  with three dots in `--rule`.
