-- Mehmonlar (anon) menyuni o'qiy olishi uchun SELECT siyosatlari.
-- Supabase → SQL Editor ga qo'yib, Run bosing.
-- Qayta ishga tushirsa ham xato bermaydi (avval eski siyosat o'chiriladi).

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.restaurants enable row level security;

drop policy if exists "public read categories"  on public.categories;
drop policy if exists "public read products"    on public.products;
drop policy if exists "public read restaurants" on public.restaurants;

create policy "public read categories"  on public.categories  for select to anon, authenticated using (true);
create policy "public read products"    on public.products    for select to anon, authenticated using (true);
create policy "public read restaurants" on public.restaurants for select to anon, authenticated using (true);

grant select on public.categories, public.products, public.restaurants to anon, authenticated;
