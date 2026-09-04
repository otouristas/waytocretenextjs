import { SISTER_BRAND, sisterUrl } from "@/lib/site";

/**
 * Outbound links to the sister site.
 *
 * The rules, in one place so they cannot drift page to page:
 *
 *  - Contextual and in-content only. No sitewide header or footer link in
 *    either direction — that is the footprint pattern, and both sites already
 *    made that mistake once.
 *  - Topically matched: our Imbros page may link to their Imbros page. It may
 *    not link to their home page with a commercial anchor.
 *  - Anchors are branded or natural phrases, never repeated exact-match
 *    commercial keywords.
 *  - Dofollow. These are genuine same-company references, and marking them
 *    nofollow would be its own kind of signal.
 *
 * The cap is enforced by convention plus review: 2–4 such links across the
 * whole site, not per page.
 */

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
