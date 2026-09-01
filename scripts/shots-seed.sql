-- Demo data for the marketing captures.
--
-- Invented on purpose and obviously so: a curated demo account, never a real
-- person's page. The funnel then masks every account-specific value anyway
-- (DNA §8) — this exists so the screens render their real chrome and real
-- layout instead of their empty states.
BEGIN;

-- The demo account speaks English.
--
-- Not cosmetic: with no language set, the app treats content as Persian (see
-- content-languages.ts, which defaults that way for this product's core
-- audience) and right-aligns every English topic, punctuation and all. The
-- capture then shows a real screen with a real bug in it.
UPDATE accounts SET language = 'en' WHERE id = 1;

-- ---- The account's direction ----------------------------------------------
-- Without one the Ideas page shows its "tell Diwche about the page first"
-- stepper instead of the feed, which captures as a perfectly composed screen
-- of the wrong thing.
INSERT INTO account_directions
  (account_id, version, audience, promise, pillars_json, voice, never_json,
   source_kind, approved_at, created_at, location, desired_action, on_camera)
VALUES
  (1, 1,
   'People who like paintings but were never taught how to look at one.',
   'One thing a week you did not know about a picture you have already seen.',
   '["History","Craft","Debate","Science"]',
   'Dry, curious, never reverent. Short sentences.',
   '["price speculation","artist gossip","AI-generated art"]',
   'MANUAL', now(), now(), 'Vienna', 'Follow for the next one', 'SOMETIMES');

-- ---- Ideas: today's topics -------------------------------------------------
INSERT INTO brain_topics
  (account_id, shown_on, title, hook, pillar, format, why_now, status, created_at, source_hint, fact_anchor)
SELECT 1, CURRENT_DATE, t.title, t.hook, t.pillar, t.format, t.why, 'NEW', now(), t.src, t.anchor
FROM (VALUES
  ('The pigment that bankrupted a city', 'Ultramarine cost more than gold, and one city bought it anyway.', 'History', 'REEL', 'A museum reopened the room this week', 'Rijksmuseum', 'Ground lapis, 1508'),
  ('Why nobody paints skies like this now', 'It is not nostalgia. The pigment stopped being made.', 'Craft', 'CAROUSEL', 'Two accounts you watch covered it', 'Colour archive', 'Discontinued 1957'),
  ('The forgery that hung for forty years', 'Three experts signed it off. A cleaner noticed.', 'Story', 'REEL', 'Anniversary of the ruling', 'Court record', '1947 acquisition'),
  ('One brush, thirty seconds', 'You have seen the result. You have not seen the stroke.', 'Craft', 'REEL', 'Your reels do best with process', 'Studio footage', 'Single-stroke method'),
  ('The colour that does not exist', 'Your screen cannot show it. Neither can print.', 'Science', 'CAROUSEL', 'Rising in your sources this week', 'Optics journal', 'Outside sRGB'),
  ('What restorers argue about', 'Clean it back to the original, or leave the century on it?', 'Debate', 'REEL', 'A restoration went public', 'Conservation weekly', 'Two schools since 1890')
) AS t(title, hook, pillar, format, why, src, anchor);

-- ---- Activity: a filled log ------------------------------------------------
INSERT INTO posted_articles
  (account_id, original_title, persian_title, caption, status, posted_at, source, source_feed_name, render_method, retry_count, image_url)
SELECT 1, a.title, a.fa, a.caption, a.status, now() - (a.days || ' days')::interval, 'RSS', a.feed, 'CAROUSEL', 0, ''
FROM (VALUES
  ('The pigment that bankrupted a city', 'رنگی که یک شهر را ورشکست کرد', 'Ultramarine cost more than gold.', 'POSTED', 1, 'Rijksmuseum'),
  ('Why nobody paints skies like this', 'چرا دیگر کسی آسمان را این‌طور نمی‌کشد', 'The pigment stopped being made.', 'POSTED', 2, 'Colour archive'),
  ('The forgery that hung for forty years', 'جعلی که چهل سال آویزان بود', 'Three experts signed it off.', 'POSTED', 4, 'Court record'),
  ('One brush, thirty seconds', 'یک قلم‌مو، سی ثانیه', 'You have seen the result.', 'PENDING_REVIEW', 0, 'Studio'),
  ('The colour that does not exist', 'رنگی که وجود ندارد', 'Your screen cannot show it.', 'POSTED', 6, 'Optics journal'),
  ('What restorers argue about', 'مرمت‌گران بر سر چه بحث می‌کنند', 'Clean it back, or leave the century on it?', 'POSTED', 8, 'Conservation weekly'),
  ('A frame is not a border', 'قاب حاشیه نیست', 'The frame was part of the commission.', 'POSTED', 11, 'Rijksmuseum'),
  ('The blue that came from a war', 'آبی که از یک جنگ آمد', 'Synthetic, cheap, and everywhere by 1830.', 'SKIPPED', 13, 'Colour archive')
) AS a(title, fa, caption, status, days, feed);

-- ---- Performance: ninety days of insights ----------------------------------
-- A shape rather than a straight line, so the charts look like measurements
-- instead of like a demo: a slow climb with a dip in the middle.
INSERT INTO account_daily_insights (account_id, insight_date, followers, reach, profile_views, accounts_engaged, captured_at)
SELECT 1,
       CURRENT_DATE - d,
       8200 + (90 - d) * 14 + (random() * 60)::int,
       2400 + ((90 - d) * 22)::int + (sin(d / 6.0) * 900)::int + (random() * 300)::int,
       310 + ((90 - d) * 3)::int + (sin(d / 5.0) * 90)::int,
       640 + ((90 - d) * 6)::int + (sin(d / 7.0) * 200)::int,
       now()
FROM generate_series(0, 89) AS d;

COMMIT;
