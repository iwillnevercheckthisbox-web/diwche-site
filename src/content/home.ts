/**
 * The homepage, in three languages.
 *
 * Same reason as the funnel's `copy.en.ts` / `copy.fa.ts`: the page had its
 * English inline, which is fine until there is a second language. `HomeCopy` is
 * the contract, so a missing Persian string is a compile error rather than an
 * English sentence on a Persian page.
 *
 * English and Persian are both authored — the Diw (دیو) is a Persian figure to
 * begin with, so the voice lands there without being translated into it. The
 * German is derived from the English and follows it sentence for sentence;
 * when the English changes, this is the one that has to be redone with it.
 */

export interface HomeCopy {
  locale: string;
  meta: { title: string; description: string };

  nav: {
    links: { href: string; label: string }[];
    /** The pill in the bar. It writes to us; there is no sign-up on this site. */
    cta: string;
    theme: string;
    /** The word on the closed language control. */
    language: string;
    /** The name of the control that opens the links on a phone. */
    menu: string;
  };

  hero: {
    /** Split so the accent phrase can be marked without putting markup in a string. */
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    lead: string;
    /**
     * One plain line on the optional TikTok/Instagram connection and on posting.
     * Platform reviewers look for the product on the home page; wording only,
     * no partner logos, no claim of endorsement.
     */
    app: string;
    cta: string;
  };

  /** The band under the hero. */
  persona: { title: string; text: string };

  /**
   * The three product rows: plan, make, see how it did. Only what the phone
   * app does today (2026-10-05).
   */
  pillars: { eyebrow: string; title: string; lead: string; items: { name: string; text: string }[] }[];

  approach: { eyebrow: string; title: string; lead: string };

  faq: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { q: string; a: string }[];
  };

  footer: {
    note: string;
    groups: { title: string; links: { href?: string; label: string }[] }[];
    /** How to reach a person. The address itself is the same in every language. */
    contact: { title: string; lead: string };
  };
}

