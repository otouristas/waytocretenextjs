import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { photographyCopy } from "@/lib/i18n/photography";
import { photographyByKind } from "@/lib/content/load";
import { breadcrumbNode, graph, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { PhotographyFamilyView } from "@/components/photography/family-view";
import { PHOTO_WORKSHOPS_PATH, PHOTOGRAPHY_PATH, photoPath } from "@/lib/photography";

/**
 * Departures drop off this page as their month passes, and their status
 * changes as groups fill. A day is the right granularity: long enough that
 * the page stays effectively static, short enough that a departure never
 * lingers a week past its season.
 */
export const revalidate = 86400;

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
  const entries = photographyByKind(lang, "workshop");
  return pageMeta({
    lang,
    title: photo.workshopSeoTitle,
    description: photo.workshopSeoDesc,
    path: PHOTO_WORKSHOPS_PATH,
    image: entries[0]?.core.hero,
    imageAlt: photo.workshopTitle,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const photo = photographyCopy(lang);
  const entries = photographyByKind(lang, "workshop");
  if (entries.length === 0) notFound();

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: photo.nav, path: PHOTOGRAPHY_PATH },
    { name: photo.workshopNav, path: PHOTO_WORKSHOPS_PATH },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path: PHOTO_WORKSHOPS_PATH,
      name: photo.workshopSeoTitle,
      description: photo.workshopSeoDesc,
      crumbs,
    }),
    breadcrumbNode(lang, PHOTO_WORKSHOPS_PATH, crumbs),
    {
      "@type": "ItemList",
      name: photo.workshopTitle,
      numberOfItems: entries.length,
      itemListElement: entries.map((entry, i) => ({
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
      <PhotographyFamilyView lang={lang} kind="workshop" entries={entries} />
    </>
  );
}
