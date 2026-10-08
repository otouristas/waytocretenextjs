import "server-only";
import { DEFAULT_LANG } from "@/lib/i18n/langs";
import {
  allPhotography,
  allTours,
  ratingsFor,
  reviewsForTour,
  reviewsForTransfers,
} from "@/lib/content/load";
import { transferRoutes, shortPlace, transfers } from "@/lib/transfers";
import { fixedTransferPrice } from "@/lib/transfer-pricing";
import { BRAND } from "@/lib/site";
import { absolute, id } from "./ids";
import { aggregateRatingNode, offerNode, photographyNode } from "./graph";

/**
 * /offers.json — a schema.org ItemList of every tour and transfer product.
 *
 * Prices come from the same `offerNode` the pages emit. Fixed transfer fares
 * are published; regional estimates are never treated as offers.
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

  // Photography products carry their own offer shape — a package ladder or an
  // early-bird pair — so they are built by `photographyNode` rather than
  // squeezed through the tour price model, which cannot express either.
  for (const { core, copy } of allPhotography(lang)) {
    items.push(
      photographyNode({
        lang,
        core,
        name: copy.title,
        description: copy.summary,
        images: [core.hero],
        packageNames: Object.fromEntries(copy.packages.map((p) => [p.id, p.name])),
      }) as Record<string, unknown>,
    );
  }

  for (const route of transferRoutes()) {
    const url = absolute(lang, `/transfers/${route.slug}`);
    const rating = aggregateRatingNode(ratingsFor(reviewsForTransfers(route.slug)));
    const price = fixedTransferPrice(route, transfers().pricing);
    const offer = price ? offerNode(price, url) : null;
    items.push({
      "@type": "Product",
      "@id": id.transfer(route.slug),
      sku: route.slug,
      name: `${shortPlace(route.from)} to ${shortPlace(route.to)}`,
      url,
      ...(offer ? { offers: offer } : {}),
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
