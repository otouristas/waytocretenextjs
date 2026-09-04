import type { Metadata } from "next";
import { LANGS, LANG_META, type Lang, langPath } from "@/lib/i18n/langs";

const ORIGIN = "https://waytocrete.com";

export function pageMeta(opts: {
  lang: Lang;
  title: string;
  description: string;
  path: string;
}): Metadata {
  const { lang, title, description, path } = opts;
  const url = `${ORIGIN}${langPath(lang, path === "/" ? "" : path)}`;
  const languages: Record<string, string> = { "x-default": `${ORIGIN}/en` };
  for (const l of LANGS) languages[LANG_META[l].hreflang] = `${ORIGIN}${langPath(l, path === "/" ? "" : path)}`;
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, siteName: "Way to Crete", locale: LANG_META[lang].locale, type: "website" },
    robots: { index: true, follow: true },
  };
}

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Way to Crete",
    url: ORIGIN,
    telephone: "+306972531808",
    email: "info@waytocrete.com",
    address: { "@type": "PostalAddress", addressLocality: "Rethymno", addressRegion: "Crete", addressCountry: "GR" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: "148" },
  };
}
