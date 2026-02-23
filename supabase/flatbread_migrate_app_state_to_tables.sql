-- Migrate existing flatbread_app_state payloads into normalized tables.
-- Run after: flatbread_metadata_schema.sql

begin;

with
state_places as (
  select payload
  from public.flatbread_app_state
  where state_key = 'places'
),
state_jokes as (
  select payload
  from public.flatbread_app_state
  where state_key = 'jokes'
),
custom_places as (
  select
    jsonb_array_elements(COALESCE((select payload from state_places)->'custom', '[]'::jsonb)) as place_raw
),
closed_ids as (
  select trim(value::text, '"') as place_id
  from state_places,
       jsonb_array_elements_text(COALESCE((state_places.payload->'closedPlaceIds'), '[]'::jsonb)) as value
),
host_map as (
  select
    trim(key) as place_id,
    nullif(trim(value::text), '""') as host_user_id
  from state_places,
       jsonb_each_text(COALESCE((state_places.payload->'hostByPlaceId'), '{}'::jsonb))
),
order_notes as (
  select
    trim(key) as place_id,
    nullif(trim(value::text), '""') as ordered_items
  from state_places,
       jsonb_each_text(COALESCE((state_places.payload->'orderedItemsByPlaceId'), '{}'::jsonb))
),
normalized_custom_places as (
  select
    trim((place_raw->>'id')) as id,
    nullif(trim(place_raw->>'name'), '') as name,
    nullif(trim(place_raw->>'date'), 'Unknown') as date,
    nullif(trim(place_raw->>'dateRaw'), '') as date_raw,
    nullif(trim(place_raw->>'address'), '') as address,
    nullif(place_raw->>'lat', '')::double precision as lat,
    nullif(place_raw->>'lng', '')::double precision as lng,
    to_date(left(nullif(place_raw->>'visitDate', ''), 10), 'YYYY-MM-DD') as visit_date,
    coalesce(
      nullif(place_raw->>'is_custom', ''),
      'true'
    )::boolean as is_custom,
    coalesce(
      exists (select 1 from closed_ids c where c.place_id = trim(place_raw->>'id')),
      false
    ) as is_closed,
    nullif(trim(h.host_user_id), '') as host_user_id,
    nullif(trim(n.ordered_items), '') as ordered_items
  from custom_places cp
  left join host_map h on h.place_id = trim(cp.place_raw->>'id')
  left join order_notes n on n.place_id = trim(cp.place_raw->>'id')
),
upsert_custom_places as (
  insert into public.places (
    id,
    name,
    date,
    date_raw,
    visit_date,
    address,
    lat,
    lng,
    is_custom,
    is_closed,
    host_user_id,
    ordered_items
  )
  select
    c.id,
    c.name,
    c.date,
    c.date_raw,
    c.visit_date,
    c.address,
    c.lat,
    c.lng,
    coalesce(c.is_custom, true),
    coalesce(c.is_closed, false),
    c.host_user_id,
    c.ordered_items
  from normalized_custom_places c
  where c.id is not null
  on conflict (id) do update
  set
    name = excluded.name,
    date = excluded.date,
    date_raw = excluded.date_raw,
    visit_date = excluded.visit_date,
    address = excluded.address,
    lat = excluded.lat,
    lng = excluded.lng,
    is_closed = excluded.is_closed,
    host_user_id = excluded.host_user_id,
    ordered_items = excluded.ordered_items
  returning 1
),
flatten_jokes as (
  select
    trim(k.key) as place_id,
    nullif(trim(k.value->>'display'), '') as display_name,
    nullif(trim(k.value->>'hint'), '') as hint_text
  from state_jokes,
       jsonb_each(coalesce(state_jokes.payload, '{}'::jsonb)) as k(key, value)
  where jsonb_typeof(k.value) = 'object'
  union all
  select
    trim(k.key) as place_id,
    null as display_name,
    nullif(trim(k.value::text), '""') as hint_text
  from state_jokes,
       jsonb_each(coalesce(state_jokes.payload, '{}'::jsonb)) as k(key, value)
  where jsonb_typeof(k.value) = 'string'
),
normalized_hints as (
  select
    fj.place_id,
    coalesce(fj.display_name, p.name, fj.place_id) as display_name,
    fj.hint_text
  from flatten_jokes fj
  left join public.places p on p.id = fj.place_id
),
upsert_place_hints as (
  insert into public.place_hints (place_id, display_name, hint_text)
  select
    place_id,
    display_name,
    hint_text
  from normalized_hints
  where place_id is not null and hint_text is not null and hint_text <> ''
  on conflict (place_id) do update
  set
    display_name = excluded.display_name,
    hint_text = excluded.hint_text
  returning 1
)
select
  (select count(*) from upsert_custom_places) as custom_places_migrated,
  (select count(*) from upsert_place_hints) as place_hints_migrated;

commit;
