import test from "node:test";
import assert from "node:assert/strict";
// Relative, extension-bearing imports so Node's type stripping runs this file
// directly, exactly as lib/pricing.test.ts does.
import type { SmallGroup } from "../content/schema.ts";
import type { Departure } from "./types.ts";
import {
  athensInstant,
  canBookPrivate,
  canBookShared,
  departureId,
  departureState,
  deadlineFor,
  meetsRevenueFloor,
  parseDepartureId,
  perPersonAt,
  sharedTotal,
} from "./engine.ts";

/**
 * Run with:  npm run test
 *
 * The scenario is South Crete as the brief describes it: an eight-seat van,
 * four seats minimum, sold either by the seat or whole.
 */

const SLUGS = ["south-crete-highlights", "samaria-gorge-explorer", "lake-kournas-argyroupoli-springs-tour"];

/** 29 August 2026, 09:00 pickup. */
const DATE = "2026-08-29";
const DEPARTS = athensInstant(DATE, "09:00");

const shared: SmallGroup = {
  price: {
    kind: "sliding_per_person",
    currency: "EUR",
    tiers: [{ minGuests: 1, maxGuests: 8, perPerson: 75 }],
  },
  minParticipants: 4,
  minRevenue: 250,
  noticeHours: 48,
};

function departure(over: Partial<Departure> = {}) {
  return {
    minParticipants: 4,
    capacity: 8,
    mode: "open" as const,
    departsAt: new Date(DEPARTS).toISOString(),
    noticeAt: deadlineFor(DATE, "09:00", 48),
    forcedConfirm: false,
    cancelledAt: null as string | null,
    ...over,
  };
}

/** Well before the notice point. */
const EARLY = DEPARTS - 10 * 24 * 3_600_000;
/** Inside the notice window — 40 hours out. */
const INSIDE_NOTICE = DEPARTS - 40 * 3_600_000;
/** After the van has left. */
const AFTER = DEPARTS + 3_600_000;

/* ────────────────────────────── the seat ladder ────────────────────────────── */

test("an empty departure is open, not confirmed", () => {
  const s = departureState(departure(), 0, EARLY);
  assert.equal(s.status, "open");
  assert.equal(s.confirmed, false);
  assert.equal(s.stillNeeded, 4);
});

test("two of four is filling, and says how many more are needed", () => {
  const s = departureState(departure(), 2, EARLY);
  assert.equal(s.status, "filling");
  assert.equal(s.confirmed, false);
  assert.equal(s.stillNeeded, 2);
  assert.equal(s.seatsLeft, 6);
});

test("the fourth seat confirms the departure", () => {
  const s = departureState(departure(), 4, EARLY);
  assert.equal(s.status, "confirmed");
  assert.equal(s.confirmed, true);
  assert.equal(s.stillNeeded, 0);
});

test("one seat left reads almost full, and is still confirmed", () => {
  const s = departureState(departure(), 7, EARLY);
  assert.equal(s.status, "almost_full");
  assert.equal(s.confirmed, true);
  assert.equal(s.seatsLeft, 1);
});

test("a full van is sold out and still running", () => {
  const s = departureState(departure(), 8, EARLY);
  assert.equal(s.status, "sold_out");
  assert.equal(s.confirmed, true, "a full van is running, whatever the badge says");
  assert.deepEqual(canBookShared(s, 1), { ok: false, reason: "sold_out" });
});

test("the progress bar measures against the minimum, not capacity", () => {
  assert.equal(departureState(departure(), 2, EARLY).percent, 50);
  assert.equal(departureState(departure(), 4, EARLY).percent, 100);
});

/* ────────────────────────────── the inventory rule ────────────────────────────── */

test("a private booking takes the whole vehicle, whatever the party size", () => {
  // Two people who bought exclusivity block all eight seats. This is the rule
  // the entire model rests on.
  const s = departureState(departure({ mode: "private" }), 2, EARLY);
  assert.equal(s.status, "private_reserved");
  assert.equal(s.privateReserved, true);
  assert.equal(s.confirmed, true);
  assert.deepEqual(canBookShared(s, 1), { ok: false, reason: "private_reserved" });
});

test("exclusivity cannot be sold on a van that already has strangers in it", () => {
  const empty = departureState(departure(), 0, EARLY);
  assert.deepEqual(canBookPrivate(empty, 2, 8), { ok: true });
  const taken = departureState(departure(), 1, EARLY);
  assert.deepEqual(canBookPrivate(taken, 2, 8), { ok: false, reason: "not_enough_seats" });
});

