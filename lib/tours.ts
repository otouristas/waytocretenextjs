export type Category =
  | "hiking"
  | "gastronomy"
  | "culture"
  | "beach"
  | "wellness"
  | "signature"
  | "nature";

export type Tour = {
  slug: string;
  image: string;
  gallery: string[];
  category: Category;
  durationHours: number;
  durationLabel: string;
  priceFrom: number;
  priceType: "person" | "group";
  groupMax: number;
  rating: number;
  reviews: number;
  pickup: boolean;
  photoshoot: boolean;
  privateOnly: boolean;
  difficulty: "easy" | "moderate" | "hard";
  meeting: string;
  cancelHours: number;
};

const A = "https://waytocrete.com/wp-content/uploads/2024/05/DJI_0714-2-1-scaled.jpg";
const B = "https://waytocrete.com/wp-content/uploads/2024/05/DJI_0715-scaled.jpg";
const C = "https://waytocrete.com/wp-content/uploads/2024/05/DSC00024-scaled.jpg";

function row(partial: Pick<Tour, "slug" | "category" | "durationHours" | "durationLabel" | "priceFrom" | "reviews"> & Partial<Tour>): Tour {
  return {
    image: A,
    gallery: [A, B, C],
    priceType: "person",
    groupMax: 8,
    rating: 5,
    pickup: true,
    photoshoot: true,
    privateOnly: false,
    difficulty: "easy",
    meeting: "Hotel pickup, Rethymno",
    cancelHours: 24,
    ...partial,
  };
}

export const TOURS: Tour[] = [
  row({ slug: "south-crete-highlights", category: "nature", durationHours: 9, durationLabel: "9h", priceFrom: 89, reviews: 42 }),
  row({ slug: "rethymno-walk-taste", category: "gastronomy", durationHours: 3.5, durationLabel: "3.5h", priceFrom: 49, reviews: 36, pickup: false, image: C, meeting: "Rethymno Old Town, Porta Guora" }),
  row({ slug: "taste-of-crete", category: "gastronomy", durationHours: 8, durationLabel: "8h", priceFrom: 119, reviews: 31, groupMax: 6 }),
  row({ slug: "elafonisi-pink-sand", category: "beach", durationHours: 10, durationLabel: "10h", priceFrom: 99, reviews: 28, image: B }),
  row({ slug: "imbros-gorge", category: "hiking", durationHours: 8, durationLabel: "8h", priceFrom: 89, reviews: 24 }),
  row({ slug: "samaria-gorge-explorer", category: "hiking", durationHours: 12, durationLabel: "12h", priceFrom: 129, reviews: 19, difficulty: "hard" }),
  row({ slug: "knossos-palace-private", category: "culture", durationHours: 8, durationLabel: "8h", priceFrom: 149, reviews: 17, privateOnly: true }),
  row({ slug: "shepherd-for-a-day", category: "signature", durationHours: 7, durationLabel: "7h", priceFrom: 139, reviews: 15 }),
];

export const CATEGORIES: Category[] = ["hiking", "gastronomy", "culture", "beach", "wellness", "signature", "nature"];

export function getTour(slug: string) {
  return TOURS.find((tour) => tour.slug === slug);
}
