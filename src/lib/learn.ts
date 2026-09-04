/**
 * Everything the guide's routes agree about: what exists, in what order, in
 * which languages, and what to do about the gaps.
 *
 * The one rule worth stating up front, because every function here follows from
 * it: **English is the reference edition.** A slug promised by the spine with no
 * English file is a broken build. The same slug missing in Persian is a gap —
 * reported, shown honestly to the reader, and never papered over by serving an
 * English article under a Persian URL. A reader who follows a Persian link and
 * lands on English has been lied to about what this site is; a reader who is
 * told "English only" before they click has not.
 */
import type { CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './direction';
import {
  ALL_SLUGS,
  ARTICLES,
  LIVE_SECTIONS,
  SECTION_COPY,
  SECTIONS,
  type Section,
  type Slug,
} from '../content/learn/spine';

export type Entry = CollectionEntry<'learn'>;

/** `en/start/what-diwche-does` → `start/what-diwche-does`. */
export function slugOf(id: string): Slug {
  return id.split('/').slice(1).join('/');
}

/** `en/start/what-diwche-does` → `en`. */
export function localeOfId(id: string): string {
  return id.split('/')[0];
}

export function sectionOf(slug: Slug): Section {
  return slug.split('/')[0] as Section;
}

/** Where an article lives, in a given language. English is at the root. */
export function hrefFor(locale: Locale, slug: Slug): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${prefix}/learn/${slug}/`;
}

export function sectionHref(locale: Locale, section: Section): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${prefix}/learn/${section}/`;
}

export function learnHome(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/learn/' : `/${locale}/learn/`;
}

/**
 * The build's integrity check.
 *
 * Thrown from inside `getStaticPaths`, which is what makes it fail `astro build`
 * rather than merely warn — the same mechanism `Art.astro` uses for an unknown
 * drawing. Two directions, both of which have bitten documentation sites before:
 * a slug in the table of contents with nothing behind it, and a file nobody can
 * navigate to because it was never added to the contents.
 */
export function assertSpine(entries: Entry[]): void {
  const have = new Set(entries.map((e) => e.id));

  const missing = ALL_SLUGS.filter((s) => !have.has(`${DEFAULT_LOCALE}/${s}`));
  if (missing.length) {
    throw new Error(
      `learn: ${missing.length} article(s) promised by spine.ts have no English file:\n` +
        missing.map((s) => `  src/content/learn/${DEFAULT_LOCALE}/${s}.mdx`).join('\n')
    );
  }

  const known = new Set<string>(ALL_SLUGS);
  const orphans = entries.filter((e) => !known.has(slugOf(e.id)));
  if (orphans.length) {
    throw new Error(
      `learn: ${orphans.length} file(s) are not listed in spine.ts, so nothing links to them:\n` +
        orphans.map((e) => `  src/content/learn/${e.id}.mdx`).join('\n')
    );
  }

  const badRelated = entries.flatMap((e) =>
    e.data.related.filter((r) => !known.has(r)).map((r) => `  ${e.id}.mdx → related: "${r}"`)
  );
  if (badRelated.length) {
    throw new Error(`learn: related: points at slug(s) that do not exist:\n${badRelated.join('\n')}`);
  }
}

/**
 * Print translation coverage, and optionally refuse to build without it.
 *
 * Lenient locally, strict in CI — the same shape as the screenshot pipeline's
 * `LEARN_STRICT_SHOTS`, so there is one idea to learn rather than two. Set
 * `LEARN_STRICT_LOCALES=fa` the day Persian is complete and it can never
 * silently regress.
 */
export function reportCoverage(entries: Entry[]): void {
  const total = ALL_SLUGS.length;
  const counts = Object.fromEntries(
    LOCALES.map((l) => [l, entries.filter((e) => localeOfId(e.id) === l).length])
  ) as Record<Locale, number>;

  console.log(
    `learn: ${LOCALES.map((l) => `${l} ${counts[l]}/${total}`).join(' · ')}`
  );

  const strict = (process.env.LEARN_STRICT_LOCALES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const l of strict) {
    if (!LOCALES.includes(l as Locale)) continue;
    if (counts[l as Locale] < total) {
      const have = new Set(entries.filter((e) => localeOfId(e.id) === l).map((e) => slugOf(e.id)));
      throw new Error(
        `learn: LEARN_STRICT_LOCALES names "${l}", which is missing ${total - counts[l as Locale]} article(s):\n` +
          ALL_SLUGS.filter((s) => !have.has(s))
            .map((s) => `  src/content/learn/${l}/${s}.mdx`)
            .join('\n')
      );
    }
  }
}

export interface NavArticle {
  slug: Slug;
  /** The title in this locale, or the English one when untranslated. */
  title: string;
  href: string;
  /** False when this article exists only in English. */
  translated: boolean;
}

export interface NavSection {
  section: Section;
  title: string;
  blurb: string;
  href: string;
  articles: NavArticle[];
}

/**
 * The sidebar, the section indexes and the prev/next chain, built once per page
 * from one pass over the collection.
 *
 * Untranslated articles stay in the list rather than vanishing from it. Hiding
 * them would make a Persian reader believe the guide is three articles long;
 * showing them marked "English only" tells the truth and still gets them to the
 * answer.
 */
export function buildNav(locale: Locale, entries: Entry[]): NavSection[] {
  const byId = new Map(entries.map((e) => [e.id, e]));

  return LIVE_SECTIONS.map((section) => {
    const copy = SECTION_COPY[locale][section];
    const articles = (ARTICLES[section] as readonly string[]).map((a) => {
      const slug = `${section}/${a}`;
      const local = byId.get(`${locale}/${slug}`);
      const english = byId.get(`${DEFAULT_LOCALE}/${slug}`);
      return {
        slug,
        title: (local ?? english)!.data.title,
        href: hrefFor(local ? locale : DEFAULT_LOCALE, slug),
        translated: Boolean(local),
      };
    });

    return { section, title: copy.title, blurb: copy.blurb, href: sectionHref(locale, section), articles };
  });
}

/**
 * The neighbours of an article, skipping anything not written in this language.
 *
 * Walking a Persian reader into an English page by pressing "next" is the same
 * lie the sidebar refuses to tell, so prev/next steps over the gaps instead.
 */
export function neighbours(locale: Locale, slug: Slug, entries: Entry[]) {
  const available = ALL_SLUGS.filter((s) => entries.some((e) => e.id === `${locale}/${s}`));
  const i = available.indexOf(slug);
  const at = (n: number) => {
    const s = available[n];
    if (!s) return null;
    const entry = entries.find((e) => e.id === `${locale}/${s}`)!;
    return { slug: s, title: entry.data.title, href: hrefFor(locale, s) };
  };
  return { prev: i > 0 ? at(i - 1) : null, next: i >= 0 ? at(i + 1) : null };
}

/** Which languages this exact article is written in — drives the language switch. */
export function localesFor(slug: Slug, entries: Entry[]): Locale[] {
  return LOCALES.filter((l) => entries.some((e) => e.id === `${l}/${slug}`));
}

export { ALL_SLUGS, ARTICLES, LIVE_SECTIONS, SECTIONS, SECTION_COPY };
export type { Section, Slug };
