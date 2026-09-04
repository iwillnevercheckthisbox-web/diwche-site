/**
 * Builds the search index from the same collection the pages are built from.
 *
 * Same call, same filter, same spine order — so the index cannot describe a set
 * of articles other than the one that shipped. An index built by a separate pass
 * over `dist/` can drift from the site by a draft flag or a locale rule, and the
 * failure is silent: search simply stops finding a page that is plainly there.
 */
import { getCollection } from 'astro:content';
import type { Locale } from './direction';
import { SECTIONS, SECTION_COPY, ARTICLES, type Section } from '../content/learn/spine';
import { normalize } from './normalize';
import { localeOfId, sectionOf, slugOf, hrefFor } from './learn';

export interface IndexEntry {
  /** `studio/change-a-transition` — the spine slug, not the URL. */
  s: string;
  /** Position in the spine, used only to break a scoring tie. */
  o: number;
  /** Href in this locale. */
  u: string;
  t: string;
  /** The one-sentence description, shown under the result. */
  d: string;
  /** Section title in this locale, for the group heading. */
  g: string;
  /** Normalized: title, description, keywords, headings, section, body. */
  n: { t: string; d: string; k: string; h: string; g: string; b: string };
}

/**
 * Strips MDX down to the words a reader can see.
 *
 * Deliberately blunt rather than a real parser: the cost of a stray bracket in
 * the index is one irrelevant token, and the cost of a parser is a dependency
 * plus a build step that can fail on syntax the site already renders fine.
 */
function plain(body: string): string {
  return body
    .replace(/^---[\s\S]*?^---/m, '') // frontmatter
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ') // JSX and HTML tags, attributes included
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images keep their text
    .replace(/[*_>#|-]+/g, ' ');
}

/** ATX headings only — the ones that become anchors. */
function headings(body: string): string {
  return (body.match(/^#{2,4} .+$/gm) ?? []).join(' ').replace(/^#+ /gm, '');
}

export async function buildIndex(locale: Locale): Promise<IndexEntry[]> {
  const all = await getCollection('learn', (e) => import.meta.env.DEV || !e.data.draft);

  // Spine order, so results group the way the sidebar reads.
  const order = new Map<string, number>();
  let i = 0;
  for (const section of SECTIONS) {
    for (const article of ARTICLES[section as Section]) order.set(`${section}/${article}`, i++);
  }

  return all
    .filter((e) => localeOfId(e.id) === locale)
    .sort((a, b) => (order.get(slugOf(a.id)) ?? 0) - (order.get(slugOf(b.id)) ?? 0))
    .map((e) => {
      const slug = slugOf(e.id);
      const section = sectionOf(slug) as Section;
      const sectionTitle = SECTION_COPY[locale][section].title;
      const body = plain(e.body ?? '');

      return {
        s: slug,
        o: order.get(slug) ?? 999,
        u: hrefFor(locale, slug),
        t: e.data.title,
        d: e.data.description,
        g: sectionTitle,
        n: {
          t: normalize(e.data.title),
          d: normalize(e.data.description),
          k: normalize(e.data.keywords.join(' ')),
          h: normalize(headings(e.body ?? '')),
          g: normalize(sectionTitle),
          // Capped: past a few thousand characters an article's own tail matches
          // everything, and the index doubles in size to make search worse.
          b: normalize(body).slice(0, 4000),
        },
      };
    });
}
