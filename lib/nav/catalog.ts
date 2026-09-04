import "server-only";
import { allTours } from "@/lib/content/load";
import { durationLabel } from "@/lib/content/format";
import { priceFrom } from "@/lib/pricing";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { hubCopy } from "@/lib/i18n/hubs";
import { t } from "@/lib/i18n/ui";
import {
  NAV_SPEC,
  hubLabel,
  itemLabel,
  type NavBadge,
  type NavKind,
} from "@/lib/i18n/nav";
import type { HubId } from "@/lib/nav/hubs";

export type NavTour = {
  slug: string;
  label: string;
  href: string;
  hero: string;
  priceFrom: number | null;
  duration: string;
  featured: boolean;
  privateOnly: boolean;
  seasonal: boolean;
  multiday: boolean;
  couples: boolean;
  hotelPickup: boolean;
  photoshoot: boolean;
  groupMax: number;
  badges: NavBadge[];
};

export type NavColumn = {
  id: HubId;
  label: string;
  short: string;
  href: string;
  blurb: string;
  tours: NavTour[];
};

export type NavEntry = {
  id: string;
  label: string;
  href: string | null;
  kind: NavKind;
  columns?: NavColumn[];
  tours?: NavTour[];
};

function badgesFor(input: {
  featured: boolean;
  privateOnly: boolean;
  seasonal: boolean;
  multiday: boolean;
  couples: boolean;
}): NavBadge[] {
  const out: NavBadge[] = [];
  if (input.featured) out.push("most_booked");
  if (input.privateOnly) out.push("private");
  if (input.couples) out.push("couples");
  if (input.multiday) out.push("multiday");
  else if (input.seasonal) out.push("seasonal");
  return out.slice(0, 2);
}

export function decorateNav(lang: Lang): NavEntry[] {
  const tours = allTours(lang);
  const bySlug = new Map(tours.map((entry) => [entry.core.slug, entry]));

  const toTour = (slug: string, fallbackLabel: string, href?: string): NavTour | null => {
    if (slug === "wedding-transfers") {
      return {
        slug,
        label: t(lang).weddingTransfers,
        href: langPath(lang, "/transfers/weddings"),
        hero: "",
        priceFrom: null,
        duration: "",
        featured: false,
        privateOnly: false,
        seasonal: false,
        multiday: false,
        couples: false,
        hotelPickup: true,
        photoshoot: false,
        groupMax: 8,
        badges: [],
      };
    }

    const entry = bySlug.get(slug);
    if (!entry) return null;
    const { core, copy } = entry;
    const multiday = core.durationMinutes >= 1440;
    const seasonal = core.cadence.kind === "seasonal" || core.cadence.kind === "fixed_dates";
    const couples = core.price.kind === "flat_group" && core.price.unitLabel === "couple";
    const featured = Boolean(core.featured);
    return {
      slug: core.slug,
      label: lang === "en" ? fallbackLabel : copy.title,
      href: href ?? langPath(lang, `/tours/${core.slug}`),
      hero: core.hero,
      priceFrom: priceFrom(core.price),
      duration: durationLabel(core.durationMinutes, lang),
      featured,
      privateOnly: core.privateOnly,
      seasonal,
      multiday,
      couples,
      hotelPickup: core.hotelPickup,
      photoshoot: core.photoshoot,
      groupMax: core.groupMax,
      badges: badgesFor({ featured, privateOnly: core.privateOnly, seasonal, multiday, couples }),
    };
  };

  return NAV_SPEC.map((item) => {
    const entry: NavEntry = {
      id: item.id,
      label: itemLabel(item.id, lang),
      href: item.path == null ? null : langPath(lang, item.path),
      kind: item.kind,
    };

    if (item.columns) {
      entry.columns = item.columns.map((col) => {
        const copy = hubCopy(lang, col.hub);
        return {
          id: col.hub,
          label: hubLabel(col.hub, lang),
          short: hubLabel(col.hub, lang, true),
          href: langPath(lang, `/${col.hub}`),
          blurb: copy.lead,
          tours: col.tours
            .map((tour) => toTour(tour.slug, tour.label))
            .filter((x): x is NavTour => x !== null),
        };
      });
    }

    if (item.tours) {
      entry.tours = item.tours
        .map((tour) => toTour(tour.slug, tour.label))
        .filter((x): x is NavTour => x !== null);
    }

    return entry;
  });
}
