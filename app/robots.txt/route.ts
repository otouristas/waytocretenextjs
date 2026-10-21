import { LEGAL_SLUGS } from "@/lib/content/legal";
import { isIndexable, siteUrl } from "@/lib/site";
import { buildRobotsTxt } from "@/lib/seo-parity/robots-parity";

/**
 * robots.txt
 *
 * A route handler rather than `app/robots.ts`, because the generated
 * `MetadataRoute.Robots` shape cannot emit comment lines (llms.txt pointers,
 * the Content-Signal preference).
 *
 * Same group structure as discovercyclades.gr (see robots-parity.ts): the
 * default group and every named AI crawler share one group and one Disallow
 * list, so no named bot silently loses the Disallows. AI crawlers are allowed
 * deliberately: this site's strategy is to be the source that answer engines
 * cite for Rethymno and Crete travel questions.
 *
 * Query strings are deliberately NOT blocked: filtered `/tours?…` views ship
 * `noindex` and canonicalise to `/tours`; planner links (`/create?s=…`) and
 * prefilled contact URLs canonicalise to their clean path. Duplicate content is
 * a job for canonical and noindex; robots.txt only decides what gets fetched.
 *
 * Bulk scrapers that are not part of the shared AI policy stay blocked.
 */

export const dynamic = "force-static";

const NON_CITING = ["PetalBot", "Diffbot", "omgili", "ImagesiftBot"];

function body(): string {
  const origin = siteUrl();

  // Previews, local builds and anything not on the production host must never
  // be crawlable — a preview that ranks competes with production.
  if (!isIndexable()) {
    return ["User-agent: *", "Disallow: /", ""].join("\n");
  }

  const legal = LEGAL_SLUGS.map((slug) => `# Canonical legal: ${origin}/en/${slug}`);

  return [
    buildRobotsTxt({
      name: "Rethymno Tours",
      origin,
      // The saved list is per-visitor browser state and renders empty to a crawler.
      disallow: ["/*/saved", "/api/"],
      allow: ["/offers.json"],
      blocked: NON_CITING,
      sitemaps: [`${origin}/sitemap.xml`],
    }).trimEnd(),
    "",
    `# Offers catalog: ${origin}/offers.json`,
    // Legal pages are English-only and every locale canonicalises to /en/.
    // They stay crawlable — a blocked page cannot pass its canonical.
    ...legal,
    "",
  ].join("\n");
}

export function GET() {
  return new Response(body(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
