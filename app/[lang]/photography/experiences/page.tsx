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
import { PHOTO_EXPERIENCES_PATH, PHOTOGRAPHY_PATH, photoPath } from "@/lib/photography";

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
  const entries = photographyByKind(lang, "experience");
  return pageMeta({
    lang,
    title: photo.experienceSeoTitle,
    description: photo.experienceSeoDesc,
    path: PHOTO_EXPERIENCES_PATH,
    image: entries[0]?.core.hero,
    imageAlt: photo.experienceTitle,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const photo = photographyCopy(lang);
  const entries = photographyByKind(lang, "experience");
  if (entries.length === 0) notFound();

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: photo.nav, path: PHOTOGRAPHY_PATH },
    { name: photo.experienceNav, path: PHOTO_EXPERIENCES_PATH },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path: PHOTO_EXPERIENCES_PATH,
      name: photo.experienceSeoTitle,
      description: photo.experienceSeoDesc,
      crumbs,
    }),
    breadcrumbNode(lang, PHOTO_EXPERIENCES_PATH, crumbs),
    {
      "@type": "ItemList",
      name: photo.experienceTitle,
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
      <PhotographyFamilyView lang={lang} kind="experience" entries={entries} />
    </>
  );
}
