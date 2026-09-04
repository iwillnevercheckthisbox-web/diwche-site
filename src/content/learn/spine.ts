/**
 * The guide's skeleton — everything about the guide that is not a sentence.
 *
 * The site's rule everywhere else is that copy lives in typed TypeScript so a
 * missing translation is a compile error (see `content/home.ts`). Seventy
 * articles cannot be string literals, so the rule is applied where it actually
 * bites: **the structure is typed and compile-checked, the prose is MDX.**
 * A missing German section title is still a build failure; a missing German
 * article is a reported gap, because it has to be — see `lib/learn.ts`.
 *
 * Two things are deliberately absent from article frontmatter and live here
 * instead:
 *
 * - **Order.** A number in frontmatter means renumbering seven files to insert
 *   one, and two files can both claim `order: 3`. Position in `ARTICLES` is the
 *   order, and it is readable as a table of contents.
 * - **Section and locale.** Both are already in the path. A frontmatter field
 *   that can disagree with the URL is a bug generator.
 *
 * A slug listed here with no `en/<slug>.mdx` fails the build. That is the point:
 * this file is the promise, and the build checks it.
 */
import type { Locale } from '../../lib/direction';

export const SECTIONS = [
  'start',
  'accounts',
  'page',
  'create',
  'd1',
  'studio',
  'subtitles',
  'editors',
  'library',
  'manage',
  'fix',
] as const;

export type Section = (typeof SECTIONS)[number];

/**
 * Article slugs, in reading order, per section.
 *
 * Sections with an empty list are declared but not yet written. They are shaped
 * here so the order of the guide is decided once rather than drifting as
 * sections land, and they are skipped everywhere a reader could reach them —
 * an empty section index is a 404 waiting to be found.
 */
export const ARTICLES = {
  start: ['make-your-first-post'],

  accounts: [
    'connect-instagram',
    'set-your-account-identity',
    'choose-your-designs',
    'set-up-comment-replies',
    'run-more-than-one-account',
    'delete-an-account',
  ],

  page: [
    'tell-diwche-about-your-page',
    'use-todays-topics',
    'plan-the-week',
    'find-more-sources',
    'read-the-market',
    'tell-diwche-what-changed',
    'read-your-performance',
    'get-the-consultant-report',
  ],

  create: [
    'which-one-do-i-want',
    'carousel-from-a-link',
    'carousel-from-a-file',
    'carousel-from-a-prompt',
    'edit-the-slides',
    'replace-a-picture',
    'make-a-data-infographic',
    'make-a-story',
    'set-up-a-feed',
    'make-a-reel',
  ],

  d1: [
    'start-a-video',
    'write-a-script',
    'film-to-the-teleprompter',
    'drop-in-footage',
    'what-happens-while-it-works',
    'review-what-it-made',
  ],

  studio: [
    'open-the-editor',
    'set-up-the-project',
    'bring-in-footage',
    'trim-a-clip',
    'change-a-transition',
    'work-the-tracks',
    'move-and-scale-a-clip',
    'colour-and-look',
    'add-music-and-sound',
    'add-text-on-screen',
    'add-stickers-and-shapes',
    'add-a-zoom-or-pan',
    'export-the-video',
    'keyboard-shortcuts',
  ],

  subtitles: [
    'transcribe-a-video',
    'transcribe-inside-the-editor',
    'fix-the-words',
    'style-one-word',
    'restyle-many-cues',
    'regroup-the-cues',
    'style-the-captions',
    'export-subtitles',
  ],

  editors: [
    'open-the-photo-editor',
    'crop-and-straighten',
    'adjust-a-photo',
    'remove-the-background',
    'add-text-to-a-photo',
    'work-with-layers',
    'publish-a-photo',
  ],

  library: [
    'make-a-palette',
    'use-a-template',
    'set-up-a-character',
    'add-music',
    'add-a-font',
    'use-the-gallery',
  ],

  manage: ['work-the-activity-log', 'schedule-and-approve', 'settings'],

  fix: [
    'instagram-says-disconnected',
    'my-post-failed',
    'the-editor-will-not-open',
    'ideas-is-empty',
    'the-followers-chart-is-empty',
  ],
} as const satisfies Record<Section, readonly string[]>;

