/**
 * The page the confirmation link lands on.
 *
 * Short by design: the only thing anyone wants here is to know whether it
 * worked, and the next email is already on its way.
 */
export const CONFIRM_COPY = {
  "en": {
    "eyebrow": "Address confirmed",
    "working": "One moment…",
    "okTitle": "That is you. He is writing now.",
    "okBody": "What he found, and what he would do about it, are on their way to this address. It usually lands within a minute.",
    "badTitle": "That link did not work.",
    "badBody": "It may have expired, or it may have been mangled by a mail client. Ask for the read again, or write to support@diwche.com and a person will sort it out.",
    "again": "Read a page"
  },
  "fa": {
    "eyebrow": "ایمیل تأیید شد",
    "working": "یه لحظه…",
    "okTitle": "خودتی. همین حالا دارد می‌نویسد.",
    "okBody": "چیزی که پیدا کرده و کاری که با پیجت می‌کرد، در راه همین آدرس است. معمولاً کمتر از یک دقیقه طول می‌کشد.",
    "badTitle": "این لینک کار نکرد.",
    "badBody": "ممکن است منقضی شده باشد یا برنامه‌ی ایمیل خرابش کرده باشد. دوباره درخواست بده، یا به support@diwche.com بنویس تا یک آدم درستش کند.",
    "again": "یک پیج بخوان"
  },
  "de": {
    "eyebrow": "Adresse bestätigt",
    "working": "Einen Moment …",
    "okTitle": "Du bist es. Er schreibt gerade.",
    "okBody": "Was er gefunden hat und was er damit täte, sind an diese Adresse unterwegs. Meist in unter einer Minute da.",
    "badTitle": "Dieser Link hat nicht funktioniert.",
    "badBody": "Er ist vielleicht abgelaufen oder von einem Mailprogramm zerlegt worden. Frag die Analyse noch einmal an oder schreib an support@diwche.com — es kümmert sich ein Mensch darum.",
    "again": "Eine Seite lesen"
  }
} as const;
