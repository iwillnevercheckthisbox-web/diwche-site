/**
 * The read, in English.
 *
 * Every English word on /read is here and nowhere else. The register is DNA §7:
 * the Diw is the narrator, headlines are sentences rather than slogans, and the
 * jokes are dry — each insight opens by quoting back the thing the visitor just
 * admitted to, which is the only reason anyone reads the paragraph under it.
 */
import type { FunnelCopy } from './types';

export const EN: FunnelCopy = {
  locale: 'en',

  meta: {
    title: 'The free read — Diwche',
    description:
      'Answer a few questions and see what Diwche would do with your page. Free, and nothing is connected to your account.',
  },

  preview:
    'Preview — he is not connected to Instagram yet, so the read at the end will not run. Everything before it is real.',

  bar: { back: 'Back', home: 'Back to diwche.com' },

  screens: [
    // ---- Q1 · who is asking ------------------------------------------------
    {
      id: 'stage',
      kind: 'question',
      eyebrow: 'First',
      title: 'Where are you in your content journey?',
      options: [
        {
          value: 'active',
          label: 'I run an active public account',
          sub: 'and I post content',
          icon: 'mine',
        },
        {
          value: 'new',
          label: 'I haven’t launched yet',
          sub: 'but I’m getting ready to',
          icon: 'seed',
        },
      ],
      shot: {
        src: '/mascot/v2/thinking.svg',
        label: 'Diwche',
        alt: 'The Diw, deciding where to begin.',
      },
    },

    // ---- Q2 · what is in the way -------------------------------------------
    {
      id: 'blockers',
      kind: 'question',
      eyebrow: 'What’s in the way',
      title: 'What is the main reason you haven’t started posting yet?',
      titleWhen: {
        // Same four answers, but "why haven't you started" reads as an accusation
        // to someone who already posts daily.
        active: 'What eats the most time when you post?',
      },
      hint: 'Select all that apply.',
      multi: true,
      options: [
        {
          value: 'ideas',
          label: 'Finding ideas',
          sub: 'I don’t know what content to make or what topics will actually work',
          icon: 'idea',
        },
        {
          value: 'editing',
          label: 'Video editing',
          sub: 'Editing and visual creation feel too complicated or time-consuming',
          icon: 'cut',
        },
        {
          value: 'script',
          label: 'Script & storyline',
          sub: 'I struggle to write good video scripts and strong opening hooks',
          icon: 'words',
        },
        {
          value: 'dm',
          label: 'Comments & DMs',
          sub: 'I worry about managing messages and replying to followers effectively',
          icon: 'chat',
        },
      ],
      shot: {
        // The drawn cut-out, not the animated mascot scene (#379). working-hard.svg is
        // a square raster with its own opaque background, so on this screen it read as a
        // framed tile dropped between the question and the answers — every other figure
        // on the read floats with no frame at all.
        src: '/art/studio-writing.webp',
        label: 'Diwche',
        alt: 'The Diw, taking notes.',
      },
    },

    // ---- One insight per blocker, in the order they were listed -------------
    {
      id: 'f-ideas',
      kind: 'insight',
      showIf: { screen: 'blockers', is: 'ideas' },
      eyebrow: 'Ideas',
      quote: 'I don’t know what content to make or what topics will actually work.',
      hook: 'Honestly? Neither do we. Just kidding — we do, and soon you will too.',
      title: 'Every morning, topics that are yours.',
      lead: 'Instead of throwing generic trends at you, he analyses your niche, studies the accounts you measure yourself against, and reads how your own posts actually did. The more you use him, the better he knows your voice and what your audience answers. Turn on overnight discovery and he searches your sources while you sleep, so there is a stack of ready-to-use ideas waiting when you wake up.',
      shot: {
        src: '/shots/ideas.png',
        label: 'Ideas',
        alt: 'The Ideas page, a column of suggested topics.',
      },
    },
    {
      id: 'f-editing',
      kind: 'insight',
      showIf: { screen: 'blockers', is: 'editing' },
      eyebrow: 'D1 Studio',
      quote: 'Editing and visual creation feel too complicated or time-consuming.',
      hook: 'We know what you’re thinking: another AI tool where you write a 500-word prompt just to move a caption two millimetres. Not quite.',
      title: 'Say it once. He cuts the rest.',
      lead: 'D1 takes your raw footage and your topic and hands back a finished, edited video. Here is where he breaks the rule every other tool follows: you never have to argue with a text box to fix a small thing. Visual Studio gives you the whole timeline — add elements, move cuts, change anything by hand. The speed of the machine, with your hands still on it.',
      shot: {
        src: '/shots/_placeholder-d1.svg',
        label: 'Visual Studio',
        alt: 'The editor, with a timeline, a monitor and an inspector.',
      },
    },
    {
      id: 'f-script',
      kind: 'insight',
      showIf: { screen: 'blockers', is: 'script' },
      eyebrow: 'Script writer',
      quote: 'I struggle to write good video scripts and strong opening hooks.',
      hook: 'Staring at a blank document waiting for inspiration is a great workout for your eyes. It just doesn’t post videos.',
      title: 'The first line, written for you.',
      lead: 'He writes structured scripts, opening hooks and captions in the voice you set for your page — not a generic one. Want the whole thing ready to read to camera? It is there. Want an outline to finish yourself, or just a place to start? Also there. Regenerate it, cut it, rewrite it, until it sounds like you.',
      shot: {
        src: '/shots/_placeholder-script.svg',
        label: 'D1 Studio',
        alt: 'The teleprompter, with a script ready to read.',
      },
    },
    {
      id: 'f-dm',
      kind: 'insight',
      showIf: { screen: 'blockers', is: 'dm' },
      eyebrow: 'Replies',
      quote: 'I worry about managing messages and replying to followers effectively.',
      hook: 'Sending the same red heart to forty completely different questions is certainly a strategy. Just not a good one.',
      title: 'He reads the question before he answers it.',
      lead: 'No rigid keyword rules, no canned replies. He reads what a comment or a message actually says, answers the thing that was asked, and keeps the voice you set for your page while doing it. Real conversation on autopilot, without ever sounding like a bot.',
      shot: {
        src: '/shots/_placeholder-replies.svg',
        label: 'Replies',
        alt: 'A comment and the reply he wrote for it.',
      },
    },

    // ---- The ask, one per branch -------------------------------------------
    {
      id: 'performance',
      kind: 'start',
      field: 'handle',
      showIf: { screen: 'stage', is: 'active' },
      eyebrow: 'Performance',
      hook: 'Posting is only half of it. Staring at Instagram’s charts and pretending to know what “3% reach” means won’t grow your page.',
      title: 'What your numbers were trying to tell you.',
      lead: 'He turns the raw figures into something you can act on. Instead of another dashboard, he says which post fell flat, why it fell flat, and what to change on the next one. The part Instagram never built.',
      cta: 'Read my page',
      placeholder: 'yourhandle',
      shot: {
        src: '/shots/performance.png',
        label: 'Performance',
        alt: 'A sentence about a post, above the bars it came from.',
      },
    },
    {
      id: 'starter',
      kind: 'start',
      field: 'idea',
      showIf: { screen: 'stage', is: 'new' },
      eyebrow: 'Where to start',
      hook: 'Knowing how the tools work is fine, but an engine with no fuel is a heavy paperweight. Let’s give you a reason to start.',
      title: 'One idea is enough to begin.',
      lead: 'You don’t need a fifty-page strategy to make the first move — you need one spark. Tell him the rough idea or the subject that has been rattling around, and he turns it into a clear direction and a first post worth publishing.',
      cta: 'Start from this',
      placeholder: 'The thing you keep putting off…',
      shot: {
        src: '/shots/_placeholder-starter.svg',
        label: 'Ideas',
        alt: 'Ten suggested topics, built from one idea.',
      },
    },

    {
      id: 'rivals',
      kind: 'rivals',
      showIf: { screen: 'stage', is: 'active' },
      eyebrow: 'Who you are up against',
      title: 'Name a page you measure yourself against.',
      lead: 'Optional, and it changes the read. He can find pages you already tag, but the ones you have in mind are the comparison you actually believe — you know your own scene better than any list does.',
      placeholder: 'theirhandle',
      cta: 'Compare me to these',
      skip: 'Skip this',
    },
    { id: 'email', kind: 'email' },
    { id: 'verify', kind: 'verify' },
    { id: 'analyzing', kind: 'analyzing' },
    { id: 'result', kind: 'result' },
    { id: 'plan', kind: 'plan' },
    { id: 'error', kind: 'error' },
  ],

  // The wait. Whatever they did not pick, plus the two nobody is asked about.
  features: {
    ideas: {
      label: 'Ideas',
      title: 'Topics that are yours, every morning.',
      text: 'He reads your niche, the accounts you watch and your own results, then brings you subjects nobody else is handed.',
    },
    editing: {
      label: 'D1 Studio',
      title: 'A finished video from raw footage.',
      text: 'He cuts the pauses and the stumbles, then shows you every cut — and Visual Studio hands you the timeline if you disagree with one.',
    },
    script: {
      label: 'Script writer',
      title: 'The first line, and the ninety after it.',
      text: 'Structured scripts, opening hooks and captions in the voice you set. Regenerate until it sounds like you.',
    },
    dm: {
      label: 'Replies',
      title: 'Answers to the question that was asked.',
      text: 'He reads each comment and message, replies to what it actually said, and never breaks the voice you set.',
    },
    identity: {
      label: 'Account identity',
      title: 'Set your look once. He keeps it.',
      text: 'Palettes, templates, fonts, characters and the voice of your page, saved in one place and applied to everything he builds. Re-entering hex codes for the hundredth time is not brand management.',
    },
    scheduling: {
      label: 'Scheduling',
      title: 'Pick the hour and walk away.',
      text: 'He publishes at the time you chose and starts the rest of the chain the moment he does — replies watching, performance tracking. No 2 a.m. alarm to tap Publish.',
    },
  },

  email: {
    eyebrow: 'Last thing',
    title: 'Where should he send it?',
    lead: 'The read appears on the next screen either way — all of it, nothing held back. This is so it does not vanish when you close the tab, and so he can send the offer built for what he finds.',
    label: 'Your email address',
    placeholder: 'enter.your.email@here.com',
    consent: 'Diwche may email me this read. No one else gets this address.',
    cta: 'Read my page',
    note: 'One read, and an offer built from it. Unsubscribe in one click, from the first email.',
  },

  verify: {
    eyebrow: 'One thing first',
    title: 'Show him the page is yours.',
    lead: 'He reads a page only for the person who owns it. Two taps in Instagram and he knows.',
    steps: {
      follow: 'Follow {account} on Instagram.',
      send: 'Send this code to {account} in a direct message — from {handle}.',
      wait: 'Come back here. He notices on his own.',
    },
    open: 'Open the chat in Instagram',
    waiting: 'Waiting for your message…',
    verified: 'That is you. Reading now.',
    wrongAccount: 'That code came from {sentBy}, not {handle}. Send it from the page you named.',
    notFollowing: 'He got the code — but you are not following {account} yet. Follow, then send it once more.',
    expired: 'That code has expired. Ask for a fresh one.',
    unavailable: 'He cannot take codes right now, so this read goes ahead without the check.',
    again: 'New code',
    change: 'Different page',
  },

  analyzing: {
    line: 'Reading your page…',
    lead: 'While we do the heavy lifting, here is the rest of what runs under the hood.',
    shot: {
      src: '/shots/activity.png',
      label: 'Activity',
      alt: 'The activity log, a list of what he has published.',
    },
    cardsLead: 'While he reads — the rest of what he does.',
  },

  result: {
    eyebrow: 'What he found',
    teaser: 'That is the whole read. Nothing held back.',
    emailLabel: 'Your email address',
    placeholder: 'enter.your.email@here.com',
    consent: 'Diwche may email me this read. No one else gets this address.',
    cta: 'Send me this read',
    starterEyebrow: 'Where he would start',
    starterTeaser:
      'He has read your idea. Leave an address and he will send the direction he would take it in — and the first post he would make from it.',
    followers: 'followers',
    posts: 'posts',
    heldBack: ' · held back',
    starterHeadline: 'The field you are walking into.',
    fieldTitle: 'Pages already doing this',
    fieldFollowers: 'followers',
    fieldPace: 'posts a month',
    fieldRate: 'respond',
    fieldFormat: 'best format',
    waiting:
      'Starting this week at {perWeek} posts a week is {byNextYear} posts by this time next year. Starting in three months is {ifThreeMonths}.',
    rewards: 'This subject rewards {format}, at {pace}.',

    chartTitle: 'Every post he read',
    chartNote: 'One bar per post, placed by date. Height is likes and comments. The heights use a square-root scale, so one big post does not flatten the rest.',
    chartEmpty: 'Nothing datable to draw.',
    chartQuiet: '{days} quiet days',
    chartCount: '{count} likes and comments',
    chartHidden: 'Likes not public',
    chartHiddenNote: 'The owner turned likes off for this post, so it is shown without a count.',
    chartFormats: { reel: 'Reel', video: 'Video', carousel: 'Carousel', photo: 'Photo', post: 'Post' },
    chartPinned: 'Pinned',
    chartPinnedNote: 'Pinned to the top of the grid. It is drawn, but its date is left out of how often you post.',
    chartWindowDays: 'Showing the last {days} days: {count} of the {total} posts he read.',
    chartWindowAll: 'Showing {count} of the {total} posts he read, from {date} on.',
    chartBestOutside: 'Your best post of the ones he read ({count} likes and comments, {date}) is older than this.',
    sections: {
      rhythm: 'How often you post',
      format: 'What works when you do',
      audience: 'Who is actually there',
      peers: 'The pages beside you',
      words: 'What you write',
    },
    verdicts: {
      good: 'Strong',
      weak: 'Weak',
      bad: 'Bad',
      dead: 'Stopped',
      neutral: 'Measured',
    },
    labels: {
      started: 'Since you started',
      window: 'What he read',
      pace: 'The pace',
      now: 'Since your last post',
      gap: 'The quiet stretch',
      trend: 'Which way it is going',
      format: 'Format mismatch',
      best: 'The one that worked',
      answering: 'How much they answer',
      asleep: 'The ones who never answer',
      prune: 'What to do about it',
      'peer-pace': 'How often they post',
      peer: 'A page your size',
      'peer-format': 'What they make',
      hashtags: 'Hashtags',
      asks: 'Asking for a reply',
      bio: 'Your bio',
      caption: 'Caption habit',
      opening: 'The same opening',
      timing: 'When they land',
    },
    peersTitle: 'Measured against',
    peersNamed: 'you named',
    peersFound: 'he found',
    meterLegend: 'The mark is the {label} for pages your size.',
    onward: 'What he would do about it',
  },

  plan: {
    eyebrow: 'What he would do',
    headline: 'Well, a promise is a promise. Here’s your complete breakdown.',
    body: 'Take your time going through it, and keep an eye on your inbox. In a few minutes we’re sending an offer built for where you actually are — no generic spam, just the tools you need.',
    starterHeadline: 'He has somewhere to start you.',
    starterBody:
      'Keep an eye on your inbox. In a few minutes he’s sending the direction he would take your idea in, and the first post he would make from it.',
    working: 'How he worked that out',
    horizonsTitle: 'What that adds up to',
    horizonsNew: '{n} of them new',
    horizonsWhen: { month: 'In a month', sixMonths: 'In six months', year: 'In a year' },
    sides: { now: 'Now', then: 'With him' },
    sizeTitle: {
      under1k: 'What a page under a thousand can do',
      '1k': 'What a page this size can do',
      '10k': 'What a page in the tens of thousands can do',
      '100k': 'What a page this big can do',
    },
    ways: { again: 'Read another page', home: 'Back to diwche.com' },
  },

  ui: {
    continue: 'Continue',
    next: 'Got it',
    retry: 'Try another page',
    of: 'of',
    working: 'One moment…',
    sent: 'He has it',
    copy: 'Copy the code',
    copied: 'Copied',
    copyByHand: 'Copy it by hand',
    language: 'Language',
  },

  runtime: {
    reading: 'Finding the page…',
    thinking: 'Turning it over…',
    handleInvalid: 'That is not an Instagram handle — letters, numbers, dots.',
    ideaTooShort: 'Tell him a little more than that.',
    emailInvalid: 'That address does not look right.',
    consentMissing: 'Tick the box and he will know he may write to you.',
    generic: 'Something went wrong on our side, not yours.',
    noProjection:
      'He would rather show you than promise you. There is not a gap on this page big enough to draw — so what he found, and what he would do with it, go to your address instead.',
    errorEyebrow: 'He stopped',
    waitingTitle: 'Leave an address and he will send the read when he can.',
    waitingCta: 'Send it when he can',
    limit: 'He has read all he can today.',
    ready: 'Your read is ready. One more moment while he finishes writing it down.',
  },
};
