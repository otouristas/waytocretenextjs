import type { Metadata } from "next";
import { parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { breadcrumbNode, graph, id, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactView } from "@/components/contact-view";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  return pageMeta({
    lang,
    title: t(lang).contactSeoTitle,
    description: t(lang).contactLead,
    path: "/contact",
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ date?: string; guests?: string; q?: string }>;
}) {
  const lang = parseLang((await params).lang);
  const search = await searchParams;
  const copy = t(lang);

  const crumbs: Crumb[] = [
    { name: copy.home, path: "/" },
    { name: copy.navContact, path: "/contact" },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path: "/contact",
      name: copy.contactTitle,
      description: copy.contactLead,
      crumbs,
    }),
    breadcrumbNode(lang, "/contact", crumbs),
    { "@type": "ContactPage", mainEntity: { "@id": id.organization() } },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContactView
        lang={lang}
        initialDate={search.date || ""}
        initialGuests={search.guests || ""}
        initialQ={search.q || ""}
      />
    </>
  );
}
