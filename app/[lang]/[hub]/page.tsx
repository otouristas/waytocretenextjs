import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { hubCopy } from "@/lib/i18n/hubs";
import { HUB_IDS, hubById } from "@/lib/nav/hubs";
import { getTourCore } from "@/lib/content/load";
import { HubView } from "@/components/nav/hub-view";
import { breadcrumbNode, graph, ogImage, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return HUB_IDS.flatMap((hub) => LANGS.map((lang) => ({ lang, hub })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; hub: string }>;
}): Promise<Metadata> {
  const { lang: raw, hub: hubId } = await params;
  const lang = parseLang(raw) as Lang;
  const hub = hubById(hubId);
  if (!hub) return {};
  const copy = hubCopy(lang, hub.id);

  return pageMeta({
    lang,
    title: copy.seoTitle,
    description: copy.seoDesc,
    path: `/${hub.id}`,
    image: ogImage(...hub.slugs.map((slug) => getTourCore(slug)?.hero)),
    imageAlt: copy.label,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; hub: string }>;
}) {
  const { lang: raw, hub: hubId } = await params;
  const lang = parseLang(raw) as Lang;
  const hub = hubById(hubId);
  if (!hub) notFound();

  const ui = t(lang);
  const copy = hubCopy(lang, hub.id);
  const path = `/${hub.id}`;
  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navTours, path: "/tours" },
    { name: copy.label, path },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path,
      name: copy.seoTitle,
      description: copy.seoDesc,
      crumbs,
    }),
    breadcrumbNode(lang, path, crumbs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <HubView lang={lang} hub={hub} />
    </>
  );
}
