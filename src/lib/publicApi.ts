/**
 * The only place on the site that knows the shape of the public API.
 *
 * Everything here is unauthenticated by design: the browser never holds a token.
 * The site's own nginx proxies `/api/public/*` to the backend, so these are
 * same-origin calls and there is no CORS surface at all. Rate limiting, the
 * proof-of-human check and the spend cap all live behind that proxy — see
 * `nginx.conf` and the backend's `com.sma.publicaudit`.
 *
 * In `npm run dev` the same paths are proxied to `mock/server.mjs` instead, so
 * the show can be tuned without spending a scrape or a model call per reload,
 * and so the private / not-found / slow states are reachable on demand.
 */

export type AuditStage = 'queued' | 'reading' | 'analyzing' | 'writing' | 'done' | 'error';

/** Why an audit could not be produced. Each maps to its own on-screen copy. */
export type AuditErrorKind = 'not_found' | 'private' | 'limit' | 'error' | 'human';

export interface AuditProgress {
  stage: AuditStage;
  /** One user-facing line. Never names a vendor (the backend guards this). */
  message: string;
  /** 0–1, monotonic. Drives nothing visual on its own; the scenes have their own clock. */
  progress: number;
}

/** Which part of the report a finding belongs under. Decides the heading it sits beneath. */
export type Section = 'rhythm' | 'format' | 'audience' | 'peers' | 'words';

/** How a finding, or a whole section, reads. The word for it comes from the locale. */
export type Verdict = 'good' | 'weak' | 'bad' | 'dead' | 'neutral';

export interface Fact {
  key: string;
  /**
   * The English label the backend computed it under.
   *
   * A fallback only. The heading the page shows comes from `copy.result.labels[key]`, so a
   * Persian read is headed in Persian — the arithmetic is published in no language and the words
   * are the locale's job.
   */
  label: string;
  /** The figure itself — already formatted by the backend, never re-derived here. */
  value: string;
  /** The sentence that makes the figure mean something. */
  text: string;
  /**
   * Held back until the visitor leaves an email.
   *
   * While the read is still locked these arrive with `value` and `text`
   * empty — the site draws a placeholder shape and blurs that, never real
   * text, so there is nothing under the blur to lift.
   */
  locked?: boolean;
  /** Optional bar: where this page sits against pages of its size. */
  meter?: { value: number; max: number; benchmark?: number; benchmarkLabel?: string };
  section?: Section | null;
  verdict?: Verdict | null;
}

/**
 * One post, for the chart.
 *
 * Sent with every read, locked or not: the chart is the evidence the findings are drawn from,
 * and holding the evidence back while showing the conclusions would be the wrong way round.
 */
export interface TimelinePoint {
  at: number;
  /** Null when the page hides its like counts. Drawn as unknown, never as a zero. */
  engagement: number | null;
  format: string;
}

/** How often the page posts, judged over the last sixty days. From the dates alone. */
export interface Rhythm {
  firstPostAt: number | null;
  postsRead: number;
  postsLast60Days: number;
  perWeek: number;
  longestGapDays: number;
  daysSinceLast: number;
  verdict: Verdict;
}

/**
 * How much of the following answers.
 *
 * `reference` is what a page this size ordinarily gets back — from pages this deployment has
 * actually read once there are enough of them, and from an editorial rule of thumb until then.
 * Null means nothing is ranked, only stated.
 */
export interface Audience {
  rate: number;
  reference: number | null;
  typical: number;
  verdict: Verdict;
}

/** One page this read is measured against. `named` means the visitor asked for it. */
export interface Peer {
  handle: string;
  followers: number;
  followersText: string;
  postsPerMonth: number | null;
  rate: string;
  named: boolean;
  /** Null while the read is held back. */
  bestFormat: string | null;
}

export interface Side {
  label: string;
  value: number;
  amount: string;
  pace: string;
}

export interface Projection {
  /** e.g. "about 340 more likes and comments a month" */
  headline: string;
  /** The assumption behind it, printed in full. No projection ships without one. */
  assumption: string;
  /**
   * The two sides of the comparison. `value` draws the bar, `amount` is what a
   * person reads — the backend formats both so nothing here has to round.
   */
  now: Side;
  then: Side;
  /** What he would actually do to get there. A number nobody can act on is just a number. */
  moves: string[];
  /**
   * The same arithmetic run forward: one month, six months, a year.
   *
   * Optional, because reads cached before this existed come back without it and a stored
   * projection is not wrong for lacking them — the strip is skipped rather than the panel.
   */
  horizons?: Horizon[];
}

