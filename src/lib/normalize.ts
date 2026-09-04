/**
 * One normalizer, imported by both the index generator and the browser client.
 *
 * This is the whole reason the guide's search is hand-written rather than
 * delegated to an off-the-shelf indexer. A query and the text it is matched
 * against have to be folded *identically*; the moment the build and the browser
 * disagree by one rule, a word that is plainly on the page stops being findable
 * and nothing in the output says why. Sharing the function makes that class of
 * bug impossible rather than unlikely.
 *
 * Persian is a first-class locale here, and it needs four foldings that a Latin
 * normalizer does not do — the reasons are given at each one, because they are
 * not obvious and someone will otherwise "simplify" them away.
 */

/** Arabic letters that Persian keyboards and copy-paste produce interchangeably. */
const ARABIC_TO_PERSIAN: Record<string, string> = {
  'ك': 'ک', // ARABIC KAF  → PERSIAN KEHEH   ك → ک
  'ي': 'ی', // ARABIC YEH  → FARSI YEH       ي → ی
  'ى': 'ی', // ALEF MAKSURA → FARSI YEH      ى → ی
  'ة': 'ه', // TEH MARBUTA → HEH             ة → ه
  'ؤ': 'و', // WAW WITH HAMZA → WAW          ؤ → و
  'إ': 'ا', // ALEF WITH HAMZA BELOW → ALEF  إ → ا
  'أ': 'ا', // ALEF WITH HAMZA ABOVE → ALEF  أ → ا
  'آ': 'ا', // ALEF WITH MADDA → ALEF        آ → ا
};

/** Eastern Arabic and Persian digits, folded onto 0-9. */
const DIGITS: Record<string, string> = {};
for (let i = 0; i < 10; i++) {
  DIGITS[String.fromCharCode(0x0660 + i)] = String(i); // ٠-٩
  DIGITS[String.fromCharCode(0x06f0 + i)] = String(i); // ۰-۹
}

/** Harakat and the other combining marks; optional in writing, so never matched on. */
const DIACRITICS = /[ً-ْٰـ]/g; // fathatan…sukun, superscript alef, tatweel

/**
 * Fold a string to its searchable form.
 *
 * - lowercased, and stripped of Latin accents through NFD
 * - Arabic letter variants folded to their Persian equivalents, because a reader
 *   typing on an Arabic keyboard writes كتاب where the article says کتاب, and
 *   those are the same word
 * - harakat and tatweel removed: both are decorative, and no reader types them
 * - ZWNJ (U+200C) removed rather than replaced with a space. Persian compounds
 *   are written with it — می‌شود is one word — so turning it into a space would
 *   split a word the reader typed whole
 * - Persian and Arabic-Indic digits folded onto ASCII
 * - everything else that is not a letter, digit or ZWNJ becomes a space
 */
export function normalize(input: string): string {
  const folded = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Latin combining accents
    .replace(DIACRITICS, '')
    .replace(/‌/g, '')
    .replace(/[كيىةؤإأآ]/g, (c) => ARABIC_TO_PERSIAN[c])
    .replace(/[٠-٩۰-۹]/g, (c) => DIGITS[c]);

  // `\p{L}` keeps every script's letters — the guide is written in three.
  return folded.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/** Normalized, split on whitespace, empties dropped. */
export function tokenize(input: string): string[] {
  const n = normalize(input);
  return n ? n.split(' ') : [];
}
