import type { PlannerAddon, PlannerInterest } from "../content/schema.ts";
import { PLANNER_STARTS, STOP_BY_SLUG } from "./catalog.ts";
import { clampStay } from "./suggest.ts";
import { DEFAULT_STATE, type PlannerState, type PlannerStopRef } from "./types.ts";

const INTERESTS = new Set<PlannerInterest>([
  "beach",
  "villages",
  "food",
  "wine",
  "history",
  "hiking",
  "hidden",
  "nature",
]);

const ADDONS = new Set<PlannerAddon>(["guide", "lunch", "wine", "experience"]);
const STARTS = new Set(PLANNER_STARTS.map((s) => s.slug));

function parseStops(raw: string | null): PlannerStopRef[] {
  if (!raw) return [];
  const out: PlannerStopRef[] = [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const [slug, stayRaw] = part.split(":");
    if (!slug || !STOP_BY_SLUG.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    const stay = Number(stayRaw);
    const stop = STOP_BY_SLUG.get(slug)!;
    out.push({
      slug,
      stayMin: Number.isFinite(stay) ? clampStay(slug, stay) : stop.suggestedStayMin,
    });
  }
  return out;
}

function parseList<T extends string>(raw: string | null, allowed: Set<T>): T[] {
  if (!raw) return [];
  const out: T[] = [];
  for (const item of raw.split(",")) {
    if (allowed.has(item as T) && !out.includes(item as T)) out.push(item as T);
  }
  return out;
}

export function parsePlannerSearch(params: URLSearchParams): PlannerState {
  const startRaw = params.get("start") ?? "";
  const people = Number(params.get("p") ?? params.get("people") ?? DEFAULT_STATE.people);
  const date = params.get("d") ?? params.get("date") ?? "";
  return {
    start: STARTS.has(startRaw) ? startRaw : DEFAULT_STATE.start,
    people: Number.isFinite(people) ? Math.min(8, Math.max(1, Math.round(people))) : 2,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    interests: parseList(params.get("i") ?? params.get("interests"), INTERESTS),
    stops: parseStops(params.get("s") ?? params.get("stops")),
    addons: parseList(params.get("x") ?? params.get("extras"), ADDONS),
  };
}

export function serializePlannerSearch(state: PlannerState): string {
  const params = new URLSearchParams();
  if (state.start !== DEFAULT_STATE.start) params.set("start", state.start);
  if (state.people !== DEFAULT_STATE.people) params.set("p", String(state.people));
  if (state.date) params.set("d", state.date);
  if (state.interests.length) params.set("i", state.interests.join(","));
  if (state.stops.length) {
    params.set("s", state.stops.map((s) => `${s.slug}:${s.stayMin}`).join(","));
  }
  if (state.addons.length) params.set("x", state.addons.join(","));
  return params.toString();
}
