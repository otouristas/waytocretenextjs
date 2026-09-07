import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PlaneLanding } from "lucide-react";
import { LANGS, langPath, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { landingCopy } from "@/lib/i18n/landing";
import { allTours, getGuideCopy, getGuideCore, getPlaceCopy, getPlaceCore } from "@/lib/content/load";
import { tourIsOpen } from "@/lib/content/schema";
import { breadcrumbNode, graph, ogImage, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogTourCard } from "@/components/tour/catalog-tour-card";

/**
 * Things to do in Rethymno — the town hub the README has listed as outstanding.
 *
 * The only thing resembling it was the Crete-wide guide "Things to Do in
 * Crete", which answers a different question. This page is deliberately
 * curation rather than new prose: every fact it points at is already published
 * on a place page, a guide or a tour, so nothing here can contradict them.
 *
 * The guides and the place are named by slug rather than discovered, because
 * this is an editorial page — the point is which four answers a first-time
 * visitor needs, not everything that mentions the town.
 */

export const dynamicParams = false;
export const revalidate = 86400;

const PATH = "/things-to-do-in-rethymno";

/** The town itself. */
const TOWN_PLACE = "rethymno-old-town";

/** The questions a visitor staying in Rethymno actually asks first. */
const READ_GUIDES = [
  "is-rethymno-worth-visiting",
  "what-is-rethymno-like",
  "rethymno-food-guide",
  "rethymno-or-chania",
] as const;

/** The day-trip answer, already the most tour-linked document on the site. */
const DAY_GUIDE = "best-day-trips-from-rethymno";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

function featured(lang: Lang) {
  return allTours(lang)
    .filter((entry) => tourIsOpen(entry.core) && entry.core.featured)
    .slice(0, 6);
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
    title: copy.thingsSeoTitle,
    description: copy.thingsSeoDesc,
    path: PATH,
    image: ogImage(getPlaceCore(TOWN_PLACE)?.hero, ...featured(lang).map((e) => e.core.hero)),
    imageAlt: copy.thingsTitle,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const copy = landingCopy(lang);

  const town = getPlaceCopy(TOWN_PLACE, lang) ?? getPlaceCopy(TOWN_PLACE, "en");
  const reads = READ_GUIDES.map((slug) => {
    const core = getGuideCore(slug);
    const guide = getGuideCopy(slug, lang) ?? getGuideCopy(slug, "en");
    return core && guide ? { slug, copy: guide } : null;
  }).filter((x): x is NonNullable<typeof x> => x != null);
  const dayTrips = getGuideCopy(DAY_GUIDE, lang) ?? getGuideCopy(DAY_GUIDE, "en");
  const tours = featured(lang);

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: copy.thingsTitle, path: PATH },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path: PATH,
      name: copy.thingsSeoTitle,
      description: copy.thingsSeoDesc,
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

        <header className="mt-4 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {copy.thingsKicker}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{copy.thingsTitle}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{copy.thingsLead}</p>
        </header>

        {town ? (
          <section className="mt-12">
            <h2 className="font-display text-2xl text-ink">{copy.thingsTownTitle}</h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted">{copy.thingsTownLead}</p>
            <Link
              href={langPath(lang, `/places/${TOWN_PLACE}`)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              {town.name}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        ) : null}

        {reads.length ? (
          <section className="mt-14">
            <h2 className="font-display text-2xl text-ink">{copy.thingsReadTitle}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {reads.map((read) => (
                <li key={read.slug}>
                  <Link
                    href={langPath(lang, `/guides/${read.slug}`)}
                    className="block h-full rounded-xl bg-surface p-4 ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-olive-200"
                  >
                    <span className="block font-semibold leading-snug text-ink">{read.copy.title}</span>
                    <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-muted">
                      {read.copy.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-14">
          <h2 className="font-display text-2xl text-ink">{copy.thingsDayTitle}</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">{copy.thingsDayLead}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map(({ core, copy: tour }) => (
              <CatalogTourCard key={core.slug} core={core} copy={tour} lang={lang} />
            ))}
          </div>
          {dayTrips ? (
            <Link
              href={langPath(lang, `/guides/${DAY_GUIDE}`)}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              {dayTrips.title}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </section>

        <section className="mt-14 rounded-2xl bg-olive-50 p-6 ring-1 ring-olive-200 md:p-8">
          <h2 className="font-display text-2xl text-ink">{copy.thingsGettingTitle}</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-accent">{copy.thingsGettingLead}</p>
          <Link
            href={langPath(lang, "/transfers")}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-olive px-5 text-sm font-semibold text-paper transition-colors hover:bg-olive-deep"
          >
            <PlaneLanding className="size-4" aria-hidden />
            {copy.thingsGettingCta}
          </Link>
        </section>
      </div>
    </>
  );
}
