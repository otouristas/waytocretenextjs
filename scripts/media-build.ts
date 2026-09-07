/**
 * Brings every photograph on the site into this repo.
 *
 * Until now the entire catalogue was hot-linked from the sister WordPress
 * site: 231 files behind 499 references. That meant the largest contentful
 * paint of every page depended on someone else's server staying up, we owned
 * none of the filenames, and `scripts/check-media.ts` exists precisely because
 * two of those files had already 404'd on the origin without the build noticing.
 *
 * What this does, in order: find every remote reference, decide which content
 * entity owns each file so it can be given a descriptive name, download it,
 * downscale it, and rewrite every reference to the local path.
 *
 * Two decisions worth knowing before changing it.
 *
 * Images are downscaled by the job they do and re-encoded, which takes the
 * tree from 262 MB to 78 MB. Nothing is lost on screen: `next.config.ts` has
 * `formats: ["image/avif", "image/webp"]`, so Next re-encodes to the right
 * format and the right size per request anyway. The 14 MB original in the
 * source library was never served to anybody; it only made the repository
 * slow to clone.
 *
 * Rewriting is plain text replacement, not JSON parse-and-stringify. A URL is
 * a globally unique string, so replacing it is exact — and it leaves every
 * other byte of the file untouched, which keeps the diff to the lines that
 * actually changed across 139 files.
 *
 * Re-running is cheap: a file already on disk is not downloaded again.
 *
 * Run: npm run content:media-build
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");

/** The one origin the catalogue was hot-linked from. */
const URL_PATTERN = /https:\/\/waytocrete\.com\/wp-content\/uploads\/[^"'\s\\)]+/g;

/** Roots that may contain a reference. Mirrors scripts/check-media.ts. */
const SCAN_ROOTS = ["content", "components", "app", "lib"];

/**
 * Sized by the job the image does, not by one ceiling for everything.
 *
 * A hero can be full-bleed, so it keeps WordPress's own `-scaled` ceiling of
 * 2560px. Gallery and itinerary frames are rendered at `25vw` to `50vw` by
 * every component that uses them (`hero-mosaic.tsx`, `sections.tsx`), so
 * 1920px is already more than a 2x display asks for and the rest is bytes
 * nobody downloads. Next picks the variant per request either way; the source
 * only sets the ceiling.
 */
const HERO_EDGE = 2560;
const SUPPORTING_EDGE = 1920;
const JPEG_QUALITY = 82;
const CONCURRENCY = 6;

let errors = 0;
const fail = (where: string, msg: string) => {
  errors++;
  console.error(`  ✖ ${where}\n    ${msg}`);
};

/* ────────────────────────────── collecting ────────────────────────────── */

type Ref = { url: string; files: Set<string> };

function collect(dir: string, refs: Map<string, Ref>) {
  let entries;
  try {
    entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return; // A root that does not exist in this checkout is not an error.
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const rel = join(dir, entry.name);
    if (entry.isDirectory()) {
      collect(rel, refs);
      continue;
    }
    if (!/\.(json|ts|tsx)$/.test(entry.name)) continue;
    const text = readFileSync(join(ROOT, rel), "utf8");
    for (const match of text.matchAll(URL_PATTERN)) {
      const url = match[0];
      const existing = refs.get(url);
      if (existing) existing.files.add(rel);
      else refs.set(url, { url, files: new Set([rel]) });
    }
  }
}

/* ────────────────────────────── naming ────────────────────────────── */

/**
 * Which entity owns a file, and therefore what it is called.
 *
 * A photograph shared between two tours is downloaded once and both references
 * point at the same path — so the walk order below is the tie-break, and it is
 * deliberately stable: tours, then places, guides, photography, the planner,
 * transfers, and finally the handful of URLs that live only in code.
 *
 * Names describe the entity, not the picture. `samaria-gorge-explorer/hero.jpg`
 * is honest and useful; inventing `two-hikers-at-the-iron-gates.jpg` would be
 * describing a photograph nobody in this process has looked at.
 */
type Owner = { path: string };

function readJson(rel: string): unknown | null {
  try {
    return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
  } catch {
    return null;
  }
}

function dirsIn(kind: string): string[] {
  const root = join(ROOT, "content", kind);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function extensionFor(url: string): string {
  const raw = (url.split("/").pop() ?? "").toLowerCase();
  return raw.endsWith(".webp") ? "webp" : "jpg";
}

function claim(owners: Map<string, Owner>, url: string | null | undefined, path: string) {
  if (typeof url !== "string" || !url.startsWith("https://waytocrete.com/")) return;
  if (owners.has(url)) return; // First owner wins — see the walk order above.
  owners.set(url, { path: `${path}.${extensionFor(url)}` });
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildOwners(): Map<string, Owner> {
  const owners = new Map<string, Owner>();

  for (const slug of dirsIn("tours")) {
    const core = readJson(`content/tours/${slug}/tour.json`) as
      | { hero?: string; gallery?: string[] }
      | null;
    claim(owners, core?.hero, `images/tours/${slug}/hero`);
    (core?.gallery ?? []).forEach((url, i) =>
      claim(owners, url, `images/tours/${slug}/gallery-${pad(i + 1)}`),
    );
    // Itinerary images are byte-identical across all five locale files, so the
    // English one names the asset and the other four resolve to it.
    const copy = readJson(`content/tours/${slug}/en.json`) as
      | { itinerary?: Array<{ image?: string }> }
      | null;
    (copy?.itinerary ?? []).forEach((step, i) =>
      claim(owners, step?.image, `images/tours/${slug}/itinerary-${pad(i + 1)}`),
    );
  }

  for (const slug of dirsIn("places")) {
    const core = readJson(`content/places/${slug}/place.json`) as
      | { hero?: string | null; gallery?: string[] }
      | null;
    claim(owners, core?.hero, `images/places/${slug}/hero`);
    (core?.gallery ?? []).forEach((url, i) =>
      claim(owners, url, `images/places/${slug}/gallery-${pad(i + 1)}`),
    );
  }

  for (const slug of dirsIn("guides")) {
    const core = readJson(`content/guides/${slug}/guide.json`) as { hero?: string | null } | null;
    claim(owners, core?.hero, `images/guides/${slug}/hero`);
  }

  for (const slug of dirsIn("photography")) {
    const core = readJson(`content/photography/${slug}/photo.json`) as
      | { hero?: string; gallery?: string[] }
      | null;
    claim(owners, core?.hero, `images/photography/${slug}/hero`);
    (core?.gallery ?? []).forEach((url, i) =>
      claim(owners, url, `images/photography/${slug}/gallery-${pad(i + 1)}`),
    );
  }

  const stops = readJson("content/planner/stops.json") as Array<{
    slug?: string;
    hero?: string | null;
  }> | null;
  (stops ?? []).forEach((stop, i) =>
    claim(owners, stop?.hero, `images/planner/${stop?.slug ?? `stop-${pad(i + 1)}`}`),
  );

  const transfers = readJson("content/transfers.json") as
    | { vehicle?: { hero?: string; gallery?: string[] } }
    | null;
  claim(owners, transfers?.vehicle?.hero, "images/transfers/vehicle-hero");
  (transfers?.vehicle?.gallery ?? []).forEach((url, i) =>
    claim(owners, url, `images/transfers/vehicle-${pad(i + 1)}`),
  );

  return owners;
}

/**
 * A fallback name for a URL no content entity claimed — the constants in
 * `lib/seo/images.ts`, `lib/i18n/host.ts`, `lib/tours.ts` and two page files.
 * Derived from the source filename so it stays stable across runs.
 */
function fallbackPath(url: string): string {
  const raw = (url.split("/").pop() ?? "image").replace(/\.[a-z]+$/i, "");
  const slug =
    raw
      .toLowerCase()
      .replace(/-scaled$/, "")
      .replace(/-\d+x\d+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
  return `images/site/${slug}.${extensionFor(url)}`;
}

/* ────────────────────────────── downloading ────────────────────────────── */

function maxEdgeFor(relPath: string): number {
  return /\/hero\.[a-z]+$/.test(relPath) || relPath.includes("/site/") ? HERO_EDGE : SUPPORTING_EDGE;
}

async function fetchAndWrite(url: string, relPath: string): Promise<"written" | "skipped"> {
  const abs = join(ROOT, "public", relPath);
  if (existsSync(abs)) return "skipped";

  const res = await fetch(url, { headers: { "User-Agent": "rethymnotours-media-build" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const input = Buffer.from(await res.arrayBuffer());

  const pipeline = sharp(input)
    // `withoutEnlargement` matters: several files are already smaller than the
    // ceiling and upscaling them would add bytes and remove sharpness.
    .rotate()
    .resize({
      width: maxEdgeFor(relPath),
      height: maxEdgeFor(relPath),
      fit: "inside",
      withoutEnlargement: true,
    });

  const output = relPath.endsWith(".webp")
    ? await pipeline.webp({ quality: JPEG_QUALITY }).toBuffer()
    : await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();

  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, output);
  return "written";
}

/* ────────────────────────────── rewriting ────────────────────────────── */

function rewrite(refs: Map<string, Ref>, owners: Map<string, string>) {
  const touched = new Map<string, number>();
  const byFile = new Map<string, Set<string>>();
  for (const ref of refs.values()) {
    for (const file of ref.files) {
      const set = byFile.get(file) ?? new Set<string>();
      set.add(ref.url);
      byFile.set(file, set);
    }
  }

  for (const [file, urls] of [...byFile.entries()].sort()) {
    const abs = join(ROOT, file);
    let text = readFileSync(abs, "utf8");
    let count = 0;
    // Longest first: one URL can be a prefix of another with a size suffix.
    for (const url of [...urls].sort((a, b) => b.length - a.length)) {
      const local = owners.get(url);
      if (!local) continue;
      const before = text;
      text = text.split(url).join(`/${local}`);
      if (text !== before) count += 1;
    }
    if (count > 0) {
      writeFileSync(abs, text);
      touched.set(file, count);
    }
  }
  return touched;
}

/* ────────────────────────────── main ────────────────────────────── */

async function main() {
  console.log("\nCollecting");
  const refs = new Map<string, Ref>();
  for (const root of SCAN_ROOTS) collect(root, refs);
  const total = [...refs.values()].reduce((n, r) => n + r.files.size, 0);
  console.log(`  ${refs.size} unique images across ${total} file references`);

  if (refs.size === 0) {
    console.log("\nNothing to do — no remote images remain.\n");
    return;
  }

  console.log("\nNaming");
  const owned = buildOwners();
  const paths = new Map<string, string>();
  let named = 0;
  for (const url of refs.keys()) {
    const owner = owned.get(url);
    paths.set(url, owner ? owner.path : fallbackPath(url));
    if (owner) named += 1;
  }
  console.log(`  ${named} owned by a content entity, ${refs.size - named} named from the source file`);

  console.log("\nDownloading");
  const entries = [...paths.entries()];
  let written = 0;
  let skipped = 0;
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const index = cursor++;
      const [url, relPath] = entries[index];
      try {
        const result = await fetchAndWrite(url, relPath);
        if (result === "written") written += 1;
        else skipped += 1;
      } catch (e) {
        fail(relPath, `${(e as Error).message}\n    ${url}`);
      }
      if ((index + 1) % 25 === 0) console.log(`  ${index + 1}/${entries.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`  ${written} downloaded, ${skipped} already present`);

  if (errors > 0) {
    console.error(
      `\nFAIL — ${errors} image${errors === 1 ? "" : "s"} could not be fetched. Nothing was rewritten,\n` +
        `so the tree is unchanged and this can be re-run once the source is fixed.\n`,
    );
    process.exit(1);
  }

  console.log("\nRewriting");
  const touched = rewrite(refs, paths);
  const rewritten = [...touched.values()].reduce((a, b) => a + b, 0);
  console.log(`  ${rewritten} references in ${touched.size} files`);

  console.log(
    `\nPASS — ${refs.size} images are now served from /public/images.\n` +
      `Next: drop \`remotePatterns\` from next.config.ts, then run npm run content:media.\n`,
  );
}

await main();
