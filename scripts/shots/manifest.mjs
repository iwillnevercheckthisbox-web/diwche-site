/**
 * Every capture in the guide, declared rather than scripted.
 *
 * A shot is a small object, not code, so that adding one is a five-line diff and
 * so `--list` can print the whole set without launching a browser. The runner in
 * `../shoot.mjs` knows how to execute the fields; nothing here does any work.
 *
 * Fields
 *   name        the filename and the key articles reference: <Shot name="…" />
 *   path        app route, relative to SHOOT_BASE_URL
 *   ready       a selector that only exists once the real data has rendered
 *   settle      ms to wait after `ready` — charts and filmstrips animate in
 *   steps       things to do before the shutter (see the verbs in shoot.mjs)
 *   clip        { selector, pad } to capture one panel instead of the whole page
 *   hide        selectors to `visibility: hidden` — clocks, spinners, toasts
 *   mask        selectors to paint over — anything identifying that slipped in
 *   viewport    override the default 1440x900 @2x
 *   theme       'dark' (default) or 'light'
 *   label       the caption in the frame's title bar
 *   alt         the description; required, because it ships in the manifest
 *   section     the guide section, for --only filtering and for the contact sheet
 *   allowEmpty  opt out of the empty-state assertion, for genuinely empty screens
 *   project     seed a video-editor project first (see editor-fixture.mjs)
 *
 * DNA §8 is enforced by the runner, not by discipline here: it refuses to write
 * anything unless the base URL is local.
 */

const ACCOUNT = process.env.SHOOT_ACCOUNT_ID || '1';

/**
 * Chrome that would date a capture, or that differs between the capture stack
 * and the app a reader is looking at.
 *
 * `.build-tag` reads "vunknown" here — the version is stamped at release and the
 * e2e image is not a release — which in a screenshot looks like something is
 * broken rather than like something is absent.
 */
const CHROME_NOISE = ['.toast', '.toast-host', '.build-tag'];

/**
 * The viewport for a clipped panel shot.
 *
 * Narrower than the page default on purpose. A card captured at 1440px is a
 * 2184x360 strip, and shown inside a prose column it is a grey smear — the
 * reader cannot read the button they are being told to press. At 1024 the same
 * card is half as wide and twice as tall, so at the width it is displayed the
 * type is the size it is on screen.
 */
const PANEL = { viewport: { width: 1024, height: 1200, deviceScaleFactor: 2 } };

/** The editors need room; at 1440 the inspector and the pool are both cramped. */
const WIDE = { viewport: { width: 1680, height: 1050, deviceScaleFactor: 2 } };

/**
 * A seeded video-editor project, opened past the media-folder gate.
 *
 * `project: true` tells the runner to create one through the real API and hand
 * the browser an OPFS vault handle before navigating — see editor-fixture.mjs.
 */
const EDITOR = { ...WIDE, project: true, section: 'studio' };

/** Applied to every full-page shot; the clipped ones never include the rail. */
const FULL_PAGE = { hide: CHROME_NOISE };