/** One window: everything that lands by then, and the part that is new. */
export interface Horizon {
  label: string;
  months: number;
  total: string;
  extra: string;
  value: number;
}

/**
 * The page itself, as he found it.
 *
 * Everything else in a read is a claim about their page; this is the evidence
 * that it is theirs. The picture arrives as a data URI rather than an Instagram
 * CDN link — those expire, and the site allows no external image hosts.
 */
export interface Profile {
  handle: string;
  followers: number | null;
  posts: number | null;
  avatar: string | null;
}

/**
 * What a page this size could be doing, in the reader's own numbers.
 *
 * Withheld with the projection until the read is unlocked. The tier picks the
 * title (a page under a thousand is talked to differently from one over a
 * hundred thousand); the lines are already worded by the backend.
 */
export type SizeTier = 'under1k' | '1k' | '10k' | '100k';

export interface SizeLine {
  key: string;
  value: string;
  text: string;
}

export interface Size {
  tier: SizeTier;
  lines: SizeLine[];
}

export interface AuditResult {
  id: string;
  handle: string;
  source: 'discovery' | 'apify';
  /** One sentence. The thing they came for. */
  headline: string;
  /** False until an address has been left. The locked facts, projection and size follow it. */
  unlocked: boolean;
  facts: Fact[];
  /** Every post the arithmetic ran on. Never held back. */
  timeline: TimelinePoint[] | null;
  rhythm: Rhythm | null;
  audience: Audience | null;
  peers: Peer[];
  /** Null until unlocked — and legitimately null after it, when there was too little to say. */
  projection: Projection | null;
  size: Size | null;
  profile: Profile | null;
  /** True once the DM code has arrived from this handle. */
  verified: boolean;
}

export interface AuditFailure {
  kind: AuditErrorKind;
  message: string;
}

export interface Topic {
  id: string;
  title: string;
  hook: string;
  format: string;
  why: string;
  /** Title and format are open; `hook` and `why` arrive blank while this is true. */
  locked?: boolean;
}

/** A page already working the subject the visitor described. All figures pre-formatted. */
export interface FieldPage {
  handle: string;
  followers: number;
  followersText: string;
  postsPerMonth: string;
  responseRate: string;
  bestFormat: string;
}

/** What the subject rewards, once unlocked: a format and a pace, for one sentence of copy. */
export interface Rewards {
  format: string;
  pace: string;
}

export interface Field {
  pages: FieldPage[];
  rewards: Rewards | null;
}

/** The cost of waiting, as post counts. Words come from the locale. */
export interface Waiting {
  perWeek: number;
  byNextYear: number;
  ifThreeMonths: number;
}

/**
 * The starter branch's whole answer.
 *
 * Nothing was measured, so nothing is claimed about a page — but the field the
 * idea is walking into is real, and so is the arithmetic of starting late.
 */
export interface IdeaResult {
  unlocked: boolean;
  topics: Topic[];
  field: Field | null;
  waiting: Waiting | null;
}

/**
 * What leaving an address returns: the same view, unlocked.
 *
 * A page read comes back as the full result; an idea session as the full
 * topics answer. The site replaces what it holds with this and re-renders —
 * it never flips `locked` by itself.
 */
/**
 * What leaving an address returns: the same view unlocked, and the receipt for it.
 *
 * The token is the visitor's proof, not the read's. Reads are cached per handle, so a gate that
 * asked "has anybody left an address for this audit" opened the report for every later visitor
 * to the same page — see the backend's ReadTokens. The site keeps this and sends it back.
 */
export type LeadResult = ({ ok: true; token?: string } & AuditResult)
  | ({ ok: true; token?: string } & IdeaResult);

export interface PostPreview {
  topicId: string;
  script: string[];
  slides: Array<{ title: string; body: string }>;
  caption: string;
}

export type ProofStatus = 'waiting' | 'verified' | 'wrong_account' | 'not_following' | 'expired';

