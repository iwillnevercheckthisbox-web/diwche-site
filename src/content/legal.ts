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
export const PRIVACY_UPDATED = '2026-09-01';

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
