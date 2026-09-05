// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Static output only — the build must drop into any file server.
// No adapter, no SSR, no external asset hosts (fonts are self-hosted from node_modules).
export default defineConfig({
  site: 'https://diwche.com',
  integrations: [
    mdx(),
    /*
     * The guide (/learn) is not in the nav any more; the sitemap is how search
     * engines keep finding its pages.
     *
     * Kept out: the pages that already say noindex (/read, /bio, /r, in every
     * language), the two post-action pages (/confirm, /consent) nobody should
     * land on from a search, and the DE/FA learn trees, which have no articles
     * yet and would only advertise empty section shells. No `i18n` option on
     * purpose: it would emit a blanket alternate per locale, which is exactly
     * what Base.astro's per-page hreflang avoids (see its `alternates` note).
     */
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        if (/^\/(?:(?:de|fa)\/)?(?:read|bio|r|confirm|consent)(?:\/|$)/.test(path)) return false;
        if (/^\/(?:de|fa)\/learn(?:\/|$)/.test(path)) return false;
        return true;
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
