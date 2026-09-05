import type { Metadata } from "next";
import { parseLang } from "@/lib/i18n/langs";
import { partnersCopy } from "@/lib/i18n/partners";
import { HOME_OG_IMAGE, pageMeta } from "@/lib/seo";
import { PartnersView } from "@/components/partners-view";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  const p = partnersCopy(lang);
  return pageMeta({
    lang,
    title: p.seoTitle,
    description: p.seoDesc,
    path: "/partners",
    image: HOME_OG_IMAGE,
    imageAlt: p.seoTitle,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <PartnersView lang={parseLang((await params).lang)} />;
}
