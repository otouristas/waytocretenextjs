import type { MetadataRoute } from "next";
import { DEFAULT_LANG, LANGS, LANG_META, langPath } from "@/lib/i18n/langs";
import { LEGAL_SLUGS } from "@/lib/content/legal";
import {
  getGuideCore,
  getTourCore,
  guideSlugs,
  placeSlugs,
  tourSlugs,
} from "@/lib/content/load";
import { transferRouteSlugs } from "@/lib/transfers";
import { isIndexable, siteUrl } from "@/lib/site";

/**
 * The sitemap.
 *
 * Two things the previous version lacked and Google uses: `lastModified` (so
 * recrawls are prioritised by actual change) and per-entry `alternates` (so
 * the six locales are understood as translations of one page rather than six
 * competing documents).
 *
 * Only canonical, indexable URLs appear. Filtered `/tours?…` views and the
 * saved list are deliberately absent — a sitemap states what we want indexed,
 * not everything that resolves.
 */

const STATIC_PATHS: Array<{ path: string; priority: number }> = [
  { path: "", priority: 1 },
  { path: "/tours", priority: 0.9 },
  { path: "/outdoor-activities-nature-tours-crete", priority: 0.85 },
  { path: "/cretan-history-tours", priority: 0.85 },
  { path: "/cretan-culture-tours", priority: 0.85 },
  { path: "/cretan-gastronomy-food-tours", priority: 0.85 },
  { path: "/hiking-trekking-from-rethymno", priority: 0.85 },
  { path: "/signature-experiences", priority: 0.85 },
  { path: "/multiday-tours", priority: 0.8 },
  { path: "/places", priority: 0.9 },
  { path: "/guides", priority: 0.8 },
  { path: "/transfers", priority: 0.8 },
  { path: "/transfers/weddings", priority: 0.7 },
  { path: "/reviews", priority: 0.6 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/partners", priority: 0.4 },
];

function alternatesFor(path: string) {
  const origin = siteUrl();
  const languages: Record<string, string> = {};
  for (const l of LANGS) {
    languages[LANG_META[l].hreflang] = `${origin}${langPath(l, path)}`;
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  // A non-production origin must not publish a sitemap at all; that is how
  // preview deployments end up competing with production in the index.
  if (!isIndexable()) return [];

  const origin = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const push = (path: string, priority: number, lastModified: Date | string = now) => {
    for (const lang of LANGS) {
      entries.push({
        url: `${origin}${langPath(lang, path)}`,
        lastModified,
        changeFrequency: "weekly",
        priority,
        alternates: alternatesFor(path),
      });
    }
  };

  for (const { path, priority } of STATIC_PATHS) push(path, priority);

  // Legal pages exist on every locale path but are English-only, and each
  // localised path canonicalises to the English one. Listing only the
  // canonical English URL — with no `alternates` — keeps the sitemap saying
  // exactly what `lib/content/legal.ts` tells Google in the head.
  for (const slug of LEGAL_SLUGS) {
    entries.push({
      url: `${origin}${langPath(DEFAULT_LANG, `/${slug}`)}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    });
  }

  for (const slug of tourSlugs()) {
    const core = getTourCore(slug);
    push(`/tours/${slug}`, core?.featured ? 0.8 : 0.7);
  }

  // Attraction pages carry the organic load, so they rank above product pages
  // in crawl priority.
  for (const slug of placeSlugs()) push(`/places/${slug}`, 0.8);

  // Origin-pair transfer pages. "chania airport to rethymno" is a real query
  // with a real volume and no local operator answering it well; these are the
  // pages built to answer it, so they crawl at the same priority as tours.
  for (const slug of transferRouteSlugs()) push(`/transfers/${slug}`, 0.7);

  for (const slug of guideSlugs()) {
    const core = getGuideCore(slug);
    push(`/guides/${slug}`, core?.featured ? 0.8 : 0.6, core?.updated ?? now);
  }

  return entries;
}
