/**
 * The guide's content collection — the site's first one.
 *
 * It lives at `src/content.config.ts` rather than the repo root on purpose: the
 * Dockerfile copies only `astro.config.mjs`, `src/` and `public/`, so anything
 * the build reads has to be under one of those. A root-level config would build
 * on a laptop and produce an empty guide in the image.
 *
 * Files are `.mdx`, never `.md`. `.dockerignore` carries `*.md`; Docker's
 * matcher does not cross `/` on a single `*`, so a nested `.md` would probably
 * survive — but "probably" is not a thing to build a documentation section on.
 * `assertSpine()` in `lib/learn.ts` is the backstop either way: if MDX ever
 * stops reaching the image the build goes red instead of shipping a shell.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const learn = defineCollection({
  loader: glob({
    base: './src/content/learn',
    pattern: '**/*.mdx',
    /* `en/start/what-diwche-does` — locale first, then section, then article.
       The default generator slugifies and would flatten the shape we route on. */
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),

  schema: z.object({
    title: z.string().min(3).max(70),

    /**
     * One sentence. It is the meta description, the card subtitle and the line
     * under a search result — the same string in all three, so they cannot
     * drift into disagreeing about what the article is.
     */
    description: z.string().min(20).max(180),

    updated: z.date(),

    /** Hidden from the build; still visible in `astro dev`. */
    draft: z.boolean().default(false),

    /**
     * Words a reader would plausibly type that the prose does not contain —
     * "swipe post" for a carousel, "crop" for the safe-area overlay. Search
     * only; never rendered, so it can be blunt.
     */
    keywords: z.array(z.string()).default([]),

    /** Slugs, checked against the spine by `assertSpine()` rather than here. */
    related: z.array(z.string()).max(4).default([]),

    /** Capture names from `public/shots/manifest.json`. */
    shots: z.array(z.string()).default([]),

    /** The app route this article documents, e.g. `/d1`. Drives "open it in Diwche". */
    appPath: z.string().startsWith('/').optional(),

    toc: z.boolean().default(true),
  }),
});

export const collections = { learn };
