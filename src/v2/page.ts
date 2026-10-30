/**
 * The v2 pages are plain HTML (src/v2/*.html) with their scripts and assets in public/v2/. Their text is English in
 * the markup and translated in the browser by public/v2/i18n.js, so one file serves every language: this fills the
 * head (title, description, canonical, alternates) and tells the page which language to start in.
 */
import home from './home.html?raw';
import usecases from './usecases.html?raw';

export type V2Lang = 'en' | 'de' | 'fa';

const SITE = 'https://diwche.com';
const HOME_PATH: Record<V2Lang, string> = { en: '/', de: '/de/', fa: '/fa/' };

const META = {
  home: {
    en: ['Diwche · Content from 0 to 100',
      'Diwche takes your content from 0 to 100: it gets to know you, brings ideas, writes the script for every format and gives you the tools to make them.'],
    de: ['Diwche · Content von 0 auf 100',
      'Diwche bringt deinen Content von 0 auf 100: Es lernt dich kennen, bringt Ideen, schreibt das Skript für jedes Format und gibt dir die Werkzeuge, um sie zu machen.'],
    fa: ['دیوچه · محتوا از صفر تا صد',
      'دیوچه محتوای تو رو از صفر تا صد می‌بره: تو رو می‌شناسه، ایده میاره، برای هر قالب متن می‌نویسه و ابزار ساختنش رو می‌ده دستت.'],
  },
  usecases: {
    en: ['Diwche · Who it’s for',
      'Six pages, six different weeks: a nutritionist, a pet-treat shop, a café, a coach, a Persian kitchen and a meme page, each made with Diwche.'],
  },
} as const;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function v2Page(page: 'home' | 'usecases', lang: V2Lang): string {
  const raw = page === 'home' ? home : usecases;
  const [title, desc] = page === 'home' ? META.home[lang] : META.usecases.en;
  const url = SITE + (page === 'home' ? HOME_PATH[lang] : '/use-cases/');
  const alternates = page === 'home'
    ? [...(Object.keys(HOME_PATH) as V2Lang[]).map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${HOME_PATH[l]}">`),
      `<link rel="alternate" hreflang="x-default" href="${SITE}/">`].join('\n')
    : '';
  const fill: Record<string, string> = {
    LANG: lang, DIR: lang === 'fa' ? 'rtl' : 'ltr',
    // Only a language route pins the language; the root follows the visitor's choice or browser.
    DATALANG: page === 'home' && lang !== 'en' ? lang : '',
    TITLE: escape(title), DESC: escape(desc), URL: url, ALTERNATES: alternates, OG: lang,
  };
  return raw.replace(/%([A-Z]+)%/g, (m, k: string) => (k in fill ? fill[k] : m));
}
