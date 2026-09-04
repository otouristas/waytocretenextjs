import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LANGS, langPath, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { allTours } from "@/lib/content/load";
import { priceFrom } from "@/lib/pricing";
import { breadcrumbNode, graph, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { TourCard } from "@/components/tour/tour-card";
import { FilterBar, FilterRail, type Facet, type Facets } from "@/components/tour/filter-rail";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

type Search = { q?: string; cat?: string; dur?: string; diff?: string; sort?: string };

const DURATION_BANDS = [
  { value: "half", key: "durationHalf", test: (m: number) => m <= 300 },
  { value: "full", key: "durationFull", test: (m: number) => m > 300 && m < 1440 },
  { value: "multi", key: "durationMulti", test: (m: number) => m >= 1440 },
] as const;

/** Semantic order, not frequency — a difficulty scale that reorders itself is
 *  no longer a scale. */
const DIFFICULTIES = ["easy", "moderate", "hard"] as const;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang) as Lang;
  const sp = await searchParams;
  const filtered = Boolean(sp.cat || sp.dur || sp.diff || sp.q);
  const ui = t(lang);

  const meta = pageMeta({
    lang,
    title: ui.toursTitle,
    description: ui.heroSub,
    path: "/tours",
    // A filtered view is a slice of the hub, not a page in its own right.
    // It stays crawlable and linkable but is kept out of the index, and
    // canonicalises to the unfiltered hub so signals consolidate there.
    noindex: filtered,
  });
  if (filtered) {
    meta.alternates = { ...meta.alternates, canonical: absolute(lang, "/tours") };
  }
  return meta;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Search>;
}) {
  const lang = parseLang((await params).lang) as Lang;
  const sp = await searchParams;
  const ui = t(lang);
  const tours = allTours(lang);

  const q = sp.q?.toLowerCase().trim();
  const band = DURATION_BANDS.find((b) => b.value === sp.dur);

  /**
   * One predicate, optionally blind to a single dimension.
   *
   * Facet counts are cross-filtered: each group is counted with its own
   * dimension excluded but every other filter applied. Counting over the
   * whole catalogue, as this page used to, let a pill advertise six tours and
   * then return none; counting over the current results instead would collapse
   * every alternative in a group to zero the moment you picked one of them.
   */
  const keeps = (entry: Entry, blindTo?: "cat" | "dur" | "diff") => {
    const { core, copy } = entry;
    if (blindTo !== "cat" && sp.cat && core.category !== sp.cat) return false;
    if (blindTo !== "diff" && sp.diff && core.difficulty !== sp.diff) return false;
    if (blindTo !== "dur" && band && !band.test(core.durationMinutes)) return false;
    if (q) {
      const haystack = [copy.title, copy.tagline ?? "", copy.summary, core.category, ...core.places]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  };

  const facetsFor = (
    values: readonly string[],
    blindTo: "cat" | "dur" | "diff",
    label: (value: string) => string,
    has: (entry: Entry, value: string) => boolean,
  ): Facet[] => {
    const pool = tours.filter((entry) => keeps(entry, blindTo));
    return values.map((value) => ({
      value,
      label: label(value),
      count: pool.filter((entry) => has(entry, value)).length,
    }));
  };

  // Which values exist at all, and in what order, is decided by the whole
  // catalogue rather than by the current pool — so pills never reorder or
  // disappear underneath the finger that is clicking them.
  const catalogue = new Map<string, number>();
  for (const { core } of tours) {
    catalogue.set(core.category, (catalogue.get(core.category) ?? 0) + 1);
  }

  const facets: Facets = {
    categories: facetsFor(
      [...catalogue.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([value]) => value),
      "cat",
      (value) => ui.categories[value as keyof typeof ui.categories] ?? value,
      (entry, value) => entry.core.category === value,
    ),
    durations: facetsFor(
      DURATION_BANDS.filter((b) => tours.some((x) => b.test(x.core.durationMinutes))).map(
        (b) => b.value,
      ),
      "dur",
      (value) => ui[bandOf(value).key],
      (entry, value) => bandOf(value).test(entry.core.durationMinutes),
    ),
    difficulties: facetsFor(
      DIFFICULTIES.filter((d) => tours.some((x) => x.core.difficulty === d)),
      "diff",
      (value) => ui[value as (typeof DIFFICULTIES)[number]],
      (entry, value) => entry.core.difficulty === value,
    ),
  };

  let results = tours.filter((entry) => keeps(entry));

  if (sp.sort === "price") {
    results = [...results].sort(
      (a, b) => (priceFrom(a.core.price) ?? Infinity) - (priceFrom(b.core.price) ?? Infinity),
    );
  } else if (sp.sort === "duration") {
    results = [...results].sort((a, b) => a.core.durationMinutes - b.core.durationMinutes);
  } else {
    results = [...results].sort(
      (a, b) => Number(b.core.featured) - Number(a.core.featured) || a.core.slug.localeCompare(b.core.slug),
    );
  }

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navTours, path: "/tours" },
  ];

  const jsonLd = graph([
    webPageNode({ lang, path: "/tours", name: ui.toursTitle, description: ui.heroSub, crumbs }),
    breadcrumbNode(lang, "/tours", crumbs),
    {
      "@type": "ItemList",
      numberOfItems: results.length,
      itemListElement: results.map((x, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(lang, `/tours/${x.core.slug}`),
        name: x.copy.title,
      })),
    },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive">
            {ui.navTours}
          </p>
          <h1 className="mt-2 font-display text-4xl text-earth md:text-5xl">
            {ui.toursHubTitle}
          </h1>
          <p className="mt-4 leading-relaxed text-muted">{ui.heroSub}</p>
        </header>

        {/* `items-start` is what lets the rail stick — a stretched grid item
            is as tall as the results column and has nothing to stick to. */}
        <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[248px_1fr] lg:items-start">
          <Suspense fallback={<div className="hidden lg:block lg:h-[28rem]" />}>
            <FilterRail lang={lang} facets={facets} />
          </Suspense>

          <div className="min-w-0">
            <Suspense fallback={<div className="h-10" />}>
              <FilterBar lang={lang} facets={facets} total={results.length} />
            </Suspense>

            {results.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-surface p-10 text-center ring-1 ring-line">
                <p className="font-display text-lg text-earth">{ui.emptyTours}</p>
                <Link
                  href={langPath(lang, "/tours")}
                  className="mt-4 inline-flex rounded-full bg-olive px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-olive-deep"
                >
                  {ui.filterClearAll}
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map(({ core, copy }, i) => (
                  <TourCard key={core.slug} core={core} copy={copy} lang={lang} priority={i < 3} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

type Entry = ReturnType<typeof allTours>[number];

function bandOf(value: string) {
  const band = DURATION_BANDS.find((b) => b.value === value);
  if (!band) throw new Error(`Unknown duration band: ${value}`);
  return band;
}
