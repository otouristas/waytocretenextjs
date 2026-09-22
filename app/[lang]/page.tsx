import type { Metadata } from "next";
import { parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { breadcrumbNode, faqNode, graph, HOME_OG_IMAGE, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { HomeView } from "@/components/home-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  const ui = t(lang);
  return pageMeta({
    lang,
    title: ui.homeTitle,
    // Not `heroSub` — the tours hub uses that too, and shipping one sentence
    // as the description of two URLs wastes the snippet on both.
    description: ui.homeSeoDesc,
    path: "/",
    image: HOME_OG_IMAGE,
    imageAlt: ui.heroImageAlt,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  const copy = t(lang);
  const crumbs: Crumb[] = [{ name: copy.home, path: "/" }];

  // The home page has visible FAQ content but the previous build never marked
  // it up. FAQPage is exactly the kind of markup answer engines lift verbatim.
  const jsonLd = graph([
    webPageNode({ lang, path: "/", name: copy.homeTitle, description: copy.homeSeoDesc, crumbs }),
    breadcrumbNode(lang, "/", crumbs),
    faqNode(copy.faqs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeView lang={lang} />
    </>
  );
}
