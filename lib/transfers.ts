import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { z } from "zod";

/**
 * The transfer product, read from content/transfers.json.
 *
 * The file was harvested from the WordPress booking plugin's own rate rules,
 * so the numbers here are the ones the live booking form quotes from. Two
 * consequences the UI has to respect:
 *
 *  - `priceEur` is null on every route. The operator publishes no flat fare;
 *    everything is metered per kilometre. A route page must therefore quote
 *    from `perKmRates` or say "on request" — never invent a headline price.
 *  - The coverage exclusions are a hard rule, not a preference. A journey
 *    that starts and ends inside Chania, Heraklion or Lassithi cannot be
 *    booked at all, so the pages state it rather than leaving a guest to
 *    request something we will refuse.
 */

const PerKmRate = z.object({
  minPassengers: z.number().int().positive(),
  maxPassengers: z.number().int().positive(),
  eurPerKm: z.number().positive(),
});

const Route = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  from: z.string().min(1),
  to: z.string().min(1),
  distanceKm: z.number().positive(),
  durationMinutes: z.number().int().positive(),
  priceEur: z.number().positive().nullable(),
});
export type TransferRoute = z.infer<typeof Route>;

const Faq = z.object({ q: z.string().min(1), a: z.string().min(1) });

const TransferData = z.object({
  coverage: z.object({
    basedIn: z.string(),
    baseGeo: z.object({ lat: z.number(), lng: z.number() }),
    serves: z.array(z.string()),
    airportRoutes: z.array(z.string()),
    excluded: z.array(z.string()),
    statement: z.string(),
    note: z.string().optional(),
  }),
  vehicle: z.object({
    name: z.string(),
    passengers: z.number().int().positive(),
    bags: z.number().int().nonnegative(),
    description: z.string(),
    hero: z.string(),
    gallery: z.array(z.string()).default([]),
    note: z.string().optional(),
  }),
  pricing: z.object({
    currency: z.literal("EUR"),
    model: z.literal("per_km"),
    perKmRates: z.array(PerKmRate).min(1),
    returnLegRate: z.string(),
    minimumDistanceKm: z.number().positive(),
    maximumDistanceKm: z.number().positive(),
    minimumOrderEur: z.number().positive(),
    maximumOrderEur: z.number().positive(),
    paymentMethods: z.array(z.string()),
    depositRequired: z.boolean(),
    note: z.string().optional(),
  }),
  extras: z
    .array(
      z.object({
        label: z.string(),
        description: z.string(),
        priceEur: z.number().nonnegative(),
        perBooking: z.boolean().default(true),
        maxQuantity: z.number().int().positive().optional(),
        mandatory: z.boolean().default(false),
        note: z.string().optional(),
      }),
    )
    .default([]),
  booking: z.object({
    leadTimeDays: z.object({ min: z.number().int(), max: z.number().int() }),
    pickupTimes: z.string(),
    timeStepMinutes: z.number().int().positive(),
    transferTypes: z.array(z.string()),
    waypointsAllowed: z.boolean(),
    countryRestriction: z.string(),
  }),
  routes: z.array(Route).min(1),
  weddings: z.object({
    positioning: z.string(),
    services: z.array(z.string()).min(1),
    typicalRoutes: z.array(z.object({ route: z.string(), when: z.string() })).min(1),
    process: z.array(z.string()).min(1),
    coverageNote: z.string(),
    vehicleNote: z.string(),
    priceEur: z.number().nullable(),
    priceNote: z.string(),
    enquiryFields: z.array(z.string()),
    faqs: z.array(Faq).default([]),
  }),
  notes: z.string().optional(),
});

export type TransferData = z.infer<typeof TransferData>;

export const transfers = cache((): TransferData => {
  const path = join(process.cwd(), "content", "transfers.json");
  const parsed = TransferData.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!parsed.success) {
    throw new Error(`Invalid content at ${path}\n${JSON.stringify(parsed.error, null, 2)}`);
  }
  return parsed.data;
});

export const transferRoutes = cache((): TransferRoute[] => transfers().routes);

export const transferRouteSlugs = cache((): string[] => transfers().routes.map((r) => r.slug));

export const getTransferRoute = cache(
  (slug: string): TransferRoute | null => transfers().routes.find((r) => r.slug === slug) ?? null,
);

/** Routes other than this one, for the "also driven" block on a route page. */
export function otherRoutes(slug: string, limit = 6): TransferRoute[] {
  return transferRoutes()
    .filter((r) => r.slug !== slug)
    .slice(0, limit);
}

export type RouteEstimate = {
  /** Cheapest metered fare for this distance, in whole euro. */
  low: number;
  /** Dearest, i.e. the large-party per-km rate. */
  high: number;
  /** True when the metered fare fell below the minimum order and was raised. */
  atMinimum: boolean;
};

/**
 * What the meter would come to for a route.
 *
 * Deliberately a range, and deliberately labelled an estimate wherever it is
 * shown. The booking engine is the only thing that quotes a binding fare; it
 * applies the same per-km bands and the same €20 minimum order, so this
 * cannot contradict it — but a headline number presented as *the* price
 * would be a promise this site is not in a position to make.
 */
export function estimateRoute(route: TransferRoute): RouteEstimate | null {
  const { perKmRates, minimumOrderEur, minimumDistanceKm } = transfers().pricing;
  if (perKmRates.length === 0) return null;

  // The meter never charges for less than the minimum distance, so a short
  // hop is billed as if it were that long.
  const km = Math.max(route.distanceKm, minimumDistanceKm);
  const rates = perKmRates.map((r) => r.eurPerKm);
  const raw = { low: km * Math.min(...rates), high: km * Math.max(...rates) };

  const low = Math.max(raw.low, minimumOrderEur);
  const high = Math.max(raw.high, minimumOrderEur);

  return {
    low: Math.round(low),
    high: Math.round(high),
    atMinimum: raw.low < minimumOrderEur,
  };
}

/** "1 h 5 min" — route durations are always under a day. */
export function routeDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** "Chania Airport to Rethymno" without the airport code parenthetical. */
export function shortPlace(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").replace(/\s+International\b/, "").trim();
}
