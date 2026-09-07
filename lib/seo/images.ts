import type { Lang } from "@/lib/i18n/langs";

/**
 * Home hero photographs, in slide order.
 *
 * The first frame is also the default share image for pages that do not
 * have their own shot (contact, reviews, partners, legal).
 */
export const HOME_HERO_IMAGES = [
  "/images/site/lefka-ori-44.jpg",
  "/images/site/dsc09353-2.jpg",
  "/images/site/8-2.jpg",
] as const;

export const HOME_OG_IMAGE = HOME_HERO_IMAGES[0];

/** Generated brand card at app/[lang]/opengraph-image.tsx. */
export const defaultOgPath = (lang: Lang) => `/${lang}/opengraph-image`;

/** First non-empty URL, or undefined so `pageMeta` can fall back. */
export function ogImage(...candidates: Array<string | null | undefined>): string | undefined {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return undefined;
}
