import test from "node:test";
import assert from "node:assert/strict";
import { billableHours } from "./pricing.ts";
import { CUSTOM_DAY_PRICE } from "./planner/price.ts";
import { tripDuration } from "./planner/duration.ts";
import { feasibility } from "./planner/feasibility.ts";
import { matchPackagedTour } from "./planner/match-tour.ts";
import { suggestDay } from "./planner/suggest.ts";
import { parsePlannerSearch, serializePlannerSearch } from "./planner/url.ts";
import { clock, hoursClock } from "./planner/format.ts";
import { driveMinutes } from "./planner/legs.ts";
import { DEFAULT_STATE } from "./planner/types.ts";

test("authored Rethymno to Preveli is 50 minutes", () => {
  assert.equal(driveMinutes("rethymno", "preveli-beach"), 50);
  assert.equal(driveMinutes("preveli-beach", "rethymno"), 50);
});

test("a south-coast loop includes the return to start", () => {
  const stops = [
    { slug: "spili", stayMin: 60 },
    { slug: "preveli-beach", stayMin: 90 },
    { slug: "triopetra-beach", stayMin: 90 },
  ];
  const trip = tripDuration("rethymno", stops);
  // Rethymno→Spili 45, Spili→Preveli 40, Preveli→Triopetra 25, Triopetra→Rethymno 55.
  assert.equal(trip.drivingMin, 45 + 40 + 25 + 55);
  assert.equal(trip.stayMin, 240);
  assert.equal(trip.rawMin, 405);
  assert.equal(trip.billableHours, billableHours(405, CUSTOM_DAY_PRICE));
});

test("7h20m raw bills 7.5 hours", () => {
  assert.equal(billableHours(3 * 60 + 20 + 4 * 60, CUSTOM_DAY_PRICE), 7.5);
  assert.equal(hoursClock(7.5), "7h 30m");
});

test("clock formats mixed hours and minutes", () => {
  assert.equal(clock(200), "3h 20m");
  assert.equal(clock(60), "1h");
  assert.equal(clock(45), "45m");
});

test("Elafonisi plus Preveli is blocked", () => {
  const result = feasibility("rethymno", [
    { slug: "elafonisi", stayMin: 150 },
    { slug: "preveli-beach", stayMin: 90 },
  ]);
  assert.equal(result.blocked, true);
  assert.equal(result.kind, "elafonisi_south");
  assert.ok(result.rewrite?.length);
});

test("Elafonisi plus Knossos is blocked as two far coasts", () => {
  const result = feasibility("rethymno", [
    { slug: "elafonisi", stayMin: 150 },
    { slug: "knossos", stayMin: 120 },
  ]);
  assert.equal(result.blocked, true);
  assert.equal(result.kind, "far_mix");
});

test("south coast suggestion is essentially South Crete Highlights", () => {
  const { stops } = suggestDay(["beach", "nature", "villages"], "rethymno");
  assert.ok(stops.length >= 3);
  const twin = matchPackagedTour(stops);
  assert.equal(twin?.slug, "south-crete-highlights");
});

test("share URL round-trips start, party, stops and add-ons", () => {
  const state = {
    ...DEFAULT_STATE,
    start: "chania",
    people: 4,
    date: "2026-10-12",
    interests: ["beach" as const],
    stops: [
      { slug: "spili", stayMin: 60 },
      { slug: "preveli-beach", stayMin: 90 },
    ],
    addons: ["guide" as const, "wine" as const],
  };
  const parsed = parsePlannerSearch(new URLSearchParams(serializePlannerSearch(state)));
  assert.equal(parsed.start, "chania");
  assert.equal(parsed.people, 4);
  assert.equal(parsed.date, "2026-10-12");
  assert.deepEqual(parsed.interests, ["beach"]);
  assert.deepEqual(parsed.stops, state.stops);
  assert.deepEqual(parsed.addons, ["guide", "wine"]);
});
