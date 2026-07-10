-- ============================================================
-- Lolo Cosmetics — 01: Schema (tables, constraints, triggers)
-- Run this FIRST in the Supabase SQL Editor.
-- ============================================================

-- ---------- Types ----------
create type public.user_role as enum ('owner', 'partner', 'employee');
create type public.review_status as enum ('pending', 'approved', 'rejected');

-- ---------- profiles: who may log in to /admin ----------
-- Linked 1:1 to Supabase Auth users. Role decides permissions.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  role       public.user_role not null default 'employee',
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table public.products (
  id            text primary key,                        -- e.g. 'mk6912' (keeps /product/mk6912 URLs)
  code          text not null unique,                    -- supplier code, e.g. 'MK6912'
  name_ar       text not null,
  brand         text,
  category      text not null
                check (category in ('makeup','skincare','body','hair','perfume','other')),
  size          text,
  retail_price  numeric(10,2) check (retail_price is null or retail_price >= 0),
  on_sale       boolean not null default false,
  sale_price    numeric(10,2) check (sale_price is null or sale_price >= 0),
  description   text not null default '',
  how_to_use    text not null default '',
  featured      boolean not null default false,
  is_published  boolean not null default true,           -- hide a product without deleting it
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- a discounted product must actually have a sale price
  constraint sale_price_required_when_on_sale
    check (not on_sale or sale_price is not null),
  -- the sale price must be lower than the normal price
  constraint sale_price_below_retail
    check (sale_price is null or retail_price is null or sale_price < retail_price)
);

create index products_category_idx  on public.products (category);
create index products_featured_idx  on public.products (featured) where featured;
create index products_on_sale_idx   on public.products (on_sale)  where on_sale;

-- ---------- product_images (max 15 per product) ----------
create table public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   text not null references public.products (id) on delete cascade,
  storage_path text not null,                            -- path inside the 'product-images' bucket
  alt          text,
  position     smallint not null default 0,              -- display order (0 = main image)
  created_at   timestamptz not null default now(),
  unique (product_id, position)
);

create index product_images_product_idx on public.product_images (product_id);

-- ---------- reviews ----------
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null references public.products (id) on delete cascade,
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 50),
  rating        smallint not null check (rating between 1 and 5),
  body          text not null check (char_length(body) between 1 and 200),  -- 200-char rule, enforced by the DB
  status        public.review_status not null default 'pending',            -- never public until approved
  is_pinned     boolean not null default false,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references auth.users (id)
);

create index reviews_product_idx  on public.reviews (product_id);
create index reviews_status_idx   on public.reviews (status);
create index reviews_pending_idx  on public.reviews (created_at) where status = 'pending';

-- ---------- review_images (max 3 per review) ----------
create table public.review_images (
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null references public.reviews (id) on delete cascade,
  storage_path text not null,
  position     smallint not null default 0,
  created_at   timestamptz not null default now(),
  unique (review_id, position)
);

create index review_images_review_idx on public.review_images (review_id);

-- ---------- page_views (analytics: one row per visit) ----------
create table public.page_views (
  id        bigserial primary key,
  path      text not null,                               -- e.g. '/products/makeup'
  viewed_at timestamptz not null default now(),
  referrer  text
);

create index page_views_viewed_at_idx on public.page_views (viewed_at desc);
create index page_views_path_idx      on public.page_views (path);

-- ============================================================
-- Triggers: enforce the image limits inside the database
-- ============================================================

create or replace function public.enforce_max_product_images()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.product_images where product_id = new.product_id) >= 15 then
    raise exception 'الحد الأقصى 15 صورة لكل منتج';
  end if;
  return new;
end;
$$;

create trigger trg_max_product_images
  before insert on public.product_images
  for each row execute function public.enforce_max_product_images();

create or replace function public.enforce_max_review_images()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.review_images where review_id = new.review_id) >= 3 then
    raise exception 'الحد الأقصى 3 صور لكل تقييم';
  end if;
  return new;
end;
$$;

create trigger trg_max_review_images
  before insert on public.review_images
  for each row execute function public.enforce_max_review_images();

-- keep products.updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- give every new Auth user a profile (default role: employee — an owner promotes them later)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- View: average rating per product (approved reviews only)
-- ============================================================
create view public.product_ratings
with (security_invoker = true) as
select
  product_id,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*)                       as review_count
from public.reviews
where status = 'approved'
group by product_id;
