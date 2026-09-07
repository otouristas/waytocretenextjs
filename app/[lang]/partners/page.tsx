import type { Metadata } from "next";
import { parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { partnersCopy } from "@/lib/i18n/partners";
import {
  breadcrumbNode,
  graph,
  HOME_OG_IMAGE,
  id,
  pageMeta,
  webPageNode,
  type Crumb,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PartnersView } from "@/components/partners-view";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  const p = partnersCopy(lang);
  return pageMeta({
    lang,
    title: p.seoTitle,
    description: p.seoDesc,
    path: "/partners",
    image: HOME_OG_IMAGE,
    imageAlt: p.seoTitle,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const p = partnersCopy(lang);
  const path = "/partners";

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navPartners, path },
  ];

  /**
   * This page shipped no structured data at all — no `WebPage`, no
   * breadcrumb, nothing — while every other route on the site carried both.
   * It is the one page written for a business audience, so the node that
   * matters is the trade offer catalogue: it says, in machine-readable form,
   * what an agency can actually buy here.
   */
  const jsonLd = graph([
    webPageNode({ lang, path, name: p.seoTitle, description: p.seoDesc, crumbs }),
    breadcrumbNode(lang, path, crumbs),
    {
      "@type": "Service",
      "@id": `${id.webpage(lang, path)}#trade`,
      name: p.seoTitle,
      description: p.seoDesc,
      serviceType: "Destination management and trade rates",
      provider: { "@id": id.organization() },
      areaServed: { "@type": "AdministrativeArea", name: "Crete" },
      // Agencies and operators, not consumers — the audience is the point of
      // the page and the thing that keeps it out of consumer queries.
      audience: { "@type": "BusinessAudience", name: "Travel agencies and tour operators" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: p.offerTitle,
        itemListElement: p.pillars.map((pillar) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: pillar.title, description: pillar.text },
        })),
      },
    },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <PartnersView lang={lang} />
    </>
  );
}
