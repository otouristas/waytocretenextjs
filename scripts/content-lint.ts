import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  GuideCopy,
  GuideCore,
  PhotographyCopy,
  PhotographyCore,
  PlaceCopy,
  PlaceCore,
  PlannerCopyFile,
  PlannerLeg,
  PlannerStart,
  PlannerStop,
  PlannerTemplate,
  Review,
  TourCopy,
  TourCore,
} from "../lib/content/schema.ts";
import { priceFrom, quote } from "../lib/pricing.ts";
import { LANGS } from "../lib/i18n/langs.ts";

/**
 * The content gate.
 *
 * Run with `npm run content:lint`. It does two jobs:
 *
 *  1. Schema validation — every file parses, or the build stops.
 *  2. Editorial rules that a schema cannot express: no fabricated ratings, no
 *     price ladders with holes or overlaps, no duplicated FAQ text across
 *     tours (the WordPress source has byte-identical FAQs on two pages), and
 *     SEO fields within the lengths Google will actually render.
 */

const ROOT = join(import.meta.dirname, "..");
const CONTENT = join(ROOT, "content");

let errors = 0;
let warnings = 0;

const fail = (where: string, msg: string) => {
  errors++;
  console.error(`  ✖ ${where}\n    ${msg}`);
};
const warn = (where: string, msg: string) => {
  warnings++;
  console.warn(`  ⚠ ${where}\n    ${msg}`);
};

function dirs(kind: string): string[] {
  const root = join(CONTENT, kind);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function load(path: string): unknown | null {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(path, `not valid JSON: ${(e as Error).message}`);
    return null;
  }
}

function check<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: unknown } },
  value: unknown,
  path: string,
): T | null {
  const r = schema.safeParse(value);
  if (!r.success) {
    const issues = (r.error as { issues?: Array<{ path: unknown[]; message: string }> })?.issues ?? [];
    fail(
      path,
      issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("\n    ") ||
        JSON.stringify(r.error),
    );
    return null;
  }
  return r.data as T;
}

/* ────────────────────────────── tours ────────────────────────────── */

console.log("\nTours");
const faqIndex = new Map<string, string>();
const sharedFaqs = new Map<string, string[]>();
const tourSlugs = dirs("tours");
const knownPlaces = new Set(dirs("places"));

