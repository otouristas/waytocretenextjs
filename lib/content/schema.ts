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

  /**
   * A private van day billed by the hour. Create Your Own Crete Experience.
   * `quote()` takes the already-computed billable hours; the planner engine
   * is what turns driving + stays into that number. `priceFrom` is always
   * `minHours ×` the cheapest band — the honest "From €X" on the create page.
   */
  z.object({
    kind: z.literal("hourly_private"),
    currency: z.literal("EUR").default("EUR"),
    minHours: z.number().positive(),
    maxHours: z.number().positive(),
    warnHours: z.number().positive(),
    incrementMinutes: z.number().int().positive(),
    bands: z
      .array(
        z.object({
          minGuests: z.number().int().min(1),
          maxGuests: z.number().int().min(1),
          perHour: z.number().positive(),
        }),
      )
      .min(1),
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
/**
 * When the professional photoshoot happens.
 *
 * See `TourCore.photoshoot` for why this is not a boolean.
 */
export const PhotoshootPolicy = z.enum(["none", "included", "with_guide"]);
export type PhotoshootPolicy = z.infer<typeof PhotoshootPolicy>;

/* ────────────────────────────── small-group departures ────────────────────────────── */

/**
 * A tour that can be sold by the seat as well as by the vehicle.
 *
 * The catalogue is overwhelmingly private: a van and a driver cost the same
 * whether one person rides in them or eight, so a lone traveller is quoted the
 * whole day and walks away. A `smallGroup` block opts a product into a second,
 * parallel way to sell the same date — seats in a shared departure that only
 * operates once enough of them are taken.
 *
 * `price` is a full `PriceModel` rather than a bare per-person number, for two
 * reasons. It keeps `quote()` the single pricing authority, so a seat and the
 * private buyout of the same day cannot be computed by two code paths that
 * drift. And per-head rates that fall as the vehicle fills are already
 * expressible as a `sliding_per_person` ladder — dynamic pricing becomes new
 * tiers in a JSON file rather than new code.
 *
 * There is deliberately no field for the private price. That is the tour's own
 * `price`, read through the same `quote()`, because the private product is not
 * a variant of the shared one — it is what this tour has always been.
 */
export const SmallGroup = z.object({
  /** Per-seat pricing. Priced through `quote()` only. */
  price: PriceModel,
  /** Seats needed before the departure operates. */
  minParticipants: z.number().int().min(1),
  /**
   * Revenue the departure must clear to be worth running, in EUR. Null means
   * head count alone decides. See `meetsRevenueFloor()`.
   */
  minRevenue: z.number().nonnegative().nullable().default(null),
  /**
   * Hours before pickup at which we write to a guest whose departure is still
   * short. Not a deadline — the date stays bookable, because one more seat can
   * still confirm it.
   */
  noticeHours: z.number().int().positive().default(48),
});
export type SmallGroup = z.infer<typeof SmallGroup>;

export const TourCore = z.object({
  slug: Slug,
  category: TourCategory,
  /** Source page on waytocrete.com, for provenance and the sister-site link. */
  wpSlug: z.string().min(1),
  wpId: z.number().int().positive().optional(),

  price: PriceModel,
  thirdPartyCosts: z.array(ThirdPartyCost).default([]),
  /**
   * Optional private local guide. Shown in the booking widget and payable
   * to the guide on the day — never added to `quote()` or the live checkout.
   */
  privateGuide: z
    .object({
      amount: z.number().positive(),
      currency: z.literal("EUR").default("EUR"),
    })
    .nullable()
    .default(null),

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
  /**
   * The "Memory Maker" professional photoshoot — a real differentiator, and
   * one that travels with the guide rather than with the van.
   *
   * Three states rather than a boolean, because the honest answer on several
   * products is "yes, if you take the guide". A gorge walk sold with a driver
   * and an optional local guide cannot promise a photoshoot outright: nobody
   * is carrying the camera unless the guide is on board. Saying `true` there
   * advertises something the booking may not deliver, and saying `false`
   * hides a real perk from the guests who do add the guide.
   *
   *   included   — comes with the tour, at no extra cost
   *   with_guide — free, but only once the optional guide is added
   *   none       — not offered on this product
   */
  photoshoot: PhotoshootPolicy.default("none"),
  privateOnly: z.boolean().default(false),

  cancelFreeHours: z.number().int().nonnegative().default(48),

  /**
   * Opt this tour into shared departures. Null — the default — means it is
   * sold by the vehicle only, exactly as the whole catalogue was before.
   * Capacity comes from `groupMax`: a shared departure and a private one are
   * the same van.
   */
  smallGroup: SmallGroup.nullable().default(null),

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
  /**
   * `unavailable` keeps the indexed page live but stops booking CTAs.
   * Default `open` so existing tours do not need a field.
   */
  availability: z.enum(["open", "unavailable"]).default("open"),
  /** Old slugs that 301 here. Generates the redirect map at build time. */
  supersedes: z.array(z.string()).default([]),
});
export type TourCore = z.infer<typeof TourCore>;

export function tourIsOpen(core: Pick<TourCore, "availability">) {
  return core.availability !== "unavailable";
}

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

/** Averaged eligible Google stars. Null summaries are represented as `null`, not this type. */
export type RatingSummary = { average: number; count: number };

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

/* ────────────────────────────── planner ────────────────────────────── */

export const PlannerRegion = z.enum([
  "rethymno-town",
  "rethymno-south",
  "rethymno-hills",
  "west",
  "far-west",
  "east",
  "sfakia",
]);
export type PlannerRegion = z.infer<typeof PlannerRegion>;

export const PlannerInterest = z.enum([
  "beach",
  "villages",
  "food",
  "wine",
  "history",
  "hiking",
  "hidden",
  "nature",
]);
export type PlannerInterest = z.infer<typeof PlannerInterest>;

export const PlannerNeed = z.enum(["ticket", "hike", "boat"]);
export type PlannerNeed = z.infer<typeof PlannerNeed>;

export const PlannerAddon = z.enum(["guide", "lunch", "wine", "experience"]);
export type PlannerAddon = z.infer<typeof PlannerAddon>;

export const PlannerStart = z.object({
  slug: Slug,
  geo: GeoPoint,
  region: PlannerRegion,
});
export type PlannerStart = z.infer<typeof PlannerStart>;

export const PlannerStop = z.object({
  slug: Slug,
  geo: GeoPoint,
  categories: z.array(PlannerInterest).min(1),
  region: PlannerRegion,
  suggestedStayMin: z.number().int().positive(),
  minStayMin: z.number().int().positive(),
  maxStayMin: z.number().int().positive(),
  pairsWell: z.array(Slug).default([]),
  needs: z.array(PlannerNeed).default([]),
  place: Slug.nullable().default(null),
  tour: Slug.nullable().default(null),
  hero: z.string().nullable().default(null),
});
export type PlannerStop = z.infer<typeof PlannerStop>;

export const PlannerLeg = z.object({
  from: Slug,
  to: Slug,
  minutes: z.number().int().positive(),
});
export type PlannerLeg = z.infer<typeof PlannerLeg>;

export const PlannerTemplate = z.object({
  id: Slug,
  interests: z.array(PlannerInterest).min(1),
  stops: z.array(Slug).min(1),
  matchTour: Slug.nullable().default(null),
  preferStarts: z.array(Slug).default([]),
});
export type PlannerTemplate = z.infer<typeof PlannerTemplate>;

export const PlannerStopCopy = z.object({
  name: z.string().min(1),
  blurb: z.string().min(1),
});

export const PlannerCopyFile = z.object({
  starts: z.record(z.string(), z.string().min(1)),
  stops: z.record(z.string(), PlannerStopCopy),
});
export type PlannerCopyFile = z.infer<typeof PlannerCopyFile>;

/* ────────────────────────────── photography ────────────────────────────── */

/**
 * The photography section.
 *
 * Two product families live here and they are deliberately modelled as one
 * discriminated union rather than two loose shapes:
 *
 *   `experience` — a professional photographer shoots the GUEST. Sold as a
 *                  ladder of packages, each with its own price, duration,
 *                  party size and delivered image count.
 *   `workshop`   — the GUEST learns photography. Sold as a multi-day, fixed
 *                  seasonal departure that only runs once a minimum group is
 *                  reached.
 *
 * Confusing the two is the single biggest risk this section carries — a guest
 * who books a workshop expecting portraits of themselves has been mis-sold —
 * so the `kind` discriminant is what every page, hub and feed keys off, and
 * neither variant can quietly acquire the other's fields.
 */

/** The landscapes a shoot can be built around. Not a studio list. */
export const PhotoSetting = z.enum([
  "beaches",
  "mountains",
  "villages",
  "old-town",
  "gorges",
  "olive-groves",
  "viewpoints",
  "golden-hour",
]);
export type PhotoSetting = z.infer<typeof PhotoSetting>;

/** What the guest brings to a workshop. Explicitly includes phones. */
export const PhotoGear = z.enum(["dslr", "mirrorless", "compact", "smartphone"]);
export type PhotoGear = z.infer<typeof PhotoGear>;

/**
 * One rung of the shoot ladder.
 *
 * `editedPhotos` is a `[min, max]` range where a null max renders "200+".
 * It is stored as data rather than prose because the operator's brief is
 * explicit that the number must be identical everywhere it appears — page,
 * package card, JSON-LD, llms.txt — and prose in four places drifts.
 */
export const PhotoPackage = z.object({
  id: Slug,
  priceEur: z.number().positive(),
  currency: z.literal("EUR").default("EUR"),
  minutes: z.number().int().positive(),
  /** Upper bound for ranges like "7–8 hours". Null means an exact duration. */
  minutesMax: z.number().int().positive().nullable().default(null),
  maxGuests: z.number().int().min(1),
  /** `[min, max]` locations visited. `[1, 1]` is a single-location shoot. */
  locations: z.tuple([z.number().int().min(1), z.number().int().min(1)]),
  editedPhotos: z.tuple([
    z.number().int().positive(),
    z.number().int().positive().nullable(),
  ]),
  /** Private vehicle between locations. */
  transport: z.boolean().default(false),
  goldenHour: z.boolean().default(false),
  /** At most one package per product may carry this. */
  popular: z.boolean().default(false),
});
export type PhotoPackage = z.infer<typeof PhotoPackage>;

/**
 * A workshop departure.
 *
 * Exact dates are nullable on purpose. A departure that has not reached its
 * minimum group has no dates to publish yet, and inventing them is exactly
 * the promise this booking model exists to avoid. The status is what the
 * page renders a call to action from:
 *
 *   `confirmed` — minimum reached, the departure runs, book it.
 *   `forming`   — taking requests; runs when the minimum is reached.
 *   `limited`   — forming, and additionally subject to weather and demand.
 *                 Early December is the case this exists for.
 */
export const PhotoDeparture = z.object({
  id: z.string().min(1),
  /** Which seasonal edition this belongs to — see `PhotographyCopy.editions`. */
  edition: Slug,
  /** The month it sits in, `YYYY-MM`. Drives ordering and expiry. */
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "expected YYYY-MM"),
  start: IsoDate.nullable().default(null),
  end: IsoDate.nullable().default(null),
  status: z.enum(["confirmed", "forming", "limited"]),
  /** Places still open. Null when ops has not counted — never guessed. */
  spotsLeft: z.number().int().nonnegative().nullable().default(null),
});
export type PhotoDeparture = z.infer<typeof PhotoDeparture>;

export const PhotoWorkshop = z.object({
  days: z.number().int().min(2),
  currency: z.literal("EUR").default("EUR"),
  /** Per person, not per group. */
  standard: z.number().positive(),
  earlyBird: z.number().positive().nullable().default(null),
  /** The workshop only operates once `groupMin` is reached. */
  groupMin: z.number().int().min(1),
  groupMax: z.number().int().min(1),
  gear: z.array(PhotoGear).min(1),
  departures: z.array(PhotoDeparture).min(1),
});
export type PhotoWorkshop = z.infer<typeof PhotoWorkshop>;

const PhotoShared = {
  slug: Slug,
  /** Sort order inside its family hub. Lower first, ties break on slug. */
  order: z.number().int().default(0),
  settings: z.array(PhotoSetting).default([]),
  /** Attractions the shoot or the workshop uses, as /places slugs. */
  places: z.array(Slug).default([]),
  hero: MediaRef,
  gallery: z.array(MediaRef).default([]),
  featured: z.boolean().default(false),
  supersedes: z.array(z.string()).default([]),
};

export const PhotographyCore = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("experience"),
    ...PhotoShared,
    packages: z.array(PhotoPackage).min(1),
  }),
  z.object({
    kind: z.literal("workshop"),
    ...PhotoShared,
    workshop: PhotoWorkshop,
  }),
]);
export type PhotographyCore = z.infer<typeof PhotographyCore>;
export type PhotographyKind = PhotographyCore["kind"];

