import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { tourCopy } from "@/lib/i18n/tours-copy";
import { getTour, TOURS } from "@/lib/tours";
import { pageMeta } from "@/lib/seo";
import { TourDetailView } from "@/components/tour-detail-view";

export function generateStaticParams() {
  return TOURS.flatMap((tour) => ["en", "el", "de", "it", "fr", "sv"].map((lang) => ({ lang, slug: tour.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw);
  const info = tourCopy(lang, slug);
  return pageMeta({ lang, title: info?.seoTitle ?? "Way to Crete", description: info?.seoDesc ?? t(lang).heroSub, path: `/tours/${slug}` });
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw);
  if (!getTour(slug)) notFound();
  return <TourDetailView lang={lang} slug={slug} />;
}
