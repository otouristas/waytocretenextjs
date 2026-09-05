export { pageMeta, type PageMetaOptions } from "./meta";
export { HOME_OG_IMAGE, defaultOgPath, ogImage } from "./images";
export { absolute, id } from "./ids";
export {
  aggregateRatingNode,
  breadcrumbNode,
  faqNode,
  graph,
  isoDuration,
  offerNode,
  organizationNode,
  productExtras,
  reviewNodes,
  tourNode,
  transferProductNode,
  webPageNode,
  websiteNode,
  type Crumb,
} from "./graph";

import { type Lang } from "@/lib/i18n/langs";
import { graph, organizationNode, websiteNode } from "./graph";

/**
 * The site-wide entity graph, emitted once on the home page.
 *
 * Note what is absent: the fabricated `aggregateRating: 5.0 / 148 reviews`
 * the previous implementation carried. It was self-serving markup on the
 * organization node — ineligible for rich results — and the number had no
 * basis in the source data. Ratings now come only from
 * `aggregateRatingNode()` with real star values behind them.
 */
export function orgJsonLd(lang: Lang = "en") {
  return graph([organizationNode(), websiteNode(lang)]);
}
