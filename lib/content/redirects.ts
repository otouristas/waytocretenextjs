import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { LANG_PATTERN } from "../i18n/langs.ts";
import { HUB_SET } from "../nav/hubs.ts";

/**
 * Redirects generated from content.
 *
 * Every tour, guide and place records the old paths it replaces in its
 * `supersedes` array. Reading them here means the redirect map cannot drift
 * from the content: merge two posts into one guide, list both old paths, and
 * the 301s appear on the next build.
 *
 * Tour `wpSlug` permalinks are also emitted so WordPress-flat URLs
 * (`/south-crete-highlights/`) land on `/{lang}/tours/{slug}`. Hub pages
 * keep their own routes and are skipped.
 *
 * Deliberately plain `fs` rather than the content loader — this runs inside
 * `next.config.ts`, outside React, where `server-only` would throw.
 */

type Entry = { source: string; destination: string; permanent: true };

const CONTENT = join(process.cwd(), "content");
const LANG = `:lang(${LANG_PATTERN})`;

function pair(from: string, dest: string): Entry[] {
  return [
    { source: from, destination: dest, permanent: true },
    {
      source: `/${LANG}${from}`,
      destination: `/:lang${dest.replace(/^\/en/, "")}`,
      permanent: true,
    },
  ];
}

function readSupersedes(kind: string, coreFile: string, routePrefix: string): Entry[] {
  const root = join(CONTENT, kind);
  if (!existsSync(root)) return [];

  const out: Entry[] = [];
  for (const slug of readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)) {
    const path = join(root, slug, coreFile);
    if (!existsSync(path)) continue;

    let supersedes: string[] = [];
    try {
      supersedes = JSON.parse(readFileSync(path, "utf8")).supersedes ?? [];
    } catch {
      continue;
    }

    for (const old of supersedes) {
      const from = old.startsWith("/") ? old : `/${old}`;
      const clean = from.replace(/\/$/, "");
      if (!clean || clean === `${routePrefix}/${slug}`) continue;
      if (HUB_SET.has(clean.replace(/^\//, ""))) continue;

      out.push({ source: clean, destination: `/en${routePrefix}/${slug}`, permanent: true });
      out.push({
        source: `/${LANG}${clean}`,
        destination: `/:lang${routePrefix}/${slug}`,
        permanent: true,
      });
    }
  }
  return out;
}

function readTourPermalinks(): Entry[] {
  const root = join(CONTENT, "tours");
  if (!existsSync(root)) return [];

  const out: Entry[] = [];
  for (const slug of readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)) {
    const path = join(root, slug, "tour.json");
    if (!existsSync(path)) continue;
    let wpSlug = slug;
    try {
      wpSlug = JSON.parse(readFileSync(path, "utf8")).wpSlug || slug;
    } catch {
      continue;
    }
    const clean = `/${String(wpSlug).replace(/^\/|\/$/g, "")}`;
    const key = clean.replace(/^\//, "");
    if (HUB_SET.has(key)) continue;
    if (clean === `/tours/${slug}`) continue;
    out.push(...pair(clean, `/en/tours/${slug}`));
  }
  return out;
}

function navAliases(): Entry[] {
  return [
    ...pair("/about-us", "/en/about"),
    ...pair("/crete-tours", "/en/tours"),
    ...pair("/transfer", "/en/transfers"),
    ...pair("/blog", "/en/guides"),
    ...pair("/wedding-transfers-crete", "/en/transfers/weddings"),
  ];
}

export function contentRedirects(): Entry[] {
  const all = [
    ...navAliases(),
    ...readTourPermalinks(),
    ...readSupersedes("tours", "tour.json", "/tours"),
    ...readSupersedes("guides", "guide.json", "/guides"),
    ...readSupersedes("places", "place.json", "/places"),
  ];

  const seen = new Set<string>();
  return all.filter((r) => {
    if (seen.has(r.source)) return false;
    seen.add(r.source);
    return true;
  });
}
