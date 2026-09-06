/**
 * The privacy policy, in three languages.
 *
 * This is a real document with a real job: Meta's dashboard requires a privacy
 * policy URL before an app can be submitted for review, and this is that URL.
 * It is also the thing a stranger reads before deciding whether to hand over
 * an address, so it is written to be understood rather than to be survived.
 *
 * **It is a careful draft, not legal advice.** Somebody qualified should read
 * it before it is relied on, particularly the retention periods, which are
 * chosen to match what the code actually does rather than what is customary.
 *
 * Every claim in here is checked against the code:
 *
 * - the public read stores what `V60__public_audit.sql` stores
 * - the cache period is `public.cache-hours`, seven days
 * - consents store what `V62__public_consent.sql` stores
 * - the model sees computed facts only, never the raw page (`AuditNarrator`)
 * - nothing is posted to anyone's Instagram without a connected account
 *
 * If one of those changes, this changes with it. A policy that describes a
 * system that no longer exists is worse than none, because it is a promise
 * being quietly broken.
 */

export interface LegalSection {
  title: string;
  /** Paragraphs. Rendered in order, no markup inside. */
  body: string[];
  /** Optional bullet list under the paragraphs. */
  points?: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  lead: string;
  sections: LegalSection[];
}

/** Bumped whenever the text changes, and shown at the top of the page. */
export const PRIVACY_UPDATED = '2026-09-06';
/** The terms have their own date; they change on a different rhythm. */
export const TERMS_UPDATED = '2026-09-06';

const CONTACT = 'support@diwche.com';

