/**
 * The guide's furniture, in each language.
 *
 * Typed as `Record<Locale, …>` for the reason `home.ts` gives: a missing German
 * string here is a compile error rather than an English word sitting in the
 * middle of a German page. This is the part of the guide that must never have a
 * gap, because it is what a reader meets before they have chosen anything.
 */
import type { Locale } from '../../lib/direction';

export interface LearnUi {
  /** The name of the section, in the nav and on the landing page. */
  name: string;
  landingTitle: string;
  landingLead: string;
  /** `aria-label` on the article tree. */
  rail: string;
  crumbs: string;
  /** The contents column. */
  onThisPage: string;
  prev: string;
  next: string;
  updated: string;
  related: string;
  /** Marks a row that exists only in English. */
  englishOnly: string;
  /** The banner at the top of an article being read in English on a translated site. */
  notTranslated: string;
  /** The mobile section switcher's accessible name. */
  sectionMenu: string;
  everything: string;
  everythingLead: string;
  openInApp: string;
  /** Shown on a locale's landing page when nothing has been translated yet. */
  nothingHereYet: string;

  /* ---- Search ------------------------------------------------------------ */
  /** On the trigger, and as the field's own placeholder. */
  searchPlaceholder: string;
  /** The Esc button's accessible name. */
  searchClose: string;
  /** `aria-label` on the results listbox. */
  searchResults: string;
  /** Next to the ↑↓ keys in the footer. */
  searchMove: string;
  /** Next to the ↵ key in the footer. */
  searchOpen: string;
  /** The line above the starting suggestions, before anything is typed. */
  searchStarters: string;
  /** Prefix for "Nothing matched “xyz”." — the quoted query is appended. */
  searchNothing: string;
}

export const LEARN_UI: Record<Locale, LearnUi> = {
  en: {
    name: 'Guide',
    landingTitle: 'The Diwche guide',
    landingLead:
      'How every part of Diwche works, written for the person using it. Start at the top, or search for the thing you are stuck on.',
    rail: 'Guide contents',
    crumbs: 'Breadcrumb',
    onThisPage: 'On this page',
    prev: 'Previous',
    next: 'Next',
    updated: 'Updated',
    related: 'Related',
    englishOnly: 'English only',
    notTranslated: 'This article has not been translated yet. You are reading the English version.',
    sectionMenu: 'Guide sections',
    everything: 'Every article',
    everythingLead: 'The whole guide on one page. Use your browser’s find to search it.',
    openInApp: 'Open it in Diwche',
    nothingHereYet: 'Nothing in this language yet. The English guide is complete.',
    searchPlaceholder: 'Search the guide',
    searchClose: 'Close search',
    searchResults: 'Search results',
    searchMove: 'to move',
    searchOpen: 'to open',
    searchStarters: 'Start typing, or pick one below.',
    searchNothing: 'Nothing matched',
  },

  fa: {
    name: 'راهنما',
    landingTitle: 'راهنمای دیوچه',
    landingLead:
      'هر بخش دیوچه چطور کار می‌کند، نوشته‌شده برای کسی که از آن استفاده می‌کند. از بالا شروع کن، یا همان چیزی را که گیر کرده‌ای جست‌وجو کن.',
    rail: 'فهرست راهنما',
    crumbs: 'مسیر',
    onThisPage: 'در این صفحه',
    prev: 'قبلی',
    next: 'بعدی',
    updated: 'به‌روزرسانی',
    related: 'مرتبط',
    englishOnly: 'فقط انگلیسی',
    notTranslated: 'این مقاله هنوز ترجمه نشده. نسخه‌ی انگلیسی را می‌خوانی.',
    sectionMenu: 'بخش‌های راهنما',
    everything: 'همه‌ی مقاله‌ها',
    everythingLead: 'تمام راهنما در یک صفحه. با جست‌وجوی خود مرورگر در آن بگرد.',
    openInApp: 'در دیوچه بازش کن',
    nothingHereYet: 'هنوز چیزی به این زبان نیست. راهنمای انگلیسی کامل است.',
    searchPlaceholder: 'جست‌وجو در راهنما',
    searchClose: 'بستن جست‌وجو',
    searchResults: 'نتیجه‌های جست‌وجو',
    searchMove: 'جابه‌جایی',
    searchOpen: 'باز کردن',
    searchStarters: 'چیزی بنویس، یا یکی از این‌ها را انتخاب کن.',
    searchNothing: 'چیزی پیدا نشد برای',
  },

  de: {
    name: 'Anleitung',
    landingTitle: 'Die Diwche-Anleitung',
    landingLead:
      'Wie jeder Teil von Diwche funktioniert, geschrieben für die Person, die damit arbeitet. Oben anfangen, oder nach dem suchen, wo es klemmt.',
    rail: 'Inhalt der Anleitung',
    crumbs: 'Pfad',
    onThisPage: 'Auf dieser Seite',
    prev: 'Zurück',
    next: 'Weiter',
    updated: 'Aktualisiert',
    related: 'Verwandt',
    englishOnly: 'Nur Englisch',
    notTranslated:
      'Dieser Artikel ist noch nicht übersetzt. Du liest die englische Fassung.',
    sectionMenu: 'Abschnitte',
    everything: 'Alle Artikel',
    everythingLead: 'Die ganze Anleitung auf einer Seite. Mit der Suche des Browsers durchsuchbar.',
    openInApp: 'In Diwche öffnen',
    nothingHereYet: 'Noch nichts in dieser Sprache. Die englische Anleitung ist vollständig.',
    searchPlaceholder: 'Anleitung durchsuchen',
    searchClose: 'Suche schließen',
    searchResults: 'Suchergebnisse',
    searchMove: 'wechseln',
    searchOpen: 'öffnen',
    searchStarters: 'Tipp etwas, oder wähl unten eines aus.',
    searchNothing: 'Nichts gefunden für',
  },
};