export const PhotographyCopy = z.object({
  lang: LangEnum,
  state: TranslationState,
  title: z.string().min(1),
  tagline: z.string().optional(),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(50).max(165),
  /**
   * The one sentence that separates the two families: "we photograph you" or
   * "you learn to photograph". Rendered on every card and at the top of every
   * page, because a guest who confuses the two has been mis-sold.
   */
  promise: z.string().min(1),
  summary: z.string().min(1),
  overview: z
    .union([z.string().min(1), z.array(z.string().min(1))])
    .transform((v) => (Array.isArray(v) ? v : v.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean))),
  highlights: z.array(z.string().min(1)).min(1),
  /** Keyed by `PhotoPackage.id`. Lint enforces one entry per package. */
  packages: z
    .array(
      z.object({
        id: Slug,
        name: z.string().min(1),
        tagline: z.string().min(1),
        features: z.array(z.string().min(1)).min(1),
      }),
    )
    .default([]),
  /** Keyed by `PhotoSetting`. */
  settings: z
    .array(z.object({ id: PhotoSetting, name: z.string().min(1), blurb: z.string().min(1) }))
    .default([]),
  /** The workshop curriculum, one entry per day. */
  days: z
    .array(
      z.object({
        title: z.string().min(1),
        focus: z.string().min(1),
        topics: z.array(z.string().min(1)).min(1),
      }),
    )
    .default([]),
  /** Keyed by `PhotoDeparture.edition`. */
  editions: z
    .array(z.object({ id: Slug, name: z.string().min(1), blurb: z.string().min(1) }))
    .default([]),
  included: z.array(z.string().min(1)).min(1),
  excluded: z.array(z.string().min(1)).default([]),
  faqs: z.array(FaqItem).default([]),
  priceNote: z.string().optional(),
  /** How booking actually works — request-to-join, deposits, confirmation. */
  bookingNote: z.string().optional(),
});
export type PhotographyCopy = z.infer<typeof PhotographyCopy>;
