import { type Lang, LANG_META } from "../i18n/langs.ts";
import {
  ADDRESS,
  BRAND,
  EMAIL,
  GEO,
  LEGAL_NAME,
  PHONE,
  SISTER_ORIGIN,
  SOCIAL,
  siteUrl,
} from "../site.ts";
import { type PhotographyCore, type PriceModel } from "../content/schema.ts";
import { durationLabel } from "../content/format.ts";
import { isPriced, priceFrom, priceTo, quote } from "../pricing.ts";
import { absolute, id } from "./ids.ts";

/**
 * JSON-LD graph builders.
 *
 * Two rules this module exists to enforce:
 *
 *  1. Prices come from `lib/pricing.ts` and nowhere else, so structured data
 *     can never contradict the price on the page.
 *  2. `AggregateRating` is emitted ONLY from genuine, attributable ratings.
 *     The previous implementation hard-coded `5.0 / 148 reviews` on the
 *     organization node — self-serving (and therefore ineligible for rich
 *     results) and, worse, untrue: not one review in the source database
 *     carries a numeric star value. There is no code path here that can
 *     invent one.
 */

type Node = Record<string, unknown>;

export type Crumb = { name: string; path: string };

export function organizationNode(): Node {
  const sameAs = [
    SISTER_ORIGIN,
    SOCIAL.instagram,
    SOCIAL.facebook,
    SOCIAL.tiktok,
    SOCIAL.tripadvisor,
  ];
  return {
    "@type": ["TravelAgency", "LocalBusiness"],
    "@id": id.organization(),
    name: BRAND,
    ...(LEGAL_NAME ? { legalName: LEGAL_NAME } : {}),
    url: siteUrl(),
    telephone: PHONE,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      postalCode: ADDRESS.postalCode,
      addressCountry: ADDRESS.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: GEO.lat, longitude: GEO.lng },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Rethymno" },
      { "@type": "AdministrativeArea", name: "Crete" },
    ],
    priceRange: "€€",
    sameAs,
  };
}

export function websiteNode(lang: Lang): Node {
  return {
    "@type": "WebSite",
    "@id": id.website(),
    url: siteUrl(),
    name: BRAND,
    inLanguage: LANG_META[lang].hreflang,
    publisher: { "@id": id.organization() },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl()}/${lang}/tours?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function webPageNode(opts: {
  lang: Lang;
  path: string;
  name: string;
  description: string;
  crumbs?: Crumb[];
  modified?: string;
}): Node {
  const { lang, path, name, description, crumbs, modified } = opts;
  return {
    "@type": "WebPage",
    "@id": id.webpage(lang, path),
    url: absolute(lang, path),
    name,
    description,
    isPartOf: { "@id": id.website() },
    inLanguage: LANG_META[lang].hreflang,
    ...(modified ? { dateModified: modified } : {}),
    ...(crumbs?.length ? { breadcrumb: { "@id": id.breadcrumb(lang, path) } } : {}),
  };
}

export function breadcrumbNode(lang: Lang, path: string, crumbs: Crumb[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": id.breadcrumb(lang, path),
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absolute(lang, c.path),
    })),
  };
}

/**
 * Offer / AggregateOffer built from the pricing model.
 *
 * A sliding ladder becomes an `AggregateOffer` with the real low and high
 * per-person rates rather than a single misleading number. An unpriced
 * product returns null and the caller emits no offer at all — an `Offer`
 * without a price is worse than no `Offer`.
 */
export function offerNode(price: PriceModel, url: string): Node | null {
  if (!isPriced(price)) return null;

  const low = priceFrom(price);
  const high = priceTo(price);
  if (low == null) return null;

  const base = {
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url,
    seller: { "@id": id.organization() },
  };

  // Any shape that publishes a genuine range becomes an AggregateOffer, so the
  // markup states the real spread rather than the cheapest end of it.
  if (high != null && high !== low) {
    const offerCount =
      price.kind === "sliding_per_person"
        ? price.tiers.length
        : price.kind === "banded_group" || price.kind === "hourly_private"
          ? price.bands.length
          : 2;
    return { "@type": "AggregateOffer", ...base, lowPrice: low, highPrice: high, offerCount };
  }

  return { "@type": "Offer", ...base, price: low };
}