for (const slug of tourSlugs) {
  const base = join(CONTENT, "tours", slug);
  const corePath = join(base, "tour.json");
  if (!existsSync(corePath)) {
    fail(`tours/${slug}`, "missing tour.json");
    continue;
  }

  const core = check(TourCore, load(corePath), `tours/${slug}/tour.json`);
  if (!core) continue;

  if (core.slug !== slug) fail(`tours/${slug}/tour.json`, `slug field is "${core.slug}"`);

  // A sliding ladder must be contiguous and non-overlapping, or `quote()`
  // silently drops a party size into an enquiry.
  if (core.price.kind === "sliding_per_person") {
    const tiers = [...core.price.tiers].sort((a, b) => a.minGuests - b.minGuests);
    for (const tier of tiers) {
      if (tier.maxGuests < tier.minGuests) {
        fail(`tours/${slug}`, `price tier ${tier.minGuests}-${tier.maxGuests} is inverted`);
      }
    }
    for (let i = 1; i < tiers.length; i++) {
      const gap = tiers[i].minGuests - tiers[i - 1].maxGuests;
      if (gap > 1) {
        fail(
          `tours/${slug}`,
          `price ladder has a hole between ${tiers[i - 1].maxGuests} and ${tiers[i].minGuests} guests`,
        );
      } else if (gap < 1) {
        fail(`tours/${slug}`, `price tiers overlap around ${tiers[i].minGuests} guests`);
      }
    }
    const lo = tiers[0].minGuests;
    const hi = tiers[tiers.length - 1].maxGuests;
    if (lo !== core.groupMin || hi !== core.groupMax) {
      warn(
        `tours/${slug}`,
        `ladder covers ${lo}-${hi} guests but groupMin/groupMax are ${core.groupMin}/${core.groupMax}`,
      );
    }
    // Every legal party size must price without falling through.
    for (let n = core.groupMin; n <= core.groupMax; n++) {
      const q = quote(core.price, { adults: n, children: 0, infants: 0 });
      if (q.kind !== "priced") {
        fail(`tours/${slug}`, `a party of ${n} does not price against the ladder`);
      }
    }
  }

  if (core.groupMin > core.groupMax) {
    fail(`tours/${slug}`, `groupMin ${core.groupMin} exceeds groupMax ${core.groupMax}`);
  }

  if (knownPlaces.size > 0) {
    for (const place of core.places) {
      if (!knownPlaces.has(place)) {
        warn(`tours/${slug}`, `references place "${place}" with no content/places entry`);
      }
    }
  }

  if (core.gallery.includes(core.hero)) {
    warn(`tours/${slug}`, "hero image is repeated in the gallery");
  }

  // Locale copy.
  for (const file of readdirSync(base)) {
    if (!file.endsWith(".json") || file === "tour.json" || file.startsWith("_")) continue;
    const path = `tours/${slug}/${file}`;
    const copy = check(TourCopy, load(join(base, file)), path);
    if (!copy) continue;

    if (copy.seoTitle.length > 70) fail(path, `seoTitle is ${copy.seoTitle.length} chars (max 70)`);
    if (copy.seoDescription.length > 165) {
      fail(path, `seoDescription is ${copy.seoDescription.length} chars (max 165)`);
    }
    if (/\bguest desk\b/i.test(copy.seoTitle) || /^request /i.test(copy.seoTitle)) {
      fail(path, "seoTitle still uses the retired guest-desk phrasing");
    }

    /**
     * The source site ships byte-identical FAQ blocks across tours — Shepherd
     * and Rethymno Walk share five answers verbatim.
     *
     * One shared answer is usually legitimate: the cancellation policy is the
     * same policy whichever tour you book, and repeating it is good for answer
     * engines. Two or more shared answers between the same pair of tours is
     * copy-paste, and that is what this flags.
     */
    for (const faq of copy.faqs) {
      const key = `${copy.lang}::${faq.a.trim().toLowerCase()}`;
      const seen = faqIndex.get(key);
      if (seen && seen !== slug) {
        const pair = [seen, slug].sort().join(" ↔ ");
        sharedFaqs.set(pair, [...(sharedFaqs.get(pair) ?? []), faq.q]);
      } else {
        faqIndex.set(key, slug);
      }
    }

    if (priceFrom(core.price) == null && !/request/i.test(copy.priceNote ?? "")) {
      warn(path, "tour has no published price; priceNote should say so plainly");
    }
  }
}
for (const [pair, questions] of sharedFaqs) {
  if (questions.length >= 2) {
    fail(`tours: ${pair}`, `${questions.length} FAQ answers are byte-identical — copy-paste, not a shared policy:\n      ${questions.join("\n      ")}`);
  } else {
    warn(`tours: ${pair}`, `shares one FAQ answer (“${questions[0]}”) — fine if it is a universal policy`);
  }
}
console.log(`  ${tourSlugs.length} tours checked`);

/* ────────────────────────────── guides ────────────────────────────── */

console.log("\nGuides");
const guideSlugs = dirs("guides");
const knownTours = new Set(tourSlugs);
for (const slug of guideSlugs) {
  const base = join(CONTENT, "guides", slug);
  const corePath = join(base, "guide.json");
  if (!existsSync(corePath)) {
    fail(`guides/${slug}`, "missing guide.json");
    continue;
  }
  const core = check(GuideCore, load(corePath), `guides/${slug}/guide.json`);
  if (!core) continue;
  if (!existsSync(join(base, "en.json"))) {
    fail(`guides/${slug}`, "has guide.json but no en.json — the route will not be generated");
    continue;
  }

  for (const tour of core.tours) {
    if (knownTours.size > 0 && !knownTours.has(tour)) {
      warn(`guides/${slug}`, `links to unknown tour "${tour}"`);
    }
  }

  for (const file of readdirSync(base)) {
    if (!file.endsWith(".json") || file === "guide.json" || file.startsWith("_")) continue;
    const path = `guides/${slug}/${file}`;
    const copy = check(GuideCopy, load(join(base, file)), path);
    if (!copy) continue;
    if (copy.seoTitle.length > 70) fail(path, `seoTitle is ${copy.seoTitle.length} chars (max 70)`);
    if (copy.body.length < 600) warn(path, `body is only ${copy.body.length} chars — likely thin`);
  }
}
console.log(`  ${guideSlugs.length} guides checked`);

