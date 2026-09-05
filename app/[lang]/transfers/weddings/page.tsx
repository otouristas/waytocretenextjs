import type { Metadata } from "next";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { transfersCopy } from "@/lib/i18n/transfers";
import { ratingsFor, reviewsForWeddings } from "@/lib/content/load";
import { transfers } from "@/lib/transfers";
import {
  absolute,
  breadcrumbNode,
  faqNode,
  graph,
  id,
  pageMeta,
  reviewNodes,
  transferProductNode,
  webPageNode,
  type Crumb,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { WeddingTransfersView } from "@/components/transfers/wedding-view";

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
  return pageMeta({
    lang,
    title: p.weddingSeoTitle,
    description: p.weddingSeoDesc,
    path: "/transfers/weddings",
    image: transfers().vehicle.gallery[0] ?? transfers().vehicle.hero,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const p = transfersCopy(lang);
  const w = transfers().weddings;
  const path = "/transfers/weddings";

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navTransfers, path: "/transfers" },
    { name: ui.weddingTransfers, path },
  ];

  const reviews = reviewsForWeddings();
  const jsonLd = graph([
    webPageNode({
      lang,
      path,
      name: p.weddingSeoTitle,
      description: p.weddingSeoDesc,
      crumbs,
    }),
    breadcrumbNode(lang, path, crumbs),
    {
      "@type": "Service",
      "@id": `${absolute(lang, path)}#service`,
      serviceType: "Wedding guest transportation",
      name: p.weddingSeoTitle,
      description: w.positioning,
      provider: { "@id": id.organization() },
      areaServed: { "@type": "AdministrativeArea", name: "Rethymno" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: p.weddingWhatTitle,
        itemListElement: w.services.map((service) => ({
          "@type": "OfferCatalog",
          name: service,
        })),
      },
    },
    transferProductNode({
      lang,
      slug: "weddings",
      path,
      name: p.weddingSeoTitle,
      description: w.positioning,
      images: [transfers().vehicle.gallery[0] ?? transfers().vehicle.hero],
      ratings: ratingsFor(reviews),
      reviews: reviewNodes(reviews, 6),
    }),
    faqNode(w.faqs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <WeddingTransfersView lang={lang} reviews={reviews} />
    </>
  );
}
