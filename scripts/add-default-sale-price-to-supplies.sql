alter table public.supplies
  add column if not exists default_sale_price_per_unit integer not null default 0;

update public.supplies
set default_sale_price_per_unit = coalesce(default_sale_price_per_unit, 0);
