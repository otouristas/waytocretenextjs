import "server-only";
import { departureId } from "./engine";
import type { BookInput, DeparturePatch, DepartureStore, DepartureWithSeats } from "./store";
import type { Booking, BookingRefusal, BookingResult, Departure, DepartureKey } from "./types";
import type { Lang } from "@/lib/i18n/langs";

/**
 * The Postgres driver, over PostgREST.
 *
 * Written against `fetch` rather than `@supabase/supabase-js` on purpose: the
 * client library would be a runtime dependency for a handful of table reads
 * and three function calls, and this site's build discipline is that a
 * dependency has to earn its place. Everything below is the documented REST
 * surface of the same database.
 *
 * No allocation happens here. It happens in `sql/001_departures.sql`, inside
 * one transaction with the departure row locked, because a capacity check
 * split across a read and a write in application code is a van sold twice.
 */

type Row = Record<string, unknown>;

function toDeparture(r: Row): Departure {
  return {
    id: String(r.id),
    ref: String(r.ref),
    slug: String(r.slug),
    date: String(r.departure_date),
    minParticipants: Number(r.min_participants),
    capacity: Number(r.capacity),
    mode: r.mode === "private" ? "private" : "open",
    departsAt: new Date(String(r.departs_at)).toISOString(),
    noticeAt: new Date(String(r.notice_at)).toISOString(),
    noticeSentAt: r.notice_sent_at ? new Date(String(r.notice_sent_at)).toISOString() : null,
    forcedConfirm: Boolean(r.forced_confirm),
    cancelledAt: r.cancelled_at ? new Date(String(r.cancelled_at)).toISOString() : null,
    createdAt: new Date(String(r.created_at)).toISOString(),
    note: (r.note as string | null) ?? null,
  };
}

function toBooking(r: Row): Booking {
  return {
    id: String(r.id),
    departureId: String(r.departure_id),
    type: r.type === "private" ? "private" : "shared",
    name: String(r.name),
    email: String(r.email),
    phone: String(r.phone),
    people: Number(r.people),
    hotel: (r.hotel as string | null) ?? null,
    notes: (r.notes as string | null) ?? null,
    status: r.status as Booking["status"],
    paymentStatus: r.payment_status as Booking["paymentStatus"],
    quotedTotal: r.quoted_total == null ? null : Number(r.quoted_total),
    upgradedAt: r.upgraded_at ? new Date(String(r.upgraded_at)).toISOString() : null,
    upgradeToken: (r.upgrade_token as string | null) ?? null,
    lang: String(r.lang) as Lang,
    createdAt: new Date(String(r.created_at)).toISOString(),
  };
}

const DEPARTURE_COLUMNS: Record<keyof DeparturePatch, string> = {
  minParticipants: "min_participants",
  capacity: "capacity",
  noticeAt: "notice_at",
  forcedConfirm: "forced_confirm",
  cancelledAt: "cancelled_at",
  noticeSentAt: "notice_sent_at",
  note: "note",
};

const BOOKING_COLUMNS: Partial<Record<keyof Booking, string>> = {
  name: "name",
  email: "email",
  phone: "phone",
  people: "people",
  hotel: "hotel",
  notes: "notes",
  status: "status",
  paymentStatus: "payment_status",
  quotedTotal: "quoted_total",
};

