import "server-only";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { LANGS, type Lang } from "@/lib/i18n/langs";
import {
  GuideCopy,
  GuideCore,
  PlaceCopy,
  PlaceCore,
  Review,
  TourCopy,
  TourCore,
} from "./schema";

/**
 * The content layer.
 *
 * Files are read from disk and validated through their zod schema at build
 * time. A malformed file throws with the path and the field, which fails the
 * build — that is deliberate. The WordPress source this content came from has
 * known defects (duplicated bodies, contradictory difficulty ratings, prices
 * that disagree between two copies of a page); none of them may reach a page
 * quietly.
 */

const CONTENT = join(process.cwd(), "content");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function parseOrThrow<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: unknown } },
  value: unknown,
  path: string,
): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid content at ${path}\n${JSON.stringify(result.error, null, 2)}`);
  }
  return result.data as T;
}

function dirsIn(kind: string): string[] {
  const root = join(CONTENT, kind);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/* ────────────────────────────── tours ────────────────────────────── */

/**
 * A tour is only routable once BOTH its structural file and its English copy
 * exist. During a content sync one lands before the other, and without this a
 * half-written entry would be generated as a route and then 404 at render.
 */
export const tourSlugs = cache((): string[] =>
  dirsIn("tours").filter(
    (slug) =>
      existsSync(join(CONTENT, "tours", slug, "tour.json")) &&
      existsSync(join(CONTENT, "tours", slug, "en.json")),
  ),
);

export const getTourCore = cache((slug: string): TourCore | null => {
  const path = join(CONTENT, "tours", slug, "tour.json");
  if (!existsSync(path)) return null;
  return parseOrThrow(TourCore, readJson(path), path);
});

export const getTourCopy = cache((slug: string, lang: Lang): TourCopy | null => {
  const path = join(CONTENT, "tours", slug, `${lang}.json`);
  if (!existsSync(path)) return null;
  return parseOrThrow(TourCopy, readJson(path), path);
});

/**
 * Which locales have publishable copy for this tour.
 *
 * Only `reviewed` translations count. This is what gates hreflang: a page
 * must never advertise a locale alternate that would serve English, which is
 * exactly the duplicate-content trap the predecessor site fell into.
 */
export const tourLangs = cache((slug: string): Lang[] =>
  LANGS.filter((lang) => getTourCopy(slug, lang)?.state === "reviewed"),
);

export const allTours = cache((lang: Lang) =>
  tourSlugs()
    .map((slug) => {
      const core = getTourCore(slug);
      const copy = getTourCopy(slug, lang) ?? getTourCopy(slug, "en");
      return core && copy ? { core, copy } : null;
    })
    .filter((x): x is { core: TourCore; copy: TourCopy } => x !== null),
);

/* ────────────────────────────── guides ────────────────────────────── */

export const guideSlugs = cache((): string[] =>
  dirsIn("guides").filter(
    (slug) =>
      existsSync(join(CONTENT, "guides", slug, "guide.json")) &&
      existsSync(join(CONTENT, "guides", slug, "en.json")),
  ),
);

export const getGuideCore = cache((slug: string): GuideCore | null => {
  const path = join(CONTENT, "guides", slug, "guide.json");
  if (!existsSync(path)) return null;
  return parseOrThrow(GuideCore, readJson(path), path);
});

export const getGuideCopy = cache((slug: string, lang: Lang): GuideCopy | null => {
  const path = join(CONTENT, "guides", slug, `${lang}.json`);
  if (!existsSync(path)) return null;
  return parseOrThrow(GuideCopy, readJson(path), path);
});

export const guideLangs = cache((slug: string): Lang[] =>
  LANGS.filter((lang) => getGuideCopy(slug, lang)?.state === "reviewed"),
);

export const allGuides = cache((lang: Lang) =>
  guideSlugs()
    .map((slug) => {
      const core = getGuideCore(slug);
      const copy = getGuideCopy(slug, lang) ?? getGuideCopy(slug, "en");
      return core && copy ? { core, copy } : null;
    })
    .filter((x): x is { core: GuideCore; copy: GuideCopy } => x !== null)
    .sort((a, b) => b.core.published.localeCompare(a.core.published)),
);

/* ────────────────────────────── places ────────────────────────────── */

export const placeSlugs = cache((): string[] =>
  dirsIn("places").filter(
    (slug) =>
      existsSync(join(CONTENT, "places", slug, "place.json")) &&
      existsSync(join(CONTENT, "places", slug, "en.json")),
  ),
);

export const getPlaceCore = cache((slug: string): PlaceCore | null => {
  const path = join(CONTENT, "places", slug, "place.json");
  if (!existsSync(path)) return null;
  return parseOrThrow(PlaceCore, readJson(path), path);
});

export const getPlaceCopy = cache((slug: string, lang: Lang): PlaceCopy | null => {
  const path = join(CONTENT, "places", slug, `${lang}.json`);
  if (!existsSync(path)) return null;
  return parseOrThrow(PlaceCopy, readJson(path), path);
});

export const placeLangs = cache((slug: string): Lang[] =>
  LANGS.filter((lang) => getPlaceCopy(slug, lang)?.state === "reviewed"),
);

export const allPlaces = cache((lang: Lang) =>
  placeSlugs()
    .map((slug) => {
      const core = getPlaceCore(slug);
      const copy = getPlaceCopy(slug, lang) ?? getPlaceCopy(slug, "en");
      return core && copy ? { core, copy } : null;
    })
    .filter((x): x is { core: PlaceCore; copy: PlaceCopy } => x !== null),
);

/* ────────────────────────────── reviews ────────────────────────────── */

export const allReviews = cache((): Review[] => {
  const path = join(CONTENT, "reviews", "reviews.json");
  if (!existsSync(path)) return [];
  const raw = readJson(path);
  const list = Array.isArray(raw) ? raw : [];
  return list.map((r, i) => parseOrThrow(Review, r, `${path}[${i}]`));
});

/**
 * Longest first.
 *
 * There is no publication date on any review in the source data, so sorting
 * by `date` was sorting by nothing. A review that names the gorge, the guide
 * and the lunch is worth more to a reader — and to an answer engine — than
 * "Great, recommended", so length is the honest proxy while dates are
 * missing. Ties break on id so the order is stable between builds.
 */
function byUsefulness(a: Review, b: Review) {
  if (a.date && b.date && a.date !== b.date) return b.date.localeCompare(a.date);
  if (a.text.length !== b.text.length) return b.text.length - a.text.length;
  return a.id.localeCompare(b.id);
}

/** Reviews for one tour. */
export const reviewsForTour = cache((slug: string): Review[] =>
  allReviews()
    .filter((r) => r.tour === slug)
    .sort(byUsefulness),
);

/**
 * Reviews for the transfer service.
 *
 * `route` narrows to one origin-pair page; without it you get every transfer
 * review, which is what the hub page wants. Wedding reviews are included
 * only on the wedding page, since a wedding logistics review answers a
 * different question from "was the airport pickup on time".
 */
export const reviewsForTransfers = cache((route?: string): Review[] => {
  const all = allReviews().filter((r) => r.service === "transfer");
  if (!route) return all.sort(byUsefulness);
  // Route-specific first, then the service-wide ones, so a thin route page
  // still has something to show without pretending those reviews name it.
  const exact = all.filter((r) => r.route === route).sort(byUsefulness);
  const generic = all.filter((r) => r.route === null).sort(byUsefulness);
  return [...exact, ...generic];
});

export const reviewsForWeddings = cache((): Review[] =>
  allReviews()
    .filter((r) => r.service === "wedding")
    .sort(byUsefulness),
);

export const reviewsBySource = cache((source: Review["source"]): Review[] =>
  allReviews()
    .filter((r) => r.source === source)
    .sort(byUsefulness),
);

/**
 * The star values behind an `AggregateRating`.
 *
 * Only reviews that are schema-eligible AND carry a real numeric rating.
 * That is now 48 Google Business Profile reviews; the WordPress carousel
 * entries and every TripAdvisor review still return nothing, because their
 * five stars are template decoration rather than captured values.
 */
export function ratingsFor(reviews: Review[]): number[] {
  return reviews
    .filter((r) => r.schemaEligible && typeof r.rating === "number")
    .map((r) => r.rating as number);
}

export type RatingSummary = { average: number; count: number };

/** Null when nothing in the set carries a real star value. */
export function ratingSummary(reviews: Review[]): RatingSummary | null {
  const ratings = ratingsFor(reviews);
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return { average: Math.round((sum / ratings.length) * 10) / 10, count: ratings.length };
}