/* ────────────────────────────── places ────────────────────────────── */

console.log("\nPlaces");
const placeSlugs = dirs("places");
for (const slug of placeSlugs) {
  const base = join(CONTENT, "places", slug);
  const corePath = join(base, "place.json");
  if (!existsSync(corePath)) {
    fail(`places/${slug}`, "missing place.json");
    continue;
  }
  const core = check(PlaceCore, load(corePath), `places/${slug}/place.json`);
  if (!core) continue;
  // Crete sits inside this box; a coordinate outside it is a transcription slip.
  if (core.geo.lat < 34.7 || core.geo.lat > 35.8 || core.geo.lng < 23.4 || core.geo.lng > 26.4) {
    fail(`places/${slug}`, `coordinates ${core.geo.lat},${core.geo.lng} are not in Crete`);
  }
  if (!core.hero) {
    warn(`places/${slug}`, "no hero image — the page falls back to a text header");
  }
  for (const file of readdirSync(base)) {
    if (!file.endsWith(".json") || file === "place.json" || file.startsWith("_")) continue;
    const path = `places/${slug}/${file}`;
    const copy = check(PlaceCopy, load(join(base, file)), path);
    if (copy && copy.quickAnswers.length < 3) {
      warn(path, `only ${copy.quickAnswers.length} quick answers — these are the AEO payload`);
    }
  }
}
console.log(`  ${placeSlugs.length} places checked`);

/* ────────────────────────────── reviews ────────────────────────────── */

console.log("\nReviews");
const transferRouteSlugs = new Set(
  (
    (load(join(CONTENT, "transfers.json")) as { routes?: Array<{ slug?: string }> } | null)
      ?.routes ?? []
  )
    .map((r) => r.slug)
    .filter((s): s is string => typeof s === "string"),
);
const reviewsPath = join(CONTENT, "reviews", "reviews.json");
if (existsSync(reviewsPath)) {
  const raw = load(reviewsPath);
  const list = Array.isArray(raw) ? raw : [];
  let eligible = 0;
  list.forEach((r, i) => {
    const review = check(Review, r, `reviews[${i}]`);
    if (!review) return;
    // The rule the whole site depends on: a rating must be real.
    if (review.schemaEligible && typeof review.rating !== "number") {
      fail(`reviews[${i}]`, `"${review.author}" is schemaEligible but has no numeric rating`);
    }
    if (review.schemaEligible) eligible++;
    // A typo in the mapping table is silent: the review simply stops being
    // about anything and quietly leaves a tour page without stars.
    if (review.tour && !tourSlugs.includes(review.tour)) {
      fail(`reviews[${i}]`, `"${review.author}" is mapped to unknown tour ${review.tour}`);
    }
    if (review.route && !transferRouteSlugs.has(review.route)) {
      fail(`reviews[${i}]`, `"${review.author}" is mapped to unknown transfer route ${review.route}`);
    }
  });
  console.log(`  ${list.length} reviews, ${eligible} eligible for AggregateRating`);

  /*
   * Every tour must resolve to at least one real star value, because a tour
   * page with no `AggregateRating` can never show stars in a result — and
   * that is the point of collecting reviews at all. This mirrors what
   * `reviewsForTour` actually does: the tour's own reviews, plus the
   * operator-wide pool. Keep the two in step or this check lies.
   */
  const rated = (r: { schemaEligible: boolean; rating: number | null }) =>
    r.schemaEligible && typeof r.rating === "number";
  const generic = list.filter(
    (r) => rated(r) && (r.service === "general" || (r.service === "tour" && r.tour === null)),
  );
  const starless = tourSlugs.filter(
    (slug) => generic.length === 0 && !list.some((r) => r.tour === slug && rated(r)),
  );
  for (const slug of starless) {
    fail(`tours/${slug}`, "no review resolves to a star value, so the page can carry no rating");
  }
  console.log(`  ${tourSlugs.length - starless.length}/${tourSlugs.length} tours carry a rating`);
} else {
  console.log("  (no reviews file yet)");
}

/* ────────────────────────────── planner ────────────────────────────── */