export const SHOTS = [
  // ---- accounts ----------------------------------------------------------
  {
    ...FULL_PAGE,
    name: 'accounts-list',
    section: 'accounts',
    path: '/accounts',
    ready: '[data-shot="account-row"]',
    settle: 900,
    label: 'Accounts',
    alt: 'The accounts list, each row showing its progress ring, seven-day ribbon and follower sparkline.',
  },
  {
    ...PANEL,
    /* Account 2, not account 1: the seed leaves 1 connected and 2 bare, so both
       states are a real screen rather than the same card with its badge edited. */
    name: 'ig-card-not-connected',
    section: 'accounts',
    path: '/accounts/2',
    ready: '[data-shot="ig-card"]',
    settle: 700,
    clip: { selector: '[data-shot="ig-card"]', pad: 16 },
    label: 'Instagram connection',
    alt: 'The Instagram connection card before an account is connected, showing the Connect Instagram button.',
  },
  {
    ...PANEL,
    name: 'ig-card-connected',
    section: 'accounts',
    path: `/accounts/${ACCOUNT}`,
    ready: '[data-shot="ig-card"] [data-shot="ig-badge"]',
    settle: 700,
    clip: { selector: '[data-shot="ig-card"]', pad: 16 },
    label: 'Connected',
    alt: 'A connected Instagram card: a green Connected badge, the handle it posts as, and the granted permissions.',
  },
  {
    ...FULL_PAGE,
    name: 'identity-top',
    section: 'accounts',
    path: `/accounts/${ACCOUNT}`,
    ready: '[data-shot="identity-form"]',
    settle: 700,
    steps: [{ click: '[data-shot="tab-identity"]' }, { waitFor: '[data-shot="identity-form"]' }],
    label: 'Account Identity',
    alt: 'The top of Account Identity: name, page name, handle, slogan and the default palette picker.',
  },
  {
    ...PANEL,
    name: 'identity-designs',
    section: 'accounts',
    path: `/accounts/${ACCOUNT}`,
    ready: '[data-shot="designs-card"]',
    settle: 700,
    steps: [
      { click: '[data-shot="tab-identity"]' },
      { waitFor: '[data-shot="designs-card"]' },
      { scroll: '[data-shot="designs-card"]' },
    ],
    clip: { selector: '[data-shot="designs-card"]', pad: 16 },
    label: 'Designs',
    alt: 'The Designs card, with one dropdown each for post, carousel, story, reel cover and reel frame.',
  },
  {
    ...PANEL,
    name: 'identity-reply',
    section: 'accounts',
    path: `/accounts/${ACCOUNT}`,
    ready: '[data-shot="reply-card"]',
    settle: 700,
    steps: [
      { click: '[data-shot="tab-identity"]' },
      { waitFor: '[data-shot="reply-card"]' },
      { scroll: '[data-shot="reply-card"]' },
      { settle: 400 },
    ],
    clip: { selector: '[data-shot="reply-card"]', pad: 16 },
    label: 'Comment auto-reply',
    alt: 'The comment auto-reply block, with the switch, the character who answers, and a reply preview.',
  },

  // ---- your page ---------------------------------------------------------
  {
    ...FULL_PAGE,
    name: 'ideas-today',
    section: 'page',
    path: `/ideas?accountId=${ACCOUNT}`,
    ready: '[data-shot="topic-card"]',
    settle: 1200,
    label: 'Ideas · Today',
    alt: "Today's topics, each card showing its format, pillar, why-now line, hook and fact anchor.",
  },
  {
    ...PANEL,
    name: 'ideas-topic-card',
    section: 'page',
    path: `/ideas?accountId=${ACCOUNT}`,
    ready: '[data-shot="topic-card"]',
    settle: 1200,
    clip: { selector: '[data-shot="topic-card"]', pad: 12 },
    label: 'One topic',
    alt: 'A single topic card close up, with the Make, Keep and Not this buttons along its foot.',
  },
  {
    ...FULL_PAGE,
    name: 'ideas-week',
    section: 'page',
    path: `/ideas?accountId=${ACCOUNT}&tab=week`,
    ready: 'h2',
    settle: 1400,
    allowEmpty: true,
    label: 'Ideas · This week',
    alt: "The This week tab before a plan has been made, showing the Plan this week button.",
  },
  {
    ...FULL_PAGE,
    name: 'ideas-market',
    section: 'page',
    path: `/ideas?accountId=${ACCOUNT}&tab=market`,
    ready: 'h2',
    settle: 1400,
    allowEmpty: true,
    label: 'Ideas · Market',
    alt: 'The Market tab, showing the peer benchmark line and where breakouts appear.',
  },
  {
    ...FULL_PAGE,
    name: 'ideas-direction',
    section: 'page',
    path: `/ideas?accountId=${ACCOUNT}`,
    ready: 'details',
    settle: 1200,
    steps: [{ waitFor: 'details' }, { scroll: 'details' }, { settle: 500 }],
    allowEmpty: true,
    label: 'Your Direction',
    alt: 'The Direction card at the foot of Ideas: audience, promise, pillars, voice and the Never list.',
  },
  {
    ...FULL_PAGE,
    name: 'performance-top',
    section: 'page',
    path: '/performance',
    ready: 'chart-line svg, chart-bars svg',
    settle: 2000,
    steps: [{ selectText: { selector: 'select', text: 'Frame & Pigment' } }, { settle: 1200 }],
    label: 'Performance',
    alt: 'The top of Performance: the five standing figures and the growth chart beneath them.',
  },
  {
    ...FULL_PAGE,
    name: 'performance-hours',
    section: 'page',
    path: '/performance',
    ready: 'h2',
    settle: 2200,
    /* The account is remembered, but the sections below the fold only exist once
       its insights have arrived — so wait for the first chart before looking for
       a heading four sections further down. */
    /* Pick the account explicitly rather than relying on the one the page
       remembers: a capture that only works when some earlier shot happened to
       visit the same screen first is not a capture you can re-run. */
    steps: [
      { selectText: { selector: 'select', text: 'Frame & Pigment' } },
      { waitFor: 'chart-line svg' },
      { settle: 1400 },
      { scrollToText: { text: 'When to post' } },
      { settle: 1000 },
    ],
    label: 'When to post',
    alt: 'The two When to post charts side by side — followers online by hour, and average reach by hour published.',
  },

  // ---- create ------------------------------------------------------------
  {
    ...FULL_PAGE,
    name: 'create-menu',
    section: 'create',
    path: '/create',
    ready: '.card-grid',
    settle: 700,
    allowEmpty: true,
    label: 'Create',
    alt: 'The Create page: Post, D1 Studio, Reel, Story and RSS as five cards.',
  },
  {
    ...FULL_PAGE,
    name: 'create-post-open',
    section: 'create',
    path: '/create',
    ready: '.post-type-choices',
    settle: 500,
    steps: [{ click: '.create-card-post' }, { waitFor: '.post-type-choices' }, { settle: 400 }],
    allowEmpty: true,
    label: 'Post',
    alt: 'The Post card expanded, offering Article Carousel, Data Infographic and Single Post.',
  },
  {
    ...FULL_PAGE,
    name: 'carousel-sources',
    section: 'create',
    path: '/infographic',
    /* The whole form is hidden behind "Select an account above" until one is
       picked, so the source tabs this shot is of do not exist before that. */
    /* Angular writes its option values as "index: value", so the account is
       picked by the label rather than by a string that encodes a list position. */
    steps: [{ selectText: { selector: 'select', text: 'Frame & Pigment' } }, { settle: 2500 }],
    ready: 'app-source-input, .source-tabs, textarea',
    settle: 1500,
    allowEmpty: true,
    label: 'Article Carousel',
    alt: 'The Article Carousel page with its three source tabs: URL, File and Prompt.',
  },
  {
    ...FULL_PAGE,
    name: 'data-infographic',
    section: 'create',
    path: '/data-infographic',
    ready: 'h1',
    settle: 1200,
    allowEmpty: true,
    label: 'Data Infographic',
    alt: 'The Data Infographic page, with the Standard and Freestyle modes and its two source tabs.',
  },
  {
    ...FULL_PAGE,
    name: 'stories-settings',
    section: 'create',
    path: '/stories',
    ready: 'h1',
    settle: 1200,
    allowEmpty: true,
    label: 'Stories',
    alt: 'The Stories page: the posting times, the candidate pool size, and the buttons that post one now.',
  },
  {
    ...FULL_PAGE,
    name: 'rss-page',
    section: 'create',
    path: '/rss',
    ready: 'h1',
    settle: 1400,
    allowEmpty: true,
    label: 'RSS Pipeline',
    alt: 'The RSS page, where feeds, keywords and the posting schedule for an account are set.',
  },
  {
    ...FULL_PAGE,
    name: 'reels-source',
    section: 'create',
    path: '/reels',
    ready: 'h1',
    settle: 1400,
    allowEmpty: true,
    label: 'Reels Studio',
    alt: 'Reels Studio at step one, choosing between an article and a prompt as the source.',
  },

  // ---- d1 ----------------------------------------------------------------
  {
    ...FULL_PAGE,
    name: 'd1-ask',
    section: 'd1',
    path: '/d1',
    ready: '.ask-choices',
    settle: 900,
    allowEmpty: true,
    label: 'D1 Studio',
    alt: 'D1 Studio asking whether you have filmed it yet, with the two doors it opens.',
  },
  {
    ...FULL_PAGE,
    name: 'd1-idea',
    section: 'd1',
    path: '/d1',
    ready: 'textarea',
    settle: 700,
    steps: [{ click: '.ask-choices button' }, { waitFor: 'textarea' }, { settle: 500 }],
    allowEmpty: true,
    label: 'What is this one about?',
    alt: 'The idea door: a box for the subject with a microphone in it, a language, and a list of suggested topics.',
  },
  {
    ...FULL_PAGE,
    name: 'd1-footage',
    section: 'd1',
    path: '/d1',
    ready: '.dropzone',
    settle: 700,
    steps: [
      { click: '.ask-choices button:nth-of-type(2), .ask-choices > button + button' },
      { waitFor: '.dropzone' },
      { settle: 500 },
    ],
    allowEmpty: true,
    label: 'Drop what you shot',
    alt: 'The footage door: the drop zone for clips and photos, with the questions D1 asks about them.',
  },
  {
    ...FULL_PAGE,
    name: 'd1-advanced',
    section: 'd1',
    path: '/d1',
    ready: 'details[open], .advanced',
    settle: 700,
    steps: [
      { click: '.ask-choices button' },
      { waitFor: 'textarea' },
      { click: 'summary' },
      { settle: 500 },
    ],
    allowEmpty: true,
    label: 'Advanced',
    alt: 'The Advanced fold open: how long, whether you will be on camera, and what should be made.',
  },

  // ---- the video editor --------------------------------------------------
  {
    ...EDITOR,
    ...FULL_PAGE,
    name: 've-full',
    path: '/video-editor',
    ready: '.vs-clip-v1',
    settle: 2500,
    label: 'The video editor',
    alt: 'The whole video editor: media pool on the left, the two monitors and the timeline in the middle, the Inspector on the right.',
  },
  {
    ...EDITOR,
    name: 've-toolbar',
    path: '/video-editor',
    ready: '[data-shot="ve-toolbar"]',
    settle: 2000,
    clip: { selector: '[data-shot="ve-toolbar"]', pad: 10 },
    label: 'Select and Trim',
    alt: 'The toolbar, with the Select and Trim tools on the left and Shortcuts and Export on the right.',
  },
  {
    ...EDITOR,
    name: 've-pool',
    path: '/video-editor',
    ready: '[data-shot="ve-pool"] img, [data-shot="ve-pool"] video',
    settle: 2500,
    clip: { selector: '[data-shot="ve-pool"]', pad: 12 },
    label: 'Media Pool',
    alt: 'The media pool holding three clips and a still, with the upload buttons and the link fields above them.',
  },
  {
    ...EDITOR,
    name: 've-timeline',
    path: '/video-editor',
    ready: '.vs-clip-v1',
    settle: 2500,
    clip: { selector: '[data-shot="ve-timeline"]', pad: 12 },
    label: 'The timeline',
    alt: 'The timeline: the Text and Effects tracks, three clips on Video 1 with a junction between each pair, and the three audio lanes.',
  },
  {
    ...EDITOR,
    name: 've-junction',
    path: '/video-editor',
    ready: '.vs-nle-junction',
    settle: 2500,
    steps: [{ click: '.vs-nle-junction' }, { settle: 900 }],
    clip: { selector: '[data-shot="ve-timeline"]', pad: 12 },
    label: 'A cut, selected',
    alt: 'The timeline with the diamond between the first two clips selected.',
  },
  {
    ...EDITOR,
    name: 've-transitions',
    path: '/video-editor',
    ready: '.vs-transition-types',
    settle: 2500,
    steps: [{ click: '.vs-nle-junction' }, { waitFor: '.vs-transition-types' }, { settle: 700 }],
    clip: { selector: '[data-shot="ve-inspector"]', pad: 12 },
    label: 'Inspector · Effects',
    alt: 'The Inspector showing the eleven transition types and the duration slider under them.',
  },
  {
    ...EDITOR,
    name: 've-inspector-video',
    path: '/video-editor',
    ready: '.vs-clip-v1',
    settle: 2500,
    steps: [{ click: '.vs-clip-v1' }, { settle: 900 }],
    clip: { selector: '[data-shot="ve-inspector"]', pad: 12 },
    label: 'Inspector · Video',
    alt: 'The Video tab of the Inspector with a clip selected: its in and out points, transform, colour and filter.',
  },
  {
    ...EDITOR,
    name: 've-monitors',
    path: '/video-editor',
    ready: '[data-shot="ve-monitors"]',
    settle: 2500,
    clip: { selector: '[data-shot="ve-monitors"]', pad: 12 },
    label: 'Source and Program',
    alt: 'The two monitors: Source on the left, and Program on the right showing the frame at the playhead.',
  },
  {
    ...EDITOR,
    name: 've-export',
    path: '/video-editor',
    ready: '[data-shot="ve-export"]',
    settle: 2500,
    steps: [
      { waitFor: '.vs-clip-v1' },
      { clickText: { selector: '[data-shot="ve-toolbar"] button', text: 'Export' } },
      { waitFor: '[data-shot="ve-export"]' },
      { settle: 700 },
    ],
    clip: { selector: '[data-shot="ve-export"]', pad: 12 },
    label: 'Export',
    alt: 'The export sheet: size, frame rate, quality, and the button that starts the render.',
  },

  {
    ...EDITOR,
    name: 've-header',
    path: '/video-editor',
    ready: '.vs-clip-v1',
    settle: 2500,
    clip: { selector: '.vs-header', pad: 10 },
    label: 'The project bar',
    alt: 'The bar above the editor: the project name, the account, undo and redo, save, the frame size and the background mode.',
  },
  {
    ...EDITOR,
    name: 've-inspector-text',
    path: '/video-editor',
    ready: '[data-shot="ve-inspector"]',
    settle: 2500,
    steps: [
      { waitFor: '.vs-clip-v1' },
      { clickText: { selector: '[data-shot="ve-inspector"] button', text: 'Text' } },
      { settle: 900 },
    ],
    clip: { selector: '[data-shot="ve-inspector"]', pad: 12 },
    label: 'Inspector · Text',
    alt: 'The Text tab of the Inspector: the style presets, the words, the background box, stroke and shadow.',
  },
  {
    ...EDITOR,
    name: 've-inspector-audio',
    path: '/video-editor',
    ready: '[data-shot="ve-inspector"]',
    settle: 2500,
    steps: [
      { waitFor: '.vs-clip-v1' },
      { clickText: { selector: '[data-shot="ve-inspector"] button', text: 'Audio' } },
      { settle: 900 },
    ],
    clip: { selector: '[data-shot="ve-inspector"]', pad: 12 },
    label: 'Inspector · Audio',
    alt: 'The Audio tab of the Inspector, with the audio track card that adds music and sound effects.',
  },
  {
    ...EDITOR,
    name: 've-add-row',
    path: '/video-editor',
    ready: '.vs-clip-v1',
    settle: 2500,
    steps: [
      { waitFor: '.vs-clip-v1' },
      { scrollToText: { selector: 'button', text: 'Add Text at Playhead' } },
      { settle: 500 },
    ],
    clip: { selector: '[data-shot="ve-timeline"]', pad: 12 },
    label: 'Adding things',
    alt: 'The row of buttons under the timeline that add a blank, text, an effect, a sticker, a shape, a logo or a progress bar.',
  },
  {
    ...EDITOR,
    name: 've-trim-tool',
    path: '/video-editor',
    ready: '.vs-clip-v1',
    settle: 2500,
    steps: [
      /* The toolbar only exists once a project is open — without this the click
         goes looking for it while the editor is still showing its project list. */
      { waitFor: '.vs-clip-v1' },
      { clickText: { selector: '[data-shot="ve-toolbar"] button', text: 'Trim' } },
      { settle: 700 },
    ],
    clip: { selector: '[data-shot="ve-toolbar"]', pad: 10 },
    label: 'Trim selected',
    alt: 'The toolbar with the Trim tool active instead of Select.',
  },

  // ---- subtitles ---------------------------------------------------------
  {
    ...FULL_PAGE,
    name: 'subs-studio',
    section: 'subtitles',
    path: '/subtitles',
    ready: 'h1',
    settle: 1200,
    allowEmpty: true,
    label: 'Subtitle Studio',
    alt: 'Subtitle Studio before a file is chosen, with the Whisper options underneath.',
  },
  {
    ...EDITOR,
    section: 'subtitles',
    name: 've-subtitles-tab',
    path: '/video-editor',
    ready: '[data-shot="ve-inspector"]',
    settle: 2500,
    steps: [{ click: '[data-shot="ve-inspector"] button:nth-of-type(5)' }, { settle: 900 }],
    clip: { selector: '[data-shot="ve-inspector"]', pad: 12 },
    label: 'Inspector · Subtitles',
    alt: 'The Subtitles tab of the Inspector, where a clip is transcribed and the captions are styled.',
  },

  {
    ...FULL_PAGE,
    name: 'subs-whisper',
    section: 'subtitles',
    path: '/subtitles',
    ready: 'app-whisper-options-panel, h1',
    settle: 1500,
    allowEmpty: true,
    steps: [{ scrollToText: { selector: '*', text: 'Whisper' } }, { settle: 500 }],
    label: 'Whisper Options',
    alt: 'The Whisper options: the task, the language, a vocabulary hint and the two checkboxes.',
  },
  {
    ...EDITOR,
    section: 'subtitles',
    name: 've-caption-style',
    path: '/video-editor',
    ready: '[data-shot="ve-inspector"]',
    settle: 2500,
    steps: [
      { waitFor: '.vs-clip-v1' },
      { clickText: { selector: '[data-shot="ve-inspector"] button', text: 'Subtitles' } },
      { settle: 1200 },
      { scrollToText: { selector: '*', text: 'Caption Style' } },
      { settle: 600 },
    ],
    clip: { selector: '[data-shot="ve-inspector"]', pad: 12 },
    label: 'Caption Style',
    alt: 'The caption style panel: font, size, colours, outline, the random switches and the highlight modes.',
  },
  {
    ...FULL_PAGE,
    name: 'ideas-sources',
    section: 'page',
    path: `/ideas?accountId=${ACCOUNT}&tab=week`,
    ready: 'details',
    settle: 1600,
    allowEmpty: true,
    steps: [
      { waitFor: 'details' },
      { clickText: { selector: 'summary', text: 'More sources' } },
      { settle: 1500 },
    ],
    label: 'More sources',
    alt: 'The Suggestions fold open, showing content mode, photo source, the content brief and the keyword list.',
  },
  {
    ...FULL_PAGE,
    name: 'ideas-talk',
    section: 'page',
    path: `/ideas?accountId=${ACCOUNT}`,
    ready: 'app-talk-recorder, textarea',
    settle: 1500,
    allowEmpty: true,
    steps: [
      { clickText: { selector: 'button', text: 'Talk to me' } },
      { settle: 1200 },
    ],
    label: 'Talk to me',
    alt: 'The Talk to me panel, with the microphone and the box for saying what has changed about the page.',
  },
  {
    ...FULL_PAGE,
    name: 'performance-report',
    section: 'page',
    path: '/performance',
    ready: 'h2',
    settle: 2000,
    steps: [
      { selectText: { selector: 'select', text: 'Frame & Pigment' } },
      { settle: 1500 },
      { scrollToText: { text: 'consultant report' } },
      { settle: 800 },
    ],
    label: 'The consultant report',
    alt: 'The weekly consultant report card, with the button that generates one.',
  },
  {
    ...FULL_PAGE,
    name: 'rss-schedule',
    section: 'create',
    path: '/rss',
    ready: 'h1',
    settle: 1800,
    allowEmpty: true,
    steps: [{ scrollToText: { selector: '*', text: 'Posting Schedule' } }, { settle: 700 }],
    label: 'Posting Schedule',
    alt: 'The posting schedule: manual times or smart, and the checkbox that holds posts for review.',
  },
  {
    ...EDITOR,
    name: 've-colour',
    path: '/video-editor',
    ready: '[data-shot="ve-inspector"]',
    settle: 2500,
    steps: [
      { click: '.vs-clip-v1' },
      { settle: 1000 },
      { scrollToText: { selector: 'h4, strong', text: 'Color' } },
      { settle: 600 },
    ],
    clip: { selector: '[data-shot="ve-inspector"]', pad: 12 },
    label: 'Colour and filters',
    alt: 'The colour controls and the filter strip on a selected clip.',
  },

  // ---- the photo editor --------------------------------------------------
  {
    ...FULL_PAGE,
    vault: true,
    name: 'pe-open',
    section: 'editors',
    path: '/visual-studio',
    ready: '.pe-rail-btn',
    settle: 2500,
    steps: [
      { upload: { selector: 'input[type=file]', file: 'still.jpg' } },
      { waitFor: '.pe-rail-btn' },
      { settle: 2500 },
    ],
    label: 'The photo editor',
    alt: 'The photo editor with a picture open: the tool rail down the left, the canvas in the middle, the tool panel beside it.',
  },
  {
    ...FULL_PAGE,
    vault: true,
    name: 'pe-adjust',
    section: 'editors',
    path: '/visual-studio',
    ready: '.pe-rail-btn',
    settle: 2000,
    steps: [
      { upload: { selector: 'input[type=file]', file: 'still.jpg' } },
      { waitFor: '.pe-rail-btn' },
      { settle: 2500 },
      { click: '.pe-rail-btn[title="Adjust"]' },
      { settle: 900 },
    ],
    label: 'Adjust',
    alt: 'The Adjust panel of the photo editor, with its dials for exposure, contrast and colour.',
  },
  {
    ...FULL_PAGE,
    vault: true,
    name: 'pe-crop',
    section: 'editors',
    path: '/visual-studio',
    ready: '.pe-rail-btn',
    settle: 2000,
    steps: [
      { upload: { selector: 'input[type=file]', file: 'still.jpg' } },
      { waitFor: '.pe-rail-btn' },
      { settle: 2500 },
      { click: '.pe-rail-btn[title="Crop"]' },
      { settle: 900 },
    ],
    label: 'Crop',
    alt: 'The Crop panel, with the ratio buttons and the rotate and flip controls.',
  },
  {
    ...FULL_PAGE,
    vault: true,
    name: 'pe-text',
    section: 'editors',
    path: '/visual-studio',
    ready: '.pe-rail-btn',
    settle: 2000,
    steps: [
      { upload: { selector: 'input[type=file]', file: 'still.jpg' } },
      { waitFor: '.pe-rail-btn' },
      { settle: 2500 },
      { click: '.pe-rail-btn[title="Text"]' },
      { settle: 900 },
    ],
    label: 'Text',
    alt: 'The Text panel of the photo editor, where words are added to a picture and styled.',
  },
  {
    ...FULL_PAGE,
    vault: true,
    name: 'pe-layers',
    section: 'editors',
    path: '/visual-studio',
    ready: '.pe-rail-btn',
    settle: 2000,
    steps: [
      { upload: { selector: 'input[type=file]', file: 'still.jpg' } },
      { waitFor: '.pe-rail-btn' },
      { settle: 2500 },
      { click: '.pe-rail-btn[title="Layers"]' },
      { settle: 900 },
    ],
    label: 'Layers',
    alt: 'The Layers panel, listing everything stacked on the picture in drawing order.',
  },
  {
    ...FULL_PAGE,
    vault: true,
    name: 'pe-removebg',
    section: 'editors',
    path: '/visual-studio',
    ready: '.pe-rail-btn',
    settle: 2000,
    steps: [
      { upload: { selector: 'input[type=file]', file: 'still.jpg' } },
      { waitFor: '.pe-rail-btn' },
      { settle: 2500 },
      { click: '.pe-rail-btn[title="Remove background"]' },
      { settle: 900 },
    ],
    label: 'Remove background',
    alt: 'The Remove background panel and the one button that runs it.',
  },
  {
    ...FULL_PAGE,
    vault: true,
    name: 'pe-publish',
    section: 'editors',
    path: '/visual-studio',
    ready: '.pe-rail-btn',
    settle: 2000,
    steps: [
      { upload: { selector: 'input[type=file]', file: 'still.jpg' } },
      { waitFor: '.pe-rail-btn' },
      { settle: 2500 },
      { click: '.pe-rail-btn[title="Publish"]' },
      { settle: 900 },
    ],
    label: 'Publish',
    alt: 'The Publish panel, offering download, save to gallery and posting.',
  },

  // ---- library -----------------------------------------------------------
  {
    ...FULL_PAGE,
    name: 'palettes-list',
    section: 'library',
    path: '/palettes',
    ready: 'h1',
    settle: 1000,
    allowEmpty: true,
    label: 'Palettes',
    alt: 'The palettes page, listing the built-in palettes and any of your own.',
  },
  {
    ...FULL_PAGE,
    name: 'templates-list',
    section: 'library',
    path: '/templates',
    ready: 'h1',
    settle: 1200,
    allowEmpty: true,
    label: 'Templates',
    alt: 'The templates page, showing one card per design with the kind it belongs to.',
  },
  {
    ...FULL_PAGE,
    name: 'characters-list',
    section: 'library',
    path: '/characters',
    ready: 'h1',
    settle: 1200,
    allowEmpty: true,
    label: 'Characters',
    alt: 'The characters page: the ten writers, each with the tag that describes how it writes.',
  },
  {
    ...FULL_PAGE,
    name: 'music-library',
    section: 'library',
    path: '/music',
    ready: 'h1',
    settle: 1000,
    allowEmpty: true,
    label: 'Music',
    alt: 'The music page, with the curated library and your own uploads on separate tabs.',
  },
  {
    ...FULL_PAGE,
    name: 'fonts-library',
    section: 'library',
    path: '/fonts',
    ready: 'h1',
    settle: 1000,
    allowEmpty: true,
    label: 'Fonts',
    alt: 'The font library, where a typeface is uploaded and named.',
  },

  // ---- manage ------------------------------------------------------------
  {
    ...FULL_PAGE,
    name: 'activity-log',
    section: 'manage',
    path: '/activity',
    ready: 'table tbody tr',
    settle: 1000,
    label: 'Activity Log',
    alt: 'The Activity Log, with rows in several states and the review actions on a pending row.',
  },
  {
    ...FULL_PAGE,
    name: 'settings-page',
    section: 'manage',
    path: '/settings',
    ready: 'h1, h2',
    settle: 1000,
    allowEmpty: true,
    label: 'Settings',
    alt: 'Settings, with its Profile, Devices and Storage sections.',
  },
];

export default SHOTS;
