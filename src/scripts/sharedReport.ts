/**
 * Puts a shared report on screen.
 *
 * The backend hands back the whole report as one finished HTML document, so this only has to
 * fetch it and hand it to a sandboxed iframe. `srcdoc` rather than a direct navigation because
 * the API path is not the address the reader typed and should not become their URL bar.
 */
import { fetchSharedReport } from '../lib/publicApi';

function tokenFromPath(): string | null {
  const match = /^\/r\/([A-Za-z0-9_-]{8,64})\/?$/.exec(window.location.pathname);
  return match ? match[1] : null;
}

export async function loadSharedReport(): Promise<void> {
  const loading = document.getElementById('report-loading');
  const missing = document.getElementById('report-missing');
  const frame = document.getElementById('report-frame') as HTMLIFrameElement | null;

  const token = tokenFromPath();
  if (!token || !frame) {
    loading?.setAttribute('hidden', '');
    missing?.removeAttribute('hidden');
    return;
  }

  try {
    const html = await fetchSharedReport(token);
    if (!html) {
      loading?.setAttribute('hidden', '');
      missing?.removeAttribute('hidden');
      return;
    }
    frame.srcdoc = html;
    loading?.setAttribute('hidden', '');
    frame.removeAttribute('hidden');
  } catch {
    loading?.setAttribute('hidden', '');
    missing?.removeAttribute('hidden');
  }
}
