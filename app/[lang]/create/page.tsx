import type { Metadata } from "next";
import { Suspense } from "react";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { plannerCopy } from "@/lib/i18n/planner";
import { t } from "@/lib/i18n/ui";
import { getTourCopy, getTourCore } from "@/lib/content/load";
import { PLANNER_TEMPLATES } from "@/lib/planner/catalog";
import { CUSTOM_DAY_PRICE } from "@/lib/planner/price";
import { priceFrom } from "@/lib/pricing";
import { langPath } from "@/lib/i18n/langs";
import {
  breadcrumbNode,
  faqNode,
  graph,
  id,
  offerNode,
  pageMeta,
  webPageNode,
  type Crumb,
} from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { PlannerApp, type PlannerTwin } from "@/components/planner/planner-app";
import { FaqList } from "@/components/tour/sections";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang) as Lang;
  const copy = plannerCopy(lang);
  return pageMeta({
    lang,
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/create",
    image: getTourCore("cretan-nature-village-journey")?.hero,
    imageAlt: copy.seoTitle,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const copy = plannerCopy(lang);
  const ui = t(lang);
  const path = "/create";
  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: copy.nav, path },
  ];

  const twins: Record<string, PlannerTwin> = {};
  for (const template of PLANNER_TEMPLATES) {
    if (!template.matchTour || twins[template.matchTour]) continue;
    const core = getTourCore(template.matchTour);
    const tourCopy = getTourCopy(template.matchTour, lang) ?? getTourCopy(template.matchTour, "en");
    if (!core || !tourCopy) continue;
    twins[template.matchTour] = {
      slug: template.matchTour,
      title: tourCopy.title,
      href: langPath(lang, `/tours/${template.matchTour}`),
      priceFrom: priceFrom(core.price),
    };
  }

  const url = absolute(lang, path);
  const offer = offerNode(CUSTOM_DAY_PRICE, url);
  const jsonLd = graph([
    webPageNode({ lang, path, name: copy.seoTitle, description: copy.seoDescription, crumbs }),
    breadcrumbNode(lang, path, crumbs),
    {
      "@type": ["Product", "TouristTrip"],
      name: copy.title,
      description: copy.lead,
      url,
      brand: { "@id": id.organization() },
      ...(offer ? { offers: offer } : {}),
    },
    faqNode(copy.faqs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-20 text-muted">{copy.title}</div>}>
        <PlannerApp lang={lang} twins={twins} />
      </Suspense>
      <div className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <FaqList faqs={copy.faqs} title={copy.faqTitle} />
      </div>
    </>
  );
}
