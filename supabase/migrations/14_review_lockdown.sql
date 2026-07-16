-- ============================================================
-- Lolo Cosmetics — 14: Review submission lockdown (security audit 2026-07-16)
-- Run this in the Supabase SQL Editor after 13.
--
-- Before: anonymous visitors could INSERT into reviews/review_images
-- and upload to the review-images bucket directly — no rate limit, so
-- a script could spam reviews or fill the 1 GB free storage.
--
-- After: all submission goes through the `submit-review` Edge Function,
-- which verifies a Cloudflare Turnstile token (proves a real human)
-- before inserting with the service key. Direct anonymous writes are
-- closed here.
--
-- ⚠️ Run this only right before deploying the new site code — the old
-- review form breaks the moment these policies are dropped.
-- (Supabase shows a "destructive operation" warning — expected, click Run.)
-- ============================================================

drop policy if exists "anyone submits a pending review" on public.reviews;
drop policy if exists "anyone attaches images to a pending review" on public.review_images;
drop policy if exists "anyone uploads review images" on storage.objects;

-- helper only existed for the dropped policy
drop function if exists public.review_is_pending(uuid);
