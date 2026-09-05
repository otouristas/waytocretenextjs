import "server-only";
import { cache } from "react";
import { type Lang, langPath } from "@/lib/i18n/langs";
import { allGuides, allPlaces, allTours } from "@/lib/content/load";
import { transferRoutes, shortPlace } from "@/lib/transfers";
import { durationLabel } from "@/lib/content/format";
import { priceFrom } from "@/lib/pricing";
import { t } from "@/lib/i18n/ui";
import { plannerCopy } from "@/lib/i18n/planner";

/**
 * The index behind the hero search.
 *
 * Built on the server and serialised into the page, so the dropdown filters
 * instantly with no request and no search service. It stays small on purpose
 * — roughly seventy entries, title and href and one line of hint each — and
 * carries no prose, because everything here is shipped to every visitor.
 *
 * `keywords` is the field that makes the thing feel like it understands the
 * island: a guest types "airport", "chania", "gorge" or "wine", none of
 * which need appear in a title for the right result to come back.
 */

export type SearchKind = "tour" | "transfer" | "place" | "guide" | "planner";

export type SearchItem = {
  id: string;
  kind: SearchKind;
  title: string;
  /** One short line under the title — duration, price, distance. */
  hint: string;
  href: string;
  /** Lowercased haystack. Never rendered. */
  keywords: string;
  /** Remote thumbnail, tours and places only. */
  image?: string;
  /** Shown before the visitor has typed anything. */
  featured?: boolean;
};

export type SearchIndex = {
  items: SearchItem[];
  /** Group headings, resolved server-side so the client ships no copy. */
  labels: Record<SearchKind, string>;
};

/** Fold accents so "Réthymnon" matches "rethymnon". */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export const searchIndex = cache((lang: Lang): SearchIndex => {
  const ui = t(lang);
  const planner = plannerCopy(lang);
  const items: SearchItem[] = [];

  items.push({
    id: "planner:create",
    kind: "planner",
    title: planner.nav,
    hint: planner.homeLead,
    href: langPath(lang, "/create"),
    featured: true,
    keywords: fold(
      "create custom day itinerary private tour build your own crete preveli spili beach wine",
    ),
  });

  for (const { core, copy } of allTours(lang)) {
    const from = priceFrom(core.price);
    items.push({
      id: `tour:${core.slug}`,
      kind: "tour",
      title: copy.title,
      hint: [
        durationLabel(core.durationMinutes, lang),
        ui.categories[core.category] ?? core.category,
        from != null ? `${ui.fromPrice} €${from}` : ui.onRequest,
      ].join(" · "),
      href: langPath(lang, `/tours/${core.slug}`),
      image: core.hero,
      featured: core.featured,
      keywords: fold(
        [
          copy.title,
          copy.tagline ?? "",
          core.category,
          core.slug.replace(/-/g, " "),
          // Attractions are how people search: "elafonisi", "preveli",
          // "samaria" rather than the product name wrapped around them.
          ...core.places.map((p) => p.replace(/-/g, " ")),
          ...copy.highlights,
        ].join(" "),
      ),
    });
  }

  for (const route of transferRoutes()) {
    const from = shortPlace(route.from);
    const to = shortPlace(route.to);
    items.push({
      id: `transfer:${route.slug}`,
      kind: "transfer",
      title: `${from} → ${to}`,
      hint: `${route.distanceKm} km · ${Math.round(route.durationMinutes)} min`,
      href: langPath(lang, `/transfers/${route.slug}`),
      // Airport runs are the two journeys people actually search for.
      featured: /airport/i.test(route.from) || /airport/i.test(route.to),
      keywords: fold(
        [route.from, route.to, route.slug.replace(/-/g, " "), "transfer taxi airport pickup"].join(
          " ",
        ),
      ),
    });
  }

  for (const { core, copy } of allPlaces(lang)) {
    items.push({
      id: `place:${core.slug}`,
      kind: "place",
      title: copy.name,
      hint:
        core.driveFromRethymnoMinutes != null
          ? `${core.kind} · ${core.driveFromRethymnoMinutes} min from Rethymno`
          : core.kind,
      href: langPath(lang, `/places/${core.slug}`),
      image: core.hero ?? undefined,
      keywords: fold([copy.name, core.kind, core.slug.replace(/-/g, " ")].join(" ")),
    });
  }

  for (const { core, copy } of allGuides(lang)) {
    items.push({
      id: `guide:${core.slug}`,
      kind: "guide",
      title: copy.title,
      hint: core.kind,
      href: langPath(lang, `/guides/${core.slug}`),
      keywords: fold([copy.title, core.kind, core.slug.replace(/-/g, " ")].join(" ")),
    });
  }

  return {
    items,
    labels: {
      tour: ui.searchTours,
      transfer: ui.searchTransfers,
      place: ui.searchPlaces,
      guide: ui.searchGuides,
      planner: planner.nav,
    },
  };
});
