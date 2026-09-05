import type { PlannerLeg } from "../content/schema.ts";
import { geoOf, regionOf, PLANNER_LEGS } from "./catalog.ts";
import type { PlannerRegion } from "../content/schema.ts";

export function legKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function legsMap(legs: readonly PlannerLeg[] = PLANNER_LEGS): Map<string, number> {
  const map = new Map<string, number>();
  for (const leg of legs) {
    map.set(legKey(leg.from, leg.to), leg.minutes);
  }
  return map;
}

const AUTHORED = legsMap();

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

function speedKph(from: PlannerRegion | undefined, to: PlannerRegion | undefined): number {
  if (from && from === to) {
    if (from === "rethymno-south" || from === "rethymno-hills" || from === "sfakia") return 40;
    return 50;
  }
  const north = new Set(["rethymno-town", "west", "east"]);
  if (from && to && north.has(from) && north.has(to)) return 70;
  return 50;
}

/**
 * Region-aware estimate, rounded UP to 5 minutes. Biased slow on purpose —
 * an underestimate would underquote the day.
 */
export function estimateMinutes(
  fromGeo: { lat: number; lng: number },
  toGeo: { lat: number; lng: number },
  fromRegion?: PlannerRegion,
  toRegion?: PlannerRegion,
): number {
  const km = haversineKm(fromGeo, toGeo);
  const minutes = (km / speedKph(fromRegion, toRegion)) * 60 * 1.15;
  return Math.max(10, Math.ceil(minutes / 5) * 5);
}

export function driveMinutes(from: string, to: string, authored: Map<string, number> = AUTHORED): number {
  if (from === to) return 0;
  const known = authored.get(legKey(from, to));
  if (known != null) return known;
  const a = geoOf(from);
  const b = geoOf(to);
  if (!a || !b) return 40;
  return estimateMinutes(a, b, regionOf(from), regionOf(to));
}
