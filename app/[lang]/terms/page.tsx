import type { Metadata } from "next";
import { LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { legalDoc, legalMetadata } from "@/lib/content/legal";
import { breadcrumbNode, graph, webPageNode, type Crumb } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { LegalDoc } from "@/components/legal-doc";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang) as Lang;
  return legalMetadata("terms", lang);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const doc = legalDoc("terms", lang);

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.terms, path: "/terms" },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path: "/terms",
      name: doc.title,
      description: doc.description,
      crumbs,
      modified: doc.updated,
    }),
    breadcrumbNode(lang, "/terms", crumbs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <LegalDoc doc={doc} lang={lang} />
    </>
  );
}
