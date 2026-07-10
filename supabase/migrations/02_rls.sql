-- ============================================================
-- Lolo Cosmetics — 02: Row Level Security
-- Run this SECOND, after 01_schema.sql.
--
-- Rule of thumb: everything is DENIED until a policy allows it.
--   visitor  (anon)     : read published products, read approved reviews, submit a review, log a page view
--   employee            : manage products + moderate reviews
--   owner / partner     : everything, incl. deleting products and managing users
-- ============================================================

-- ---------- Helper functions ----------
-- security definer = these read profiles without triggering the profiles policy (avoids recursion)

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- owner or partner
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() in ('owner', 'partner'), false);
$$;

-- any logged-in staff member (owner, partner or employee)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() is not null;
$$;

-- ---------- Turn RLS on everywhere ----------
alter table public.profiles       enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.reviews        enable row level security;
alter table public.review_images  enable row level security;
alter table public.page_views     enable row level security;

-- ============================================================
-- profiles
-- ============================================================
create policy "staff read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "admins manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- products
-- ============================================================
create policy "anyone reads published products"
  on public.products for select
  using (is_published or public.is_staff());

create policy "staff create products"
  on public.products for insert
  with check (public.is_staff());

create policy "staff update products"
  on public.products for update
  using (public.is_staff())
  with check (public.is_staff());

-- deleting a product is destructive -> admins only (employees cannot)
create policy "admins delete products"
  on public.products for delete
  using (public.is_admin());

-- ============================================================
-- product_images
-- ============================================================
create policy "anyone reads product images"
  on public.product_images for select
  using (true);

create policy "staff manage product images"
  on public.product_images for all
  using (public.is_staff())
  with check (public.is_staff());

-- ============================================================
-- reviews
-- ============================================================
-- the public only ever sees approved reviews
create policy "anyone reads approved reviews"
  on public.reviews for select
  using (status = 'approved' or public.is_staff());

-- a visitor may submit a review, but only as 'pending' and never pre-pinned
create policy "anyone submits a pending review"
  on public.reviews for insert
  with check (status = 'pending' and is_pinned = false);

-- staff moderate: approve / reject / pin
create policy "staff moderate reviews"
  on public.reviews for update
  using (public.is_staff())
  with check (public.is_staff());

-- removing fake reviews is part of moderation
create policy "staff delete reviews"
  on public.reviews for delete
  using (public.is_staff());

-- ============================================================
-- review_images
-- ============================================================
-- visible only when the parent review is approved
create policy "anyone reads images of approved reviews"
  on public.review_images for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.reviews r
      where r.id = review_images.review_id
        and r.status = 'approved'
    )
  );

-- a visitor may attach photos to their own still-pending review
create policy "anyone attaches images to a pending review"
  on public.review_images for insert
  with check (
    exists (
      select 1 from public.reviews r
      where r.id = review_images.review_id
        and r.status = 'pending'
    )
  );

create policy "staff manage review images"
  on public.review_images for all
  using (public.is_staff())
  with check (public.is_staff());

-- ============================================================
-- page_views
-- ============================================================
-- visitors may log a view, but may never read the analytics
create policy "anyone logs a page view"
  on public.page_views for insert
  with check (true);

create policy "staff read analytics"
  on public.page_views for select
  using (public.is_staff());
