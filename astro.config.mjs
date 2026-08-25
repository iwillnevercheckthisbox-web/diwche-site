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
});
