/**
 * Dev-only stand-in for the backend's `/api/public/*`.
 *
 * This exists so the show can be built and timed without a running Spring stack,
 * and it stays useful after the real endpoint ships: you cannot tune a
 * thirty-second animation by spending a scrape and a model call on every reload,
 * and the states that matter most — private page, unknown handle, daily cap,
 * a read that takes too long — are otherwise nearly impossible to reach on demand.
 *
 * Never part of `npm run build`. Wired in as a dev proxy by astro.config.mjs.
 *
 * Handle switches, for driving the states by hand:
 *   @weak      a page doing badly (the interesting case)
 *   @private   a private account
 *   @nobody    no such handle
 *   @limit     the daily cap has been reached
 *   @slow      a read that outlasts the scenes
 *   @fast      a read that lands almost immediately
 *   @human     the proof-of-human check refuses the read
 *   anything else → a healthy page
 *
 * The result follows the public read contract: while a read is locked the
 * held-back facts arrive with empty value and text, and the projection and
 * size block are null. Leaving an address returns the whole view, unlocked.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_PORT ?? 8788);

/** Progress lines. Deliberately de-vendored, like the backend's. */
const STEPS = [
  [0.08, 'reading', 'Finding the page…'],
  [0.2, 'reading', 'Reading what you have posted…'],
  [0.38, 'reading', 'Counting what your audience answered…'],
  [0.55, 'analyzing', 'Looking for what works and what repeats…'],
  [0.72, 'analyzing', 'Comparing you with pages your size…'],
  [0.88, 'writing', 'Working out what to say about it…'],
];

const audits = new Map();

const DAY = 24 * 60 * 60 * 1000;

/**
 * A believable grid: a steady run, a three-week hole, one post that travelled.
 *
 * The chart is the part of the read that has to look right before anything else does, and it is
 * the part a static fixture gets wrong most easily — evenly spaced bars of equal height say
 * nothing, which is exactly the failure the whole rewrite is about.
 */
function timeline(count = 26) {
  const points = [];
  let at = Date.now() - 4 * DAY;
  for (let i = 0; i < count; i++) {
    const format = i % 5 === 0 ? 'reel' : i % 3 === 0 ? 'carousel' : 'photo';
    const base = format === 'reel' ? 90 : 34;
    points.push({
      at,
      engagement: i === 3 ? 343 : i === 11 ? null : Math.round(base + Math.sin(i) * 18 + i),
      format,
    });
    // A twenty-one day silence in the middle, so the shaded gap has something to shade.
    at -= (i === 8 ? 21 : 2 + (i % 4)) * DAY;
  }
  return points;
}

