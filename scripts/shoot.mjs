/**
 * Captures the app's own screens for the funnel.
 *
 * `package.json` has declared `npm run shoot` since the funnel shipped and this
 * file has never existed, so every insight screen has been showing a drawn
 * placeholder. These are the real thing.
 *
 * <h2>What it points at</h2>
 *
 * The e2e stack, not production. It is disposable, its data is invented, and
 * nothing in it belongs to a real person — which is the only way to satisfy
 * DNA §8's rule that a capture never shows a real handle, a real follower count
 * or anybody's actual posts. Bring it up first:
 *
 *   cd frontend
 *   npm run e2e:build
 *   BACKEND_IMAGE=<an image> docker compose -f e2e/docker-compose.e2e.yml up -d --wait
 *   psql ... < scripts/shots-seed.sql
 *
 * Then, from website/:  npm run shoot
 *
 * <h2>Why the empty state is checked for</h2>
 *
 * The seeded stack is easy to get subtly wrong, and an unseeded page renders a
 * perfectly composed "Nothing to show yet" — which looks like a finished
 * screenshot and would go straight onto the marketing site. So each shot
 * asserts something that can only be there when the data is.
 */
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'public', 'shots');
const BASE = process.env.SHOOT_BASE_URL || 'http://localhost:4300';
const ACCOUNT = process.env.SHOOT_ACCOUNT_ID || '1';

/** DNA §8: dark theme, DPR 2, one curated demo account. */
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };

const SHOTS = [
  {
    name: 'ideas',
    path: `/ideas?accountId=${ACCOUNT}`,
    /* The topic cards only exist when brain_topics has rows for today. */
    ready: 'app-today-feed h3, .idea h3',
    settle: 1200,
  },
  {
    name: 'performance',
    path: '/performance',
    ready: 'chart-line svg, chart-bars svg',
    settle: 2000,
  },
  {
    name: 'activity',
    path: '/activity',
    ready: 'table tbody tr',
    settle: 1000,
  },
  {
    name: 'replies',
    path: '/notifications',
    ready: 'h1',
    settle: 800,
    /* Not yet a screen with rows of its own — captured for the chrome, and
       flagged so nobody assumes it shows a real conversation. */
    thin: true,
  },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: VIEWPORT });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

  const failures = [];

  for (const shot of SHOTS) {
    const url = BASE + shot.path;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector(shot.ready, { timeout: 15000 });
      // Charts animate in, and a capture mid-animation looks like a bug.
      await wait(shot.settle);

      const empty = await page.evaluate(() =>
        /nothing to show yet|no accounts yet|nothing here yet/i.test(document.body.innerText)
      );
      if (empty && !shot.thin) {
        failures.push(`${shot.name}: the page rendered its empty state — seed the stack first`);
        continue;
      }

      const file = join(OUT, `${shot.name}.png`);
      await page.screenshot({ path: file });
      console.log(`shot ${shot.name}${shot.thin ? ' (chrome only)' : ''}`);
    } catch (e) {
      failures.push(`${shot.name}: ${e.message.split('\n')[0]}`);
    }
  }

  await browser.close();

  if (failures.length) {
    console.error('\nSome shots did not come out:');
    for (const f of failures) console.error('  - ' + f);
    console.error(
      '\nThe placeholders are still in place for those, so the site keeps building.'
    );
    process.exitCode = 1;
  }
}

await main();
