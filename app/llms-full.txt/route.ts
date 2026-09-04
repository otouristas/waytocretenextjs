import { llmsFullTxt } from "@/lib/seo/llms";
import { isIndexable } from "@/lib/site";

/**
 * /llms-full.txt — the whole corpus in one plain-text document.
 *
 * Generated from /content, so every price, duration, drive time and entry
 * fee in here is the same value the page renders.
 */
export const dynamic = "force-static";

export function GET() {
  if (!isIndexable()) {
    return new Response("", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(llmsFullTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
