import type { PlannerAddon, PlannerInterest, PlannerStart, PlannerStop } from "../content/schema.ts";

export type { PlannerAddon, PlannerInterest, PlannerStart, PlannerStop };

export type PlannerStopRef = {
  slug: string;
  stayMin: number;
};

export type PlannerState = {
  start: string;
  people: number;
  date: string;
  interests: PlannerInterest[];
  stops: PlannerStopRef[];
  addons: PlannerAddon[];
};

export type TripDuration = {
  drivingMin: number;
  stayMin: number;
  rawMin: number;
  billableHours: number;
};

export const FAR_REGIONS = new Set(["far-west", "east", "sfakia"]);

export const DEFAULT_STATE: PlannerState = {
  start: "rethymno",
  people: 2,
  date: "",
  interests: [],
  stops: [],
  addons: [],
};
