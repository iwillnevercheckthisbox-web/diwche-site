# diwche.com v2: "One idea, many shapes"

The old site explains Diwche in paragraphs. v2 shows it: one idea travels down the page
through every step of the app and comes out the other end as a post, a carousel, a reel and
a voiceover, shaped for six channels.

Prototype: `design/v2/pipeline.html` (open it in a browser; self-contained).

## Style source

The prototype uses the apps' **Quiet style** tokens, not a new system:

- Colours, radii, type roles: `android/shared/design/tokens.json` (the same file the apps generate from).
  Warm paper and ink, one gold accent, dark tinted idea cards (`ideaBg`), green for done.
- Faces: exactly the apps' set (shared `Type.kt`): Fraunces at 500/600 with SOFT 0 / WONK 0 for titles,
  Inter Tight 400/500/600 for everything else, Vazirmatn for Persian. No italics.
- Motion: the apps' strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`, press at 0.98 / 160 ms,
  short staggers. Transform and opacity only. Reduced motion keeps fades and drops all travel and loops.

The site's `design/DNA.md` still describes Sapphire & Champagne, which the apps have since moved
away from on their main screens. If v2 goes ahead, DNA.md should be rewritten around tokens.json.

## The page

1. **Hero prism.** An idea card splits into four formats, which fan out to six channels.
   Loops idea, formats, channels. Pauses offscreen. The resting frame is the full fan.
2. **Follow one idea.** A sticky phone walks through the real app flow as you scroll:
   onboarding by voice, today's ideas, the week plan, the script, Make (with Diw at work and the
   gold progress bar from the app), publishing per channel, and results.
3. **Shaped for the place it lands.** The same idea rendered six ways: Instagram carousel,
   TikTok reel with word captions, YouTube Short, Telegram voice note and post, blog article, X thread.
4. **Meet Diw.** Waits for the new mascot art (see below).
5. **Final call.** One quiet line and the button.

## Diw v2, the new mascot

The brief and generation prompts live in `mascot/diw-v2/`. The art is made with an image model
and then cut and animated by the existing `mascot/build/` pipeline. When the poses exist, a
"Meet Diw" section showing listening, thinking, making and done goes back above the final call.

## Ideas for later

- **Live try-out.** Type your page handle and niche, get three idea cards back. The mock server in
  `mock/` can fake it until the backend has a public endpoint.
- **Persian mirror.** Switching to فارسی flips the whole story right-to-left, and the gold line runs the other way.
- **Diw as narrator.** Diw reacts at each step of the story as you scroll, using the new poses.
- **Real screens.** Replace the drawn phone screens with captures from the apps' UI harness
  (`-uiHarnessSignedIn`) through `npm run shoot`.
- **More channels.** Show LinkedIn, Threads, Pinterest and Bluesky as "coming soon" chips orbiting the fan,
  driven by the server's channel list so the site never promises more than the app does.
- **The loop closes.** After results, the line curves back to the top: what worked today shapes tomorrow's ideas.

## Next step

Port the three sections into Astro components (`src/components/v2/`), wire them to the existing
EN, DE and FA copy, and replace the current home page on this branch.
