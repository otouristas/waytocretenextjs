/**
 * Checks that every remote image the site references actually resolves.
 *
 * Tour imagery is still hot-linked from the sister WordPress site, and its
 * media library contains uploads that failed: two files on the boat cruise
 * were referenced by both the WordPress page and our content files, and both
 * 404'd on the origin. Nothing caught it — a broken `next/image` renders as
 * an empty frame, the build stays green, and it only surfaces when somebody
 * opens the page.
 *
 * Run: npm run content:media
 * Exits non-zero when anything is broken, so it can gate a deploy.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["content", "components", "app", "lib"];
const URL_PATTERN = /https:\/\/waytocrete\.com\/wp-content\/uploads\/[^"'\s\\)]+/g;
const CONCURRENCY = 10;

type Ref = { url: string; files: Set<string> };

function collect(dir: string, refs: Map<string, Ref>) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      collect(path, refs);
      continue;
    }
    if (!/\.(json|ts|tsx)$/.test(entry.name)) continue;

    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(URL_PATTERN)) {
      const url = match[0];
      const ref = refs.get(url);
      if (ref) ref.files.add(path);
      else refs.set(url, { url, files: new Set([path]) });
    }
  }
}

async function main() {
  const refs = new Map<string, Ref>();
  for (const root of ROOTS) {
    try {
      collect(root, refs);
    } catch {
      // A root that does not exist in this checkout is not an error.
    }
  }

  const list = [...refs.values()];
  const broken: Array<{ ref: Ref; status: string }> = [];
  let cursor = 0;

  async function worker() {
    while (cursor < list.length) {
      const ref = list[cursor++];
      try {
        // HEAD is enough: we are asking whether the file exists, not what is
        // in it, and the media library is someone else's server.
        const response = await fetch(ref.url, { method: "HEAD" });
        if (!response.ok) broken.push({ ref, status: String(response.status) });
      } catch (error) {
        broken.push({ ref, status: `network: ${(error as Error).message}` });
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`checked ${list.length} remote images`);

  if (broken.length === 0) {
    console.log("all resolve");
    return;
  }

  console.error(`\n${broken.length} broken:`);
  for (const { ref, status } of broken) {
    console.error(`  ${status}  ${ref.url}`);
    for (const file of ref.files) console.error(`         ${file}`);
  }
  console.error(
    "\nThese render as empty frames. Remove the reference or replace it with a file that exists.",
  );
  process.exitCode = 1;
}

await main();
