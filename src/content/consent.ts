/**
 * The consent page's own words.
 *
 * Deliberately NOT the clauses — those come from the backend, because the row
 * that gets written stores the hash of exactly what the backend served. These
 * are the labels around them.
 */
export const CONSENT_COPY = {
  "en": {
    "eyebrow": "Before he can connect it",
    "lead": "Diwche has not been through Meta’s review yet, so until it has, only people we name in our Meta app can connect an Instagram account. This is where you tell us we may name you.",
    "handleLabel": "Your Instagram handle",
    "emailLabel": "Your email address",
    "agree": "I have read the above and I agree to it.",
    "submit": "I agree — add me",
    "working": "One moment…",
    "doneTitle": "He has it.",
    "doneBody": "We will add your handle to the app and email you as soon as it is done, with what to click in Instagram to accept. Usually the same day.",
    "privacy": "How we handle your data",
    "privacyHref": "/privacy",
    "missing": "He could not load the wording just now, so there is nothing to agree to yet. Try again in a minute, or write to support@diwche.com.",
    "handleInvalid": "That is not an Instagram handle — letters, numbers, dots.",
    "emailInvalid": "That address does not look right.",
    "agreeFirst": "Tick the box, and he will know he may go ahead.",
    "failed": "Something went wrong on our side, not yours."
  },
  "fa": {
    "eyebrow": "قبل از اینکه بتواند وصل شود",
    "lead": "دیوچه هنوز بررسی رسمی متا را نگذرانده، پس تا آن زمان فقط کسانی که نامشان را در اپلیکیشن متای ما ثبت کنیم می‌توانند اکانت اینستاگرام وصل کنند. اینجا به ما می‌گویی که اجازه داریم نام تو را ثبت کنیم.",
    "handleLabel": "آیدی اینستاگرامت",
    "emailLabel": "ایمیلت",
    "agree": "بالا را خواندم و با آن موافقم.",
    "submit": "موافقم — اضافه‌ام کن",
    "working": "یه لحظه…",
    "doneTitle": "گرفتش.",
    "doneBody": "آیدی‌ات را به اپلیکیشن اضافه می‌کنیم و به‌محض انجام شدن برایت ایمیل می‌زنیم، با توضیح این‌که در اینستاگرام کجا را بزنی تا بپذیری. معمولاً همان روز.",
    "privacy": "با اطلاعاتت چه می‌کنیم",
    "privacyHref": "/fa/privacy",
    "missing": "الان نتوانست متن را بیاورد، پس فعلاً چیزی برای موافقت کردن نیست. یک دقیقه دیگر امتحان کن، یا به support@diwche.com بنویس.",
    "handleInvalid": "این آیدی اینستاگرام نیست — حروف، عدد و نقطه.",
    "emailInvalid": "این آدرس درست به نظر نمی‌رسد.",
    "agreeFirst": "تیک را بزن تا بداند اجازه دارد ادامه بدهد.",
    "failed": "یه چیزی از سمت ما به هم ریخت، نه از سمت تو."
  },
  "de": {
    "eyebrow": "Bevor er es verbinden kann",
    "lead": "Diwche hat Metas Review noch nicht durchlaufen. Bis dahin können nur Personen ein Instagram-Konto verbinden, die wir in unserer Meta-App namentlich eintragen. Hier sagst du uns, dass wir dich eintragen dürfen.",
    "handleLabel": "Dein Instagram-Profilname",
    "emailLabel": "Deine E-Mail-Adresse",
    "agree": "Ich habe das oben Stehende gelesen und stimme zu.",
    "submit": "Ich stimme zu — trag mich ein",
    "working": "Einen Moment …",
    "doneTitle": "Hat er.",
    "doneBody": "Wir tragen deinen Profilnamen in die App ein und schreiben dir, sobald es erledigt ist — samt Anleitung, wo du in Instagram zustimmst. Meist noch am selben Tag.",
    "privacy": "Was wir mit deinen Daten machen",
    "privacyHref": "/de/privacy",
    "missing": "Der Text ließ sich gerade nicht laden, also gibt es noch nichts, dem du zustimmen könntest. Versuch es gleich noch einmal oder schreib an support@diwche.com.",
    "handleInvalid": "Das ist kein Instagram-Profilname — Buchstaben, Zahlen, Punkte.",
    "emailInvalid": "Diese Adresse sieht nicht richtig aus.",
    "agreeFirst": "Setz das Häkchen, damit er weiß, dass er darf.",
    "failed": "Bei uns ist etwas schiefgegangen, nicht bei dir."
  }
} as const;
