import { llmFeedHeaders, llmsFullTxt } from "@/lib/seo/llms";
import { isIndexable } from "@/lib/site";
import { withLlmsHeader } from "@/lib/seo-parity/llms-header";

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

  return new Response(withLlmsHeader(llmsFullTxt(), { origin: "https://rethymnotours.com", kind: "full" }), { headers: llmFeedHeaders("full") });
}
