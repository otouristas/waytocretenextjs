import { PLANNER_TEMPLATES } from "./catalog.ts";
import type { PlannerStopRef } from "./types.ts";

export type PackagedTwin = {
  slug: string;
  coverage: number;
};

/**
 * If the guest-built day is essentially a day we already sell, offer the
 * packaged product — it is usually cheaper than the hourly custom rate.
 */
export function matchPackagedTour(stops: readonly PlannerStopRef[]): PackagedTwin | null {
  if (stops.length === 0) return null;
  const have = new Set(stops.map((s) => s.slug));
  let best: PackagedTwin | null = null;

  for (const template of PLANNER_TEMPLATES) {
    if (!template.matchTour || template.stops.length === 0) continue;
    const hit = template.stops.filter((slug) => have.has(slug)).length;
    const coverage = hit / template.stops.length;
    if (coverage < 0.8) continue;
    if (!best || coverage > best.coverage) {
      best = { slug: template.matchTour, coverage };
    }
  }

  return best;
}
