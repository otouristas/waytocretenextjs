import { getTour } from "@/lib/tours";

export const TRAVELOTOPOS_ORIGIN = "https://waytocrete.travelotopos.com";

const ATHENS = "Europe/Athens";
const CACHE_MS = 10 * 60 * 1000;
const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

type CacheEntry = { expires: number; closed: string[] };
const cache = new Map<string, CacheEntry>();

export type LiveBooker = {
  slug: string;
  serviceId: number;
  categoryId: number;
};

export type MonthAvailability = {
  slug: string;
  month: string;
  closed: string[];
  open: string[];
  catalogUrl: string;
};

function pack(slug: string, month: string, closed: string[], serviceId: number, categoryId: number): MonthAvailability {
  const merged = withPastClosed(month, closed);
  return {
    slug,
    month,
    closed: merged,
    open: daysInMonth(month).filter((iso) => !merged.includes(iso)),
    catalogUrl: catalogUrl(serviceId, categoryId),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function athensToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ATHENS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function athensMonth() {
  return athensToday().slice(0, 7);
}

export function parseMonth(value: string | null | undefined) {
  if (!value || !MONTH_RE.test(value)) return null;
  return value;
}

export function liveBooker(slug: string): LiveBooker | null {
  const tour = getTour(slug);
  if (!tour?.travelotopos) return null;
  return { slug: tour.slug, ...tour.travelotopos };
}

export function catalogUrl(serviceId: number, categoryId: number) {
  return `${TRAVELOTOPOS_ORIGIN}/s/${serviceId}?cids=${categoryId}`;
}

export function bookUrl(serviceId: number, categoryId: number, isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return catalogUrl(serviceId, categoryId);
  return `${TRAVELOTOPOS_ORIGIN}/s/${serviceId}/${categoryId}/${day}/${month}/${year}?date=${day}-${month}-${year}&cids=${categoryId}`;
}

function parseTtDate(raw: string) {
  const match = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!day || month < 1 || month > 12 || year < 2000) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function listTtDates(data: unknown) {
  const values = Array.isArray(data) ? data : data && typeof data === "object" ? Object.values(data) : [];
  const dates: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const iso = parseTtDate(value);
    if (iso) dates.push(iso);
  }
  return dates;
}

function daysInMonth(month: string) {
  const [year, mo] = month.split("-").map(Number);
  const last = new Date(Date.UTC(year, mo, 0)).getUTCDate();
  const days: string[] = [];
  for (let day = 1; day <= last; day++) days.push(`${month}-${pad(day)}`);
  return days;
}

function withPastClosed(month: string, closed: string[]) {
  const today = athensToday();
  const set = new Set(closed);
  for (const iso of daysInMonth(month)) {
    if (iso < today) set.add(iso);
  }
  return [...set].sort();
}

async function fetchDisabledDates(serviceId: number, month: string) {
  const probe = `${month}-15`;
  const body = new URLSearchParams({
    service_id: String(serviceId),
    server_service_id: "",
    partner_key: "",
    date: probe,
  });
  const response = await fetch(`${TRAVELOTOPOS_ORIGIN}/services/get_disabled_dates_of_service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`travelotopos_${response.status}`);
  const json = (await response.json()) as { error?: boolean; data?: unknown };
  if (json.error) throw new Error("travelotopos_error");
  return listTtDates(json.data).filter((iso) => iso.startsWith(month));
}

export async function getMonthAvailability(slug: string, monthRaw?: string | null): Promise<
  { ok: true; data: MonthAvailability } | { ok: false; error: string; status: number }
> {
  const booker = liveBooker(slug);
  if (!booker) return { ok: false, error: "not_live", status: 404 };
  const month = parseMonth(monthRaw);
  if (monthRaw && !month) return { ok: false, error: "bad_month", status: 400 };
  const resolved = month ?? athensMonth();
  const current = athensMonth();
  if (resolved < current) {
    return {
      ok: true,
      data: pack(booker.slug, resolved, daysInMonth(resolved), booker.serviceId, booker.categoryId),
    };
  }

  const key = `${booker.serviceId}:${resolved}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return {
      ok: true,
      data: pack(booker.slug, resolved, hit.closed, booker.serviceId, booker.categoryId),
    };
  }

  try {
    const closed = await fetchDisabledDates(booker.serviceId, resolved);
    cache.set(key, { expires: Date.now() + CACHE_MS, closed });
    return {
      ok: true,
      data: pack(booker.slug, resolved, closed, booker.serviceId, booker.categoryId),
    };
  } catch {
    return { ok: false, error: "upstream", status: 502 };
  }
}
