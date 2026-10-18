-- afishionado: initial schema
-- Run in the Supabase SQL editor (or `supabase db push`), then run seed.sql.

-- Profiles ---------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by signed-in users"
  on public.profiles for select to authenticated using (true);

create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Catalog ----------------------------------------------------------------

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index brands_name_unique on public.brands (lower(name));

alter table public.brands enable row level security;

create policy "brands are readable by signed-in users"
  on public.brands for select to authenticated using (true);

create policy "signed-in users can add brands"
  on public.brands for insert to authenticated with check (created_by = auth.uid());

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  name text not null,
  species text not null,
  packing text,
  size_g integer check (size_g > 0),
  barcode text,
  image_url text,
  -- 'approved' tins are visible to everyone; 'pending' only to their creator.
  -- For a public launch, change the default to 'pending' and approve in the dashboard.
  status text not null default 'approved' check (status in ('approved', 'pending', 'rejected')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index products_brand_idx on public.products (brand_id);
create index products_species_idx on public.products (species);
create unique index products_barcode_unique on public.products (barcode) where barcode is not null;

alter table public.products enable row level security;

create policy "approved or own products are readable"
  on public.products for select to authenticated
  using (status = 'approved' or created_by = auth.uid());

create policy "signed-in users can add products"
  on public.products for insert to authenticated with check (created_by = auth.uid());

-- Check-ins --------------------------------------------------------------

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  rating numeric(2, 1) not null check (rating >= 0.5 and rating <= 5 and rating * 2 = floor(rating * 2)),
  note text,
  location text,
  -- Storage path in the private 'checkin-photos' bucket: <user_id>/<uuid>.jpg
  photo_path text,
  tried_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index checkins_user_idx on public.checkins (user_id, tried_on desc, created_at desc);
create index checkins_product_idx on public.checkins (product_id);

alter table public.checkins enable row level security;

-- v1 is a private tasting diary: you only see your own check-ins.
create policy "users read their own checkins"
  on public.checkins for select to authenticated using (user_id = auth.uid());

create policy "users add their own checkins"
  on public.checkins for insert to authenticated with check (user_id = auth.uid());

create policy "users update their own checkins"
  on public.checkins for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users delete their own checkins"
  on public.checkins for delete to authenticated using (user_id = auth.uid());

-- Community averages, without exposing anyone's individual check-ins.
create function public.product_stats(p_product_id uuid)
returns table (avg_rating numeric, checkin_count bigint)
language sql stable security definer set search_path = '' as $$
  select round(avg(rating), 2), count(*)
  from public.checkins
  where product_id = p_product_id;
$$;

revoke execute on function public.product_stats(uuid) from public, anon;
grant execute on function public.product_stats(uuid) to authenticated;

-- Wishlist ---------------------------------------------------------------

create table public.wishlist (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlist enable row level security;

create policy "users manage their own wishlist"
  on public.wishlist for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Photo storage ----------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('checkin-photos', 'checkin-photos', false)
on conflict (id) do nothing;

create policy "users read their own photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'checkin-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users upload their own photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'checkin-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'checkin-photos' and (storage.foldername(name))[1] = auth.uid()::text);
