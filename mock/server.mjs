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
    headline: 'about 340 more responses a month',
    assumption:
      'That is your own reel rate, applied to a steadier month at the pace pages your size keep. It assumes nothing improves — only that you keep doing the thing that already works for you, and keep doing it.',
    rows: [
      { label: 'Posts a month', now: '9', then: '20' },
      { label: 'Reels among them', now: '2', then: '9' },
      { label: 'Responses a month', now: '≈ 610', then: '≈ 950' },
    ],
  },
  verified: false,
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
    headline: 'about 120 more responses a month',
    assumption:
      'That is your own best-performing shape — shorter captions, posted in the evening — applied to the same number of posts you already make. It assumes you post no more than you do today.',
    rows: [
      { label: 'Posts a month', now: '12', then: '12' },
      { label: 'Response rate', now: '0.6%', then: '0.9%' },
      { label: 'Responses a month', now: '≈ 210', then: '≈ 330' },
    ],
  },
  verified: false,
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
    return send(res, 200, { code: '4821', account: 'tiffje.app', expiresInSeconds: 600 });
  }

  send(res, 404, { kind: 'error', message: 'No such route.' });
});

server.listen(PORT, () => {
  console.log(`[mock] /api/public on http://localhost:${PORT}`);
  console.log('[mock] handles: @weak @private @nobody @limit @slow @fast — anything else is a healthy page');
});
