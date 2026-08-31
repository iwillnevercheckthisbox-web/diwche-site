/**
 * Text direction, resolved in one place.
 *
 * The site's twin of `frontend/src/app/core/language-direction.ts`, which is
 * itself the twin of the backend's `com.sma.generation.LanguageDirection`. The
 * rule all three exist to enforce: **direction follows the content language,
 * and is never hardcoded at a component.** Every rendering template in this
 * product was once authored for Persian with `dir="rtl"` baked in, which
 * silently right-aligned English too — this is the fix, kept identical across
 * the three codebases so nobody has to remember which one is authoritative.
 *
 * Note what this deliberately does *not* do: mirror layout. A correct `dir`
 * plus logical CSS properties gives correct alignment on its own, because
 * `text-align` already defaults to the start edge. Flipping physical insets by
 * hand is how you end up with text under the buttons.
 */

/** The languages this site is published in. */
export const LOCALES = ['en', 'fa'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Languages written right to left. Kept as a set so adding one is one edit. */
const RTL = new Set(['fa', 'ar', 'he', 'ur', 'ps', 'ckb']);

export function isRtl(locale: string): boolean {
  return RTL.has(base(locale));
}

export function dirFor(locale: string): 'rtl' | 'ltr' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

/** `fa-IR` and `FA` are both Persian. */
function base(locale: string | null | undefined): string {
  return (locale ?? '').trim().toLowerCase().split(/[-_]/)[0];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(base(value));
}

/**
 * Where the same page lives in the other language.
 *
 * English is at the root and every other language is under its own prefix, so
 * `/read` and `/fa/read` are the same screen. Kept here rather than in a layout
 * so the switcher and the routes cannot disagree about the shape of a URL.
 */
export function pathIn(locale: Locale, path: string): string {
  const bare = path.replace(/^\/(fa)(?=\/|$)/, '') || '/';
  if (locale === DEFAULT_LOCALE) return bare;
  return `/${locale}${bare === '/' ? '' : bare}`;
}

/** The locale a path is in, from the path alone. */
export function localeOf(path: string): Locale {
  return /^\/fa(\/|$)/.test(path) ? 'fa' : DEFAULT_LOCALE;
}

/** What the other language calls itself, for the switch. */
export const ENDONYM: Record<Locale, string> = {
  en: 'English',
  fa: 'فارسی',
};