const strong = (handle) => ({
  handle,
  source: 'discovery',
  headline:
    'Your reels do more than twice what your photos do — and almost everything you post is a photo.',
  facts: [
    {
      key: 'pace',
      label: 'The pace',
      value: 'one post every 10 days',
      text: 'You posted 6 times in the last 60 days — one post every 10 days. Pages that grow post at least twice a week.',
      section: 'rhythm',
      verdict: 'bad',
    },
    {
      key: 'gap',
      label: 'The quiet stretch',
      value: '21 days',
      text: 'Between July and August you went 21 days without posting. What you posted after it has been running at about 60% of what you were doing before.',
      section: 'rhythm',
      verdict: 'bad',
    },
    {
      key: 'format',
      label: 'Format mismatch',
      value: '2.3×',
      text: 'Your reels get 2.3 times the likes and comments your photos get. 71% of what you post is photos.',
      section: 'format',
      verdict: 'bad',
      meter: { value: 23, max: 100, benchmark: 62, benchmarkLabel: 'photos' },
    },
    {
      key: 'best',
      label: 'The one that worked',
      value: '5.1×',
      text: 'Your best post got 343 likes and comments — 5.1 times everyone who follows you. It was a reel, recently, and it went well past your own audience.',
      section: 'format',
      verdict: 'good',
    },
    {
      key: 'answering',
      label: 'How much they answer',
      value: '0.6%',
      text: 'A typical post gets 48 likes and comments from your 8,420 followers, which is 0.6% of them. A page your size usually sees about 3%.',
      section: 'audience',
      verdict: 'bad',
      meter: { value: 0.6, max: 6, benchmark: 3, benchmarkLabel: 'usual rate' },
    },
    {
      key: 'asleep',
      label: 'The ones who never answer',
      value: '6,820',
      text: 'About 6,820 of your 8,420 followers show no sign of life on a typical post. The number on your profile is bigger than the audience behind it.',
      section: 'audience',
      verdict: 'bad',
    },
    {
      key: 'peer-pace',
      label: 'How often they post',
      value: '3.4×',
      text: '@theirpage posts about 14 times a month. You post about 4.',
      section: 'peers',
      verdict: 'bad',
    },
    {
      key: 'hashtags',
      label: 'Hashtags',
      value: '24',
      text: 'Your captions carry about 24 hashtags. Past a handful they stop finding anyone and start reading like a search box.',
      section: 'words',
      verdict: 'bad',
    },
    {
      key: 'prune',
      label: 'What to do about it',
      value: 'Clear it out',
      text: 'Instagram decides who sees a post partly by how many of your own followers answer it, so followers who never do are pulling every post down.',
      section: 'audience',
      verdict: 'bad',
      locked: true,
    },
    {
      key: 'peer',
      label: 'A page your size',
      value: '2.4×',
      text: '@theirpage is about the size of your page and gets 2.4 times the likes and comments you do, for every follower.',
      section: 'peers',
      verdict: 'bad',
      locked: true,
    },
    {
      key: 'asks',
      label: 'Asking for a reply',
      value: 'None',
      text: 'None of your last 22 captions ask the reader anything. A comment is worth more to Instagram than a like, and it costs one sentence.',
      section: 'words',
      verdict: 'weak',
      locked: true,
    },
  ],
  timeline: timeline(),
  rhythm: {
    firstPostAt: null,
    postsRead: 26,
    postsLast60Days: 6,
    perWeek: 0.7,
    longestGapDays: 21,
    daysSinceLast: 4,
    verdict: 'bad',
  },
  audience: { rate: 0.006, reference: 0.03, typical: 48, verdict: 'bad' },
  peers: [
    {
      handle: 'theirpage',
      followers: 9100,
      followersText: '9,100',
      postsPerMonth: 14,
      rate: '1.4%',
      named: true,
      bestFormat: 'reels',
    },
    {
      handle: 'anotherpage',
      followers: 6400,
      followersText: '6,400',
      postsPerMonth: 9,
      rate: '2.1%',
      named: false,
      bestFormat: 'carousels',
    },
  ],
  projection: {
    headline: 'about 8,706 more likes and comments in your first year',
    assumption:
      'That is your own reel rate, applied to a steadier month at the pace pages your size keep. It assumes nothing improves — only that you keep doing the thing that already works for you, and keep doing it.',
    now: { label: 'Now', value: 610, amount: '610', pace: 'about 9 posts a month' },
    then: { label: 'With him', value: 950, amount: '950', pace: 'about 20 posts a month' },
    moves: [
      'He brings you a topic every morning, so about 20 posts a month stops waiting on you having an idea.',
      'He shoots, captions and lays out your reels — the format your page already answers to.',
      'He goes back to the post that did 4.1× your own median, and builds from its shape.',
    ],
    horizons: [
      { label: 'In a month', months: 1, total: '950', extra: '340', value: 950 },
      { label: 'In six months', months: 6, total: '6,627', extra: '2,967', value: 6627 },
      { label: 'In a year', months: 12, total: '16,026', extra: '8,706', value: 16026 },
    ],
  },
  size: {
    tier: '1k',
    lines: [
      { key: 'reach1', value: '84', text: '1% of your followers is 84 responses a post. Your best post got 61.' },
      { key: 'dormant', value: '7,900', text: '7,900 followers you already have that a typical post does not reach.' },
      { key: 'brand', value: '0.6%', text: 'The share of your followers a brand would expect to see on a post before it pays for one.' },
      { key: 'hours', value: '20', text: 'About twenty hours a month go into nine posts. He would make that twenty posts for the same hours.' },
      { key: 'followers', value: '130', text: 'About 130 new followers a month at your own reel rate, if the reels were most of what you posted.' },
    ],
  },
  verified: false,
  // A tiny grey circle: enough to prove the card renders a data URI, without
  // shipping a stranger's face into the repo.
  profile: {
    handle: handle || 'someone',
    followers: 8420,
    posts: 213,
    avatar:
      'data:image/svg+xml;base64,' +
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72">' +
          '<rect width="72" height="72" fill="#2a3450"/>' +
          '<circle cx="36" cy="28" r="12" fill="#4a5670"/>' +
          '<path d="M12 72a24 24 0 0 1 48 0z" fill="#4a5670"/></svg>'
      ).toString('base64'),
  },
});

