/**
 * What the desk hands back to the chat UI.
 *
 * Types only, and deliberately in their own module: `lib/desk/brain.ts` pulls
 * in the content loaders and `lib/transfers.ts`, which is `server-only`, so a
 * client component cannot import from it even for a type without risking the
 * value import coming along. Everything here is erased at build time.
 *
 * Every field is something the site already publishes. There is no `rating`
 * on a tour card unless real reviews carry a real score, for the same reason
 * the tour grid has never shown stars: the source data defaults every tour to
 * 5.0 with nothing behind it.
 */

export type DeskTourCard = {
  kind: "tour";
  slug: string;
  title: string;
  href: string;
  hero: string;
  /** "From €40" or "On request" — already localised. */
  price: string;
  duration: string;
  cadence: string;
  category: string;
  groupMax: number;
  pickup: boolean;
  photoshoot: boolean;
  cancelHours: number;
  blurb: string;
  highlights: string[];
  featured: boolean;
  rating: { average: number; count: number } | null;
  /** Set when this tour checks out on the live booking engine. */
  bookUrl: string | null;
};

export type DeskRouteCard = {
  kind: "route";
  slug: string;
  from: string;
  to: string;
  href: string;
  distanceKm: number;
  duration: string;
  /** Metered range in whole euro, or null where we publish no estimate. */
  estimate: { low: number; high: number } | null;
  atMinimum: boolean;
};

/** The shape the offline brain and the API route both speak. */
export type DeskAnswer = {
  text: string;
  tours: DeskTourCard[];
  routes: DeskRouteCard[];
  /** Chips offered under the answer, as follow-up questions. */
  followUps: string[];
};

export const DESK_DATA_PART = "desk";
