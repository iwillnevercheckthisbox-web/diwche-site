// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * `lastmod`, taken from the article that actually changed.
 *
 * (While the guide is parked — see the sitemap filter below — no /learn URL is
 * in the sitemap, so nothing here is used. It is left for the day it returns.)
 *
 * The sitemap shipped without one, so Google had no signal about which of the
 * ninety-odd URLs was worth recrawling. The tempting fix is to stamp the build
 * date on every entry — but a sitemap where all pages changed at the same second
 * every deploy is a lie Google learns to ignore, and once it ignores lastmod here
 * it ignores it for the pages where it is true.
 *
 * So: every guide article already carries a real `updated` in its frontmatter
 * (required by the collection schema), and that is the date used. A section index
 * gets the newest date among its own articles, which is exactly when that list
 * last changed. Everything else — the homepages, the legal pages — gets no
 * lastmod at all, because nothing here knows when they changed and omitting the
 * field is the honest answer.
 *
 * Read off disk with a frontmatter regex rather than through `astro:content`,
 * which is not available to a config file. The schema guarantees the field
 * exists, so a miss here is a real problem and is left to fail loudly at build.
 */
const LEARN_DIR = 'src/content/learn';

function articleDates() {
  /** @type {Map<string, string>} url path → YYYY-MM-DD */
  const dates = new Map();
  /** @type {Map<string, string>} section url → the newest date under it */
  const sections = new Map();

  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) {
        walk(full);
        continue;
      }
      if (!item.name.endsWith('.mdx')) continue;

      const updated = /^updated:\s*(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(full, 'utf8'))?.[1];
      if (!updated) continue;

      // `src/content/learn/en/start/make-your-first-post.mdx` → en, start/make-…
      const rel = full.slice(LEARN_DIR.length + 1).replace(/\.mdx$/, '');
      const [locale, ...rest] = rel.split('/');
      const prefix = locale === 'en' ? '' : `/${locale}`;
      const slug = rest.join('/');

      dates.set(`${prefix}/learn/${slug}/`, updated);

      const sectionUrl = `${prefix}/learn/${rest[0]}/`;
      const seen = sections.get(sectionUrl);
      if (!seen || updated > seen) sections.set(sectionUrl, updated);
    }
  };

  walk(LEARN_DIR);

  for (const [url, date] of sections) if (!dates.has(url)) dates.set(url, date);
  return dates;
}

const LASTMOD = articleDates();

// Static output only — the build must drop into any file server.
// No adapter, no SSR, no external asset hosts (fonts are self-hosted from node_modules).
export default defineConfig({
  site: 'https://diwche.com',
  integrations: [
    mdx(),
    /*
     * Kept out: the pages that already say noindex (/read, /bio, /r, in every
     * language), the two post-action pages (/confirm, /consent) nobody should
     * land on from a search, and the guide (/learn), in every language.
     *
     * The guide is off the site (#379). Its routes are parked in `_learn`
     * folders under src/pages, src/pages/fa and src/pages/de — the underscore
     * is what keeps Astro from building them — and its articles stay in
     * src/content/learn. So nothing under /learn is built today and this line
     * changes no output; it is here so that un-parking the routes cannot
     * quietly re-advertise the guide before somebody decides it should be.
     *
     * No `i18n` option on purpose: it would emit a blanket alternate per
     * locale, which is exactly what Base.astro's per-page hreflang avoids (see
     * its `alternates` note).
     */
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        if (/^\/(?:(?:de|fa)\/)?(?:read|bio|r|confirm|consent)(?:\/|$)/.test(path)) return false;
        if (/^\/(?:(?:de|fa)\/)?learn(?:\/|-index\.|$)/.test(path)) return false;
        return true;
      },
      // No lastmod is better than a wrong one — see articleDates() above.
      serialize: (item) => {
        const date = LASTMOD.get(new URL(item.url).pathname);
        return date ? { ...item, lastmod: date } : item;
      },
    }),
  ],
  build: { format: 'directory' },

  markdown: {
    /*
     * Both themes are emitted at once as CSS variables, and neither is the
     * default — `learn.css` picks one from `[data-theme='light']`. Shiki's own
     * dual-theme switch keys on `prefers-color-scheme`, which is wrong here:
     * this site's theme is an attribute stamped before first paint, and a
     * reader who chose light on a dark OS would get light prose around dark
     * code.
     */
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: false,
    },
  },
  devToolbar: { enabled: false },

  vite: {
    server: {
      // Dev only, and it never reaches the build. In production the site's own
      // nginx proxies this same prefix to the backend, which is what keeps the
      // call same-origin and the browser tokenless — see nginx.conf.
      // `npm run dev` starts the fixture server alongside; point this at the
      // real backend instead when you want to test against it.
      proxy: {
        '/api/public': {
          target: process.env.PUBLIC_API_ORIGIN ?? 'http://localhost:8788',
          changeOrigin: true,
        },
      },
    },
  },
});
