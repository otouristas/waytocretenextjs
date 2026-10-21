/**
 * Adds the llms.txt header used on discovercyclades.gr to a generated body:
 *
 *   Last-Updated: YYYY-MM-DD
 *   Canonical: <origin>/llms.txt          (or /llms-full.txt)
 *   Long-form: <origin>/llms-full.txt     (Short-form: on the full file)
 *   Sitemap: <origin>/sitemap.xml
 *
 *   # Title
 *   Source: <origin>
 *
 * Header-style lines the body already carried near the top are removed first,
 * so nothing is duplicated. The body itself is left untouched.
 */
const HEADER_KEYS = /^(Last-Updated|Canonical|Long-form|Short-form|Companion|Sitemap|Source):/i;

export type LlmsHeaderOptions = {
  origin: string;
  kind: "index" | "full";
  /** Defaults to the build/render date. */
  lastUpdated?: string;
  sitemap?: string;
};

export function withLlmsHeader(body: string, o: LlmsHeaderOptions): string {
  const origin = o.origin.replace(/\/$/, "");
  // Prefer a review date the body already states; otherwise the build date.
  const stated = body.match(/^(?:Last-Updated|Last Updated|Last updated|Last revised|Updated|Last reviewed):\s*(\d{4}-\d{2}-\d{2})/im);
  const date = o.lastUpdated ?? stated?.[1] ?? new Date().toISOString().slice(0, 10);
  const lines = body
    .replace(/^\uFEFF/, "")
    .split("\n")
    .filter((l) => !/^Last-Updated:/i.test(l.trim()));

  // Drop header-style lines in the opening block (before the first "## ").
  const firstSection = lines.findIndex((l) => l.startsWith("## "));
  const limit = firstSection === -1 ? Math.min(lines.length, 30) : firstSection;
  const kept = lines.filter((l, i) => i >= limit || !HEADER_KEYS.test(l.trim()));

  // "Source:" right below the H1.
  const h1 = kept.findIndex((l) => /^# /.test(l));
  if (h1 !== -1) kept.splice(h1 + 1, 0, `Source: ${origin}`);
  while (kept.length && (kept[0] ?? "").trim() === "") kept.shift();

  const header = [
    `Last-Updated: ${date}`,
    `Canonical: ${origin}/${o.kind === "index" ? "llms.txt" : "llms-full.txt"}`,
    o.kind === "index" ? `Long-form: ${origin}/llms-full.txt` : `Short-form: ${origin}/llms.txt`,
    `Sitemap: ${o.sitemap ?? `${origin}/sitemap.xml`}`,
    "",
  ];
  return [...header, ...kept].join("\n").replace(/\n{3,}/g, "\n\n");
}
