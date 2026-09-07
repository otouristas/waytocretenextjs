import { SISTER_BRAND, sisterUrl } from "../site.ts";

/**
 * Outbound links to the sister site.
 *
 * The rules, in one place so they cannot drift page to page:
 *
 *  - Contextual and in-content only. No sitewide header or footer link in
 *    either direction — that is the footprint pattern, and both sites already
 *    made that mistake once. The relationship is still stated on every page,
 *    as text in the footer and as `alternateName` on the organization node;
 *    what is withheld is the hyperlink, not the fact.
 *  - Topically matched: our Imbros page may link to their Imbros page. It may
 *    not link to their home page with a commercial anchor.
 *  - Anchors are branded or natural phrases, never repeated exact-match
 *    commercial keywords.
 *  - Dofollow. These are genuine same-company references, and marking them
 *    nofollow would be its own kind of signal.
 *
 * The cap is 2–4 such links across the whole site, not per page.
 *
 * That cap used to be "enforced by convention plus review", and convention
 * lost: the tour template carried one unconditionally, so 21 tours across 5
 * locales shipped 105 anchors, and this module — the one that wrote the rule
 * down — had no importers at all. `SISTER_STORY_TOURS` is the cap expressed
 * as a list, which is the only form of it a template cannot quietly multiply.
 */

/**
 * The tours allowed to link to their longer write-up on the sister site.
 *
 * Deliberately short, and deliberately here rather than as a flag in 21
 * content files: a per-tour boolean invites "just one more" until the cap is
 * a comment again. These three are the flagship days whose destinations carry
 * the most editorial weight on the other site.
 */
export const SISTER_STORY_TOURS: readonly string[] = [
  "samaria-gorge-explorer",
  "imbros-gorge-guided-tour",
  "south-crete-highlights",
];

export function hasSisterStory(slug: string): boolean {
  return SISTER_STORY_TOURS.includes(slug);
}

export type SisterLink = {
  href: string;
  /** Branded or natural-phrase anchor. Never an exact-match money keyword. */
  anchor: string;
  rel: string;
};

export function sisterLink(wpPath: string, anchor: string): SisterLink {
  return {
    href: sisterUrl(wpPath),
    anchor,
    // Dofollow by omission of `nofollow`; `noopener` is a security default.
    rel: "noopener",
  };
}

/** The default anchor when a page just needs to name the sister brand. */
export const SISTER_ANCHOR = SISTER_BRAND;
