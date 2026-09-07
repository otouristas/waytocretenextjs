import "server-only";
import type { Booking, Departure, DepartureKey, BookingResult } from "./types";

/**
 * The storage seam.
 *
 * Departures are the one genuinely shared mutable thing on this site.
 * Everything else — tours, guides, prices — is a file validated at build time,
 * which is why there has never been a database here. A seat count cannot work
 * that way: two guests taking the last two seats of the same van at the same
 * moment must not both get them, and a guest buying the vehicle whole must
 * beat anyone still trying to take a seat in it.
 *
 * So the system is written against this interface. The in-memory driver makes
 * the whole feature real and demonstrable today; the Postgres driver is the
 * same contract over `sql/001_departures.sql`, where every allocation happens
 * inside one transaction with the departure row locked.
 */

export type DepartureWithSeats = { departure: Departure; seats: number };

export type DepartureConfig = {
  minParticipants: number;
  capacity: number;
  /** ISO instant of pickup. */
  departsAt: string;
  /** ISO instant, `noticeHours` before pickup. */
  noticeAt: string;
};

export type BookInput = DepartureKey & {
  type: Booking["type"];
  name: string;
  email: string;
  phone: string;
  people: number;
  hotel?: string | null;
  notes?: string | null;
  quotedTotal?: number | null;
  lang: Booking["lang"];
  config: DepartureConfig;
};

export type DeparturePatch = Partial<
  Pick<Departure, "minParticipants" | "capacity" | "noticeAt" | "forcedConfirm" | "cancelledAt" | "note" | "noticeSentAt">
>;

export interface DepartureStore {
  /** Which driver answered. Surfaced in admin so demo data is never mistaken for bookings. */
  readonly driver: "memory" | "supabase";

  list(opts?: { slug?: string; from?: string; to?: string; includeClosed?: boolean }): Promise<DepartureWithSeats[]>;
  get(id: string): Promise<(DepartureWithSeats & { bookings: Booking[] }) | null>;

  /**
   * Find or create the departure for a date, then take seats — or the whole
   * vehicle — in it.
   *
   * One call rather than a read-then-write, because the gap between those two
   * is where a van gets sold twice. A `private` booking flips the departure's
   * mode in the same transaction that creates the booking, so shared
   * availability for that date closes at the instant exclusivity is sold.
   */
  book(input: BookInput): Promise<BookingResult>;

  /**
   * Convert an existing shared booking into a private one.
   *
   * Not a new booking: the guest already told us who they are and when they
   * are travelling, and a second record would strand that. Refuses if anyone
   * else holds a seat on the same departure.
   */
  upgradeToPrivate(token: string, quotedTotal: number | null): Promise<BookingResult>;

  /** Departures past their notice point, still short, not yet written to. */
  needingNotice(nowIso: string): Promise<DepartureWithSeats[]>;
  markNoticeSent(id: string, whenIso: string): Promise<void>;

  /* ── admin ── */
  create(key: DepartureKey, config: DepartureConfig): Promise<Departure>;
  update(id: string, patch: DeparturePatch): Promise<Departure | null>;
  updateBooking(id: string, patch: Partial<Booking>): Promise<Booking | null>;
}

let cached: DepartureStore | null = null;

/**
 * The active store.
 *
 * Supabase wins whenever it is configured, so production never silently runs
 * on memory: the presence of credentials is the switch, not a flag somebody
 * has to remember to set at the same time.
 */
export async function departureStore(): Promise<DepartureStore> {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const { supabaseStore } = await import("./store-supabase");
    cached = supabaseStore(url, key);
    return cached;
  }
  const { memoryStore } = await import("./store-memory");
  cached = memoryStore();
  return cached;
}

/** True when bookings are written somewhere that survives a restart. */
export function storeIsDurable(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
