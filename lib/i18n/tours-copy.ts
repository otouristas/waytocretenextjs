import type { Lang } from "./langs";

export type TourCopy = {
  title: string;
  seoTitle: string;
  seoDesc: string;
  long: string;
  highlights: string[];
  itinerary: string[];
  included: string[];
  excluded: string[];
};

function pretty(slug: string) {
  return slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export function tourCopy(_lang: Lang, slug: string): TourCopy {
  const title = pretty(slug);
  return {
    title,
    seoTitle: `${title} | Private Crete tour | Way to Crete`,
    seoDesc: `${title} from Rethymno with Way to Crete. Small groups, hotel pickup, photoshoot included.`,
    long: `${title} is a small-group day from Rethymno with a local host, comfortable transport and a professional photoshoot.`,
    highlights: ["Local host from Rethymno", "Small group", "Hotel pickup available", "Photoshoot included"],
    itinerary: ["Hotel pickup in Rethymno", "Scenic drive and stops", "Lunch with local producers", "Return to Rethymno"],
    included: ["Guide", "Transport", "Photoshoot"],
    excluded: ["Personal expenses"],
  };
}
