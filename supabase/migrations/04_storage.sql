-- ============================================================
-- Lolo Cosmetics — 04: Storage bucket for product images
-- Run this FOURTH in the Supabase SQL Editor (after 01–03).
--
-- Bucket is PUBLIC (anyone can VIEW photos via their URL — that
-- is what a shop needs), but only staff can upload/delete, and
-- the product_images TABLE (max 15/product trigger) stays the
-- source of truth for what the site actually displays.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB per file (client compresses to ~100-300 KB anyway)
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- staff may upload into this bucket only
create policy "staff upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_staff());

-- staff may delete from this bucket only
create policy "staff delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_staff());