export const HOME_EN: HomeCopy = {
  locale: 'en',

  meta: {
    title: 'Diwche — plan, make and measure your posts',
    description: 'Diwche is a phone app that plans your week of posts, helps you make them, and shows you how they did on TikTok and Instagram.',
  },

  nav: {
    links: [
      { href: '/#product', label: 'Features' },
      { href: '/#approach', label: 'How it works' },
      { href: '/#faq', label: 'FAQ' },
    ],
    cta: 'Contact us',
    theme: 'Switch to the light theme',
    language: 'Language',
    menu: 'Menu',
  },

  hero: {
    titleBefore: 'Plan, make and ',
    titleAccent: 'measure',
    titleAfter: ' your posts — on your phone.',
    lead: 'Diwche plans your week of posts, helps you make each one with its editors and studios, and shows you how they did.',
    app: 'Connecting TikTok or Instagram is optional: sign in with them and see your posts’ numbers. We post only what you tap Publish on, at the time you choose.',
    cta: 'See what it does',
  },

  persona: {
    title: 'Tell it about you once.',
    text: 'What you tell Diwche about yourself and your work shapes the ideas and scripts it suggests. You can read and change it in the app at any time.',
  },

  pillars: [
    {
      eyebrow: '01 — Plan',
      title: 'Your week of posts, planned.',
      lead: 'Diwche suggests ideas that fit you and lays them out across your week. Keep what you like, drop what you don’t.',
      items: [
        { name: 'Ideas', text: 'Ideas matched to what you told it about yourself and your work.' },
        { name: 'Scripts', text: 'A hook and a script for each post, ready for you to change.' },
        { name: 'Your week', text: 'Every post in its slot, so you always know what to make next.' },
      ],
    },
    {
      eyebrow: '02 — Make',
      title: 'Make every post on your phone.',
      lead: 'Editors and studios for photos, video and subtitles, in one app. Your pictures are edited on your phone.',
      items: [
        { name: 'Photo studio', text: 'Edit and retouch your photos.' },
        { name: 'Video editor', text: 'Cut your clips on a timeline.' },
        { name: 'Subtitles', text: 'Subtitles from your own speech, in your own style.' },
        { name: 'Publish', text: 'Post to TikTok or Instagram when you tap Publish, or at the time you set.' },
      ],
    },
    {
      eyebrow: '03 — See how it did',
      title: 'See what worked.',
      lead: 'Connect TikTok or Instagram and Diwche shows each post’s numbers in your plan, so next week builds on what worked.',
      items: [
        { name: 'Your numbers', text: 'Views, likes and shares for each post.' },
        { name: 'In your plan', text: 'Results sit next to the posts they belong to.' },
        { name: 'Optional', text: 'Nothing is connected unless you choose to, and you can disconnect at any time.' },
      ],
    },
  ],

  approach: {
    eyebrow: 'How it works',
    title: 'It helps. You decide.',
    lead: 'Diwche suggests ideas, drafts scripts and speeds up editing. Everything stays editable, and nothing is posted until you tap Publish or set a time.',
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'A few questions',
    lead: 'Anything not here, write to us.',
    items: [
      {
        q: 'Do I have to connect TikTok or Instagram?',
        a: 'No. Planning and making work without it. Connect them only if you want to sign in with them, see your posts’ numbers, or post from the app.',
      },
      {
        q: 'Will Diwche post without asking me?',
        a: 'No. A post goes out only when you tap Publish, or at the time you set for that post.',
      },
      {
        q: 'Does Diwche see my password?',
        a: 'No. You sign in on TikTok’s or Instagram’s own screen, and we never see or store your password.',
      },
      {
        q: 'Which phones does it run on?',
        a: 'iPhone, iPad and Android.',
      },
      {
        q: 'Can I delete my data?',
        a: 'Yes. Delete your account in the app under Profile ▸ Delete account, or write to support@diwche.com.',
      },
    ],
  },

  footer: {
    note: 'Plan, make and measure your posts on your phone. Named after a small, tired imp.',
    groups: [
      {
        title: 'Product',
        links: [
          { href: '/#product', label: 'Features' },
          { label: 'Plan' },
          { label: 'Studios' },
          { label: 'Results' },
        ],
      },
      {
        title: 'Learn',
        links: [{ href: '/#faq', label: 'FAQ' }],
      },
      { title: 'Legal', links: [{ href: '/privacy', label: 'Privacy' }, { href: '/terms', label: 'Terms' }] },
    ],
    contact: { title: 'Talk to us', lead: 'A real person reads this one.' },
  },
};