export const PRIVACY: Record<string, LegalDoc> = {
  en: {
    title: 'Privacy',
    updated: PRIVACY_UPDATED,
    lead: 'Diwche runs Instagram accounts on their owners’ behalf. This describes exactly what we hold, why, and how to make us delete it. It is written to be read.',
    sections: [
      {
        title: 'Who we are',
        body: [
          `Diwche is operated by Helabyte. Write to ${CONTACT} about anything on this page and a person will answer.`,
        ],
      },
      {
        title: 'The free read on this site',
        body: [
          'If you give us an Instagram handle, we ask Instagram’s own Business Discovery API for what your profile already shows publicly: your follower count, your post count, your biography, your profile picture, and for recent posts the caption, the type, the time and the number of likes and comments.',
          'We never see, ask for or store your Instagram password. We cannot read your private messages, your private posts, or anything a visitor to your profile could not see. Nothing is posted to your account.',
        ],
        points: [
          'The reading is kept for seven days so that asking twice does not cost a second look, then it is recomputed on the next request.',
          'The figures we show are calculated by us from that data. A language model is used only to phrase sentences we have already computed, and is never given your page.',
        ],
      },
      {
        title: 'If you leave your email address',
        body: [
          'We store the address, the answers you gave in the questionnaire, the handle you entered, and the time. We use it to send you the read and one offer. We do not sell it, rent it, or pass it to anyone for their own marketing.',
        ],
        points: [
          'Kept until you ask us to delete it, or for two years after your last contact with us, whichever comes first.',
          'Every email we send has a reply address that a person reads.',
        ],
      },
      {
        title: 'If you agree to be added as a tester',
        body: [
          'Diwche has not yet completed Meta’s App Review, so until it has, only people we name in our Meta app can connect an Instagram account. If you agree to that, we record your email, your handle, the exact wording you agreed to, the time, your IP address and your browser’s user agent — because a consent that cannot be shown later is not worth having.',
          'You accept or refuse the invitation inside your own Instagram settings, and you can withdraw it there at any time without telling us.',
        ],
      },
      {
        title: 'What we ask Instagram for, and nothing more',
        body: [
          'When you connect an account, the permission screen lists exactly what we use: reading your profile and posts, publishing on your behalf, and replying to comments and direct messages. We ask for nothing beyond that, and Meta shows you the full list before you agree.',
          'Comments and messages are not stored. When someone comments on your post or writes to you and you have turned auto-reply on, Meta notifies us, we answer, and we keep only the comment’s or message’s ID so that the same one is never answered twice. The text itself is not written anywhere.',
        ],
      },
      {
        title: 'Technical data',
        body: [
          'Our server logs the IP address of requests to the free read, in order to rate-limit it and to stop one visitor exhausting the day’s allowance for everyone. Cloudflare Turnstile is used to tell a person from a script; it sets no advertising cookies and does not track you across sites.',
          'This site sets no analytics cookies and no advertising cookies. The only thing stored in your browser is your progress through the questionnaire and your choice of light or dark theme, both of which stay on your device.',
        ],
      },
      {
        title: 'Who else touches your data',
        body: ['Only these, and only for the job named:'],
        points: [
          'Meta (Instagram Graph API) — reading public profile data, and publishing on your behalf once you connect an account.',
          'Brevo — sending the emails you asked for.',
          'Cloudflare — serving this site and telling people from scripts.',
          'Google (Gemini) — phrasing sentences from figures we have already calculated.',
          'Our own servers, which are in Europe.',
        ],
      },
      {
        title: 'Deleting your data',
        body: [
          `Write to ${CONTACT} from the address you gave us, or with the Instagram handle you entered, and we will delete everything we hold about you and confirm when it is done. You do not have to give a reason.`,
          'Disconnecting Diwche from your Instagram account, or removing yourself as a tester, stops all access immediately from Meta’s side.',
        ],
      },
      {
        title: 'Your rights',
        body: [
          `If you are in the EU or the UK, you can ask us for a copy of what we hold, ask us to correct it, ask us to delete it, or object to our using it. Write to ${CONTACT}. We answer within thirty days, usually much sooner.`,
        ],
      },
      {
        title: 'Changes',
        body: [
          'When this changes, the date at the top changes. If a change materially affects what we do with data we already hold, we email the people it affects rather than quietly editing the page.',
        ],
      },
    ],
  },

  fa: {
    title: 'حریم خصوصی',
    updated: PRIVACY_UPDATED,
    lead: 'دیوچه پیج اینستاگرام را از طرف صاحبش می‌گرداند. اینجا دقیقاً نوشته‌ایم چه چیزی نگه می‌داریم، چرا، و چطور می‌توانی بخواهی پاکش کنیم. نوشته شده که خوانده شود.',
    sections: [
      {
        title: 'ما کی هستیم',
        body: [
          `دیوچه توسط Helabyte اداره می‌شود. درباره‌ی هر چیزی در این صفحه به ${CONTACT} بنویس؛ یک آدم جوابت را می‌دهد.`,
        ],
      },
      {
        title: 'خوانش رایگان در این سایت',
        body: [
          'اگر آیدی اینستاگرامت را بدهی، از API رسمی Business Discovery اینستاگرام همان چیزی را می‌پرسیم که پروفایلت همین حالا عمومی نشان می‌دهد: تعداد دنبال‌کننده، تعداد پست، بیو، عکس پروفایل، و برای پست‌های اخیر متن کپشن، نوع پست، زمان و تعداد لایک و کامنت.',
          'رمز اینستاگرامت را نه می‌بینیم، نه می‌خواهیم و نه ذخیره می‌کنیم. به دایرکت‌ها، پست‌های خصوصی یا هر چیزی که یک بازدیدکننده‌ی معمولی پروفایلت نمی‌بیند دسترسی نداریم. هیچ‌چیز روی اکانتت منتشر نمی‌شود.',
        ],
        points: [
          'نتیجه‌ی خوانش هفت روز نگه داشته می‌شود تا پرسیدن دوباره هزینه‌ی یک خوانش تازه نداشته باشد، و بعد از آن دوباره محاسبه می‌شود.',
          'عددهایی که نشان می‌دهیم را خودمان از همان داده حساب می‌کنیم. از مدل زبانی فقط برای جمله‌بندی چیزی استفاده می‌شود که قبلاً حساب شده، و صفحه‌ی تو هرگز به آن داده نمی‌شود.',
        ],
      },
      {
        title: 'اگر ایمیلت را بگذاری',
        body: [
          'آدرس ایمیل، پاسخ‌هایی که در پرسش‌نامه داده‌ای، آیدی‌ای که وارد کرده‌ای و زمان را ذخیره می‌کنیم. از آن برای فرستادن نتیجه‌ی خوانش و یک پیشنهاد استفاده می‌کنیم. آن را نمی‌فروشیم، اجاره نمی‌دهیم و به کسی برای تبلیغات خودش نمی‌دهیم.',
        ],
        points: [
          'تا وقتی خودت بخواهی پاک شود نگه داشته می‌شود، یا دو سال بعد از آخرین تماست با ما — هرکدام زودتر رسید.',
          'هر ایمیلی که می‌فرستیم یک آدرس پاسخ دارد که یک آدم آن را می‌خواند.',
        ],
      },
      {
        title: 'اگر بپذیری به‌عنوان تستر اضافه شوی',
        body: [
          'دیوچه هنوز بررسی رسمی متا را نگذرانده، پس تا آن زمان فقط کسانی که در اپلیکیشن متای ما نامشان ثبت شده می‌توانند اکانت اینستاگرام وصل کنند. اگر با این کار موافقت کنی، ایمیل، آیدی، متن دقیقی که با آن موافقت کرده‌ای، زمان، آدرس IP و مشخصات مرورگرت را ثبت می‌کنیم — چون رضایتی که بعداً نشود نشانش داد، ارزشی ندارد.',
          'پذیرفتن یا نپذیرفتن دعوت‌نامه در تنظیمات خودِ اینستاگرام تو انجام می‌شود، و هر وقت بخواهی می‌توانی همان‌جا پسش بگیری، بدون این‌که به ما خبر بدهی.',
        ],
      },
      {
        title: 'چیزهایی که از اینستاگرام می‌خواهیم، و نه بیشتر',
        body: [
          'وقتی اکانتت را وصل می‌کنی، صفحه‌ی مجوزها دقیقاً همان چیزهایی را نشان می‌دهد که استفاده می‌کنیم: خواندن پروفایل و پست‌هایت، انتشار از طرف تو، و پاسخ به کامنت‌ها و دایرکت‌ها. چیزی فراتر از این نمی‌خواهیم و متا فهرست کامل را پیش از تأیید به تو نشان می‌دهد.',
          'کامنت‌ها و دایرکت‌ها ذخیره نمی‌شوند. وقتی کسی زیر پستت کامنت می‌گذارد یا برایت پیام می‌فرستد و تو پاسخ خودکار را روشن کرده باشی، متا به ما خبر می‌دهد، ما جواب می‌دهیم، و فقط شناسه‌ی کامنت یا پیام را نگه می‌داریم تا یکی دو بار جواب نگیرد. خودِ متن هیچ‌جا نوشته نمی‌شود.',
        ],
      },
      {
        title: 'داده‌های فنی',
        body: [
          'سرور ما آدرس IP درخواست‌های خوانش رایگان را ثبت می‌کند تا بتواند تعداد درخواست‌ها را محدود کند و جلوی این را بگیرد که یک نفر سهم کل روز را تمام کند. از Cloudflare Turnstile برای تشخیص آدم از ربات استفاده می‌شود؛ این ابزار کوکی تبلیغاتی نمی‌گذارد و تو را بین سایت‌ها دنبال نمی‌کند.',
          'این سایت هیچ کوکی تحلیلی و هیچ کوکی تبلیغاتی نمی‌گذارد. تنها چیزی که در مرورگرت ذخیره می‌شود پیشرفتت در پرسش‌نامه و انتخاب تم روشن یا تاریک است، و هر دو روی دستگاه خودت می‌مانند.',
        ],
      },
      {
        title: 'چه کسان دیگری با داده‌ات سروکار دارند',
        body: ['فقط این‌ها، و فقط برای همان کاری که نوشته شده:'],
        points: [
          'متا (Instagram Graph API) — خواندن اطلاعات عمومی پروفایل، و انتشار از طرف تو بعد از این‌که خودت اکانت را وصل کردی.',
          'Brevo — فرستادن ایمیل‌هایی که خواسته‌ای.',
          'Cloudflare — سرو کردن این سایت و تشخیص آدم از ربات.',
          'گوگل (Gemini) — جمله‌بندی چیزی که قبلاً حساب شده.',
          'سرورهای خودمان، که در اروپا هستند.',
        ],
      },
      {
        title: 'پاک کردن داده‌ات',
        body: [
          `از همان آدرسی که به ما داده‌ای، یا با همان آیدی‌ای که وارد کرده‌ای، به ${CONTACT} بنویس تا هرچه از تو داریم پاک کنیم و بعدش تأییدش را بفرستیم. لازم نیست دلیلی بیاوری.`,
          'قطع کردن دسترسی دیوچه از اینستاگرامت، یا برداشتن خودت از فهرست تسترها، دسترسی را همان لحظه از سمت متا می‌بندد.',
        ],
      },
      {
        title: 'حقوق تو',
        body: [
          `اگر در اتحادیه اروپا یا بریتانیا هستی، می‌توانی نسخه‌ای از آنچه داریم بخواهی، بخواهی اصلاحش کنیم، بخواهی پاکش کنیم، یا به استفاده‌ی ما از آن اعتراض کنی. به ${CONTACT} بنویس. ظرف سی روز جواب می‌دهیم، معمولاً خیلی زودتر.`,
        ],
      },
      {
        title: 'تغییرات',
        body: [
          'با هر تغییر، تاریخ بالای صفحه هم عوض می‌شود. اگر تغییری واقعاً روی کاری که با داده‌های موجود می‌کنیم اثر بگذارد، به کسانی که تحت تأثیرند ایمیل می‌زنیم، نه این‌که بی‌صدا صفحه را ویرایش کنیم.',
        ],
      },
    ],
  },

  de: {
    title: 'Datenschutz',
    updated: PRIVACY_UPDATED,
    lead: 'Diwche führt Instagram-Accounts im Auftrag ihrer Inhaber. Hier steht genau, was wir speichern, warum, und wie du uns dazu bringst, es zu löschen. Geschrieben zum Lesen, nicht zum Überstehen.',
    sections: [
      {
        title: 'Wer wir sind',
        body: [
          `Diwche wird von Helabyte betrieben. Schreib zu allem auf dieser Seite an ${CONTACT} — es antwortet ein Mensch.`,
        ],
      },
      {
        title: 'Die kostenlose Analyse auf dieser Seite',
        body: [
          'Wenn du uns einen Instagram-Profilnamen gibst, fragen wir bei Metas eigener Business-Discovery-API genau das ab, was dein Profil ohnehin öffentlich zeigt: Follower-Zahl, Anzahl der Beiträge, Biografie, Profilbild und für die letzten Beiträge Bildunterschrift, Typ, Zeitpunkt sowie Anzahl der Likes und Kommentare.',
          'Wir sehen dein Instagram-Passwort nie, fragen nicht danach und speichern es nicht. Wir können weder deine Direktnachrichten noch private Beiträge lesen, noch irgendetwas, das ein Besucher deines Profils nicht auch sähe. Auf deinem Konto wird nichts veröffentlicht.',
        ],
        points: [
          'Die Auswertung wird sieben Tage aufbewahrt, damit eine zweite Anfrage keinen zweiten Abruf kostet; danach wird sie neu berechnet.',
          'Die gezeigten Zahlen berechnen wir selbst aus diesen Daten. Ein Sprachmodell formuliert lediglich Sätze zu bereits berechneten Werten und bekommt deine Seite nie zu sehen.',
        ],
      },
      {
        title: 'Wenn du deine E-Mail-Adresse hinterlässt',
        body: [
          'Wir speichern die Adresse, deine Antworten aus dem Fragebogen, den eingegebenen Profilnamen und den Zeitpunkt. Wir nutzen das, um dir die Auswertung und ein Angebot zu schicken. Wir verkaufen, vermieten oder verleihen die Adresse nicht für fremde Werbung.',
        ],
        points: [
          'Aufbewahrt, bis du die Löschung verlangst, oder zwei Jahre nach deinem letzten Kontakt mit uns — je nachdem, was früher eintritt.',
          'Jede E-Mail von uns hat eine Antwortadresse, die ein Mensch liest.',
        ],
      },
      {
        title: 'Wenn du zustimmst, als Tester hinzugefügt zu werden',
        body: [
          'Diwche hat Metas App Review noch nicht durchlaufen. Bis dahin können nur namentlich in unserer Meta-App eingetragene Personen ein Instagram-Konto verbinden. Wenn du dem zustimmst, halten wir fest: E-Mail-Adresse, Profilname, den genauen Wortlaut, dem du zugestimmt hast, den Zeitpunkt, deine IP-Adresse und die Kennung deines Browsers — denn eine Einwilligung, die sich später nicht belegen lässt, ist keine.',
          'Annehmen oder Ablehnen passiert in deinen eigenen Instagram-Einstellungen, und du kannst es dort jederzeit zurückziehen, ohne uns Bescheid zu geben.',
        ],
      },
      {
        title: 'Worum wir Instagram bitten – und um nichts mehr',
        body: [
          'Wenn du ein Konto verbindest, zeigt der Berechtigungsbildschirm genau das, was wir nutzen: dein Profil und deine Beiträge lesen, in deinem Namen veröffentlichen, auf Kommentare und Direktnachrichten antworten. Mehr fordern wir nicht an, und Meta zeigt dir die vollständige Liste, bevor du zustimmst.',
          'Kommentare und Nachrichten werden nicht gespeichert. Kommentiert jemand deinen Beitrag oder schreibt dir und du hast die automatische Antwort eingeschaltet, benachrichtigt uns Meta, wir antworten und behalten nur die ID des Kommentars oder der Nachricht, damit nichts zweimal beantwortet wird. Der Text selbst wird nirgends abgelegt.',
        ],
      },
      {
        title: 'Technische Daten',
        body: [
          'Unser Server protokolliert die IP-Adresse von Anfragen an die kostenlose Analyse, um sie zu begrenzen und zu verhindern, dass eine einzelne Person das Tageskontingent für alle aufbraucht. Cloudflare Turnstile unterscheidet Menschen von Skripten; es setzt keine Werbe-Cookies und verfolgt dich nicht über Websites hinweg.',
          'Diese Seite setzt keine Analyse- und keine Werbe-Cookies. Im Browser gespeichert wird nur dein Fortschritt im Fragebogen und deine Wahl zwischen hellem und dunklem Design — beides bleibt auf deinem Gerät.',
        ],
      },
      {
        title: 'Wer sonst mit deinen Daten zu tun hat',
        body: ['Nur diese, und nur für den genannten Zweck:'],
        points: [
          'Meta (Instagram Graph API) — Lesen öffentlicher Profildaten und, sobald du ein Konto verbindest, Veröffentlichen in deinem Namen.',
          'Brevo — Versand der E-Mails, um die du gebeten hast.',
          'Cloudflare — Ausliefern dieser Seite und Unterscheiden von Menschen und Skripten.',
          'Google (Gemini) — Formulieren von Sätzen aus bereits berechneten Zahlen.',
          'Unsere eigenen Server, die in Europa stehen.',
        ],
      },
      {
        title: 'Daten löschen',
        body: [
          `Schreib von der Adresse, die du uns gegeben hast, oder mit dem eingegebenen Profilnamen an ${CONTACT}. Wir löschen alles, was wir über dich haben, und bestätigen es. Eine Begründung brauchst du nicht.`,
          'Wenn du Diwche in Instagram trennst oder dich als Tester entfernst, endet der Zugriff sofort auf Metas Seite.',
        ],
      },
      {
        title: 'Deine Rechte',
        body: [
          `In der EU und im Vereinigten Königreich kannst du eine Kopie deiner Daten verlangen, sie berichtigen oder löschen lassen oder der Nutzung widersprechen. Schreib an ${CONTACT}. Wir antworten binnen dreißig Tagen, meist deutlich schneller.`,
        ],
      },
      {
        title: 'Änderungen',
        body: [
          'Ändert sich dieser Text, ändert sich das Datum oben. Betrifft eine Änderung wesentlich, was wir mit bereits vorhandenen Daten tun, schreiben wir den Betroffenen — statt die Seite still zu überarbeiten.',
        ],
      },
    ],
  },
};

