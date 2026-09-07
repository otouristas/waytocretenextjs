import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { LANGS, langPath, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { landingCopy } from "@/lib/i18n/landing";
import { allTours } from "@/lib/content/load";
import { tourIsOpen } from "@/lib/content/schema";
import { breadcrumbNode, graph, ogImage, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogTourCard } from "@/components/tour/catalog-tour-card";

/**
 * Private tours from Rethymno.
 *
 * Fourteen of the twenty-one tours are `privateOnly`, and there was neither a
 * landing page nor a filter for them — the catalogue facets are category,
 * duration and difficulty. "Private tours from Rethymno" is the query this
 * operator is most obviously the answer to, and nothing on the site said it.
 *
 * The page invents nothing: the list is the catalogue filtered by a flag the
 * content already carries, and every figure stays on the tour pages.
 */

export const dynamicParams = false;

/** The catalogue moves; the flag it is filtered by lives in content. */
export const revalidate = 86400;

const PATH = "/private-tours-from-rethymno";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

function privateTours(lang: Lang) {
  return allTours(lang).filter((entry) => entry.core.privateOnly && tourIsOpen(entry.core));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang) as Lang;
  const copy = landingCopy(lang);
  return pageMeta({
    lang,
    title: copy.privateSeoTitle,
    description: copy.privateSeoDesc,
    path: PATH,
    image: ogImage(...privateTours(lang).map((entry) => entry.core.hero)),
    imageAlt: copy.privateTitle,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const copy = landingCopy(lang);
  const tours = privateTours(lang);

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navTours, path: "/tours" },
    { name: copy.privateTitle, path: PATH },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path: PATH,
      name: copy.privateSeoTitle,
      description: copy.privateSeoDesc,
      crumbs,
    }),
    breadcrumbNode(lang, PATH, crumbs),
    {
      "@type": "ItemList",
      numberOfItems: tours.length,
      itemListElement: tours.map((entry, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(lang, `/tours/${entry.core.slug}`),
        name: entry.copy.title,
      })),
    },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <Breadcrumbs crumbs={crumbs} lang={lang} />

        <header className="mt-4 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {copy.privateKicker}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{copy.privateTitle}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{copy.privateLead}</p>
        </header>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-ink">{copy.privateWhatTitle}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {copy.privateWhat.map((item) => (
              <li key={item.title} className="rounded-xl bg-surface p-5 ring-1 ring-line">
                <p className="inline-flex items-center gap-2 font-semibold text-ink">
                  <BadgeCheck className="size-4 shrink-0 text-accent" aria-hidden />
                  {item.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl text-ink">{copy.privateListTitle}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map(({ core, copy: tour }) => (
              <CatalogTourCard key={core.slug} core={core} copy={tour} lang={lang} />
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl bg-olive-50 p-6 ring-1 ring-olive-200 md:p-8">
          <h2 className="font-display text-2xl text-ink">{copy.privateBuildTitle}</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-accent">{copy.privateBuildLead}</p>
          <Link
            href={langPath(lang, "/create")}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-olive px-5 text-sm font-semibold text-paper transition-colors hover:bg-olive-deep"
          >
            {copy.privateBuildCta}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </div>
    </>
  );
}
