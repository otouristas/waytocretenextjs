import { llmFeedHeaders, llmsTxt } from "@/lib/seo/llms";
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
  if (!isIndexable()) {
    return new Response("User-agent: *\nDisallow: /\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(llmsTxt(), { headers: llmFeedHeaders("index") });
}
