import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { photographyCopy } from "@/lib/i18n/photography";
import { photographyByKind } from "@/lib/content/load";
import { breadcrumbNode, graph, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { PhotographyHubView } from "@/components/photography/hub-view";
import { PHOTOGRAPHY_PATH, photoPath } from "@/lib/photography";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang) as Lang;
  const photo = photographyCopy(lang);
  const workshops = photographyByKind(lang, "workshop");
  const experiences = photographyByKind(lang, "experience");
  return pageMeta({
    lang,
    title: photo.hubSeoTitle,
    description: photo.hubSeoDesc,
    path: PHOTOGRAPHY_PATH,
    image: workshops[0]?.core.hero ?? experiences[0]?.core.hero,
    imageAlt: photo.hubTitle,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const photo = photographyCopy(lang);
  const experiences = photographyByKind(lang, "experience");
  const workshops = photographyByKind(lang, "workshop");

  // A section hub with nothing behind it is a page that should not exist.
  if (experiences.length === 0 && workshops.length === 0) notFound();

  // A sweeping landscape, not a portrait: this page sells the island first
  // and the product second.
  const heroImage = workshops[0]?.core.hero ?? experiences[0]!.core.hero;

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: photo.nav, path: PHOTOGRAPHY_PATH },
  ];

  const all = [...experiences, ...workshops];
  const jsonLd = graph([
    webPageNode({
      lang,
      path: PHOTOGRAPHY_PATH,
      name: photo.hubSeoTitle,
      description: photo.hubSeoDesc,
      crumbs,
    }),
    breadcrumbNode(lang, PHOTOGRAPHY_PATH, crumbs),
    {
      "@type": "ItemList",
      name: photo.hubSeoTitle,
      numberOfItems: all.length,
      itemListElement: all.map((entry, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: entry.copy.title,
        url: absolute(lang, photoPath(entry.core.slug)),
      })),
    },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <PhotographyHubView
        lang={lang}
        experiences={experiences}
        workshops={workshops}
        heroImage={heroImage}
      />
    </>
  );
}
