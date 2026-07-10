-- ============================================================
-- Lolo Cosmetics — 05: Customer review submission (Phase 7.2)
-- Run this FIFTH in the Supabase SQL Editor.
--
-- 1) `review-images` bucket: public read, ANYONE may upload
--    (visitors attach up to 3 photos to their pending review —
--    the table trigger enforces the 3-photo limit), staff delete.
-- 2) FIX: the 02_rls.sql policy «anyone attaches images to a
--    pending review» checked the reviews table through a
--    subquery — but visitors can only SELECT approved reviews,
--    so the check could never see the pending parent and every
--    insert failed. A SECURITY DEFINER helper bypasses that.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-images',
  'review-images',
  true,
  5242880, -- 5 MB (client compresses to ~100-300 KB)
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "anyone uploads review images"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'review-images');

create policy "staff delete review images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'review-images' and public.is_staff());

-- checks the parent review without being blocked by the reviews RLS
create or replace function public.review_is_pending(rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.reviews where id = rid and status = 'pending');
$$;

drop policy "anyone attaches images to a pending review" on public.review_images;

create policy "anyone attaches images to a pending review"
  on public.review_images for insert
  with check (public.review_is_pending(review_id));
