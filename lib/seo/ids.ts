import { siteUrl } from "@/lib/site";
import { type Lang, langPath } from "@/lib/i18n/langs";

/**
 * Stable `@id` values for the JSON-LD graph.
 *
 * Every page emits ONE `@graph` whose nodes reference each other by `@id`
 * rather than repeating themselves. That is what lets a crawler understand
 * that the `Product` on a tour page, the `TravelAgency` that provides it and
 * the `WebPage` it sits on are the same three entities site-wide, instead of
 * hundreds of disconnected copies.
 */

export const id = {
  organization: () => `${siteUrl()}/#organization`,
  website: () => `${siteUrl()}/#website`,
  webpage: (lang: Lang, path: string) => `${siteUrl()}${langPath(lang, path)}#webpage`,
  breadcrumb: (lang: Lang, path: string) => `${siteUrl()}${langPath(lang, path)}#breadcrumb`,
  tour: (slug: string) => `${siteUrl()}/#tour/${slug}`,
  place: (slug: string) => `${siteUrl()}/#place/${slug}`,
  guide: (lang: Lang, slug: string) => `${siteUrl()}${langPath(lang, `/guides/${slug}`)}#article`,
  author: (authorId: string) => `${siteUrl()}/#author/${authorId}`,
  image: (mediaId: string) => `${siteUrl()}/#image/${mediaId}`,
} as const;

export function absolute(lang: Lang, path: string) {
  return `${siteUrl()}${langPath(lang, path === "/" ? "" : path)}`;
}
