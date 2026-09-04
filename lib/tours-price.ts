import type { PriceModel } from "@/lib/content/schema";
import type { Tour } from "@/lib/tours";

/**
 * Bridge from the legacy `Tour` shape to the new `PriceModel`.
 *
 * TEMPORARY. `lib/tours.ts` currently stores a single `priceFrom` plus a
 * `priceType` string, which cannot express any of the real pricing ladders on
 * the source site — Imbros alone has seven per-person tiers. This adapter lets
 * the pricing engine and the `Offer` schema go live now; it is deleted once
 * the content harvest replaces `TOURS` with per-tour `tour.json` files under
 * `content/tours`, where `price` is already a first-class `PriceModel`.
 */
export function legacyPriceModel(tour: Tour): PriceModel {
  if (tour.priceFrom == null) {
    return { kind: "on_request", currency: "EUR", indicativeFrom: null };
  }

  switch (tour.priceType) {
    case "group":
      return {
        kind: "flat_group",
        currency: "EUR",
        total: tour.priceFrom,
        includedGuests: tour.groupMax,
        extraGuest: null,
        unitLabel: "group",
      };

    case "couple":
      return {
        kind: "flat_group",
        currency: "EUR",
        total: tour.priceFrom,
        includedGuests: 2,
        extraGuest: null,
        unitLabel: "couple",
      };

    case "hour":
      // An hourly rate is not a quotable total without a confirmed duration,
      // so it stays an enquiry — but the rate is a truthful "from" anchor.
      return { kind: "on_request", currency: "EUR", indicativeFrom: tour.priceFrom };

    case "person":
    default:
      return {
        kind: "adult_child_private",
        currency: "EUR",
        adult: tour.priceFrom,
        child: null,
        infantFree: true,
        childAges: [4, 13],
        infantAges: [0, 3],
        privateGroup: null,
      };
  }
}