const weak = (handle) => ({
  handle,
  source: 'apify',
  headline: 'You have posted the same kind of thing eleven times in a row, and it is getting quieter each time.',
  facts: [
    {
      key: 'window',
      label: 'What he read',
      value: '18',
      text: 'This is your last 18 posts, back to March.',
      section: 'rhythm',
      verdict: 'neutral',
    },
    {
      key: 'trend',
      label: 'Which way it is going',
      value: '0.6×',
      text: 'You posted 1.4 times as much these last 3 months, and each post now gets 60% of the likes and comments it used to.',
      section: 'rhythm',
      verdict: 'bad',
    },
    {
      key: 'answering',
      label: 'How much they answer',
      value: '0.6%',
      text: 'A typical post gets 11 likes and comments from your 1,900 followers, which is 0.6% of them. A page your size usually sees about 3%.',
      section: 'audience',
      verdict: 'weak',
      meter: { value: 0.6, max: 6, benchmark: 3, benchmarkLabel: 'usual rate' },
    },
    {
      key: 'opening',
      label: 'The same opening',
      value: '11 in a row',
      text: 'Your last 11 captions all open the same way.',
      section: 'words',
      verdict: 'weak',
      locked: true,
    },
    {
      key: 'caption',
      label: 'Caption habit',
      value: '340 vs 90',
      text: 'Your captions run about 340 characters. Your best ones run about 90.',
      section: 'words',
      verdict: 'weak',
      locked: true,
    },
  ],
  timeline: timeline(18),
  rhythm: {
    firstPostAt: null,
    postsRead: 18,
    postsLast60Days: 9,
    perWeek: 1.05,
    longestGapDays: 21,
    daysSinceLast: 4,
    verdict: 'weak',
  },
  audience: { rate: 0.006, reference: 0.03, typical: 11, verdict: 'weak' },
  peers: [],
  projection: {
    headline: 'about 120 more likes and comments a month',
    assumption:
      'That is your own best-performing shape — shorter captions, posted in the evening — applied to the same number of posts you already make. It assumes you post no more than you do today.',
    now: { label: 'Now', value: 210, amount: '210', pace: 'about 12 posts a month' },
    then: { label: 'With him', value: 330, amount: '330', pace: 'about 12 posts a month' },
    moves: [
      'He writes to the caption length your own best posts run to.',
      'He schedules for the hours your best posts actually landed in.',
    ],
    horizons: [
      { label: 'In a month', months: 1, total: '330', extra: '120', value: 330 },
      { label: 'In six months', months: 6, total: '2,302', extra: '1,042', value: 2302 },
      { label: 'In a year', months: 12, total: '5,567', extra: '3,047', value: 5567 },
    ],
  },
  size: {
    tier: '1k',
    lines: [
      { key: 'reach1', value: '84', text: '1% of your followers is 84 responses a post. Your best post got 40.' },
      { key: 'dormant', value: '8,200', text: '8,200 followers you already have that a typical post does not reach.' },
      { key: 'brand', value: '0.6%', text: 'The share of your followers a brand would expect to see on a post before it pays for one.' },
      { key: 'hours', value: '24', text: 'About twenty-four hours a month go into twelve posts that open the same way.' },
      { key: 'followers', value: '60', text: 'About 60 new followers a month at your current rate. Shorter captions, in the evening, roughly double it.' },
    ],
  },
  verified: false,
  // A tiny grey circle: enough to prove the card renders a data URI, without
  // shipping a stranger's face into the repo.
  profile: {
    handle: handle || 'someone',
    followers: 8420,
    posts: 213,
    avatar:
      'data:image/svg+xml;base64,' +
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72">' +
          '<rect width="72" height="72" fill="#2a3450"/>' +
          '<circle cx="36" cy="28" r="12" fill="#4a5670"/>' +
          '<path d="M12 72a24 24 0 0 1 48 0z" fill="#4a5670"/></svg>'
      ).toString('base64'),
  },
});