/** ISO-8601 duration, e.g. 330 minutes → "PT5H30M". */
export function isoDuration(minutes: number): string {
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return `P${d}D${h || m ? "T" : ""}${h ? `${h}H` : ""}${m ? `${m}M` : ""}`;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}` || "PT0M";
}

/**
 * Product attributes Google paints in activity snippets (Duration, Language).
 *
 * Language is the language of this URL, not a claim about which languages
 * a guide speaks — we do not store that. Duration is the same figure the
 * page shows, plus the ISO-8601 value already used on `TouristTrip`.
 */
export function productExtras(opts: { lang: Lang; durationMinutes?: number }): Node {
  const properties: Node[] = [];
  if (opts.durationMinutes) {
    properties.push({
      "@type": "PropertyValue",
      name: "Duration",
      value: durationLabel(opts.durationMinutes, opts.lang),
      valueReference: isoDuration(opts.durationMinutes),
    });
  }
  properties.push({
    "@type": "PropertyValue",
    name: "Language",
    value: LANG_META[opts.lang].native,
  });
  return {
    inLanguage: LANG_META[opts.lang].hreflang,
    additionalProperty: properties,
  };
}

export function faqNode(faqs: ReadonlyArray<{ q: string; a: string }>): Node | null {
  if (!faqs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * Ratings, only when real.
 *
 * `ratings` must be actual numeric star values from identifiable reviews.
 * Passing an empty array returns null, which is the correct and common case
 * until someone pulls the real star values from Google and TripAdvisor.
 */
export function aggregateRatingNode(ratings: readonly number[]): Node | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return {
    "@type": "AggregateRating",
    ratingValue: Math.round((sum / ratings.length) * 10) / 10,
    reviewCount: ratings.length,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * `Review` nodes for the reviews on a page.
 *
 * Only reviews that carry a real numeric rating are emitted, for the same
 * reason `aggregateRatingNode` refuses an empty set: a `Review` without a
 * `reviewRating` is markup that asserts nothing. `publisher` names the
 * platform the review was left on, which is what makes these third-party
 * reviews rather than testimonials we wrote about ourselves.
 */
export function reviewNodes(
  reviews: ReadonlyArray<{
    author: string;
    rating: number | null;
    text: string;
    source: string;
    schemaEligible: boolean;
    lang: string;
    date: string | null;
  }>,
  limit = 12,
): Node[] {
  return reviews
    .filter((r) => r.schemaEligible && typeof r.rating === "number")
    .slice(0, limit)
    .map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.text,
      inLanguage: r.lang,
      ...(r.date ? { datePublished: r.date } : {}),
      publisher: { "@type": "Organization", name: r.source },
    }));
}

export function tourNode(opts: {
  lang: Lang;
  slug: string;
  name: string;
  description: string;
  price: PriceModel;
  durationMinutes: number;
  images: string[];
  faqs?: ReadonlyArray<{ q: string; a: string }>;
  ratings?: readonly number[];
  /** Already-built `Review` nodes, from `reviewNodes()`. */
  reviews?: readonly Node[];
  placeNames?: ReadonlyArray<{ name: string; slug: string }>;
}): Node {
  const path = `/tours/${opts.slug}`;
  const url = absolute(opts.lang, path);
  const offer = offerNode(opts.price, url);
  const rating = aggregateRatingNode(opts.ratings ?? []);

  return {
    "@type": ["Product", "TouristTrip"],
    "@id": id.tour(opts.slug),
    sku: opts.slug,
    name: opts.name,
    description: opts.description,
    url,
    ...(opts.images.length ? { image: opts.images } : {}),
    brand: { "@id": id.organization() },
    provider: { "@id": id.organization() },
    tourBookingPage: url,
    ...productExtras({ lang: opts.lang, durationMinutes: opts.durationMinutes }),
    ...(opts.durationMinutes ? { duration: isoDuration(opts.durationMinutes) } : {}),
    ...(offer ? { offers: offer } : {}),
    ...(rating ? { aggregateRating: rating } : {}),
    // The rating and the reviews behind it travel together. An
    // `aggregateRating` with no `review` is a number a crawler has to take
    // on trust; with them it can see the named people it came from.
    ...(opts.reviews?.length ? { review: opts.reviews } : {}),
    ...(opts.placeNames?.length
      ? {
          itinerary: {
            "@type": "ItemList",
            numberOfItems: opts.placeNames.length,
            itemListElement: opts.placeNames.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "TouristAttraction", "@id": id.place(p.slug), name: p.name },
            })),
          },
        }
      : {}),
  };
}

/**
 * A transfer (or wedding-transfer) product.
 *
 * Stars come from reviews that actually describe this service. There is no
 * `Offer`: published fares do not exist, and an estimate must not become a
 * price Google treats as committed.
 */
export function transferProductNode(opts: {
  lang: Lang;
  slug: string;
  /** Defaults to `/transfers/${slug}`. Wedding uses `/transfers/weddings`. */
  path?: string;
  name: string;
  description: string;
  durationMinutes?: number;
  images?: readonly string[];
  ratings?: readonly number[];
  reviews?: readonly Node[];
}): Node {
  const path = opts.path ?? `/transfers/${opts.slug}`;
  const url = absolute(opts.lang, path);
  const rating = aggregateRatingNode(opts.ratings ?? []);
  const images = opts.images?.filter(Boolean) ?? [];

  return {
    "@type": ["Product", "Service"],
    "@id": id.transfer(opts.slug),
    sku: opts.slug,
    name: opts.name,
    description: opts.description,
    url,
    ...(images.length ? { image: images } : {}),
    brand: { "@id": id.organization() },
    provider: { "@id": id.organization() },
    ...productExtras({ lang: opts.lang, durationMinutes: opts.durationMinutes }),
    ...(opts.durationMinutes ? { duration: isoDuration(opts.durationMinutes) } : {}),
    ...(rating ? { aggregateRating: rating } : {}),
    ...(opts.reviews?.length ? { review: opts.reviews } : {}),
  };
}

/** Assemble a page's nodes into the single `@graph` the page will emit. */
export function graph(nodes: Array<Node | null | undefined>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

/** Re-exported so callers price through the one authority. */
export { quote };

/* ────────────────────────────── photography ────────────────────────────── */

/**
 * The offer on a photography product.
 *
 * An experience publishes a ladder of packages, so it becomes an
 * `AggregateOffer` carrying the real low and high and every rung as its own
 * `Offer` — a single "from €160" would understate a €650 product, and a
 * single "€650" would overstate the entry point. A workshop with an
 * early-bird rate publishes two genuine prices and gets the same treatment;
 * one with a single rate gets a plain `Offer`.
 */
function photographyOffer(core: PhotographyCore, url: string, names: Record<string, string>): Node {
  const base = {
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url,
    seller: { "@id": id.organization() },
  };

  if (core.kind === "experience") {
    const prices = core.packages.map((pkg) => pkg.priceEur);
    return {
      "@type": "AggregateOffer",
      ...base,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: core.packages.length,
      offers: core.packages.map((pkg) => ({
        "@type": "Offer",
        name: names[pkg.id] ?? pkg.id,
        price: pkg.priceEur,
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url,
      })),
    };
  }

  const { standard, earlyBird } = core.workshop;
  if (earlyBird == null) return { "@type": "Offer", ...base, price: standard };
  return {
    "@type": "AggregateOffer",
    ...base,
    lowPrice: Math.min(earlyBird, standard),
    highPrice: Math.max(earlyBird, standard),
    offerCount: 2,
  };
}

/**
 * A photography product.
 *
 * The workshop is typed `Course` as well as `Product` because that is what it
 * is — it teaches, it has a syllabus and a level — and `Course` is a far less
 * contested result type than a travel `Product`. `hasCourseInstance` is
 * emitted only for departures whose dates the operator has actually fixed:
 * an instance carrying invented dates would be markup that contradicts the
 * page, which says in plain words that the dates are confirmed on departure.
 */
export function photographyNode(opts: {
  lang: Lang;
  core: PhotographyCore;
  name: string;
  description: string;
  images: string[];
  /** Package id → display name, for the per-package offers. */
  packageNames?: Record<string, string>;
  ratings?: readonly number[];
  reviews?: readonly Node[];
  placeNames?: ReadonlyArray<{ name: string; slug: string }>;
}): Node {
  const { core, lang } = opts;
  const url = absolute(lang, `/photography/${core.slug}`);
  const rating = aggregateRatingNode(opts.ratings ?? []);
  const isWorkshop = core.kind === "workshop";
  const durationMinutes = isWorkshop ? core.workshop.days * 1440 : undefined;

  const instances = isWorkshop
    ? core.workshop.departures
        .filter((departure) => departure.start && departure.end)
        .map((departure) => ({
          "@type": "CourseInstance",
          courseMode: "Onsite",
          courseWorkload: isoDuration(core.workshop.days * 1440),
          startDate: departure.start,
          endDate: departure.end,
          location: { "@type": "Place", name: "Crete, Greece" },
          maximumAttendeeCapacity: core.workshop.groupMax,
        }))
    : [];

  return {
    "@type": isWorkshop ? ["Product", "Course"] : ["Product", "Service"],
    "@id": id.photography(core.slug),
    sku: core.slug,
    name: opts.name,
    description: opts.description,
    url,
    ...(opts.images.length ? { image: opts.images } : {}),
    brand: { "@id": id.organization() },
    provider: { "@id": id.organization() },
    ...productExtras({ lang, durationMinutes }),
    ...(durationMinutes ? { duration: isoDuration(durationMinutes) } : {}),
    ...(isWorkshop
      ? {
          educationalLevel: "Beginner",
          teaches: "Photography: exposure, composition, natural light, landscape, portrait and basic editing",
          ...(instances.length ? { hasCourseInstance: instances } : {}),
        }
      : { serviceType: "Photography" }),
    offers: photographyOffer(core, url, opts.packageNames ?? {}),
    ...(rating ? { aggregateRating: rating } : {}),
    ...(opts.reviews?.length ? { review: opts.reviews } : {}),
    ...(opts.placeNames?.length
      ? {
          contentLocation: opts.placeNames.map((place) => ({
            "@type": "TouristAttraction",
            "@id": id.place(place.slug),
            name: place.name,
          })),
        }
      : {}),
  };
}
