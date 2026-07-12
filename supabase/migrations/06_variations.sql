-- Phase 7 #4 — product variations (eBay-style, manual rows with per-variation price).
-- variations = null  → normal single-price product (unchanged behaviour).
-- variations = object → { attributes: text[], rows: [{ id, values:{attr:val}, name, price, code }] }
--   Each row is one purchasable variation with its OWN price/name/code. Per-variation
--   prices REPLACE retail_price/on_sale for that product (set null on save).
-- No new RLS needed: staff already have update rights on products (see 02_rls.sql).

alter table public.products
  add column if not exists variations jsonb;

comment on column public.products.variations is
  'eBay-style variations or null. { attributes: text[], rows: [{id, values, name, price, code}] }. Per-variation price replaces retail_price.';
