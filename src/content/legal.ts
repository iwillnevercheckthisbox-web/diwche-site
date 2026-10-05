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
 * Every claim in here is checked against the code (2026-10-04, Trello #318;
 * the file list per claim is in findings/plans/mobile-signup-approval.md):
 *
 * - the public read stores what `V60__public_audit.sql` stores, cached for
 *   `public.cache-hours` (seven days); consents store what `V62__public_consent.sql` stores
 * - the model sees computed facts only, never the raw page (`AuditNarrator`)
 * - transcription in Auto is ElevenLabs → OpenAI → our own machines (`WhisperRouter`);
 *   the phones send the sound only (`SubtitleVideoUpload.swift`, `AudioExtract.kt`)
 * - text generation is Gemini with OpenAI as the fallback (`GeminiClient`, `OpenAiFallbackClient`)
 * - peers are read through Apify (`PeerSnapshotService`, `ApifyInstagramService`)
 * - push tokens are stored with user id, platform, app version, locale (`PushToken`)
 * - crash reports go to our own GlitchTip with the Keycloak sub only, sendDefaultPii off
 *   (`CrashReporting.swift`, `SessionStore.kt`)
 * - every app request carries app version, OS and device model (`AppHeaders`)
 * - the sign-up approval and its Telegram message follow the plan's Batch 1
 * - the phone apps' optional Instagram and TikTok connections (read profile, posts and
 *   their numbers; publish only on the person's own Publish tap; disconnect under
 *   Your plan ▸ Where you post) were written 2026-10-05 for TikTok's app review
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
    lead: 'Diwche is a content studio on your phone: ideas, scripts, photo and video editing, subtitles. This describes exactly what we hold about you, why, and how to make us delete it. It is written to be read.',
    sections: [
      {
        title: 'Who we are',
        body: [
          `Diwche is operated by Helabyte. Write to ${CONTACT} about anything on this page and a person will answer.`,
        ],
      },
      {
        title: 'Your Diwche account',
        body: [
          'You make a Diwche account in the phone app, with an email address and a password or with your Google account. We hold your name, your email address, when you signed up, and whether you did it on an iPhone or an Android phone.',
          'Your password is kept by our own sign-in server (Keycloak, running on our servers in Europe), and only as a one-way hash. Nobody at Diwche can read it, and the rest of Diwche never receives it.',
        ],
      },
      {
        title: 'Signing in with Google',
        body: [
          'If you choose “Continue with Google”, Google tells our sign-in server your name, your email address and that Google has confirmed that address. Google’s standard sign-in also passes a link to your profile picture and your language setting; we do not use them. We get nothing else from your Google account — not your contacts, your mail, your files, and never your Google password.',
          'You can remove Diwche in your Google account’s settings, where it lists the apps you sign in to. That stops Google signing you in to Diwche; it does not delete your Diwche account — for that, see “Deleting your account” below.',
        ],
      },
      {
        title: 'Before your account opens',
        body: [
          'Every new account is looked at by a person on our team before it can be used; until then the app tells you it is waiting. The person checking sees your name, your email address, how you signed up (Google or email) and whether you use an iPhone or Android. A short message with exactly those details, and nothing more, is sent to them on Telegram so a sign-up is not missed.',
          'If we decline a sign-up, we keep that record so the same account is not sent for checking again. Write to us and we delete it.',
        ],
      },
      {
        title: 'Ideas, scripts and your page',
        body: [
          'When you set up, the app sends your phone’s language, region and time zone so the first ideas fit you. What you tell it about yourself and your work — typed, or spoken and turned into text — becomes your page’s profile, which you can read and change in the app.',
          'Ideas and scripts are written by Google’s Gemini from what you have told us and from the ideas you kept or turned down. If Gemini is unavailable, the same request goes to OpenAI instead.',
          'If you name Instagram accounts you look up to, Apify reads what those profiles show publicly so the ideas can learn from them. Nothing is posted and nobody is contacted.',
        ],
      },
      {
        title: 'The phone app',
        body: [
          'Photos and videos you pick are edited on your phone. They reach our servers only when you use something that needs the server — turning speech into text, or keeping or exporting a project on our side — and a project kept on our servers is deleted when you delete it.',
          'For subtitles and spoken notes, the app sends the sound only, never the picture. The speech is turned into text by ElevenLabs, by OpenAI if ElevenLabs fails, and now and then by our own machines. The uploaded sound is deleted when the job is done; the text comes back to you.',
        ],
        points: [
          'Notifications: if you allow them, Apple or Google gives the app a push token. We store it with your account id, the app version and your language, so we can tell you when something is ready.',
          'Crash reports go to our own error tracker (GlitchTip, on our servers). They carry your account id so we can find the problem — never your name or email address.',
          'Every request from the app says which app version, phone model and system version it comes from, so we know which build has a problem.',
          'The photo editor reports how long its slow steps took on your phone model — timings and sizes only, never your pictures, your words or your account.',
        ],
      },
      {
        title: 'Connecting Instagram and TikTok (optional)',
        body: [
          'The Diwche phone app, on iPhone, iPad and Android, can connect to your Instagram and your TikTok account. This is optional: nothing is connected unless you choose to connect it, and the rest of the app works without it.',
          'Instagram is connected through Instagram’s own login. We then read your profile, the list of your posts and each post’s numbers — reach, views, likes, comments, saves, shares and follows — to show you what worked in your weekly plan. Later, when you tap Publish on a post, we publish that post to your Instagram. We publish nothing you did not tap Publish on.',
          'TikTok is connected with Login with TikTok. We then read your basic profile (your name and avatar), your follower and like counts, and the list of your videos with their numbers. A video is uploaded and published to TikTok only when you tap Publish on TikTok’s own posting screen in the app, with the privacy and interaction settings you choose there.',
          'We never see, ask for or store your Instagram or TikTok password. The access keys that Instagram and TikTok give us are stored encrypted on our own servers in Europe and are used only for the things above.',
        ],
        points: [
          'You can disconnect at any time in the app, under Your plan ▸ Where you post, or in your Instagram or TikTok settings. Disconnecting stops our access immediately.',
          'We do not sell what we read from these accounts and do not use it for advertising.',
          'To have it deleted, see “Deleting your account” below: it is gone within thirty days.',
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
        title: 'Instagram accounts connected through our web dashboard',
        body: [
          'Some accounts were connected to Instagram earlier through our web dashboard. For those, this still applies.',
          'The permission screen listed exactly what we use: reading the profile and posts, publishing the posts you scheduled, and replying to comments and direct messages. We ask for nothing beyond that, and Meta shows the full list before you agree.',
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
          'Google — signing in with Google, if you choose it; Gemini, which writes ideas and scripts and phrases the free read’s sentences; and delivering notifications to Android phones.',
          'OpenAI — turning speech into text when ElevenLabs fails, and writing when Gemini is unavailable.',
          'ElevenLabs — turning speech into text.',
          'Apify — reading the public Instagram profiles you name.',
          'Apple — delivering notifications to iPhones.',
          'Telegram — carrying the short message about a new sign-up to the people who check it.',
          'Brevo — sending the emails you asked for.',
          'Cloudflare — serving this site, carrying the app’s traffic to our servers, and telling people from scripts.',
          'Meta (Instagram) — the free read, Instagram accounts you connect in the app, and accounts connected through our web dashboard.',
          'TikTok — Login with TikTok, reading your profile and videos, and publishing the videos you post, if you connect TikTok.',
          'Our own servers in Europe, which run the sign-in (Keycloak), the app’s server and the crash tracker.',
        ],
      },
      {
        title: 'Deleting your account',
        body: [
          `In the app, Profile ▸ Delete account deletes your sign-in at once. To also erase what you made or told us on our servers — your page’s profile, ideas, scripts, kept projects — write to ${CONTACT} from your account’s email address. We do it within thirty days and confirm when it is done. A sign-up we declined is deleted the same way.`,
          `For the free read and our emails, write to ${CONTACT} from the address you gave us, or with the Instagram handle you entered, and we will delete everything we hold about you and confirm it. You do not have to give a reason.`,
          'What we read from a connected Instagram or TikTok account, and the access keys for it, are deleted within thirty days when you delete your account or write to us.',
          'Disconnecting in the app (Your plan ▸ Where you post), in your Instagram or TikTok settings, or removing yourself as a tester, stops all access immediately.',
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
    lead: 'دیوچه یک استودیوی ساخت محتوا روی گوشی است: ایده، سناریو، ویرایش عکس و ویدیو، زیرنویس. اینجا دقیقاً نوشته‌ایم چه چیزی از تو نگه می‌داریم، چرا، و چطور می‌توانی بخواهی پاکش کنیم. نوشته شده که خوانده شود.',
    sections: [
      {
        title: 'ما کی هستیم',
        body: [
          `دیوچه توسط Helabyte اداره می‌شود. درباره‌ی هر چیزی در این صفحه به ${CONTACT} بنویس؛ یک آدم جوابت را می‌دهد.`,
        ],
      },
      {
        title: 'حساب دیوچه‌ات',
        body: [
          'حساب دیوچه را در اپ گوشی می‌سازی؛ با ایمیل و رمز، یا با حساب گوگلت. از تو این‌ها را نگه می‌داریم: اسمت، ایمیلت، زمان ثبت‌نامت، و این‌که با آیفون ثبت‌نام کرده‌ای یا با گوشی اندروید.',
          'رمزت را سرور ورود خودمان نگه می‌دارد (Keycloak، که روی سرورهای خودمان در اروپا اجرا می‌شود)، آن هم فقط به شکل هش یک‌طرفه. هیچ‌کس در دیوچه نمی‌تواند آن را بخواند و بقیه‌ی بخش‌های دیوچه اصلاً به آن دسترسی ندارند.',
        ],
      },
      {
        title: 'ورود با گوگل',
        body: [
          'اگر «ادامه با گوگل» را بزنی، گوگل اسمت، ایمیلت و این‌که آن ایمیل را تأیید کرده به سرور ورود ما می‌گوید. ورود معمولی گوگل لینک عکس پروفایل و زبانت را هم می‌فرستد، ولی ما از این دو استفاده نمی‌کنیم. چیز دیگری از حساب گوگلت به ما نمی‌رسد؛ نه مخاطبانت، نه ایمیل‌هایت، نه فایل‌هایت، و هرگز رمز گوگلت.',
          'هر وقت بخواهی می‌توانی در تنظیمات حساب گوگلت، همان‌جا که اپ‌هایی را که با گوگل واردشان شده‌ای نشان می‌دهد، دیوچه را برداری. این کار فقط ورود با گوگل به دیوچه را قطع می‌کند و حساب دیوچه‌ات را پاک نمی‌کند؛ برای پاک کردن حساب، بخش «پاک کردن حسابت» را پایین‌تر ببین.',
        ],
      },
      {
        title: 'پیش از باز شدن حسابت',
        body: [
          'هر حساب تازه را، پیش از این‌که قابل استفاده شود، یکی از اعضای تیم ما نگاه می‌کند؛ تا آن موقع اپ به تو می‌گوید که منتظر تأیید هستی. کسی که بررسی می‌کند اسمت، ایمیلت، روش ثبت‌نامت (گوگل یا ایمیل) و نوع گوشی‌ات (آیفون یا اندروید) را می‌بیند. یک پیام کوتاه با همین چند مورد، و نه بیشتر، در تلگرام برایش فرستاده می‌شود تا ثبت‌نامی از قلم نیفتد.',
          'اگر ثبت‌نامی را نپذیریم، سابقه‌اش را نگه می‌داریم تا همان حساب دوباره برای بررسی نیاید. اگر بخواهی پاکش کنیم، کافی است برایمان بنویسی.',
        ],
      },
      {
        title: 'ایده‌ها، سناریوها و پیجت',
        body: [
          'وقتی اپ را راه می‌اندازی، زبان، منطقه و منطقه‌ی زمانی گوشی‌ات را برایمان می‌فرستد تا ایده‌های اول به کارت بیایند. چیزهایی که درباره‌ی خودت و کارت به اپ می‌گویی — چه تایپ کنی، چه بگویی و به متن تبدیل شود — می‌شود پروفایل پیجت، که در خود اپ می‌توانی بخوانی و عوضش کنی.',
          'ایده‌ها و سناریوها را Gemini (از گوگل) می‌نویسد، از روی همین حرف‌ها و ایده‌هایی که نگه داشته‌ای یا کنار گذاشته‌ای. اگر Gemini در دسترس نباشد، همان درخواست به OpenAI می‌رود.',
          'اگر پیج‌هایی را که الگویت هستند نام ببری، Apify آنچه آن پروفایل‌ها به‌طور عمومی نشان می‌دهند را می‌خواند تا ایده‌ها از آن‌ها یاد بگیرند. چیزی منتشر نمی‌شود و به کسی پیام داده نمی‌شود.',
        ],
      },
      {
        title: 'اپ گوشی',
        body: [
          'عکس‌ها و ویدیوهایی که انتخاب می‌کنی روی خود گوشی‌ات ویرایش می‌شوند. فقط وقتی به سرورهای ما می‌رسند که از کاری استفاده کنی که سرور لازم دارد — تبدیل گفتار به متن، یا نگه داشتن و خروجی گرفتن پروژه روی سرور — و پروژه‌ای که روی سرور مانده، با پاک کردنش از آنجا هم پاک می‌شود.',
          'برای زیرنویس و یادداشت‌های صوتی، اپ فقط صدا را می‌فرستد، هیچ‌وقت تصویر را. گفتار را ElevenLabs به متن تبدیل می‌کند؛ اگر نشد OpenAI، و گاهی هم ماشین‌های خودمان. فایل صدا بعد از تمام شدن کار پاک می‌شود و متن به خودت برمی‌گردد.',
        ],
        points: [
          'اعلان‌ها: اگر اجازه بدهی، اپل یا گوگل یک توکن اعلان به اپ می‌دهد. آن را همراه شناسه‌ی حسابت، نسخه‌ی اپ و زبانت نگه می‌داریم تا وقتی چیزی آماده شد خبرت کنیم.',
          'گزارش‌های خرابی (کرش) به ردیاب خطای خودمان می‌رود (GlitchTip، روی سرورهای خودمان). فقط شناسه‌ی حسابت همراهش است تا بتوانیم مشکل را پیدا کنیم — هرگز اسم یا ایمیلت.',
          'هر درخواستی که اپ می‌فرستد می‌گوید از کدام نسخه‌ی اپ، کدام مدل گوشی و کدام نسخه‌ی سیستم‌عامل آمده، تا بدانیم مشکل مال کدام نسخه است.',
          'ویرایشگر عکس گزارش می‌دهد که مرحله‌های سنگینش روی مدل گوشی تو چقدر طول کشیده‌اند — فقط زمان و اندازه، هرگز عکس‌ها، نوشته‌ها یا حسابت.',
        ],
      },
      {
        title: 'وصل کردن اینستاگرام و تیک‌تاک (اختیاری)',
        body: [
          'اپ گوشی دیوچه، روی آیفون، آیپد و اندروید، می‌تواند به اینستاگرام و تیک‌تاکت وصل شود. این کار اختیاری است: تا خودت نخواهی هیچ‌چیز وصل نمی‌شود، و بقیه‌ی اپ بدون آن هم کار می‌کند.',
          'اینستاگرام از راه صفحه‌ی ورود خودِ اینستاگرام وصل می‌شود. بعد از آن پروفایلت، فهرست پست‌هایت و عددهای هر پست — ریچ، بازدید، لایک، کامنت، ذخیره، اشتراک‌گذاری و فالوهای تازه — را می‌خوانیم تا در برنامه‌ی هفتگی‌ات نشانت دهیم چه چیزی جواب داده. بعدها وقتی روی یک پست «انتشار» را بزنی، همان پست را در اینستاگرامت منتشر می‌کنیم. چیزی را که خودت «انتشار» نزده‌ای منتشر نمی‌کنیم.',
          'تیک‌تاک با «ورود با تیک‌تاک» (Login with TikTok) وصل می‌شود. بعد از آن پروفایل پایه‌ات (اسم و عکس پروفایل)، تعداد فالوورها و لایک‌هایت، و فهرست ویدیوهایت با عددهایشان را می‌خوانیم. ویدیو فقط وقتی در تیک‌تاک آپلود و منتشر می‌شود که خودت در صفحه‌ی انتشار خودِ تیک‌تاک در اپ «انتشار» را بزنی، با همان تنظیمات حریم خصوصی و تعاملی که آنجا انتخاب کرده‌ای.',
          'رمز اینستاگرام یا تیک‌تاکت را نه می‌بینیم، نه می‌خواهیم و نه ذخیره می‌کنیم. کلیدهای دسترسی‌ای که اینستاگرام و تیک‌تاک به ما می‌دهند رمزگذاری‌شده روی سرورهای خودمان در اروپا نگه داشته می‌شوند و فقط برای همین کارها به کار می‌روند.',
        ],
        points: [
          'هر وقت بخواهی می‌توانی در اپ، از «برنامهٔ تو» و بعد «کجا منتشر می‌کنی»، یا در تنظیمات اینستاگرام یا تیک‌تاکت، اتصال را قطع کنی. با قطع کردن، دسترسی ما همان لحظه بسته می‌شود.',
          'آنچه از این حساب‌ها می‌خوانیم را نمی‌فروشیم و برای تبلیغات استفاده نمی‌کنیم.',
          'برای پاک کردنش، بخش «پاک کردن حسابت» را پایین‌تر ببین: حداکثر ظرف سی روز پاک می‌شود.',
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
        title: 'حساب‌های اینستاگرامی که از راه داشبورد وب ما وصل شده‌اند',
        body: [
          'بعضی حساب‌ها قبلاً از راه داشبورد وب ما به اینستاگرام وصل شده‌اند. این بخش برای آن‌ها هنوز صدق می‌کند.',
          'صفحه‌ی مجوزها دقیقاً همان چیزهایی را نشان داد که استفاده می‌کنیم: خواندن پروفایل و پست‌ها، منتشر کردن پست‌هایی که خودت زمان‌بندی کرده‌ای، و جواب دادن به کامنت‌ها و دایرکت‌ها. چیزی فراتر از این نمی‌خواهیم و متا فهرست کامل را پیش از تأیید نشان می‌دهد.',
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
          'گوگل — ورود با گوگل، اگر انتخابش کنی؛ Gemini، که ایده و سناریو می‌نویسد و جمله‌های خوانش رایگان را می‌سازد؛ و رساندن اعلان به گوشی‌های اندروید.',
          'OpenAI — تبدیل گفتار به متن وقتی ElevenLabs نتواند، و نوشتن وقتی Gemini در دسترس نباشد.',
          'ElevenLabs — تبدیل گفتار به متن.',
          'Apify — خواندن پروفایل‌های عمومی اینستاگرام که خودت نام می‌بری.',
          'اپل — رساندن اعلان به آیفون.',
          'تلگرام — رساندن پیام کوتاه ثبت‌نام تازه به کسانی که بررسی‌اش می‌کنند.',
          'Brevo — فرستادن ایمیل‌هایی که خواسته‌ای.',
          'Cloudflare — سرو کردن این سایت، رساندن ترافیک اپ به سرورهای ما، و تشخیص آدم از ربات.',
          'متا (اینستاگرام) — خوانش رایگان، حساب‌های اینستاگرامی که در اپ وصل می‌کنی، و حساب‌هایی که از راه داشبورد وب ما وصل شده‌اند.',
          'تیک‌تاک — ورود با تیک‌تاک، خواندن پروفایل و ویدیوهایت، و منتشر کردن ویدیوهایی که خودت پست می‌کنی، اگر تیک‌تاک را وصل کنی.',
          'سرورهای خودمان در اروپا، که سرور ورود (Keycloak)، سرور اپ و ردیاب خطا روی آن‌ها اجرا می‌شوند.',
        ],
      },
      {
        title: 'پاک کردن حسابت',
        body: [
          `در اپ، از «پروفایل» و بعد «حذف حساب»، حساب ورودت همان لحظه پاک می‌شود. اگر می‌خواهی آنچه ساخته‌ای یا به ما گفته‌ای هم از سرورهایمان پاک شود — پروفایل پیجت، ایده‌ها، سناریوها، پروژه‌های نگه‌داشته — از ایمیل همان حساب به ${CONTACT} بنویس. حداکثر ظرف سی روز انجامش می‌دهیم و وقتی تمام شد خبرت می‌کنیم. ثبت‌نامی که نپذیرفته‌ایم هم به همین شکل پاک می‌شود.`,
          `برای خوانش رایگان و ایمیل‌هایمان، از همان آدرسی که به ما داده‌ای، یا با همان آیدی‌ای که وارد کرده‌ای، به ${CONTACT} بنویس تا هرچه از تو داریم پاک کنیم و بعدش تأییدش را بفرستیم. لازم نیست دلیلی بیاوری.`,
          'آنچه از یک حساب وصل‌شده‌ی اینستاگرام یا تیک‌تاک خوانده‌ایم، همراه کلیدهای دسترسی‌اش، حداکثر ظرف سی روز بعد از این‌که حسابت را پاک کنی یا برایمان بنویسی پاک می‌شود.',
          'قطع کردن اتصال در اپ («برنامهٔ تو» و بعد «کجا منتشر می‌کنی»)، در تنظیمات اینستاگرام یا تیک‌تاکت، یا برداشتن خودت از فهرست تسترها، دسترسی را همان لحظه می‌بندد.',
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
    lead: 'Diwche ist ein Content-Studio auf deinem Handy: Ideen, Skripte, Foto- und Videobearbeitung, Untertitel. Hier steht genau, was wir über dich speichern, warum, und wie du uns dazu bringst, es zu löschen. Geschrieben zum Lesen, nicht zum Überstehen.',
    sections: [
      {
        title: 'Wer wir sind',
        body: [
          `Diwche wird von Helabyte betrieben. Schreib zu allem auf dieser Seite an ${CONTACT} — es antwortet ein Mensch.`,
        ],
      },
      {
        title: 'Dein Diwche-Konto',
        body: [
          'Du legst dein Diwche-Konto in der Handy-App an, mit E-Mail-Adresse und Passwort oder mit deinem Google-Konto. Wir speichern deinen Namen, deine E-Mail-Adresse, wann du dich registriert hast und ob das auf einem iPhone oder einem Android-Handy war.',
          'Dein Passwort verwahrt unser eigener Anmeldeserver (Keycloak, auf unseren Servern in Europa), und zwar nur als Einweg-Hash. Niemand bei Diwche kann es lesen, und der Rest von Diwche bekommt es nie.',
        ],
      },
      {
        title: 'Anmelden mit Google',
        body: [
          'Wählst du „Weiter mit Google“, teilt Google unserem Anmeldeserver deinen Namen, deine E-Mail-Adresse und mit, dass Google diese Adresse bestätigt hat. Die übliche Google-Anmeldung übermittelt außerdem einen Link zu deinem Profilbild und deine Spracheinstellung; beides nutzen wir nicht. Sonst bekommen wir nichts aus deinem Google-Konto — keine Kontakte, keine Mails, keine Dateien und nie dein Google-Passwort.',
          'Du kannst Diwche in den Einstellungen deines Google-Kontos entfernen, dort, wo die Apps stehen, bei denen du dich mit Google anmeldest. Damit endet die Anmeldung über Google; dein Diwche-Konto wird dadurch nicht gelöscht — dazu unten „Dein Konto löschen“.',
        ],
      },
      {
        title: 'Bevor dein Konto freigeschaltet wird',
        body: [
          'Jedes neue Konto sieht sich eine Person aus unserem Team an, bevor es genutzt werden kann; bis dahin zeigt dir die App, dass du wartest. Wer prüft, sieht deinen Namen, deine E-Mail-Adresse, wie du dich registriert hast (Google oder E-Mail) und ob du ein iPhone oder Android nutzt. Eine kurze Nachricht mit genau diesen Angaben, und nichts weiter, geht per Telegram an diese Person, damit keine Anmeldung untergeht.',
          'Lehnen wir eine Anmeldung ab, behalten wir diesen Eintrag, damit dasselbe Konto nicht erneut zur Prüfung kommt. Schreib uns, und wir löschen ihn.',
        ],
      },
      {
        title: 'Ideen, Skripte und deine Seite',
        body: [
          'Beim Einrichten schickt die App Sprache, Region und Zeitzone deines Handys, damit die ersten Ideen zu dir passen. Was du der App über dich und deine Arbeit erzählst — getippt oder gesprochen und in Text umgewandelt —, wird zum Profil deiner Seite, das du in der App lesen und ändern kannst.',
          'Ideen und Skripte schreibt Googles Gemini aus dem, was du uns erzählt hast, und aus den Ideen, die du behalten oder verworfen hast. Ist Gemini nicht erreichbar, geht dieselbe Anfrage an OpenAI.',
          'Nennst du Instagram-Konten, die dir als Vorbild dienen, liest Apify, was diese Profile öffentlich zeigen, damit die Ideen davon lernen. Es wird nichts veröffentlicht und niemand kontaktiert.',
        ],
      },
      {
        title: 'Die Handy-App',
        body: [
          'Fotos und Videos, die du auswählst, werden auf deinem Handy bearbeitet. Auf unsere Server gelangen sie nur, wenn du etwas nutzt, das den Server braucht — Sprache in Text umwandeln oder ein Projekt bei uns aufbewahren oder exportieren —, und ein Projekt auf unseren Servern wird gelöscht, wenn du es löschst.',
          'Für Untertitel und gesprochene Notizen schickt die App nur den Ton, nie das Bild. In Text umgewandelt wird er von ElevenLabs, von OpenAI, falls ElevenLabs scheitert, und ab und zu auf unseren eigenen Rechnern. Der hochgeladene Ton wird nach getaner Arbeit gelöscht; der Text kommt zu dir zurück.',
        ],
        points: [
          'Benachrichtigungen: Wenn du sie erlaubst, gibt Apple oder Google der App ein Push-Token. Wir speichern es mit deiner Konto-ID, der App-Version und deiner Sprache, damit wir dir sagen können, wenn etwas fertig ist.',
          'Absturzberichte gehen an unseren eigenen Fehler-Tracker (GlitchTip, auf unseren Servern). Sie tragen deine Konto-ID, damit wir das Problem finden — nie deinen Namen oder deine E-Mail-Adresse.',
          'Jede Anfrage der App nennt App-Version, Handymodell und Systemversion, damit wir wissen, welcher Build ein Problem hat.',
          'Der Foto-Editor meldet, wie lange seine aufwendigen Schritte auf deinem Handymodell gedauert haben — nur Zeiten und Größen, nie deine Bilder, deine Texte oder dein Konto.',
        ],
      },
      {
        title: 'Instagram und TikTok verbinden (freiwillig)',
        body: [
          'Die Diwche-App für iPhone, iPad und Android kann sich mit deinem Instagram- und deinem TikTok-Konto verbinden. Das ist freiwillig: Verbunden wird nur, was du selbst verbindest, und der Rest der App funktioniert auch ohne.',
          'Instagram wird über Instagrams eigene Anmeldung verbunden. Danach lesen wir dein Profil, die Liste deiner Beiträge und die Zahlen jedes Beitrags — Reichweite, Aufrufe, Likes, Kommentare, Speicherungen, Teilungen und neue Follower —, um dir in deinem Wochenplan zu zeigen, was funktioniert hat. Wenn du später bei einem Beitrag auf Veröffentlichen tippst, veröffentlichen wir genau diesen Beitrag auf deinem Instagram. Nichts, worauf du nicht Veröffentlichen getippt hast.',
          'TikTok wird mit „Login with TikTok“ verbunden. Danach lesen wir dein Basisprofil (Name und Profilbild), deine Follower- und Like-Zahlen und die Liste deiner Videos mit ihren Zahlen. Ein Video wird nur dann zu TikTok hochgeladen und veröffentlicht, wenn du in der App auf TikToks eigenem Veröffentlichungsbildschirm auf Veröffentlichen tippst — mit den Privatsphäre- und Interaktionseinstellungen, die du dort wählst.',
          'Wir sehen dein Instagram- oder TikTok-Passwort nie, fragen nicht danach und speichern es nicht. Die Zugangsschlüssel, die Instagram und TikTok uns geben, liegen verschlüsselt auf unseren eigenen Servern in Europa und werden nur für das oben Genannte genutzt.',
        ],
        points: [
          'Du kannst die Verbindung jederzeit trennen: in der App unter Your plan ▸ Where you post, oder in deinen Instagram- bzw. TikTok-Einstellungen. Danach endet unser Zugriff sofort.',
          'Was wir aus diesen Konten lesen, verkaufen wir nicht und nutzen es nicht für Werbung.',
          'Zum Löschen siehe unten „Dein Konto löschen“: Es ist binnen dreißig Tagen weg.',
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
        title: 'Instagram-Konten, die über unser Web-Dashboard verbunden sind',
        body: [
          'Einige Konten wurden früher über unser Web-Dashboard mit Instagram verbunden. Für sie gilt weiterhin Folgendes.',
          'Der Berechtigungsbildschirm hat genau das gezeigt, was wir nutzen: Profil und Beiträge lesen, die von dir geplanten Beiträge veröffentlichen, auf Kommentare und Direktnachrichten antworten. Mehr fordern wir nicht an, und Meta zeigt die vollständige Liste, bevor du zustimmst.',
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
          'Google — Anmelden mit Google, wenn du das wählst; Gemini, das Ideen und Skripte schreibt und die Sätze der kostenlosen Analyse formuliert; und Zustellen von Benachrichtigungen auf Android-Handys.',
          'OpenAI — Sprache in Text umwandeln, wenn ElevenLabs scheitert, und Schreiben, wenn Gemini nicht erreichbar ist.',
          'ElevenLabs — Sprache in Text umwandeln.',
          'Apify — Lesen der öffentlichen Instagram-Profile, die du nennst.',
          'Apple — Zustellen von Benachrichtigungen auf iPhones.',
          'Telegram — Übermitteln der kurzen Nachricht über eine neue Anmeldung an die Personen, die sie prüfen.',
          'Brevo — Versand der E-Mails, um die du gebeten hast.',
          'Cloudflare — Ausliefern dieser Seite, Weiterleiten des App-Verkehrs an unsere Server und Unterscheiden von Menschen und Skripten.',
          'Meta (Instagram) — die kostenlose Analyse, Instagram-Konten, die du in der App verbindest, und Konten, die über unser Web-Dashboard verbunden sind.',
          'TikTok — Login with TikTok, Lesen deines Profils und deiner Videos und Veröffentlichen der Videos, die du postest, wenn du TikTok verbindest.',
          'Unsere eigenen Server in Europa, auf denen die Anmeldung (Keycloak), der App-Server und der Fehler-Tracker laufen.',
        ],
      },
      {
        title: 'Dein Konto löschen',
        body: [
          `In der App löscht Profil ▸ Konto löschen deine Anmeldung sofort. Soll auch gelöscht werden, was du auf unseren Servern erstellt oder uns erzählt hast — das Profil deiner Seite, Ideen, Skripte, aufbewahrte Projekte —, schreib von der E-Mail-Adresse deines Kontos an ${CONTACT}. Wir erledigen das binnen dreißig Tagen und bestätigen es. Eine abgelehnte Anmeldung wird auf dieselbe Weise gelöscht.`,
          `Für die kostenlose Analyse und unsere E-Mails schreib von der Adresse, die du uns gegeben hast, oder mit dem eingegebenen Profilnamen an ${CONTACT}. Wir löschen alles, was wir über dich haben, und bestätigen es. Eine Begründung brauchst du nicht.`,
          'Was wir aus einem verbundenen Instagram- oder TikTok-Konto gelesen haben, samt den Zugangsschlüsseln, wird binnen dreißig Tagen gelöscht, wenn du dein Konto löschst oder uns schreibst.',
          'Trennst du die Verbindung in der App (Your plan ▸ Where you post), in deinen Instagram- oder TikTok-Einstellungen oder entfernst dich als Tester, endet der Zugriff sofort.',
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
          'Diwche is a content studio for your phone, operated by Helabyte. It helps you find ideas, write scripts, edit photos and videos, and add subtitles. If you choose, the phone app connects to your Instagram and TikTok to show how your posts did and to publish the posts you tap Publish on; see “Connected platforms” below.',
          'Some accounts were connected to Instagram earlier through our web dashboard. For those, Diwche publishes only what you scheduled, under the rules you set, and you can revoke the connection in your Instagram settings at any time.',
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
          'دیوچه یک استودیوی ساخت محتوا برای گوشی است که Helabyte اداره‌اش می‌کند. کمکت می‌کند ایده پیدا کنی، سناریو بنویسی، عکس و ویدیو ویرایش کنی و زیرنویس بگذاری. اگر بخواهی، اپ گوشی به اینستاگرام و تیک‌تاکت وصل می‌شود تا نشانت دهد پست‌هایت چطور عمل کرده‌اند و پست‌هایی را که خودت «انتشار» را برایشان زده‌ای منتشر کند؛ بخش «پلتفرم‌های وصل‌شده» را پایین‌تر ببین.',
          'بعضی حساب‌ها قبلاً از راه داشبورد وب ما به اینستاگرام وصل شده‌اند. برای آن‌ها دیوچه فقط همان چیزی را منتشر می‌کند که خودت زمان‌بندی کرده‌ای، طبق قواعدی که خودت گذاشته‌ای، و هر وقت بخواهی می‌توانی در تنظیمات اینستاگرامت دسترسی را قطع کنی.',
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
          'Diwche ist ein Content-Studio für dein Handy, betrieben von Helabyte. Es hilft dir, Ideen zu finden, Skripte zu schreiben, Fotos und Videos zu bearbeiten und Untertitel hinzuzufügen. Wenn du willst, verbindet sich die Handy-App mit deinem Instagram und TikTok, um dir zu zeigen, wie deine Beiträge gelaufen sind, und um die Beiträge zu veröffentlichen, bei denen du auf Veröffentlichen tippst; siehe „Verbundene Plattformen“ unten.',
          'Einige Konten wurden früher über unser Web-Dashboard mit Instagram verbunden. Für sie veröffentlicht Diwche nur, was du geplant hast, nach den Regeln, die du gesetzt hast, und du kannst die Verbindung jederzeit in deinen Instagram-Einstellungen widerrufen.',
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
