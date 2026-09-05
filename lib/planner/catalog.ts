import type { PlannerStart, PlannerStop, PlannerLeg, PlannerTemplate, PlannerCopyFile } from "../content/schema.ts";
import startsJson from "../../content/planner/starts.json" with { type: "json" };
import stopsJson from "../../content/planner/stops.json" with { type: "json" };
import legsJson from "../../content/planner/legs.json" with { type: "json" };
import templatesJson from "../../content/planner/templates.json" with { type: "json" };
import copyJson from "../../content/planner/copy/en.json" with { type: "json" };

export const PLANNER_STARTS = startsJson as PlannerStart[];
export const PLANNER_STOPS = stopsJson as PlannerStop[];
export const PLANNER_LEGS = legsJson as PlannerLeg[];
export const PLANNER_TEMPLATES = templatesJson as PlannerTemplate[];
export const PLANNER_COPY = copyJson as PlannerCopyFile;

export const START_BY_SLUG = new Map(PLANNER_STARTS.map((s) => [s.slug, s]));
export const STOP_BY_SLUG = new Map(PLANNER_STOPS.map((s) => [s.slug, s]));

export function startOf(slug: string): PlannerStart | undefined {
  return START_BY_SLUG.get(slug);
}

export function stopOf(slug: string): PlannerStop | undefined {
  return STOP_BY_SLUG.get(slug);
}

export function stopName(slug: string): string {
  return PLANNER_COPY.stops[slug]?.name ?? START_BY_SLUG.get(slug)?.slug ?? slug;
}

export function startName(slug: string): string {
  return PLANNER_COPY.starts[slug] ?? slug;
}

export function stopBlurb(slug: string): string {
  return PLANNER_COPY.stops[slug]?.blurb ?? "";
}

export function geoOf(slug: string): { lat: number; lng: number } | undefined {
  return STOP_BY_SLUG.get(slug)?.geo ?? START_BY_SLUG.get(slug)?.geo;
}

export function regionOf(slug: string): PlannerStart["region"] | undefined {
  return STOP_BY_SLUG.get(slug)?.region ?? START_BY_SLUG.get(slug)?.region;
}
