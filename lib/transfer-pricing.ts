import type { PriceModel } from "./content/schema.ts";

export type FixedTransferRate = {
  minPassengers: number;
  maxPassengers: number;
  totalEur: number;
};

type Journey = { from: string; to: string };
type FixedPricing = { fixedRoutes: Journey[]; fixedRates: FixedTransferRate[] };

/** The published total applies to the whole vehicle in either direction. */
export function getFixedRouteRates(route: Journey, pricing: FixedPricing): FixedTransferRate[] | null {
  const covered = pricing.fixedRoutes.some(
    (pair) =>
      (route.from === pair.from && route.to === pair.to) ||
      (route.from === pair.to && route.to === pair.from),
  );
  return covered ? pricing.fixedRates : null;
}

/** Use the existing group-price model for quotes and structured data. */
export function fixedTransferPrice(route: Journey, pricing: FixedPricing): PriceModel | null {
  const rates = getFixedRouteRates(route, pricing);
  if (!rates) return null;
  return {
    kind: "banded_group",
    currency: "EUR",
    bands: rates.map((rate) => ({
      minGuests: rate.minPassengers,
      maxGuests: rate.maxPassengers,
      total: rate.totalEur,
    })),
  };
}
