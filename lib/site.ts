/**
 * Brand and business constants for rethymnotours.com.
 *
 * PHASE 0 — the fields marked `UNVERIFIED` are inferred from the WordPress
 * source and must be confirmed with the operator before the TravelAgency
 * schema node, the Google Business Profile, or any citation is published.
 * NAP inconsistency is expensive to unwind once it has propagated.
 */

export const BRAND = "Rethymno Tours";
export const SITE_HOST = "rethymnotours.com";
/** Production origin. Canonicals, JSON-LD and sitemap URLs always use this. */
export const SITE_ORIGIN = `https://${SITE_HOST}`;

/** The sister site. Same company, different brand — see lib/seo/links.ts. */
export const SISTER_ORIGIN = "https://waytocrete.com";
export const SISTER_BRAND = "Way to Crete";

export const PHONE = "+306972531808";
export const PHONE_DISPLAY = "+30 697 253 1808";
export const WHATSAPP = "https://wa.me/306972531808";

/** Header / mobile CTA — the live booking engine, not a WordPress page. */
export const BOOK_NOW_URL = "https://waytocrete.travelotopos.com/";

/** The office landline, found on the German header and footer templates. */
export const PHONE_OFFICE = "+302832020102";
export const PHONE_OFFICE_DISPLAY = "+30 28320 20102";

export const EMAIL = "info@waytocrete.com";
export const PARTNERS_EMAIL = "partners@waytocrete.com";

/**
 * UNVERIFIED — the street appears in exactly one place in the WordPress
 * database: the Google Maps embed on the contact page. The visible copy says
 * only "Crete, Greece", and no postcode exists anywhere. `postalCode` below is
 * Rethymno's general code, not a confirmed one for this address. Confirm both
 * with the operator before publishing LocalBusiness schema or any citation.
 */
export const ADDRESS = {
  street: "Eratous 6",
  locality: "Rethymno",
  region: "Crete",
  postalCode: "74100",
  country: "GR",
} as const;

export const ADDRESS_DISPLAY = "Rethymno, Crete, Greece";

/**
 * The Greek tourism registry (MHTE/GNTO) number, printed unlabelled in the
 * WordPress footer template beside a badge image. The format — four digits,
 * "E", eleven digits — matches the MHTE pattern, but the source never labels
 * it. Confirm with the operator before treating it as a licence number.
 */
export const MHTE_LICENCE: string | null = "1041E60000439401";

/** UNVERIFIED — legal entity name and VAT (ΑΦΜ) for the footer and schema. */
export const LEGAL_NAME: string | null = null;
export const VAT_NUMBER: string | null = null;

/**
 * Coordinates taken from the transfer dispatch base configured in the booking
 * plugin. That is the operating base, not a verified office pin.
 */
export const GEO = { lat: 35.3655545, lng: 24.4919838 } as const;

export const SOCIAL = {
  instagram: "https://www.instagram.com/waytocrete/",
  tiktok: "https://www.tiktok.com/@waytocrete",
  facebook: "https://www.facebook.com/people/WaytoCrete/61557000327140/",
  tripadvisor:
    "https://www.tripadvisor.com/Attraction_Review-g189421-d27887863-Reviews-WaytoCrete-Rethymnon_Rethymnon_Prefecture_Crete.html",
  google: "https://g.page/r/CU_EsfuRR6JSEBM/review",
} as const;

/**
 * The Google Business Profile place, and its map embed.
 *
 * `MAP_PLACE_ID` is the same id the review URLs carry, so the pin, the
 * reviews and the profile are provably one entity.
 *
 * The embed is loaded on click, never on page load — see
 * `components/contact-map.tsx` for why. `MAP_LINK` and `MAP_DIRECTIONS` are
 * plain links that need no embed at all and work for a reader who never
 * presses the button.
 */
export const MAP_PLACE_ID = "ChIJwZIz-UQNmxQRT8Sx-5FHolI";

export const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2253.870728711848!2d24.487135444714156!3d35.36288933464673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x149b0d44f93392c1%3A0x52a24791fbb1c44f!2sWay%20to%20Crete%20%7C%20Private%20%26%20Bespoke%20Experiences%20in%20Crete!5e1!3m2!1sen!2sgr!4v1788542395028!5m2!1sen!2sgr";

export const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Way to Crete",
)}&query_place_id=${MAP_PLACE_ID}`;

export const MAP_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${GEO.lat},${GEO.lng}&destination_place_id=${MAP_PLACE_ID}`;

/** Canonical public origin. Never localhost, never a preview, never the sister site. */
export function siteUrl() {
  return SITE_ORIGIN;
}

/**
 * Whether this deployment may be indexed.
 *
 * Only the real production host qualifies. Previews, local development and
 * the sister domain all stay `noindex` — a Vercel preview that ranks would
 * compete with production for the same content. Indexability is the only
 * thing `NEXT_PUBLIC_SITE_URL` controls; it does not change `siteUrl()`.
 */
export function isIndexable() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return false;
  try {
    const host = new URL(raw).hostname;
    return host === SITE_HOST || host === `www.${SITE_HOST}`;
  } catch {
    return false;
  }
}

/** A deep link to the matching page on the sister site. */
export function sisterUrl(path: string) {
  return `${SISTER_ORIGIN}/${path.replace(/^\/|\/$/g, "")}/`;
}

/**
 * Sister-site aliases.
 *
 * These are the WordPress origin under its older names, kept so the many
 * existing call sites keep compiling during the rebrand. Prefer
 * `SISTER_ORIGIN` / `sisterUrl` in new code.
 */
export const WP_ORIGIN = SISTER_ORIGIN;
export const wpStoryUrl = sisterUrl;
