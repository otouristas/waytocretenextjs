export type Category =
  | "hiking"
  | "gastronomy"
  | "culture"
  | "beach"
  | "wellness"
  | "signature"
  | "nature";

export type PriceType = "person" | "group" | "couple" | "hour";

export type Cadence =
  | "daily"
  | "request"
  | "weekend"
  | "mon_wed_thu"
  | "mon_thu_fri"
  | "weekdays"
  | "mon_fri_sat_sun"
  | "seasonal";

export type Tour = {
  slug: string;
  wpSlug: string;
  image: string;
  gallery: string[];
  category: Category;
  durationHours: number;
  durationLabel: string;
  pickupTime: string;
  cadence: Cadence;
  priceFrom: number | null;
  priceType: PriceType;
  priceNote?: string;
  groupMax: number;
  groupMin?: number;
  rating: number;
  reviews: number;
  pickup: boolean;
  photoshoot: boolean;
  privateOnly: boolean;
  difficulty: "easy" | "moderate" | "hard";
  meeting: string;
  cancelHours: number;
  featured?: boolean;
  travelotopos?: { serviceId: number; categoryId: number };
};

const IMG = {
  imbros: "/images/tours/imbros-gorge-guided-tour/hero.jpg",
  lefka: "/images/tours/pachnes-summit/gallery-04.jpg",
  lefkaWide: "/images/site/lefka-ori-19.jpg",
  flowers: "/images/site/flowers-50.jpg",
  shepherd: "/images/tours/shepherd-for-a-day-crete/hero.jpg",
  knossos: "/images/tours/shepherd-for-a-day-crete/gallery-02.jpg",
  villages: "/images/tours/spinalonga-tour-from-rethymno/gallery-05.jpg",
  south: "/images/site/10.jpg",
  south2: "/images/site/8.jpg",
  preveli: "/images/tours/south-crete-highlights/gallery-04.jpg",
  elafonisi: "/images/site/dsc09755.jpg",
  oldTown: "/images/tours/rethymno-walk-taste/hero.jpg",
  drone: "/images/site/dsc00024.jpg",
  cooking: "/images/tours/authentic-cretan-cooking-class/hero.jpg",
  winery: "/images/planner/klados-winery.jpg",
  spinalonga: "/images/tours/spinalonga-tour-from-rethymno/hero.jpg",
  sunset: "/images/site/yoga-sunset-final-102.jpg",
  sunset2: "/images/site/yoga-sunset-final-82.jpg",
  boat: "/images/site/idyllic-shot-of-wooden-boats-docked-near-a-boathou-2023-01-19-18-24-45-utc.jpg",
  wild1: "/images/site/timeless-crete-tour-28-4-26-26-1.jpg",
  wild2: "/images/site/timeless-crete-tour-28-4-26-21.jpg",
  gorge2: "/images/tours/imbros-gorge-guided-tour/gallery-05.jpg",
  dji: "/images/site/dji-0715.jpg",
};

function row(
  partial: Pick<
    Tour,
    "slug" | "wpSlug" | "category" | "durationHours" | "durationLabel" | "pickupTime" | "cadence" | "priceFrom" | "image"
  > &
    Partial<Tour>,
): Tour {
  return {
    gallery: [partial.image],
    priceType: "person",
    groupMax: 8,
    rating: 5,
    reviews: 12,
    pickup: true,
    photoshoot: true,
    privateOnly: false,
    difficulty: "easy",
    meeting: "Hotel pickup, Rethymno area",
    cancelHours: 48,
    ...partial,
  };
}

