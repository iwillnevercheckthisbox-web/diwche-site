/**
 * Captures the app's own screens for the guide and the funnel.
 *
 * <h2>What it points at</h2>
 *
 * The e2e stack, never production. It is disposable, its data is invented, and
 * nothing in it belongs to a real person — the only way to satisfy DNA §8's rule
 * that a capture never shows a real handle, a real follower count or anybody's
 * actual posts. That rule is enforced here rather than trusted: the run aborts
 * unless the base URL is local.
 *
 *   cd frontend
 *   npm run e2e:build
 *   npm run e2e:backend                      # builds diwche-be:e2e-local
 *   BACKEND_IMAGE=diwche-be:e2e-local \
 *     docker compose -f e2e/docker-compose.e2e.yml up -d --wait --build
 *   psql postgres://sma:sma@localhost:5459/sma_e2e -f ../website/scripts/shots-seed.sql
 *
 * Note the explicit BACKEND_IMAGE: `npm run e2e:backend` tags `diwche-be:e2e-local`
 * but the compose file defaults to `sma-be:e2e-local`, so without it you run a
 * different image than the one you just built.
 *
 * Then, from website/:
 *
 *   npm run shoot                 # everything
 *   npm run shoot -- --list       # what would be captured, no browser
 *   npm run shoot -- --only ve-*  # a glob over shot names, or a section name
 *
 * <h2>Why the empty state is checked for</h2>
 *
 * A seeded stack is easy to get subtly wrong, and an unseeded page renders a
 * perfectly composed "Nothing to show yet" — which looks like a finished
 * screenshot and would go straight onto a public site. So every shot asserts
 * something that can only be on screen when the data is really there, and the
 * body text is checked for the empty-state wording on top of that.
 *
 * <h2>Output</h2>
 *
 * WebP, plus `public/shots/manifest.json` carrying each capture's intrinsic size
 * and description. `Shot.astro` reads that manifest, so an author writes a name
 * and gets a correctly-sized, described, framed screenshot with no layout shift.
 */
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { SHOTS } from './shots/manifest.mjs';
import { seedEditorProject, grantVault } from './shots/editor-fixture.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'public', 'shots');
const MANIFEST = join(OUT, 'manifest.json');
const BASE = process.env.SHOOT_BASE_URL || 'http://localhost:4300';

/** DNA §8: dark theme (the app's default), DPR 2, one curated demo account. */
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };

/**
 * The one mechanical guard on DNA §8.
 *
 * Everything else about "never publish a real handle" is a matter of pointing
 * the script at the right stack, and a tired evening is exactly when that goes
 * wrong. A production URL cannot be captured from at all.
 */
