/**
 * The privacy policy and the terms, in three languages.
 *
 * This is a real document with a real job: the app stores and Meta's dashboard
 * require a privacy policy URL, and this is that URL. It is also the thing a
 * stranger reads before deciding whether to make an account or hand over an
 * address, so it is written to be understood rather than to be survived.
 *
 * **It is a careful draft, not legal advice.** Somebody qualified should read
 * it before it is relied on, particularly the retention periods, which are
 * chosen to match what the code actually does rather than what is customary.
 *
 * The privacy policy is deliberately minimal (2026-10-05, for the TikTok and Meta
 * reviews): operator, what is collected and why, the optional Instagram/TikTok
 * connection, recipients as one category sentence (GDPR Art. 13 allows categories),
 * retention and deletion, rights. No vendor or technology names, no internals.
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
  /** Optional outside links under the section, shown as a plain list. */
  links?: { label: string; href: string }[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  lead: string;
  sections: LegalSection[];
}

/** Bumped whenever the text changes, and shown at the top of the page. */
export const PRIVACY_UPDATED = '2026-10-05';
/** The terms have their own date; they change on a different rhythm. */
export const TERMS_UPDATED = '2026-10-05';

const CONTACT = 'support@diwche.com';

export const PRIVACY: Record<string, LegalDoc> = {
  en: {
    title: 'Privacy',
    updated: PRIVACY_UPDATED,
    lead: 'What Diwche collects, why, who receives it, and how to have it deleted.',
    sections: [
      {
        title: 'Who we are',
        body: [
          `Diwche is run by Helabyte GmbH. Contact: ${CONTACT}.`,
        ],
      },
      {
        title: 'What we collect',
        body: [
          'Your account (name and email address), what you make in the app, and — if you connect them — data from your Instagram or TikTok account: your profile, your posts and their numbers.',
          'We use it to plan your posts and show you what worked. We do not sell it and do not use it for advertising.',
        ],
      },
      {
        title: 'Instagram and TikTok',
        body: [
          'Connecting Instagram or TikTok is optional. We post only when you tap Publish. We never see your password. You can disconnect at any time in the app or in your Instagram or TikTok settings.',
        ],
      },
      {
        title: 'Who else receives your data',
        body: [
          'Service providers that host and run Diwche for us (in Europe where possible), and Instagram or TikTok when you connect them.',
        ],
      },
      {
        title: 'Keeping and deleting your data',
        body: [
          `We keep your data while you have an account. Delete it in the app under Profile ▸ Delete account, or write to ${CONTACT}. Data from a connected Instagram or TikTok account is deleted within 30 days.`,
        ],
      },
      {
        title: 'Your rights',
        body: [
          `Under the GDPR you can ask for a copy of your data, have it corrected or deleted, and complain to a data protection supervisory authority. Write to ${CONTACT}; we answer within 30 days.`,
        ],
      },
    ],
  },

  fa: {
    title: 'حریم خصوصی',
    updated: PRIVACY_UPDATED,
    lead: 'دیوچه چه چیزی جمع می‌کند، چرا، به چه کسی می‌رسد، و چطور پاکش کنی.',
    sections: [
      {
        title: 'ما کی هستیم',
        body: [
          `دیوچه را Helabyte GmbH اداره می‌کند. تماس: ${CONTACT}`,
        ],
      },
      {
        title: 'چه چیزی جمع می‌کنیم',
        body: [
          'حسابت (اسم و ایمیل)، چیزهایی که در اپ می‌سازی، و — اگر وصلشان کنی — داده‌های حساب اینستاگرام یا تیک‌تاکت: پروفایل، پست‌ها و عددهایشان.',
          'از آن‌ها برای برنامه‌ریزی پست‌هایت و نشان دادن این‌که چه چیزی جواب داده استفاده می‌کنیم. آن‌ها را نمی‌فروشیم و برای تبلیغات به کار نمی‌بریم.',
        ],
      },
      {
        title: 'اینستاگرام و تیک‌تاک',
        body: [
          'وصل کردن اینستاگرام یا تیک‌تاک اختیاری است. فقط وقتی پست می‌کنیم که خودت «انتشار» را بزنی. رمزت را هرگز نمی‌بینیم. هر وقت بخواهی می‌توانی اتصال را در اپ یا در تنظیمات اینستاگرام یا تیک‌تاکت قطع کنی.',
        ],
      },
      {
        title: 'چه کسان دیگری داده‌ات را دریافت می‌کنند',
        body: [
          'ارائه‌دهندگان خدماتی که دیوچه را برای ما میزبانی و اجرا می‌کنند (تا جایی که ممکن است در اروپا)، و اینستاگرام یا تیک‌تاک وقتی وصلشان کنی.',
        ],
      },
      {
        title: 'نگه‌داری و پاک کردن داده‌ها',
        body: [
          `تا وقتی حساب داری، داده‌هایت را نگه می‌داریم. می‌توانی در اپ از «پروفایل» و بعد «حذف حساب» پاکش کنی، یا به ${CONTACT} بنویسی. داده‌های حساب وصل‌شده‌ی اینستاگرام یا تیک‌تاک ظرف ۳۰ روز پاک می‌شود.`,
        ],
      },
      {
        title: 'حقوق تو',
        body: [
          `طبق GDPR می‌توانی نسخه‌ای از داده‌هایت بخواهی، بخواهی اصلاح یا پاکشان کنیم، و به یک مرجع نظارت بر حفاظت از داده‌ها شکایت کنی. به ${CONTACT} بنویس؛ ظرف ۳۰ روز جواب می‌دهیم.`,
        ],
      },
    ],
  },

  de: {
    title: 'Datenschutz',
    updated: PRIVACY_UPDATED,
    lead: 'Was Diwche erhebt, wozu, wer es erhält und wie du es löschen lässt.',
    sections: [
      {
        title: 'Wer wir sind',
        body: [
          `Diwche wird von der Helabyte GmbH betrieben. Kontakt: ${CONTACT}.`,
        ],
      },
      {
        title: 'Was wir erheben',
        body: [
          'Dein Konto (Name und E-Mail-Adresse), was du in der App erstellst, und — wenn du sie verbindest — Daten aus deinem Instagram- oder TikTok-Konto: dein Profil, deine Beiträge und deren Zahlen.',
          'Wir nutzen das, um deine Beiträge zu planen und dir zu zeigen, was funktioniert hat. Wir verkaufen es nicht und nutzen es nicht für Werbung.',
        ],
      },
      {
        title: 'Instagram und TikTok',
        body: [
          'Instagram oder TikTok zu verbinden ist freiwillig. Wir veröffentlichen nur, wenn du auf Veröffentlichen tippst. Dein Passwort sehen wir nie. Du kannst die Verbindung jederzeit in der App oder in deinen Instagram- bzw. TikTok-Einstellungen trennen.',
        ],
      },
      {
        title: 'Wer deine Daten sonst erhält',
        body: [
          'Dienstleister, die Diwche für uns hosten und betreiben (wo möglich in Europa), sowie Instagram oder TikTok, wenn du sie verbindest.',
        ],
      },
      {
        title: 'Aufbewahrung und Löschung',
        body: [
          `Wir bewahren deine Daten auf, solange du ein Konto hast. Lösche es in der App unter Profil ▸ Konto löschen oder schreib an ${CONTACT}. Daten aus einem verbundenen Instagram- oder TikTok-Konto werden binnen 30 Tagen gelöscht.`,
        ],
      },
      {
        title: 'Deine Rechte',
        body: [
          `Nach der DSGVO kannst du Auskunft über deine Daten verlangen, sie berichtigen oder löschen lassen und dich bei einer Datenschutz-Aufsichtsbehörde beschweren. Schreib an ${CONTACT}; wir antworten binnen 30 Tagen.`,
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
          'Diwche is a content studio for your phone, operated by Helabyte GmbH. It helps you find ideas, write scripts, edit photos and videos, and add subtitles. If you choose, the phone app connects to your Instagram and TikTok to show how your posts did and to publish the posts you tap Publish on; see “Connected platforms” below.',
        ],
      },
      {
        title: 'Connected platforms',
        body: [
          'Connecting Instagram or TikTok is optional. When you use them through Diwche, their own terms and rules apply as well as these.',
          'Diwche publishes only when you act: a post goes to Instagram when you tap Publish, and a video goes to TikTok only when you tap Publish on TikTok’s posting screen, with the settings you chose there. You can disconnect at any time in the app, under Your plan ▸ Where you post.',
          'What you post to TikTok must follow TikTok’s Music Usage Confirmation and its Branded Content Policy.',
        ],
        links: [
          { label: 'TikTok Music Usage Confirmation', href: 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/en' },
          { label: 'TikTok Branded Content Policy', href: 'https://www.tiktok.com/legal/page/global/bc-policy/en' },
        ],
      },
      {
        title: 'Your account',
        body: [
          'An account is for one person. Use your real name and an email address that is yours, and keep your password to yourself.',
          'New accounts are checked by us before they open. We may decline a sign-up without giving a reason.',
          'You are responsible for what you make with Diwche and for what you publish.',
        ],
      },
      {
        title: 'Content',
        body: [
          'You keep the rights to what you make and upload; you give us permission to process it only to do what you asked. Make sure you may use what you upload. If a rights holder objects to something kept on our servers, we will remove it when you or they tell us.',
          'Ideas, scripts and subtitles are written with AI and can be wrong. Read them before you post.',
        ],
      },
      {
        title: 'What we will not do',
        body: [
          'We do not sell your data. We never post anything in your name that you did not tap Publish on. We do not ask for or store your Instagram or TikTok password, and we do not use your account for anyone else.',
        ],
      },
      {
        title: 'Availability and limits',
        body: [
          'The platforms and services Diwche relies on change without notice. When they do, a feature may pause until we adapt. We run the service carefully but promise no uptime, no reach, and no follower numbers; how a post does is up to the platform you post it on.',
          'To the extent the law allows, our liability is limited to what you paid us in the three months before the problem. Nothing here limits liability for intent, gross negligence, or harm to life and health.',
        ],
      },
      {
        title: 'Ending',
        body: [
          'You can delete your account at any time in the app, under Profile ▸ Delete account; what we hold is then deleted as described in the privacy policy. We may suspend or close an account that breaks these terms, the law, or other people’s rights, and we will say why.',
        ],
      },
      {
        title: 'Changes and contact',
        body: [
          `When these terms change, the date at the top changes, and if a change affects how you use Diwche we tell account holders by email before it takes effect. Write to ${CONTACT} about anything on this page.`,
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
          'دیوچه یک استودیوی ساخت محتوا برای گوشی است که Helabyte GmbH اداره‌اش می‌کند. کمکت می‌کند ایده پیدا کنی، سناریو بنویسی، عکس و ویدیو ویرایش کنی و زیرنویس بگذاری. اگر بخواهی، اپ گوشی به اینستاگرام و تیک‌تاکت وصل می‌شود تا نشانت دهد پست‌هایت چطور عمل کرده‌اند و پست‌هایی را که خودت «انتشار» را برایشان زده‌ای منتشر کند؛ بخش «پلتفرم‌های وصل‌شده» را پایین‌تر ببین.',
        ],
      },
      {
        title: 'پلتفرم‌های وصل‌شده',
        body: [
          'وصل کردن اینستاگرام یا تیک‌تاک اختیاری است. وقتی از آن‌ها از راه دیوچه استفاده می‌کنی، علاوه بر این شرایط، شرایط و قوانین خودِ آن‌ها هم برقرار است.',
          'دیوچه فقط با کار خودِ تو منتشر می‌کند: پست وقتی به اینستاگرام می‌رود که «انتشار» را بزنی، و ویدیو فقط وقتی به تیک‌تاک می‌رود که در صفحه‌ی انتشار تیک‌تاک «انتشار» را بزنی، با همان تنظیماتی که آنجا انتخاب کرده‌ای. هر وقت بخواهی می‌توانی در اپ، از «برنامهٔ تو» و بعد «کجا منتشر می‌کنی»، اتصال را قطع کنی.',
          'آنچه در تیک‌تاک منتشر می‌کنی باید با «تأیید استفاده از موسیقی» (Music Usage Confirmation) و «سیاست محتوای برند» (Branded Content Policy) تیک‌تاک سازگار باشد.',
        ],
        links: [
          { label: 'تأیید استفاده از موسیقی در تیک‌تاک (Music Usage Confirmation)', href: 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/en' },
          { label: 'سیاست محتوای برند تیک‌تاک (Branded Content Policy)', href: 'https://www.tiktok.com/legal/page/global/bc-policy/en' },
        ],
      },
      {
        title: 'حساب تو',
        body: [
          'هر حساب مال یک نفر است. اسم واقعی‌ات و ایمیلی را که مال خودت است بده، و رمزت را پیش خودت نگه دار.',
          'حساب‌های تازه پیش از باز شدن به دست ما بررسی می‌شوند. ممکن است ثبت‌نامی را بدون گفتن دلیل نپذیریم.',
          'مسئولیت چیزی که با دیوچه می‌سازی و منتشر می‌کنی با خودت است.',
        ],
      },
      {
        title: 'محتوا',
        body: [
          'حقوق چیزهایی که می‌سازی و آپلود می‌کنی برای خودت می‌ماند؛ به ما فقط اجازه می‌دهی برای همان کاری که خواسته‌ای پردازششان کنیم. مطمئن شو اجازه‌ی استفاده از آنچه آپلود می‌کنی را داری. اگر صاحب حقی به چیزی که روی سرورهای ما مانده اعتراض کند، به محض این‌که تو یا او خبرمان کنید برش می‌داریم.',
          'ایده‌ها، سناریوها و زیرنویس‌ها با هوش مصنوعی نوشته می‌شوند و ممکن است اشتباه داشته باشند. پیش از انتشار بخوانشان.',
        ],
      },
      {
        title: 'کارهایی که نمی‌کنیم',
        body: [
          'داده‌ات را نمی‌فروشیم. هیچ‌وقت چیزی را به اسم تو منتشر نمی‌کنیم که خودت «انتشار» را برایش نزده باشی. رمز اینستاگرام یا تیک‌تاکت را نه می‌خواهیم و نه ذخیره می‌کنیم، و از حسابت برای کس دیگری استفاده نمی‌کنیم.',
        ],
      },
      {
        title: 'در دسترس بودن و محدودیت‌ها',
        body: [
          'پلتفرم‌ها و سرویس‌هایی که دیوچه به آن‌ها تکیه دارد بدون اطلاع قبلی تغییر می‌کنند. وقتی این اتفاق بیفتد ممکن است یک قابلیت تا وقتی خودمان را وفق بدهیم متوقف شود. سرویس را با دقت اداره می‌کنیم اما هیچ تضمینی برای در دسترس بودن، ریچ یا تعداد فالوور نمی‌دهیم؛ نتیجه‌ی یک پست را پلتفرمی تعیین می‌کند که رویش منتشرش می‌کنی.',
          'تا جایی که قانون اجازه می‌دهد، مسئولیت ما محدود به مبلغی است که در سه ماه پیش از بروز مشکل به ما پرداخته‌ای. هیچ‌چیز در اینجا مسئولیت ناشی از عمد، قصور فاحش یا آسیب به جان و سلامت را محدود نمی‌کند.',
        ],
      },
      {
        title: 'پایان دادن',
        body: [
          'هر وقت بخواهی می‌توانی در اپ، از «پروفایل» و بعد «حذف حساب»، حسابت را پاک کنی؛ آنچه داریم طبق سیاست حریم خصوصی پاک می‌شود. ما هم ممکن است حسابی را که این شرایط، قانون یا حقوق دیگران را زیر پا بگذارد معلق کنیم یا ببندیم، و دلیلش را می‌گوییم.',
        ],
      },
      {
        title: 'تغییرات و تماس',
        body: [
          `با هر تغییر در این شرایط، تاریخ بالای صفحه عوض می‌شود، و اگر تغییری روی استفاده‌ی تو از دیوچه اثر بگذارد، پیش از اجرا به صاحبان حساب ایمیل می‌زنیم. درباره‌ی هر چیزی در این صفحه به ${CONTACT} بنویس.`,
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
          'Diwche ist ein Content-Studio für dein Handy, betrieben von Helabyte GmbH. Es hilft dir, Ideen zu finden, Skripte zu schreiben, Fotos und Videos zu bearbeiten und Untertitel hinzuzufügen. Wenn du willst, verbindet sich die Handy-App mit deinem Instagram und TikTok, um dir zu zeigen, wie deine Beiträge gelaufen sind, und um die Beiträge zu veröffentlichen, bei denen du auf Veröffentlichen tippst; siehe „Verbundene Plattformen“ unten.',
        ],
      },
      {
        title: 'Verbundene Plattformen',
        body: [
          'Instagram oder TikTok zu verbinden ist freiwillig. Nutzt du sie über Diwche, gelten neben diesen Bedingungen auch deren eigene Bedingungen und Regeln.',
          'Diwche veröffentlicht nur, wenn du handelst: Ein Beitrag geht zu Instagram, wenn du auf Veröffentlichen tippst, und ein Video geht nur dann zu TikTok, wenn du auf TikToks Veröffentlichungsbildschirm auf Veröffentlichen tippst, mit den Einstellungen, die du dort gewählt hast. Trennen kannst du jederzeit in der App unter Your plan ▸ Where you post.',
          'Was du auf TikTok veröffentlichst, muss TikToks Music Usage Confirmation und seiner Branded Content Policy entsprechen.',
        ],
        links: [
          { label: 'TikTok Music Usage Confirmation', href: 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/en' },
          { label: 'TikTok Branded Content Policy', href: 'https://www.tiktok.com/legal/page/global/bc-policy/en' },
        ],
      },
      {
        title: 'Dein Konto',
        body: [
          'Ein Konto ist für eine Person. Verwende deinen echten Namen und eine E-Mail-Adresse, die dir gehört, und behalte dein Passwort für dich.',
          'Neue Konten prüfen wir, bevor sie freigeschaltet werden. Wir können eine Anmeldung ohne Angabe von Gründen ablehnen.',
          'Für das, was du mit Diwche erstellst und veröffentlichst, bist du verantwortlich.',
        ],
      },
      {
        title: 'Inhalte',
        body: [
          'Die Rechte an dem, was du erstellst und hochlädst, bleiben bei dir; du erlaubst uns die Verarbeitung nur, um zu tun, worum du gebeten hast. Stelle sicher, dass du das Hochgeladene verwenden darfst. Widerspricht ein Rechteinhaber etwas, das auf unseren Servern liegt, entfernen wir es auf Hinweis von dir oder ihm.',
          'Ideen, Skripte und Untertitel entstehen mit KI und können falsch sein. Lies sie, bevor du postest.',
        ],
      },
      {
        title: 'Was wir nicht tun',
        body: [
          'Wir verkaufen deine Daten nicht. Wir veröffentlichen nie etwas in deinem Namen, bei dem du nicht selbst auf Veröffentlichen getippt hast. Wir fragen nicht nach deinem Instagram- oder TikTok-Passwort, speichern es nicht und nutzen dein Konto für niemanden sonst.',
        ],
      },
      {
        title: 'Verfügbarkeit und Haftung',
        body: [
          'Die Plattformen und Dienste, auf die Diwche angewiesen ist, ändern sich ohne Vorankündigung. Dann kann eine Funktion pausieren, bis wir nachgezogen haben. Wir betreiben den Dienst sorgfältig, versprechen aber keine Verfügbarkeit, keine Reichweite und keine Followerzahlen; über das Ergebnis eines Beitrags entscheidet die Plattform, auf der du ihn veröffentlichst.',
          'Soweit gesetzlich zulässig, ist unsere Haftung auf den Betrag begrenzt, den du in den drei Monaten vor dem Problem an uns gezahlt hast. Für Vorsatz, grobe Fahrlässigkeit und Schäden an Leben, Körper und Gesundheit gilt keine Begrenzung.',
        ],
      },
      {
        title: 'Beenden',
        body: [
          'Du kannst dein Konto jederzeit in der App löschen, unter Profil ▸ Konto löschen; was wir haben, wird dann wie in der Datenschutzerklärung beschrieben gelöscht. Wir können ein Konto sperren oder schließen, das gegen diese Bedingungen, das Gesetz oder die Rechte anderer verstößt, und sagen dir, warum.',
        ],
      },
      {
        title: 'Änderungen und Kontakt',
        body: [
          `Ändern sich diese Bedingungen, ändert sich das Datum oben, und betrifft eine Änderung, wie du Diwche nutzt, erfahren Kontoinhaber es vorab per E-Mail. Schreib zu allem auf dieser Seite an ${CONTACT}.`,
        ],
      },
    ],
  },
};
