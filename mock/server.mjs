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
 *   anything else → a healthy page
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

const strong = (handle) => ({
  handle,
  source: 'discovery',
  headline:
    'Your reels do more than twice what your photos do — and almost everything you post is a photo.',
  facts: [
    {
      key: 'format',
      label: 'Format mismatch',
      value: '2.3×',
      text: 'Your reels average 2.3 times the response of your photos. Photos are most of what you post.',
      meter: { value: 23, max: 100, benchmark: 62, benchmarkLabel: 'reels' },
    },
    {
      key: 'best',
      label: 'The one that worked',
      value: '4.1×',
      text: 'Your best post did four times your own median. It was a reel, on a Tuesday evening, and nothing since has had its shape.',
    },
    {
      key: 'cadence',
      label: 'The quiet stretch',
      value: '23 days',
      text: 'You went twenty-three days without posting in July. What you posted after it did about half of what you were doing before.',
    },
    {
      key: 'rate',
      label: 'Against your size',
      value: '1.4%',
      text: 'For pages between five and twenty thousand, that sits just under the middle. Not bad. Not the ceiling either.',
      locked: true,
      meter: { value: 44, max: 100, benchmark: 50, benchmarkLabel: 'median' },
    },
    {
      key: 'asked',
      label: 'What they keep asking',
      value: 'Unanswered',
      text: 'The question that comes up most in your comments is one you have never made a post about.',
      locked: true,
    },
  ],
  projection: {
    headline: 'about 340 more likes and comments a month',
    assumption:
      'That is your own reel rate, applied to a steadier month at the pace pages your size keep. It assumes nothing improves — only that you keep doing the thing that already works for you, and keep doing it.',
    now: { label: 'Now', value: 610, amount: '610', pace: 'about 9 posts a month' },
    then: { label: 'With him', value: 950, amount: '950', pace: 'about 20 posts a month' },
    moves: [
      'He brings you a topic every morning, so about 20 posts a month stops waiting on you having an idea.',
      'He shoots, captions and lays out your reels — the format your page already answers to.',
      'He goes back to the post that did 4.1× your own median, and builds from its shape.',
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
      key: 'hook',
      label: 'The same opening',
      value: '11 in a row',
      text: 'Your last eleven captions open the same way. The response has fallen with almost every one.',
    },
    {
      key: 'rate',
      label: 'Against your size',
      value: '0.6%',
      text: 'For pages your size that sits in the bottom quarter. It is the number most worth moving.',
      meter: { value: 18, max: 100, benchmark: 50, benchmarkLabel: 'median' },
    },
    {
      key: 'length',
      label: 'Caption habit',
      value: '340 vs 90',
      text: 'Your captions run about 340 characters. Your five best run about ninety.',
    },
    {
      key: 'hour',
      label: 'When you post',
      value: '09:00',
      text: 'You post in the morning. Your own best posts went up in the evening.',
      locked: true,
    },
    {
      key: 'asked',
      label: 'What they keep asking',
      value: 'Unanswered',
      text: 'The question that comes up most in your comments is one you have never made a post about.',
      locked: true,
    },
  ],
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
    const id = 'mock-idea-' + Math.random().toString(36).slice(2, 10);
    audits.set(id, { handle: null, startedAt: Date.now(), duration: 0, kind: 'idea', body: null });
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
          emit('result', { id: eventsMatch[1], ...audit.body });
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
    return send(res, 200, { id: auditMatch[1], ...audit.body });
  }

  const topicsMatch = path.match(/^\/audit\/([^/]+)\/topics$/);
  if (req.method === 'POST' && topicsMatch) {
    const { branch = 'page' } = await readBody(req);
    await new Promise((r) => setTimeout(r, 2600));
    return send(res, 200, { topics: TOPICS[branch] ?? TOPICS.page });
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
    if (audit) audit.body.verified = true;
    await new Promise((r) => setTimeout(r, 700));
    return send(res, 200, { ok: true });
  }

  if (req.method === 'POST' && path === '/lead') {
    const { email } = await readBody(req);
    if (!email || !String(email).includes('@')) {
      return send(res, 400, { kind: 'error', message: 'That address does not look right.' });
    }
    await new Promise((r) => setTimeout(r, 600));
    return send(res, 200, { ok: true });
  }

  const proofMatch = path.match(/^\/audit\/([^/]+)\/proof$/);
  if (req.method === 'POST' && proofMatch) {
    return send(res, 200, { code: '4821', account: 'diwche.app', expiresInSeconds: 600 });
  }

  send(res, 404, { kind: 'error', message: 'No such route.' });
});

server.listen(PORT, () => {
  console.log(`[mock] /api/public on http://localhost:${PORT}`);
  console.log('[mock] handles: @weak @private @nobody @limit @slow @fast — anything else is a healthy page');
});
