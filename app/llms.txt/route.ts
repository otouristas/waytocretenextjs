import { llmsTxt } from "@/lib/seo/llms";
import { isIndexable } from "@/lib/site";

/**
 * /llms.txt
 *
 * Served as a route handler rather than a static file in /public so it is
 * generated from the same content files the pages render from, and cannot
 * drift out of date the moment a price or a duration changes.
 *
 * Statically rendered at build time — the content is file-based and has no
 * request-time input.
 */
export const dynamic = "force-static";

export function GET() {
  // A preview deployment must not publish a corpus that competes with
  // production, for the same reason it must not publish a sitemap.
  if (!isIndexable()) {
    return new Response("User-agent: *\nDisallow: /\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(llmsTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
