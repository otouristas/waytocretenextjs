import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import {
  allTours,
  getTourCopy,
  getTourCore,
  ratingsFor,
  reviewsForTour,
  tourLangs,
  tourSlugs,
  placeSlugs,
} from "@/lib/content/load";
import {
  breadcrumbNode,
  faqNode,
  graph,
  pageMeta,
  reviewNodes,
  tourNode,
  webPageNode,
  type Crumb,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { TourPage } from "@/components/tour/tour-page";

export function generateStaticParams() {
  return tourSlugs().flatMap((slug) => LANGS.map((lang) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw) as Lang;
  const core = getTourCore(slug);
  const copy = getTourCopy(slug, lang) ?? getTourCopy(slug, "en");
  if (!core || !copy) return {};

  return pageMeta({
    lang,
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: `/tours/${slug}`,
    image: core.hero,
    imageAlt: copy.title,
    // Only locales with reviewed copy get an hreflang entry. A missing
    // translation must not advertise itself as one.
    availableLangs: tourLangs(slug),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw) as Lang;

  const core = getTourCore(slug);
  const copy = getTourCopy(slug, lang) ?? getTourCopy(slug, "en");
  if (!core || !copy) notFound();

  const ui = t(lang);
  const path = `/tours/${slug}`;
  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navTours, path: "/tours" },
    { name: copy.title, path },
  ];

  // Related: same category first, then anything else, never itself.
  const others = allTours(lang).filter((x) => x.core.slug !== slug);
  const related = [
    ...others.filter((x) => x.core.category === core.category),
    ...others.filter((x) => x.core.category !== core.category),
  ]
    .slice(0, 3)
    .map((x) => ({ slug: x.core.slug, title: x.copy.title, hero: x.core.hero }));

  /**
   * One graph, cross-linked by @id. `ratings` comes from genuine reviews only
   * — an empty array means no `AggregateRating` is emitted at all, which is
   * the correct outcome while the source data carries no star values.
   */
  const reviews = reviewsForTour(slug);

  const jsonLd = graph([
    webPageNode({ lang, path, name: copy.seoTitle, description: copy.seoDescription, crumbs }),
    breadcrumbNode(lang, path, crumbs),
    tourNode({
      lang,
      slug,
      name: copy.title,
      description: copy.summary,
      price: core.price,
      durationMinutes: core.durationMinutes,
      images: [core.hero, ...core.gallery].slice(0, 6),
      ratings: ratingsFor(reviews),
      reviews: reviewNodes(reviews, 6),
      placeNames: core.places.map((p) => ({ name: p.replace(/-/g, " "), slug: p })),
    }),
    faqNode(copy.faqs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <TourPage
        core={core}
        copy={copy}
        lang={lang}
        related={related}
        linkablePlaces={new Set(placeSlugs())}
        reviews={reviews}
      />
    </>
  );
}
