import type { Metadata } from "next";
import { LANGS, LANG_META, type Lang, langPath } from "@/lib/i18n/langs";
import { BRAND, isIndexable, siteUrl } from "@/lib/site";

export type PageMetaOptions = {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  /**
   * Which locales actually have reviewed content for this page.
   *
   * hreflang is emitted only for these. The previous build advertised all six
   * alternates on every page while serving identical English to all of them —
   * textbook duplicate content. A missing translation must produce a missing
   * hreflang entry, never a pointer to the English fallback.
   */
  availableLangs?: readonly Lang[];
  /** Absolute or /public-relative image URL for OG and Twitter cards. */
  image?: string | null;
  imageAlt?: string;
  /** Set for pages that must never be indexed (saved list, photo deep-links). */
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

/** The generated per-locale social card at app/[lang]/opengraph-image.tsx. */
const defaultOg = (lang: Lang) => `/${lang}/opengraph-image`;

export function pageMeta(opts: PageMetaOptions): Metadata {
  const {
    lang,
    title,
    description,
    path,
    availableLangs = LANGS,
    image,
    imageAlt,
    noindex = false,
    type = "website",
    publishedTime,
    modifiedTime,
  } = opts;

  const origin = siteUrl();
  const url = `${origin}${langPath(lang, path === "/" ? "" : path)}`;

  const languages: Record<string, string> = {};
  for (const l of LANGS) {
    if (!availableLangs.includes(l)) continue;
    languages[LANG_META[l].hreflang] = `${origin}${langPath(l, path === "/" ? "" : path)}`;
  }
  // x-default points at English whenever English exists for this page.
  if (availableLangs.includes("en")) {
    languages["x-default"] = `${origin}${langPath("en", path === "/" ? "" : path)}`;
  }

  const index = isIndexable() && !noindex;
  const ogImage = image ?? defaultOg(lang);
  const absoluteImage = ogImage.startsWith("http") ? ogImage : `${origin}${ogImage}`;

  return {
    // Absolute, so the layout's `%s | Rethymno Tours` template does not
    // append the brand a second time to titles that already end in it and
    // push them past the ~60 characters Google will render.
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      siteName: BRAND,
      locale: LANG_META[lang].locale,
      type,
      images: [{ url: absoluteImage, width: 1200, height: 630, alt: imageAlt ?? title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
    },
    robots: index
      ? { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 }
      : { index: false, follow: false, nocache: true },
  };
}