export interface Proof {
  id: string;
  code: string;
  /** Diwche's own handle, the one to follow and message. */
  account: string;
  /** The page named, as the backend normalised it. */
  handle: string;
  status: ProofStatus;
  expiresInSeconds: number;
  /** Who actually sent the code, once someone has. */
  sentBy?: string;
}

const BASE = '/api/public';

/**
 * The page's own language, and the one sentence this module has to say for itself.
 *
 * Everything else a visitor is shown comes back from the backend already written in their
 * language. Two things cannot: the refusal behind a bare 429, which arrives as a status with no
 * usable body at all, and the fallback for a response that is not JSON — a proxy answering
 * instead of the app. Both used to be English literals in `unwrap`, which is how an English
 * sentence appeared on a Persian screen at the exact moment something went wrong.
 *
 * Set once by the funnel out of the copy already on the page. The English defaults stand for
 * any other caller.
 */
let SAY = {
  limit: 'He has read all he can today.',
  generic: 'Something went wrong on our side.',
};

export function setApiMessages(said: Partial<typeof SAY>) {
  SAY = { ...SAY, ...said };
}

/**
 * The locale of the page making the call.
 *
 * Sent in the body of everything that posts, because the backend writes several sentences a
 * visitor reads — refusals, progress lines, the read itself — and the page they are looking at
 * is the only thing that actually knows which language that is. `Accept-Language` is the
 * browser's preference, which is a different question.
 */
function here(): string {
  return document.documentElement.lang || 'en';
}

class ApiError extends Error {
  kind: AuditErrorKind;
  constructor(kind: AuditErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

async function post<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: token
      ? { 'content-type': 'application/json', 'X-Read-Token': token }
      : { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return unwrap<T>(res);
}

async function get<T>(path: string, token?: string | null): Promise<T> {
  return unwrap<T>(await fetch(BASE + path, token ? { headers: { 'X-Read-Token': token } } : undefined));
}

async function unwrap<T>(res: Response): Promise<T> {
  if (res.ok) return (await res.json()) as T;

  // 429 is the rate limiter or the daily cap. Both are the same story to a
  // visitor: not today, but leave an email and it still reaches you.
  if (res.status === 429) {
    throw new ApiError('limit', SAY.limit);
  }

  let kind: AuditErrorKind = 'error';
  let message = SAY.generic;
  try {
    const body = (await res.json()) as Partial<AuditFailure>;
    if (body.kind) kind = body.kind;
    if (body.message) message = body.message;
  } catch {
    /* A non-JSON body means the proxy answered, not the app. Keep the default. */
  }
  throw new ApiError(kind, message);
}

export { ApiError };

/** Starts a read. Returns as soon as the audit has an id — the work runs on. */
export function startAudit(
  handle: string,
  turnstile: string | null,
  locale = 'en',
  proofId: string | null = null,
  rivals: string[] = []
) {
  // The locale rides with the request so the findings come back written in the
  // language the walk is in. Without it a Persian funnel ends on English facts,
  // which looks finished right up until the last screen. The proof id is what a
  // read costs once the proof step is on; the backend refuses without it then.
  return post<{ id: string }>('/audit', { handle, turnstile, locale, proofId, rivals });
}

/**
 * Mints the code the visitor sends from their own account. Spends the human
 * check, which is why starting the read afterwards does not need another.
 * 503 means the proof step is switched off on the server — the read then
 * proceeds without it, with the token this call did not consume.
 */
export async function startProof(handle: string, turnstile: string | null): Promise<Proof | null> {
  const res = await fetch(BASE + '/proof', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ handle, turnstile, locale: here() }),
  });
  if (res.status === 503) return null;
  return unwrap<Proof>(res);
}

export function getProof(id: string) {
  return get<Proof>(`/proof/${id}`);
}

/**
 * The other door: someone with no page yet, only a subject.
 *
 * Nothing is scraped and nothing is measured, so this deliberately does not
 * produce an audit — there would be no facts in it, and a reveal with no facts
 * is exactly the empty theatre this page is meant to avoid. It returns a session
 * the topic call can hang off, and the walk picks up at the topics.
 */
export function startIdea(idea: string, turnstile: string | null) {
  return post<{ id: string }>('/idea', { idea, turnstile, locale: here() });
}

