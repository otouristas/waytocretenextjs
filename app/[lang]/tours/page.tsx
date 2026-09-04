import type { Metadata } from "next";
import { parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { pageMeta } from "@/lib/seo";
import { ToursView } from "@/components/tours-view";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  return pageMeta({ lang, title: `Crete Tours from Rethymno | Way to Crete`, description: t(lang).heroSub, path: "/tours" });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const lang = parseLang((await params).lang);
  const search = await searchParams;
  return <ToursView lang={lang} initialQ={search.q || ""} initialCat={search.cat || ""} />;
}