function assertLocal(url) {
  const { hostname } = new URL(url);
  const local =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost');
  if (!local) {
    console.error(
      `refusing to capture from ${url}\n` +
        'Captures come from the disposable e2e stack, never from an installation with ' +
        "real accounts in it. Bring the stack up and leave SHOOT_BASE_URL alone."
    );
    process.exit(2);
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** `ve-*` matches names, `studio` matches a section, bare text matches either. */
function selected(argv) {
  const i = argv.indexOf('--only');
  if (i === -1) return SHOTS;
  const pattern = argv[i + 1];
  if (!pattern) return SHOTS;
  const re = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  return SHOTS.filter((s) => re.test(s.name) || s.section === pattern);
}

/**
 * The step verbs.
 *
 * Deliberately few: anything a capture needs beyond opening a tab, a fold or a
 * dialog belongs in a fixture, not in a script that runs at shutter time. Every
 * selector is a `data-shot` attribute in the app — clicking by CSS class is how
 * a screenshot pipeline rots on the first refactor.
 */
/**
 * Finds an element by the words on it.
 *
 * Most controls worth photographing are identified in the guide by their label —
 * "▶ Export", "When to post" — and a CSS path to them is both unreadable in the
 * manifest and the first thing to break when the markup moves. Matching the text
 * says what the shot is actually about.
 */
async function byText(page, selector, text, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const handle = await page.evaluateHandle(
      (sel, want) => {
        /* Deepest match wins. With a broad selector the first hit is <html>,
           which "contains" every string on the page and scrolls nowhere useful. */
        let best = null;
        for (const el of document.querySelectorAll(sel)) {
          if (!(el.textContent || '').replace(/\s+/g, ' ').trim().includes(want)) continue;
          if (!best || best.contains(el)) best = el;
        }
        return best;
      },
      selector,
      text
    );
    const el = handle.asElement();
    if (el) return el;
    await handle.dispose();
    if (Date.now() > deadline) throw new Error(`no ${selector} containing “${text}”`);
    await wait(200);
  }
}

async function runStep(page, step) {
  if (step.waitFor) await page.waitForSelector(step.waitFor, { timeout: 20000 });
  if (step.click) {
    await page.waitForSelector(step.click, { timeout: 20000 });
    await page.click(step.click);
  }
  if (step.clickText) {
    const el = await byText(page, step.clickText.selector ?? 'button', step.clickText.text);
    await el.click();
  }
  if (step.select) {
    await page.waitForSelector(step.select.selector, { timeout: 20000 });
    await page.select(step.select.selector, step.select.value);
  }
  if (step.selectText) {
    // Angular's own option values look like "1: 1" — an index and a value glued
    // together — so they are not something a manifest should ever spell out.
    await page.waitForSelector(step.selectText.selector, { timeout: 20000 });
    const value = await page.evaluate(
      (sel, want) =>
        [...document.querySelectorAll(`${sel} option`)].find((o) =>
          (o.textContent || '').trim().includes(want)
        )?.value ?? null,
      step.selectText.selector,
      step.selectText.text
    );
    if (value == null) throw new Error(`no option named “${step.selectText.text}”`);
    await page.select(step.selectText.selector, value);
  }
  if (step.upload) {
    // A real file into a real <input type="file">, so the screen under the
    // shutter is the one a reader gets after choosing a picture — not a mock.
    const input = await page.waitForSelector(step.upload.selector, { timeout: 20000 });
    await input.uploadFile(join(HERE, 'shots', 'media', step.upload.file));
  }
  if (step.hover) await page.hover(step.hover);
  if (step.type) await page.type(step.type.selector, step.type.text, { delay: 12 });
  if (step.press) await page.keyboard.press(step.press);
  if (step.scroll) {
    const el = await page.$(step.scroll);
    if (!el) throw new Error(`scroll target ${step.scroll} is not on the page`);
    await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
  }
  if (step.scrollToText) {
    const el = await byText(page, step.scrollToText.selector ?? 'h2', step.scrollToText.text);
    await el.evaluate((n) => n.scrollIntoView({ block: 'start' }));
  }
  if (step.evaluate) await page.evaluate(step.evaluate);
  if (step.settle) await wait(step.settle);
}

/** Hidden, not removed: removing an element reflows the page under the shot. */
async function conceal(page, selectors, mode) {
  if (!selectors?.length) return;
  await page.evaluate(
    (sels, m) => {
      for (const sel of sels) {
        for (const el of document.querySelectorAll(sel)) {
          if (m === 'hide') el.style.visibility = 'hidden';
          else {
            el.style.filter = 'blur(10px)';
            el.style.pointerEvents = 'none';
          }
        }
      }
    },
    selectors,
    mode
  );
}

const EMPTY_STATE =
  /nothing to show yet|no accounts yet|nothing here yet|nothing yet for today|no records|nothing in your gallery/i;

/**
 * Editor shots share one seeded project.
 *
 * Seeded once per run rather than per shot: creating it uploads four files, and
 * the editor autosaves what it finds, so a fresh project per shot would be both
 * slow and — because each capture would then see a slightly different autosave
 * state — less reproducible, not more.
 */
let editorProjectId = null;

async function capture(page, shot) {
  let url = BASE + shot.path;

  if (shot.vault) {
    // The photo editor is behind the same media-folder gate as the timeline.
    await page.goto(BASE + '/accounts', { waitUntil: 'domcontentloaded' });
    await grantVault(page);
  }

  if (shot.project) {
    editorProjectId ??= await seedEditorProject();
    // The vault handle has to be written from the app's own origin, so this is a
    // visit to a cheap page first, not an extra navigation for its own sake.
    await page.goto(BASE + '/accounts', { waitUntil: 'domcontentloaded' });
    await grantVault(page);
    url = `${BASE}${shot.path}?videoProjectId=${editorProjectId}&videoProjectOrigin=server`;
  }

  await page.setViewport(shot.viewport ?? VIEWPORT);
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: shot.theme ?? 'dark' },
  ]);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

  /*
   * Wait for the app to exist before doing anything to it.
   *
   * Steps used to run the instant the document was parsed, which for an Angular
   * SPA is before a single component has rendered — so a step looking for a tab
   * or a fold reported it "not on the page" when it was simply not there yet.
   * The shell is the earliest honest signal that the router has drawn something.
   */
  await page.waitForSelector('main, .page, app-root > *', { timeout: 30000 });
  await wait(600);

  for (const step of shot.steps ?? []) await runStep(page, step);

  await page.waitForSelector(shot.ready, { timeout: 20000 });
  // Charts, filmstrips and reveals animate in; a capture mid-animation reads as a bug.
  await wait(shot.settle ?? 800);

  if (!shot.allowEmpty) {
    const empty = await page.evaluate((re) => new RegExp(re, 'i').test(document.body.innerText), EMPTY_STATE.source);
    if (empty) throw new Error('the page rendered its empty state — seed the stack first');
  }

  await conceal(page, shot.hide, 'hide');
  await conceal(page, shot.mask, 'mask');

  let target = page;
  if (shot.clip) {
    const el = await page.$(shot.clip.selector);
    if (!el) throw new Error(`clip target ${shot.clip.selector} is not on the page`);
    await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
    await wait(200);
    target = el;
  }

  const png = await target.screenshot({
    type: 'png',
    ...(shot.clip?.pad ? { captureBeyondViewport: false } : {}),
  });

  const image = sharp(png);
  const { width, height } = await image.metadata();
  await image.webp({ quality: 88 }).toFile(join(OUT, `${shot.name}.webp`));

  return {
    name: shot.name,
    // The intrinsic size is the *device* size divided by the DPR: what the
    // browser lays the image out at, which is what Screenshot.astro needs.
    width: Math.round(width / (shot.viewport ?? VIEWPORT).deviceScaleFactor),
    height: Math.round(height / (shot.viewport ?? VIEWPORT).deviceScaleFactor),
    alt: shot.alt,
    label: shot.label,
    section: shot.section,
    captured: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const shots = selected(argv);

  if (argv.includes('--list')) {
    for (const s of shots) console.log(`${s.section.padEnd(10)} ${s.name.padEnd(28)} ${s.path}`);
    console.log(`\n${shots.length} shot(s)`);
    return;
  }

  assertLocal(BASE);
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  // Merged, not replaced: `--only` must not delete the shots it did not take.
  const existing = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : [];
  const byName = new Map(existing.map((e) => [e.name, e]));

  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: VIEWPORT });
  const failures = [];

  /*
   * A fresh tab whenever the last one died.
   *
   * The app is a large SPA and a tab does occasionally go down mid-run — one
   * crash used to take every remaining shot with it ("Target closed", then
   * "detached Frame" twenty-six times), which turns one bad page into a run that
   * looks completely broken. Each shot now gets a live tab, and a crash costs
   * exactly the shot it happened on.
   */
  let page = await browser.newPage();
  const freshPage = async () => {
    try {
      if (!page.isClosed()) await page.close();
    } catch {
      /* Already gone. */
    }
    page = await browser.newPage();
  };

  for (const shot of shots) {
    try {
      if (page.isClosed()) await freshPage();
      byName.set(shot.name, await capture(page, shot));
      console.log(`shot ${shot.name}`);
    } catch (e) {
      const msg = e.message.split('\n')[0];
      failures.push(`${shot.name}: ${msg}`);
      // A dead tab poisons every later shot unless it is replaced now.
      if (/Target closed|detached Frame|Session closed|crashed/i.test(msg)) await freshPage();
    }
  }

  await browser.close();

  const manifest = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n${manifest.length} capture(s) in the manifest`);

  if (failures.length) {
    console.error('\nSome shots did not come out:');
    for (const f of failures) console.error('  - ' + f);
    console.error('\nArticles referencing those render a labelled placeholder and warn.');
    process.exitCode = 1;
  }
}

await main();
