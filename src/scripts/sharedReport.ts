/**
 * Puts a shared report on screen.
 *
 * The backend hands back the whole report as one finished HTML document, so this only has to
 * fetch it and hand it to a sandboxed iframe. `srcdoc` rather than a direct navigation because
 * the API path is not the address the reader typed and should not become their URL bar.
 *
 * Two different failures, two different panels. A share link does not expire, so "expired" is
 * only the truth when the server says it does not know the token (404). Anything else — the
 * network, a 502 while the server moves, a rate limit — is "try again in a minute", with a button
 * that does exactly that (#510 follow-up: a tester was told a live link had expired during a 502).
 */
import { fetchSharedReport } from '../lib/publicApi';

type State = 'loading' | 'missing' | 'failed' | 'shown';

function tokenFromPath(): string | null {
  const match = /^\/r\/([A-Za-z0-9_-]{8,64})\/?$/.exec(window.location.pathname);
  return match ? match[1] : null;
}

function show(state: State): void {
  const panels: Record<State, HTMLElement | null> = {
    loading: document.getElementById('report-loading'),
    missing: document.getElementById('report-missing'),
    failed: document.getElementById('report-failed'),
    shown: document.getElementById('report-frame'),
  };
  for (const [name, el] of Object.entries(panels)) {
    if (name === state) el?.removeAttribute('hidden');
    else el?.setAttribute('hidden', '');
  }
}

async function load(token: string, frame: HTMLIFrameElement): Promise<void> {
  show('loading');
  let html: string | null;
  try {
    html = await fetchSharedReport(token);
  } catch {
    show('failed');
    return;
  }
  if (html === null) {
    show('missing');
    return;
  }
  if (!html) {
    // A 200 with nothing in it is the server misbehaving, not the link being gone.
    show('failed');
    return;
  }
  frame.srcdoc = html;
  show('shown');
}

export async function loadSharedReport(): Promise<void> {
  const frame = document.getElementById('report-frame') as HTMLIFrameElement | null;
  const token = tokenFromPath();
  if (!token || !frame) {
    show('missing');
    return;
  }

  const retry = document.getElementById('report-retry') as HTMLButtonElement | null;
  retry?.addEventListener('click', async () => {
    retry.disabled = true;
    try {
      await load(token, frame);
    } finally {
      retry.disabled = false;
    }
  });

  await load(token, frame);
}
