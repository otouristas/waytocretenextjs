import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fixedTransferPrice, getFixedRouteRates } from "./transfer-pricing.ts";
import { quote } from "./pricing.ts";
import { transferProductNode } from "./seo/graph.ts";

const data = JSON.parse(readFileSync(new URL("../content/transfers.json", import.meta.url), "utf8"));
const pairs = [
  { from: "Chania International Airport (CHQ)", to: "Rethymno" },
  { from: "Chania City", to: "Rethymno" },
  { from: "Heraklion International Airport (HER)", to: "Rethymno" },
  { from: "Heraklion City", to: "Rethymno" },
];

test("all four pairs use the published vehicle total for every party size in both directions", () => {
  assert.deepEqual(data.pricing.fixedRoutes, pairs);
  for (const pair of pairs) {
    for (const route of [pair, { from: pair.to, to: pair.from }]) {
      const price = fixedTransferPrice(route, data.pricing);
      assert.ok(price, `${route.from} → ${route.to} must have fixed fares`);
      for (let passengers = 1; passengers <= 8; passengers++) {
        const result = quote(price, { adults: passengers, children: 0, infants: 0 });
        assert.equal(result.kind, "priced");
        if (result.kind !== "priced") throw new Error("Expected a published fare");
        assert.equal(result.total, passengers <= 4 ? 90 : 105);
      }
      assert.equal(quote(price, { adults: 9, children: 0, infants: 0 }).kind, "enquiry");
    }
  }
});

test("fixed fares do not spread to unrelated routes or journeys inside other regions", () => {
  for (const route of [
    { from: "Rethymno", to: "Plakias" },
    { from: "Chania City", to: "Heraklion City" },
    { from: "Chania City", to: "Chania International Airport (CHQ)" },
    { from: "Heraklion International Airport (HER)", to: "Heraklion City" },
  ]) {
    assert.equal(getFixedRouteRates(route, data.pricing), null);
    assert.equal(fixedTransferPrice(route, data.pricing), null);
  }
});

test("fixed transfer offers publish both group totals while regional estimates remain unpriced", () => {
  for (const route of data.routes) {
    const node = transferProductNode({
      lang: "en",
      slug: route.slug,
      name: `${route.from} to ${route.to}`,
      description: "Private transfer",
      price: fixedTransferPrice(route, data.pricing),
    });
    if (route.slug.includes("airport")) {
      const offer = node.offers as { lowPrice: number; highPrice: number; offerCount: number };
      assert.equal(offer.lowPrice, 90);
      assert.equal(offer.highPrice, 105);
      assert.equal(offer.offerCount, 2);
    } else {
      assert.equal(node.offers, undefined);
    }
  }
});
