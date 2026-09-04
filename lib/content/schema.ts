import { z } from "zod";
import { LANGS } from "../i18n/langs.ts";

/**
 * The content contract for rethymnotours.com.
 *
 * Every file under /content is parsed through one of these schemas at build
 * time and the build fails on violation. That is deliberate: the WordPress
 * source this content is harvested from carries real defects (duplicated
 * bodies, contradictory difficulty ratings, prices that disagree between two
 * copies of the same page) and none of them may ship silently.
 */

export const LangEnum = z.enum(LANGS);

const Slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case");

const Url = z.string().url();
const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

/* ────────────────────────────── pricing ────────────────────────────── */

/**
 * The WordPress catalogue contains five genuinely different pricing shapes.
 * They are modelled as a discriminated union rather than a bag of optional
 * fields so that `quote()` and the `Offer` schema generator are both total
 * functions — every shape must be handled, and neither can silently produce
 * a price the other disagrees with.
 */
export const PriceModel = z.discriminatedUnion("kind", [
  /**
   * A sliding per-person scale that gets cheaper as the group grows.
   * Imbros Gorge is the reference: €44pp at 8 people rising to €145pp at 2.
   * Tiers are stored ascending by `minGuests`; `perPerson` applies when
   * `minGuests <= guests <= maxGuests`. Non-integer rates are legal (€72.50).
   */
  z.object({
    kind: z.literal("sliding_per_person"),
    currency: z.literal("EUR").default("EUR"),
    tiers: z
      .array(
        z.object({
          minGuests: z.number().int().min(1),
          maxGuests: z.number().int().min(1),
          perPerson: z.number().positive(),
        }),
      )
      .min(1),
  }),

  /**
   * One flat total covering the whole group up to `includedGuests`.
   * Samaria Gorge (€350 up to 8) and Romance & History (€320 per couple).
   */
  z.object({
    kind: z.literal("flat_group"),
    currency: z.literal("EUR").default("EUR"),
    total: z.number().positive(),
    includedGuests: z.number().int().min(1),
    extraGuest: z.number().nonnegative().nullable().default(null),
    unitLabel: z.enum(["group", "couple"]).default("group"),
  }),

  /**
   * Several group totals, each covering a band of party sizes.
   *
   * Lake Kournas is the reference: €250 for up to 4, €290 for 5 to 8. This is
   * a flat group rate that steps rather than scaling, so neither
   * `flat_group` (one total, optional per-head extra) nor
   * `sliding_per_person` can express it without inventing a figure the
   * operator does not publish.
   */
  z.object({
    kind: z.literal("banded_group"),
    currency: z.literal("EUR").default("EUR"),
    bands: z
      .array(
        z.object({
          minGuests: z.number().int().min(1),
          maxGuests: z.number().int().min(1),
          total: z.number().positive(),
        }),
      )
      .min(1),
  }),

  /**
   * Per-adult pricing with child/infant bands and an optional private-group
   * buyout. Shepherd for a Day: €240pp, private up to 4 for €790, extra
   * person €160, child (4–13) €90, infant (0–3) free.
   * `adult` is nullable — Timeless Crete publishes only a group rate.
   */
  z.object({
    kind: z.literal("adult_child_private"),
    currency: z.literal("EUR").default("EUR"),
    adult: z.number().positive().nullable(),
    child: z.number().nonnegative().nullable(),
    infantFree: z.boolean().default(true),
    childAges: z.tuple([z.number().int(), z.number().int()]).default([4, 13]),
    infantAges: z.tuple([z.number().int(), z.number().int()]).default([0, 3]),
    privateGroup: z
      .object({
        total: z.number().positive(),
        includedGuests: z.number().int().min(1),
        extraGuest: z.number().nonnegative(),
      })
      .nullable()
      .default(null),
  }),

  /**
   * Multi-day fixed departures sold on a deposit. The 7-day Spring
   * Wildflowers & Orchids product.
   */
  z.object({
    kind: z.literal("fixed_departure"),
    currency: z.literal("EUR").default("EUR"),
    standard: z.number().positive(),
    earlyBird: z
      .object({ price: z.number().positive(), until: IsoDate })
      .nullable()
      .default(null),
    deposit: z.number().positive(),
    balanceDueWeeksBefore: z.tuple([z.number().int(), z.number().int()]),
  }),

  /**
   * No published price. Knossos, Spinalonga, Aradaina, Pachnes and Sunset
   * Sound Therapy are all enquiry-only on the source site.
   *
   * `indicativeFrom` exists so ops can opt into a "From €X" anchor, which
   * converts better and is required for a valid `Offer`. It is never
   * inferred or derived — if ops has not supplied a number it stays null and
   * the page ships without price schema.
   */
  z.object({
    kind: z.literal("on_request"),
    currency: z.literal("EUR").default("EUR"),
    indicativeFrom: z.number().positive().nullable().default(null),
  }),
]);
export type PriceModel = z.infer<typeof PriceModel>;

