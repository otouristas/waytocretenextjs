import "server-only";
import { departureId, departureRef } from "./engine";
import type { BookInput, DeparturePatch, DepartureStore, DepartureWithSeats } from "./store";
import type { Booking, BookingResult, Departure, DepartureKey } from "./types";

/**
 * The development driver.
 *
 * Everything the feature does — seat counting, the vehicle rule, the notice
 * sweep, the private upgrade, every admin control — works against this, which
 * is what makes the system reviewable and demonstrable before any database
 * exists.
 *
 * It holds rows in a module-level map, so they last exactly as long as the
 * server process. That is stated plainly in the admin panel rather than
 * hidden, because the one genuinely dangerous failure here is an operator
 * taking a real booking against a store that forgets it on the next deploy.
 */

type State = {
  departures: Map<string, Departure>;
  bookings: Map<string, Booking>;
  sequence: number;
};

/**
 * Hung off globalThis rather than a module constant so the map survives the
 * module re-evaluation Next's dev server does on every edit — without it,
 * saving a file mid-demo empties every departure.
 */
const g = globalThis as unknown as { __rtDepartures?: State };

function state(): State {
  if (!g.__rtDepartures) {
    g.__rtDepartures = { departures: new Map(), bookings: new Map(), sequence: 0 };
  }
  return g.__rtDepartures;
}

const newId = () => crypto.randomUUID();

/** Seats taken by live bookings. Cancelled and upgraded-away rows do not count. */
function liveSeats(s: State, departureId: string): number {
  let n = 0;
  for (const b of s.bookings.values()) {
    if (b.departureId !== departureId) continue;
    if (b.status === "held" || b.status === "confirmed") n += b.people;
  }
  return n;
}

function ensure(s: State, key: DepartureKey, config: BookInput["config"]): Departure {
  const id = departureId(key);
  const existing = s.departures.get(id);
  if (existing) return existing;
  s.sequence += 1;
  const departure: Departure = {
    ...key,
    id,
    ref: departureRef(s.sequence),
    minParticipants: config.minParticipants,
    capacity: config.capacity,
    mode: "open",
    departsAt: config.departsAt,
    noticeAt: config.noticeAt,
    forcedConfirm: false,
    cancelledAt: null,
    noticeSentAt: null,
    createdAt: new Date().toISOString(),
    note: null,
  };
  s.departures.set(id, departure);
  return departure;
}

