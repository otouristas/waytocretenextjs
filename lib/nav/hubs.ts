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

export type HubDef = {
  id: HubId;
  /** Exact English navbar label. */
  label: string;
  /** Shorter rail label — the full name wraps badly in a 14-em column. */
  short: string;
  slugs: readonly string[];
  seoTitle: string;
  seoDescription: string;
  lead: string;
};

export const HUBS: Record<HubId, HubDef> = {
  "outdoor-activities-nature-tours-crete": {
    id: "outdoor-activities-nature-tours-crete",
    label: "Outdoor Activities & Nature Tours in Crete",
    short: "Outdoor & Nature",
    slugs: [
      "lake-kournas-argyroupoli-springs-tour",
      "cretan-nature-village-journey",
      "south-crete-highlights",
      "elafonisi-pink-sand-beach-tour-from-rethymno",
    ],
    seoTitle: "Outdoor Activities & Nature Tours in Crete | From Rethymno",
    seoDescription:
      "Private nature days from Rethymno: Lake Kournas, village roads, the south coast and Elafonisi pink sand. Small groups, hotel pickup, free cancellation.",
    lead: "Lakes, south-coast villages and the pink sand of Elafonisi — days that stay outdoors without a coach timetable.",
  },
  "cretan-history-tours": {
    id: "cretan-history-tours",
    label: "Cretan History",
    short: "Cretan History",
    slugs: ["timeless-crete-villages-monasteries", "spinalonga-tour-from-rethymno"],
    seoTitle: "Cretan History Tours from Rethymno | Villages, Monasteries, Spinalonga",
    seoDescription:
      "History days from Rethymno: mountain villages and monasteries, or a private run to Spinalonga. Local hosts, small groups, hotel pickup.",
    lead: "Monasteries, Venetian harbours and the island of Spinalonga — history told by people who live with it.",
  },
  "cretan-culture-tours": {
    id: "cretan-culture-tours",
    label: "Culture",
    short: "Culture",
    slugs: ["shepherd-for-a-day-crete", "knossos-palace-private-tour"],
    seoTitle: "Cretan Culture Tours from Rethymno | Shepherd Day & Knossos",
    seoDescription:
      "A working shepherd’s day in the mountains, or a private morning at Knossos. Culture tours from Rethymno with a local host.",
    lead: "A working shepherd’s day, and a private morning at Knossos — culture you join, not watch from a rope line.",
  },
  "cretan-gastronomy-food-tours": {
    id: "cretan-gastronomy-food-tours",
    label: "Cretan Gastronomy",
    short: "Gastronomy",
    slugs: [
      "authentic-cretan-cooking-class",
      "rethymno-walk-taste",
      "cretan-honey-wine-experience",
    ],
    seoTitle: "Cretan Gastronomy & Food Tours from Rethymno",
    seoDescription:
      "Village cooking, an Old Town tasting walk, honey and wine. Food tours from Rethymno with producers, not a tourist menu.",
    lead: "Village kitchens, Old Town tastings, honey and wine — the island on a plate, without a coach buffet.",
  },
  "hiking-trekking-from-rethymno": {
    id: "hiking-trekking-from-rethymno",
    label: "Hiking & Trekking Tours from Rethymno",
    short: "Hiking & Trekking",
    slugs: [
      "imbros-gorge-guided-tour",
      "samaria-gorge-explorer",
      "aradaina-gorge",
      "pachnes-summit",
    ],
    seoTitle: "Hiking & Trekking Tours from Rethymno | Imbros, Samaria, Pachnes",
    seoDescription:
      "Gorge days and a White Mountains summit from Rethymno: Imbros, Samaria, Aradaina and Pachnes. Small groups, hotel pickup.",
    lead: "Gorges and a White Mountains summit, run from Rethymno — family-scale Imbros through to a private Pachnes day.",
  },
  "signature-experiences": {
    id: "signature-experiences",
    label: "Signature Experiences",
    short: "Signature",
    slugs: [
      "taste-of-crete",
      "romance-history-in-rethymno",
      "botanical-tours-crete",
      "sunset-sound-therapy",
    ],
    seoTitle: "Signature Experiences in Crete | Taste, Romance, Wildflowers, Sunset",
    seoDescription:
      "The days guests write home about: Taste of Crete, a private Old Town evening, spring wildflowers, and sunset sound therapy.",
    lead: "The days guests write home about — food, an Old Town evening for two, spring flowers, and sound at last light.",
  },
  "multiday-tours": {
    id: "multiday-tours",
    label: "Multiday Tours",
    short: "Multiday",
    slugs: ["spring-wildflowers-orchids-of-crete"],
    seoTitle: "Multiday Tours in Crete | Spring Wildflowers & Orchids",
    seoDescription:
      "A week in the Cretan spring: wildflowers and orchids with botanists, based around Spili. Early booking from €990.",
    lead: "A week in the wildflowers, with botanists — the only multiday departure we publish as a product.",
  },
};

export function isHubId(value: string): value is HubId {
  return HUB_SET.has(value);
}

export function hubById(id: string): HubDef | null {
  return isHubId(id) ? HUBS[id] : null;
}