/** A cost the guest pays on the day, to a third party, not to us. */
export const ThirdPartyCost = z.object({
  label: z.string().min(1),
  amount: z.number().nonnegative().nullable(),
  perPerson: z.boolean().default(true),
  optional: z.boolean().default(false),
  note: z.string().optional(),
});
export type ThirdPartyCost = z.infer<typeof ThirdPartyCost>;

/* ────────────────────────────── availability ────────────────────────────── */

export const Weekday = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);

/**
 * Availability is data, not prose. The source site states cadence three
 * different ways on the same product ("Every Day", "Every Day (except
 * Tuesday )", "Upon Request") which is why this is modelled explicitly.
 */
export const Cadence = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("weekdays"), days: z.array(Weekday).min(1) }),
  z.object({ kind: z.literal("daily") }),
  z.object({ kind: z.literal("on_request") }),
  z.object({
    kind: z.literal("seasonal"),
    days: z.array(Weekday).min(1),
    /** Inclusive month numbers, 1–12. Samaria is shut outside 5–10. */
    months: z.array(z.number().int().min(1).max(12)).min(1),
  }),
  z.object({
    kind: z.literal("fixed_dates"),
    departures: z.array(z.object({ start: IsoDate, end: IsoDate })).min(1),
  }),
]);
export type Cadence = z.infer<typeof Cadence>;

/* ────────────────────────────── shared ────────────────────────────── */

export const GeoPoint = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/** A reference into content/media/manifest.json — never a raw URL. */
export const MediaRef = z.string().min(1);

export const Difficulty = z.enum(["easy", "moderate", "hard"]);

export const TourCategory = z.enum([
  "hiking",
  "gastronomy",
  "culture",
  "beach",
  "wellness",
  "signature",
  "nature",
  "boat",
]);
export type TourCategory = z.infer<typeof TourCategory>;

/* ────────────────────────────── tours ────────────────────────────── */

/**
 * Locale-independent, operations-owned facts. Changing any of these changes
 * what we sell; changing TourCopy only changes how we describe it.
 */
