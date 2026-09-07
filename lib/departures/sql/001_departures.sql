-- Small-group departures: schema, constraints, and the functions that allocate.
--
-- Apply with:  supabase db execute --file lib/departures/sql/001_departures.sql
-- or paste into the SQL editor of the project named in SUPABASE_URL.
--
-- Three things in here are load-bearing.
--
-- The unique constraint on (slug, departure_date) is the model expressed as a
-- constraint: one tour on one date is one vehicle. Two people booking the same
-- day at the same instant on two server instances get one departure, not two.
--
-- `mode` is the inventory rule. While it is 'open' the vehicle sells seats;
-- once it is 'private' it is sold whole and no further seat can be taken, even
-- though the party may be two people in an eight-seat van. What was bought is
-- exclusivity, and the van cannot be sold twice.
--
-- Every function holds the departure row with SELECT … FOR UPDATE while it
-- counts seats and writes. Without that lock, two guests taking the last two
-- seats both read six taken, both pass the check, and nine people turn up for
-- eight seats. The same lock is what stops a private booking racing a shared
-- one onto the same date.

create extension if not exists pgcrypto;

/* ────────────────────────────── departures ────────────────────────────── */

create sequence if not exists departure_ref_seq start 1;

create table if not exists departures (
  -- Deterministic id derived from the key, so a link resolves without a
  -- lookup. `departureId()` in lib/departures/engine.ts owns this format.
  id                text primary key,
  ref               text        not null
                    default ('#' || (100 + nextval('departure_ref_seq'))::text),
  slug              text        not null,
  departure_date    date        not null,
  min_participants  integer     not null check (min_participants >= 1),
  capacity          integer     not null check (capacity >= min_participants),
  -- The inventory rule.
  mode              text        not null default 'open' check (mode in ('open', 'private')),
  departs_at        timestamptz not null,
  -- Not a deadline: reaching it starts the conversation with the guest. The
  -- departure stays sellable, because one more seat can still confirm it.
  notice_at         timestamptz not null,
  -- Recorded so the hourly job is idempotent: a guest must not be written to
  -- every hour for two days.
  notice_sent_at    timestamptz,
  forced_confirm    boolean     not null default false,
  cancelled_at      timestamptz,
  note              text,
  created_at        timestamptz not null default now(),

  constraint departures_one_vehicle_per_date unique (slug, departure_date)
);

create index if not exists departures_date_idx on departures (departure_date);
create index if not exists departures_notice_idx
  on departures (notice_at)
  where notice_sent_at is null and cancelled_at is null and mode = 'open';

/* ────────────────────────────── bookings ────────────────────────────── */

create table if not exists departure_bookings (
  id              uuid primary key default gen_random_uuid(),
  departure_id    text        not null references departures (id) on delete cascade,
  -- A private upgrade changes this on the existing row rather than creating a
  -- second booking: the guest already told us who they are and when.
  type            text        not null default 'shared' check (type in ('shared', 'private')),
  name            text        not null,
  email           text        not null,
  phone           text        not null,
  people          integer     not null check (people >= 1),
  hotel           text,
  notes           text,
  -- 'held' is the state that makes the whole thing honest: a seat is taken,
  -- the departure is not yet promised.
  status          text        not null default 'held'
                  check (status in ('held', 'confirmed', 'cancelled', 'upgraded')),
  payment_status  text        not null default 'none'
                  check (payment_status in ('none', 'authorized', 'paid', 'refunded')),
  quoted_total    numeric(10, 2),
  upgraded_at     timestamptz,
  -- Single-use secret in the upgrade link. Nulled the moment it is spent.
  upgrade_token   uuid unique,
  lang            text        not null default 'en',
  created_at      timestamptz not null default now()
);

-- Only live rows are ever counted, so the index that serves the count carries
-- only live rows.
create index if not exists departure_bookings_live_idx
  on departure_bookings (departure_id)
  where status in ('held', 'confirmed');

/* ────────────────────────────── access ────────────────────────────── */

-- Every read and write goes through the site's server with the service role,
-- which bypasses RLS. Enabling RLS with no policies therefore denies the anon
-- and authenticated keys outright — which is what we want, because these
-- tables hold guest names, emails and phone numbers.
alter table departures         enable row level security;
alter table departure_bookings enable row level security;

/* ────────────────────────────── allocation ────────────────────────────── */

