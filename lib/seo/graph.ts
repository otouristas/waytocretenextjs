import { type Lang, LANG_META } from "@/lib/i18n/langs";
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
} from "@/lib/site";
import { type PriceModel } from "@/lib/content/schema";
import { isPriced, priceFrom, priceTo, quote } from "@/lib/pricing";
import { absolute, id } from "./ids";

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
        : price.kind === "banded_group"
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
    name: opts.name,
    description: opts.description,
    url,
    ...(opts.images.length ? { image: opts.images } : {}),
    brand: { "@id": id.organization() },
    provider: { "@id": id.organization() },
    tourBookingPage: url,
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

/** Assemble a page's nodes into the single `@graph` the page will emit. */
export function graph(nodes: Array<Node | null | undefined>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

/** Re-exported so callers price through the one authority. */
export { quote };
