import { LEGAL_SLUGS } from "@/lib/content/legal";
import { isIndexable, siteUrl } from "@/lib/site";

/**
 * robots.txt
 *
 * A route handler rather than `app/robots.ts`, because the generated
 * `MetadataRoute.Robots` shape cannot emit comment lines, and robots.txt has
 * no field for `llms.txt` — a comment is the only way to point at it. It also
 * cannot express `Allow` lines that override a broader `Disallow`, which the
 * AI-crawler rules below need.
 *
 * AI crawlers are allowed deliberately. This site's strategy is to be the
 * source that answer engines cite for Rethymno and Crete travel questions;
 * blocking GPTBot, ClaudeBot, PerplexityBot or Google-Extended would forfeit
 * exactly the visibility we are building for. The trade — our content may be
 * summarised without a click — is accepted, because a citation for a local
 * operator is a booking channel, not a lost pageview.
 *
 * Training-only crawlers that return no referral traffic are blocked, since
 * they take the content and cite nothing.
 */

export const dynamic = "force-static";

/** Crawlers that send traffic back, or that power an assistant people use. */
const CITING_AI = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "cohere-ai",
  "MistralAI-User",
];

/** Bulk scrapers and dataset builders that cite nobody. */
const NON_CITING = ["CCBot", "Bytespider", "PetalBot", "Diffbot", "omgili", "ImagesiftBot"];

function body(): string {
  const origin = siteUrl();

  // Previews, local builds and anything not on the production host must never
  // be crawlable — a preview that ranks competes with production for the same
  // content.
  if (!isIndexable()) {
    return ["User-agent: *", "Disallow: /", ""].join("\n");
  }

  const lines: string[] = [];

  lines.push("# " + origin);
  lines.push("# Full content for language models: " + origin + "/llms-full.txt");
  lines.push("");

  lines.push("User-agent: *");
  lines.push("Allow: /");
  // The saved list is per-visitor browser state and renders empty to a
  // crawler. Filtered tour views duplicate their hub — note the pattern is
  // `/*?` and not `/*/tours?`: in robots.txt a `?` is a literal character,
  // so the old rule blocked a path that contains a question mark and let
  // every real filtered URL through.
  lines.push("Disallow: /*/saved");
  lines.push("Disallow: /*?");
  lines.push("Disallow: /api/");
  lines.push("");

  // Legal pages are English-only and every locale canonicalises to /en/.
  // They stay crawlable — a blocked page cannot pass its canonical.
  for (const slug of LEGAL_SLUGS) lines.push(`# Canonical legal: ${origin}/en/${slug}`);
  lines.push("");

  for (const agent of CITING_AI) {
    lines.push(`User-agent: ${agent}`);
    lines.push("Allow: /");
    lines.push("Disallow: /*/saved");
    lines.push("Disallow: /api/");
    lines.push("");
  }

  for (const agent of NON_CITING) {
    lines.push(`User-agent: ${agent}`);
    lines.push("Disallow: /");
    lines.push("");
  }

  lines.push(`Sitemap: ${origin}/sitemap.xml`);
  lines.push("");

  return lines.join("\n");
}

export function GET() {
  return new Response(body(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
