# diwche.com v2: "One idea, many shapes"

The old site explains Diwche in paragraphs. v2 shows it: one idea travels down the page
through every step of the app and comes out the other end as a post, a carousel, a reel and
a voiceover, shaped for six channels.

Prototype: `design/v2/pipeline.html` (open it in a browser; self-contained).

## Imagery

The running example is an art meme page, @oldmasters.daily. Every picture is a public-domain old master
painting, so no living person appears and there is no GDPR or likeness risk. Three short 9:16 reels are
made from them with ffmpeg and graded with the app's looks. Sources and status: `assets/CREDITS.md`.

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

1. **Anatomy of a post.** The centrepiece. A 3D particle body you scroll through like five
   anatomical plates, with callouts drawn like a technical illustration:
   - **I · The whole.** A finished post, its handle, hook, visual and caption labelled.
   - **II · Ideas.** It comes apart into idea cells. Each nucleus is why the idea fits your page.
   - **III · Script.** The cells twist into a double helix: hook, body and ask as base pairs.
   - **IV · Formats.** The helix opens into an exploded view: post, carousel, story, reel, voiceover.
   - **V · Channels.** The formats route out to Instagram, TikTok, YouTube, Telegram, blog and X,
     with gold pulses travelling the routes.
   Built with three.js (r128 from cdnjs), one shader morphing 15,000 particles between five shapes
   (8,000 on phones). Pauses offscreen. Reduced motion removes the drift and the swirl between plates.
2. **Follow one idea.** A sticky phone walks through the real app flow as you scroll:
   onboarding by voice, today's ideas, the week plan, the script, Make (with Diw at work and the
   gold progress bar from the app), publishing per channel, and results.
3. **Looks.** An interactive studio: pick a painting or upload your own photo, then a look (the app's
   real Portra, Teal & orange and Mono colour tables, applied in the browser), a caption preset (the app's
   names: Clean, Gold word, Big word, Box, Newsline, Marker, Two tone) and a motion. Diw's line reports the work.
4. **The idea behind Diw.** The div from Persian stories, small and working for you, shown through its
   real live lines in English and the app's Tehrani Persian. No mascot drawing until the new art exists.
5. **Shaped for the place it lands.** The same idea rendered six ways: Instagram carousel,
   TikTok reel with word captions, YouTube Short, Telegram voice note and post, blog article, X thread.
6. **Final call.** One quiet line and the button.

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
