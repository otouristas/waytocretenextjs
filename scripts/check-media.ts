/**
 * Checks that every image the site references actually exists.
 *
 * This used to HEAD every hot-linked URL on the sister WordPress site, because
 * its media library contained uploads that had failed: two files on the boat
 * cruise were referenced by both the WordPress page and our content files, and
 * both 404'd on the origin. Nothing caught it — a broken `next/image` renders
 * as an empty frame, the build stays green, and it only surfaces when somebody
 * opens the page.
 *
 * `scripts/media-build.ts` has since pulled all 231 photographs into
 * `/public/images`, so the failure mode moved rather than disappeared: a
 * reference to a local path that is not on disk renders exactly the same empty
 * frame. So this now makes two assertions, both offline and both fast:
 *
 *   1. No remote image reference remains. `next.config.ts` no longer allows
 *      that host, so one would fail at build — but failing here names the file
 *      and the line instead of a stack trace.
 *   2. Every `/images/...` reference resolves to a file that exists.
 *
 * It also reports files nobody references, which is how a rename leaves litter.
 *
 * Run: npm run content:media
 * Exits non-zero when anything is broken, so it can gate a deploy.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const ROOTS = ["content", "components", "app", "lib"];

/** The origin the catalogue used to be hot-linked from. Must appear nowhere. */
const REMOTE_PATTERN = /https:\/\/waytocrete\.com\/wp-content\/uploads\/[^"'\s\\)]+/g;
/** A self-hosted reference, as written in content and code. */
const LOCAL_PATTERN = /\/images\/[A-Za-z0-9._\-/]+\.(?:jpg|jpeg|png|webp|avif|svg)/g;

let errors = 0;
const fail = (where: string, msg: string) => {
  errors++;
  console.error(`  ✖ ${where}\n    ${msg}`);
};

type Ref = { value: string; files: Set<string> };

function collect(dir: string, remote: Map<string, Ref>, local: Map<string, Ref>) {
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
      collect(rel, remote, local);
      continue;
    }
    if (!/\.(json|ts|tsx)$/.test(entry.name)) continue;
    const text = readFileSync(join(ROOT, rel), "utf8");
    for (const [pattern, target] of [
      [REMOTE_PATTERN, remote],
      [LOCAL_PATTERN, local],
    ] as const) {
      for (const match of text.matchAll(pattern)) {
        const value = match[0];
        const existing = target.get(value);
        if (existing) existing.files.add(rel);
        else target.set(value, { value, files: new Set([rel]) });
      }
    }
  }
}

function filesUnder(dir: string, prefix = ""): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...filesUnder(join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

function main() {
  const remote = new Map<string, Ref>();
  const local = new Map<string, Ref>();
  for (const root of ROOTS) collect(root, remote, local);

  console.log("\nRemote references");
  if (remote.size === 0) {
    console.log("  none — every image is self-hosted");
  } else {
    for (const ref of remote.values()) {
      fail([...ref.files].sort().join(", "), `still hot-linked: ${ref.value}`);
    }
  }

  console.log("\nLocal references");
  let missing = 0;
  for (const ref of [...local.values()].sort((a, b) => a.value.localeCompare(b.value))) {
    if (existsSync(join(ROOT, "public", ref.value))) continue;
    missing += 1;
    fail([...ref.files].sort().join(", "), `no file at public${ref.value}`);
  }
  console.log(`  ${local.size} referenced, ${local.size - missing} resolve`);

  // Orphans are a warning, not an error: a file nobody references costs bytes,
  // not correctness, and one may be staged ahead of the copy that will use it.
  const referenced = new Set([...local.keys()].map((v) => v.replace(/^\/images\//, "")));
  const orphans = filesUnder("public/images").filter((f) => !referenced.has(f));
  if (orphans.length) {
    console.log(`\n  ⚠ ${orphans.length} file(s) in public/images that nothing references:`);
    for (const orphan of orphans.slice(0, 10)) console.log(`      /images/${orphan}`);
    if (orphans.length > 10) console.log(`      … and ${orphans.length - 10} more`);
  }

  console.log(`\n${errors === 0 ? "PASS" : "FAIL"} — ${errors} error${errors === 1 ? "" : "s"}\n`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
