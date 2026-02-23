-- Shared Flatbread app metadata for place state + honor jokes.
-- Run this once in your Supabase SQL editor.

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

-- Optional seed rows used by the app:
insert into public.flatbread_app_state (state_key, payload)
values
  ('places', '{}'::jsonb),
  ('jokes', '{}'::jsonb)
on conflict (state_key) do nothing;

comment on table public.flatbread_app_state is
  'Stores non-ranking Flatbread Night state such as custom places, closed flags, host assignments, and honor jokes.';
