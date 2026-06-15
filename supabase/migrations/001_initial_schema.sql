-- ============================================================
-- PasseFrontière — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type subscription_status as enum ('free', 'pro', 'enterprise');
create type work_location as enum ('home_country', 'work_country', 'third_country');
create type alert_type as enum ('warning', 'critical', 'info');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id                     uuid references auth.users(id) on delete cascade primary key,
  email                  text not null,
  full_name              text,
  avatar_url             text,
  subscription_status    subscription_status not null default 'free',
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CORRIDORS (reference data — V1 frontaliers France)
-- ============================================================
create table public.corridors (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  country_work    text not null,    -- ISO 3166-1 alpha-2 (LU, CH, DE, BE)
  country_residence text not null,  -- FR
  threshold_days  integer not null, -- fiscal threshold (max days outside work country)
  alert_days      integer[] not null default '{}', -- trigger alerts at these day counts
  description     text,
  legal_reference text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.corridors enable row level security;

-- Corridors are public read
create policy "Anyone can read active corridors"
  on public.corridors for select
  using (is_active = true);

-- Seed V1 corridors
insert into public.corridors (name, country_work, country_residence, threshold_days, alert_days, description, legal_reference) values
  (
    'France – Luxembourg',
    'LU', 'FR',
    19,
    '{10, 15, 17, 19}',
    'Les frontaliers français travaillant au Luxembourg peuvent télétravailler depuis la France jusqu''à 19 jours par an sans perdre le statut de frontalier fiscal.',
    'Avenant du 7 novembre 2022 à la convention fiscale franco-luxembourgeoise'
  ),
  (
    'France – Suisse',
    'CH', 'FR',
    45,
    '{25, 35, 40, 45}',
    'Les frontaliers français travaillant en Suisse peuvent télétravailler depuis la France jusqu''à 45 jours par an (accord entré en vigueur le 1er janvier 2023).',
    'Accord du 22 décembre 2022 entre la France et la Suisse'
  ),
  (
    'France – Allemagne',
    'DE', 'FR',
    45,
    '{25, 35, 40, 45}',
    'Les frontaliers français travaillant en Allemagne peuvent télétravailler depuis la France jusqu''à 45 jours par an.',
    'Accord franco-allemand sur le télétravail des frontaliers'
  ),
  (
    'France – Belgique',
    'BE', 'FR',
    24,
    '{12, 18, 22, 24}',
    'Les frontaliers français travaillant en Belgique peuvent télétravailler depuis la France jusqu''à 24 jours par an.',
    'Accord franco-belge sur le télétravail des frontaliers'
  );

-- ============================================================
-- WORK_DAYS (jour travaillé hors pays d'emploi)
-- ============================================================
create table public.work_days (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  corridor_id  uuid not null references public.corridors(id) on delete restrict,
  work_date    date not null,
  location     work_location not null default 'home_country',
  notes        text,
  year         integer not null generated always as (extract(year from work_date)::integer) stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique(user_id, corridor_id, work_date)
);

alter table public.work_days enable row level security;

create policy "Users can manage own work_days"
  on public.work_days for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_work_days_user_corridor_year
  on public.work_days(user_id, corridor_id, year);

create index idx_work_days_date
  on public.work_days(work_date);

-- ============================================================
-- ALERTS
-- ============================================================
create table public.alerts (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  corridor_id    uuid not null references public.corridors(id) on delete cascade,
  alert_type     alert_type not null,
  threshold_days integer not null,
  current_days   integer not null,
  message        text not null,
  is_read        boolean not null default false,
  sent_at        timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.alerts enable row level security;

create policy "Users can manage own alerts"
  on public.alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_alerts_user_unread
  on public.alerts(user_id, is_read) where is_read = false;

-- ============================================================
-- FUNCTION: count telework days for a user/corridor/year
-- ============================================================
create or replace function public.get_work_days_count(
  p_user_id    uuid,
  p_corridor_id uuid,
  p_year       integer
)
returns integer language sql stable security definer as $$
  select count(*)::integer
  from public.work_days
  where user_id     = p_user_id
    and corridor_id = p_corridor_id
    and year        = p_year
    and location    = 'home_country';
$$;

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_work_days_updated_at
  before update on public.work_days
  for each row execute procedure public.set_updated_at();
