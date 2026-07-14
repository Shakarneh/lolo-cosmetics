-- Phase 7 #5B — one optional video per product.
-- video_path = null → no video; else a path in the public `product-videos` bucket.

alter table public.products
  add column if not exists video_path text;

-- public-read bucket, 50 MB/file, common web video mime types
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-videos', 'product-videos', true, 52428800,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- public read needs no policy on a public bucket; staff-only writes (mirrors 04_storage.sql)
drop policy if exists "product-videos staff insert" on storage.objects;
create policy "product-videos staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-videos' and public.is_staff());

drop policy if exists "product-videos staff update" on storage.objects;
create policy "product-videos staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-videos' and public.is_staff());

drop policy if exists "product-videos staff delete" on storage.objects;
create policy "product-videos staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-videos' and public.is_staff());
