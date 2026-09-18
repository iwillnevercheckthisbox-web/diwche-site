/**
 * The one sentence shown beside Cloudflare's proof-of-human widget.
 *
 * It lives here rather than in the funnel's copy files because the widget is shared: the funnel
 * and the consent page both mint tokens, and the consent page has none of the funnel's words.
 * The layouts put it on `<html>` and `scripts/turnstile.ts` reads it from there — the same route
 * the site key already travels.
 *
 * Without it the widget appeared as an unexplained Cloudflare box floating over the page, which
 * is half of what Trello #379 reported about it.
 */
import type { Locale } from './direction';

const LABELS: Record<Locale, string> = {
  en: 'One quick check that you are a person, then he carries on.',
  de: 'Kurz bestätigen, dass du ein Mensch bist — dann geht es weiter.',
  fa: 'فقط یک بررسی کوتاه که آدم هستی، بعد ادامه می‌دهد.',
};

export function humanCheckLabel(locale: Locale): string {
  return LABELS[locale] ?? LABELS.en;
}
