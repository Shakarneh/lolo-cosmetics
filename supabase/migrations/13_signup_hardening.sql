-- ============================================================
-- Lolo Cosmetics — 13: Signup hardening (security audit 2026-07-16)
-- Run this in the Supabase SQL Editor after 01–12.
--
-- Before: EVERY new auth user automatically received a profiles row
-- with role 'employee' — i.e. full staff access. That was safe only
-- because public signups are disabled in the Dashboard, but it left
-- the door one accidental toggle away from strangers becoming staff.
--
-- After: new auth users get NO profile row (= no admin access at all).
-- The admin-users Edge Function now creates the profile itself when
-- the owner adds an employee from /admin/users.
--
-- ⚠️ Behavior change: creating an employee via Dashboard → Add user
-- no longer grants access — always use /admin/users instead.
-- ============================================================

drop trigger if exists trg_on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