console.log("\nPlanner");
{
  const starts = (load(join(CONTENT, "planner/starts.json")) as unknown[]) ?? [];
  const stops = (load(join(CONTENT, "planner/stops.json")) as unknown[]) ?? [];
  const legs = (load(join(CONTENT, "planner/legs.json")) as unknown[]) ?? [];
  const templates = (load(join(CONTENT, "planner/templates.json")) as unknown[]) ?? [];
  const copy = load(join(CONTENT, "planner/copy/en.json"));
  for (const lang of ["de", "it", "fr", "sv"] as const) {
    const localePath = join(CONTENT, `planner/copy/${lang}.json`);
    const localeCopy = load(localePath);
    const parsed = check(PlannerCopyFile, localeCopy, `planner/copy/${lang}.json`);
    const enParsed = copy && typeof copy === "object" ? (copy as PlannerCopyFile) : null;
    if (parsed && enParsed) {
      for (const slug of Object.keys(enParsed.starts)) {
        if (!parsed.starts[slug]) fail(`planner/copy/${lang}.json`, `missing start label ${slug}`);
      }
      for (const slug of Object.keys(enParsed.stops)) {
        if (!parsed.stops[slug]) fail(`planner/copy/${lang}.json`, `missing stop copy ${slug}`);
      }
    }
  }

  const startSlugs = new Set<string>();
  if (Array.isArray(starts)) {
    starts.forEach((row, i) => {
      const parsed = check(PlannerStart, row, `planner/starts.json[${i}]`);
      if (!parsed) return;
      if (startSlugs.has(parsed.slug)) fail("planner/starts.json", `duplicate start ${parsed.slug}`);
      startSlugs.add(parsed.slug);
    });
  }

  const stopSlugs = new Set<string>();
  if (Array.isArray(stops)) {
    stops.forEach((row, i) => {
      const parsed = check(PlannerStop, row, `planner/stops.json[${i}]`);
      if (!parsed) return;
      if (stopSlugs.has(parsed.slug)) fail("planner/stops.json", `duplicate stop ${parsed.slug}`);
      stopSlugs.add(parsed.slug);
      if (parsed.minStayMin > parsed.suggestedStayMin || parsed.suggestedStayMin > parsed.maxStayMin) {
        fail(`planner/stops.json[${parsed.slug}]`, "stay min/suggested/max is inverted");
      }
      if (parsed.place && !knownPlaces.has(parsed.place)) {
        warn(`planner/stops.json[${parsed.slug}]`, `place "${parsed.place}" has no content/places entry`);
      }
    });
  }

  const nodes = new Set([...startSlugs, ...stopSlugs]);
  if (Array.isArray(legs)) {
    legs.forEach((row, i) => {
      const parsed = check(PlannerLeg, row, `planner/legs.json[${i}]`);
      if (!parsed) return;
      if (!nodes.has(parsed.from) || !nodes.has(parsed.to)) {
        fail(`planner/legs.json[${i}]`, `unknown node ${parsed.from} → ${parsed.to}`);
      }
    });
  }

  if (Array.isArray(templates)) {
    templates.forEach((row, i) => {
      const parsed = check(PlannerTemplate, row, `planner/templates.json[${i}]`);
      if (!parsed) return;
      for (const slug of parsed.stops) {
        if (!stopSlugs.has(slug)) fail(`planner/templates.json[${parsed.id}]`, `unknown stop ${slug}`);
      }
      if (parsed.matchTour && knownTours.size > 0 && !knownTours.has(parsed.matchTour)) {
        warn(`planner/templates.json[${parsed.id}]`, `matchTour "${parsed.matchTour}" is not a tour`);
      }
    });
  }

  const copyParsed = check(PlannerCopyFile, copy, "planner/copy/en.json");
  if (copyParsed) {
    for (const slug of startSlugs) {
      if (!copyParsed.starts[slug]) fail("planner/copy/en.json", `missing start label ${slug}`);
    }
    for (const slug of stopSlugs) {
      if (!copyParsed.stops[slug]) fail("planner/copy/en.json", `missing stop copy ${slug}`);
    }
  }

  console.log(`  ${startSlugs.size} starts, ${stopSlugs.size} stops, ${Array.isArray(legs) ? legs.length : 0} legs`);
}

/* ────────────────────────────── photography ────────────────────────────── */

console.log("\nPhotography");
const photographySlugs = dirs("photography");

