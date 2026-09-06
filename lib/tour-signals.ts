import type { MonthAvailability } from "@/lib/travelotopos";

const ATHENS = "Europe/Athens";

function athensHour() {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: ATHENS,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  return Number(hour.find((part) => part.type === "hour")?.value ?? "0");
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Hour-stable browsing count in Europe/Athens. Hidden overnight.
 * Featured days sit at the high end of a 1–4 range. Not occupancy.
 */
export function browsingNow(slug: string, featured: boolean): number | null {
  const hour = athensHour();
  if (hour < 7) return null;
  const n = hash(`${slug}:${hour}`);
  if (featured) return 2 + (n % 3);
  return 1 + (n % 3);
}

/** Remaining van seats after this party — only shown when the van is nearly full. */
export function seatsLeftOnDeparture(groupMax: number, guests: number) {
  const left = groupMax - guests;
  if (left < 1 || left > 3) return null;
  return left;
}

/** True when most remaining days this month are closed on the live diary. */
export function fewOpenDates(avail: MonthAvailability | null | undefined) {
  if (!avail) return false;
  const days = avail.open.length + avail.closed.length;
  if (days === 0 || avail.open.length === 0) return false;
  return avail.open.length / days <= 0.4;
}
