import type { Lang } from "../i18n/langs.ts";

/**
 * Small-group departures.
 *
 * A **departure** is one tour on one date — which is to say, one vehicle. That
 * is the whole model, and everything else follows from a single rule:
 *
 *     Shared bookings consume seats. A private booking consumes the vehicle.
 *
 * So a departure is not a list of guests with a capacity; it is a vehicle that
 * is either taking seats or has been sold whole. A party of two who buy the
 * private option block all eight seats, because what they bought is
 * exclusivity, and the eight-seat van cannot be sold twice.
 *
 * Two disciplines carried over from the earlier attempt at this, both of which
 * were right:
 *
 * Status is never stored. `departureState()` derives it from the seat count,
 * the mode, the capacity and the clock. A stored status is a second source of
 * truth that goes stale the moment a booking lands, and then the calendar, the
 * email and the admin table disagree about whether a tour is running.
 *
 * Money is never stored on a departure. The per-person rate comes from the
 * tour's `smallGroup.price` and the per-vehicle rate from its ordinary
 * `price`, both through `quote()` — so the two products on one page cannot be
 * priced by two code paths that drift.
 */

/** What the vehicle is doing. The inventory rule, as a value. */
export type DepartureMode = "open" | "private";

/**
 * What a guest sees on the badge.
 *
 * Two of these are about the minimum and two are about capacity, which are
 * genuinely different axes: `filling` counts up to the minimum needed to run,
 * `almost_full` counts down to the last seat. A departure can be neither, or
 * — briefly, on a small vehicle — both, and precedence below resolves that.
 */
export type DepartureStatus =
  | "open"
  | "filling"
  | "confirmed"
  | "almost_full"
  | "sold_out"
  | "private_reserved"
  | "closed";

/** A booking's own standing, which is not the departure's. */
export type BookingStatus = "held" | "confirmed" | "cancelled" | "upgraded";

/**
 * Shared or private, on the booking itself.
 *
 * A private upgrade changes this value on the existing row rather than
 * creating a second booking — the guest already told us who they are and when
 * they are travelling, and a new record would strand that.
 */
export type BookingType = "shared" | "private";

/**
 * Carried from the first version so the column never has to be retrofitted
 * onto live rows. Places are held without a card today.
 */
export type PaymentStatus = "none" | "authorized" | "paid" | "refunded";

/** What makes two bookings the same departure: one tour, one date. */
export type DepartureKey = { slug: string; date: string };

export type Departure = DepartureKey & {
  /** Deterministic, derived from the key. See `departureId()`. */
  id: string;
  /** Desk reference — "#102". */
  ref: string;
  minParticipants: number;
  /** Seats in the vehicle. Never exceeds the tour's own `groupMax`. */
  capacity: number;
  mode: DepartureMode;
  /** ISO instant of pickup. A departure is over when this has passed. */
  departsAt: string;
  /**
   * ISO instant, `noticeHours` before pickup. Not a deadline — reaching it is
   * what *starts* the conversation with the guest, and the departure stays
   * bookable afterwards because one more seat could still confirm it.
   */
  noticeAt: string;
  /** The operator is running a short departure anyway. */
  forcedConfirm: boolean;
  cancelledAt: string | null;
  /**
   * When the "almost ready" mail went out. Recorded so the job that sends it
   * is idempotent — a cron that runs hourly must not mail the same guest
   * every hour for two days.
   */
  noticeSentAt: string | null;
  createdAt: string;
  note: string | null;
};

export type Booking = {
  id: string;
  departureId: string;
  type: BookingType;
  name: string;
  email: string;
  phone: string;
  /** Seats taken. A private booking still records the real party size. */
  people: number;
  hotel: string | null;
  notes: string | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  /** What this guest was quoted, kept for the audit trail. */
  quotedTotal: number | null;
  /** Set when a shared booking became private. */
  upgradedAt: string | null;
  /** Single-use secret in the upgrade link. Null once used. */
  upgradeToken: string | null;
  lang: Lang;
  createdAt: string;
};

export type DepartureState = {
  status: DepartureStatus;
  /** The tour runs. Distinct from `status`: a sold-out departure also runs. */
  confirmed: boolean;
  seats: number;
  seatsLeft: number;
  /** Heads still needed to reach the minimum. Zero once met. */
  stillNeeded: number;
  /** 0–100 towards the minimum, not towards capacity. */
  percent: number;
  /** True once the vehicle is sold whole. Closes shared availability. */
  privateReserved: boolean;
  /**
   * Past the notice point, still short, still sellable — exactly what the
   * hourly job looks for. Whether the mail has already gone is the store's
   * business (`noticeSentAt`), not this function's.
   */
  needsNotice: boolean;
  /** The vehicle has left. Nothing can be booked or upgraded. */
  departed: boolean;
  hoursToDeparture: number;
};

export type DepartureView = Departure & {
  state: DepartureState;
  /** Per-person rate for a shared seat, from `quote()`. */
  perPerson: number | null;
  /** Per-vehicle rate for the private option, from `quote()`. */
  privateTotal: number | null;
  title: string;
  hero: string;
  durationMinutes: number;
  pickupTime: string | null;
};

/** Why a booking was refused. Each one needs different copy and a different offer. */
export type BookingRefusal =
  | "private_reserved"
  | "sold_out"
  | "not_enough_seats"
  | "past_notice"
  | "cancelled"
  | "closed"
  | "unknown_tour"
  | "invalid_party";

export type BookingResult =
  | {
      ok: true;
      departure: Departure;
      booking: Booking;
      seatsBefore: number;
      seatsAfter: number;
      created: boolean;
    }
  | { ok: false; reason: BookingRefusal; seatsLeft?: number };