export const HOME_FA: HomeCopy = {
  locale: 'fa',

  meta: {
    title: 'دیوچه — پست‌هایت را برنامه‌ریزی کن، بساز و نتیجه را ببین',
    description: 'دیوچه اپ گوشی است که هفته‌ی پست‌هایت را برنامه‌ریزی می‌کند، کمکت می‌کند بسازی‌شان، و نشانت می‌دهد در تیک‌تاک و اینستاگرام چطور عمل کرده‌اند.',
  },

  nav: {
    links: [
      { href: '/fa/#product', label: 'امکانات' },
      { href: '/fa/#approach', label: 'چطور کار می‌کند' },
      { href: '/fa/#faq', label: 'سوالات متداول' },
    ],
    cta: 'تماس با ما',
    theme: 'رفتن به تم روشن',
    language: 'زبان',
    menu: 'منو',
  },

  hero: {
    titleBefore: 'پست‌هایت را برنامه‌ریزی کن، بساز و ',
    titleAccent: 'نتیجه‌اش را ببین',
    titleAfter: ' — روی گوشی.',
    lead: 'دیوچه هفته‌ی پست‌هایت را برنامه‌ریزی می‌کند، با ویرایشگرها و استودیوهایش کمکت می‌کند هر کدام را بسازی، و نشانت می‌دهد چطور عمل کرده‌اند.',
    app: 'وصل کردن تیک‌تاک یا اینستاگرام اختیاری است: با آن‌ها وارد شو و عددهای پست‌هایت را ببین. فقط چیزی را پست می‌کنیم که خودت «انتشار» را برایش بزنی، در زمانی که خودت انتخاب کنی.',
    cta: 'ببین چه می‌کند',
  },

  persona: {
    title: 'یک بار از خودت بگو.',
    text: 'آنچه درباره‌ی خودت و کارت به دیوچه می‌گویی، ایده‌ها و سناریوهایی را که پیشنهاد می‌دهد شکل می‌دهد. هر وقت بخواهی می‌توانی در اپ بخوانی و عوضش کنی.',
  },

  pillars: [
    {
      eyebrow: '۰۱ — برنامه',
      title: 'هفته‌ی پست‌هایت، برنامه‌ریزی‌شده.',
      lead: 'دیوچه ایده‌هایی پیشنهاد می‌دهد که به تو می‌خورند و آن‌ها را در هفته‌ات می‌چیند. هرچه را دوست داری نگه دار، بقیه را کنار بگذار.',
      items: [
        { name: 'ایده‌ها', text: 'ایده‌هایی متناسب با آنچه درباره‌ی خودت و کارت گفته‌ای.' },
        { name: 'سناریوها', text: 'برای هر پست یک قلاب و یک سناریو، آماده‌ی این‌که تغییرش بدهی.' },
        { name: 'هفته‌ات', text: 'هر پست در جای خودش، تا همیشه بدانی بعدی چیست.' },
      ],
    },
    {
      eyebrow: '۰۲ — ساختن',
      title: 'هر پست را روی گوشی بساز.',
      lead: 'ویرایشگرها و استودیوهای عکس، ویدیو و زیرنویس، در یک اپ. عکس‌هایت روی خود گوشی ویرایش می‌شوند.',
      items: [
        { name: 'استودیوی عکس', text: 'عکس‌هایت را ویرایش و روتوش کن.' },
        { name: 'ویرایشگر ویدیو', text: 'کلیپ‌هایت را روی تایم‌لاین برش بزن.' },
        { name: 'زیرنویس', text: 'زیرنویس از صدای خودت، با سبک خودت.' },
        { name: 'انتشار', text: 'وقتی «انتشار» را بزنی، یا در زمانی که تعیین کرده‌ای، در تیک‌تاک یا اینستاگرام پست کن.' },
      ],
    },
    {
      eyebrow: '۰۳ — نتیجه',
      title: 'ببین چه چیزی جواب داد.',
      lead: 'تیک‌تاک یا اینستاگرام را وصل کن تا دیوچه عددهای هر پست را در برنامه‌ات نشان دهد و هفته‌ی بعد روی چیزی بنا شود که جواب داده.',
      items: [
        { name: 'عددهایت', text: 'بازدید، لایک و اشتراک‌گذاری هر پست.' },
        { name: 'در برنامه‌ات', text: 'نتیجه‌ها کنار همان پست‌هایی هستند که مال آن‌هایند.' },
        { name: 'اختیاری', text: 'تا خودت نخواهی هیچ‌چیز وصل نمی‌شود، و هر وقت بخواهی می‌توانی قطعش کنی.' },
      ],
    },
  ],

  approach: {
    eyebrow: 'چطور کار می‌کند',
    title: 'کمک می‌کند. تصمیم با توست.',
    lead: 'دیوچه ایده پیشنهاد می‌دهد، پیش‌نویس سناریو می‌نویسد و ویرایش را سریع‌تر می‌کند. همه‌چیز قابل تغییر می‌ماند، و تا «انتشار» را نزنی یا زمانی تعیین نکنی چیزی پست نمی‌شود.',
  },

  faq: {
    eyebrow: 'سوالات متداول',
    title: 'چند سوال',
    lead: 'اگر سوالت اینجا نیست، برایمان بنویس.',
    items: [
      {
        q: 'باید تیک‌تاک یا اینستاگرام را وصل کنم؟',
        a: 'نه. برنامه‌ریزی و ساختن بدون آن کار می‌کند. فقط اگر می‌خواهی با آن‌ها وارد شوی، عددهای پست‌هایت را ببینی یا از اپ پست کنی، وصلشان کن.',
      },
      {
        q: 'دیوچه بدون اجازه‌ی من پست می‌کند؟',
        a: 'نه. پست فقط وقتی منتشر می‌شود که «انتشار» را بزنی، یا در زمانی که خودت برای آن پست تعیین کرده‌ای.',
      },
      {
        q: 'دیوچه رمزم را می‌بیند؟',
        a: 'نه. در صفحه‌ی ورود خودِ تیک‌تاک یا اینستاگرام وارد می‌شوی و ما رمزت را نه می‌بینیم و نه ذخیره می‌کنیم.',
      },
      {
        q: 'روی چه گوشی‌هایی کار می‌کند؟',
        a: 'آیفون، آیپد و اندروید.',
      },
      {
        q: 'می‌توانم داده‌هایم را پاک کنم؟',
        a: 'بله. در اپ از «پروفایل» و بعد «حذف حساب» حسابت را پاک کن، یا به support@diwche.com بنویس.',
      },
    ],
  },

  footer: {
    note: 'پست‌هایت را روی گوشی برنامه‌ریزی کن، بساز و نتیجه را ببین. نامش از یک دیوِ کوچکِ خسته آمده.',
    groups: [
      {
        title: 'محصول',
        links: [
          { href: '/fa/#product', label: 'امکانات' },
          { label: 'برنامه' },
          { label: 'استودیوها' },
          { label: 'نتیجه‌ها' },
        ],
      },
      {
        title: 'یادگیری',
        links: [{ href: '/fa/#faq', label: 'سوالات متداول' }],
      },
      {
        title: 'حقوقی',
        links: [{ href: '/fa/privacy', label: 'حریم خصوصی' }, { href: '/fa/terms', label: 'شرایط استفاده' }],
      },
    ],
    contact: { title: 'با ما در تماس باش', lead: 'این یکی را یک آدم واقعی می‌خواند.' },
  },
};

