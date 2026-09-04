import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import type { Metadata } from "next";
import { LANGS, type Lang } from "@/lib/i18n/langs";
import { headingId } from "./format";
import { pageMeta } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { BRAND } from "@/lib/site";

/**
 * The legal documents.
 *
 * Terms and the privacy policy are authored as Markdown in `content/legal/`
 * rather than as JSX, because the operator revises this wording and a lawyer
 * reading a diff should see sentences, not components.
 *
 * They are English-only for now. That is stated rather than hidden: a locale
 * with no translated file gets the English text on its own URL, but the page
 * canonicalises to English and advertises no hreflang alternates, so six
 * copies of one English document never compete in the index. Dropping
 * `content/legal/terms.de.md` in is all it takes to make a locale genuine.
 */

const LEGAL = join(process.cwd(), "content", "legal");

export const LEGAL_SLUGS = ["terms", "privacy"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

type Meta = {
  /** The <title> and <h1>. */
  title: string;
  description: string;
  /** ISO date the wording last changed — bump it whenever the copy does. */
  updated: string;
};

const META: Record<LegalSlug, Meta> = {
  terms: {
    title: "Terms & Conditions",
    description:
      "Booking, payment and cancellation terms for tours, excursions and transfers operated by Rethymno Tours in Crete.",
    updated: "2026-09-04",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "What personal data Rethymno Tours collects through this website, why, who processes it, and how to exercise your rights under the GDPR.",
    updated: "2026-09-04",
  },
};

export type LegalDoc = Meta & {
  slug: LegalSlug;
  /** The locale actually rendered, which may be the English fallback. */
  lang: Lang;
  markdown: string;
  /** `## ` headings, in order, for the contents rail. */
  sections: Array<{ id: string; title: string }>;
};

function file(slug: LegalSlug, lang: Lang) {
  return join(LEGAL, `${slug}.${lang}.md`);
}

/** Locales with a genuinely translated file — never the English fallback. */
export const legalLangs = cache((slug: LegalSlug): Lang[] =>
  LANGS.filter((lang) => existsSync(file(slug, lang))),
);

export const legalDoc = cache((slug: LegalSlug, lang: Lang): LegalDoc => {
  const path = existsSync(file(slug, lang)) ? file(slug, lang) : file(slug, "en");
  const markdown = readFileSync(path, "utf8");

  const sections = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((m) => {
    const title = m[1].trim().replace(/\*\*/g, "");
    return { id: headingId(title), title };
  });

  return {
    ...META[slug],
    slug,
    lang: existsSync(file(slug, lang)) ? lang : "en",
    markdown,
    sections,
  };
});

/**
 * Page metadata for a legal document.
 *
 * It lives here rather than in the route so the "English-only" policy above
 * and the canonical that enforces it stay in one file: a locale served the
 * English fallback points its canonical at the English URL, so the six
 * locale paths consolidate into one indexable document instead of six.
 */
export function legalMetadata(slug: LegalSlug, lang: Lang): Metadata {
  const doc = legalDoc(slug, lang);
  const meta = pageMeta({
    lang,
    title: `${doc.title} | ${BRAND}`,
    description: doc.description,
    path: `/${slug}`,
    availableLangs: legalLangs(slug),
  });
  if (doc.lang !== lang) {
    meta.alternates = { ...meta.alternates, canonical: absolute(doc.lang, `/${slug}`) };
  }
  return meta;
}
