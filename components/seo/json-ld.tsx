/**
 * Renders one JSON-LD graph.
 *
 * A server component by design: structured data must be in the initial HTML
 * for every crawler, and must never sit inside a Suspense boundary that could
 * stream it in after the document is parsed.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own typed content, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
