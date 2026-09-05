/**
 * The site's structured data, in one place.
 *
 * Every page carried a title, a description and a canonical since launch, and
 * nothing else: no `og:image`, so every share anywhere has been a bare text
 * card, and no JSON-LD at all, so the only machine-readable statement of what
 * Diwche *is* was the prose. This is that statement.
 *
 * Two rules hold everything here together:
 *
 * 1. **Only claim what the site says out loud.** Schema that disagrees with the
 *    page is worse than no schema — Google treats the mismatch as a reason to
 *    distrust the rest. There is no `sameAs` because the site publishes no
 *    social profile, no `aggregateRating` because nothing on the site rates
 *    anything, and no `price` because the pricing is not public. Add each the
 *    day the page it describes ships, not before.
 * 2. **Direction and language come from the locale**, the same way `dirFor()`
 *    resolves text direction — never hardcoded per page. See ./direction.ts.
 */
import { DEFAULT_LOCALE, LOCALES, pathIn, type Locale } from './direction';

export const SITE_NAME = 'Diwche';
export const SITE_URL = 'https://diwche.com';
export const SUPPORT_EMAIL = 'support@diwche.com';

/**
 * The card a page shares as when it names no image of its own.
 *
 * Built by `npm run og:build` into `public/brand/`, one per language, because a
 * Persian reader sharing the Persian page should not get an English card. 1200×630
 * is the size every platform crops from; anything smaller gets upscaled and looks it.
 */
export function ogImageFor(locale: Locale): string {
  return `/brand/og-${locale}.png`;
}

/** Open Graph wants underscored tags, not the BCP-47 ones `lang` uses. */
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  fa: 'fa_IR',
  de: 'de_DE',
};

/** An absolute URL, which every `@id` and `url` in a JSON-LD graph has to be. */
export function abs(path: string): string {
  return new URL(path, SITE_URL).href;
}

/**
 * The same page in every language, for the pages that exist in all of them.
 *
 * Base.astro takes alternates explicitly rather than assuming, because the guide
 * is translated article by article and a blanket alternate there would advertise
 * 404s. The marketing and legal pages are the opposite case — they ship in all
 * three at once — and they were passing nothing at all, so `/`, `/fa/` and `/de/`
 * never told Google they were the same page in three languages. Three unrelated
 * pages competing with each other is the worst reading of that, and for a site
 * whose whole search case is Persian it is the expensive one.
 *
 * Uses `pathIn()`, so the switcher, the routes and the alternates cannot disagree
 * about the shape of a URL.
 */
export function allLocaleAlternates(pathname: string): { locale: Locale; href: string }[] {
  return LOCALES.map((locale) => ({ locale, href: slash(pathIn(locale, pathname)) }));
}

/**
 * The trailing slash `build.format: 'directory'` gives every real URL.
 *
 * `pathIn('fa', '/')` returns `/fa`, which is where the language switcher points
 * and which the server happily redirects. An hreflang is not a link, though: it
 * has to name the *canonical* URL exactly, and `/fa` against a canonical of
 * `/fa/` is a mismatch Google resolves by discounting the annotation — so the
 * three homepages would have gone on looking like three unrelated pages, which
 * is the whole thing this was added to fix.
 */
function slash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * A meta description that fits, cut where a sentence ends.
 *
 * The legal pages reuse their visible lead as the description, and in German
 * that lead runs to 190 characters — so the search result was cut mid-clause at
 * roughly 160, which reads as a broken page. Rewriting the lead was the wrong
 * fix: it is prose a reader sees, on a page whose whole job is to be read.
 *
 * So the page keeps its lead and the *meta tag* gets a version that ends on
 * purpose. Sentence-aware rather than a hard slice, and it falls back to a word
 * boundary when the first sentence is itself too long. Anything already short
 * enough is returned untouched, which is every English and Persian legal page
 * today — this only ever engages where it is needed.
 */
export function metaDescription(text: string, max = 160): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;

  // `؟` and `۔` are here because Persian is a first-class language on this site,
  // not because they appear in today's copy.
  const ends = [...clean.slice(0, max + 1).matchAll(/[.!?؟۔](?=\s|$)/g)];
  const lastEnd = ends.at(-1)?.index;
  if (lastEnd !== undefined && lastEnd >= max * 0.5) return clean.slice(0, lastEnd + 1);

  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).trimEnd()}…`;
}

type Node = Record<string, unknown>;

/**
 * Who publishes this site.
 *
 * Given a stable `@id` so every other node on every other page can point at
 * this one instead of restating it — that is what turns a pile of per-page
 * snippets into one entity Google can hold a fact about.
 */
export function organization(): Node {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    email: SUPPORT_EMAIL,
    logo: {
      '@type': 'ImageObject',
      url: abs('/brand/horns.png'),
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_EMAIL,
      availableLanguage: ['en', 'fa', 'de'],
    },
  };
}

/** The site itself, in the language of the page asking. */
export function website(locale: Locale): Node {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/**
 * The product, for the three homepages.
 *
 * `offers` is deliberately absent: the site does not publish a price, and a
 * `price: 0` would be a lie that shows up in the result as "Free".
 */
export function softwareApplication(locale: Locale, name: string, description: string): Node {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: SITE_NAME,
    alternateName: name,
    description,
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Social Media Management',
    operatingSystem: 'Web',
    inLanguage: locale,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/**
 * A guide article.
 *
 * `TechArticle` rather than `Article` because these are instructions for
 * operating software, which is the type's whole purpose — and it is the one
 * Google will show a "how to" treatment for.
 */
export function techArticle(
  locale: Locale,
  { url, title, description, section }: { url: string; title: string; description: string; section?: string }
): Node {
  return {
    '@type': 'TechArticle',
    '@id': `${abs(url)}#article`,
    headline: title,
    description,
    url: abs(url),
    inLanguage: locale,
    ...(section ? { articleSection: section } : {}),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    about: { '@id': `${SITE_URL}/#software` },
  };
}

/**
 * The trail above a page, which is what Google renders instead of a raw URL.
 *
 * Takes the crumbs already drawn on the page — passing a trail the reader
 * cannot see is the exact mismatch rule 1 forbids.
 */
export function breadcrumbs(items: { name: string; url: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}

/**
 * Wrap the page's nodes into the single `@graph` that goes in the document.
 *
 * One script tag holding a graph, not five tags holding five objects: the graph
 * is what lets `@id` references resolve, and it is what Google's own docs ask
 * for when a page describes more than one thing.
 */
export function graph(locale: Locale = DEFAULT_LOCALE, nodes: Node[] = []): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [organization(), website(locale), ...nodes],
  });
}