-- Find or create the departure for a date, then take seats — or the whole
-- vehicle — in it, atomically. Returns the same refusal reasons the in-memory
-- driver returns, so the application never has to know which store answered.
create or replace function book_departure(
  p_id            text,
  p_slug          text,
  p_date          date,
  p_min           integer,
  p_capacity      integer,
  p_departs_at    timestamptz,
  p_notice_at     timestamptz,
  p_type          text,
  p_name          text,
  p_email         text,
  p_phone         text,
  p_people        integer,
  p_hotel         text,
  p_notes         text,
  p_quoted        numeric,
  p_lang          text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_departure    departures%rowtype;
  v_inserted     integer := 0;
  v_created      boolean := false;
  v_seats_before integer;
  v_left         integer;
  v_booking      departure_bookings%rowtype;
begin
  if p_people is null or p_people < 1 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_party');
  end if;

  insert into departures (id, slug, departure_date, min_participants, capacity, departs_at, notice_at)
  values (p_id, p_slug, p_date, p_min, p_capacity, p_departs_at, p_notice_at)
  on conflict (id) do nothing;

  get diagnostics v_inserted = row_count;
  v_created := v_inserted > 0;

  -- The lock. Everything to COMMIT sees a stable seat count and a stable mode.
  select * into v_departure from departures where id = p_id for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;
  if v_departure.cancelled_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'cancelled');
  end if;
  if now() > v_departure.departs_at then
    return jsonb_build_object('ok', false, 'reason', 'past_notice');
  end if;
  if v_departure.mode = 'private' then
    return jsonb_build_object('ok', false, 'reason', 'private_reserved');
  end if;

  select coalesce(sum(people), 0) into v_seats_before
  from departure_bookings
  where departure_id = p_id and status in ('held', 'confirmed');

  v_left := v_departure.capacity - v_seats_before;

  if p_type = 'private' then
    -- Exclusivity cannot be sold over strangers already in the van.
    if v_seats_before > 0 then
      return jsonb_build_object('ok', false, 'reason', 'not_enough_seats', 'seats_left', v_left);
    end if;
    if p_people > v_departure.capacity then
      return jsonb_build_object('ok', false, 'reason', 'invalid_party');
    end if;
    update departures set mode = 'private' where id = p_id;
  else
    if v_left <= 0 then
      return jsonb_build_object('ok', false, 'reason', 'sold_out', 'seats_left', 0);
    end if;
    if p_people > v_left then
      return jsonb_build_object('ok', false, 'reason', 'not_enough_seats', 'seats_left', v_left);
    end if;
  end if;

  insert into departure_bookings (
    departure_id, type, name, email, phone, people, hotel, notes, quoted_total, lang, upgrade_token
  )
  values (
    p_id, p_type, p_name, p_email, p_phone, p_people, p_hotel, p_notes, p_quoted, p_lang,
    case when p_type = 'shared' then gen_random_uuid() else null end
  )
  returning * into v_booking;

  select * into v_departure from departures where id = p_id;

  return jsonb_build_object(
    'ok', true,
    'created', v_created,
    'seats_before', v_seats_before,
    'seats_after', v_seats_before + p_people,
    'departure', to_jsonb(v_departure),
    'booking', to_jsonb(v_booking)
  );
end;
$$;

-- Convert an existing shared booking into a private one, in place. The same
-- lock, because this is the same allocation problem seen from the other side.
create or replace function upgrade_booking_to_private(
  p_token  uuid,
  p_quoted numeric
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking      departure_bookings%rowtype;
  v_departure    departures%rowtype;
  v_seats_before integer;
begin
  select * into v_booking from departure_bookings where upgrade_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;

  select * into v_departure from departures where id = v_booking.departure_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;
  if v_departure.cancelled_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'cancelled');
  end if;
  if now() > v_departure.departs_at then
    return jsonb_build_object('ok', false, 'reason', 'past_notice');
  end if;
  if v_departure.mode = 'private' then
    return jsonb_build_object('ok', false, 'reason', 'private_reserved');
  end if;

  select coalesce(sum(people), 0) into v_seats_before
  from departure_bookings
  where departure_id = v_departure.id and status in ('held', 'confirmed');

  -- Everyone else has to be out of the van before this party can buy it.
  if v_seats_before - v_booking.people > 0 then
    return jsonb_build_object(
      'ok', false, 'reason', 'not_enough_seats',
      'seats_left', v_departure.capacity - v_seats_before
    );
  end if;

  update departure_bookings
     set type = 'private',
         upgraded_at = now(),
         upgrade_token = null,          -- single use
         quoted_total = coalesce(p_quoted, quoted_total)
   where id = v_booking.id
  returning * into v_booking;

  update departures set mode = 'private' where id = v_departure.id
  returning * into v_departure;

  return jsonb_build_object(
    'ok', true,
    'created', false,
    'seats_before', v_seats_before,
    'seats_after', v_seats_before,
    'departure', to_jsonb(v_departure),
    'booking', to_jsonb(v_booking)
  );
end;
$$;
