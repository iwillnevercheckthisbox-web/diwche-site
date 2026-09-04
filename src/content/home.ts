/**
 * The homepage, in both languages.
 *
 * Same reason as the funnel's `copy.en.ts` / `copy.fa.ts`: the page had its
 * English inline, which is fine until there is a second language. `HomeCopy` is
 * the contract, so a missing Persian string is a compile error rather than an
 * English sentence on a Persian page.
 *
 * The Persian is authored rather than translated. The Diw (دیو) is a Persian
 * figure to begin with, so the voice lands more naturally there than it does in
 * English — but "sentence case, never Title Case" (DNA §7) has no Persian
 * analogue, and what carries across is the register, not the rule.
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
    /** Split so the accent word can be marked without putting markup in a string. */
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    lead: string;
    cta: string;
    /** Shown while the read is not connected to a backend. */
    ctaOff: string;
  };

  /**
   * The Meta band.
   *
   * It used to say "Trusted by", which claims an endorsement nobody has given:
   * the app has not been through Meta's App Review. What is true, and is the
   * thing worth saying anyway, is that connecting an account goes through
   * Meta's own login and no password is ever typed here.
   */
  /** `promise` is the loud line: what Diwche cannot do, stated where a visitor decides. */
  trustBar: { label: string; note: string; promise: string };

  pilot: {
    eyebrow: string;
    title: string;
    lead: string;
    paths: { title: string; text: string }[];
  };

  pillars: { eyebrow: string; title: string; lead: string }[];
  capabilities: { name: string; text: string }[];

  approach: { eyebrow: string; title: string; lead: string };
  quote: string;

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
      'Diwche runs one Instagram account at a time — reading your feeds, writing and designing the post, and putting it up on schedule, tuned to what has worked on accounts like yours.',
  },

  nav: {
    // Pricing is deliberately absent: no number has been decided, and a tier
    // list of placeholders is worse than none because a reader cannot tell.
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
    titleBefore: 'Some pages have a ',
    titleAccent: 'Diw',
    titleAfter: '.',
    lead: 'He reads what you have made and what your audience answered. He remembers. Each morning he brings topics that are yours, not everyone’s — then writes, shoots, captions and schedules, while you keep every word and frame.',
    /*
     * The button, in the reader's words rather than ours.
     *
     * "Let him read your page" is five words asking to be allowed to do
     * something, set in a button the width of the sentence — which on a phone
     * wrapped to two lines under a headline that had already said who he is.
     * The Diw is the narrator everywhere else on this page; the button is the
     * one place the reader speaks.
     */
    cta: 'Read my page',
    ctaOff: 'See what he would do',
  },

  trustBar: {
    label: 'You sign in through',
    note: 'Your account connects through Meta’s own login — no password is ever typed here, and nothing is posted until you connect it.',
    promise: 'We cannot read your direct messages — we never ask for that permission. And we do not store your comments.',
  },

  pilot: {
    eyebrow: 'What it costs to find out',
    title: 'He reads your page before you pay him anything.',
    lead: 'Give him a handle. He reads what is public, tells you what he found, and offers a free trial if you want him to act on it. Two ways in.',
    paths: [
      {
        title: 'Already posting',
        text: 'He reads the account first and tells you what he found. If you want him on it after that, the trial is free and nothing is connected until you say so.',
      },
      {
        title: 'Not started yet',
        text: 'You have a subject and no page. He works out the angles worth building it on, and helps you build the account itself — identity, feeds, voice. Also free to start.',
      },
    ],
  },

  pillars: [
    {
      eyebrow: '01 — Discover your next big topic',
      title: 'Find ideas worth posting without spending hours researching.',
      lead: 'Enter any niche or topic, and Diwche handles the heavy lifting. It scans your feed, tracks accounts you admire, and delivers tailored suggestions alongside clear rules on what to post — and what to avoid. If you don’t like the suggestions, you are never locked in: paste an article link you love, or steer the research in a new direction whenever you want.',
    },
    {
      eyebrow: '02 — Create it your way',
      title: 'Turn any topic into a finished post, carousel or reel.',
      lead: 'Take a topic Diwche found, pull in one of your tracked feeds, or start from scratch with your own prompt. Diwche writes and designs single posts, carousels, reels and stories, all matched to the voice and look you set for that account.',
    },
    {
      eyebrow: '03 — Publish and schedule',
      title: 'Connect your account once and let Diwche handle the timing.',
      lead: 'Link your Instagram securely through Facebook, with no token to paste. Publish immediately, or schedule for peak engagement times; Diwche keeps the connection alive in the background, so your queue stays automated without dropping off.',
    },
  ],

  capabilities: [
    { name: 'Ideas', text: 'Fresh topics every morning, each with a hook and a reason it matters today.' },
    { name: 'Insights', text: 'What actually worked — by source, persona, format and hour.' },
    { name: 'Story scan', text: 'Your feeds, filtered to the keywords you care about.' },
    { name: 'Peer read', text: 'The accounts you admire, read once and never posted to.' },
  ],

  approach: {
    eyebrow: 'How it thinks',
    title: 'AI does the labour. The judgment is borrowed from people who already do this.',
    lead: 'Diwche does not write from nothing and hope. What it posts, how it says it and when it sends it are shaped by patterns pulled from real accounts that already grew this way. AI reads the feeds, writes the draft and cuts the reel — it does not decide your strategy alone.',
  },

  quote: 'It reads 40 feeds an hour and throws away the 38 stories that aren’t yours.',

  reliability: {
    eyebrow: 'Reliability',
    title: 'Built to fail safely',
    lead: 'Most of what Diwche does happens while nobody is watching. So the interesting question is what it does when something goes wrong.',
    items: [
      {
        title: 'Per-account isolation',
        text: 'One account failing never touches the others. That is an architectural rule, not a setting.',
      },
      {
        title: 'It never posts twice',
        text: 'Every article is checked against what that account has already published before anything is made.',
      },
      {
        title: 'Optional review gate',
        text: 'Turn it on and nothing reaches Instagram until you have looked at it.',
      },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'A few questions',
    lead: 'Anything not here, ask at the demo.',
    items: [
      {
        q: 'What counts as an account?',
        a: 'One connected Instagram account, with its own feeds, keywords, voice and schedule. Accounts do not share anything.',
      },
      {
        q: 'What do you need to read my page?',
        a: 'The handle, and nothing else. Everything read at that stage is what any visitor to your profile can see. To prove the page is yours you send a short code to us on Instagram — there is no password anywhere in this, and nothing is connected until you choose to connect it.',
      },
      {
        q: 'What language does it post in?',
        a: 'Whichever you set per account. Articles are translated before the caption is written, and the layout follows the direction of that language.',
      },
      {
        q: 'Is there a trial?',
        a: 'Yes. The read itself is free and needs nothing from you but a handle. If you want Diwche to act on what it found, the trial that follows is free too — the length is set when you are invited.',
      },
      {
        q: 'What does "AI-driven" actually mean here?',
        a: 'AI does the labour: it reads the feeds, writes the draft, cuts the reel. What it posts and how it says it is shaped by patterns from real accounts that already grew this way, not a model guessing alone.',
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
        links: [{ href: '/#faq', label: 'FAQ' }, { label: 'Guides' }, { label: 'About Diwche' }],
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
      'دیوچه پیج اینستاگرامت را می‌گرداند: منابعت را می‌خواند، پست را می‌نویسد و طراحی می‌کند و سر ساعت منتشرش می‌کند — بر اساس چیزی که روی پیج‌هایی مثل مالِ تو جواب داده.',
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
    titleBefore: 'بعضی پیج‌ها یه ',
    titleAccent: 'دیو',
    titleAfter: ' دارن.',
    lead: 'می‌خونه چی ساختی و مخاطبت به چی جواب داده، و یادش می‌مونه. هر صبح سوژه‌هایی می‌آره که مالِ خودتن، نه مالِ همه — بعد می‌نویسه، می‌سازه، کپشن می‌ذاره و زمان‌بندی می‌کنه؛ در حالی که هر کلمه و هر فریم دست خودت می‌مونه.',
    cta: 'پیجم رو بخون',
    ctaOff: 'ببین چه می‌کنه',
  },

  trustBar: {
    label: 'ورودت از طریق',
    note: 'اتصال اکانتت از راهِ خودِ لاگین متا انجام می‌شه — هیچ رمزی اینجا تایپ نمی‌شه، و تا وصلش نکنی چیزی منتشر نمی‌شه.',
    promise: 'ما نمی‌تونیم دایرکت‌هات رو بخونیم — اصلاً این دسترسی رو نمی‌خوایم. کامنت‌هات رو هم ذخیره نمی‌کنیم.',
  },

  pilot: {
    eyebrow: 'هزینه‌ی فهمیدنش',
    title: 'قبل از این‌که چیزی بدی، پیجت رو می‌خونه.',
    lead: 'آیدیت رو بده. چیزی که عمومیه رو می‌خونه، بهت می‌گه چی پیدا کرده، و اگر خواستی کاری هم بکنه، دوره‌ی آزمایشی رایگانه. دو راه برای شروع.',
    paths: [
      {
        title: 'الان پست می‌ذارم',
        text: 'اول پیج رو می‌خونه و می‌گه چی پیدا کرده. بعدش اگه خواستی کار رو دستش بدی، دوره‌ی آزمایشی رایگانه و تا خودت نگی هیچ‌چیز وصل نمی‌شه.',
      },
      {
        title: 'هنوز شروع نکردم',
        text: 'یه موضوع داری و پیجی نداری. زاویه‌هایی که ارزش ساختن دارن رو درمی‌آره و کمکت می‌کنه خودِ پیج رو بسازی — هویت، منابع، لحن. شروعش هم رایگانه.',
      },
    ],
  },

  pillars: [
    {
      eyebrow: '۰۱ — سوژه‌ی بعدیت رو پیدا کن',
      title: 'بدون ساعت‌ها جست‌وجو، ایده‌هایی که ارزش پست شدن دارن.',
      lead: 'هر حوزه یا موضوعی رو بنویس، بقیه‌اش با دیوچه. منابعت رو می‌گرده، پیج‌هایی که دنبالشون هستی رو زیر نظر می‌گیره، و پیشنهادهای متناسب با خودت می‌ده — همراه با قاعده‌های روشن درباره‌ی این‌که چی بذاری و چی نذاری. اگر پیشنهادها رو نپسندیدی هم هیچ‌جا گیر نمی‌افتی: لینک مقاله‌ای که دوست داشتی رو بچسبون، یا هر وقت خواستی مسیر تحقیق رو عوض کن.',
    },
    {
      eyebrow: '۰۲ — به سبک خودت بساز',
      title: 'هر موضوعی رو به یک پست، کاروسل یا ریلزِ آماده تبدیل کن.',
      lead: 'یکی از سوژه‌هایی که دیوچه پیدا کرده رو بردار، یا از منابعی که دنبال می‌کنی چیزی بیار، یا از صفر با متن خودت شروع کن. دیوچه پست تکی، کاروسل، ریلز و استوری رو می‌نویسه و طراحی می‌کنه، همه متناسب با لحن و ظاهری که برای اون پیج تعریف کردی.',
    },
    {
      eyebrow: '۰۳ — منتشر کن و زمان‌بندی کن',
      title: 'یک‌بار اکانتت رو وصل کن و زمان‌بندی رو بسپار به دیوچه.',
      lead: 'اینستاگرامت رو امن و از طریق فیسبوک وصل کن، بدون این‌که لازم باشه توکنی جایی بچسبونی. یا همون لحظه منتشر کن، یا برای بهترین ساعت زمان‌بندی کن؛ دیوچه اتصال رو در پس‌زمینه زنده نگه می‌داره تا صفت هیچ‌وقت وسط راه نیفته.',
    },
  ],

  capabilities: [
    { name: 'ایده‌ها', text: 'هر صبح سوژه‌های تازه، هرکدام با یک قلاب و یک دلیل که چرا امروز مهم است.' },
    { name: 'تحلیل', text: 'چیزی که واقعاً جواب داده — به تفکیک منبع، شخصیت، قالب و ساعت.' },
    { name: 'رصد خبر', text: 'منابعت، فیلترشده روی کلیدواژه‌هایی که برات مهمه.' },
    { name: 'خوانش هم‌ترازها', text: 'پیج‌هایی که تحسینشان می‌کنی؛ فقط خوانده می‌شوند، هرگز چیزی برایشان فرستاده نمی‌شود.' },
  ],

  approach: {
    eyebrow: 'طرز فکرش',
    title: 'کارِ سنگین با هوش مصنوعی. قضاوت، وام‌گرفته از آدم‌هایی که این کار را بلدند.',
    lead: 'دیوچه از هیچ نمی‌نویسد و امیدوار نمی‌ماند. این‌که چه می‌گذارد، چطور می‌گوید و کِی می‌فرستد، از الگوهای پیج‌های واقعی‌ای می‌آید که همین‌طور رشد کرده‌اند. هوش مصنوعی منابع را می‌خواند، پیش‌نویس را می‌نویسد و ریلز را تدوین می‌کند — اما استراتژی‌ات را تنهایی تعیین نمی‌کند.',
  },

  quote: 'ساعتی چهل منبع می‌خواند و سی‌وهشت خبری را که مالِ تو نیست دور می‌ریزد.',

  reliability: {
    eyebrow: 'قابل‌اتکا بودن',
    title: 'ساخته شده که بی‌سروصدا شکست بخورد',
    lead: 'بیشتر کاری که دیوچه می‌کند وقتی اتفاق می‌افتد که کسی حواسش نیست. پس سوال جالب این است که وقتی چیزی خراب می‌شود چه می‌کند.',
    items: [
      {
        title: 'هر اکانت، جدا از بقیه',
        text: 'خراب شدن یک اکانت هیچ‌وقت به بقیه نمی‌رسد. این یک قاعده‌ی معماری است، نه یک تنظیم.',
      },
      {
        title: 'هرگز دوبار پست نمی‌کند',
        text: 'هر مطلب، پیش از ساخته شدن، با هرچه آن اکانت قبلاً منتشر کرده مقایسه می‌شود.',
      },
      {
        title: 'دروازه‌ی بازبینی، اختیاری',
        text: 'روشنش کن تا تا وقتی خودت ندیده‌ای چیزی به اینستاگرام نرسد.',
      },
    ],
  },

  faq: {
    eyebrow: 'سوال‌های پرتکرار',
    title: 'چند تا سوال',
    lead: 'هرچه اینجا نیست را در دمو بپرس.',
    items: [
      {
        q: 'یک «اکانت» یعنی چه؟',
        a: 'یک اکانت اینستاگرامِ متصل، با منابع، کلیدواژه‌ها، لحن و زمان‌بندی خودش. اکانت‌ها هیچ‌چیزی با هم به اشتراک نمی‌گذارند.',
      },
      {
        q: 'برای خواندن پیجم به چه چیزی نیاز دارید؟',
        a: 'فقط آیدی، و هیچ چیز دیگر. هرچه در آن مرحله خوانده می‌شود همان است که هر بازدیدکننده‌ی پروفایلت می‌بیند. برای اثبات این‌که پیج مال توست یک کد کوتاه در اینستاگرام برای ما می‌فرستی — هیچ رمزی در این ماجرا نیست، و تا خودت نخواهی هیچ‌چیز وصل نمی‌شود.',
      },
      {
        q: 'به چه زبانی پست می‌گذارد؟',
        a: 'هر زبانی که برای آن اکانت تعیین کنی. مطالب پیش از نوشته شدن کپشن ترجمه می‌شوند، و چیدمان از جهت همان زبان پیروی می‌کند.',
      },
      {
        q: 'دوره‌ی آزمایشی دارد؟',
        a: 'بله. خودِ خوانش رایگان است و جز یک آیدی چیزی نمی‌خواهد. اگر خواستی دیوچه روی آنچه پیدا کرده کاری هم بکند، دوره‌ی آزمایشی بعدش هم رایگان است — طول آن هنگام دعوت مشخص می‌شود.',
      },
      {
        q: 'اینجا «مبتنی بر هوش مصنوعی» دقیقاً یعنی چه؟',
        a: 'هوش مصنوعی کارِ سنگین را می‌کند: منابع را می‌خواند، پیش‌نویس را می‌نویسد، ریلز را تدوین می‌کند. اما این‌که چه منتشر شود و چطور گفته شود، از الگوهای پیج‌های واقعی‌ای می‌آید که همین‌طور رشد کرده‌اند، نه از حدسِ تنهای یک مدل.',
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
          { label: 'راهنماها' },
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
      'Diwche führt einen Instagram-Account nach dem anderen — liest deine Quellen, schreibt und gestaltet den Beitrag und veröffentlicht ihn pünktlich, ausgerichtet an dem, was bei Profilen wie deinem funktioniert hat.',
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
    titleBefore: 'Manche Seiten haben einen ',
    titleAccent: 'Diw',
    titleAfter: '.',
    lead: 'Er liest, was du gemacht hast, und worauf dein Publikum reagiert hat. Er merkt es sich. Jeden Morgen bringt er Themen, die zu dir gehören und nicht zu allen — dann schreibt, dreht, betextet und plant er, während jedes Wort und jedes Bild deins bleibt.',
    cta: 'Meine Seite lesen',
    ctaOff: 'Sieh, was er tun würde',
  },

  trustBar: {
    label: 'Du meldest dich an über',
    note: 'Dein Konto wird über Metas eigenen Login verbunden — hier wird nie ein Passwort eingegeben, und nichts wird veröffentlicht, bevor du verbindest.',
    promise: 'Wir können deine Direktnachrichten nicht lesen — wir fragen nie nach dieser Berechtigung. Und wir speichern deine Kommentare nicht.',
  },

  pilot: {
    eyebrow: 'Was es kostet, es herauszufinden',
    title: 'Er liest deine Seite, bevor du ihm irgendetwas zahlst.',
    lead: 'Gib ihm einen Profilnamen. Er liest, was öffentlich ist, sagt dir, was er gefunden hat, und bietet dir eine kostenlose Testphase an, wenn er etwas damit tun soll. Zwei Wege hinein.',
    paths: [
      {
        title: 'Ich poste schon',
        text: 'Er liest den Account zuerst und sagt dir, was er gefunden hat. Wenn du ihn danach darauf ansetzen willst, ist die Testphase kostenlos — und nichts wird verbunden, bevor du es sagst.',
      },
      {
        title: 'Noch nicht angefangen',
        text: 'Du hast ein Thema und noch keine Seite. Er arbeitet heraus, welche Blickwinkel es tragen, und hilft dir, den Account selbst aufzubauen — Auftritt, Quellen, Ton. Der Anfang ist ebenfalls kostenlos.',
      },
    ],
  },

  pillars: [
    {
      eyebrow: '01 — Finde dein nächstes großes Thema',
      title: 'Ideen, die es wert sind, ohne stundenlange Recherche.',
      lead: 'Gib ein Themenfeld ein, den Rest übernimmt Diwche. Er durchsucht deine Quellen, beobachtet Profile, die du schätzt, und liefert passende Vorschläge samt klarer Regeln, worüber du posten solltest — und worüber nicht. Wenn dir die Vorschläge nicht gefallen, sitzt du nie fest: füg den Link zu einem Artikel ein, der dir gefällt, oder lenk die Recherche jederzeit in eine andere Richtung.',
    },
    {
      eyebrow: '02 — Mach daraus, was du willst',
      title: 'Aus jedem Thema ein fertiger Beitrag, Karussell oder Reel.',
      lead: 'Nimm ein Thema, das Diwche gefunden hat, zieh etwas aus deinen Quellen, oder fang mit deinem eigenen Text bei null an. Diwche schreibt und gestaltet einzelne Beiträge, Karussells, Reels und Stories — alle im Ton und im Look, den du für diesen Account festgelegt hast.',
    },
    {
      eyebrow: '03 — Veröffentlichen und planen',
      title: 'Einmal verbinden, um die Uhrzeit kümmert sich Diwche.',
      lead: 'Verbinde dein Instagram sicher über Facebook, ohne irgendwo ein Token einzufügen. Veröffentliche sofort oder plane für die Zeiten mit der besten Resonanz; Diwche hält die Verbindung im Hintergrund am Leben, damit deine Warteschlange nicht irgendwann stillsteht.',
    },
  ],

  capabilities: [
    { name: 'Ideen', text: 'Jeden Morgen frische Themen, jedes mit einem Aufhänger und einem Grund, warum es heute zählt.' },
    { name: 'Auswertung', text: 'Was tatsächlich funktioniert hat — nach Quelle, Figur, Format und Uhrzeit.' },
    { name: 'Quellenscan', text: 'Deine Quellen, gefiltert auf die Stichworte, die dich interessieren.' },
    { name: 'Blick auf andere', text: 'Die Profile, die du schätzt: nur gelesen, nie beschrieben.' },
  ],

  approach: {
    eyebrow: 'Wie er denkt',
    title: 'Die Arbeit macht die KI. Das Urteil ist von Leuten geliehen, die das schon können.',
    lead: 'Diwche schreibt nicht aus dem Nichts und hofft. Was er veröffentlicht, wie er es sagt und wann er es schickt, folgt Mustern aus echten Profilen, die genau so gewachsen sind. Die KI liest die Quellen, schreibt den Entwurf und schneidet das Reel — deine Strategie bestimmt sie nicht allein.',
  },

  quote: 'Er liest vierzig Quellen pro Stunde und wirft die achtunddreißig Meldungen weg, die nicht deine sind.',

  reliability: {
    eyebrow: 'Verlässlichkeit',
    title: 'Gebaut, um sicher zu scheitern',
    lead: 'Das meiste von dem, was Diwche tut, passiert, während niemand zusieht. Die interessante Frage ist also, was er tut, wenn etwas schiefgeht.',
    items: [
      {
        title: 'Jeder Account für sich',
        text: 'Wenn ein Account ausfällt, berührt das die anderen nie. Das ist eine Regel der Architektur, keine Einstellung.',
      },
      {
        title: 'Er postet nie zweimal',
        text: 'Jeder Beitrag wird gegen alles geprüft, was dieser Account schon veröffentlicht hat, bevor überhaupt etwas gebaut wird.',
      },
      {
        title: 'Freigabe, wenn du willst',
        text: 'Schalt sie ein, und nichts erreicht Instagram, bevor du es gesehen hast.',
      },
    ],
  },

  faq: {
    eyebrow: 'Fragen',
    title: 'Ein paar Fragen',
    lead: 'Was hier fehlt, frag beim Termin.',
    items: [
      {
        q: 'Was zählt als Account?',
        a: 'Ein verbundener Instagram-Account mit eigenen Quellen, Stichworten, eigenem Ton und eigener Planung. Accounts teilen nichts miteinander.',
      },
      {
        q: 'Was braucht ihr, um meine Seite zu lesen?',
        a: 'Den Profilnamen, sonst nichts. Alles, was dabei gelesen wird, sieht jeder, der dein Profil aufruft. Um zu belegen, dass die Seite dir gehört, schickst du uns einen kurzen Code auf Instagram — ein Passwort kommt darin nirgends vor, und nichts wird verbunden, bevor du es willst.',
      },
      {
        q: 'In welcher Sprache postet er?',
        a: 'In der, die du pro Account festlegst. Beiträge werden übersetzt, bevor die Bildunterschrift entsteht, und das Layout folgt der Leserichtung dieser Sprache.',
      },
      {
        q: 'Gibt es eine Testphase?',
        a: 'Ja. Die Analyse selbst ist kostenlos und braucht nichts außer einem Profilnamen. Wenn Diwche danach mit dem Gefundenen arbeiten soll, ist auch die Testphase kostenlos — ihre Länge wird bei der Einladung festgelegt.',
      },
      {
        q: 'Was heißt „KI-gestützt“ hier eigentlich?',
        a: 'Die KI macht die Arbeit: Quellen lesen, Entwurf schreiben, Reel schneiden. Was veröffentlicht wird und wie es klingt, folgt Mustern aus echten Profilen, die so gewachsen sind — nicht dem Raten eines Modells.',
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
          { label: 'Anleitungen' },
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