export function supabaseStore(url: string, serviceKey: string): DepartureStore {
  const base = `${url.replace(/\/$/, "")}/rest/v1`;
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  async function rest<T>(path: string, init?: RequestInit & { prefer?: string }): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.prefer ? { Prefer: init.prefer } : {}), ...(init?.headers ?? {}) },
      // A seat count must never be served from a cache: a stale one is a guest
      // told a seat is free that somebody else took.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Supabase ${init?.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  /** Seats per departure, counted in the database rather than in Node. */
  async function seatsFor(ids: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    if (!ids.length) return counts;
    // Each value encoded on its own: encoding the whole list would encode the
    // commas that separate it, which PostgREST reads as one long id.
    const list = ids.map((i) => `"${encodeURIComponent(i)}"`).join(",");
    const rows = await rest<Row[]>(
      `/departure_bookings?select=departure_id,people&status=in.(held,confirmed)&departure_id=in.(${list})`,
    );
    for (const r of rows) {
      const id = String(r.departure_id);
      counts.set(id, (counts.get(id) ?? 0) + Number(r.people));
    }
    return counts;
  }

  function readRpc(payload: Row): BookingResult {
    if (!payload?.ok) {
      return {
        ok: false,
        reason: (payload?.reason as BookingRefusal) ?? "closed",
        seatsLeft: payload?.seats_left == null ? undefined : Number(payload.seats_left),
      };
    }
    return {
      ok: true,
      departure: toDeparture(payload.departure as Row),
      booking: toBooking(payload.booking as Row),
      seatsBefore: Number(payload.seats_before),
      seatsAfter: Number(payload.seats_after),
      created: Boolean(payload.created),
    };
  }

  async function withSeats(rows: Row[]): Promise<DepartureWithSeats[]> {
    const departures = rows.map(toDeparture);
    const seats = await seatsFor(departures.map((d) => d.id));
    return departures.map((departure) => ({ departure, seats: seats.get(departure.id) ?? 0 }));
  }

  return {
    driver: "supabase",

    async list(opts = {}) {
      const filters = ["select=*", "order=departure_date.asc"];
      if (opts.slug) filters.push(`slug=eq.${encodeURIComponent(opts.slug)}`);
      if (opts.from) filters.push(`departure_date=gte.${opts.from}`);
      if (opts.to) filters.push(`departure_date=lte.${opts.to}`);
      if (!opts.includeClosed) filters.push("cancelled_at=is.null");
      return withSeats(await rest<Row[]>(`/departures?${filters.join("&")}`));
    },

    async get(id) {
      const rows = await rest<Row[]>(`/departures?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
      if (!rows.length) return null;
      const departure = toDeparture(rows[0]);
      const bookingRows = await rest<Row[]>(
        `/departure_bookings?select=*&departure_id=eq.${encodeURIComponent(id)}&order=created_at.asc`,
      );
      const bookings = bookingRows.map(toBooking);
      const seats = bookings
        .filter((b) => b.status === "held" || b.status === "confirmed")
        .reduce((n, b) => n + b.people, 0);
      return { departure, seats, bookings };
    },

    async book(input: BookInput) {
      return readRpc(
        await rest<Row>("/rpc/book_departure", {
          method: "POST",
          body: JSON.stringify({
            p_id: departureId(input),
            p_slug: input.slug,
            p_date: input.date,
            p_min: input.config.minParticipants,
            p_capacity: input.config.capacity,
            p_departs_at: input.config.departsAt,
            p_notice_at: input.config.noticeAt,
            p_type: input.type,
            p_name: input.name,
            p_email: input.email,
            p_phone: input.phone,
            p_people: input.people,
            p_hotel: input.hotel ?? null,
            p_notes: input.notes ?? null,
            p_quoted: input.quotedTotal ?? null,
            p_lang: input.lang,
          }),
        }),
      );
    },

    async upgradeToPrivate(token, quotedTotal) {
      return readRpc(
        await rest<Row>("/rpc/upgrade_booking_to_private", {
          method: "POST",
          body: JSON.stringify({ p_token: token, p_quoted: quotedTotal ?? null }),
        }),
      );
    },

    async needingNotice(nowIso) {
      // The shape of this query is the partial index in the migration: unsent,
      // open, not cancelled, past the notice point and not yet departed.
      const filters = [
        "select=*",
        "notice_sent_at=is.null",
        "cancelled_at=is.null",
        "forced_confirm=is.false",
        "mode=eq.open",
        `notice_at=lte.${encodeURIComponent(nowIso)}`,
        `departs_at=gte.${encodeURIComponent(nowIso)}`,
      ];
      const rows = await withSeats(await rest<Row[]>(`/departures?${filters.join("&")}`));
      // The seat test cannot be expressed in PostgREST against another table,
      // so it is applied here — on a list already narrowed to a handful.
      return rows.filter(
        ({ departure, seats }) => seats > 0 && seats < departure.minParticipants,
      );
    },

    async markNoticeSent(id, whenIso) {
      await rest<Row[]>(`/departures?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ notice_sent_at: whenIso }),
      });
    },

    async create(key: DepartureKey, config) {
      const id = departureId(key);
      await rest<Row[]>("/departures", {
        method: "POST",
        prefer: "resolution=ignore-duplicates,return=representation",
        body: JSON.stringify({
          // `ref` is deliberately absent: the column defaults from the same
          // sequence book_departure() uses, so a hand-made departure gets a
          // reference in the same series as a booked one.
          id,
          slug: key.slug,
          departure_date: key.date,
          min_participants: config.minParticipants,
          capacity: config.capacity,
          departs_at: config.departsAt,
          notice_at: config.noticeAt,
        }),
      });
      const rows = await rest<Row[]>(`/departures?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
      return toDeparture(rows[0]);
    },

    async update(id, patch) {
      const body: Row = {};
      for (const [key, column] of Object.entries(DEPARTURE_COLUMNS)) {
        const value = patch[key as keyof DeparturePatch];
        if (value !== undefined) body[column] = value;
      }
      if (!Object.keys(body).length) return null;
      const rows = await rest<Row[]>(`/departures?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(body),
      });
      return rows.length ? toDeparture(rows[0]) : null;
    },

    async updateBooking(id, patch) {
      const body: Row = {};
      for (const [key, column] of Object.entries(BOOKING_COLUMNS)) {
        const value = patch[key as keyof Booking];
        if (value !== undefined) body[column as string] = value;
      }
      if (!Object.keys(body).length) return null;
      const rows = await rest<Row[]>(`/departure_bookings?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(body),
      });
      return rows.length ? toBooking(rows[0]) : null;
    },
  };
}
