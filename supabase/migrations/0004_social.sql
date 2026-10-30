-- Friends: mutual friendships, per-check-in visibility, toasts, blocking and reports.
-- Existing check-ins stay private; owners choose to share them.

-- Profiles: the visibility new check-ins start with. -------------------------

alter table public.profiles
  add column if not exists default_visibility text not null default 'friends'
  check (default_visibility in ('private', 'friends'));

-- Check-in visibility. Rows that existed before this migration stay private. ---

alter table public.checkins add column if not exists visibility text not null default 'private'
  check (visibility in ('private', 'friends'));

-- Friendships ------------------------------------------------------------------

create table if not exists public.friendships (
  requester uuid not null references auth.users (id) on delete cascade,
  addressee uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (requester, addressee),
  check (requester <> addressee)
);

-- One friendship per pair, whichever way round it was requested.
create unique index if not exists friendships_pair_key
  on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists friendships_addressee_idx on public.friendships (addressee);

alter table public.friendships enable row level security;

create policy "people see their own friendships"
  on public.friendships for select to authenticated
  using (auth.uid() in (requester, addressee));

create policy "people send friend requests"
  on public.friendships for insert to authenticated
  with check (requester = auth.uid() and status = 'pending');

create policy "the invited person accepts"
  on public.friendships for update to authenticated
  using (addressee = auth.uid()) with check (addressee = auth.uid() and status = 'accepted');

create policy "either person can cancel, decline or unfriend"
  on public.friendships for delete to authenticated
  using (auth.uid() in (requester, addressee));

-- Blocks -----------------------------------------------------------------------

create table if not exists public.blocks (
  blocker uuid not null default auth.uid() references auth.users (id) on delete cascade,
  blocked uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);

alter table public.blocks enable row level security;

create policy "people manage their own blocks"
  on public.blocks for all to authenticated
  using (blocker = auth.uid()) with check (blocker = auth.uid());

-- Helpers (security definer so policies can use them without recursion). --------

create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester = a and addressee = b) or (requester = b and addressee = a))
  ) and not exists (
    select 1 from public.blocks
    where (blocker = a and blocked = b) or (blocker = b and blocked = a)
  );
$$;

revoke execute on function public.are_friends(uuid, uuid) from public, anon;
grant execute on function public.are_friends(uuid, uuid) to authenticated;

-- Blocking someone also ends any friendship or pending request with them.
create or replace function public.handle_block()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.friendships
  where (requester = new.blocker and addressee = new.blocked)
     or (requester = new.blocked and addressee = new.blocker);
  return new;
end;
$$;

drop trigger if exists on_block_created on public.blocks;
create trigger on_block_created after insert on public.blocks
  for each row execute function public.handle_block();

-- Requests to or from someone who blocked you are refused.
create policy "no requests across a block"
  on public.friendships as restrictive for insert to authenticated
  with check (not exists (
    select 1 from public.blocks
    where (blocker = requester and blocked = addressee) or (blocker = addressee and blocked = requester)
  ));

-- Find someone by their exact email (never lists or searches users).
create or replace function public.find_profile_by_email(p_email text)
returns table (id uuid, display_name text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name
  from auth.users u join public.profiles p on p.id = u.id
  where lower(u.email) = lower(trim(p_email))
  limit 1;
$$;

revoke execute on function public.find_profile_by_email(text) from public, anon;
grant execute on function public.find_profile_by_email(text) to authenticated;

-- Friends can read each other's shared check-ins. ------------------------------

create policy "friends read shared checkins"
  on public.checkins for select to authenticated
  using (visibility = 'friends' and public.are_friends(auth.uid(), user_id));

-- ...and the photos on them (checkins RLS above decides which rows are visible).
create policy "friends read photos on shared checkins"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'checkin-photos'
    and exists (select 1 from public.checkins c where c.photo_path = name or c.thumb_path = name)
  );

-- Toasts (one-tap cheers on a check-in you can see). ---------------------------

create table if not exists public.toasts (
  checkin_id uuid not null references public.checkins (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (checkin_id, user_id)
);

alter table public.toasts enable row level security;

create policy "toasts on visible checkins are visible"
  on public.toasts for select to authenticated
  using (exists (select 1 from public.checkins c where c.id = checkin_id));

create policy "people toast checkins they can see"
  on public.toasts for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.checkins c where c.id = checkin_id));

create policy "people remove their own toasts"
  on public.toasts for delete to authenticated using (user_id = auth.uid());

-- Reports (read in the Supabase dashboard; nobody can read them through the app). --

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null default auth.uid() references auth.users (id) on delete cascade,
  checkin_id uuid references public.checkins (id) on delete set null,
  reported_user uuid references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "people file reports"
  on public.reports for insert to authenticated with check (reporter = auth.uid());
