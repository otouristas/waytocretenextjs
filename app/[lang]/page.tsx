import type { Metadata } from "next";
import { parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { pageMeta } from "@/lib/seo";
import { HomeView } from "@/components/home-view";

const titles: Record<Lang, string> = {
  en: "Private Crete Tours & Hikes from Rethymno | Way to Crete",
  el: "Ιδιωτικές εκδρομές και πεζοπορίες στην Κρήτη από Ρέθυμνο | Way to Crete",
  de: "Private Kreta-Touren und Wanderungen ab Rethymno | Way to Crete",
  it: "Tour privati e trekking a Creta da Rethymno | Way to Crete",
  fr: "Circuits privés et randonnées en Crète depuis Réthymnon | Way to Crete",
  sv: "Privata Kreta-turer och vandringar från Rethymno | Way to Crete",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  return pageMeta({ lang, title: titles[lang], description: t(lang).heroSub, path: "/" });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  return <HomeView lang={lang} />;
}
