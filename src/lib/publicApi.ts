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
export type AuditErrorKind = 'not_found' | 'private' | 'limit' | 'error';

export interface AuditProgress {
  stage: AuditStage;
  /** One user-facing line. Never names a vendor (the backend guards this). */
  message: string;
  /** 0–1, monotonic. Drives nothing visual on its own; the scenes have their own clock. */
  progress: number;
}

export interface Fact {
  key: string;
  /** Two or three words, sits above the value. */
  label: string;
  /** The figure itself — already formatted by the backend, never re-derived here. */
  value: string;
  /** The sentence that makes the figure mean something. */
  text: string;
  /** Held back until the visitor leaves an email. */
  locked?: boolean;
  /** Optional bar: where this page sits against pages of its size. */
  meter?: { value: number; max: number; benchmark?: number; benchmarkLabel?: string };
}

export interface Projection {
  /** e.g. "about 340 more interactions a month" */
  headline: string;
  /** The assumption behind it, printed in full. No projection ships without one. */
  assumption: string;
  rows: Array<{ label: string; now: string; then: string }>;
}

export interface AuditResult {
  id: string;
  handle: string;
  source: 'discovery' | 'apify';
  /** One sentence. The thing they came for. */
  headline: string;
  facts: Fact[];
  projection: Projection | null;
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
}

export interface PostPreview {
  topicId: string;
  script: string[];
  slides: Array<{ title: string; body: string }>;
  caption: string;
}

export interface Proof {
  code: string;
  account: string;
  expiresInSeconds: number;
}

const BASE = '/api/public';

class ApiError extends Error {
  kind: AuditErrorKind;
  constructor(kind: AuditErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return unwrap<T>(res);
}

async function get<T>(path: string): Promise<T> {
  return unwrap<T>(await fetch(BASE + path));
}

async function unwrap<T>(res: Response): Promise<T> {
  if (res.ok) return (await res.json()) as T;

  // 429 is the rate limiter or the daily cap. Both are the same story to a
  // visitor: not today, but leave an email and it still reaches you.
  if (res.status === 429) {
    throw new ApiError('limit', 'The Diw has read all he can today.');
  }

  let kind: AuditErrorKind = 'error';
  let message = 'Something went wrong on our side.';
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
export function startAudit(handle: string, turnstile: string | null) {
  return post<{ id: string }>('/audit', { handle, turnstile });
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
  return post<{ id: string }>('/idea', { idea, turnstile });
}

export function getAudit(id: string) {
  return get<AuditResult>(`/audit/${id}`);
}

export function getTopics(id: string, branch: 'page' | 'idea', idea?: string) {
  return post<{ topics: Topic[] }>(`/audit/${id}/topics`, { branch, idea: idea ?? null });
}

export function makePost(id: string, topicId: string) {
  return post<PostPreview>(`/audit/${id}/post`, { topicId });
}

export function saveLead(id: string, email: string, consent: boolean) {
  return post<{ ok: true }>(`/audit/${id}/lead`, { email, consent });
}

/**
 * A lead with no audit behind it.
 *
 * Used when the day's reads are spent: the visitor arrived wanting this and the
 * cap is our problem, not theirs, so the address is still worth taking and the
 * read still owed. Same table, no audit attached.
 */
export function saveWaitingLead(handle: string, email: string, consent: boolean) {
  return post<{ ok: true }>('/lead', { handle, email, consent });
}

export function requestProof(id: string) {
  return post<Proof>(`/audit/${id}/proof`, {});
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
