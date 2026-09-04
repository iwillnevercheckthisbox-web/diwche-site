/**
 * One `getStaticPaths` factory, used by all nine route files.
 *
 * The site duplicates every page per locale (`privacy.astro`, `fa/privacy.astro`,
 * `de/privacy.astro`) rather than routing on a `[locale]` segment, and the guide
 * keeps that. A single dynamic locale segment would save six tiny files and cost
 * the ability to `grep src/pages/fa` and see exactly what Persian ships — a trade
 * this repo has already made eighteen times.
 *
 * What the files must not duplicate is the logic, so it lives here and each page
 * is `export const getStaticPaths = articlePaths('fa')`. Astro only requires the
 * export to be a function; where it was defined is not its business.
 */
import { getCollection } from 'astro:content';
import type { Locale } from './direction';
import {
  assertSpine,
  buildNav,
  localesFor,
  neighbours,
  reportCoverage,
  sectionOf,
  slugOf,
  type Entry,
} from './learn';
import { LIVE_SECTIONS, SECTION_COPY } from '../content/learn/spine';

/**
 * Drafts are visible while writing and absent from a build.
 *
 * Checked once here rather than at every call site, because a draft that leaks
 * into `dist/` is indistinguishable from a finished article to everyone except
 * the person who wrote it.
 */
async function load(): Promise<Entry[]> {
  const all = await getCollection('learn', (e) => !e.data.draft || import.meta.env.DEV);
  assertSpine(all);
  reportCoverage(all);
  return all;
}

/** `/learn/<section>/<article>/` */
export function articlePaths(locale: Locale) {
  return async function getStaticPaths() {
    const all = await load();
    const nav = buildNav(locale, all);

    return all
      .filter((e) => e.id.startsWith(`${locale}/`))
      .map((entry) => {
        const slug = slugOf(entry.id);
        const [section, article] = slug.split('/');
        return {
          params: { section, article },
          props: {
            entry,
            locale,
            nav,
            slug,
            ...neighbours(locale, slug, all),
            available: localesFor(slug, all),
          },
        };
      });
  };
}

/** `/learn/<section>/` */
export function sectionPaths(locale: Locale) {
  return async function getStaticPaths() {
    const all = await load();
    const nav = buildNav(locale, all);

    return LIVE_SECTIONS.map((section) => ({
      params: { section },
      props: {
        locale,
        nav,
        section,
        entries: all,
        copy: SECTION_COPY[locale][section],
        articles: nav.find((n) => n.section === section)!.articles,
      },
    }));
  };
}

/** Everything, for the landing page and for `/learn/all/`. */
export async function learnIndex(locale: Locale) {
  const all = await load();
  return { all, nav: buildNav(locale, all) };
}

export { sectionOf };
