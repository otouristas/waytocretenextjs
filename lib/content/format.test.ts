import test from "node:test";
import assert from "node:assert/strict";
// Relative, extension-bearing imports so Node's type stripping can run this
// file directly, exactly as lib/pricing.test.ts does.
import { localiseHref } from "./format.ts";

/**
 * Run with:  npm run test
 *
 * Guide bodies were authored with 70 links written as `/tours/{slug}` and 31
 * as `/en/…`. On the four non-English locales the first form takes a 308 into
 * English and the second hard-codes it, so a German reader following an
 * internal link left the German site. These are the cases that fix.
 */

test("an unprefixed path picks up the reader's locale", () => {
  assert.equal(localiseHref("/tours/samaria-gorge-explorer", "de"), "/de/tours/samaria-gorge-explorer");
  assert.equal(localiseHref("/guides/best-day-trips-from-rethymno", "sv"), "/sv/guides/best-day-trips-from-rethymno");
  assert.equal(localiseHref("/transfers", "fr"), "/fr/transfers");
});

test("a path hard-coded to English is re-pointed, not doubled", () => {
  assert.equal(localiseHref("/en/guides/crete-mountains", "it"), "/it/guides/crete-mountains");
  assert.equal(localiseHref("/en/tours/imbros-gorge-guided-tour", "de"), "/de/tours/imbros-gorge-guided-tour");
});

test("English is left where it belongs", () => {
  assert.equal(localiseHref("/tours/taste-of-crete", "en"), "/en/tours/taste-of-crete");
  assert.equal(localiseHref("/en/places/samaria-gorge", "en"), "/en/places/samaria-gorge");
});

test("a bare locale root survives the round trip", () => {
  assert.equal(localiseHref("/en", "de"), "/de");
  assert.equal(localiseHref("/", "fr"), "/fr");
});

test("a locale prefix is only stripped on a segment boundary", () => {
  // The regex in lib/i18n/langs.ts has no boundary. Applied as a string
  // replace it would turn these into "gland" and "alian-quarter".
  assert.equal(localiseHref("/england", "de"), "/de/england");
  assert.equal(localiseHref("/italian-quarter", "de"), "/de/italian-quarter");
  assert.equal(localiseHref("/frescoes", "sv"), "/sv/frescoes");
  assert.equal(localiseHref("/sveti-nikola", "en"), "/en/sveti-nikola");
});

test("anything that is not a site path is left exactly as authored", () => {
  for (const href of [
    "https://waytocrete.com/about-us/",
    "http://example.com",
    "mailto:info@waytocrete.com",
    "tel:+306972531808",
    "#cancellation",
    "../relative",
  ]) {
    assert.equal(localiseHref(href, "de"), href, href);
  }
});