export function memoryStore(): DepartureStore {
  return {
    driver: "memory",

    async list(opts = {}) {
      const s = state();
      const out: DepartureWithSeats[] = [];
      for (const departure of s.departures.values()) {
        if (opts.slug && departure.slug !== opts.slug) continue;
        if (opts.from && departure.date < opts.from) continue;
        if (opts.to && departure.date > opts.to) continue;
        if (!opts.includeClosed && departure.cancelledAt != null) continue;
        out.push({ departure, seats: liveSeats(s, departure.id) });
      }
      return out.sort((a, b) => a.departure.date.localeCompare(b.departure.date));
    },

    async get(id) {
      const s = state();
      const departure = s.departures.get(id);
      if (!departure) return null;
      const bookings = [...s.bookings.values()]
        .filter((b) => b.departureId === id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return { departure, seats: liveSeats(s, id), bookings };
    },

    async book(input) {
      const s = state();
      const existed = s.departures.has(departureId(input));
      const departure = ensure(s, input, input.config);
      const seatsBefore = liveSeats(s, departure.id);
      const now = Date.now();

      if (departure.cancelledAt != null) return { ok: false, reason: "cancelled" };
      if (now > Date.parse(departure.departsAt)) return { ok: false, reason: "past_notice" };
      if (departure.mode === "private") return { ok: false, reason: "private_reserved" };

      if (input.type === "private") {
        // Exclusivity cannot be sold over strangers already in the van.
        if (seatsBefore > 0) return { ok: false, reason: "not_enough_seats", seatsLeft: departure.capacity - seatsBefore };
        if (input.people > departure.capacity) return { ok: false, reason: "invalid_party" };
        s.departures.set(departure.id, { ...departure, mode: "private" });
      } else {
        const left = departure.capacity - seatsBefore;
        if (left <= 0) return { ok: false, reason: "sold_out", seatsLeft: 0 };
        if (input.people > left) return { ok: false, reason: "not_enough_seats", seatsLeft: left };
      }

      const booking: Booking = {
        id: newId(),
        departureId: departure.id,
        type: input.type,
        name: input.name,
        email: input.email,
        phone: input.phone,
        people: input.people,
        hotel: input.hotel ?? null,
        notes: input.notes ?? null,
        status: "held",
        paymentStatus: "none",
        quotedTotal: input.quotedTotal ?? null,
        upgradedAt: null,
        // Only a shared booking can be upgraded, so only it carries a token.
        upgradeToken: input.type === "shared" ? newId() : null,
        lang: input.lang,
        createdAt: new Date().toISOString(),
      };
      s.bookings.set(booking.id, booking);

      return {
        ok: true,
        departure: s.departures.get(departure.id) as Departure,
        booking,
        seatsBefore,
        seatsAfter: seatsBefore + booking.people,
        created: !existed,
      };
    },

    async upgradeToPrivate(token, quotedTotal) {
      const s = state();
      const booking = [...s.bookings.values()].find((b) => b.upgradeToken === token);
      if (!booking) return { ok: false, reason: "closed" };
      const departure = s.departures.get(booking.departureId);
      if (!departure) return { ok: false, reason: "closed" };
      if (departure.cancelledAt != null) return { ok: false, reason: "cancelled" };
      if (Date.now() > Date.parse(departure.departsAt)) return { ok: false, reason: "past_notice" };
      if (departure.mode === "private") return { ok: false, reason: "private_reserved" };

      const seatsBefore = liveSeats(s, departure.id);
      // Everyone else's seats have to be gone before this party can buy the van.
      if (seatsBefore - booking.people > 0) {
        return { ok: false, reason: "not_enough_seats", seatsLeft: departure.capacity - seatsBefore };
      }

      const upgraded: Booking = {
        ...booking,
        type: "private",
        upgradedAt: new Date().toISOString(),
        // Single use: the link in the email cannot be replayed.
        upgradeToken: null,
        quotedTotal: quotedTotal ?? booking.quotedTotal,
      };
      s.bookings.set(upgraded.id, upgraded);
      const next = { ...departure, mode: "private" as const };
      s.departures.set(departure.id, next);

      return { ok: true, departure: next, booking: upgraded, seatsBefore, seatsAfter: seatsBefore, created: false };
    },

    async needingNotice(nowIso) {
      const s = state();
      const now = Date.parse(nowIso);
      const out: DepartureWithSeats[] = [];
      for (const departure of s.departures.values()) {
        if (departure.cancelledAt != null || departure.noticeSentAt != null) continue;
        if (departure.mode === "private" || departure.forcedConfirm) continue;
        if (now < Date.parse(departure.noticeAt)) continue;
        if (now > Date.parse(departure.departsAt)) continue;
        const seats = liveSeats(s, departure.id);
        if (seats === 0 || seats >= departure.minParticipants) continue;
        out.push({ departure, seats });
      }
      return out;
    },

    async markNoticeSent(id, whenIso) {
      const s = state();
      const departure = s.departures.get(id);
      if (departure) s.departures.set(id, { ...departure, noticeSentAt: whenIso });
    },

    async create(key, config) {
      return ensure(state(), key, config);
    },

    async update(id, patch: DeparturePatch) {
      const s = state();
      const departure = s.departures.get(id);
      if (!departure) return null;
      const next = { ...departure, ...patch };
      s.departures.set(id, next);
      return next;
    },

    async updateBooking(id, patch) {
      const s = state();
      const booking = s.bookings.get(id);
      if (!booking) return null;
      const next = { ...booking, ...patch, id: booking.id };
      s.bookings.set(id, next);
      return next;
    },
  };
}
