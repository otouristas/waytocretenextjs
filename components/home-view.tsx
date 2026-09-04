import type { Lang } from "@/lib/i18n/langs";
import { langPath } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { allGuides, allReviews, allTours } from "@/lib/content/load";
import { HomeHero } from "@/components/home/hero";
import {
  CategoryTiles,
  GuidesTeaser,
  HomeFaq,
  Reviews,
  SectionHead,
  WhyBookDirect,
} from "@/components/home/sections";
import { TourCard } from "@/components/tour/tour-card";

/**
 * The home page.
 *
 * A server component throughout — the only JavaScript this page ships comes
 * from the hero search inputs and the save button on each card.
 */
export function HomeView({ lang }: { lang: Lang }) {
  const ui = t(lang);
  const tours = allTours(lang);
  const featured = tours.filter((x) => x.core.featured);
  const shown = (featured.length >= 6 ? featured : tours).slice(0, 6);

  // Category tiles are built from the catalogue we actually have, each using
  // its own lead image, so a tile can never point at an empty listing.
  const byCategory = new Map<string, string>();
  for (const { core } of tours) {
    if (!byCategory.has(core.category)) byCategory.set(core.category, core.hero);
  }
  const tiles = [...byCategory.entries()].slice(0, 6).map(([key, image], i) => ({
    key,
    image,
    href: `${langPath(lang, "/tours")}?cat=${key}`,
    span: i === 0 || i === 3,
  }));

  const guides = allGuides(lang)
    .slice(0, 3)
    .map(({ core, copy }) => ({
      slug: core.slug,
      title: copy.title,
      summary: copy.summary,
      hero: core.hero,
    }));

  return (
    <div>
      <HomeHero lang={lang} />

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHead
          eyebrow={ui.featured}
          title={ui.homeFeaturedTitle}
          href={langPath(lang, "/tours")}
          linkLabel={ui.viewAll}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ core, copy }) => (
            <TourCard key={core.slug} core={core} copy={copy} lang={lang} />
          ))}
        </div>
      </section>

      {tiles.length > 0 ? <CategoryTiles lang={lang} tiles={tiles} /> : null}

      <WhyBookDirect lang={lang} />

      <Reviews lang={lang} reviews={allReviews()} />

      <GuidesTeaser lang={lang} guides={guides} />

      <HomeFaq lang={lang} />
    </div>
  );
}
