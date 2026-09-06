import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { photographyCopy } from "@/lib/i18n/photography";
import {
  getPhotographyCopy,
  getPhotographyCore,
  photographyLangs,
  photographySlugs,
  upcomingDepartures,
} from "@/lib/content/load";
import {
  breadcrumbNode,
  faqNode,
  graph,
  pageMeta,
  photographyNode,
  webPageNode,
  type Crumb,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PhotographyProductView } from "@/components/photography/product-view";
import { PHOTOGRAPHY_PATH, familyPath, photoPath } from "@/lib/photography";

/** Departure status and the seasonal list are the reason this is not frozen. */
export const revalidate = 86400;

export const dynamicParams = false;

export function generateStaticParams() {
  return photographySlugs().flatMap((slug) => LANGS.map((lang) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw) as Lang;
  const core = getPhotographyCore(slug);
  const copy = getPhotographyCopy(slug, lang) ?? getPhotographyCopy(slug, "en");
  if (!core || !copy) return {};

  return pageMeta({
    lang,
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: photoPath(slug),
    image: core.hero,
    imageAlt: copy.title,
    // Only locales with reviewed copy get an hreflang entry.
    availableLangs: photographyLangs(slug),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw) as Lang;

  const core = getPhotographyCore(slug);
  const copy = getPhotographyCopy(slug, lang) ?? getPhotographyCopy(slug, "en");
  if (!core || !copy) notFound();

  const ui = t(lang);
  const photo = photographyCopy(lang);
  const path = photoPath(slug);
  const familyLabel = core.kind === "experience" ? photo.experienceNav : photo.workshopNav;

  const departures = core.kind === "workshop" ? upcomingDepartures(core.workshop) : [];

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: photo.nav, path: PHOTOGRAPHY_PATH },
    { name: familyLabel, path: familyPath(core.kind) },
    { name: copy.title, path },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path,
      name: copy.seoTitle,
      description: copy.seoDescription,
      crumbs,
    }),
    breadcrumbNode(lang, path, crumbs),
    photographyNode({
      lang,
      core,
      name: copy.title,
      description: copy.summary,
      images: [core.hero, ...core.gallery].slice(0, 6),
      packageNames: Object.fromEntries(copy.packages.map((p) => [p.id, p.name])),
      placeNames: core.places.map((place) => ({
        name: place.replace(/-/g, " "),
        slug: place,
      })),
    }),
    faqNode(copy.faqs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <PhotographyProductView core={core} copy={copy} lang={lang} departures={departures} />
    </>
  );
}