test("a party larger than the remaining seats is refused with the count", () => {
  const s = departureState(departure(), 6, EARLY);
  assert.deepEqual(canBookShared(s, 3), { ok: false, reason: "not_enough_seats" });
  assert.deepEqual(canBookShared(s, 2), { ok: true });
});

test("nonsense party sizes are refused rather than coerced", () => {
  const s = departureState(departure(), 0, EARLY);
  assert.deepEqual(canBookShared(s, 0), { ok: false, reason: "invalid_party" });
  assert.deepEqual(canBookShared(s, 1.5), { ok: false, reason: "invalid_party" });
  assert.deepEqual(canBookPrivate(s, 9, 8), { ok: false, reason: "invalid_party" });
});

/* ────────────────────────────── the notice window ────────────────────────────── */

test("the notice point is counted back from pickup, not midnight", () => {
  // 48 hours before 09:00 on the 29th is 09:00 on the 27th, Crete time.
  assert.equal(deadlineFor(DATE, "09:00", 48), "2026-08-27T06:00:00.000Z");
});

test("passing the notice point does NOT cancel the departure", () => {
  // The single rule the brief is most insistent about: no silent cancellation.
  // The date stays open, because one more seat can still confirm it.
  const s = departureState(departure(), 2, INSIDE_NOTICE);
  assert.equal(s.status, "filling");
  assert.equal(s.departed, false);
  assert.deepEqual(canBookShared(s, 2), { ok: true }, "a fourth guest can still save it");
});

test("a short departure inside the window is what the job looks for", () => {
  assert.equal(departureState(departure(), 2, INSIDE_NOTICE).needsNotice, true);
  assert.equal(departureState(departure(), 2, EARLY).needsNotice, false, "too early to write");
  assert.equal(departureState(departure(), 4, INSIDE_NOTICE).needsNotice, false, "already confirmed");
  assert.equal(departureState(departure(), 0, INSIDE_NOTICE).needsNotice, false, "nobody to write to");
  assert.equal(
    departureState(departure({ mode: "private" }), 2, INSIDE_NOTICE).needsNotice,
    false,
    "a private departure is guaranteed and needs no notice",
  );
});

test("a departure that has left is closed to everything", () => {
  const s = departureState(departure(), 2, AFTER);
  assert.equal(s.status, "closed");
  assert.equal(s.departed, true);
  assert.deepEqual(canBookShared(s, 1), { ok: false, reason: "past_notice" });
  assert.deepEqual(canBookPrivate(s, 1, 8), { ok: false, reason: "past_notice" });
});

test("the operator can run a short departure anyway", () => {
  const s = departureState(departure({ forcedConfirm: true }), 2, INSIDE_NOTICE);
  assert.equal(s.confirmed, true);
  assert.equal(s.needsNotice, false, "no need to ask once the operator has decided");
});

test("a cancelled departure stays closed however many seats it holds", () => {
  const s = departureState(departure({ cancelledAt: "2026-08-20T10:00:00.000Z" }), 8, EARLY);
  assert.equal(s.status, "closed");
  assert.equal(s.confirmed, false);
});

/* ────────────────────────────── identity and money ────────────────────────────── */

test("a departure id is one tour on one date, and round-trips", () => {
  const key = { slug: "south-crete-highlights", date: DATE };
  assert.equal(departureId(key), "south-crete-highlights-2026-08-29");
  assert.deepEqual(parseDepartureId(departureId(key), SLUGS), key);
});

test("an unknown or malformed id resolves to nothing rather than a guess", () => {
  assert.equal(parseDepartureId("not-a-tour-2026-08-29", SLUGS), null);
  assert.equal(parseDepartureId("south-crete-highlights-tomorrow", SLUGS), null);
});

test("seat prices come from quote(), not from a second number", () => {
  assert.equal(perPersonAt(shared.price, 4), 75);
  assert.equal(sharedTotal(shared.price, 4, 2), 150);
});

test("four seats at €75 clears a €250 van", () => {
  assert.equal(meetsRevenueFloor(shared, 4), true);
  assert.equal(meetsRevenueFloor(shared, 3), false);
});

test("a tour with no published floor is decided by head count alone", () => {
  assert.equal(meetsRevenueFloor({ ...shared, minRevenue: null }, 1), true);
});
