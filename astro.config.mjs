// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Static output only — the build must drop into any file server.
// No adapter, no SSR, no external asset hosts (fonts are self-hosted from node_modules).
export default defineConfig({
  site: 'https://diwche.com',
  integrations: [mdx()],
  build: { format: 'directory' },
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