export const TourCore = z.object({
  slug: Slug,
  category: TourCategory,
  /** Source page on waytocrete.com, for provenance and the sister-site link. */
  wpSlug: z.string().min(1),
  wpId: z.number().int().positive().optional(),

  price: PriceModel,
  thirdPartyCosts: z.array(ThirdPartyCost).default([]),

  cadence: Cadence,
  /** Local time, 24h "HH:MM", or null for on-request products. */
  pickupTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable()
    .default(null),
  durationMinutes: z.number().int().positive(),
  difficulty: Difficulty,

  groupMin: z.number().int().min(1).default(1),
  groupMax: z.number().int().min(1),

  hotelPickup: z.boolean().default(true),
  /** The "Memory Maker" professional photoshoot — a real differentiator. */
  photoshoot: z.boolean().default(false),
  privateOnly: z.boolean().default(false),

  cancelFreeHours: z.number().int().nonnegative().default(48),

  meetingPoint: GeoPoint.nullable().default(null),
  /** Attractions visited, as /places slugs. Drives the itinerary ItemList. */
  places: z.array(Slug).default([]),

  hero: MediaRef,
  gallery: z.array(MediaRef).default([]),

  /** Live listing on waytocrete.travelotopos.com. Absent = email request. */
  travelotopos: z
    .object({
      serviceId: z.number().int().positive(),
      categoryId: z.number().int().positive(),
    })
    .optional(),

  featured: z.boolean().default(false),
  /** Old slugs that 301 here. Generates the redirect map at build time. */
  supersedes: z.array(z.string()).default([]),
});
export type TourCore = z.infer<typeof TourCore>;

const FaqItem = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

const ItinerarySection = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  place: Slug.optional(),
  image: MediaRef.optional(),
});

/**
 * Per-locale prose. `state` gates hreflang: a page only advertises a locale
 * alternate once that locale is `reviewed`, so we never repeat the source
 * site's mistake of six hreflang entries pointing at identical English.
 */
export const TranslationState = z.enum(["machine-draft", "human-draft", "reviewed"]);

export const TourCopy = z.object({
  lang: LangEnum,
  state: TranslationState,
  title: z.string().min(1),
  tagline: z.string().optional(),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(50).max(165),
  /** Answer-first opening paragraph. The bit AI engines quote. */
  summary: z.string().min(1),
  /**
   * Body prose as discrete paragraphs. A single string is accepted and split
   * on blank lines, so content can be authored either way without the
   * renderer having to care.
   */
  overview: z
    .union([z.string().min(1), z.array(z.string().min(1))])
    .transform((v) => (Array.isArray(v) ? v : v.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean))),
  highlights: z.array(z.string().min(1)).min(1),
  itinerary: z.array(ItinerarySection).default([]),
  included: z.array(z.string().min(1)).min(1),
  excluded: z.array(z.string().min(1)).default([]),
  whatToWear: z.array(z.string().min(1)).default([]),
  whatToBring: z.array(z.string().min(1)).default([]),
  faqs: z.array(FaqItem).default([]),
  priceNote: z.string().optional(),
});
export type TourCopy = z.infer<typeof TourCopy>;

/* ────────────────────────────── places ────────────────────────────── */

/**
 * Attraction entities. These carry the SEO load: `kourtaliotiko gorge`,
 * `lake kournas` and `melidoni cave` are low-difficulty terms we can win,
 * unlike the product pages, which convert but do not rank.
 */
export const PlaceCore = z.object({
  slug: Slug,
  geo: GeoPoint,
  kind: z.enum(["gorge", "beach", "lake", "cave", "monastery", "site", "town", "summit", "village"]),
  /** Wikipedia/Wikidata/official URLs. Anchors the entity for AI engines. */
  sameAs: z.array(Url).default([]),
  elevationM: z.number().int().nullable().default(null),
  lengthKm: z.number().positive().nullable().default(null),
  openMonths: z.array(z.number().int().min(1).max(12)).default([]),
  entryFeeEur: z.number().nonnegative().nullable().default(null),
  driveFromRethymnoMinutes: z.number().int().positive().nullable().default(null),
  /** Tours we sell that visit here. Powers the place → product funnel. */
  tours: z.array(Slug).default([]),
  /**
   * Nullable on purpose. The source media library does not contain a correct
   * photograph of every attraction, and a hero that shows somewhere else is
   * worse than none — the page falls back to a text-led header.
   */
  hero: MediaRef.nullable().default(null),
  gallery: z.array(MediaRef).default([]),
});
export type PlaceCore = z.infer<typeof PlaceCore>;

/** A hard fact rendered as a definition list — the AEO payload. */
const QuickAnswer = z.object({
  term: z.string().min(1),
  value: z.string().min(1),
});

