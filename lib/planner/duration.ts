import { billableHours } from "../pricing.ts";
import { CUSTOM_DAY_PRICE } from "./price.ts";
import { driveMinutes } from "./legs.ts";
import type { PlannerStopRef, TripDuration } from "./types.ts";

export function stayMinutes(stops: readonly PlannerStopRef[]): number {
  return stops.reduce((sum, stop) => sum + Math.max(0, stop.stayMin), 0);
}

export function drivingMinutes(
  start: string,
  stops: readonly PlannerStopRef[],
  drive = driveMinutes,
): number {
  const nodes = [start, ...stops.map((s) => s.slug), start];
  let total = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    total += drive(nodes[i], nodes[i + 1]);
  }
  return total;
}

export function tripDuration(
  start: string,
  stops: readonly PlannerStopRef[],
  drive = driveMinutes,
): TripDuration {
  const drivingMin = drivingMinutes(start, stops, drive);
  const stayMin = stayMinutes(stops);
  const rawMin = drivingMin + stayMin;
  return {
    drivingMin,
    stayMin,
    rawMin,
    billableHours: billableHours(rawMin, CUSTOM_DAY_PRICE),
  };
}

export function routeLabels(startName: string, stopNames: readonly string[]): string {
  if (stopNames.length === 0) return startName;
  return [startName, ...stopNames, startName].join(" → ");
}