/** `start/what-diwche-does` — the id shape used by the router and the index. */
export type Slug = string;

/** Every slug in reading order, sections first. The prev/next chain. */
export const ALL_SLUGS: readonly Slug[] = SECTIONS.flatMap((s) =>
  (ARTICLES[s] as readonly string[]).map((a) => `${s}/${a}`)
);

/** Sections that actually have something to read. */
export const LIVE_SECTIONS: readonly Section[] = SECTIONS.filter(
  (s) => (ARTICLES[s] as readonly string[]).length > 0
);

interface SectionCopy {
  /** The sidebar and breadcrumb name. */
  title: string;
  /** One sentence on the section index card. */
  blurb: string;
}

/**
 * Section chrome, per locale.
 *
 * `Record<Locale, …>` on purpose: this is the part that must not be allowed to
 * go missing, because it is what a reader sees before they have chosen an
 * article. Persian is authored rather than translated, same as `home.ts`.
 */
export const SECTION_COPY: Record<Locale, Record<Section, SectionCopy>> = {
  en: {
    start: {
      title: 'Start here',
      blurb: 'What Diwche is, what it needs from you, and how to get a first post out.',
    },
    accounts: {
      title: 'Your account',
      blurb: 'Connecting Instagram, and everything that makes a page sound like itself.',
    },
    page: {
      /* Named after what is in it rather than after the app's nav group — the
         group is recorded separately in APP_NAV_LABEL. "Your page" told a
         reader nothing about what they would find under it. */
      title: 'Ideas and Performance',
      blurb: 'Topics every morning, and what the numbers say about what you posted.',
    },
    create: {
      title: 'Making a post',
      blurb: 'Carousels, infographics, single posts, stories, and letting feeds post for you.',
    },
    d1: {
      title: 'D1 Studio',
      blurb: 'Record to a teleprompter, or drop the clips you shot and have them cut.',
    },
    studio: {
      title: 'The video editor',
      blurb: 'Trimming, transitions, tracks, sound and text — every job at the timeline.',
    },
    subtitles: {
      title: 'Subtitles',
      blurb: 'Transcribing, fixing the words, styling one word at a time, and burning in.',
    },
    editors: {
      title: 'The photo editor',
      blurb: 'Cropping, adjusting, cutting out a background, text and layers.',
    },
    library: {
      title: 'Your brand kit',
      blurb: 'Palettes, fonts, templates, characters, music and everything you have saved.',
    },
    manage: {
      title: 'Publishing',
      blurb: 'Scheduling, review, notifications, and the settings that follow you around.',
    },
    fix: {
      title: 'When something goes wrong',
      blurb: 'The thing you are seeing, and what to click to get past it.',
    },
  },

  fa: {
    start: {
      title: 'از اینجا شروع کن',
      blurb: 'دیوچه چیست، از تو چه می‌خواهد، و اولین پست چطور منتشر می‌شود.',
    },
    accounts: {
      title: 'حساب تو',
      blurb: 'وصل‌کردن اینستاگرام، و هر چیزی که لحن صفحه‌ات را می‌سازد.',
    },
    page: {
      title: 'ایده‌ها و عملکرد',
      blurb: 'موضوع‌های هر صبح، و اینکه عددها درباره‌ی آنچه منتشر کرده‌ای چه می‌گویند.',
    },
    create: {
      title: 'ساختن پست',
      blurb: 'کاروسل، اینفوگرافیک، پست تکی، استوری، و انتشار خودکار از فیدها.',
    },
    d1: {
      title: 'استودیو D1',
      blurb: 'جلوی تله‌پرامپتر ضبط کن، یا کلیپ‌هایت را بریز تا تدوین شوند.',
    },
    studio: {
      title: 'ویرایشگر ویدیو',
      blurb: 'برش، ترنزیشن، لایه‌ها، صدا و متن — هر کاری که سر تایم‌لاین انجام می‌دهی.',
    },
    subtitles: {
      title: 'زیرنویس',
      blurb: 'پیاده‌سازی گفتار، اصلاح کلمه‌ها، استایل کلمه‌به‌کلمه، و چسباندن روی ویدیو.',
    },
    editors: {
      title: 'ویرایشگر عکس',
      blurb: 'برش، تنظیم، حذف پس‌زمینه، متن و لایه‌ها.',
    },
    library: {
      title: 'کیت برند',
      blurb: 'پالت‌ها، فونت‌ها، قالب‌ها، شخصیت‌ها، موسیقی و هر چه ذخیره کرده‌ای.',
    },
    manage: {
      title: 'انتشار',
      blurb: 'زمان‌بندی، بازبینی، اعلان‌ها، و تنظیم‌هایی که همه‌جا همراهت‌اند.',
    },
    fix: {
      title: 'وقتی چیزی درست کار نمی‌کند',
      blurb: 'همان چیزی که می‌بینی، و اینکه برای رد شدن از آن کجا را بزنی.',
    },
  },

  de: {
    start: {
      title: 'Hier anfangen',
      blurb: 'Was Diwche ist, was es von dir braucht, und wie der erste Post rausgeht.',
    },
    accounts: {
      title: 'Dein Konto',
      blurb: 'Instagram verbinden, und alles, was eine Seite nach sich selbst klingen lässt.',
    },
    page: {
      title: 'Ideen und Leistung',
      blurb: 'Themen jeden Morgen, und was die Zahlen über das Gepostete sagen.',
    },
    create: {
      title: 'Einen Post machen',
      blurb: 'Karussells, Infografiken, Einzelposts, Stories, und Feeds, die für dich posten.',
    },
    d1: {
      title: 'D1 Studio',
      blurb: 'Vor dem Teleprompter aufnehmen, oder gedrehtes Material schneiden lassen.',
    },
    studio: {
      title: 'Der Video-Editor',
      blurb: 'Schneiden, Übergänge, Spuren, Ton und Text — jede Aufgabe an der Timeline.',
    },
    subtitles: {
      title: 'Untertitel',
      blurb: 'Transkribieren, Wörter korrigieren, Wort für Wort gestalten, einbrennen.',
    },
    editors: {
      title: 'Der Fotoeditor',
      blurb: 'Zuschneiden, anpassen, Hintergrund freistellen, Text und Ebenen.',
    },
    library: {
      title: 'Dein Marken-Kit',
      blurb: 'Paletten, Schriften, Vorlagen, Charaktere, Musik und alles Gespeicherte.',
    },
    manage: {
      title: 'Veröffentlichen',
      blurb: 'Planung, Freigabe, Benachrichtigungen, und die Einstellungen, die mitkommen.',
    },
    fix: {
      title: 'Wenn etwas nicht klappt',
      blurb: 'Das, was du gerade siehst — und worauf du klickst, um weiterzukommen.',
    },
  },
};

/**
 * The label this section carries in the app's own sidebar, or null where the
 * guide invents a grouping the app does not have.
 *
 * Keeping the mapping here rather than in prose means guide and product cannot
 * drift apart quietly: when a nav item is renamed, this file is where the rename
 * is recorded, and a reader can go from a section to a sidebar item without
 * translating in their head.
 */
export const APP_NAV_LABEL: Record<Section, string | null> = {
  start: null,
  accounts: 'Accounts',
  page: 'Your page',
  create: 'Create',
  d1: 'D1 Studio',
  /* Both editors sit behind the sidebar's one "Visual Studio" item, which opens
     the photo editor; the timeline is a tab inside it. The guide splits them
     because they are two different jobs, and says so in the first article. */
  studio: 'Visual Studio',
  subtitles: 'Subtitles',
  editors: 'Visual Studio',
  library: 'Library',
  manage: 'Manage',
  fix: null,
};

/** What the search palette offers before anything has been typed. */
export const STARTERS: readonly Slug[] = [
  'start/make-your-first-post',
  'accounts/connect-instagram',
  'studio/change-a-transition',
  'page/use-todays-topics',
  'create/carousel-from-a-link',
  'd1/start-a-video',
];