export const PlaceCopy = z.object({
  lang: LangEnum,
  state: TranslationState,
  name: z.string().min(1),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(50).max(165),
  summary: z.string().min(1),
  body: z.string().min(1),
  quickAnswers: z.array(QuickAnswer).min(3),
  faqs: z.array(FaqItem).default([]),
});
export type PlaceCopy = z.infer<typeof PlaceCopy>;

/* ────────────────────────────── guides ────────────────────────────── */

export const GuideCore = z.object({
  slug: Slug,
  kind: z.enum(["answer", "comparison", "itinerary", "editorial", "list"]),
  published: IsoDate,
  updated: IsoDate,
  authorId: z.string().min(1),
  hero: MediaRef.nullable().default(null),
  places: z.array(Slug).default([]),
  tours: z.array(Slug).default([]),
  /** Old WordPress paths that 301 here — covers the merged duplicate posts. */
  supersedes: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});
export type GuideCore = z.infer<typeof GuideCore>;

export const GuideCopy = z.object({
  lang: LangEnum,
  state: TranslationState,
  title: z.string().min(1),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(50).max(165),
  /** Answer-first. Must stand alone as a complete answer to the title. */
  summary: z.string().min(1),
  body: z.string().min(1),
  quickAnswers: z.array(QuickAnswer).default([]),
  faqs: z.array(FaqItem).default([]),
});
export type GuideCopy = z.infer<typeof GuideCopy>;

/* ────────────────────────────── media ────────────────────────────── */

export const MediaAsset = z.object({
  id: z.string().min(1),
  /** Path under /public, without extension — variants are derived. */
  path: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Tiny base64 LQIP. Required: it is what keeps CLS at zero. */
  blurDataURL: z.string().min(1),
  alt: z.record(LangEnum, z.string()).refine((v) => !!v.en, {
    message: "every asset needs at least an English alt text",
  }),
  credit: z.string().optional(),
  sourceUrl: Url.optional(),
});
export type MediaAsset = z.infer<typeof MediaAsset>;

export const MediaManifest = z.record(z.string(), MediaAsset);

/* ────────────────────────────── reviews ────────────────────────────── */

/**
 * Only genuine, attributable reviews. `rating` is nullable because not one
 * review in the WordPress database carries a numeric star value — and
 * `schemaEligible` exists so B2B endorsements and unattributed traveller
 * tips can be displayed without ever entering structured data.
 */
export const Review = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  source: z.enum(["Google", "TripAdvisor", "Direct"]),
  sourceUrl: Url.nullable().default(null),
  rating: z.number().min(1).max(5).nullable(),
  date: IsoDate.nullable().default(null),
  /**
   * The language the review was WRITTEN in — a plain ISO-639-1 code, not one
   * of this site's six locales. Guests write in Polish, Czech and Turkish,
   * and forcing those into `LangEnum` would mean either dropping the review
   * or mislabelling it as English.
   */
  lang: z
    .string()
    .regex(/^[a-z]{2}$/, "expected a two-letter ISO-639-1 code")
    .default("en"),
  /**
   * What the review is actually about. Derived by reading each review, not
   * by keyword matching: `service` decides which page it may appear on and
   * `tour` / `route` decide which one specifically.
   */
  service: z.enum(["tour", "transfer", "wedding", "general"]).default("general"),
  tour: Slug.nullable().default(null),
  /** A `/transfers/[route]` slug, when the review names the exact journey. */
  route: Slug.nullable().default(null),
  text: z.string().min(1),
  schemaEligible: z.boolean().default(false),
});
export type Review = z.infer<typeof Review>;

/* ────────────────────────────── authors ────────────────────────────── */

/** Real people with real credentials — the E-E-A-T anchor for guides. */
export const Author = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  image: MediaRef.nullable().default(null),
  sameAs: z.array(Url).default([]),
});
export type Author = z.infer<typeof Author>;