export const HOME_DE: HomeCopy = {
  locale: 'de',

  meta: {
    title: 'Diwche — Beiträge planen, erstellen und auswerten',
    description: 'Diwche ist eine Handy-App, die deine Woche an Beiträgen plant, dir beim Erstellen hilft und dir zeigt, wie sie auf TikTok und Instagram gelaufen sind.',
  },

  nav: {
    links: [
      { href: '/de/#product', label: 'Funktionen' },
      { href: '/de/#approach', label: 'So funktioniert’s' },
      { href: '/de/#faq', label: 'Fragen' },
    ],
    cta: 'Kontakt',
    theme: 'Zum hellen Design wechseln',
    language: 'Sprache',
    menu: 'Menü',
  },

  hero: {
    titleBefore: 'Beiträge planen, erstellen und ',
    titleAccent: 'auswerten',
    titleAfter: ' — auf deinem Handy.',
    lead: 'Diwche plant deine Woche an Beiträgen, hilft dir mit seinen Editoren und Studios, jeden davon zu erstellen, und zeigt dir, wie sie gelaufen sind.',
    app: 'TikTok oder Instagram zu verbinden ist freiwillig: Melde dich damit an und sieh die Zahlen deiner Beiträge. Wir veröffentlichen nur, worauf du Veröffentlichen tippst, zu der Zeit, die du wählst.',
    cta: 'Was es kann',
  },

  persona: {
    title: 'Erzähl einmal von dir.',
    text: 'Was du Diwche über dich und deine Arbeit erzählst, prägt die Ideen und Skripte, die es vorschlägt. Du kannst es in der App jederzeit lesen und ändern.',
  },

  pillars: [
    {
      eyebrow: '01 — Planen',
      title: 'Deine Woche an Beiträgen, geplant.',
      lead: 'Diwche schlägt Ideen vor, die zu dir passen, und verteilt sie über deine Woche. Behalte, was dir gefällt, verwirf den Rest.',
      items: [
        { name: 'Ideen', text: 'Ideen passend zu dem, was du über dich und deine Arbeit erzählt hast.' },
        { name: 'Skripte', text: 'Ein Hook und ein Skript für jeden Beitrag, bereit zum Ändern.' },
        { name: 'Deine Woche', text: 'Jeder Beitrag an seinem Platz, damit du weißt, was als Nächstes kommt.' },
      ],
    },
    {
      eyebrow: '02 — Erstellen',
      title: 'Jeden Beitrag auf dem Handy erstellen.',
      lead: 'Editoren und Studios für Fotos, Video und Untertitel in einer App. Deine Bilder werden auf deinem Handy bearbeitet.',
      items: [
        { name: 'Fotostudio', text: 'Fotos bearbeiten und retuschieren.' },
        { name: 'Videoeditor', text: 'Clips auf einer Zeitleiste schneiden.' },
        { name: 'Untertitel', text: 'Untertitel aus deiner eigenen Sprache, in deinem Stil.' },
        { name: 'Veröffentlichen', text: 'Auf TikTok oder Instagram posten, wenn du auf Veröffentlichen tippst, oder zur Zeit, die du festlegst.' },
      ],
    },
    {
      eyebrow: '03 — Auswerten',
      title: 'Sieh, was funktioniert hat.',
      lead: 'Verbinde TikTok oder Instagram, und Diwche zeigt die Zahlen jedes Beitrags in deinem Plan — damit die nächste Woche auf dem aufbaut, was funktioniert hat.',
      items: [
        { name: 'Deine Zahlen', text: 'Aufrufe, Likes und Teilungen für jeden Beitrag.' },
        { name: 'In deinem Plan', text: 'Ergebnisse stehen neben den Beiträgen, zu denen sie gehören.' },
        { name: 'Freiwillig', text: 'Verbunden wird nur, was du verbindest, und du kannst jederzeit trennen.' },
      ],
    },
  ],

  approach: {
    eyebrow: 'So funktioniert’s',
    title: 'Es hilft. Du entscheidest.',
    lead: 'Diwche schlägt Ideen vor, entwirft Skripte und beschleunigt das Bearbeiten. Alles bleibt änderbar, und nichts wird veröffentlicht, bevor du auf Veröffentlichen tippst oder eine Zeit festlegst.',
  },

  faq: {
    eyebrow: 'Fragen',
    title: 'Ein paar Fragen',
    lead: 'Was hier fehlt, schreib uns.',
    items: [
      {
        q: 'Muss ich TikTok oder Instagram verbinden?',
        a: 'Nein. Planen und Erstellen funktionieren ohne. Verbinde sie nur, wenn du dich damit anmelden, die Zahlen deiner Beiträge sehen oder aus der App posten willst.',
      },
      {
        q: 'Postet Diwche, ohne mich zu fragen?',
        a: 'Nein. Ein Beitrag geht nur raus, wenn du auf Veröffentlichen tippst, oder zu der Zeit, die du für ihn festgelegt hast.',
      },
      {
        q: 'Sieht Diwche mein Passwort?',
        a: 'Nein. Du meldest dich auf dem eigenen Bildschirm von TikTok oder Instagram an, und wir sehen oder speichern dein Passwort nie.',
      },
      {
        q: 'Auf welchen Handys läuft es?',
        a: 'iPhone, iPad und Android.',
      },
      {
        q: 'Kann ich meine Daten löschen?',
        a: 'Ja. Lösche dein Konto in der App unter Profil ▸ Konto löschen, oder schreib an support@diwche.com.',
      },
    ],
  },

  footer: {
    note: 'Beiträge auf dem Handy planen, erstellen und auswerten. Benannt nach einem kleinen, müden Kobold.',
    groups: [
      {
        title: 'Produkt',
        links: [
          { href: '/de/#product', label: 'Funktionen' },
          { label: 'Plan' },
          { label: 'Studios' },
          { label: 'Ergebnisse' },
        ],
      },
      {
        title: 'Lernen',
        links: [{ href: '/de/#faq', label: 'Fragen' }],
      },
      {
        title: 'Rechtliches',
        links: [{ href: '/de/privacy', label: 'Datenschutz' }, { href: '/de/terms', label: 'AGB' }],
      },
    ],
    contact: { title: 'Schreib uns', lead: 'Hier liest ein Mensch mit.' },
  },
};
