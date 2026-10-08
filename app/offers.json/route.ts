import { llmFeedHeaders } from "@/lib/seo/llms";
import { offersJson } from "@/lib/seo/offers";
import { isIndexable } from "@/lib/site";

/**
 * /offers.json — schema.org Product catalog for AI shopping agents.
 *
 * Same prices and ratings as the tour/transfer pages. Published fixed transfer
 * fares carry offers; regional estimates remain unpriced.
 */
export const dynamic = "force-static";

export function GET() {
  if (!isIndexable()) {
    return new Response("", {
      status: 404,
      headers: { "content-type": "application/ld+json; charset=utf-8" },
    });
  }

  return new Response(JSON.stringify(offersJson(), null, 2), {
    headers: llmFeedHeaders("offers"),
  });
}
