/**
 * Category / hub pages that sit as parents in the primary navbar.
 *
 * Slugs match the English WordPress permalinks. Locale prefixing is applied
 * at the route (`/{lang}/outdoor-activities-nature-tours-crete`).
 */

export const HUB_IDS = [
  "outdoor-activities-nature-tours-crete",
  "cretan-history-tours",
  "cretan-culture-tours",
  "cretan-gastronomy-food-tours",
  "hiking-trekking-from-rethymno",
  "signature-experiences",
  "multiday-tours",
] as const;

export type HubId = (typeof HUB_IDS)[number];

export const HUB_SET = new Set<string>(HUB_IDS);

/**
 * A hub is its identity and its membership, and nothing else.
 *
 * Every user-facing string — the H1, the rail label, the SEO title and the
 * lead — lives in `lib/i18n/hubs.ts`, because all five locales need one. This
 * module used to carry an English copy of each as well; the page never read
 * them, and the two drifted the moment the headings were rewritten. Keeping
 * one home for copy is the only way that stays true.
 */
export type HubDef = {
  id: HubId;
  /** Tour slugs, in the order the hub lists them. */
  slugs: readonly string[];
};

export const HUBS: Record<HubId, HubDef> = {
  "outdoor-activities-nature-tours-crete": {
    id: "outdoor-activities-nature-tours-crete",
    slugs: [
      "lake-kournas-argyroupoli-springs-tour",
      "cretan-nature-village-journey",
      "south-crete-highlights",
      "elafonisi-pink-sand-beach-tour-from-rethymno",
      // The boat cruise belonged to no hub at all: its only route in was a
      // direct navbar link, so it had no category page passing it anything.
      "boat-cruise",
      "serenity-sailing-rethymno",
    ],
  },
  "cretan-history-tours": {
    id: "cretan-history-tours",
    slugs: ["timeless-crete-villages-monasteries", "spinalonga-tour-from-rethymno"],
  },
  "cretan-culture-tours": {
    id: "cretan-culture-tours",
    slugs: ["shepherd-for-a-day-crete", "knossos-palace-private-tour"],
  },
  "cretan-gastronomy-food-tours": {
    id: "cretan-gastronomy-food-tours",
    slugs: [
      "authentic-cretan-cooking-class",
      "rethymno-walk-taste",
      "cretan-honey-wine-experience",
    ],
  },
  "hiking-trekking-from-rethymno": {
    id: "hiking-trekking-from-rethymno",
    slugs: [
      "imbros-gorge-guided-tour",
      "samaria-gorge-explorer",
      "aradaina-gorge",
      "pachnes-summit",
    ],
  },
  "signature-experiences": {
    id: "signature-experiences",
    slugs: [
      "taste-of-crete",
      "romance-history-in-rethymno",
      "botanical-tours-crete",
      "sunset-sound-therapy",
    ],
  },
  "multiday-tours": {
    id: "multiday-tours",
    slugs: ["spring-wildflowers-orchids-of-crete"],
  },
};

export function isHubId(value: string): value is HubId {
  return HUB_SET.has(value);
}

export function hubById(id: string): HubDef | null {
  return isHubId(id) ? HUBS[id] : null;
}

/**
 * The hub a tour belongs to, for the link back up from a tour page.
 *
 * Tours reached their hub in one direction only: the hub listed them, nothing
 * listed the hub. That left seven category pages with a single inbound path —
 * the desktop mega menu — so on a phone they were unreachable, and the tour
 * pages that should have been passing them relevance were dead ends.
 *
 * Returns null rather than guessing for a tour in no hub, so a miss is
 * visible as an absent link instead of a wrong one.
 */
export function hubForTour(slug: string): HubDef | null {
  return HUB_IDS.map((id) => HUBS[id]).find((hub) => hub.slugs.includes(slug)) ?? null;
}
