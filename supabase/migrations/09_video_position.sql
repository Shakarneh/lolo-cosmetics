-- Phase 7 #5 (step 4) — place the product video ANYWHERE in the gallery.
-- Replaces the video_first boolean (08) with a real index.
--   video_position = 0 → before the first image
--   video_position = N → after the Nth image (clamped to the image count in the UI/gallery)

alter table public.products
  add column if not exists video_position smallint not null default 0;

-- carry over the old boolean, then drop it (guarded so this migration is re-runnable)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'video_first'
  ) then
    update public.products
       set video_position = case when coalesce(video_first, true) then 0 else 999 end
     where video_path is not null;

    alter table public.products drop column video_first;
  end if;
end $$;

comment on column public.products.video_position is
  'Gallery index of the product video: 0 = before the first image, N = after the Nth image.';