const TOPICS = {
  page: [
    {
      id: 't1',
      title: 'The evening reel that worked, made again on purpose',
      hook: 'You did this once by accident. Here is the shape of it.',
      format: 'Reel',
      why: 'Your best post this year had it, and nothing since has.',
    },
    {
      id: 't2',
      title: 'Answer the question your comments keep asking',
      hook: 'You have been asked this more than anything else.',
      format: 'Carousel',
      why: 'It is the one thing your audience has told you they want.',
    },
    {
      id: 't3',
      title: 'The part of your process nobody sees',
      hook: 'Everyone shows the result. Show the hour before it.',
      format: 'Reel',
      why: 'Process posts outperform result posts on pages your size.',
    },
  ],
  idea: [
    {
      id: 'i1',
      title: 'The first thing people get wrong about it',
      hook: 'Start where your reader is already wrong.',
      format: 'Carousel',
      why: 'A correction earns attention faster than an introduction.',
    },
    {
      id: 'i2',
      title: 'What it costs, honestly',
      hook: 'The number nobody in your field prints.',
      format: 'Reel',
      why: 'Specific figures travel further than advice.',
    },
    {
      id: 'i3',
      title: 'The one you would tell a friend, not an audience',
      hook: 'Say the version you would say at a table.',
      format: 'Reel',
      why: 'A new page grows on voice before it grows on subject.',
    },
  ],
};

/** The field an idea walks into, and what waiting costs. Shapes per the contract. */
const FIELD = {
  pages: [
    { handle: 'slow.mornings', followers: 41200, followersText: '41,200', postsPerMonth: '12', responseRate: '1.4%', bestFormat: 'reels' },
    { handle: 'the.quiet.kitchen', followers: 12800, followersText: '12,800', postsPerMonth: '8', responseRate: '2.1%', bestFormat: 'carousels' },
    { handle: 'firstyearnotes', followers: 3900, followersText: '3,900', postsPerMonth: '16', responseRate: '3.0%', bestFormat: 'reels' },
  ],
  rewards: { format: 'reels', pace: 'about 12 posts a month' },
};
const WAITING = { perWeek: 3, byNextYear: 156, ifThreeMonths: 117 };

/**
 * The view a visitor gets before, and after, leaving an address.
 *
 * Locked facts go out with their figure and sentence blank — the site draws a
 * placeholder, never a blurred copy of the real text — and the projection and
 * size block are withheld with them.
 */
/**
 * The receipt a read is opened with, exactly as the backend mints one.
 *
 * The fixture server used to flip a flag on the audit itself, which quietly reproduced the bug
 * the real gate had: reads are cached per handle, so one address opened the report for every
 * later visitor to the same page. Dev has to show the behaviour production has, or the gate is
 * only ever tested by the person who just paid for it.
 */
function receiptFor(id) {
  return 'mock-receipt-' + id;
}

/** Whether this request carries the receipt for this read. */
function opens(req, id) {
  const presented = req.headers['x-read-token'];
  return typeof presented === 'string' && presented === receiptFor(id);
}

function pageView(body, unlocked) {
  if (unlocked) {
    return { ...body, unlocked: true, facts: body.facts.map((f) => ({ ...f, locked: false })) };
  }
  return {
    ...body,
    unlocked: false,
    facts: body.facts.map((f) =>
      f.locked
        ? {
            key: f.key,
            label: f.label,
            value: '',
            text: '',
            locked: true,
            section: f.section,
            verdict: f.verdict,
          }
        : f
    ),
    projection: null,
    size: null,
  };
}

function ideaView(unlocked) {
  return {
    unlocked,
    topics: TOPICS.idea.map((t) =>
      unlocked ? { ...t, locked: false } : { id: t.id, title: t.title, format: t.format, hook: '', why: '', locked: true }
    ),
    field: { pages: FIELD.pages, rewards: unlocked ? FIELD.rewards : null },
    waiting: WAITING,
  };
}

