import type { Lang } from "../i18n/langs.ts";
import { t } from "../i18n/ui.ts";
import type { Cadence } from "./schema.ts";

/** "5–7h", "12h", "7 days" — derived from minutes so it cannot drift. */
export function durationLabel(minutes: number, lang: Lang): string {
  const ui = t(lang);
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440);
    return `${days} ${days === 1 ? ui.day : ui.days}`;
  }
  const hours = minutes / 60;
  const rounded = Number.isInteger(hours) ? hours : Math.round(hours * 10) / 10;
  return `${rounded}${ui.hours.startsWith("h") ? "h" : ` ${ui.hours}`}`;
}

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/**
 * Human availability.
 *
 * Availability is stored as data rather than prose precisely because the
 * WordPress source states it three different ways on the same product
 * ("Every Day", "Every Day (except Tuesday )", "Upon Request"). One shape in,
 * one sentence out.
 */
export function cadenceLabel(cadence: Cadence, lang: Lang): string {
  const ui = t(lang);
  switch (cadence.kind) {
    case "daily":
      return ui.cadenceLabel.daily;
    case "on_request":
      return ui.onRequest;
    case "weekdays": {
      const days = DAY_ORDER.filter((d) => cadence.days.includes(d));
      if (days.length === 7) return ui.cadenceLabel.daily;
      return days.map((d) => ui.daysShort[d]).join(", ");
    }
    case "seasonal": {
      const months = [...cadence.months].sort((a, b) => a - b);
      const first = ui.monthsShort[months[0] - 1];
      const last = ui.monthsShort[months[months.length - 1] - 1];
      return `${first}–${last}`;
    }
    case "fixed_dates":
      return `${cadence.departures.length} ${cadence.departures.length === 1 ? ui.departure : ui.departures}`;
  }
}

/** Whether a date string falls inside the product's operating season. */
export function runsOn(cadence: Cadence, isoDate: string): boolean {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return false;
  // Zeller-free weekday: construct from parts, no ambient clock involved.
  const weekday = DAY_ORDER[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7];

  switch (cadence.kind) {
    case "daily":
      return true;
    case "on_request":
      return true;
    case "weekdays":
      return cadence.days.includes(weekday);
    case "seasonal":
      return cadence.months.includes(m) && cadence.days.includes(weekday);
    case "fixed_dates":
      return cadence.departures.some((dep) => isoDate >= dep.start && isoDate <= dep.end);
  }
}

/**
 * A stable anchor id for a Markdown heading.
 *
 * Shared by the Prose renderer, which stamps the `id`, and by whatever builds
 * a contents rail pointing at it — deriving both from one function is what
 * stops the two drifting apart.
 */
export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
