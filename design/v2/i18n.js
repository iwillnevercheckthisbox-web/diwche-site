/* diwche.com v2 languages: English (source), Deutsch, فارسی.
   Text nodes are translated by their English source string; elements with data-tk swap their whole
   inner HTML (sentences with inline styling, where word order must change). Persian sets dir="rtl"
   and the page's faces switch to Vazirmatn in site.css. The choice is remembered per browser. */
(() => {
  const D = {
    // ---------- shared chrome ----------
    'Main': ['Hauptmenü', 'منوی اصلی'],
    'How it works': ['So funktioniert’s', 'چطور کار می‌کنه'],
    'Post': ['Beitrag', 'پست'],
    'Who it’s for': ['Für wen', 'برای کیه'],
    'Language': ['Sprache', 'زبان'],
    'Get the app': ['App holen', 'اپ رو بگیر'],
    'Diwche · v2 design prototype': ['Diwche · v2-Designprototyp', 'دیوچه · نمونه‌ی طراحی نسخه‌ی ۲'],
    'Quiet style, shared with the apps': ['Quiet-Stil, derselbe wie in den Apps', 'سبک آرام، همون سبک اپ‌ها'],
    'Your page, run by someone paying attention.': ['Deine Seite, betreut von jemandem, der aufpasst.', 'پیجت، دست کسی که حواسش هست.'],

    // ---------- hero ----------
    'For people who run a page': ['Für alle, die eine Seite betreiben', 'برای کسایی که پیج دارن'],
    'Tell Diwche about your page once. Each morning it brings you ideas, writes the script, and builds every format from it: posts, carousels, stories, reels and voiceovers, shaped for each channel.':
      ['Erzähl Diwche einmal von deiner Seite. Jeden Morgen bringt es dir Ideen, schreibt das Skript und baut daraus jedes Format: Beiträge, Karussells, Stories, Reels und Voiceover, passend für jeden Kanal.',
       'یه بار پیجت رو به دیوچه معرفی کن. هر صبح برات ایده میاره، متنش رو می‌نویسه و ازش همه‌چی می‌سازه: پست، کاروسل، استوری، ریلز و صداگذاری، هرکدوم به اندازه‌ی کانال خودش.'],
    'Try the Post studio': ['Post-Studio ausprobieren', 'استودیوی پست رو امتحان کن'],

    // ---------- explainer ----------
    'One idea becomes a script; the script builds a post, a carousel, a story, a reel and a voiceover; the look is shuffled; everything goes out to six channels.':
      ['Eine Idee wird zum Skript; das Skript baut Beitrag, Karussell, Story, Reel und Voiceover; der Look wird gemischt; alles geht an sechs Kanäle.',
       'یه ایده می‌شه متن؛ متن، پست و کاروسل و استوری و ریلز و صداگذاری رو می‌سازه؛ جلوه عوض می‌شه؛ همه‌چی می‌ره رو شش تا کانال.'],
    'html:mx1': ['Eine Idee.', 'یه ایده.'],
    'html:mx2': ['Wird zum Skript.', 'می‌شه یه متن.'],
    'html:mx3': ['Das Skript baut <em>jedes Format</em>.', 'متن، <em>همه‌ی فرمت‌ها</em> رو می‌سازه.'],
    'html:mx4': ['Den Look mischen.', 'جلوه رو بچین.'],
    'html:mx5': ['Raus auf jeden Kanal.', 'می‌ره رو همه‌ی کانال‌ها.'],
    'html:mx6': ['Eine Idee rein. <em>Jeder Kanal</em> raus.', 'یه ایده بده. <em>همه‌ی کانال‌ها</em> رو بگیر.'],
    'Myth': ['Mythos', 'افسانه'],
    "She's not smiling at you.": ['Sie lächelt nicht dich an.', 'به تو لبخند نمی‌زنه.'],
    'She’s not smiling at you.': ['Sie lächelt nicht dich an.', 'به تو لبخند نمی‌زنه.'],
    'Smile questions get the most saves on your page.': ['Fragen zum Lächeln werden auf deiner Seite am häufigsten gespeichert.', 'سؤال‌های لبخند، بیشترین ذخیره رو تو پیجت دارن.'],
    'Script': ['Skript', 'متن'],
    'Hook': ['Hook', 'قلاب'],
    'Body': ['Inhalt', 'بدنه'],
    'Ask': ['Aufruf', 'دعوت'],
    'Leonardo blurred the corners of her mouth on purpose.': ['Leonardo hat ihre Mundwinkel absichtlich verwischt.', 'لئوناردو گوشه‌های لبش رو عمداً محو کشیده.'],
    'Follow for one painting a day.': ['Folge uns für ein Gemälde am Tag.', 'فالو کن، هر روز یه نقاشی.'],
    'Follow for one painting a day': ['Folge uns für ein Gemälde am Tag', 'فالو کن، هر روز یه نقاشی'],
    'Carousel': ['Karussell', 'کاروسل'],
    'Story': ['Story', 'استوری'],
    'Reel': ['Reel', 'ریلز'],
    'Voiceover': ['Voiceover', 'صداگذاری'],
    'Look': ['Look', 'جلوه'],
    'Caption look': ['Untertitel-Look', 'سبک زیرنویس'],
    'Shuffle': ['Mischen', 'دوباره بچین'],
    'Blog': ['Blog', 'وبلاگ'],
    'Fri': ['Fr', 'جمعه'], 'Sat': ['Sa', 'شنبه'],
    'Diw at work': ['Diw bei der Arbeit', 'دیو سر کار'],
    'Done. Six channels, on time.': ['Fertig. Sechs Kanäle, pünktlich.', 'تموم شد. شش تا کانال، سر وقت.'],
    'Pause': ['Pause', 'توقف'], 'Play': ['Abspielen', 'پخش'],
    'Idea': ['Idee', 'ایده'], 'Formats': ['Formate', 'فرمت‌ها'], 'Looks': ['Looks', 'جلوه‌ها'], 'Channels': ['Kanäle', 'کانال‌ها'], 'Done': ['Fertig', 'تموم'],

    // ---------- Post studio ----------
    'Create · Post': ['Erstellen · Beitrag', 'بساز · پست'],
    'One photo. Every look the app has.': ['Ein Foto. Jeder Look aus der App.', 'یه عکس. همه‌ی جلوه‌های اپ.'],
    'This is the Post screen from the app. Pick a photo, then a look from the same 67 the app grades with, a caption look from its 30, or a one-tap recipe. Or press Shuffle and let it surprise you. Your own photo works too, and it never leaves this page.':
      ['Das ist der Beitrags-Screen aus der App. Wähl ein Foto, dann einen der 67 Looks, mit denen die App färbt, einen der 30 Untertitel-Looks oder ein Rezept mit einem Tipp. Oder drück auf Mischen und lass dich überraschen. Dein eigenes Foto geht auch, und es verlässt diese Seite nie.',
       'این همون صفحه‌ی پست تو اپه. یه عکس انتخاب کن، بعد یکی از همون ۶۷ جلوه‌ای که اپ باهاش رنگ می‌ده، یکی از ۳۰ سبک زیرنویس، یا یه دستور آماده با یه ضربه. یا «دوباره بچین» رو بزن و غافلگیر شو. عکس خودتم کار می‌کنه و هیچ‌وقت از این صفحه بیرون نمی‌ره.'],
    'The photo with the chosen look': ['Das Foto mit dem gewählten Look', 'عکس با جلوه‌ی انتخاب‌شده'],
    'Photo': ['Foto', 'عکس'],
    'Recipes': ['Rezepte', 'دستورها'],
    'One tap: a look at its own strength': ['Ein Tipp: ein Look in seiner eigenen Stärke', 'یه ضربه: یه جلوه با شدت خودش'],
    '67 looks · 10 families': ['67 Looks · 10 Familien', '۶۷ جلوه · ۱۰ خانواده'],
    'Look strength': ['Look-Stärke', 'شدت جلوه'],
    '30 looks · 5 shelves': ['30 Looks · 5 Regale', '۳۰ سبک · ۵ قفسه'],
    'The looks are the app’s own colour tables, applied here pixel by pixel. Captions use each look’s real font, colours and highlight: colour, fill-in or bounce.':
      ['Die Looks sind die Farbtabellen der App, hier Pixel für Pixel angewendet. Die Untertitel nutzen die echte Schrift, Farben und Hervorhebung jedes Looks: Farbe, Füllen oder Hüpfen.',
       'جلوه‌ها همون جدول‌های رنگ خود اپ‌ان که اینجا پیکسل به پیکسل اعمال می‌شن. زیرنویس‌ها هم فونت، رنگ و حالت برجسته‌ی واقعی هر سبک رو دارن: رنگی، پرشونده یا پرشی.'],
    'Your look is ready': ['Dein Look ist fertig', 'جلوه‌ت آماده‌ست'],
    'Grading the light': ['Ich färbe das Licht', 'دارم نورش رو رنگ می‌کنم'],
    'Opening your photo': ['Ich öffne dein Foto', 'دارم عکست رو باز می‌کنم'],
    'Reading your photo': ['Ich lese dein Foto', 'دارم عکست رو می‌خونم'],
    'That photo could not be opened. Try another.': ['Das Foto ließ sich nicht öffnen. Versuch ein anderes.', 'این عکس باز نشد. یه عکس دیگه رو امتحان کن.'],
    'Your photo': ['Dein Foto', 'عکس خودت'],
    'Your page, your look.': ['Deine Seite, dein Look.', 'پیج خودت، جلوه‌ی خودت.'],
    'Original': ['Original', 'اصلی'],
    'Suggested': ['Vorgeschlagen', 'پیشنهادی'], 'All': ['Alle', 'همه'],
    'Portrait': ['Porträt', 'پرتره'], 'Film': ['Film', 'فیلم'], 'Mono': ['Mono', 'سیاه‌وسفید'], 'Retro': ['Retro', 'رترو'], 'Warm': ['Warm', 'گرم'],
    'Cool': ['Kühl', 'سرد'], 'Landscape': ['Landschaft', 'منظره'], 'Food': ['Essen', 'غذا'], 'Night': ['Nacht', 'شب'], 'Cinematic': ['Kino', 'سینمایی'],
    'Popular': ['Beliebt', 'محبوب'], 'Simple': ['Schlicht', 'ساده'], 'Words': ['Wörter', 'کلمه‌ای'], 'Bold': ['Kräftig', 'پررنگ'], 'New': ['Neu', 'جدید'],
    // Caption look names: German keeps the app's English names; Persian from fa.looks.json
    'Clean': [null, 'تمیز'], 'Gold fill': [null, 'پر طلایی'], 'Yellow word': [null, 'کلمه‌ی زرد'], 'Big word': [null, 'کلمه‌ی درشت'], 'Box': [null, 'کادر'],
    'Green word': [null, 'کلمه‌ی سبز'], 'White': [null, 'سفید'], 'Shadow': [null, 'سایه'], 'Serif': [null, 'گیره‌دار'], 'Editorial': [null, 'مجله‌ای'],
    'Soft box': [null, 'کادر نرم'], 'Low': [null, 'پایین'], 'One word': [null, 'یه کلمه'], 'Gold word': [null, 'کلمه‌ی طلایی'], 'Two big': [null, 'دو درشت'],
    'Caps': [null, 'حروف بزرگ'], 'Red box': [null, 'کادر قرمز'], 'Middle': [null, 'وسط'], 'Anton': [null, 'آنتون'], 'Unbounded': [null, 'آنباندد'],
    'Blue': [null, 'آبی'], 'Sapphire box': [null, 'کادر یاقوتی'], 'Black & yellow': [null, 'سیاه و زرد'], 'Top': [null, 'بالا'], 'Newsline': [null, 'خبری'],
    'Marker': [null, 'ماژیک'], 'Headline': [null, 'تیتر'], 'Quiet': [null, 'آرام'], 'Centre stage': [null, 'وسط صحنه'], 'Two tone': [null, 'دو رنگ'],

    // ---------- story ----------
    'Follow one idea': ['Folge einer Idee', 'یه ایده رو دنبال کن'],
    'From a voice note to six channels, in the app you already hold.': ['Von der Sprachnachricht zu sechs Kanälen, in der App, die du schon in der Hand hast.', 'از یه پیام صوتی تا شش کانال، تو همون اپی که دستته.'],
    '01 Onboarding': ['01 Einstieg', '۰۱ شروع'],
    'Tell it about your page, out loud.': ['Erzähl laut von deiner Seite.', 'پیجت رو با صدای بلند تعریف کن.'],
    'Talk for a minute about what you post and who for. Diwche turns it into a brief: your niche, your voice, your people, how often you want to post.':
      ['Sprich eine Minute darüber, was du postest und für wen. Diwche macht daraus ein Briefing: deine Nische, deine Stimme, deine Leute, wie oft du posten willst.',
       'یه دقیقه بگو چی پست می‌کنی و برای کی. دیوچه ازش یه خلاصه می‌سازه: حوزه‌ت، لحنت، مخاطبت، و اینکه چند وقت یه بار می‌خوای پست بذاری.'],
    'Voice or text': ['Stimme oder Text', 'صدا یا متن'],
    '02 Ideas': ['02 Ideen', '۰۲ ایده‌ها'],
    'Every morning, ideas that fit your page.': ['Jeden Morgen Ideen, die zu deiner Seite passen.', 'هر صبح، ایده‌هایی که به پیجت می‌خورن.'],
    'It reads what your corner of the internet is talking about today and hands you a few ideas, each with the hook and the reason it should work for you.':
      ['Es liest, worüber deine Ecke des Internets heute spricht, und gibt dir ein paar Ideen, jede mit Hook und dem Grund, warum sie bei dir funktionieren sollte.',
       'می‌خونه امروز گوشه‌ی اینترنتِ تو درباره‌ی چی حرف می‌زنه و چندتا ایده بهت می‌ده، هرکدوم با قلابش و دلیل اینکه چرا باید برای تو جواب بده.'],
    '03 Plan': ['03 Plan', '۰۳ برنامه'],
    'Pick one. It finds the slot.': ['Wähl eine. Es findet den Platz.', 'یکی رو انتخاب کن. خودش جاش رو پیدا می‌کنه.'],
    'The week fills itself around the rhythm you chose. Done posts turn green, planned ones wait in grey, and you can drag anything around.':
      ['Die Woche füllt sich nach deinem Rhythmus. Erledigte Beiträge werden grün, geplante warten in Grau, und du kannst alles verschieben.',
       'هفته خودش با ریتمی که انتخاب کردی پر می‌شه. پست‌های رفته سبز می‌شن، برنامه‌ریزی‌شده‌ها خاکستری منتظر می‌مونن، و هرچی رو بخوای جابه‌جا می‌کنی.'],
    '04 Script': ['04 Skript', '۰۴ متن'],
    'A script in your voice.': ['Ein Skript in deiner Stimme.', 'یه متن با لحن خودت.'],
    'Hook, body, call to action. Change a line by typing or by talking, and it rewrites around you without losing the point.':
      ['Hook, Inhalt, Aufruf. Ändere eine Zeile per Tippen oder Sprechen, und es schreibt drumherum neu, ohne den Punkt zu verlieren.',
       'قلاب، بدنه، دعوت. یه خط رو با تایپ یا با حرف زدن عوض کن، بقیه‌ش رو دورش بازنویسی می‌کنه بدون اینکه حرف اصلی گم بشه.'],
    '05 Make': ['05 Machen', '۰۵ ساخت'],
    'One script, four shapes.': ['Ein Skript, vier Formen.', 'یه متن، چهار شکل.'],
    'The same script becomes a post, a carousel, a reel with word-by-word captions, and a voiceover. You watch Diw work through it, one honest line at a time.':
      ['Dasselbe Skript wird Beitrag, Karussell, Reel mit Wort-für-Wort-Untertiteln und Voiceover. Du siehst Diw dabei zu, eine ehrliche Zeile nach der anderen.',
       'همون متن می‌شه پست، کاروسل، ریلز با زیرنویس کلمه‌به‌کلمه، و صداگذاری. دیو رو می‌بینی که کار می‌کنه، هر بار با یه خط صادقانه.'],
    '06 Publish': ['06 Veröffentlichen', '۰۶ انتشار'],
    'Shaped for each channel, sent on time.': ['Für jeden Kanal geformt, pünktlich raus.', 'به اندازه‌ی هر کانال، سر وقت.'],
    'Square for the feed, vertical for TikTok and Shorts, a voice note and a caption for Telegram, an article for your blog, a thread for X. Each goes out at its own best hour.':
      ['Quadratisch für den Feed, hochkant für TikTok und Shorts, Sprachnachricht und Text für Telegram, ein Artikel für deinen Blog, ein Thread für X. Jedes zu seiner besten Stunde.',
       'مربع برای فید، عمودی برای تیک‌تاک و شورتس، پیام صوتی و کپشن برای تلگرام، یه مقاله برای وبلاگت، یه رشته‌توییت برای ایکس. هرکدوم سر بهترین ساعت خودش.'],
    '07 See how it did': ['07 Ergebnis sehen', '۰۷ ببین چطور شد'],
    'Then it tells you what worked.': ['Dann sagt es dir, was funktioniert hat.', 'بعد بهت می‌گه چی جواب داد.'],
    "Results come back per channel, in plain words, and the next morning's ideas lean toward what your people actually watched.":
      ['Die Ergebnisse kommen pro Kanal, in klaren Worten, und die Ideen am nächsten Morgen richten sich nach dem, was deine Leute wirklich geschaut haben.',
       'نتیجه‌ها برای هر کانال، با زبون ساده برمی‌گردن، و ایده‌های صبح بعد می‌رن سمت چیزی که مخاطبت واقعاً دیده.'],
    'New page': ['Neue Seite', 'پیج جدید'],
    'Tell me about your page': ['Erzähl mir von deiner Seite', 'از پیجت بگو'],
    'html:said': ['„Ich betreibe eine Kunst-Meme-Seite. Ich will, dass sich Leute <em>in alte Gemälde verlieben</em>, ohne Vortrag.“', '«یه پیج میم هنری دارم. می‌خوام مردم بدون کلاس درس <em>عاشق نقاشی‌های قدیمی بشن</em>.»'],
    'Art history': ['Kunstgeschichte', 'تاریخ هنر'],
    'Funny, never snobby': ['Witzig, nie snobistisch', 'بامزه، نه از بالا'],
    '1 post a day': ['1 Beitrag am Tag', 'روزی ۱ پست'],
    'Thursday': ['Donnerstag', 'پنجشنبه'],
    "Today's ideas": ['Ideen von heute', 'ایده‌های امروز'],
    'Behind the paint': ['Hinter der Farbe', 'پشت رنگ'],
    'Why everyone in old portraits looks tired.': ['Warum alle auf alten Porträts müde aussehen.', 'چرا همه تو پرتره‌های قدیمی خسته‌ان.'],
    'Series': ['Serie', 'سری'],
    'Three paintings that are secretly memes.': ['Drei Gemälde, die heimlich Memes sind.', 'سه تا نقاشی که در اصل میم‌ان.'],
    'This week': ['Diese Woche', 'این هفته'],
    'Thursday 30': ['Donnerstag, 30.', 'پنجشنبه ۳۰'],
    'The pearl is probably not a pearl': ['Die Perle ist wohl keine Perle', 'مروارید احتمالاً مروارید نیست'],
    'The pearl is probably not a pearl.': ['Die Perle ist wohl keine Perle.', 'مروارید احتمالاً مروارید نیست.'],
    'Planned': ['Geplant', 'برنامه‌ریزی‌شده'],
    'Reel · Carousel · Voice': ['Reel · Karussell · Stimme', 'ریلز · کاروسل · صدا'],
    'Fits your 3 a week. Evenings do best for you.': ['Passt zu deinen 3 pro Woche. Abends läuft es bei dir am besten.', 'با ۳تا در هفته‌ت جور درمیاد. عصرها برات بهتر جواب می‌ده.'],
    'Look at her eyes and she smiles. Look at her lips and she stops.': ['Schau ihr in die Augen, und sie lächelt. Schau auf die Lippen, und sie hört auf.', 'به چشم‌هاش نگاه کن، لبخند می‌زنه. به لب‌هاش نگاه کن، تموم می‌شه.'],
    'Ready': ['Fertig', 'آماده'],
    '5 slides': ['5 Folien', '۵ اسلاید'],
    'Voice': ['Stimme', 'صدا'],
    'Burning the captions in': ['Ich brenne die Untertitel ein', 'دارم زیرنویس رو می‌چسبونم رو ویدیو'],
    'Going out': ['Geht raus', 'داره می‌ره'],
    'Reel · Carousel': ['Reel · Karussell', 'ریلز · کاروسل'],
    'YouTube Shorts': ['YouTube Shorts', 'یوتیوب شورتس'],
    'Voice note · Post': ['Sprachnachricht · Beitrag', 'پیام صوتی · پست'],
    'Article from the script': ['Artikel aus dem Skript', 'مقاله از روی متن'],
    'Coming soon': ['Bald', 'به‌زودی'],
    'Thread': ['Thread', 'رشته‌توییت'],
    'How it did': ['So lief es', 'چطور شد'],
    'Shorts': ['Shorts', 'شورتس'],
    'Views after 48 hours. Example numbers.': ['Aufrufe nach 48 Stunden. Beispielzahlen.', 'بازدید بعد از ۴۸ ساعت. عددها نمونه‌ان.'],
    'For tomorrow': ['Für morgen', 'برای فردا'],
    'Myths worked. Three more ideas like this are waiting.': ['Mythen kamen gut an. Drei weitere Ideen dieser Art warten.', 'افسانه‌ها جواب دادن. سه تا ایده‌ی دیگه مثل این منتظرن.'],

    // ---------- Diw ----------
    'The idea behind Diw': ['Die Idee hinter Diw', 'ایده‌ی پشت دیو'],
    'No spinners': ['Keine Spinner', 'بدون چرخ‌چرخک'],
    'No fake progress': ['Kein falscher Fortschritt', 'بدون پیشرفت الکی'],
    'Leave any time': ['Jederzeit gehen', 'هر وقت خواستی برو'],
    'English and Tehrani Persian': ['Englisch und Teheraner Persisch', 'انگلیسی و فارسی تهرانی'],
    'Your reel': ['Dein Reel', 'ریلز تو'],
    'You can leave. I keep going.': ['Du kannst gehen. Ich mache weiter.', 'می‌تونی بری، من ادامه می‌دم.'],
    'Opening the video': ['Ich öffne das Video', 'دارم ویدیو رو باز می‌کنم'],
    'Sending the audio': ['Ich sende den Ton', 'دارم صدا رو می‌فرستم'],
    'Listening word by word': ['Ich höre Wort für Wort zu', 'دارم کلمه به کلمه گوش می‌دم'],
    'Rendering your video': ['Ich rendere dein Video', 'دارم ویدیوت رو می‌سازم'],
    'Your video is ready · Open': ['Dein Video ist fertig · Öffnen', 'ویدیوت آماده‌ست، ببین'],
    'Step {n} of {t}': ['Schritt {n} von {t}', 'مرحله‌ی {n} از {t}'],

    // ---------- channels ----------
    'Same idea, six places': ['Dieselbe Idee, sechs Orte', 'یه ایده، شش جا'],
    'Shaped for the place it lands.': ['Geformt für den Ort, an dem sie landet.', 'به شکل جایی که می‌رسه.'],
    'Each channel gets its own cut: the right size, length, caption and hour. Nothing is copied and pasted between them.':
      ['Jeder Kanal bekommt seinen eigenen Schnitt: die richtige Größe, Länge, Beschriftung und Uhrzeit. Nichts wird einfach kopiert.',
       'هر کانال برش خودش رو می‌گیره: اندازه، طول، کپشن و ساعت درست. هیچی کپی‌پیست نمی‌شه.'],
    'Girl with a Pearl Earring, Vermeer, as an Instagram carousel slide': ['Das Mädchen mit dem Perlenohrgehänge, Vermeer, als Instagram-Karussellfolie', 'دختری با گوشواره‌ی مروارید، ورمیر، به شکل اسلاید کاروسل اینستاگرام'],
    'oldmasters.daily · Swipe for the proof': ['oldmasters.daily · Wisch für den Beweis', 'oldmasters.daily · بکش برای مدرک'],
    'Carousel, 4:5': ['Karussell, 4:5', 'کاروسل، ۴:۵'],
    '@oldmasters.daily · original sound': ['@oldmasters.daily · Originalton', '@oldmasters.daily · صدای اصلی'],
    'Reel, 9:16, Teal & orange look': ['Reel, 9:16, Look Teal & orange', 'ریلز، ۹:۱۶، جلوه‌ی Teal & orange'],
    'Short, Mono look': ['Short, Look Mono', 'شورت، جلوه‌ی Mono'],
    'Raphael’s girlfriend, probably. Tell us who you see 👀': ['Raffaels Freundin, vermutlich. Sag uns, wen du siehst 👀', 'احتمالاً دوست‌دختر رافائل. بگو کی رو می‌بینی 👀'],
    'Photo, voice note and post': ['Foto, Sprachnachricht und Beitrag', 'عکس، پیام صوتی و پست'],
    'Myths · 3 min read': ['Mythen · 3 Min. Lesezeit', 'افسانه‌ها · ۳ دقیقه مطالعه'],
    'Why she isn’t smiling at you': ['Warum sie nicht dich anlächelt', 'چرا به تو لبخند نمی‌زنه'],
    'She’s not smiling at you. A thread on the most famous mouth in art 🧵': ['Sie lächelt nicht dich an. Ein Thread über den berühmtesten Mund der Kunst 🧵', 'به تو لبخند نمی‌زنه. یه رشته درباره‌ی معروف‌ترین لب تاریخ هنر 🧵'],
    '1/ Leonardo blurred the corners of her mouth on purpose.': ['1/ Leonardo hat ihre Mundwinkel absichtlich verwischt.', '۱/ لئوناردو گوشه‌های لبش رو عمداً محو کشیده.'],
    'Sargent painted her in one sitting': ['Sargent hat sie in einer Sitzung gemalt', 'سارجنت تو یه جلسه کشیدش'],
    'Thread, 5 posts': ['Thread, 5 Beiträge', 'رشته، ۵ پست'],

    // ---------- who ----------
    'Different pages, the same engine.': ['Verschiedene Seiten, derselbe Motor.', 'پیج‌های مختلف، یه موتور.'],
    'A nutritionist, a small shop, a café, a coach, a Persian page, a meme account. Each gets its own ideas, its own look and its own week.':
      ['Eine Ernährungsberaterin, ein kleiner Shop, ein Café, ein Coach, eine persische Seite, ein Meme-Account. Jede bekommt ihre eigenen Ideen, ihren eigenen Look und ihre eigene Woche.',
       'یه متخصص تغذیه، یه فروشگاه کوچیک، یه کافه، یه مربی، یه پیج فارسی، یه پیج میم. هرکدوم ایده‌ها، جلوه و هفته‌ی خودشون رو می‌گیرن.'],
    'See every use case': ['Alle Anwendungsfälle ansehen', 'همه‌ی نمونه‌ها رو ببین'],
    // v3: content from 0 to 100, the tools, Make a post templates, contact
    'Tools': ['Werkzeuge', 'ابزارها'],
    'Templates': ['Vorlagen', 'قالب‌ها'],
    'Get early access': ['Früher Zugang', 'زودتر شروع کن'],
    'Content from 0 to 100': ['Content von 0 auf 100', 'محتوا از صفر تا صد'],
    'html:hero2': ['Vom Kennenlernen<br>bis zum <em>fertigen Beitrag</em>.', 'از شناختن تو<br>تا <em>پست آماده</em>.'],
    'Diwche gets to know you and your page, brings you ideas every morning, writes the script for each medium, from story to post to reel, and gives you the tools to make them: Photo Studio, Video Studio, D1, templates and looks. Then it shows you what worked.':
      ['Diwche lernt dich und deine Seite kennen, bringt dir jeden Morgen Ideen, schreibt das Skript für jedes Medium, von der Story über den Beitrag bis zum Reel, und gibt dir die Werkzeuge, um sie zu machen: Photo Studio, Video Studio, D1, Vorlagen und Looks. Danach zeigt es dir, was funktioniert hat.',
       'دیوچه تو و پیجت رو می‌شناسه، هر صبح برات ایده میاره، برای هر قالبی متنش رو می‌نویسه، از استوری و پست تا ریلز، و ابزار ساختنشون رو می‌ده دستت: استودیو عکس، استودیو ویدیو، D1، قالب‌ها و جلوه‌ها. بعدشم نشونت می‌ده چی جواب داد.'],
    'See the tools': ['Die Werkzeuge ansehen', 'ابزارها رو ببین'],
    'From 0 to 100': ['Von 0 auf 100', 'از صفر تا صد'],
    'From knowing you to knowing what worked.': ['Vom Kennenlernen bis zum Wissen, was funktioniert hat.', 'از شناختن تو تا فهمیدن اینکه چی جواب داد.'],
    '0 · Knows you': ['0 · Kennt dich', '۰ · تو رو می‌شناسه'],
    '15 · Ideas': ['15 · Ideen', '۱۵ · ایده‌ها'],
    '30 · Plan': ['30 · Plan', '۳۰ · برنامه'],
    '45 · Scripts': ['45 · Skripte', '۴۵ · متن‌ها'],
    '70 · Make': ['70 · Machen', '۷۰ · ساختن'],
    '85 · Publish': ['85 · Veröffentlichen', '۸۵ · انتشار'],
    '100 · See how it did': ['100 · Wie es lief', '۱۰۰ · ببین چطور بود'],
    'First, it gets to know you.': ['Zuerst lernt es dich kennen.', 'اول، تو رو می‌شناسه.'],
    'A script for every medium.': ['Ein Skript für jedes Medium.', 'یه متن برای هر قالب.'],
    'One idea, written for each shape it takes: a hook for the post, slides for the carousel, frames for the story, spoken lines for the reel. Change a line by typing or by talking.':
      ['Eine Idee, geschrieben für jede Form, die sie annimmt: ein Aufhänger für den Beitrag, Folien fürs Karussell, Bilder für die Story, gesprochene Zeilen fürs Reel. Ändere eine Zeile per Tippen oder per Sprache.',
       'یه ایده، برای هر شکلی که می‌گیره جدا نوشته می‌شه: یه قلاب برای پست، اسلایدها برای کاروسل، فریم‌ها برای استوری، جمله‌های گفتنی برای ریلز. هر خطی رو خواستی با تایپ یا با حرف زدن عوض کن.'],
    'Then the tools to make it.': ['Dann die Werkzeuge, um es zu machen.', 'بعد، ابزار ساختنش.'],
    'Each script opens in the right tool, already filled in. You finish it your way, and Diw tells you what it is doing, one honest line at a time.':
      ['Jedes Skript öffnet sich im richtigen Werkzeug, schon ausgefüllt. Du machst es auf deine Art fertig, und Diw sagt dir, was er gerade tut, eine ehrliche Zeile nach der anderen.',
       'هر متن تو ابزار درستش باز می‌شه، از قبل پر شده. تو به سبک خودت تمومش می‌کنی، و دیو با یه خط صادقانه می‌گه داره چی کار می‌کنه.'],
    'Photo Studio': ['Photo Studio', 'استودیو عکس'],
    'Video Studio': ['Video Studio', 'استودیو ویدیو'],
    'The tools to make it': ['Die Werkzeuge dafür', 'ابزار ساختنش'],
    'Every idea gets a workshop.': ['Jede Idee bekommt eine Werkstatt.', 'هر ایده یه کارگاه داره.'],
    'The script lands in the right tool, already filled in. Finish it by hand, or let Diw take the first pass and change what you like.':
      ['Das Skript landet im richtigen Werkzeug, schon ausgefüllt. Mach es von Hand fertig, oder lass Diw den ersten Entwurf machen und ändere, was du willst.',
       'متن تو ابزار درستش می‌شینه، از قبل پر شده. یا خودت دستی تمومش کن، یا بذار دیو دور اول رو بره و هر جاش رو خواستی عوض کن.'],
    'Crop, retouch, lift the subject off the background, add text and stickers. Persian text runs right to left on its own.':
      ['Zuschneiden, retuschieren, das Motiv vom Hintergrund lösen, Text und Sticker hinzufügen. Persischer Text läuft von selbst von rechts nach links.',
       'برش بزن، روتوش کن، سوژه رو از پس‌زمینه جدا کن، متن و استیکر بذار. متن فارسی خودش راست‌به‌چپ می‌شه.'],
    'One timeline for cuts, music, word-by-word captions, text, looks and your own voice.':
      ['Eine Zeitleiste für Schnitte, Musik, Wort-für-Wort-Untertitel, Text, Looks und deine eigene Stimme.',
       'یه تایم‌لاین برای برش، موزیک، زیرنویس کلمه‌به‌کلمه، متن، جلوه‌ها و صدای خودت.'],
    'Drop in your raw clips. D1 watches them, cuts a reel to your script and the beat, and opens it in the Video Studio for you to finish.':
      ['Wirf deine Rohclips rein. D1 schaut sie sich an, schneidet ein Reel zu deinem Skript und zum Takt und öffnet es im Video Studio, damit du es fertig machst.',
       'کلیپ‌های خامت رو بریز تو. D1 نگاهشون می‌کنه، روی متنت و ضرب آهنگ یه ریلز می‌بُره و تو استودیو ویدیو بازش می‌کنه که خودت تمومش کنی.'],
    'Make a post': ['Beitrag machen', 'پست بساز'],
    'Your photo in a template that moves. Shuffle until one feels right.': ['Dein Foto in einer Vorlage, die sich bewegt. Misch, bis eine passt.', 'عکست تو یه قالب که تکون می‌خوره. اون‌قدر بُر بزن تا یکی به دلت بشینه.'],
    'New on the menu': ['Neu auf der Karte', 'تازه تو منو'],
    'OCT': ['OKT', 'آبان'],
    'Create · Make a post': ['Erstellen · Beitrag machen', 'ساختن · پست بساز'],
    'Your photo. A template that moves.': ['Dein Foto. Eine Vorlage, die sich bewegt.', 'عکس تو. یه قالب که تکون می‌خوره.'],
    'Pick a photo and shuffle. Each template recreates a motion reference with your picture: the frame settles, the type comes in, the label lands. Tap a text and it moves to the next spot the template allows.':
      ['Wähl ein Foto und misch. Jede Vorlage baut eine Bewegungsreferenz mit deinem Bild nach: der Rahmen setzt sich, die Schrift kommt rein, das Label landet. Tipp auf einen Text, und er springt an die nächste Stelle, die die Vorlage erlaubt.',
       'یه عکس انتخاب کن و بُر بزن. هر قالب یه ویدیوی مرجع رو با عکس تو دوباره می‌سازه: قاب می‌شینه، نوشته میاد، برچسب فرود میاد. روی یه متن بزن تا بره جای بعدی‌ای که قالب اجازه می‌ده.'],
    'Date stamp': ['Datumsstempel', 'مُهر تاریخ'],
    'Thin frame': ['Feiner Rahmen', 'قاب نازک'],
    'Price tag': ['Preisschild', 'برچسب قیمت'],
    'Tape polaroid': ['Polaroid mit Klebeband', 'پولاروید چسب‌خورده'],
    'Lower third': ['Bauchbinde', 'زیرنویس پایین'],
    'Stacked word': ['Großes Wort', 'کلمه‌ی درشت'],
    'Speech bubble': ['Sprechblase', 'حباب حرف'],
    'Tap to move this text': ['Tippen, um diesen Text zu verschieben', 'بزن تا این متن جابه‌جا بشه'],
    'New on the menu: oat flat white.': ['Neu auf der Karte: Flat White mit Hafer.', 'تازه تو منو: فلت وایت با شیر جو.'],
    'Sargent painted her in one sitting.': ['Sargent hat sie in einer Sitzung gemalt.', 'سارجنت تو یه جلسه کشیدش.'],
    'Smile': ['Lächeln', 'لبخند'], 'Fresh': ['Frisch', 'تازه'], 'Crunch': ['Knack', 'ترد'], 'Tested': ['Getestet', 'تست‌شده'],
    'Tahdig': ['Tahdig', 'ته‌دیگ'], 'Morning': ['Morgen', 'صبح'], 'Move': ['Beweg dich', 'تکون بخور'], 'Pearl': ['Perle', 'مروارید'], 'Sargent': ['Sargent', 'سارجنت'],
    'A small Diw that does the work.': ['Ein kleiner Diw, der die Arbeit macht.', 'یه دیو کوچیک که کار رو انجام می‌ده.'],
    'html:diw2': ['In persischen Geschichten ist ein Diw (<span class="fa">دیو</span>) der Riese, der über Nacht einen Palast baut. Diwche ist ein kleiner, und er arbeitet für dich. Dabei zeigt er dir nie einen Spinner. Er sagt dir in einer ehrlichen Zeile, was er gerade tut, und du kannst gehen: Er macht weiter und sagt dir, wenn er fertig ist.',
                  'تو قصه‌های ایرانی، دیو همون غولیه که یه‌شبه قصر می‌سازه. دیوچه یه دیو کوچیکه که برای تو کار می‌کنه. موقع کار هیچ‌وقت چرخ‌چرخک نشونت نمی‌ده؛ با یه خط صادقانه می‌گه دقیقاً داره چی کار می‌کنه، و تو می‌تونی بری: اون کارش رو ادامه می‌ده و وقتی تموم شد خبرت می‌کنه.'],
    'Diw at a desk under a lamp, writing in a ledger': ['Diw am Schreibtisch unter einer Lampe, schreibt in ein Buch', 'دیو پشت میز زیر نور چراغ، داره تو دفترش می‌نویسه'],
    'Your page, from 0 to 100.': ['Deine Seite, von 0 auf 100.', 'پیجت، از صفر تا صد.'],
    'Your content from 0 to 100, on your phone.': ['Dein Content von 0 auf 100, auf deinem Handy.', 'محتوای تو از صفر تا صد، تو گوشیت.'],
    'Talk to us': ['Schreib uns', 'با ما در تماس باش'],
    'A real person reads this one.': ['Hier liest ein Mensch mit.', 'این یکی رو یه آدم واقعی می‌خونه.'],
    'Legal': ['Rechtliches', 'قوانین'],
    'Privacy': ['Datenschutz', 'حریم خصوصی'],
    'Terms': ['AGB', 'شرایط استفاده'],
    'A huge library of looks and caption styles, the same in every tool.': ['Eine riesige Bibliothek an Looks und Untertitel-Stilen, in jedem Werkzeug dieselbe.', 'یه کتابخونه‌ی بزرگ از جلوه‌ها و سبک‌های زیرنویس، تو همه‌ی ابزارها یکی.'],
    'A whole library': ['Eine ganze Bibliothek', 'یه کتابخونه‌ی کامل'],
    'Words that move': ['Wörter, die sich bewegen', 'کلمه‌هایی که تکون می‌خورن'],
    'A huge library, always growing': ['Eine riesige Bibliothek, die ständig wächst', 'یه کتابخونه‌ی بزرگ که همیشه داره بزرگ‌تر می‌شه'],
    'Every template moves: the frame settles, the type slides in, the label lands.': ['Jede Vorlage bewegt sich: Der Rahmen setzt sich, die Schrift gleitet herein, das Label landet.', 'هر قالب تکون می‌خوره: قاب می‌شینه، نوشته سُر می‌خوره تو، برچسب فرود میاد.'],
    'Text finds its own place, readable and never over a face.': ['Text findet seinen Platz, lesbar und nie über einem Gesicht.', 'متن خودش جاش رو پیدا می‌کنه، خوانا و هیچ‌وقت روی صورت.'],
    'Tap any text to move it somewhere else.': ['Tipp auf einen Text, um ihn woanders hinzusetzen.', 'روی هر متنی بزن تا ببریش یه جای دیگه.'],
    'Your name and logo, placed for you on every post.': ['Dein Name und dein Logo, auf jedem Beitrag für dich platziert.', 'اسم و لوگوت، روی هر پست سر جاش.'],
    'Tap a text to move it': ['Tipp auf einen Text, um ihn zu verschieben', 'روی یه متن بزن تا جابه‌جا بشه'],
    'This one stays put': ['Der bleibt, wo er ist', 'این یکی سر جاش می‌مونه'],
    'html:final3': ['Bald im App Store und bei Google Play, auf Englisch, Deutsch und <span lang="fa">فارسی</span>.', 'به‌زودی تو اپ‌استور و گوگل‌پلی، به انگلیسی، آلمانی و <span lang="fa">فارسی</span>.'],
    'Get early access, or just say hello.': ['Hol dir frühen Zugang, oder sag einfach Hallo.', 'زودتر شروع کن، یا فقط یه سلام بده.'],
    'Tell us about your page. A real person reads every message and writes back.': ['Erzähl uns von deiner Seite. Ein Mensch liest jede Nachricht und antwortet.', 'از پیجت برامون بگو. یه آدم واقعی همه‌ی پیام‌ها رو می‌خونه و جواب می‌ده.'],
    'Your name': ['Dein Name', 'اسمت'],
    'Email': ['E-Mail', 'ایمیل'],
    'Your page': ['Deine Seite', 'پیجت'],
    'Message': ['Nachricht', 'پیام'],
    'I want early access': ['Ich will frühen Zugang', 'می‌خوام زودتر شروع کنم'],
    'Send': ['Senden', 'بفرست'],
    'Contact': ['Kontakt', 'تماس'],
    'Please fill in your name, a working email and a message.': ['Bitte gib deinen Namen, eine gültige E-Mail und eine Nachricht ein.', 'لطفاً اسمت، یه ایمیل درست و یه پیام بنویس.'],
    'Thank you. Your mail app opens with the message ready to send.': ['Danke. Deine Mail-App öffnet sich mit der fertigen Nachricht.', 'مرسی. اپ ایمیلت با پیام آماده باز می‌شه.'],
    'Real tahdig takes patience.': ['Echtes Tahdig braucht Geduld.', 'ته‌دیگ واقعی صبر می‌خواد.'],
    'Breakfast in three minutes.': ['Frühstück in drei Minuten.', 'صبحونه در سه دقیقه.'],
    'Taste-tested by the boss.': ['Vom Chef persönlich getestet.', 'رئیس خودش تستش کرده.'],
    'Ten minutes. No excuses.': ['Zehn Minuten. Keine Ausreden.', 'ده دقیقه. بی‌بهونه.'],
    'Why our flat white tastes better at 9am.': ['Warum unser Flat White um 9 Uhr besser schmeckt.', 'چرا فلت وایت ما ساعت ۹ صبح خوشمزه‌تره.'],
    'Latte art being poured': ['Latte Art wird gegossen', 'داره روی قهوه نقش می‌کشه'],
    'Tahdig with barberries and pistachio': ['Tahdig mit Berberitzen und Pistazien', 'ته‌دیگ با زرشک و پسته'],
    'A dog catching treats': ['Ein Hund fängt Leckerlis', 'یه سگ که داره تشویقی می‌گیره'],
    'Photos on Unsplash by Shiva Mardahi, Brooke Lark, Dogfluence, Fahmi Fakhrudin and Rahul Gupta. Paintings: Leonardo da Vinci, Johannes Vermeer, John Singer Sargent, Raphael and William-Adolphe Bouguereau, all public domain.':
      ['Fotos auf Unsplash von Shiva Mardahi, Brooke Lark, Dogfluence, Fahmi Fakhrudin und Rahul Gupta. Gemälde: Leonardo da Vinci, Johannes Vermeer, John Singer Sargent, Raffael und William-Adolphe Bouguereau, alle gemeinfrei.',
       'عکس‌ها از Unsplash، کار شیوا مردهی، بروک لارک، Dogfluence، فهمی فخرالدین و راهول گوپتا. نقاشی‌ها: لئوناردو داوینچی، یوهانس ورمیر، جان سینگر سارجنت، رافائل و ویلیام بوگرو؛ همه آزاد از حق نشر.'],
  };

  const KEY = 'diwche.lang';
  const IDX = { de: 0, fa: 1 };
  let lang = 'en';
  try { lang = localStorage.getItem(KEY) || ''; } catch (e) {}
  if (!['en', 'de', 'fa'].includes(lang)) {
    const n = (navigator.language || 'en').toLowerCase();
    lang = n.startsWith('fa') ? 'fa' : n.startsWith('de') ? 'de' : 'en';
  }

  const t = (en, l = lang) => { if (l === 'en') return en; const row = D[en]; return (row && row[IDX[l]]) || en; };
  const tf = (en, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replace('{' + k + '}', v), t(en));
  const digits = (s) => lang === 'fa' ? String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]) : String(s);

  // Remember each text node's English once, then translate from it every time.
  const src = new WeakMap(), attrSrc = new WeakMap();
  function walk(root) {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n =>
      n.parentElement && !n.parentElement.closest('script,style,svg,[data-tk],[data-no-t]') && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    let n; while ((n = tw.nextNode())) {
      if (!src.has(n)) src.set(n, n.nodeValue);
      const orig = src.get(n), key = orig.trim().replace(/\s+/g, ' ');
      const out = t(key);
      n.nodeValue = out === key ? orig : orig.replace(orig.trim(), out);
    }
    root.querySelectorAll('[aria-label],[alt]').forEach(el => ['aria-label', 'alt'].forEach(a => {
      if (!el.hasAttribute(a) || !el.getAttribute(a)) return;
      let m = attrSrc.get(el); if (!m) attrSrc.set(el, m = {});
      if (!(a in m)) m[a] = el.getAttribute(a);
      el.setAttribute(a, t(m[a]));
    }));
    root.querySelectorAll('[data-tk]').forEach(el => {
      if (!el.dataset.en) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : (D['html:' + el.dataset.tk] || [])[IDX[lang]] || el.dataset.en;
    });
  }

  function apply() {
    const html = document.documentElement;
    html.lang = lang; html.dir = lang === 'fa' ? 'rtl' : 'ltr';
    walk(document.body);
    document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  function set(l) { lang = l; try { localStorage.setItem(KEY, l); } catch (e) {} apply(); }

  window.I18N = { t, tf, digits, get lang() { return lang; }, set, apply, walk, dict: D };
  const boot = () => {
    document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => set(b.dataset.l)));
    apply();
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
