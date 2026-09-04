import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  GuideCopy,
  GuideCore,
  PlaceCopy,
  PlaceCore,
  Review,
  TourCopy,
  TourCore,
} from "../lib/content/schema.ts";
import { priceFrom, quote } from "../lib/pricing.ts";

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
  });
  console.log(`  ${list.length} reviews, ${eligible} eligible for AggregateRating`);
} else {
  console.log("  (no reviews file yet)");
}

/* ────────────────────────────── result ────────────────────────────── */

console.log(
  `\n${errors === 0 ? "PASS" : "FAIL"} — ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}\n`,
);
process.exit(errors > 0 ? 1 : 0);
