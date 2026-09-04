-- Demo data for the marketing captures.
--
-- Invented on purpose and obviously so: a curated demo account, never a real
-- person's page. The funnel then masks every account-specific value anyway
-- (DNA §8) — this exists so the screens render their real chrome and real
-- layout instead of their empty states.
BEGIN;

-- ---- Re-runnable ------------------------------------------------------------
-- The stack is disposable but not always freshly created — a second run during a
-- writing session is normal, and an INSERT that appends instead of replacing
-- gives you twelve topics for today and two directions. Everything this file
-- owns is cleared first.
DELETE FROM account_daily_insights WHERE account_id IN (1, 2);
DELETE FROM posted_articles        WHERE account_id IN (1, 2);
DELETE FROM brain_topics           WHERE account_id IN (1, 2);
DELETE FROM account_directions     WHERE account_id IN (1, 2);

-- The demo account itself, so the file stands alone rather than assuming someone
-- created one through the UI first. Invented, and obviously so.
-- `page_name_fa` is the column behind the field the UI labels "Page Name"; the
-- `_fa` is left over from when this product only spoke Persian.
INSERT INTO accounts (id, name, page_name_fa, slogan, instagram_username, active, language,
                      instagram_token_status, bumper_start_clip_enabled,
                      bumper_start_clip_insert_sec, bumper_end_clip_enabled)
VALUES (1, 'Frame & Pigment', 'Frame & Pigment', 'How to look at a painting',
        'frame.and.pigment', true, 'en', 'NEVER_CONNECTED', true, 10.0, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, page_name_fa = EXCLUDED.page_name_fa, slogan = EXCLUDED.slogan,
  instagram_username = EXCLUDED.instagram_username, active = true;

-- The demo account speaks English.
--
-- Not cosmetic: with no language set, the app treats content as Persian (see
-- content-languages.ts, which defaults that way for this product's core
-- audience) and right-aligns every English topic, punctuation and all. The
-- capture then shows a real screen with a real bug in it.
UPDATE accounts SET language = 'en' WHERE id = 1;

-- ---- Account 1: a healthy Instagram connection -----------------------------
-- The guide's connection article documents a card with six possible badges, and
-- five of them are invisible on an account that was never connected. This is
-- what a real Instagram Login connection leaves behind, written directly rather
-- than obtained — no capture run ever calls Meta.
--
-- The token is the literal word "demo". It is never sent anywhere: `shoot.mjs`
-- refuses to run against anything but localhost, and the stack it runs against
-- is thrown away afterwards.
UPDATE accounts SET
  instagram_auth_flow             = 'INSTAGRAM',
  instagram_user_token            = 'demo-not-a-real-token',
  instagram_user_id               = '17841400000000001',
  instagram_token_status          = 'CONNECTED',
  instagram_granted_scopes        = 'instagram_business_basic,instagram_business_content_publish,'
                                 || 'instagram_business_manage_comments,instagram_business_manage_insights',
  instagram_connected_at          = now() - interval '38 days',
  instagram_token_checked_at      = now() - interval '6 hours',
  instagram_data_access_expires_at= now() + interval '52 days',
  webhook_subscribed_at           = now() - interval '38 days',
  instagram_followers_count       = 9420,
  instagram_follows_count         = 312,
  instagram_media_count           = 148,
  instagram_display_name          = 'Frame & Pigment',
  instagram_biography             = 'One thing a week about a picture you have already seen.'
WHERE id = 1;

-- ---- Account 2: never connected --------------------------------------------
-- So the "before you connect" capture is a real screen rather than the same card
-- with its badge edited. Deliberately bare: this is what a brand-new account
-- looks like ten seconds after it is created.
INSERT INTO accounts (id, name, active, language, instagram_token_status,
                      bumper_start_clip_enabled, bumper_start_clip_insert_sec,
                      bumper_end_clip_enabled)
VALUES (2, 'Second Page', true, 'en', 'NEVER_CONNECTED', true, 10.0, true)
ON CONFLICT (id) DO NOTHING;

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

-- Explicit ids above leave the identity sequence behind them, so the next account
-- created through the UI would collide. Push it past what this file inserted.
SELECT setval(pg_get_serial_sequence('accounts', 'id'),
              GREATEST((SELECT MAX(id) FROM accounts), 2));

COMMIT;
