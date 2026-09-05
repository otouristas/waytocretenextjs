import { CUSTOM_DAY_PRICE } from "./price.ts";
import { FAR_REGIONS, type PlannerStopRef } from "./types.ts";
import { tripDuration } from "./duration.ts";
import { STOP_BY_SLUG, regionOf } from "./catalog.ts";

export type FeasibilityKind = "ok" | "long" | "far_mix" | "elafonisi_south" | "hike_plus";

export type Feasibility = {
  kind: FeasibilityKind;
  /** Geographically impossible — do not book as a normal day. */
  blocked: boolean;
  warn: boolean;
  message: string;
  /** Stop slugs to keep if the guest taps Rewrite. */
  rewrite?: string[];
};

function uniqueRegions(start: string, stops: readonly PlannerStopRef[]): string[] {
  const set = new Set<string>();
  const startRegion = regionOf(start);
  if (startRegion) set.add(startRegion);
  for (const stop of stops) {
    const region = regionOf(stop.slug);
    if (region) set.add(region);
  }
  return [...set];
}

function southSlugs(stops: readonly PlannerStopRef[]) {
  return stops.filter((s) => STOP_BY_SLUG.get(s.slug)?.region === "rethymno-south").map((s) => s.slug);
}

function hikingStops(stops: readonly PlannerStopRef[]) {
  return stops.filter((s) => {
    const stop = STOP_BY_SLUG.get(s.slug);
    return stop?.needs.includes("hike") || (stop?.categories.includes("hiking") && s.stayMin >= 180);
  });
}

/**
 * Soft-warn long days. Block combinations that cross two far sides of Crete.
 * Book stays available on a warning; a blocked day needs a rewrite first.
 */
export function feasibility(start: string, stops: readonly PlannerStopRef[]): Feasibility {
  if (stops.length === 0) {
    return { kind: "ok", blocked: false, warn: false, message: "" };
  }

  const regions = uniqueRegions(start, stops);
  const fars = regions.filter((r) => FAR_REGIONS.has(r));
  const hasSouth = regions.includes("rethymno-south");
  const hasFarWest = regions.includes("far-west");
  const hikes = hikingStops(stops);

  if (fars.length > 1) {
    const keepRegion = fars[0];
    const rewrite = stops
      .filter((s) => {
        const region = regionOf(s.slug);
        return region === keepRegion || (region && !FAR_REGIONS.has(region) && region !== "rethymno-south");
      })
      .map((s) => s.slug);
    return {
      kind: "far_mix",
      blocked: true,
      warn: true,
      message:
        "These are different sides of the island. Pick one coast — west, south or east — and we will write a day that actually fits.",
      rewrite: rewrite.length ? rewrite : [stops[0].slug],
    };
  }

  if (hasFarWest && hasSouth) {
    const west = stops.filter((s) => regionOf(s.slug) === "far-west").map((s) => s.slug);
    const south = southSlugs(stops);
    const rewrite = west.length >= south.length ? west : south;
    return {
      kind: "elafonisi_south",
      blocked: true,
      warn: true,
      message:
        "Elafonisi and the Preveli coast are three hours apart. We recommend one beach day, not both.",
      rewrite,
    };
  }

  if (hikes.length > 0 && stops.length > 2) {
    return {
      kind: "hike_plus",
      blocked: false,
      warn: true,
      message:
        "A gorge walk is already a full day. We recommend dropping the extra stops, or booking the guided hike as its own tour.",
      rewrite: hikes.map((s) => s.slug),
    };
  }

  const trip = tripDuration(start, stops);
  if (trip.billableHours > CUSTOM_DAY_PRICE.maxHours) {
    return {
      kind: "long",
      blocked: false,
      warn: true,
      message:
        "This itinerary may be quite long. We recommend removing one stop or extending your tour.",
    };
  }
  if (trip.billableHours >= CUSTOM_DAY_PRICE.warnHours) {
    return {
      kind: "long",
      blocked: false,
      warn: true,
      message:
        "This itinerary may be quite long. We recommend removing one stop or extending your tour.",
    };
  }

  return { kind: "ok", blocked: false, warn: false, message: "" };
}
