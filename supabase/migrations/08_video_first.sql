-- Phase 7 #5B+ — choose the primary media: video first, or the main image first.
-- true  → the video is shown first on the product page (default, current behaviour)
-- false → the chosen main image leads, and the video appears after the images
alter table public.products
  add column if not exists video_first boolean not null default true;

comment on column public.products.video_first is
  'true = video is the primary/first media; false = main image leads and video comes after.';
