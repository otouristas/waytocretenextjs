import test from "node:test";
import assert from "node:assert/strict";
import { HOME_OG_IMAGE, ogImage } from "./images.ts";

test("ogImage picks the first real URL", () => {
  assert.equal(ogImage(null, "", "   ", HOME_OG_IMAGE), HOME_OG_IMAGE);
  assert.equal(ogImage(undefined, null), undefined);
});
