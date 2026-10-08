import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { fixedFareCopy, transfersCopy } from "@/lib/i18n/transfers";
import { fixedTransferPrice } from "@/lib/transfer-pricing";
import { ratingsFor, reviewsForTransfers } from "@/lib/content/load";
import {
  getTransferRoute,
  fixedRouteRates,
  routeDuration,
  shortPlace,
  transfers,
  transferRouteSlugs,
} from "@/lib/transfers";
import {
  absolute,
  breadcrumbNode,
  graph,
  id,
  pageMeta,
  reviewNodes,
  transferProductNode,
  webPageNode,
  type Crumb,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { RouteView } from "@/components/transfers/route-view";

export function generateStaticParams() {
  return transferRouteSlugs().flatMap((route) => LANGS.map((lang) => ({ lang, route })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; route: string }>;
}): Promise<Metadata> {
  const { lang: raw, route: slug } = await params;
  const lang = parseLang(raw) as Lang;
  const route = getTransferRoute(slug);
  if (!route) return {};

  const p = transfersCopy(lang);
  const from = shortPlace(route.from);
  const to = shortPlace(route.to);
  const rates = fixedRouteRates(route);

  return pageMeta({
    lang,
    title: p.routeSeoTitle(from, to),
    description: p.routeSeoDesc(from, to, route.distanceKm, routeDuration(route.durationMinutes), rates ? fixedFareCopy(rates, lang) : undefined),
    path: `/transfers/${slug}`,
    image: transfers().vehicle.hero,
    imageAlt: `${from} to ${to} transfer`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; route: string }>;
}) {
  const { lang: raw, route: slug } = await params;
  const lang = parseLang(raw) as Lang;
  const route = getTransferRoute(slug);
  if (!route) notFound();

  const ui = t(lang);
  const p = transfersCopy(lang);
  const from = shortPlace(route.from);
  const to = shortPlace(route.to);
  const path = `/transfers/${slug}`;
  const rates = fixedRouteRates(route);

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navTransfers, path: "/transfers" },
    { name: `${from} → ${to}`, path },
  ];

  /**
   * `TaxiService` with the journey as a `Trip`, plus a `Product` that
   * carries the real Google rating and, where published, the fixed group
   * offers. Regional estimates remain outside Offer markup.
   */
  const reviews = reviewsForTransfers(slug);
  const jsonLd = graph([
    webPageNode({
      lang,
      path,
      name: p.routeSeoTitle(from, to),
      description: p.routeSeoDesc(from, to, route.distanceKm, routeDuration(route.durationMinutes), rates ? fixedFareCopy(rates, lang) : undefined),
      crumbs,
    }),
    breadcrumbNode(lang, path, crumbs),
    {
      "@type": "TaxiService",
      "@id": `${absolute(lang, path)}#service`,
      name: p.routeHeading(from, to),
      serviceType: "Private transfer",
      provider: { "@id": id.organization() },
      areaServed: { "@type": "AdministrativeArea", name: "Rethymno" },
      availableChannel: { "@type": "ServiceChannel", serviceUrl: absolute(lang, path) },
    },
    {
      "@type": "Trip",
      name: p.routeHeading(from, to),
      description: p.routeLead(from, to, routeDuration(route.durationMinutes)),
      provider: { "@id": id.organization() },
      itinerary: {
        "@type": "ItemList",
        itemListElement: [
          { "@type": "ListItem", position: 1, item: { "@type": "Place", name: route.from } },
          { "@type": "ListItem", position: 2, item: { "@type": "Place", name: route.to } },
        ],
      },
    },
    transferProductNode({
      lang,
      slug,
      name: p.routeHeading(from, to),
      description: p.routeLead(from, to, routeDuration(route.durationMinutes)),
      durationMinutes: route.durationMinutes,
      price: fixedTransferPrice(route, transfers().pricing),
      images: [transfers().vehicle.hero],
      ratings: ratingsFor(reviews),
      reviews: reviewNodes(reviews, 6),
    }),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <RouteView route={route} lang={lang} reviews={reviews} />
    </>
  );
}
