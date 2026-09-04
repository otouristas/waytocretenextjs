import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { transfersCopy } from "@/lib/i18n/transfers";
import { reviewsForTransfers } from "@/lib/content/load";
import {
  getTransferRoute,
  routeDuration,
  shortPlace,
  transfers,
  transferRouteSlugs,
} from "@/lib/transfers";
import { absolute, breadcrumbNode, graph, id, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
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

  return pageMeta({
    lang,
    title: p.routeSeoTitle(from, to),
    description: p.routeSeoDesc(from, to, route.distanceKm, routeDuration(route.durationMinutes)),
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

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navTransfers, path: "/transfers" },
    { name: `${from} → ${to}`, path },
  ];

  /**
   * `TaxiService` with the journey as a `Trip`.
   *
   * The distance and drive time are real road figures and are the whole
   * point of the page, so they are in the markup as well as on it. No price
   * is asserted anywhere — the estimate on the page is derived from the
   * per-km bands and is labelled as such.
   */
  const jsonLd = graph([
    webPageNode({
      lang,
      path,
      name: p.routeSeoTitle(from, to),
      description: p.routeSeoDesc(from, to, route.distanceKm, routeDuration(route.durationMinutes)),
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
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <RouteView route={route} lang={lang} reviews={reviewsForTransfers(slug)} />
    </>
  );
}
