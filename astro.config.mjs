// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Static output only — the build must drop into any file server.
// No adapter, no SSR, no external asset hosts (fonts are self-hosted from node_modules).
export default defineConfig({
  site: 'https://diwche.com',
  integrations: [mdx()],
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
