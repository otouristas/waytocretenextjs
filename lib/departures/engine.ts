import type { PriceModel, SmallGroup } from "../content/schema.ts";
import { quote } from "../pricing.ts";
import type { Departure, DepartureState, DepartureStatus, BookingRefusal, DepartureKey } from "./types.ts";

/**
 * Departure logic, as pure functions.
 *
 * Nothing here reads a database, a request or the ambient clock: everything
 * that depends on "now" takes it as an argument, which is what lets a vehicle
 * filling up, a notice window opening and a private booking closing a date all
 * be tested against fixed instants instead of observed by waiting.
 *
 * The time handling below is carried over unchanged from the first attempt at
 * this feature, along with its tests. It was correct and it is subtle.
 */

export const TZ = "Europe/Athens";

/* ────────────────────────────── time ────────────────────────────── */

function tzParts(instantMs: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instantMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  // Intl renders midnight as hour 24 in some ICU versions.
  const hour = get("hour") % 24;
  return { y: get("year"), m: get("month"), d: get("day"), hh: hour, mm: get("minute"), ss: get("second") };
}

/** How far Crete's clock is ahead of UTC at a given instant, in ms. */
function athensOffsetMs(instantMs: number): number {
  const p = tzParts(instantMs);
  return Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss) - instantMs;
}

/**
 * Turn a wall-clock time in Crete into a real instant.
 *
 * Applied twice on purpose. The first pass uses the offset at the guessed
 * instant, which is the wrong offset for the handful of wall-clock times that
 * sit on the far side of a daylight-saving change; the second pass uses the
 * offset at the corrected instant and lands on the right one. Without this a
 * late-October departure computes a deadline an hour out, which is precisely
 * the hour a guest would be told their tour was standing down.
 */
export function athensInstant(date: string, time: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  const first = naive - athensOffsetMs(naive);
  return naive - athensOffsetMs(first);
}

/**
 * The moment a group is confirmed or stood down.
 *
 * Counted back from pickup, not from midnight, because the operator's real
 * cutoff is "how long before the van leaves do I need to commit a guide".
 * A tour with no published pickup time is treated as an 08:00 start, which
 * is the earliest any product in the catalogue collects.
 */
export function deadlineFor(date: string, pickupTime: string | null, hoursBefore: number): string {
  const start = athensInstant(date, pickupTime ?? "08:00");
  return new Date(start - hoursBefore * 3_600_000).toISOString();
}

