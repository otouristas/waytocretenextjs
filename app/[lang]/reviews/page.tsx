import type { Metadata } from "next";
import { fill, LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { allReviews, allTours, ratingSummary } from "@/lib/content/load";
import {
  breadcrumbNode,
  graph,
  pageMeta,
  reviewNodes,
  webPageNode,
  type Crumb,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ReviewsView } from "@/components/reviews/reviews-view";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  const ui = t(lang);
  const summary = ratingSummary(allReviews());
  const description = summary
    ? fill(ui.reviewsMetaDesc, { count: summary.count, avg: summary.average.toFixed(1) })
    : ui.reviewsLead;

  return pageMeta({ lang, title: ui.reviewsTitleTag, description, path: "/reviews" });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const reviews = allReviews();

  const tourIndex = new Map(allTours(lang).map(({ core, copy }) => [core.slug, copy.title]));

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navReviews, path: "/reviews" },
  ];

  /**
   * The reviews themselves are emitted as `Review` nodes, but no
   * `AggregateRating` is attached to the organisation here.
   *
   * A rating a business publishes about itself on its own site is
   * self-serving markup and ineligible for rich results, whichever way the
   * stars were sourced. The same star values do drive `aggregateRating` on
   * individual tour `Product` nodes, where a per-product rating from named
   * reviewers is exactly what the type is for.
   */
  const jsonLd = graph([
    webPageNode({
      lang,
      path: "/reviews",
      name: ui.reviewsTitleTag,
      description: ui.reviewsLead,
      crumbs,
    }),
    breadcrumbNode(lang, "/reviews", crumbs),
    ...reviewNodes(reviews, 20),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <ReviewsView lang={lang} reviews={reviews} tourIndex={tourIndex} />
    </>
  );
}