for (const slug of photographySlugs) {
  const base = join(CONTENT, "photography", slug);
  const corePath = join(base, "photo.json");
  if (!existsSync(corePath)) {
    fail(`photography/${slug}`, "missing photo.json");
    continue;
  }

  const core = check(PhotographyCore, load(corePath), `photography/${slug}/photo.json`);
  if (!core) continue;

  if (core.slug !== slug) fail(`photography/${slug}/photo.json`, `slug field is "${core.slug}"`);

  if (core.gallery.includes(core.hero)) {
    warn(`photography/${slug}`, "hero image is repeated in the gallery");
  }

  for (const place of core.places) {
    if (knownPlaces.size > 0 && !knownPlaces.has(place)) {
      warn(`photography/${slug}`, `references place "${place}" with no content/places entry`);
    }
  }

  if (core.kind === "experience") {
    /**
     * The ladder has to read as a ladder. A package that costs more and
     * delivers less than the one above it is not a pricing decision, it is a
     * typo — and it is invisible until a guest compares two cards.
     */
    const ids = new Set<string>();
    for (const pkg of core.packages) {
      if (ids.has(pkg.id)) fail(`photography/${slug}`, `duplicate package id "${pkg.id}"`);
      ids.add(pkg.id);

      if (pkg.locations[0] > pkg.locations[1]) {
        fail(`photography/${slug}`, `package "${pkg.id}" has an inverted location range`);
      }
      const [minPhotos, maxPhotos] = pkg.editedPhotos;
      if (maxPhotos != null && maxPhotos < minPhotos) {
        fail(`photography/${slug}`, `package "${pkg.id}" has an inverted edited-photo range`);
      }
      if (pkg.minutesMax != null && pkg.minutesMax < pkg.minutes) {
        fail(`photography/${slug}`, `package "${pkg.id}" has an inverted duration range`);
      }
    }

    const popular = core.packages.filter((pkg) => pkg.popular);
    if (popular.length > 1) {
      fail(
        `photography/${slug}`,
        `${popular.length} packages are flagged "popular" — a most-popular badge on more than one is a badge on none`,
      );
    }

    const byPrice = [...core.packages].sort((a, b) => a.priceEur - b.priceEur);
    for (let i = 1; i < byPrice.length; i++) {
      const prev = byPrice[i - 1];
      const next = byPrice[i];
      if (next.minutes < prev.minutes) {
        warn(
          `photography/${slug}`,
          `package "${next.id}" costs more than "${prev.id}" but is shorter`,
        );
      }
      if (next.editedPhotos[0] < prev.editedPhotos[0]) {
        warn(
          `photography/${slug}`,
          `package "${next.id}" costs more than "${prev.id}" but delivers fewer photos`,
        );
      }
    }
  } else {
    const { groupMin, groupMax, standard, earlyBird, departures } = core.workshop;
    if (groupMin > groupMax) {
      fail(`photography/${slug}`, `groupMin ${groupMin} exceeds groupMax ${groupMax}`);
    }
    if (earlyBird != null && earlyBird >= standard) {
      fail(
        `photography/${slug}`,
        `early-bird price €${earlyBird} is not below the standard €${standard}`,
      );
    }
    const seen = new Set<string>();
    for (const departure of departures) {
      if (seen.has(departure.id)) {
        fail(`photography/${slug}`, `duplicate departure id "${departure.id}"`);
      }
      seen.add(departure.id);
      if (departure.start && departure.end && departure.end < departure.start) {
        fail(`photography/${slug}`, `departure "${departure.id}" ends before it starts`);
      }
      if (departure.start && !departure.start.startsWith(departure.month)) {
        warn(
          `photography/${slug}`,
          `departure "${departure.id}" starts ${departure.start} but is filed under ${departure.month}`,
        );
      }
      /**
       * A confirmed departure with no dates is the one contradiction this
       * product cannot survive: the page tells the guest a confirmed
       * departure is bookable, and there is nothing to book.
       */
      if (departure.status === "confirmed" && (!departure.start || !departure.end)) {
        fail(
          `photography/${slug}`,
          `departure "${departure.id}" is marked confirmed but publishes no dates`,
        );
      }
    }
  }

  // Locale copy.
  for (const file of readdirSync(base)) {
    if (!file.endsWith(".json") || file === "photo.json" || file.startsWith("_")) continue;
    const path = `photography/${slug}/${file}`;
    const copy = check(PhotographyCopy, load(join(base, file)), path);
    if (!copy) continue;

    if (copy.seoTitle.length > 70) fail(path, `seoTitle is ${copy.seoTitle.length} chars (max 70)`);
    if (copy.seoDescription.length > 165) {
      fail(path, `seoDescription is ${copy.seoDescription.length} chars (max 165)`);
    }

    // Every id the core names must be spoken for, in every locale. A missing
    // package name renders as a raw slug on a €650 card.
    if (core.kind === "experience") {
      const named = new Set(copy.packages.map((pkg) => pkg.id));
      for (const pkg of core.packages) {
        if (!named.has(pkg.id)) fail(path, `no copy for package "${pkg.id}"`);
      }
      for (const pkg of copy.packages) {
        if (!core.packages.some((entry) => entry.id === pkg.id)) {
          warn(path, `copy for package "${pkg.id}", which photo.json does not define`);
        }
      }
      if (copy.days.length > 0) {
        warn(path, "an experience carries a day-by-day curriculum — that belongs to a workshop");
      }
    } else {
      if (copy.days.length !== core.workshop.days) {
        fail(
          path,
          `${copy.days.length} curriculum days for a ${core.workshop.days}-day workshop`,
        );
      }
      const editions = new Set(copy.editions.map((edition) => edition.id));
      for (const departure of core.workshop.departures) {
        if (!editions.has(departure.edition)) {
          fail(path, `departure "${departure.id}" names edition "${departure.edition}", which has no copy`);
        }
      }
    }

    const describedSettings = new Set(copy.settings.map((setting) => setting.id));
    for (const setting of core.settings) {
      if (!describedSettings.has(setting)) fail(path, `no copy for setting "${setting}"`);
    }

    /**
     * The promise line is the one sentence that keeps the two families apart.
     * If it stops naming what actually happens, the section's whole
     * information architecture stops working.
     */
    const promise = copy.promise.toLowerCase();
    if (core.kind === "workshop" && !/learn|lär|impar|lern|appren/.test(promise)) {
      warn(path, "a workshop's promise line does not say the guest learns anything");
    }
  }
}
console.log(`  ${photographySlugs.length} photography products checked`);

