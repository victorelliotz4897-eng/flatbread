-- Flatbread structured database schema
-- Run in Supabase SQL editor (or via supabase sql) after creating your Supabase project.

create extension if not exists pgcrypto;

-- Optional legacy bucket table kept for backward compatibility with existing app-state route code.
create table if not exists public.flatbread_app_state (
  state_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_flatbread_app_state_updated_at()
returns trigger
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_flatbread_app_state_updated_at on public.flatbread_app_state;
create trigger trg_touch_flatbread_app_state_updated_at
before update on public.flatbread_app_state
for each row
execute procedure public.touch_flatbread_app_state_updated_at();

create table if not exists public.places (
  id text primary key,
  name text not null,
  date text not null,
  date_raw text,
  visit_date date,
  address text,
  lat double precision,
  lng double precision,
  is_custom boolean not null default false,
  is_closed boolean not null default false,
  host_user_id text,
  ordered_items text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_places_updated_at()
returns trigger
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_places_updated_at on public.places;
create trigger trg_touch_places_updated_at
before update on public.places
for each row
execute procedure public.touch_places_updated_at();

create index if not exists idx_places_host_user on public.places (host_user_id);
create index if not exists idx_places_closed on public.places (is_closed) where is_closed = true;
create index if not exists idx_places_custom on public.places (is_custom);

create table if not exists public.place_hints (
  place_id text not null references public.places(id) on delete cascade,
  display_name text,
  hint_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (place_id)
);

create or replace function public.touch_place_hints_updated_at()
returns trigger
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_place_hints_updated_at on public.place_hints;
create trigger trg_touch_place_hints_updated_at
before update on public.place_hints
for each row
execute procedure public.touch_place_hints_updated_at();

create table if not exists public.rankings (
  user_id text primary key,
  ranking jsonb not null default '[]'::jsonb,
  pending jsonb not null default '[]'::jsonb,
  undo_stack jsonb not null default '[]'::jsonb,
  session jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_rankings_updated_at()
returns trigger
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_rankings_updated_at on public.rankings;
create trigger trg_touch_rankings_updated_at
before update on public.rankings
for each row
execute procedure public.touch_rankings_updated_at();

create index if not exists idx_rankings_updated_at on public.rankings (updated_at desc);

insert into public.flatbread_app_state (state_key, payload)
values
  ('places', '{}'::jsonb),
  ('jokes', '{}'::jsonb)
on conflict (state_key) do nothing;
