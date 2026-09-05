/*
 * Builds the social card, one per language, into public/brand/og-<locale>.png.
 *
 * Why this exists: Base.astro has declared `twitter:card = summary_large_image`
 * since the site launched and never emitted an `og:image` to go with it, so
 * every share of every page — on WhatsApp, Telegram, X, LinkedIn, Slack — has
 * rendered as a bare grey text row. The card is the single highest-leverage
 * image on the site: it is the only one most people see before deciding whether
 * to click.
 *
 * One per language, not one for the site, for the same reason `dirFor()` exists:
 * a Persian reader sharing the Persian homepage should not hand their followers
 * an English card set left-to-right.
 *
 * Rendered rather than drawn so it cannot drift from the brand — it pulls the
 * real tokens out of src/styles/tokens.css and the real fonts out of
 * node_modules, exactly as the pages do. Change a token and rebuild, and the
 * card follows.
 *
 * Run: npm run og:build   (after changing tokens, the wordmark, or the taglines)
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(root, 'public', 'brand');

/* 1200×630 is what every platform crops from. Smaller gets upscaled and shows it. */
const W = 1200;
const H = 630;

/*
 * The line on the card.
 *
 * Deliberately NOT the meta description: that one is written to survive being
 * cut at 160 characters in a result list, and it reads as a paragraph. A card is
 * looked at, not read, so this is the shortest true sentence in each language.
 */
const CARDS = {
  en: { dir: 'ltr', tag: 'A manager for one Instagram account. Yours.', foot: 'diwche.com' },
  fa: { dir: 'rtl', tag: 'یک مدیر برای پیج اینستاگرامت.', foot: 'diwche.com' },
  de: { dir: 'ltr', tag: 'Ein Manager für einen Instagram-Account. Deinen.', foot: 'diwche.com' },
};

/** The dark palette, read from the stylesheet rather than copied out of it. */
async function tokens() {
  const css = await readFile(join(root, 'src', 'styles', 'tokens.css'), 'utf8');
  const pick = (name) => {
    const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`).exec(css);
    if (!m) throw new Error(`build-og: --${name} is not in tokens.css`);
    return m[1]; // The first hit is the dark palette, which is the site's identity.
  };
  return {
    paper: pick('paper'),
    paper2: pick('paper-2'),
    ink: pick('ink'),
    ink2: pick('ink-2'),
    horn: pick('horn'),
    rule: pick('rule'),
  };
}

/** A font file as a data: URI, so the page needs no network and no server. */
async function font(rel) {
  const buf = await readFile(join(root, 'node_modules', rel));
  return `data:font/woff2;base64,${buf.toString('base64')}`;
}

const t = await tokens();
const [fraunces, geist, vazir, horns] = await Promise.all([
  font('@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2'),
  font('@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'),
  font('@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2'),
  readFile(join(root, 'public', 'brand', 'horns.png')).then(
    (b) => `data:image/png;base64,${b.toString('base64')}`
  ),
]);

const html = (locale) => {
  const c = CARDS[locale];
  const rtl = c.dir === 'rtl';
  return `<!doctype html><html dir="${c.dir}"><head><meta charset="utf-8"><style>
    @font-face { font-family: 'Fraunces'; src: url('${fraunces}') format('woff2'); font-weight: 100 900; }
    @font-face { font-family: 'Geist'; src: url('${geist}') format('woff2'); font-weight: 100 900; }
    @font-face { font-family: 'Vazirmatn'; src: url('${vazir}') format('woff2'); font-weight: 100 900; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${W}px; height: ${H}px; background: ${t.paper};
      /* The champagne accent, bled from the corner the text starts at. */
      background-image: radial-gradient(120% 90% at ${rtl ? '100%' : '0%'} 0%, ${t.paper2} 0%, ${t.paper} 62%);
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 88px 96px; color: ${t.ink};
      font-family: ${rtl ? "'Vazirmatn'" : "'Geist'"}, sans-serif;
    }
    .mark { display: flex; align-items: center; gap: 22px; }
    .mark img { width: 74px; height: 74px; }
    .word {
      font-family: 'Fraunces', Georgia, serif;
      font-variation-settings: 'SOFT' 40, 'WONK' 1, 'opsz' 120;
      font-size: 58px; font-weight: 600; letter-spacing: -0.02em; color: ${t.ink};
    }
    .tag {
      font-family: ${rtl ? "'Vazirmatn'" : "'Fraunces', Georgia, serif"};
      ${rtl ? '' : "font-variation-settings: 'SOFT' 40, 'WONK' 1, 'opsz' 120;"}
      font-size: ${rtl ? 68 : 76}px; font-weight: ${rtl ? 700 : 600};
      line-height: 1.16; letter-spacing: -0.025em;
      max-width: 22ch; text-wrap: balance;
    }
    .foot {
      display: flex; align-items: center; gap: 18px;
      font-size: 28px; font-weight: 500; color: ${t.ink2}; letter-spacing: 0.01em;
      /* Latin, always — the domain is not translated, and the Arabic subset of
         Vazirmatn has no Latin glyphs to set it with. */
      font-family: 'Geist', sans-serif; direction: ltr;
      /* align-self did nothing here — the parent is a block, not a flex row —
         so the domain sat against the left edge of a right-aligned card. The
         group is pushed to the reading edge instead, while the domain itself
         stays ltr because it is not translated. */
      justify-content: ${rtl ? 'flex-end' : 'flex-start'};
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: ${t.horn}; }
    .rule { height: 1px; background: ${t.rule}; margin-block: 40px; }
  </style></head><body>
    <div class="mark"><img src="${horns}" alt=""><span class="word">Diwche</span></div>
    <div><h1 class="tag">${c.tag}</h1><div class="rule"></div>
      <div class="foot"><span class="dot"></span><span>${c.foot}</span></div></div>
  </body></html>`;
};

await mkdir(OUT_DIR, { recursive: true });
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

for (const locale of Object.keys(CARDS)) {
  await page.setContent(html(locale), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = join(OUT_DIR, `og-${locale}.png`);
  await writeFile(out, await page.screenshot({ type: 'png' }));
  console.log(`og: ${locale} → public/brand/og-${locale}.png`);
}

await browser.close();
