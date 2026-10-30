# diwche.com v2: "Content from 0 to 100"

**The narrative (owner, 2026-10-30):** Diwche covers content from 0 to 100. It understands you, brings ideas, writes
scripts for every medium (story, post, carousel, reel), and gives you the tools to make them: Photo Studio, Video
Studio, D1, Make a post templates and looks. Then it shows you what worked. Every section serves that line.
The app is not in the stores yet: the call to action is "Get early access" (mail to support@diwche.com), never
"Get the app". Other channels (YouTube, TikTok, Telegram, X, blog) are planned and may be shown.
The page uses the live site's logo (horns + wordmark) and a little of the current mascot until Diw v2 art exists.

## Earlier framing: "One idea, many shapes"

The old site explains Diwche in paragraphs. v2 shows it: one idea travels down the page
through every step of the app and comes out the other end as a post, a carousel, a reel and
a voiceover, shaped for six channels.

Prototype: `design/v2/pipeline.html` and `design/v2/usecases.html`, sharing `site.css`, `i18n.js`, `personas.js` and `home.js`.

## Languages

English, Deutsch and فارسی out of the box (`i18n.js`). The page follows the browser language and remembers a
choice. Persian flips the whole page right-to-left, switches to Vazirmatn, uses Persian digits, and takes its
product words (جلوه‌ها, دوباره بچین, سبک زیرنویس, the 30 caption look names) from the app's own strings.

## Use cases (`usecases.html`)

Six pages: a nutritionist, a pet-treat shop, a café, a fitness coach, a Persian home-cooking page and an art
meme page. Each has a user story, how Diwche helps, a week of posts, and the presets it uses. Their slides are
drawn in the app's real carousel design families (Sage, Editorial, Linen, Poster, Saffron) with real brand palettes.

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

## The page (order as of 2026-10-30)

Hero → motion explainer → From 0 to 100 (sticky phone) → The tools to make it → Make a post templates →
Looks (Post studio) → The idea behind Diw (with the mascot) → Channels → Who it's for → Final call → Footer with contact.

### Original section notes

1. **How it works, as motion graphics.** A live, scene-based sequence under the headline, in the style of a
   Remotion explainer: one idea; it becomes a script whose lines are colour-coded building blocks (hook, body,
   ask); the blocks fly into the post, carousel, story, reel and voiceover; Shuffle re-grades the post with real
   looks and caption looks; everything goes out to six channels. Play, pause and jump to any scene.
2. **Follow one idea.** A sticky phone walks through the real app flow as you scroll:
   onboarding by voice, today's ideas, the week plan, the script, Make (with Diw at work and the
   gold progress bar from the app), publishing per channel, and results.
3. **Create · Post.** The app's Post screen: eight pictures or your own photo; all 67 looks in 10 families
   with their codes (P1, F12 …) and a strength ruler, each applied from its real colour table; the 12 one-tap
   recipes; all 30 caption looks on 5 shelves, drawn with their real fonts, colours, boxes and highlight modes;
   and Shuffle. Data comes straight from the backend's looks.json and caption-looks.json.
4. **The idea behind Diw.** The Diw (دیو) from Persian stories, small and working for you, shown through its
   real live lines in English and the app's Tehrani Persian. No mascot drawing until the new art exists.
5. **Shaped for the place it lands.** The same idea rendered six ways: Instagram carousel,
   TikTok reel with word captions, YouTube Short, Telegram voice note and post, blog article, X thread.
6. **Who it's for.** Six persona cards linking to `usecases.html`.
7. **Final call.** One quiet line and the button.

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
