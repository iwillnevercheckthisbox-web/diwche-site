/**
 * A video-editor project, seeded through the real API, ready to be photographed.
 *
 * The editor is client-side state: a seeded database gives you an empty canvas,
 * and clicking through a creation flow at shutter time is slow and flaky. So the
 * project is built the way the editor itself saves one — media uploaded through
 * `/media/upload`, then a whole `timelineJson` PUT to `/timeline` — and the
 * browser only has to open it.
 *
 * The one trick this needs is the editor gate. `/video-editor` is behind
 * `editorGateGuard`, which asks for a media folder on disk. Storing an OPFS
 * directory handle in IndexedDB under `sma-vault/handles` key `root` satisfies
 * it: `queryPermission()` answers "granted" for an OPFS handle, so a real
 * FolderVault activates with no folder picker. Same trick the trimming
 * verification scripts use (findings/verify/video-editor/*.cjs).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const MEDIA = join(HERE, 'media');
const API = process.env.SHOOT_API_URL || 'http://localhost:8459';

async function upload(projectId, file, type) {
  const form = new FormData();
  form.append('file', new Blob([readFileSync(join(MEDIA, file))], { type }), file);
  const res = await fetch(`${API}/api/video-projects/${projectId}/media/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`upload ${file}: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Builds the project and returns its id.
 *
 * Deliberately re-created on every run rather than reused: a project that has
 * been open in a browser has been autosaved, and a screenshot taken against
 * "whatever the last run left behind" is not reproducible.
 */
export async function seedEditorProject(name = 'Kitchen story') {
  const created = await fetch(`${API}/api/video-projects`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, accountId: '1' }),
  });
  if (!created.ok) throw new Error(`create project: ${created.status}`);
  const { id } = await created.json();

  const a = await upload(id, 'shot-a.mp4', 'video/mp4');
  const b = await upload(id, 'shot-b.mp4', 'video/mp4');
  const c = await upload(id, 'shot-c.mp4', 'video/mp4');
  const still = await upload(id, 'still.jpg', 'image/jpeg');

  const pool = [a, b, c, still].map((m) => ({
    url: m.url,
    mediaType: m.mediaType ?? (m.isVideo ? 'video' : 'image'),
    durationSec: m.durationSec ?? 4,
  }));

  const clip = (m, inSec, outSec) => ({
    url: m.url,
    mediaType: 'video',
    trimInSec: inSec,
    trimOutSec: outSec,
    volumePct: 100,
    kind: 'media',
  });

  const timeline = {
    pool,
    // Three cuts, so there are two junctions to point a screenshot at, and the
    // middle clip is trimmed at both ends so the trim article has something real
    // to show.
    clips: [clip(a, 0.4, 4.6), clip(b, 0.6, 3.8), clip(c, 0, 5.2)],
    v2Clips: [],
    transitions: [
      { type: 'dissolve', durationSec: 0.6 },
      { type: 'jump', durationSec: 0.5 },
    ],
    audioItems: [],
    effects: [],
    texts: [
      {
        startSec: 0.3,
        durationSec: 2.4,
        text: 'Three minutes on the street',
        sizePct: 7,
        colorHex: '#FFFFFF',
        xPct: 50,
        yPct: 22,
        bgMode: 'tight',
        bgColorHex: '#000000',
        bgOpacityPct: 45,
        maxWidthPct: 80,
        lineHeightPct: 120,
        textAlign: 'center',
        animIn: 'fade',
        animOut: 'fade',
      },
    ],
    subtitles: [],
    canvasPresetId: '9:16',
    exportPresetId: '9:16',
  };

  const saved = await fetch(`${API}/api/video-projects/${id}/timeline`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ timelineJson: JSON.stringify(timeline), name }),
  });
  if (!saved.ok) throw new Error(`save timeline: ${saved.status} ${await saved.text()}`);

  return id;
}

/**
 * Satisfies `editorGateGuard` in the page currently loaded.
 *
 * Must run on a page of the app (so the origin matches) before navigating to
 * `/video-editor`, and it is cheap enough to repeat.
 */
export async function grantVault(page) {
  return page.evaluate(async () => {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getDirectoryHandle('shots-vault', { create: true });
    await new Promise((resolve, reject) => {
      const req = indexedDB.open('sma-vault', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('handles', { keyPath: 'key' });
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put({
          key: 'root',
          handle,
          rootId: 'shots-root',
          path: 'shots-vault',
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
    return handle.queryPermission ? handle.queryPermission({ mode: 'readwrite' }) : 'unknown';
  });
}