/* ─────────────────────── unique titles and descriptions ─────────────────────── */

/**
 * Two pages must not share a title or a meta description.
 *
 * The schema already caps both at the lengths Google will render, which is
 * what stops a truncated title. It says nothing about two pages claiming the
 * same one — and duplicates are what actually costs rankings, because Google
 * treats them as a signal that the pages are the same page and picks one.
 *
 * Checked per locale: the English and German titles of one place are supposed
 * to differ from each other and are not duplicates of anything.
 *
 * A separate pass over the files rather than a hook inside each loop above,
 * so the rule holds for every content kind including ones added later.
 */
console.log("\nSEO uniqueness");

const seenTitles = new Map<string, string>();
const seenDescriptions = new Map<string, string>();
let metaChecked = 0;

for (const kind of ["tours", "guides", "places", "photography"]) {
  for (const slug of dirs(kind)) {
    for (const lang of LANGS) {
      const path = join(CONTENT, kind, slug, `${lang}.json`);
      if (!existsSync(path)) continue;
      const copy = load(path) as { seoTitle?: string; seoDescription?: string } | null;
      if (!copy) continue;
      const where = `${kind}/${slug}/${lang}`;
      metaChecked += 1;

      for (const [field, value, seen] of [
        ["seoTitle", copy.seoTitle, seenTitles],
        ["seoDescription", copy.seoDescription, seenDescriptions],
      ] as const) {
        if (!value) continue;
        const key = `${lang}::${value.trim().toLowerCase()}`;
        const owner = seen.get(key);
        if (owner) fail(where, `${field} duplicates ${owner}:\n    "${value}"`);
        else seen.set(key, where);
      }
    }
  }
}
console.log(`  ${metaChecked} page titles and descriptions checked for duplicates`);

/* ────────────────────────────── result ────────────────────────────── */

console.log(
  `\n${errors === 0 ? "PASS" : "FAIL"} — ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}\n`,
);
process.exit(errors > 0 ? 1 : 0);
