-- ============================================================
-- Lolo Cosmetics — 12: Analytics date-range functions + owner-only lockdown
-- Run this in the Supabase SQL Editor after 01–11.
--
-- Two changes from Phase 8 v1:
--   1. Analytics is now OWNER-ONLY. The old "staff read analytics" policy let
--      employees read page_views too — tighten it to admins (owner) only.
--   2. The admin dashboard now filters by an arbitrary date range (up to a year)
--      instead of a fixed 14 days. PostgREST can't GROUP BY, so the all-time
--      views from migration 11 are replaced by two parametrized functions.
-- ============================================================

-- ---------- 1: owner-only read on the traffic log ----------
drop policy if exists "staff read analytics"  on public.page_views;
drop policy if exists "admins read analytics" on public.page_views;
create policy "admins read analytics"
  on public.page_views for select
  using (public.is_admin());

-- ---------- 2: range aggregation functions ----------
-- These replace the fixed all-time views from migration 11.
drop view if exists public.page_views_daily;
drop view if exists public.page_views_by_path;

-- Daily counts in [start_ts, end_ts). SECURITY INVOKER (the default) means the
-- function runs with the CALLER's privileges, so the owner-only RLS above still
-- applies — an employee calling this gets zero rows.
create or replace function public.page_views_daily_range(start_ts timestamptz, end_ts timestamptz)
returns table (day date, views bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select date_trunc('day', viewed_at)::date, count(*)
  from public.page_views
  where viewed_at >= start_ts and viewed_at < end_ts
  group by 1
  order by 1;
$$;

-- Per-path counts in the same window (every page, most-viewed first).
create or replace function public.page_views_by_path_range(start_ts timestamptz, end_ts timestamptz)
returns table (path text, views bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select path, count(*)
  from public.page_views
  where viewed_at >= start_ts and viewed_at < end_ts
  group by 1
  order by count(*) desc;
$$;
