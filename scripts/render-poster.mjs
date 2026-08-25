/*
 * Renders a still poster from the FIRST FRAME OF THE ANIMATION ITSELF.
 *
 * Why this exists: mascot/dist/fallback/01-writing-poster.webp is the flat desk
 * panel — bookshelf, papers, the lot. But the layered Lottie is a transparent
 * cutout of Diwche and his thought bubble with no background at all (see
 * mascot/rig/01-writing.rig.json: "A transparent cutout ... no background").
 *
 * Two different compositions. Using one as the poster for the other means the
 * page visibly swaps pictures the moment the player finishes loading, and the
 * reduced-motion still shows something the animation never shows.
 *
 * So: load the real Lottie, freeze frame 0, screenshot it with a transparent
 * background. The poster and the first frame are then the same image by
 * construction, and no crossfade is visible at all.
 *
 * Run after `npm run mascot:sync`.
 */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pub = join(root, 'public');

const SCENE = '01-writing';
const SLUG = 'writing';
const OUT = join(pub, 'mascot', 'fallback', `${SCENE}-cutout.webp`);

const TYPES = {
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.js': 'text/javascript',
  '.html': 'text/html',
};

// Serve public/ plus the vendored player straight from node_modules.
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const file =
      url.pathname === '/player.js'
        ? join(root, 'node_modules', 'lottie-web', 'build', 'player', 'lottie_light.min.js')
        : join(pub, url.pathname);
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
      // setContent leaves the page on an opaque origin, so the player's XHR for
      // the scene JSON is cross-origin and fails without this.
      'access-control-allow-origin': '*',
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Render at 2x the composition so the still is crisp on retina.
const W = 725;
const H = 613;
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });

await page.setContent(`<!doctype html>
  <style>html,body{margin:0;background:transparent}#s{width:${W}px;height:${H}px}</style>
  <div id="s"></div>
  <script src="http://localhost:${port}/player.js"></script>`);

await page.evaluate(
  async (scene, slug, port) => {
    const anim = window.lottie.loadAnimation({
      container: document.getElementById('s'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: `http://localhost:${port}/mascot/lottie/${scene}.json`,
      assetsPath: `http://localhost:${port}/mascot/assets/${slug}/`,
      // Not progressive: we need every layer painted before the screenshot.
      rendererSettings: { progressiveLoad: false, preserveAspectRatio: 'xMidYMid meet' },
    });

    await new Promise((resolve, reject) => {
      anim.addEventListener('data_failed', () => reject(new Error('layer data failed')));
      anim.addEventListener('DOMLoaded', resolve);
    });

    anim.goToAndStop(0, true);
    // Let the browser decode the layer images before we capture.
    await new Promise((r) => setTimeout(r, 600));
  },
  SCENE,
  SLUG,
  port
);

const shot = await page.screenshot({ type: 'webp', quality: 92, omitBackground: true });
await writeFile(OUT, shot);

await browser.close();
server.close();

console.log(`poster: ${OUT.replace(root + '/', '')} — ${W}x${H}@2x, ${(shot.length / 1024).toFixed(0)} KB`);
