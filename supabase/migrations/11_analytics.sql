-- ============================================================
-- Lolo Cosmetics — 11: Analytics views (Phase 8)
-- Run this in the Supabase SQL Editor after 01–10.
--
-- The page_views table + its RLS ("staff read analytics") already exist
-- from 01_schema.sql / 02_rls.sql. These are just aggregation views on
-- top of it, same pattern as product_ratings: security_invoker = true
-- means the view runs with the QUERYING user's permissions, so the
-- underlying page_views RLS still applies (visitors get nothing, staff
-- get the real numbers) — no separate RLS needed on the views.
-- ============================================================

create view public.page_views_daily
with (security_invoker = true) as
select
  date_trunc('day', viewed_at)::date as day,
  count(*)                           as views
from public.page_views
group by 1
order by 1;

create view public.page_views_by_path
with (security_invoker = true) as
select
  path,
  count(*) as views
from public.page_views
group by 1
order by views desc;