/** Today in Crete, YYYY-MM-DD. The catalogue's notion of "past". */
export function athensDay(nowMs: number = Date.now()): string {
  const p = tzParts(nowMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

/* ────────────────────────────── identity ────────────────────────────── */

/**
 * The public id of a departure, derived from what makes it that departure.
 *
 * Deterministic rather than a database sequence, so a link can be built and
 * resolved without a round trip and the same date always has the same URL.
 * One tour on one date is one vehicle, so the key is just those two.
 */
export function departureId(key: DepartureKey): string {
  return `${key.slug}-${key.date}`;
}

/**
 * Read a departure id back into its key.
 *
 * `slugs` is the real catalogue, which is what makes this unambiguous: tour
 * slugs contain hyphens and so do dates, so the only reliable split is against
 * the set of slugs that exist rather than a character count.
 */
export function parseDepartureId(id: string, slugs: readonly string[]): DepartureKey | null {
  const slug = slugs.find((s) => id.startsWith(`${s}-`));
  if (!slug) return null;
  const date = id.slice(slug.length + 1);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? { slug, date } : null;
}

/** The desk-facing reference. The sequence lives in the store; the format here. */
export function departureRef(sequence: number): string {
  return `#${100 + sequence}`;
}

/* ────────────────────────────── money ────────────────────────────── */

/**
 * The per-person rate for a shared seat.
 *
 * Delegates to `quote()` — the catalogue's single pricing authority — so a
 * seat and the whole van cannot be priced by two code paths. Passing the seat
 * count means a `sliding_per_person` ladder makes the rate fall as the vehicle
 * fills, with no further code.
 */
export function perPersonAt(price: PriceModel, seats: number): number | null {
  const q = quote(price, { adults: Math.max(1, seats), children: 0, infants: 0 });
  return q.kind === "priced" ? q.perPerson : null;
}

/** What a party pays for seats. */
export function sharedTotal(price: PriceModel, seatsAfter: number, people: number): number | null {
  const rate = perPersonAt(price, seatsAfter);
  return rate == null ? null : Math.round(rate * people * 100) / 100;
}

/* ────────────────────────────── state ────────────────────────────── */

/**
 * How close to the last seat "almost full" starts. One seat, so the badge is
 * a fact rather than a mood.
 */
const ALMOST_FULL_WITHIN = 1;

/**
 * Everything a badge, a calendar cell and the notice job depend on.
 *
 * Precedence is deliberate and is the inventory rule in code. A privately
 * reserved vehicle reports `private_reserved` whatever its seat count, because
 * shared availability is gone: it is not "6 seats left", it is not for sale.
 * A sold-out departure is also confirmed, which is why `confirmed` is returned
 * beside `status` rather than inferred from it — callers deciding whether the
 * tour runs read `confirmed`; callers drawing a badge read `status`.
 */
export function departureState(
  departure: Pick<
    Departure,
    | "minParticipants"
    | "capacity"
    | "mode"
    | "departsAt"
    | "noticeAt"
    | "forcedConfirm"
    | "cancelledAt"
  >,
  seats: number,
  nowMs: number,
): DepartureState {
  const departed = nowMs > Date.parse(departure.departsAt);
  const pastNotice = nowMs >= Date.parse(departure.noticeAt);
  const hoursToDeparture = (Date.parse(departure.departsAt) - nowMs) / 3_600_000;

  const seatsLeft = Math.max(0, departure.capacity - seats);
  const stillNeeded = Math.max(0, departure.minParticipants - seats);
  const privateReserved = departure.mode === "private";
  const confirmed =
    departure.cancelledAt == null &&
    (privateReserved || departure.forcedConfirm || seats >= departure.minParticipants);

  let status: DepartureStatus;
  if (departure.cancelledAt != null || departed) {
    status = "closed";
  } else if (privateReserved) {
    // The vehicle is sold. Seat arithmetic is irrelevant from here.
    status = "private_reserved";
  } else if (seatsLeft === 0) {
    status = "sold_out";
  } else if (confirmed) {
    status = seatsLeft <= ALMOST_FULL_WITHIN ? "almost_full" : "confirmed";
  } else if (seats > 0) {
    // Deliberately still `filling` after the notice point. Passing 48 hours
    // short of the minimum is not a cancellation — the guest is offered a
    // private upgrade, and one more booking can still confirm the departure.
    // Closing it here would remove the seat that would have saved it.
    status = "filling";
  } else {
    status = "open";
  }

  return {
    status,
    confirmed,
    seats,
    seatsLeft,
    stillNeeded,
    percent:
      departure.minParticipants === 0
        ? 100
        : Math.min(100, Math.round((seats / departure.minParticipants) * 100)),
    privateReserved,
    needsNotice:
      departure.cancelledAt == null &&
      !departed &&
      !privateReserved &&
      !confirmed &&
      seats > 0 &&
      pastNotice,
    departed,
    hoursToDeparture,
  };
}

/**
 * Whether a party can take seats right now.
 *
 * Returns the specific refusal rather than a boolean, because each one has a
 * different answer on the other side: a privately reserved date should offer
 * another date, a party too large for the remaining seats should be told how
 * many are left, and a passed notice window is not the guest's fault.
 */
export function canBookShared(
  state: DepartureState,
  people: number,
): { ok: true } | { ok: false; reason: BookingRefusal } {
  if (!Number.isInteger(people) || people < 1) return { ok: false, reason: "invalid_party" };
  if (state.status === "private_reserved") return { ok: false, reason: "private_reserved" };
  if (state.status === "closed") {
    return { ok: false, reason: state.departed ? "past_notice" : "cancelled" };
  }
  if (state.seatsLeft === 0) return { ok: false, reason: "sold_out" };
  if (people > state.seatsLeft) return { ok: false, reason: "not_enough_seats" };
  return { ok: true };
}

/**
 * Whether the vehicle can still be bought whole.
 *
 * A private booking is refused once anyone else holds a seat: selling
 * exclusivity on a van that already has strangers in it is the one promise
 * this system must never break.
 */
export function canBookPrivate(
  state: DepartureState,
  people: number,
  capacity: number,
): { ok: true } | { ok: false; reason: BookingRefusal } {
  if (!Number.isInteger(people) || people < 1 || people > capacity) {
    return { ok: false, reason: "invalid_party" };
  }
  if (state.status === "private_reserved") return { ok: false, reason: "private_reserved" };
  if (state.status === "closed") {
    return { ok: false, reason: state.departed ? "past_notice" : "cancelled" };
  }
  // Exclusivity cannot be sold on a van that already has strangers in it.
  if (state.seats > 0) return { ok: false, reason: "not_enough_seats" };
  return { ok: true };
}

/**
 * Whether the vehicle is worth running at this size.
 *
 * Head count alone is not the test an operator applies: four people at a rate
 * that has slid down is not the same departure as four at the published one.
 * A tour with no published floor is decided by head count, which is the
 * previous behaviour.
 */
export function meetsRevenueFloor(shared: SmallGroup, seats: number): boolean {
  if (shared.minRevenue == null) return true;
  const rate = perPersonAt(shared.price, seats);
  if (rate == null) return true;
  return rate * seats >= shared.minRevenue - 0.005;
}
