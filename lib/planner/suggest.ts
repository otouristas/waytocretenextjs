import type { PlannerInterest, PlannerTemplate } from "../content/schema.ts";
import { PLANNER_TEMPLATES, STOP_BY_SLUG } from "./catalog.ts";
import { CUSTOM_DAY_PRICE } from "./price.ts";
import { tripDuration } from "./duration.ts";
import { feasibility } from "./feasibility.ts";
import type { PlannerStopRef } from "./types.ts";

function scoreTemplate(
  template: PlannerTemplate,
  interests: readonly PlannerInterest[],
  start: string,
): number {
  if (interests.length === 0) {
    return template.id === "south-coast" ? 2 : 0;
  }
  let score = 0;
  for (const interest of interests) {
    if (template.interests.includes(interest)) score += 2;
  }
  if (template.preferStarts.includes(start)) score += 1.5;
  // Prefer a template that is actually driveable from this start.
  const packed = packStops(start, template.stops);
  if (packed.length === 0) score -= 5;
  if (feasibility(start, packed).blocked) score -= 8;
  return score;
}

export function packStops(start: string, slugs: readonly string[]): PlannerStopRef[] {
  const packed: PlannerStopRef[] = [];
  for (const slug of slugs) {
    const stop = STOP_BY_SLUG.get(slug);
    if (!stop) continue;
    const next = [...packed, { slug, stayMin: stop.suggestedStayMin }];
    const trip = tripDuration(start, next);
    if (packed.length > 0 && trip.billableHours > CUSTOM_DAY_PRICE.warnHours) break;
    packed.push({ slug, stayMin: stop.suggestedStayMin });
    if (feasibility(start, packed).blocked) {
      packed.pop();
    }
  }
  if (packed.length === 0 && slugs[0] && STOP_BY_SLUG.has(slugs[0])) {
    const stop = STOP_BY_SLUG.get(slugs[0])!;
    return [{ slug: stop.slug, stayMin: stop.suggestedStayMin }];
  }
  return packed;
}

export function pickTemplate(
  interests: readonly PlannerInterest[],
  start: string,
  templates: readonly PlannerTemplate[] = PLANNER_TEMPLATES,
): PlannerTemplate {
  let best = templates[0];
  let bestScore = -Infinity;
  for (const template of templates) {
    const score = scoreTemplate(template, interests, start);
    if (score > bestScore) {
      best = template;
      bestScore = score;
    }
  }
  return best;
}

export function suggestDay(
  interests: readonly PlannerInterest[],
  start: string,
): { template: PlannerTemplate; stops: PlannerStopRef[] } {
  const template = pickTemplate(interests, start);
  return { template, stops: packStops(start, template.stops) };
}

/** Clamp a stay to the stop's published min/max, snapped to 30 minutes. */
export function clampStay(slug: string, stayMin: number): number {
  const stop = STOP_BY_SLUG.get(slug);
  if (!stop) return stayMin;
  const snapped = Math.round(stayMin / CUSTOM_DAY_PRICE.incrementMinutes) * CUSTOM_DAY_PRICE.incrementMinutes;
  return Math.min(stop.maxStayMin, Math.max(stop.minStayMin, snapped));
}
