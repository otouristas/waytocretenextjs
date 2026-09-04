import test from "node:test";
import assert from "node:assert/strict";
// Relative, extension-bearing imports so Node's type stripping can run this
// file directly without a bundler or a path-alias resolver.
import type { PriceModel } from "./content/schema.ts";
import { priceFrom, priceTo, quote } from "./pricing.ts";

/**
 * Run with:  npm run test
 *
 * These fixtures are the REAL published ladders from the source site, not
 * invented examples. If a price here changes, it changes because the operator
 * changed it — and then the JSON-LD `Offer` changes with it, because both read
 * the same model.
 */

/** Imbros Gorge: 44€/pp at 8 people rising to 145€/pp at 2. */
const imbros: PriceModel = {
  kind: "sliding_per_person",
  currency: "EUR",
  tiers: [
    { minGuests: 2, maxGuests: 2, perPerson: 145 },
    { minGuests: 3, maxGuests: 3, perPerson: 96 },
    { minGuests: 4, maxGuests: 4, perPerson: 72.5 },
    { minGuests: 5, maxGuests: 5, perPerson: 70 },
    { minGuests: 6, maxGuests: 6, perPerson: 58 },
    { minGuests: 7, maxGuests: 7, perPerson: 50 },
    { minGuests: 8, maxGuests: 8, perPerson: 44 },
  ],
};

/** Samaria Gorge Explorer: 350€ up to 8 participants, no published extra rate. */
const samaria: PriceModel = {
  kind: "flat_group",
  currency: "EUR",
  total: 350,
  includedGuests: 8,
  extraGuest: null,
  unitLabel: "group",
};

/** Shepherd for a Day: 240€ pp, private up to 4 for 790€ (+160€), child 90€. */
const shepherd: PriceModel = {
  kind: "adult_child_private",
  currency: "EUR",
  adult: 240,
  child: 90,
  infantFree: true,
  childAges: [4, 13],
  infantAges: [0, 3],
  privateGroup: { total: 790, includedGuests: 4, extraGuest: 160 },
};

/** Lake Kournas: €250 for up to 4, €290 for 5–8. A stepped group rate. */
const lakeKournas: PriceModel = {
  kind: "banded_group",
  currency: "EUR",
  bands: [
    { minGuests: 1, maxGuests: 4, total: 250 },
    { minGuests: 5, maxGuests: 8, total: 290 },
  ],
};

/** Knossos, Spinalonga, Aradaina, Pachnes, Sunset Sound Therapy. */
const onRequest: PriceModel = { kind: "on_request", currency: "EUR", indicativeFrom: null };

const party = (adults: number, children = 0, infants = 0) => ({ adults, children, infants });

test("sliding ladder prices the correct tier", () => {
  const q = quote(imbros, party(3));
  assert.equal(q.kind, "priced");
  if (q.kind !== "priced") return;
  assert.equal(q.total, 288);
  assert.equal(q.perPerson, 96);
});

test("sliding ladder nudges toward the next cheaper tier", () => {
  const q = quote(imbros, party(3));
  if (q.kind !== "priced") throw new Error("expected a price");
  assert.equal(q.nudge?.newPerPerson, 72.5);
});

test("the largest tier has no nudge", () => {
  const q = quote(imbros, party(8));
  if (q.kind !== "priced") throw new Error("expected a price");
  assert.equal(q.total, 352);
  assert.equal(q.nudge, null);
});

test("infants do not occupy a paid place", () => {
  const withInfants = quote(imbros, party(3, 0, 2));
  const without = quote(imbros, party(3));
  if (withInfants.kind !== "priced" || without.kind !== "priced") throw new Error("expected prices");
  assert.equal(withInfants.total, without.total);
});

test("a party larger than the ladder becomes an enquiry, never a guess", () => {
  const q = quote(imbros, party(9));
  assert.equal(q.kind, "enquiry");
  if (q.kind !== "enquiry") return;
  assert.equal(q.reason, "out_of_range");
});

test("sliding ladder exposes a true low/high range for AggregateOffer", () => {
  assert.equal(priceFrom(imbros), 44);
  assert.equal(priceTo(imbros), 145);
});

test("flat group rate does not scale with party size", () => {
  const four = quote(samaria, party(4));
  const eight = quote(samaria, party(8));
  if (four.kind !== "priced" || eight.kind !== "priced") throw new Error("expected prices");
  assert.equal(four.total, 350);
  assert.equal(eight.total, 350);
});

test("flat group beyond capacity with no extra rate becomes an enquiry", () => {
  assert.equal(quote(samaria, party(9)).kind, "enquiry");
});

test("per-adult pricing applies below the private-buyout threshold", () => {
  const q = quote(shepherd, party(2));
  if (q.kind !== "priced") throw new Error("expected a price");
  assert.equal(q.total, 480);
});

test("the private buyout wins once it is cheaper than per-head", () => {
  const q = quote(shepherd, party(4));
  if (q.kind !== "priced") throw new Error("expected a price");
  assert.equal(q.total, 790);
});

test("children are charged at the child rate", () => {
  const q = quote(shepherd, party(2, 1));
  if (q.kind !== "priced") throw new Error("expected a price");
  assert.equal(q.total, 570);
});

test("an unpriced product yields an enquiry and no publishable price", () => {
  assert.equal(quote(onRequest, party(2)).kind, "enquiry");
  assert.equal(priceFrom(onRequest), null, "no Offer may be emitted without a real price");
});

test("banded group rate steps at the band boundary", () => {
  const four = quote(lakeKournas, party(4));
  const five = quote(lakeKournas, party(5));
  if (four.kind !== "priced" || five.kind !== "priced") throw new Error("expected prices");
  assert.equal(four.total, 250);
  assert.equal(five.total, 290, "a fifth guest moves the whole party into the upper band");
});

test("banded group rate does not interpolate between bands", () => {
  // The operator publishes two totals and no per-head extra. Deriving one
  // would misquote every party of 5 to 7.
  for (const n of [5, 6, 7, 8]) {
    const q = quote(lakeKournas, party(n));
    if (q.kind !== "priced") throw new Error(`expected a price for ${n}`);
    assert.equal(q.total, 290);
  }
});

test("a party beyond every band becomes an enquiry with an honest anchor", () => {
  const q = quote(lakeKournas, party(9));
  assert.equal(q.kind, "enquiry");
  if (q.kind !== "enquiry") return;
  assert.equal(q.indicativeFrom, 250);
});

test("banded group exposes its true low/high for AggregateOffer", () => {
  assert.equal(priceFrom(lakeKournas), 250);
  assert.equal(priceTo(lakeKournas), 290);
});