// Nothing is measured on this branch. What it returns is the field around the
// idea and the topics he would start with — an empty list of either is a
// legitimate answer rather than a failure.

export function getAudit(id: string, token?: string | null) {
  return get<AuditResult>(`/audit/${id}`, token);
}

export function getTopics(
  id: string,
  branch: 'page' | 'idea',
  idea?: string,
  locale = 'en',
  token?: string | null
) {
  return post<IdeaResult>(`/audit/${id}/topics`, { branch, idea: idea ?? null, locale }, token);
}

export function makePost(id: string, topicId: string) {
  return post<PostPreview>(`/audit/${id}/post`, { topicId });
}

/**
 * The answers ride along with the address.
 *
 * What someone told the funnel — whose page it is, what they make, which part
 * of the week it eats — is the difference between a list of addresses and a
 * list of people worth writing to, so it is stored with the lead rather than
 * thrown away at the last screen.
 */
export type Answers = Record<string, string | string[]>;

export function saveLead(
  id: string,
  email: string,
  consent: boolean,
  answers: Answers = {},
  turnstile: string | null = null,
) {
  return post<LeadResult>(`/audit/${id}/lead`, {
    email,
    consent,
    answers,
    turnstile,
    locale: here(),
  });
}

/**
 * A lead with no audit behind it.
 *
 * Used when the day's reads are spent: the visitor arrived wanting this and the
 * cap is our problem, not theirs, so the address is still worth taking and the
 * read still owed. Same table, no audit attached.
 */
export function saveWaitingLead(
  handle: string,
  email: string,
  consent: boolean,
  answers: Answers = {},
  turnstile: string | null = null
) {
  return post<{ ok: true }>('/lead', {
    handle,
    email,
    consent,
    answers,
    turnstile,
    locale: here(),
  });
}

/**
 * Progress until the audit is done.
 *
 * SSE first, because the backend already streams progress lines and they are
 * half the drama of the wait. Polling is the fallback for the cases SSE cannot
 * survive: a proxy that buffers, a corporate middlebox, or `EventSource` being
 * absent. Both paths end by resolving the same result object.
 */
export function watchAudit(
  id: string,
  onProgress: (p: AuditProgress) => void
): { done: Promise<AuditResult>; cancel: () => void } {
  let cancelled = false;
  let source: EventSource | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const done = new Promise<AuditResult>((resolve, reject) => {
    const finish = (result: AuditResult) => {
      if (cancelled) return;
      cleanup();
      resolve(result);
    };
    const fail = (err: unknown) => {
      if (cancelled) return;
      cleanup();
      reject(err);
    };

    const poll = async () => {
      // Interval is deliberately unhurried: the show has its own clock and does
      // not need sub-second resolution to look alive.
      try {
        const result = await getAudit(id);
        if (cancelled) return;
        finish(result);
      } catch (err) {
        if (err instanceof ApiError && err.kind === 'error') {
          timer = setTimeout(poll, 1200);
          return;
        }
        fail(err);
      }
    };

    if (typeof EventSource === 'undefined') {
      timer = setTimeout(poll, 1200);
      return;
    }

    source = new EventSource(`${BASE}/audit/${id}/events`);

    source.addEventListener('progress', (ev) => {
      try {
        onProgress(JSON.parse((ev as MessageEvent).data) as AuditProgress);
      } catch {
        /* A malformed frame is not worth ending the show over. */
      }
    });

    source.addEventListener('result', (ev) => {
      try {
        finish(JSON.parse((ev as MessageEvent).data) as AuditResult);
      } catch (err) {
        fail(err);
      }
    });

    source.addEventListener('failed', (ev) => {
      try {
        const body = JSON.parse((ev as MessageEvent).data) as AuditFailure;
        fail(new ApiError(body.kind, body.message));
      } catch (err) {
        fail(err);
      }
    });

    // A dropped stream is not a failed audit — the work continues server-side,
    // so fall back to polling rather than telling the visitor it broke.
    source.onerror = () => {
      if (cancelled || !source) return;
      source.close();
      source = null;
      timer = setTimeout(poll, 800);
    };
  });

  function cleanup() {
    if (source) source.close();
    if (timer) clearTimeout(timer);
    source = null;
    timer = null;
  }

  return {
    done,
    cancel: () => {
      cancelled = true;
      cleanup();
    },
  };
}
