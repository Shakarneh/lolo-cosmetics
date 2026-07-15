-- ============================================================
-- Lolo Cosmetics — 10: Packages (bundle several products into one card)
-- Run this in the Supabase SQL Editor after 01–09.
--
-- A package is a curated bundle: name + description + one bundle price +
-- its own photos, plus a list of included products (with quantity each).
-- Permissions mirror products exactly: any staff member (owner or
-- employee) can create/edit a package; only the owner can delete one.
-- ============================================================

create table public.packages (
  id           uuid primary key default gen_random_uuid(),
  name_ar      text not null,
  description  text not null default '',
  price        numeric(10,2) check (price is null or price >= 0), -- null → "تواصل معنا للسعر"
  is_published boolean not null default true,
  featured     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index packages_featured_idx on public.packages (featured) where featured;

create trigger trg_packages_updated_at
  before update on public.packages
  for each row execute function public.touch_updated_at();

-- ---------- package_items: which products (+ quantity) make up the bundle ----------
create table public.package_items (
  package_id uuid not null references public.packages (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  quantity   smallint not null default 1 check (quantity >= 1),
  position   smallint not null default 0,
  primary key (package_id, product_id)
);

create index package_items_package_idx on public.package_items (package_id);
create index package_items_product_idx on public.package_items (product_id);

-- ---------- package_images (max 15 per package, same rule as product_images) ----------
create table public.package_images (
  id           uuid primary key default gen_random_uuid(),
  package_id   uuid not null references public.packages (id) on delete cascade,
  storage_path text not null,
  alt          text,
  position     smallint not null default 0,
  created_at   timestamptz not null default now(),
  unique (package_id, position)
);

create index package_images_package_idx on public.package_images (package_id);

create or replace function public.enforce_max_package_images()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.package_images where package_id = new.package_id) >= 15 then
    raise exception 'الحد الأقصى 15 صورة لكل باقة';
  end if;
  return new;
end;
$$;

create trigger trg_max_package_images
  before insert on public.package_images
  for each row execute function public.enforce_max_package_images();

-- ---------- Storage bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'package-images',
  'package-images',
  true,
  5242880, -- 5 MB per file
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "staff upload package images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'package-images' and public.is_staff());

create policy "staff delete package images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'package-images' and public.is_staff());

-- ============================================================
-- RLS — same shape as products: everyone reads published, staff manage,
-- only owner/partner deletes.
-- ============================================================
alter table public.packages       enable row level security;
alter table public.package_items  enable row level security;
alter table public.package_images enable row level security;

create policy "anyone reads published packages"
  on public.packages for select
  using (is_published or public.is_staff());

create policy "staff create packages"
  on public.packages for insert
  with check (public.is_staff());

create policy "staff update packages"
  on public.packages for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "admins delete packages"
  on public.packages for delete
  using (public.is_admin());

create policy "anyone reads package items"
  on public.package_items for select
  using (true);

create policy "staff manage package items"
  on public.package_items for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "anyone reads package images"
  on public.package_images for select
  using (true);

create policy "staff manage package images"
  on public.package_images for all
  using (public.is_staff())
  with check (public.is_staff());