const POST = {
  script: [
    'You did this once, in April, and it did four times what you normally do.',
    'It was a reel. You shot it in one take, in the evening, and you never explained why it worked.',
    'Here is the shape: one claim in the first two seconds, one specific in the middle, one line at the end people can repeat.',
    'That is it. That is the whole thing you already did by accident.',
  ],
  slides: [
    { title: 'You did this once', body: 'April. Four times your usual. One take.' },
    { title: 'The shape', body: 'A claim in two seconds. A specific in the middle.' },
    { title: 'The last line', body: 'Something they can repeat without you.' },
  ],
  caption:
    'You already made the post that worked. This is what was in it — and how to do it on purpose.',
};

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace(/^\/api\/public/, '');

  // The consent wording. Shortened stand-ins — the real clauses live in
  // ConsentTerms on the backend, and the hash of what it served is what gets
  // stored, so a fixture must never pretend to be authoritative.
  if (req.method === 'GET' && path === '/consent/terms') {
    const locale = url.searchParams.get('locale') || 'en';
    const clauses = {
      en: [
        'I agree to my Instagram handle being added as a tester on Diwche\u2019s Meta app.',
        'I understand that I have to accept the invitation myself in my own Instagram settings.',
        'I agree to Diwche creating an account for me and keeping my email address.',
        'I understand that nothing is posted to my Instagram until I connect the account myself.',
        'I can withdraw this consent at any time by writing to support@diwche.com.',
      ],
      fa: [
        'می‌پذیرم که آیدی اینستاگرام من به‌عنوان «تستر» به اپلیکیشن متای دیوچه اضافه شود.',
        'می‌دانم که باید دعوت‌نامه را خودم در تنظیمات اینستاگرامم بپذیرم.',
        'می‌پذیرم که دیوچه برای من حساب بسازد و ایمیلم را نگه دارد.',
        'می‌دانم که تا وقتی خودم وصل نکنم، چیزی منتشر نمی‌شود.',
        'هر زمان می‌توانم با نوشتن به support@diwche.com پسش بگیرم.',
      ],
      de: [
        'Ich bin damit einverstanden, dass mein Profilname als Tester zur Meta-App hinzugefügt wird.',
        'Mir ist klar, dass ich die Einladung selbst in meinen Instagram-Einstellungen annehmen muss.',
        'Ich bin einverstanden, dass Diwche ein Konto anlegt und meine E-Mail speichert.',
        'Mir ist klar, dass nichts veröffentlicht wird, solange ich nicht selbst verbinde.',
        'Ich kann jederzeit an support@diwche.com widerrufen.',
      ],
    };
    const title = {
      en: 'Permission to add you as a tester',
      fa: 'اجازه‌ی افزودن به‌عنوان تستر',
      de: 'Einwilligung: als Tester hinzufügen',
    };
    const l = clauses[locale] ? locale : 'en';
    return send(res, 200, {
      version: 'mock',
      locale: l,
      title: title[l],
      clauses: clauses[l],
      hash: 'mock-hash',
    });
  }

  if (req.method === 'POST' && path === '/consent') {
    const body = await readBody(req);
    console.log('[mock] consent from', body.email, 'for @' + body.handle);
    return send(res, 200, { ok: true, handle: body.handle });
  }

  if (req.method === 'GET' && path === '/lead/confirm') {
    const t = url.searchParams.get('t') || '';
    // "bad" is the fixture for the link that did not survive a mail client.
    if (!t || t === 'bad') {
      return send(res, 400, { kind: 'error', message: 'That link is not one of ours.' });
    }
    console.log('[mock] confirmed lead token', t);
    return send(res, 200, { ok: true, handle: 'someone', offer: 'RUNNING' });
  }

  if (req.method === 'POST' && path === '/audit') {
    const { handle = '' } = await readBody(req);
    const clean = String(handle).replace(/^@/, '').trim().toLowerCase();

    if (clean === 'limit') {
      return send(res, 429, { kind: 'limit', message: 'The Diw has read all he can today.' });
    }
    if (clean === 'human') {
      return send(res, 403, { kind: 'human', message: 'He could not tell that you were a person.' });
    }

    const id = 'mock-' + Math.random().toString(36).slice(2, 10);
    audits.set(id, {
      handle: clean,
      startedAt: Date.now(),
      // @slow outlasts the scenes on purpose, so the hold-the-last-scene path
      // is reachable without editing timings.
      // @fast exists for driving the later acts without sitting through the
      // introduction every time.
      duration: clean === 'slow' ? 46000 : clean === 'fast' ? 2600 : 26000,
      kind: clean === 'private' ? 'private' : clean === 'nobody' ? 'not_found' : 'ok',
      body: clean === 'weak' ? weak(clean) : strong(clean),
    });
    return send(res, 200, { id });
  }

  if (req.method === 'POST' && path === '/idea') {
    const id = 'idea-mock-' + Math.random().toString(36).slice(2, 10);
    audits.set(id, { handle: null, startedAt: Date.now(), duration: 0, kind: 'idea', body: null, unlocked: false });
    await new Promise((r) => setTimeout(r, 400));
    return send(res, 200, { id });
  }

  const eventsMatch = path.match(/^\/audit\/([^/]+)\/events$/);
  if (req.method === 'GET' && eventsMatch) {
    const audit = audits.get(eventsMatch[1]);
    if (!audit) return send(res, 404, { kind: 'error', message: 'Unknown audit.' });

    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-store',
      connection: 'keep-alive',
    });

    const emit = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const timers = [];

    for (const [at, stage, message] of STEPS) {
      timers.push(
        setTimeout(() => emit('progress', { stage, message, progress: at }), audit.duration * at)
      );
    }

    timers.push(
      setTimeout(() => {
        if (audit.kind === 'private') {
          emit('failed', {
            kind: 'private',
            message: 'That page is private, so there is nothing for him to read.',
          });
        } else if (audit.kind === 'not_found') {
          emit('failed', { kind: 'not_found', message: 'He could not find that page.' });
        } else {
          emit('result', pageView({ id: eventsMatch[1], ...audit.body }, opens(req, eventsMatch[1])));
        }
        res.end();
      }, audit.duration)
    );

    req.on('close', () => timers.forEach(clearTimeout));
    return;
  }

  const auditMatch = path.match(/^\/audit\/([^/]+)$/);
  if (req.method === 'GET' && auditMatch) {
    const audit = audits.get(auditMatch[1]);
    if (!audit) return send(res, 404, { kind: 'error', message: 'Unknown audit.' });
    if (Date.now() - audit.startedAt < audit.duration) {
      // Polling fallback: "not ready" is an error the client retries on.
      return send(res, 503, { kind: 'error', message: 'Still reading.' });
    }
    if (audit.kind !== 'ok') {
      return send(res, 422, {
        kind: audit.kind,
        message:
          audit.kind === 'private'
            ? 'That page is private, so there is nothing for him to read.'
            : 'He could not find that page.',
      });
    }
    return send(res, 200, pageView({ id: auditMatch[1], ...audit.body }, opens(req, auditMatch[1])));
  }

  const topicsMatch = path.match(/^\/audit\/([^/]+)\/topics$/);
  if (req.method === 'POST' && topicsMatch) {
    const { branch = 'page' } = await readBody(req);
    await new Promise((r) => setTimeout(r, 2600));
    if (branch === 'idea') {
      return send(res, 200, ideaView(opens(req, topicsMatch[1])));
    }
    return send(res, 200, { unlocked: true, topics: TOPICS.page, field: null, waiting: null });
  }

  const postMatch = path.match(/^\/audit\/([^/]+)\/post$/);
  if (req.method === 'POST' && postMatch) {
    const { topicId = 't1' } = await readBody(req);
    await new Promise((r) => setTimeout(r, 4200));
    return send(res, 200, { topicId, ...POST });
  }

  const leadMatch = path.match(/^\/audit\/([^/]+)\/lead$/);
  if (req.method === 'POST' && leadMatch) {
    const { email } = await readBody(req);
    if (!email || !String(email).includes('@')) {
      return send(res, 400, { kind: 'error', message: 'That address does not look right.' });
    }
    const audit = audits.get(leadMatch[1]);
    await new Promise((r) => setTimeout(r, 700));
    if (!audit) return send(res, 404, { kind: 'error', message: 'Unknown audit.' });

    // The receipt, the way the backend mints one. The site keeps it and sends it back, so a
    // reload stays unlocked and the next visitor to the same cached handle does not inherit it.
    const receipt = receiptFor(leadMatch[1]);
    if (audit.kind === 'idea') return send(res, 200, { ok: true, token: receipt, ...ideaView(true) });
    return send(res, 200, {
      ok: true,
      token: receipt,
      ...pageView({ id: leadMatch[1], ...audit.body }, true),
    });
  }

  if (req.method === 'POST' && path === '/lead') {
    const { email } = await readBody(req);
    if (!email || !String(email).includes('@')) {
      return send(res, 400, { kind: 'error', message: 'That address does not look right.' });
    }
    await new Promise((r) => setTimeout(r, 600));
    return send(res, 200, { ok: true });
  }

  // The proof step, as a deployment that has not nominated an account for it. A 503 is how the
  // backend says "switched off", and the site then reads the page on the human token instead.
  // Without this route the fixture server answered 404, the site treated that as a refusal, and
  // the walk stopped dead on the handle screen — which made the whole read unreachable in dev.
  if (req.method === 'POST' && path === '/proof') {
    return send(res, 503, { kind: 'error', message: 'The proof step is off in this fixture.' });
  }

  const proofMatch = path.match(/^\/audit\/([^/]+)\/proof$/);
  if (req.method === 'POST' && proofMatch) {
    return send(res, 200, { code: '4821', account: 'diwche.app', expiresInSeconds: 600 });
  }

  send(res, 404, { kind: 'error', message: 'No such route.' });
});

server.listen(PORT, () => {
  console.log(`[mock] /api/public on http://localhost:${PORT}`);
  console.log('[mock] handles: @weak @private @nobody @limit @slow @fast @human — anything else is a healthy page');
});