export const TOURS: Tour[] = [
  row({
    slug: "south-crete-highlights",
    wpSlug: "south-crete-highlights",
    category: "nature",
    durationHours: 6,
    durationLabel: "6h",
    pickupTime: "09:00",
    cadence: "daily",
    priceFrom: 250,
    priceType: "group",
    priceNote: "Group of 4; +€50 each extra guest. Children 4–13 €45.",
    reviews: 42,
    featured: true,
    travelotopos: { serviceId: 22, categoryId: 4 },
    image: IMG.south,
    gallery: [IMG.south, IMG.preveli, IMG.south2, IMG.dji],
  }),
  row({
    slug: "rethymno-walk-taste",
    wpSlug: "rethymno-walk-taste",
    category: "gastronomy",
    durationHours: 4,
    durationLabel: "4h",
    pickupTime: "09:30",
    cadence: "mon_wed_thu",
    priceFrom: 120,
    priceType: "person",
    groupMin: 4,
    priceNote: "€120 per adult, minimum 4 guests. Children 4–13 €65.",
    pickup: false,
    reviews: 36,
    featured: true,
    meeting: "Rethymno Old Town café (sent after you request)",
    travelotopos: { serviceId: 21, categoryId: 5 },
    image: IMG.oldTown,
    gallery: [IMG.oldTown, IMG.drone, IMG.cooking],
  }),
  row({
    slug: "taste-of-crete",
    wpSlug: "taste-of-crete",
    category: "signature",
    durationHours: 5,
    durationLabel: "4–6h",
    pickupTime: "09:30",
    cadence: "daily",
    priceFrom: null,
    reviews: 31,
    featured: true,
    image: IMG.winery,
    gallery: [IMG.winery, IMG.oldTown, IMG.cooking],
  }),
  row({
    slug: "imbros-gorge-guided-tour",
    wpSlug: "imbros-gorge-guided-tour",
    category: "hiking",
    durationHours: 6,
    durationLabel: "5–7h",
    pickupTime: "07:00",
    cadence: "daily",
    priceFrom: 44,
    priceType: "person",
    priceNote: "From €44 pp in a full van of 8; €145 pp for two guests.",
    reviews: 24,
    featured: true,
    travelotopos: { serviceId: 11, categoryId: 4 },
    image: IMG.imbros,
    gallery: [IMG.imbros, IMG.gorge2, IMG.flowers, IMG.lefka],
  }),
  row({
    slug: "romance-history-in-rethymno",
    wpSlug: "romance-history-in-rethymno",
    category: "signature",
    durationHours: 2.5,
    durationLabel: "2.5h",
    pickupTime: "17:30",
    cadence: "daily",
    priceFrom: 320,
    priceType: "couple",
    priceNote: "€320 per couple.",
    groupMax: 2,
    privateOnly: true,
    reviews: 18,
    featured: true,
    travelotopos: { serviceId: 17, categoryId: 7 },
    image: IMG.drone,
    gallery: [IMG.drone, IMG.oldTown],
  }),
  row({
    slug: "authentic-cretan-cooking-class",
    wpSlug: "authentic-cretan-cooking-class",
    category: "gastronomy",
    durationHours: 5.5,
    durationLabel: "5–6h",
    pickupTime: "10:30",
    cadence: "mon_thu_fri",
    priceFrom: null,
    reviews: 16,
    featured: false,
    image: IMG.cooking,
    gallery: [IMG.cooking, IMG.winery, IMG.oldTown],
  }),
  row({
    slug: "elafonisi-pink-sand-beach-tour-from-rethymno",
    wpSlug: "elafonisi-pink-sand-beach-tour-from-rethymno",
    category: "beach",
    durationHours: 8,
    durationLabel: "8h",
    pickupTime: "07:00",
    cadence: "request",
    priceFrom: 40,
    priceType: "hour",
    priceNote: "€40/hour for a group of 4; €50/hour for 5–8.",
    reviews: 28,
    image: IMG.elafonisi,
    gallery: [IMG.elafonisi, IMG.preveli, IMG.south],
  }),
  row({
    slug: "samaria-gorge-explorer",
    wpSlug: "samaria-gorge-explorer",
    category: "hiking",
    durationHours: 12,
    durationLabel: "12h",
    pickupTime: "06:30",
    cadence: "daily",
    priceFrom: 350,
    priceType: "group",
    priceNote: "€350 for the van, up to 8 guests. Park fees extra.",
    difficulty: "hard",
    reviews: 19,
    travelotopos: { serviceId: 13, categoryId: 4 },
    image: IMG.lefkaWide,
    gallery: [IMG.lefkaWide, IMG.lefka, IMG.gorge2, IMG.flowers],
  }),
  row({
    slug: "shepherd-for-a-day-crete",
    wpSlug: "shepherd-for-a-day-crete",
    category: "culture",
    durationHours: 5,
    durationLabel: "4–6h",
    pickupTime: "11:00",
    cadence: "request",
    priceFrom: null,
    reviews: 15,
    image: IMG.shepherd,
    gallery: [IMG.shepherd, IMG.cooking],
  }),
  row({
    slug: "knossos-palace-private-tour",
    wpSlug: "knossos-palace-private-tour",
    category: "culture",
    durationHours: 7,
    durationLabel: "7h",
    pickupTime: "09:00",
    cadence: "request",
    priceFrom: null,
    privateOnly: true,
    reviews: 17,
    image: IMG.knossos,
    gallery: [IMG.knossos],
  }),
  row({
    slug: "timeless-crete-villages-monasteries",
    wpSlug: "timeless-crete-villages-monasteries",
    category: "culture",
    durationHours: 5,
    durationLabel: "5h",
    pickupTime: "09:00",
    cadence: "daily",
    priceFrom: 290,
    priceType: "group",
    priceNote: "€290 for up to 4; +€60 extra adult. Closed Tuesdays.",
    reviews: 14,
    travelotopos: { serviceId: 14, categoryId: 6 },
    image: IMG.villages,
    gallery: [IMG.villages, IMG.wild1],
  }),
  row({
    slug: "sunset-sound-therapy",
    wpSlug: "sunset-sound-therapy",
    category: "wellness",
    durationHours: 1,
    durationLabel: "1h",
    pickupTime: "18:30",
    cadence: "request",
    priceFrom: null,
    reviews: 9,
    image: IMG.sunset,
    gallery: [IMG.sunset, IMG.sunset2],
  }),
  row({
    slug: "cretan-nature-village-journey",
    wpSlug: "cretan-nature-village-journey",
    category: "nature",
    durationHours: 5.5,
    durationLabel: "5–6h",
    pickupTime: "09:00",
    cadence: "daily",
    priceFrom: 250,
    priceType: "group",
    priceNote: "€250 for up to 4; +€50 extra adult.",
    reviews: 13,
    travelotopos: { serviceId: 23, categoryId: 4 },
    image: IMG.preveli,
    gallery: [IMG.preveli, IMG.south, IMG.south2],
  }),
  row({
    slug: "pachnes-summit",
    wpSlug: "pachnes-summit",
    category: "hiking",
    durationHours: 9,
    durationLabel: "8–10h",
    pickupTime: "07:00",
    cadence: "request",
    priceFrom: null,
    difficulty: "hard",
    privateOnly: true,
    reviews: 8,
    image: IMG.lefka,
    gallery: [IMG.lefka, IMG.flowers, IMG.gorge2],
  }),
  row({
    slug: "aradaina-gorge",
    wpSlug: "aradaina-gorge",
    category: "hiking",
    durationHours: 9,
    durationLabel: "8–10h",
    pickupTime: "07:00",
    cadence: "request",
    priceFrom: null,
    difficulty: "moderate",
    reviews: 7,
    image: IMG.gorge2,
    gallery: [IMG.gorge2, IMG.lefka, IMG.imbros],
  }),
  row({
    slug: "lake-kournas-argyroupoli-springs-tour",
    wpSlug: "lake-kournas-argyroupoli-springs-tour",
    category: "nature",
    durationHours: 4,
    durationLabel: "4h",
    pickupTime: "08:30",
    cadence: "mon_fri_sat_sun",
    priceFrom: 250,
    priceType: "group",
    priceNote: "€250 up to 4 guests; €290 for 5–8. Rethymno-area pickup only.",
    reviews: 11,
    travelotopos: { serviceId: 20, categoryId: 4 },
    image: IMG.south2,
    gallery: [IMG.south2, IMG.preveli],
  }),
  row({
    slug: "spinalonga-tour-from-rethymno",
    wpSlug: "spinalonga-tour-from-rethymno",
    category: "culture",
    durationHours: 9,
    durationLabel: "8–10h",
    pickupTime: "08:00",
    cadence: "request",
    priceFrom: null,
    priceNote: "Boat and island tickets are extra (~€14–15 boat, €20 island).",
    reviews: 10,
    image: IMG.spinalonga,
    gallery: [IMG.spinalonga],
  }),
  row({
    slug: "cretan-honey-wine-experience",
    wpSlug: "cretan-honey-wine-experience",
    category: "gastronomy",
    durationHours: 5.5,
    durationLabel: "5–6h",
    pickupTime: "09:30",
    cadence: "weekdays",
    priceFrom: null,
    reviews: 12,
    image: IMG.winery,
    gallery: [IMG.winery, IMG.cooking, IMG.oldTown],
  }),
  row({
    slug: "boat-cruise",
    wpSlug: "boat-cruise",
    category: "beach",
    durationHours: 4,
    durationLabel: "Half day",
    pickupTime: "On request",
    cadence: "request",
    priceFrom: null,
    groupMax: 19,
    pickup: false,
    photoshoot: false,
    meeting: "Rethymno marina (sent after you request)",
    reviews: 6,
    image: IMG.boat,
    gallery: [IMG.boat],
  }),
  row({
    slug: "spring-wildflowers-orchids-of-crete",
    wpSlug: "spring-wildflowers-orchids-of-crete",
    category: "signature",
    durationHours: 168,
    durationLabel: "7 days",
    pickupTime: "Airport arrival",
    cadence: "seasonal",
    priceFrom: 990,
    priceType: "person",
    groupMin: 8,
    groupMax: 16,
    priceNote: "Early booking from €990; standard €1,200. €200 deposit holds a place.",
    pickup: true,
    meeting: "Chania or Heraklion airport, then Spili",
    reviews: 5,
    image: IMG.wild1,
    gallery: [IMG.wild1, IMG.wild2, IMG.flowers],
  }),
];

export const CATEGORIES: Category[] = ["hiking", "gastronomy", "culture", "beach", "wellness", "signature", "nature"];

export function getTour(slug: string) {
  return TOURS.find((tour) => tour.slug === slug);
}

export function featuredTours() {
  const featured = TOURS.filter((tour) => tour.featured);
  return featured.length ? featured : TOURS.slice(0, 6);
}
