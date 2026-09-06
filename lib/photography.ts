import { LANG_META, fill, type Lang } from "@/lib/i18n/langs";
import { durationLabel } from "@/lib/content/format";
import { photographyCopy } from "@/lib/i18n/photography";
import type {
  PhotoDeparture,
  PhotoGear,
  PhotoPackage,
  PhotographyCore,
} from "@/lib/content/schema";

/**
 * Derived facts about a photography product.
 *
 * The same rule tours follow: nothing here invents a number. Every figure is
 * read out of `photo.json`, so the price on a card, the price in the JSON-LD
 * offer and the price in llms.txt are provably the same figure — the section
 * ships two products whose whole pitch is a published price, and three copies
 * of it maintained by hand would drift within a month.
 *
 * No `server-only` marker: the request form is a client island and needs the
 * label helpers. Nothing in this module touches the filesystem.
 */

/** The "From €X" anchor: the cheapest package, or the payable workshop rate. */
export function photoPriceFrom(core: PhotographyCore): number | null {
  if (core.kind === "experience") {
    return core.packages.reduce<number | null>(
      (low, pkg) => (low == null || pkg.priceEur < low ? pkg.priceEur : low),
      null,
    );
  }
  return core.workshop.earlyBird ?? core.workshop.standard;
}

/** The top of the published range, or null when there is only one price. */
export function photoPriceTo(core: PhotographyCore): number | null {
  if (core.kind === "experience") {
    return core.packages.reduce<number | null>(
      (high, pkg) => (high == null || pkg.priceEur > high ? pkg.priceEur : high),
      null,
    );
  }
  return core.workshop.earlyBird ? core.workshop.standard : null;
}

/** The package a card should highlight. At most one may carry the flag. */
export function popularPackage(core: PhotographyCore): PhotoPackage | null {
  if (core.kind !== "experience") return null;
  return core.packages.find((pkg) => pkg.popular) ?? null;
}

/** "1h", "2h", "7–8h" — ranges keep the unit on the upper bound only. */
export function packageDuration(pkg: PhotoPackage, lang: Lang): string {
  const to = durationLabel(pkg.minutes, lang);
  if (pkg.minutesMax == null || pkg.minutesMax === pkg.minutes) return to;
  const lower = String(Math.round((pkg.minutes / 60) * 10) / 10);
  return `${lower}–${durationLabel(pkg.minutesMax, lang)}`;
}

/** "1 location" / "3 locations" / "2–3 locations". */
export function locationsLabel(pkg: PhotoPackage, lang: Lang): string {
  const copy = photographyCopy(lang);
  const [min, max] = pkg.locations;
  if (min !== max) return fill(copy.locationsRange, { min, max });
  return min === 1 ? copy.locationOne : fill(copy.locationsN, { n: min });
}

/** "30–40 professionally edited photos" / "200+ professionally edited photos". */
export function editedPhotosLabel(pkg: PhotoPackage, lang: Lang): string {
  const copy = photographyCopy(lang);
  const [min, max] = pkg.editedPhotos;
  if (max == null) return fill(copy.photosPlus, { n: min });
  return fill(copy.photosRange, { min, max });
}

/** The bare count, for compact rows: "30–40" / "200+". */
export function editedPhotosCount(pkg: PhotoPackage): string {
  const [min, max] = pkg.editedPhotos;
  return max == null ? `${min}+` : `${min}–${max}`;
}

const GEAR_KEY = {
  dslr: "gearDslr",
  mirrorless: "gearMirrorless",
  compact: "gearCompact",
  smartphone: "gearSmartphone",
} as const satisfies Record<PhotoGear, keyof ReturnType<typeof photographyCopy>>;

export function gearLabel(gear: PhotoGear, lang: Lang): string {
  return photographyCopy(lang)[GEAR_KEY[gear]];
}

/**
 * "October 2026" in the reader's language.
 *
 * Built from a UTC noon date so no timezone can push a month boundary — a
 * departure month rendered as September because the reader is west of
 * Greenwich would be a real, visible bug on a seasonal product.
 */
export function departureMonthLabel(month: string, lang: Lang): string {
  const [year, mo] = month.split("-").map(Number);
  if (!year || !mo) return month;
  return new Intl.DateTimeFormat(LANG_META[lang].dateLocale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, mo - 1, 15, 12)));
}

/** "13–16 April 2027", or the month when ops has not fixed the dates yet. */
export function departureDatesLabel(departure: PhotoDeparture, lang: Lang): string {
  const copy = photographyCopy(lang);
  if (!departure.start || !departure.end) return copy.datesTba;
  const locale = LANG_META[lang].dateLocale;
  const start = new Date(`${departure.start}T12:00:00Z`);
  const end = new Date(`${departure.end}T12:00:00Z`);
  const day = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: "UTC" });
  const full = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const sameMonth = departure.start.slice(0, 7) === departure.end.slice(0, 7);
  return sameMonth ? `${day.format(start)}–${full.format(end)}` : `${full.format(start)} – ${full.format(end)}`;
}

export function departureStatusLabel(status: PhotoDeparture["status"], lang: Lang): string {
  const copy = photographyCopy(lang);
  if (status === "confirmed") return copy.statusConfirmed;
  if (status === "limited") return copy.statusLimited;
  return copy.statusForming;
}

/**
 * The call to action a departure earns.
 *
 * A confirmed departure can be booked. Anything else is a request to join,
 * because the workshop does not run below its minimum group and a "Book now"
 * on a departure that may never happen is a promise we cannot keep.
 */
export function departureCta(status: PhotoDeparture["status"], lang: Lang): string {
  const copy = photographyCopy(lang);
  return status === "confirmed" ? copy.bookDeparture : copy.requestToJoin;
}

/** Route for a photography product. Both families share one detail path. */
export function photoPath(slug: string): string {
  return `/photography/${slug}`;
}

export const PHOTOGRAPHY_PATH = "/photography";
export const PHOTO_EXPERIENCES_PATH = "/photography/experiences";
export const PHOTO_WORKSHOPS_PATH = "/photography/workshops";

/** The family hub a product belongs to. */
export function familyPath(kind: PhotographyCore["kind"]): string {
  return kind === "experience" ? PHOTO_EXPERIENCES_PATH : PHOTO_WORKSHOPS_PATH;
}
