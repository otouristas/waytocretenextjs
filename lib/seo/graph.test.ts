import test from "node:test";
import assert from "node:assert/strict";
import type { PriceModel } from "../content/schema.ts";
import { offerNode, tourNode, transferProductNode } from "./graph.ts";

const imbros: PriceModel = {
  kind: "sliding_per_person",
  currency: "EUR",
  tiers: [
    { minGuests: 2, maxGuests: 2, perPerson: 145 },
    { minGuests: 8, maxGuests: 8, perPerson: 44 },
  ],
};

const onRequest: PriceModel = {
  kind: "on_request",
  currency: "EUR",
  indicativeFrom: null,
};

function propertyNames(node: { additionalProperty?: unknown }): string[] {
  const props = node.additionalProperty;
  if (!Array.isArray(props)) return [];
  return props.map((p: { name?: string }) => p.name ?? "");
}

test("priced tour emits AggregateOffer plus Duration and Language", () => {
  const node = tourNode({
    lang: "en",
    slug: "imbros-gorge-guided-tour",
    name: "Imbros Gorge",
    description: "A shorter gorge day.",
    price: imbros,
    durationMinutes: 480,
    images: ["https://example.com/imbros.jpg"],
    ratings: [5, 5, 4],
  });

  assert.equal(node.sku, "imbros-gorge-guided-tour");
  assert.equal(node.inLanguage, "en");
  assert.deepEqual(propertyNames(node), ["Duration", "Language"]);
  assert.equal(node.duration, "PT8H");

  const offer = node.offers as { "@type": string; lowPrice: number; highPrice: number };
  assert.equal(offer["@type"], "AggregateOffer");
  assert.equal(offer.lowPrice, 44);
  assert.equal(offer.highPrice, 145);

  const rating = node.aggregateRating as { ratingValue: number; reviewCount: number };
  assert.equal(rating.reviewCount, 3);
  assert.equal(rating.ratingValue, 4.7);
});

test("empty ratings omit aggregateRating", () => {
  const node = tourNode({
    lang: "en",
    slug: "knossos-palace-private-tour",
    name: "Knossos",
    description: "On request.",
    price: onRequest,
    durationMinutes: 420,
    images: [],
    ratings: [],
  });

  assert.equal(node.aggregateRating, undefined);
  assert.equal(node.offers, undefined);
  assert.equal(offerNode(onRequest, "https://example.com/en/tours/knossos"), null);
});

test("transfer product never carries an Offer", () => {
  const node = transferProductNode({
    lang: "en",
    slug: "heraklion-airport-to-rethymno",
    name: "Heraklion Airport to Rethymno",
    description: "Private transfer.",
    durationMinutes: 90,
    images: ["https://example.com/van.jpg"],
    ratings: [5, 5],
  });

  assert.equal((node["@type"] as string[])[0], "Product");
  assert.equal(node.sku, "heraklion-airport-to-rethymno");
  assert.equal(node.offers, undefined);
  assert.deepEqual(propertyNames(node), ["Duration", "Language"]);
  const rating = node.aggregateRating as { reviewCount: number };
  assert.equal(rating.reviewCount, 2);
});
