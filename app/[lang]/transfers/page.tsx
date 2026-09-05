import type { Metadata } from "next";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { transfersCopy } from "@/lib/i18n/transfers";
import { reviewsForTransfers } from "@/lib/content/load";
import { transfers, transferRoutes, shortPlace, routeDuration } from "@/lib/transfers";
import { breadcrumbNode, graph, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { id, absolute } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { TransfersView } from "@/components/transfers/transfers-view";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  const p = transfersCopy(lang);
  const vehicle = transfers().vehicle;
  return pageMeta({
    lang,
    title: p.seoTitle,
    description: p.seoDesc,
    path: "/transfers",
    image: vehicle.hero,
    imageAlt: vehicle.name,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const p = transfersCopy(lang);
  const data = transfers();

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navTransfers, path: "/transfers" },
  ];

  /**
   * The transfer product as a `Service`, plus the routes as an `ItemList`.
   *
   * No `Offer` is attached: there is no published fare for any route, and
   * the per-kilometre estimate on the page is explicitly an estimate. An
   * `Offer` carrying a number the operator has not committed to would be
   * exactly the kind of markup that contradicts the page.
   */
  const routes = transferRoutes();
  const jsonLd = graph([
    webPageNode({ lang, path: "/transfers", name: p.seoTitle, description: p.seoDesc, crumbs }),
    breadcrumbNode(lang, "/transfers", crumbs),
    {
      "@type": "Service",
      "@id": `${absolute(lang, "/transfers")}#service`,
      serviceType: "Airport transfer",
      name: p.seoTitle,
      description: data.coverage.statement,
      provider: { "@id": id.organization() },
      areaServed: data.coverage.serves.map((name) => ({
        "@type": "AdministrativeArea",
        name,
      })),
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: absolute(lang, "/transfers"),
      },
    },
    {
      "@type": "ItemList",
      name: ui.transferRoutesTitle,
      numberOfItems: routes.length,
      itemListElement: routes.map((route, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${shortPlace(route.from)} to ${shortPlace(route.to)}`,
        url: absolute(lang, `/transfers/${route.slug}`),
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Which areas of Crete do you cover for transfers?",
          acceptedAnswer: { "@type": "Answer", text: data.coverage.statement },
        },
        {
          "@type": "Question",
          name: "How much does a transfer cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Fares are metered per kilometre: ${data.pricing.perKmRates
              .map(
                (r) =>
                  `€${r.eurPerKm.toFixed(2)} per km for ${r.minPassengers} to ${r.maxPassengers} passengers`,
              )
              .join(", ")}. There is a ${data.pricing.minimumDistanceKm} km minimum distance and a €${data.pricing.minimumOrderEur} minimum order.`,
          },
        },
        {
          "@type": "Question",
          name: "How long does the drive from the airport to Rethymno take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: routes
              .filter((r) => /airport/i.test(r.from))
              .map(
                (r) =>
                  `${shortPlace(r.from)} to ${shortPlace(r.to)} is ${r.distanceKm} km and takes about ${routeDuration(r.durationMinutes)}.`,
              )
              .join(" "),
          },
        },
        {
          "@type": "Question",
          name: "Do you provide child seats?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              data.extras[0]?.note ??
              "Child seats are available on request at no extra charge.",
          },
        },
      ],
    },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <TransfersView lang={lang} reviews={reviewsForTransfers()} />
    </>
  );
}
