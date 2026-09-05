import "server-only";
import { DEFAULT_LANG } from "@/lib/i18n/langs";
import {
  allTours,
  ratingsFor,
  reviewsForTour,
  reviewsForTransfers,
} from "@/lib/content/load";
import { transferRoutes, shortPlace } from "@/lib/transfers";
import { BRAND } from "@/lib/site";
import { absolute, id } from "./ids";
import { aggregateRatingNode, offerNode } from "./graph";

/**
 * /offers.json — a schema.org ItemList of every tour and transfer product.
 *
 * Tour prices come from the same `offerNode` the pages emit. Transfer routes
 * are listed with ratings and a book URL but never a price, because none is
 * published.
 */
export function offersJson(): object {
  const lang = DEFAULT_LANG;
  const items: Record<string, unknown>[] = [];

  for (const { core, copy } of allTours(lang)) {
    const url = absolute(lang, `/tours/${core.slug}`);
    const offer = offerNode(core.price, url);
    const rating = aggregateRatingNode(ratingsFor(reviewsForTour(core.slug)));
    items.push({
      "@type": "Product",
      "@id": id.tour(core.slug),
      sku: core.slug,
      name: copy.title,
      url,
      ...(offer ? { offers: offer } : {}),
      ...(rating ? { aggregateRating: rating } : {}),
    });
  }

  for (const route of transferRoutes()) {
    const url = absolute(lang, `/transfers/${route.slug}`);
    const rating = aggregateRatingNode(ratingsFor(reviewsForTransfers(route.slug)));
    items.push({
      "@type": "Product",
      "@id": id.transfer(route.slug),
      sku: route.slug,
      name: `${shortPlace(route.from)} to ${shortPlace(route.to)}`,
      url,
      ...(rating ? { aggregateRating: rating } : {}),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${BRAND} offers`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item,
    })),
  };
}
