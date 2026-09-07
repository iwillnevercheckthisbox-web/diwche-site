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
    cta: string;
    theme: string;
    /** The word on the closed language control. */
    language: string;
    /**
     * The name of the control that opens the links on a phone.
     *
     * There was no such control. Under 760px the nav simply hid its links, so Features, the
     * free read, Reliability, the FAQ and the guides were unreachable on the device most
     * visitors arrive on — the site had a navigation bar with nothing in it.
     */
    menu: string;
  };

  hero: {
    /** Split so the accent phrase can be marked without putting markup in a string. */
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    lead: string;
    cta: string;
    /** Shown while the read is not connected to a backend. */
    ctaOff: string;
  };

  /**
   * The band under the hero.
   *
   * It used to be the Meta band: a "You sign in through [Meta]" label with the
   * wordmark inlined next to it. That has gone. It read as a login option on a
   * page that has no login, and it put someone else's logo in the second screen
   * of our own. The band now says the thing a visitor actually weighs at that
   * point — that the account's voice is defined once and then held.
   */
  persona: { title: string; text: string };

  pilot: {
    eyebrow: string;
    title: string;
    lead: string;
    paths: { title: string; text: string }[];
  };

  /**
   * The three product rows.
   *
   * `items` used to be a single top-level `capabilities` list that only the
   * first row rendered. Every row names what is inside it now, so the list
   * belongs to the row rather than to the page.
   */
  pillars: { eyebrow: string; title: string; lead: string; items: { name: string; text: string }[] }[];

  approach: { eyebrow: string; title: string; lead: string };

  reliability: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { title: string; text: string }[];
  };

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
    title: 'Diwche — a manager for one Instagram account. Yours.',
    description:
      'Diwche runs one Instagram account: reads your feeds, writes and designs the post, and publishes it on schedule — tuned to what works on accounts like yours.',
  },

  nav: {
    // Pricing is deliberately absent: no number has been decided, and a tier
    // list of placeholders is worse than none because a reader cannot tell.
    //
    // The guide (/learn) is deliberately not here either. It stays published
    // and in the sitemap for search, and the footer still links to it; it just
    // is no longer a headline destination.
    links: [
      { href: '/#product', label: 'Features' },
      { href: '/#pilot', label: 'The free read' },
      { href: '/#reliability', label: 'Reliability' },
      { href: '/#faq', label: 'FAQ' },
    ],
    // Short enough to sit in a nav bar, and it says what happens rather than
    // asking permission for it. "Let him look" was neither.
    cta: 'Free read',
    theme: 'Switch to the light theme',
    language: 'Language',
    menu: 'Menu',
  },

  hero: {
    titleBefore: 'From raw idea to published post — at ',
    titleAccent: '10x speed',
    titleAfter: ', with 100% control.',
    lead: 'Diwche is your end-to-end content operations unit. It uncovers winning topics, edits your visuals in a full editing suite, schedules your queue, and translates performance data into your next big move.',
    /*
     * The button, in the reader's words rather than ours.
     *
     * "Let him read your page" is five words asking to be allowed to do
     * something, set in a button the width of the sentence — which on a phone
     * wrapped to two lines under a headline that had already said who he is.
     */
    cta: 'Read my page',
    ctaOff: 'See what he would do',
  },

  persona: {
    title: 'Define who you are once — Diwche takes care of the rest.',
    text: 'From tone of voice and writing style to visual aesthetics, Diwche learns your account’s exact persona. Every caption, reel and idea is made to sound and look unmistakably like you, so the account stays consistent without being told again each time.',
  },

  pilot: {
    eyebrow: 'The free read',
    title: 'See how it works before you commit.',
    lead: 'Whether you manage an active Instagram account or are launching a new concept from scratch, Diwche gives you a starting point. Two ways in.',
    paths: [
      {
        title: 'Already posting',
        text: 'Diwche reads your existing public profile and shows you the patterns behind what has worked. Bring across the identity, tone and settings you already use, and run the account from one place after that.',
      },
      {
        title: 'Not started yet',
        text: 'You have a topic and no account. Diwche maps out the angles with the most in them and walks you through building the profile from the ground up — brand identity, visual style and tone of voice.',
      },
    ],
  },

  pillars: [
    {
      eyebrow: '01 — D1 Studio',
      title: 'End-to-end content creation.',
      lead: 'Finish a piece from start to end, whether you bring your own footage or start with nothing. D1 Studio holds the whole production in one workspace: no more moving between four applications to write, edit, caption and post.',
      items: [
        { name: 'Scripting', text: 'Hooks, outlines and whole scripts, matched to the voice and strategy of that account.' },
        { name: 'Visual Studio', text: 'A timeline editor for video and stills. Every cut, frame, layout and layer stays yours to change.' },
        { name: 'Subtitles', text: 'Subtitles written for you, in your own styles, animations and layout.' },
        { name: 'Scheduling', text: 'Queue the finished piece for a peak hour without leaving the studio.' },
      ],
    },
    {
      eyebrow: '02 — Context-aware engagement',
      title: 'Replies that read what was written, not which word it contains.',
      lead: 'Diwche reads incoming comments and direct messages in full context and answers naturally, in the character and tone of voice of that account. You keep control and oversight the whole way.',
      items: [
        { name: 'It reads the intent', text: 'What your audience meant, rather than a template fired by a keyword it recognised.' },
        { name: 'Answers in your character', text: 'Every comment and DM is answered in the voice and the guidelines you set for the account.' },
        { name: 'Complete oversight', text: 'Look through the interactions, set rules, or step into a conversation yourself whenever you want it.' },
      ],
    },
    {
      eyebrow: '03 — Actionable analytics',
      title: 'Turn performance data into your next move.',
      lead: 'Diwche watches what the account does and turns the numbers into plain language: what worked, what did not, and what to post next.',
      items: [
        { name: 'Metrics to meaning', text: 'Charts and figures come back as directions you can act on.' },
        { name: 'Format and hour', text: 'Your strongest formats, your best hours, and what your audience turns up for.' },
        { name: 'A roadmap', text: 'Clear rules on the angles worth doubling down on and the ones worth dropping.' },
      ],
    },
  ],

  approach: {
    eyebrow: 'How it thinks',
    title: 'Assisted execution, human control.',
    lead: 'Diwche does the heavy labour — reading the feeds, drafting the copy, cutting the footage, sharpening the wording. It never makes the last creative decision. Every draft, script and frame stays editable: it assists, rephrases and improves, and the final word is yours.',
  },

  reliability: {
    eyebrow: 'Reliability',
    title: 'Built for stability.',
    lead: 'Most of what Diwche does happens while nobody is watching, so it runs inside strict architectural guardrails — built to prevent errors, hold a problem where it started, and leave you in control of the accounts.',
    items: [
      {
        title: 'Account isolation',
        text: 'Every connected account runs in its own environment. A problem on one never spills into another.',
      },
      {
        title: 'Duplicate prevention',
        text: 'Every script, article and asset is checked against everything that account has already published, so nothing goes out twice.',
      },
      {
        title: 'Optional review gate',
        text: 'Turn manual approval on and nothing reaches your live feed until you have read it and released it.',
      },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'A few questions',
    lead: 'Anything not here, ask at the demo.',
    items: [
      {
        q: 'Will using Diwche put my Instagram account at risk?',
        a: 'No. Diwche connects only through Meta’s official APIs and never asks for your password. Scheduling, publishing and replies all stay inside Meta’s rate limits and compliance rules.',
      },
      {
        q: 'Do I need to upload my own video footage?',
        a: 'Not necessarily. You can bring your own raw footage into D1 Studio, or let Diwche build posts and carousels out of text and graphics. Either way the timeline editor leaves every frame, layer and subtitle under your hand.',
      },
      {
        q: 'Does Diwche post automatically, or can I review content first?',
        a: 'That is yours to decide. Turn on the review gate and no reel, post or caption reaches your profile without you approving it.',
      },
      {
        q: 'How does Diwche match my brand voice?',
        a: 'You define the account’s persona, writing style and visual rules once, at setup. Diwche applies them to scripts, captions and replies, so everything it makes carries the same signature.',
      },
      {
        q: 'Are DM and comment replies just automated keyword bots?',
        a: 'No. Diwche reads the meaning and the intent behind a message and answers in the character and tone of the account, rather than matching a word to a canned line.',
      },
      {
        q: 'How does the free trial work?',
        a: 'Enter your Instagram handle — no password. Diwche reads your public page for free and tells you what it found. If you want it to start making and editing content after that, the trial begins there, with nothing paid up front.',
      },
    ],
  },

  footer: {
    note: 'A studio that runs your Instagram accounts. Named after a small, tired imp.',
    groups: [
      {
        title: 'Product',
        links: [
          { href: '/#product', label: 'Everything it does' },
          { label: 'Topics' },
          { label: 'Reels Studio' },
          { label: 'Voice Lab' },
        ],
      },
      {
        title: 'Learn',
        links: [{ href: '/#faq', label: 'FAQ' }, { href: '/learn', label: 'Guides' }, { label: 'About Diwche' }],
      },
      { title: 'Legal', links: [{ href: '/privacy', label: 'Privacy' }, { href: '/terms', label: 'Terms' }] },
    ],
    contact: { title: 'Talk to us', lead: 'A real person reads this one.' },
  },
};

