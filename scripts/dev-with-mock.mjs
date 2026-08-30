/**
 * `npm run dev` — the fixture server and Astro together, so a fresh clone can
 * drive the whole show without a backend.
 *
 * Set PUBLIC_API_ORIGIN to point the dev proxy at a real backend instead; the
 * fixture server is skipped when you do.
 */
import { spawn } from 'node:child_process';

const useMock = !process.env.PUBLIC_API_ORIGIN;
const children = [];

if (useMock) {
  children.push(spawn('node', ['mock/server.mjs'], { stdio: 'inherit' }));
} else {
  console.log(`[dev] /api/public → ${process.env.PUBLIC_API_ORIGIN} (fixture server off)`);
}

// The read is off by default in a build (there is no backend behind it yet);
// in dev there is always something behind it, so it is on.
children.push(
  spawn('npx', ['astro', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PUBLIC_READ: process.env.PUBLIC_READ ?? 'on' },
  })
);

const stop = () => {
  for (const c of children) c.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const c of children) c.on('exit', stop);
