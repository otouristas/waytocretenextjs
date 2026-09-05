import Link from "next/link";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { hubCopy } from "@/lib/i18n/hubs";
import { navCopy } from "@/lib/i18n/nav";
import { t } from "@/lib/i18n/ui";
import type { HubDef } from "@/lib/nav/hubs";
import { allTours } from "@/lib/content/load";
import { CatalogTourCard } from "@/components/tour/catalog-tour-card";
import { BOOK_NOW_URL } from "@/lib/site";

export function HubView({ lang, hub }: { lang: Lang; hub: HubDef }) {
  const ui = t(lang);
  const labels = navCopy(lang);
  const copy = hubCopy(lang, hub.id);
  const wanted = new Set(hub.slugs);
  const tours = allTours(lang).filter((entry) => wanted.has(entry.core.slug));
  const ordered = hub.slugs
    .map((slug) => tours.find((entry) => entry.core.slug === slug))
    .filter((entry): entry is NonNullable<typeof entry> => entry != null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {labels.tours}
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{copy.label}</h1>
        <p className="mt-4 leading-relaxed text-muted">{copy.lead}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={langPath(lang, "/tours")}
            className="inline-flex h-11 items-center rounded-full bg-olive px-5 text-sm font-semibold text-paper transition hover:bg-olive-deep"
          >
            {labels.seeAllTours}
          </Link>
          <a
            href={BOOK_NOW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-line transition hover:bg-surface"
          >
            {labels.bookNow}
          </a>
        </div>
      </header>

      {ordered.length === 0 ? (
        <p className="mt-10 text-muted">{ui.emptyTours}</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map(({ core, copy }, i) => (
            <CatalogTourCard key={core.slug} core={core} copy={copy} lang={lang} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