export const HOME_FA: HomeCopy = {
  locale: 'fa',

  meta: {
    title: 'دیوچه — یک مدیر برای پیج اینستاگرامت.',
    description:
      'دیوچه پیج اینستاگرامت را می‌گرداند: منابعت را می‌خواند، پست را می‌نویسد و طراحی می‌کند و سر ساعت منتشر می‌کند — بر اساس آنچه روی پیج‌های مشابه جواب داده.',
  },

  nav: {
    links: [
      { href: '/fa/#product', label: 'امکانات' },
      { href: '/fa/#pilot', label: 'خوانش رایگان' },
      { href: '/fa/#reliability', label: 'قابل‌اتکا بودن' },
      { href: '/fa/#faq', label: 'سوال‌های پرتکرار' },
    ],
    cta: 'خوانش رایگان',
    theme: 'رفتن به تم روشن',
    language: 'زبان',
    menu: 'منو',
  },

  hero: {
    titleBefore: 'از ایده‌ی خام تا انتشار نهایی؛ ',
    titleAccent: '۱۰ برابر سریع‌تر',
    titleAfter: '، با کنترل ۱۰۰٪ روی جزئیات.',
    lead: 'دیوچه دستیار کامل جریان تولید محتوای شماست. ایده‌های پربازدید را پیدا می‌کند، ابزار ادیت کامل ویدیو و عکس را در اختیارتان می‌گذارد، انتشار را خودکار می‌سازد و آمار را به راهکارهای عملی تبدیل می‌کند.',
    cta: 'پیجم رو بخون',
    ctaOff: 'ببین چه می‌کنه',
  },

  persona: {
    title: 'هویت و لحن اختصاصی برندت را یک‌بار تعریف کن؛ بقیه‌اش با دیوچه.',
    text: 'دیوچه با تحلیل و یادگیری استایل بصری، ادبیات نگارش و لحن حساب شما، تمامی ایده‌ها، کپشن‌ها و خروجی‌های تصویری را کاملاً منطبق با شخصیت برندتان تولید می‌کند؛ یکدست، حرفه‌ای و بدون نیاز به تکرار دستورالعمل‌ها.',
  },

  pilot: {
    eyebrow: 'خوانش رایگان',
    title: 'دیوچه، نقطه‌ی شروع برای همه.',
    lead: 'مهم نیست حساب فعال در اینستاگرام داشته باشی یا تازه در ابتدای راه ایده‌پردازی باشی؛ دیوچه در هر دو حالت ساختاری منسجم برای شروع دارد.',
    paths: [
      {
        title: 'حساب فعال داری',
        text: 'دیوچه ابتدا حساب شما را تحلیل می‌کند. می‌توانید هویت، لحن و تنظیماتی را که تاکنون استفاده می‌کردید در دیوچه پیاده‌سازی کنید و فرایند تولید و مدیریت محتوا را از این نقطه به بعد یکپارچه سازید.',
      },
      {
        title: 'هنوز حساب نداری',
        text: 'اگر فقط یک موضوع یا ایده‌ی اولیه داری، دیوچه زوایای جذاب و پربازدید آن را شناسایی می‌کند. سپس کمکت می‌کند هویت برند، لحن اختصاصی و ساختار حساب جدیدت را از پایه طراحی و راه‌اندازی کنی.',
      },
    ],
  },

  pillars: [
    {
      eyebrow: '۰۱ — دیوان استودیو (D1 Studio)',
      title: 'استودیوی کامل تولید محتوا.',
      lead: 'چه فوتیج و ویدیوهای شخصی خودتان را داشته باشید و چه بخواهید همه‌چیز را از صفر بسازید، دیوان استودیو تمام فرایند تولید محتوا را پوشش می‌دهد. دیگر نیازی نیست برای تولید یک پست بین چند برنامه‌ی مختلف جابه‌جا شوید؛ تمامی مراحل، از سناریونویسی تا ادیت، زیرنویس‌گذاری و زمان‌بندی، در یک بستر یکپارچه انجام می‌شوند.',
      items: [
        {
          name: 'سناریونویسی',
          text: 'نگارش هوشمند متون، قلاب‌های تصویری و سناریوی کامل ویدیوها، کاملاً منطبق بر لحن و استراتژی اختصاصی حساب شما.',
        },
        {
          name: 'استودیوی بصری',
          text: 'محیط ادیت حرفه‌ای عکس و ویدیو با تایم‌لاین کامل، برای اعمال تغییرات دقیق روی تمامی فریم‌ها، لایه‌ها و چیدمان‌های بصری.',
        },
        {
          name: 'زیرنویس‌گذاری',
          text: 'تولید خودکار و هوشمند زیرنویس با دقت بالا، همراه با قابلیت سفارشی‌سازی فونت، استایل و انیمیشن‌های متنی.',
        },
        {
          name: 'زمان‌بندی',
          text: 'قرار دادن محتوای نهایی در صف انتشار برای ساعات اوج درگیری مخاطب، بدون خارج شدن از استودیو.',
        },
      ],
    },
    {
      eyebrow: '۰۲ — تعامل و پاسخ‌گویی هوشمند',
      title: 'پاسخ‌گویی را از ربات‌های سنتی و پاسخ‌های تکراری جدا کن.',
      lead: 'دیوچه پیام‌های دایرکت و کامنت‌های دریافتی را با درک کامل از بافت گفت‌وگو تحلیل می‌کند و متناسب با موضوع، کاملاً منطبق بر شخصیت و لحن اختصاصی حساب شما پاسخ می‌دهد. در تمام این مسیر، کنترل و نظارت کامل در دست شماست.',
      items: [
        {
          name: 'درک هوشمند متن',
          text: 'تحلیل معنایی و درک هدف مخاطب، به‌جای اتکا به کلمات کلیدی صلب و ارسال پاسخ‌های یکسان.',
        },
        {
          name: 'حفظ کامل شخصیت برند',
          text: 'پاسخ‌گویی دقیق به کامنت‌ها و دایرکت‌ها با رعایت لحن، هویت و چارچوب تعیین‌شده برای حساب.',
        },
        {
          name: 'مدیریت و نظارت کامل',
          text: 'قابلیت بازبینی تعاملات، تعیین سطوح دسترسی و ورود مستقیم به گفت‌وگوها در صورت نیاز.',
        },
      ],
    },
    {
      eyebrow: '۰۳ — آنالیز هوشمند و استراتژی رشد',
      title: 'داده‌های عملکرد حساب را به گام بعدی تبدیل کن.',
      lead: 'دیوچه آمار حساب شما را به‌طور پیوسته ارزیابی می‌کند و اعداد پیچیده را به راهکارهای روشن و کاربردی تبدیل می‌کند تا دقیقاً بدانید چه محتوایی موفق بوده و در قدم بعدی باید چه کاری انجام دهید.',
      items: [
        {
          name: 'تبدیل داده به تصمیم',
          text: 'تبدیل نمودارها و آمار پیچیده به توصیه‌های ساده، دقیق و قابل اجرا.',
        },
        {
          name: 'تحلیل الگوی مخاطب',
          text: 'شناسایی موفق‌ترین فرمت‌ها، ساعات بهینه برای انتشار و موضوعات جذاب برای مخاطبان شما.',
        },
        {
          name: 'نقشه‌ی راه استراتژیک',
          text: 'پیشنهادهای شفاف درباره‌ی زوایایی که باید روی آن‌ها تمرکز کنید و خطاهایی که باید از آن‌ها پرهیز شود.',
        },
      ],
    },
  ],

  approach: {
    eyebrow: 'نحوه‌ی تفکر دیوچه',
    title: 'زحمت اجرا با هوش مصنوعی، تصمیم نهایی با شما.',
    lead: 'دیوچه کارهای سخت و زمان‌بر را انجام می‌دهد؛ از بررسی فیدها و نوشتن متن اولیه گرفته تا ادیت ویدیو و بازنویسی جملات. اما تصمیم‌گیرنده‌ی نهایی همیشه خود شما هستید. دیوچه هیچ‌وقت به‌تنهایی استراتژی نمی‌چیند؛ مثل یک دستیار کنار شماست تا متن‌ها را دقیق‌تر کند و کیفیت کار را بالا ببرد، در حالی که کنترل کامل ویرایش‌ها دست خودتان می‌ماند.',
  },

  reliability: {
    eyebrow: 'قابل‌اتکا بودن',
    title: 'پایداری سیستم و حفظ امنیت حساب‌ها.',
    lead: 'بخش عمده‌ای از فعالیت‌های دیوچه در پس‌زمینه انجام می‌شود؛ به همین دلیل این سیستم با استانداردهای امنیتی دقیق و ساختاری منعطف در برابر خطا طراحی شده تا امنیت و پایداری حساب‌های شما همواره حفظ شود.',
    items: [
      {
        title: 'ایزوله‌سازی کامل حساب‌ها',
        text: 'معماری سیستم به‌گونه‌ای است که فعالیت هر حساب کاملاً مجزا از بقیه مدیریت می‌شود. بروز هرگونه مشکل در یک حساب هیچ تأثیری بر سایر حساب‌ها نخواهد داشت.',
      },
      {
        title: 'جلوگیری از انتشار تکراری',
        text: 'دیوچه پیش از تولید و انتشار هر محتوا سابقه‌ی حساب را به‌دقت بررسی می‌کند تا از ساخته نشدن و فرستاده نشدن پست‌های تکراری مطمئن شود.',
      },
      {
        title: 'درگاه بازبینی و تأیید نهایی',
        text: 'با فعال کردن این بخش، هیچ ایده‌ای بدون بررسی، ویرایش و تأیید مستقیم شما روی اینستاگرام منتشر نخواهد شد.',
      },
    ],
  },

  faq: {
    eyebrow: 'سوال‌های پرتکرار',
    title: 'چند تا سوال',
    lead: 'هرچه اینجا نیست را در دمو بپرس.',
    items: [
      {
        q: 'آیا استفاده از دیوچه خطری برای امنیت حساب اینستاگرام دارد؟',
        a: 'خیر. دیوچه فقط از طریق APIهای رسمی متا متصل می‌شود و تحت هیچ شرایطی رمز عبور نمی‌خواهد. تمامی فرایندهای انتشار و پاسخ‌گویی کاملاً منطبق بر قوانین و محدودیت‌های استاندارد اینستاگرام انجام می‌شوند.',
      },
      {
        q: 'آیا برای تولید ویدیو حتماً باید خودم فیلم‌برداری کنم؟',
        a: 'لزوماً نه. می‌توانید فوتیج‌های شخصی خود را به دیوان استودیو (D1 Studio) بیاورید یا تولید متن‌ها و طرح‌های کاروسل را به سیستم بسپارید. در هر دو حالت، ویرایشگر بصری امکان ادیت دقیق تمام فریم‌ها، لایه‌ها و زیرنویس‌ها را در اختیارتان می‌گذارد.',
      },
      {
        q: 'آیا پست‌ها به‌صورت خودکار منتشر می‌شوند یا امکان بازبینی وجود دارد؟',
        a: 'کنترل تمام مراحل در دست شماست. با فعال کردن درگاه بازبینی، هیچ ویدیو، کپشن یا پستی بدون بررسی، ویرایش و تأیید مستقیم شما روی حساب قرار نخواهد گرفت.',
      },
      {
        q: 'دیوچه چگونه لحن و هویت اختصاصی حساب را یاد می‌گیرد؟',
        a: 'در مرحله‌ی راه‌اندازی، هویت برند، لحن نگارش و معیارهای بصری خود را تعریف می‌کنید. دیوچه تمامی سناریوها، کپشن‌ها و پاسخ‌های هوشمند را کاملاً منطبق بر این دستورالعمل‌ها تولید می‌کند تا یکدستی برند حفظ شود.',
      },
      {
        q: 'پاسخ‌گویی به دایرکت‌ها و کامنت‌ها به چه صورت انجام می‌شود؟',
        a: 'دیوچه از ربات‌های ساده‌ی کلیدواژه‌ای استفاده نمی‌کند؛ متن پیام مخاطب را با درک کامل از بافت گفت‌وگو تحلیل می‌کند و پاسخی روان، هوشمندانه و منطبق بر شخصیت تعیین‌شده برای حساب می‌فرستد.',
      },
      {
        q: 'تست رایگان سیستم به چه شکل است؟',
        a: 'کافی است آیدی عمومی حساب خود را وارد کنید. دیوچه تحلیل اولیه‌ی حساب شما را رایگان انجام می‌دهد. پس از دیدن گزارش، می‌توانید برای استفاده از ابزارهای تولید محتوا و ادیت، تست رایگان را بدون ثبت اطلاعات مالی فعال کنید.',
      },
    ],
  },

  footer: {
    note: 'استودیویی که پیج‌های اینستاگرامت را می‌گرداند. نامش از یک دیوِ کوچکِ خسته آمده.',
    groups: [
      {
        title: 'محصول',
        links: [
          { href: '/fa/#product', label: 'همه‌ی کارهایی که می‌کند' },
          { label: 'سوژه‌ها' },
          { label: 'استودیوی ریلز' },
          { label: 'آزمایشگاه صدا' },
        ],
      },
      {
        title: 'یادگیری',
        links: [
          { href: '/fa/#faq', label: 'سوال‌های پرتکرار' },
          { href: '/fa/learn', label: 'راهنماها' },
          { label: 'درباره‌ی دیوچه' },
        ],
      },
      {
        title: 'حقوقی',
        links: [{ href: '/fa/privacy', label: 'حریم خصوصی' }, { href: '/fa/terms', label: 'شرایط استفاده' }],
      },
    ],
    contact: { title: 'با ما حرف بزن', lead: 'این یکی را یک آدم واقعی می‌خواند.' },
  },
};

