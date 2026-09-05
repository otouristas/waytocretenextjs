import type { PlannerStart, PlannerStop, PlannerLeg, PlannerTemplate, PlannerCopyFile } from "../content/schema.ts";
import type { Lang } from "../i18n/langs.ts";
import startsJson from "../../content/planner/starts.json" with { type: "json" };
import stopsJson from "../../content/planner/stops.json" with { type: "json" };
import legsJson from "../../content/planner/legs.json" with { type: "json" };
import templatesJson from "../../content/planner/templates.json" with { type: "json" };
import enCopy from "../../content/planner/copy/en.json" with { type: "json" };
import deCopy from "../../content/planner/copy/de.json" with { type: "json" };
import itCopy from "../../content/planner/copy/it.json" with { type: "json" };
import frCopy from "../../content/planner/copy/fr.json" with { type: "json" };
import svCopy from "../../content/planner/copy/sv.json" with { type: "json" };

export const PLANNER_STARTS = startsJson as PlannerStart[];
export const PLANNER_STOPS = stopsJson as PlannerStop[];
export const PLANNER_LEGS = legsJson as PlannerLeg[];
export const PLANNER_TEMPLATES = templatesJson as PlannerTemplate[];
export const PLANNER_COPY = enCopy as PlannerCopyFile;

const PLACE_COPY: Record<Lang, PlannerCopyFile> = {
  en: enCopy as PlannerCopyFile,
  de: deCopy as PlannerCopyFile,
  it: itCopy as PlannerCopyFile,
  fr: frCopy as PlannerCopyFile,
  sv: svCopy as PlannerCopyFile,
};

export function plannerPlaceCopy(lang: Lang): PlannerCopyFile {
  return PLACE_COPY[lang] ?? PLACE_COPY.en;
}

export const START_BY_SLUG = new Map(PLANNER_STARTS.map((s) => [s.slug, s]));
export const STOP_BY_SLUG = new Map(PLANNER_STOPS.map((s) => [s.slug, s]));

export function startOf(slug: string): PlannerStart | undefined {
  return START_BY_SLUG.get(slug);
}

export function stopOf(slug: string): PlannerStop | undefined {
  return STOP_BY_SLUG.get(slug);
}

export function stopName(slug: string, lang: Lang = "en"): string {
  return plannerPlaceCopy(lang).stops[slug]?.name ?? START_BY_SLUG.get(slug)?.slug ?? slug;
}

export function startName(slug: string, lang: Lang = "en"): string {
  return plannerPlaceCopy(lang).starts[slug] ?? slug;
}

export function stopBlurb(slug: string, lang: Lang = "en"): string {
  return plannerPlaceCopy(lang).stops[slug]?.blurb ?? "";
}

export function geoOf(slug: string): { lat: number; lng: number } | undefined {
  return STOP_BY_SLUG.get(slug)?.geo ?? START_BY_SLUG.get(slug)?.geo;
}

export function regionOf(slug: string): PlannerStart["region"] | undefined {
  return STOP_BY_SLUG.get(slug)?.region ?? START_BY_SLUG.get(slug)?.region;
}