/**
 * Terms of service, in three languages. Same caveat as the privacy policy:
 * a careful draft written to match what the software does, not legal advice.
 */
export const TERMS: Record<string, LegalDoc> = {
  en: {
    title: 'Terms',
    updated: TERMS_UPDATED,
    lead: 'What you agree to when you use Diwche, in plain words.',
    sections: [
      {
        title: 'What Diwche is',
        body: [
          'Diwche is a publishing assistant for Instagram professional accounts, operated by Helabyte. It reads news sources you choose, prepares posts and short videos, publishes them to your account on the schedule you set, and can answer comments in a tone you pick.',
        ],
      },
      {
        title: 'Your account',
        body: [
          'You need an Instagram professional account (business or creator) that you are allowed to manage. Connecting it happens through Meta’s own login screen; you can revoke the connection in your Instagram settings at any time, and everything stops that instant.',
          'You are responsible for what is published on your account. Diwche drafts; you set the schedule and the rules. Check the first few posts before you let it run.',
        ],
      },
      {
        title: 'What we will not do',
        body: [
          'We do not ask for or store your Instagram password. We do not store your comments or direct messages; we answer them and keep only an ID so nothing is answered twice. We do not post anything outside the schedule and rules you set, and we do not use your account for anyone else.',
        ],
      },
      {
        title: 'Content',
        body: [
          'Posts are built from public news sources and from material you upload. You keep the rights to what you upload; you give us permission to process it only for the job you asked for. Make sure you may use what you upload. If a source or rights holder objects to something we published for you, we will take it down when you or they tell us.',
        ],
      },
      {
        title: 'Availability and limits',
        body: [
          'Instagram and Meta change their platform without notice. When they do, a feature may pause until we adapt. We run the service carefully but promise no uptime, no reach, and no follower numbers; the outcome of a post is Instagram’s to decide.',
          'To the extent the law allows, our liability is limited to what you paid us in the three months before the problem. Nothing here limits liability for intent, gross negligence, or harm to life and health.',
        ],
      },
      {
        title: 'Ending',
        body: [
          'You can stop at any time by disconnecting your account or writing to us; we delete what we hold as described in the privacy policy. We can end the service for an account that breaks Instagram’s rules or these terms, and will say why.',
        ],
      },
      {
        title: 'Changes and contact',
        body: [
          `When these terms change, the date at the top changes, and people with a connected account are told by email before it takes effect. Write to ${CONTACT} about anything on this page.`,
        ],
      },
    ],
  },

  fa: {
    title: 'شرایط استفاده',
    updated: TERMS_UPDATED,
    lead: 'وقتی از دیوچه استفاده می‌کنی با چه چیزی موافقت کرده‌ای — به زبان ساده.',
    sections: [
      {
        title: 'دیوچه چیست',
        body: [
          'دیوچه دستیار انتشار برای پیج‌های حرفه‌ای اینستاگرام است و توسط Helabyte اداره می‌شود. منابع خبری‌ای را که خودت انتخاب می‌کنی می‌خواند، پست و ویدیوی کوتاه آماده می‌کند، طبق زمان‌بندی تو روی پیجت منتشر می‌کند، و می‌تواند با لحنی که انتخاب می‌کنی به کامنت‌ها جواب بدهد.',
        ],
      },
      {
        title: 'اکانت تو',
        body: [
          'به یک اکانت حرفه‌ای اینستاگرام (بیزینس یا کریِیتور) نیاز داری که اجازه‌ی مدیریتش را داری. وصل کردنش از طریق صفحه‌ی ورود خودِ متا انجام می‌شود؛ هر وقت بخواهی می‌توانی در تنظیمات اینستاگرامت دسترسی را قطع کنی و همان لحظه همه‌چیز متوقف می‌شود.',
          'مسئولیت چیزی که روی پیجت منتشر می‌شود با توست. دیوچه پیش‌نویس می‌کند؛ زمان‌بندی و قواعد را تو تعیین می‌کنی. چند پست اول را قبل از این‌که رهایش کنی بررسی کن.',
        ],
      },
      {
        title: 'کارهایی که نمی‌کنیم',
        body: [
          'رمز اینستاگرامت را نه می‌خواهیم و نه ذخیره می‌کنیم. کامنت‌ها و دایرکت‌هایت را ذخیره نمی‌کنیم؛ جوابشان را می‌دهیم و فقط یک شناسه نگه می‌داریم تا چیزی دو بار جواب نگیرد. خارج از زمان‌بندی و قواعدی که تعیین کرده‌ای چیزی منتشر نمی‌کنیم و از اکانتت برای کس دیگری استفاده نمی‌کنیم.',
        ],
      },
      {
        title: 'محتوا',
        body: [
          'پست‌ها از منابع خبری عمومی و از چیزهایی که خودت آپلود می‌کنی ساخته می‌شوند. حقوق آنچه آپلود می‌کنی برای خودت می‌ماند؛ به ما فقط برای همان کاری که خواسته‌ای اجازه‌ی پردازشش را می‌دهی. مطمئن شو اجازه‌ی استفاده از آنچه آپلود می‌کنی را داری. اگر منبع یا صاحب حقی به چیزی که برایت منتشر کرده‌ایم اعتراض کند، به محض اطلاع تو یا او برش می‌داریم.',
        ],
      },
      {
        title: 'در دسترس بودن و محدودیت‌ها',
        body: [
          'اینستاگرام و متا پلتفرمشان را بدون اطلاع قبلی تغییر می‌دهند. وقتی این اتفاق بیفتد ممکن است یک قابلیت تا وقتی خودمان را وفق بدهیم متوقف شود. سرویس را با دقت اداره می‌کنیم اما هیچ تضمینی برای در دسترس بودن، ریچ یا تعداد فالوور نمی‌دهیم؛ نتیجه‌ی یک پست را اینستاگرام تعیین می‌کند.',
          'تا جایی که قانون اجازه می‌دهد، مسئولیت ما محدود به مبلغی است که در سه ماه پیش از بروز مشکل به ما پرداخته‌ای. هیچ‌چیز در اینجا مسئولیت ناشی از عمد، قصور فاحش یا آسیب به جان و سلامت را محدود نمی‌کند.',
        ],
      },
      {
        title: 'پایان دادن',
        body: [
          'هر وقت بخواهی می‌توانی با قطع کردن اکانت یا نوشتن به ما متوقفش کنی؛ آنچه داریم را طبق سیاست حریم خصوصی پاک می‌کنیم. ما هم می‌توانیم سرویس اکانتی را که قواعد اینستاگرام یا این شرایط را زیر پا می‌گذارد پایان دهیم، و دلیلش را می‌گوییم.',
        ],
      },
      {
        title: 'تغییرات و تماس',
        body: [
          `با هر تغییر در این شرایط، تاریخ بالای صفحه عوض می‌شود و به کسانی که اکانت وصل‌شده دارند پیش از اجرا ایمیل می‌زنیم. درباره‌ی هر چیزی در این صفحه به ${CONTACT} بنویس.`,
        ],
      },
    ],
  },

  de: {
    title: 'AGB',
    updated: TERMS_UPDATED,
    lead: 'Was du akzeptierst, wenn du Diwche nutzt — in klaren Worten.',
    sections: [
      {
        title: 'Was Diwche ist',
        body: [
          'Diwche ist ein Veröffentlichungsassistent für professionelle Instagram-Konten, betrieben von Helabyte. Er liest Nachrichtenquellen, die du auswählst, bereitet Beiträge und kurze Videos vor, veröffentlicht sie nach deinem Zeitplan auf deinem Konto und kann Kommentare in einem Ton beantworten, den du festlegst.',
        ],
      },
      {
        title: 'Dein Konto',
        body: [
          'Du brauchst ein professionelles Instagram-Konto (Business oder Creator), das du verwalten darfst. Die Verbindung läuft über Metas eigenen Anmeldebildschirm; du kannst sie jederzeit in deinen Instagram-Einstellungen widerrufen, und alles stoppt in diesem Moment.',
          'Für das, was auf deinem Konto erscheint, bist du verantwortlich. Diwche entwirft; Zeitplan und Regeln bestimmst du. Prüfe die ersten Beiträge, bevor du es laufen lässt.',
        ],
      },
      {
        title: 'Was wir nicht tun',
        body: [
          'Wir fragen nicht nach deinem Instagram-Passwort und speichern es nicht. Wir speichern weder deine Kommentare noch deine Direktnachrichten; wir beantworten sie und behalten nur eine ID, damit nichts zweimal beantwortet wird. Wir veröffentlichen nichts außerhalb des Zeitplans und der Regeln, die du gesetzt hast, und nutzen dein Konto für niemanden sonst.',
        ],
      },
      {
        title: 'Inhalte',
        body: [
          'Beiträge entstehen aus öffentlichen Nachrichtenquellen und aus Material, das du hochlädst. Die Rechte daran bleiben bei dir; du erlaubst uns die Verarbeitung nur für den Zweck, den du beauftragt hast. Stelle sicher, dass du das Hochgeladene verwenden darfst. Widerspricht eine Quelle oder ein Rechteinhaber etwas, das wir für dich veröffentlicht haben, nehmen wir es auf Hinweis von dir oder ihm herunter.',
        ],
      },
      {
        title: 'Verfügbarkeit und Haftung',
        body: [
          'Instagram und Meta ändern ihre Plattform ohne Vorankündigung. Dann kann eine Funktion pausieren, bis wir nachgezogen haben. Wir betreiben den Dienst sorgfältig, versprechen aber keine Verfügbarkeit, keine Reichweite und keine Followerzahlen; über das Ergebnis eines Beitrags entscheidet Instagram.',
          'Soweit gesetzlich zulässig, ist unsere Haftung auf den Betrag begrenzt, den du in den drei Monaten vor dem Problem an uns gezahlt hast. Für Vorsatz, grobe Fahrlässigkeit und Schäden an Leben, Körper und Gesundheit gilt keine Begrenzung.',
        ],
      },
      {
        title: 'Beenden',
        body: [
          'Du kannst jederzeit aufhören, indem du dein Konto trennst oder uns schreibst; wir löschen, was wir haben, wie in der Datenschutzerklärung beschrieben. Wir können den Dienst für ein Konto beenden, das gegen Instagrams Regeln oder diese Bedingungen verstößt, und sagen warum.',
        ],
      },
      {
        title: 'Änderungen und Kontakt',
        body: [
          `Ändern sich diese Bedingungen, ändert sich das Datum oben, und Personen mit verbundenem Konto erfahren es vorab per E-Mail. Schreib zu allem auf dieser Seite an ${CONTACT}.`,
        ],
      },
    ],
  },
};