export const HOME_DE: HomeCopy = {
  locale: 'de',

  meta: {
    title: 'Diwche — ein Manager für einen Instagram-Account. Deinen.',
    description:
      'Diwche führt einen Instagram-Account: liest deine Quellen, schreibt und gestaltet den Beitrag, veröffentlicht ihn pünktlich — orientiert an Profilen wie deinem.',
  },

  nav: {
    links: [
      { href: '/de/#product', label: 'Funktionen' },
      { href: '/de/#pilot', label: 'Die kostenlose Analyse' },
      { href: '/de/#reliability', label: 'Verlässlichkeit' },
      { href: '/de/#faq', label: 'Fragen' },
    ],
    cta: 'Kostenlose Analyse',
    theme: 'Zum hellen Design wechseln',
    language: 'Sprache',
    menu: 'Menü',
  },

  hero: {
    titleBefore: 'Von der rohen Idee zum fertigen Beitrag — mit ',
    titleAccent: '10x Tempo',
    titleAfter: ' und 100 % Kontrolle.',
    lead: 'Diwche ist deine Content-Abteilung von der Idee bis zur Veröffentlichung. Er findet die Themen, die tragen, bearbeitet Bild und Video in einer vollwertigen Schnittsuite, plant deine Warteschlange und übersetzt Leistungsdaten in deinen nächsten großen Schritt.',
    cta: 'Meine Seite lesen',
    ctaOff: 'Sieh, was er tun würde',
  },

  persona: {
    title: 'Leg einmal fest, wer du bist — um den Rest kümmert sich Diwche.',
    text: 'Von Tonfall und Schreibstil bis zur visuellen Handschrift lernt Diwche die genaue Persönlichkeit deines Accounts. Jede Bildunterschrift, jedes Reel und jede Idee klingt und sieht unverkennbar nach dir, ohne dass du es jedes Mal neu erklären musst.',
  },

  pilot: {
    eyebrow: 'Die kostenlose Analyse',
    title: 'Sieh, wie es funktioniert, bevor du dich festlegst.',
    lead: 'Ob du einen aktiven Instagram-Account führst oder ein neues Konzept bei null anfängst — Diwche gibt dir einen Startpunkt. Zwei Wege hinein.',
    paths: [
      {
        title: 'Ich poste schon',
        text: 'Diwche liest dein bestehendes öffentliches Profil und zeigt dir die Muster hinter dem, was funktioniert hat. Bring den Auftritt, den Ton und die Einstellungen mit, die du schon benutzt, und führ den Account danach an einer Stelle weiter.',
      },
      {
        title: 'Noch nicht angefangen',
        text: 'Du hast ein Thema und noch keinen Account. Diwche arbeitet die Blickwinkel heraus, in denen am meisten steckt, und führt dich durch den Aufbau des Profils — Markenauftritt, visueller Stil und Tonfall.',
      },
    ],
  },

  pillars: [
    {
      eyebrow: '01 — D1 Studio',
      title: 'Produktion von Anfang bis Ende.',
      lead: 'Bring ein Stück fertig, ob du eigenes Material mitbringst oder mit nichts anfängst. Das D1 Studio hält die ganze Produktion in einem Arbeitsbereich: kein Wechsel mehr zwischen vier Programmen, um zu schreiben, zu schneiden, zu betexten und zu veröffentlichen.',
      items: [
        { name: 'Skripte', text: 'Aufhänger, Gliederungen und ganze Skripte, abgestimmt auf Stimme und Strategie dieses Accounts.' },
        { name: 'Visual Studio', text: 'Ein Timeline-Editor für Video und Bild. Jeder Schnitt, jedes Bild, jedes Layout und jede Ebene bleibt änderbar.' },
        { name: 'Untertitel', text: 'Untertitel entstehen von selbst — in deinen Stilen, Animationen und deinem Layout.' },
        { name: 'Planung', text: 'Das fertige Stück wandert in die Warteschlange für die beste Uhrzeit, ohne das Studio zu verlassen.' },
      ],
    },
    {
      eyebrow: '02 — Antworten, die den Zusammenhang lesen',
      title: 'Antworten auf das Geschriebene, nicht auf ein Stichwort darin.',
      lead: 'Diwche liest eingehende Kommentare und Direktnachrichten im vollen Zusammenhang und antwortet natürlich, im Charakter und Ton dieses Accounts. Kontrolle und Überblick bleiben den ganzen Weg bei dir.',
      items: [
        { name: 'Er liest die Absicht', text: 'Was dein Publikum gemeint hat, statt einer Vorlage, die ein erkanntes Stichwort ausgelöst hat.' },
        { name: 'Antwort in deiner Figur', text: 'Jeder Kommentar und jede DM wird in der Stimme und nach den Regeln beantwortet, die du für den Account gesetzt hast.' },
        { name: 'Voller Überblick', text: 'Sieh die Verläufe durch, setz Regeln, oder übernimm ein Gespräch jederzeit selbst.' },
      ],
    },
    {
      eyebrow: '03 — Auswertung, mit der du etwas anfängst',
      title: 'Aus Leistungsdaten wird dein nächster Schritt.',
      lead: 'Diwche verfolgt, was der Account tut, und übersetzt die Zahlen in klare Sprache: was funktioniert hat, was nicht, und was als Nächstes kommen sollte.',
      items: [
        { name: 'Von Zahlen zu Bedeutung', text: 'Kurven und Werte kommen als Anweisungen zurück, mit denen du etwas anfangen kannst.' },
        { name: 'Format und Uhrzeit', text: 'Deine stärksten Formate, deine besten Stunden und das, wofür dein Publikum auftaucht.' },
        { name: 'Ein Fahrplan', text: 'Klare Regeln, welche Blickwinkel du ausbauen und welche du lassen solltest.' },
      ],
    },
  ],

  approach: {
    eyebrow: 'Wie er denkt',
    title: 'Die Ausführung nimmt er ab, entschieden wird von dir.',
    lead: 'Diwche macht die schwere Arbeit — die Quellen lesen, den Entwurf schreiben, das Material schneiden, die Formulierung schärfen. Die letzte gestalterische Entscheidung trifft er nie. Jeder Entwurf, jedes Skript und jedes Bild bleibt änderbar: er hilft, formuliert um und verbessert, und das letzte Wort ist deins.',
  },

  reliability: {
    eyebrow: 'Verlässlichkeit',
    title: 'Auf Stabilität gebaut.',
    lead: 'Das meiste von dem, was Diwche tut, passiert, während niemand zusieht. Deshalb läuft es innerhalb strenger architektonischer Leitplanken — gebaut, um Fehler zu verhindern, ein Problem dort zu halten, wo es entstanden ist, und dir die Kontrolle über die Accounts zu lassen.',
    items: [
      {
        title: 'Jeder Account für sich',
        text: 'Jeder verbundene Account läuft in seiner eigenen Umgebung. Ein Problem bei einem greift nie auf einen anderen über.',
      },
      {
        title: 'Nie zweimal dasselbe',
        text: 'Jedes Skript, jeder Artikel und jede Datei wird gegen alles geprüft, was dieser Account schon veröffentlicht hat — so geht nichts doppelt raus.',
      },
      {
        title: 'Freigabe, wenn du willst',
        text: 'Schalt die manuelle Freigabe ein, und nichts erreicht dein Profil, bevor du es gelesen und freigegeben hast.',
      },
    ],
  },

  faq: {
    eyebrow: 'Fragen',
    title: 'Ein paar Fragen',
    lead: 'Was hier fehlt, frag beim Termin.',
    items: [
      {
        q: 'Ist mein Instagram-Account mit Diwche gefährdet?',
        a: 'Nein. Diwche verbindet sich ausschließlich über die offiziellen Schnittstellen von Meta und fragt nie nach deinem Passwort. Planung, Veröffentlichung und Antworten bleiben innerhalb der Limits und Regeln von Meta.',
      },
      {
        q: 'Muss ich eigenes Videomaterial hochladen?',
        a: 'Nicht unbedingt. Du kannst eigenes Rohmaterial ins D1 Studio bringen, oder Diwche Beiträge und Karussells aus Text und Grafik bauen lassen. In beiden Fällen bleibt im Timeline-Editor jedes Bild, jede Ebene und jeder Untertitel in deiner Hand.',
      },
      {
        q: 'Veröffentlicht Diwche automatisch, oder kann ich vorher prüfen?',
        a: 'Das entscheidest du. Schalt die Freigabe ein, und kein Reel, kein Beitrag und keine Bildunterschrift erreicht dein Profil, ohne dass du sie freigegeben hast.',
      },
      {
        q: 'Wie trifft Diwche den Ton meiner Marke?',
        a: 'Beim Einrichten legst du die Figur des Accounts, den Schreibstil und die visuellen Vorgaben einmal fest. Diwche wendet sie auf Skripte, Bildunterschriften und Antworten an, damit alles dieselbe Handschrift trägt.',
      },
      {
        q: 'Sind die Antworten auf DMs und Kommentare einfach Stichwort-Bots?',
        a: 'Nein. Diwche liest die Bedeutung und die Absicht hinter einer Nachricht und antwortet im Charakter und Ton des Accounts, statt einem Wort eine vorgefertigte Zeile zuzuordnen.',
      },
      {
        q: 'Wie läuft die kostenlose Testphase?',
        a: 'Gib deinen Instagram-Profilnamen ein — kein Passwort. Diwche liest deine öffentliche Seite kostenlos und sagt dir, was er gefunden hat. Wenn er danach Inhalte bauen und schneiden soll, beginnt die Testphase dort, ohne Vorkasse.',
      },
    ],
  },

  footer: {
    note: 'Ein Studio, das deine Instagram-Accounts führt. Benannt nach einem kleinen, müden Kobold.',
    groups: [
      {
        title: 'Produkt',
        links: [
          { href: '/de/#product', label: 'Alles, was er tut' },
          { label: 'Themen' },
          { label: 'Reels Studio' },
          { label: 'Voice Lab' },
        ],
      },
      {
        title: 'Lernen',
        links: [
          { href: '/de/#faq', label: 'Fragen' },
          { href: '/de/learn', label: 'Anleitungen' },
          { label: 'Über Diwche' },
        ],
      },
      {
        title: 'Rechtliches',
        links: [{ href: '/de/privacy', label: 'Datenschutz' }, { href: '/de/terms', label: 'AGB' }],
      },
    ],
    contact: { title: 'Schreib uns', lead: 'Hier liest ein Mensch mit.' },
  },
};
