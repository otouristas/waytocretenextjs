import type { Metadata } from "next";
import { SavedView } from "@/components/saved-view";
import { allTours } from "@/lib/content/load";
import { parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { pageMeta } from "@/lib/seo";
import { BRAND } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  // Per-visitor state with no shared content — it must never be indexed, and
  // it is also excluded from the sitemap and disallowed in robots.txt.
  return pageMeta({
    lang,
    title: `${t(lang).wishlist} | ${BRAND}`,
    description: t(lang).saved,
    path: "/saved",
    noindex: true,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  return <SavedView lang={lang} tours={allTours(lang)} />;
}
