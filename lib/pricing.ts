import type { PriceModel } from "./content/schema.ts";

/**
 * The single pricing authority.
 *
 * Both the booking widget and the JSON-LD `Offer` generator call `quote()`.
 * Nothing else is allowed to compute a price, which is what guarantees the
 * number a guest sees and the number Google indexes can never drift apart.
 */

export type Party = {
  adults: number;
  children: number;
  infants: number;
};

export type HourlyPrivate = Extract<PriceModel, { kind: "hourly_private" }>;

export const EMPTY_PARTY: Party = { adults: 1, children: 0, infants: 0 };

export type QuoteLine = {
  label: string;
  qty: number;
  unit: number;
  total: number;
};

/** A cheaper per-person rate one guest away — the GYG-style upsell nudge. */
export type TierNudge = {
  addGuests: number;
  newPerPerson: number;
  currentPerPerson: number;
};

export type Quote =
  | {
      kind: "priced";
      currency: "EUR";
      total: number;
      /** null when the product is not sold per person (flat group rates). */
      perPerson: number | null;
      lines: QuoteLine[];
      /** Payable now to hold a fixed departure; null for request-based tours. */
      deposit: number | null;
      nudge: TierNudge | null;
    }
  | {
      kind: "enquiry";
      currency: "EUR";
      /** Optional honest anchor for a "From €X" label. Never derived. */
      indicativeFrom: number | null;
      reason: "on_request" | "out_of_range";
    };

/** Participants who occupy a seat and are charged. Infants never count. */
export function participants(party: Party): number {
  return party.adults + party.children;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function findTier(
  tiers: ReadonlyArray<{ minGuests: number; maxGuests: number; perPerson: number }>,
  guests: number,
) {
  return tiers.find((t) => guests >= t.minGuests && guests <= t.maxGuests) ?? null;
}

/**
 * Turn raw tour minutes (driving + stays) into the hours we actually bill.
 *
 * Ceil to `incrementMinutes`, then apply the published minimum. The planner
 * engine computes the minutes; this is the only place the rounding lives, so
 * a test and the live dock cannot disagree.
 */
export function billableHours(rawMinutes: number, price: HourlyPrivate): number {
  const raw = Math.max(0, rawMinutes);
  const rounded = Math.ceil(raw / price.incrementMinutes) * price.incrementMinutes;
  return Math.max(price.minHours, rounded / 60);
}

/**
 * Price a party against a product.
 *
 * `date` is only consulted for early-bird cutoffs on fixed departures; it is
 * accepted as a plain YYYY-MM-DD string so this stays a pure function with no
 * dependence on the ambient clock (which would make it untestable and would
 * differ between the server render and the client rehydration).
 *
 * `hours` is only consulted for `hourly_private`. Omit it and the quote is
 * the published minimum day — the "From €X" figure. The planner passes the
 * already-rounded billable hours from `billableHours()`.
 */
export function quote(price: PriceModel, party: Party, date?: string, hours?: number): Quote {
  const guests = participants(party);

  switch (price.kind) {
    case "on_request":
      return {
        kind: "enquiry",
        currency: "EUR",
        indicativeFrom: price.indicativeFrom,
        reason: "on_request",
      };

    case "sliding_per_person": {
      const tier = findTier(price.tiers, guests);
      if (!tier) {
        return { kind: "enquiry", currency: "EUR", indicativeFrom: null, reason: "out_of_range" };
      }
      const total = round(tier.perPerson * guests);

      // Look one step up the ladder: on this pricing shape a larger group is
      // always cheaper per head, so telling the guest is honest, not a dark
      // pattern — and it raises average party size.
      const better = findTier(price.tiers, guests + 1);
      const nudge: TierNudge | null =
        better && better.perPerson < tier.perPerson
          ? { addGuests: 1, newPerPerson: better.perPerson, currentPerPerson: tier.perPerson }
          : null;

      return {
        kind: "priced",
        currency: "EUR",
        total,
        perPerson: tier.perPerson,
        lines: [
          { label: "participants", qty: guests, unit: tier.perPerson, total },
        ],
        deposit: null,
        nudge,
      };
    }

    case "banded_group": {
      const band = price.bands.find((b) => guests >= b.minGuests && guests <= b.maxGuests);
      if (!band) {
        return {
          kind: "enquiry",
          currency: "EUR",
          indicativeFrom: Math.min(...price.bands.map((b) => b.total)),
          reason: "out_of_range",
        };
      }
      return {
        kind: "priced",
        currency: "EUR",
        total: band.total,
        perPerson: guests > 0 ? round(band.total / guests) : null,
        lines: [
          {
            label: `group of ${band.minGuests}–${band.maxGuests}`,
            qty: 1,
            unit: band.total,
            total: band.total,
          },
        ],
        deposit: null,
        nudge: null,
      };
    }

    case "flat_group": {
      const extra = Math.max(0, guests - price.includedGuests);
      if (extra > 0 && price.extraGuest == null) {
        // Larger than the product is sold for and no published extra rate.
        return { kind: "enquiry", currency: "EUR", indicativeFrom: price.total, reason: "out_of_range" };
      }
      const extraTotal = round(extra * (price.extraGuest ?? 0));
      const total = round(price.total + extraTotal);
      const lines: QuoteLine[] = [
        {
          label: price.unitLabel === "couple" ? "per couple" : `group of up to ${price.includedGuests}`,
          qty: 1,
          unit: price.total,
          total: price.total,
        },
      ];
      if (extra > 0) {
        lines.push({ label: "extra guests", qty: extra, unit: price.extraGuest ?? 0, total: extraTotal });
      }
      return {
        kind: "priced",
        currency: "EUR",
        total,
        perPerson: guests > 0 ? round(total / guests) : null,
        lines,
        deposit: null,
        nudge: null,
      };
    }

    case "adult_child_private": {
      const lines: QuoteLine[] = [];

      // Standard per-head path, when the product publishes an adult rate.
      let standard: number | null = null;
      if (price.adult != null) {
        const adultTotal = round(price.adult * party.adults);
        lines.push({ label: "adults", qty: party.adults, unit: price.adult, total: adultTotal });
        let childTotal = 0;
        if (party.children > 0) {
          const childRate = price.child ?? price.adult;
          childTotal = round(childRate * party.children);
          lines.push({ label: "children", qty: party.children, unit: childRate, total: childTotal });
        }
        standard = round(adultTotal + childTotal);
      }

      // Private buyout, where offered. Guests take whichever is cheaper, which
      // is why both are computed rather than the operator's preferred one.
      let priv: number | null = null;
      if (price.privateGroup) {
        const over = Math.max(0, guests - price.privateGroup.includedGuests);
        priv = round(price.privateGroup.total + over * price.privateGroup.extraGuest);
      }

      if (standard == null && priv == null) {
        return { kind: "enquiry", currency: "EUR", indicativeFrom: null, reason: "out_of_range" };
      }

      const usePrivate = standard == null || (priv != null && priv < standard);
      const total = usePrivate ? (priv as number) : (standard as number);

      return {
        kind: "priced",
        currency: "EUR",
        total,
        perPerson: guests > 0 ? round(total / guests) : null,
        lines: usePrivate
          ? [{ label: "private group", qty: 1, unit: total, total }]
          : lines,
        deposit: null,
        nudge: null,
      };
    }

    case "fixed_departure": {
      const earlyBirdApplies =
        price.earlyBird != null && date != null && date <= price.earlyBird.until;
      const unit = earlyBirdApplies ? (price.earlyBird as { price: number }).price : price.standard;
      const total = round(unit * guests);
      return {
        kind: "priced",
        currency: "EUR",
        total,
        perPerson: unit,
        lines: [
          {
            label: earlyBirdApplies ? "early-bird places" : "places",
            qty: guests,
            unit,
            total,
          },
        ],
        deposit: round(price.deposit * guests),
        nudge: null,
      };
    }

    case "hourly_private": {
      const band = price.bands.find((b) => guests >= b.minGuests && guests <= b.maxGuests);
      if (!band || guests < 1) {
        return {
          kind: "enquiry",
          currency: "EUR",
          indicativeFrom: price.minHours * Math.min(...price.bands.map((b) => b.perHour)),
          reason: "out_of_range",
        };
      }
      const billed = hours != null && hours > 0 ? hours : price.minHours;
      const total = round(billed * band.perHour);
      return {
        kind: "priced",
        currency: "EUR",
        total,
        perPerson: guests > 0 ? round(total / guests) : null,
        lines: [
          {
            label: `${billed}h private tour`,
            qty: 1,
            unit: total,
            total,
          },
        ],
        deposit: null,
        nudge: null,
      };
    }
  }
}

/**
 * The lowest legitimate per-person price, for "From €X" labels and for
 * `Offer.lowPrice`. Returns null when the product genuinely has no published
 * price — in which case no price is rendered and no `Offer` is emitted.
 */
export function priceFrom(price: PriceModel): number | null {
  switch (price.kind) {
    case "on_request":
      return price.indicativeFrom;
    case "sliding_per_person":
      return Math.min(...price.tiers.map((t) => t.perPerson));
    case "banded_group":
      return Math.min(...price.bands.map((b) => b.total));
    case "flat_group":
      return price.total;
    case "adult_child_private":
      return price.adult ?? price.privateGroup?.total ?? null;
    case "fixed_departure":
      return price.earlyBird?.price ?? price.standard;
    case "hourly_private":
      return price.minHours * Math.min(...price.bands.map((b) => b.perHour));
  }
}

/** The highest per-person price, for `Offer.highPrice` on sliding ladders. */
export function priceTo(price: PriceModel): number | null {
  switch (price.kind) {
    case "sliding_per_person":
      return Math.max(...price.tiers.map((t) => t.perPerson));
    case "banded_group":
      return Math.max(...price.bands.map((b) => b.total));
    case "fixed_departure":
      return price.standard;
    case "hourly_private":
      return price.maxHours * Math.max(...price.bands.map((b) => b.perHour));
    default:
      return priceFrom(price);
  }
}

/** True when a real, publishable price exists — gates all price schema. */
export function isPriced(price: PriceModel): boolean {
  return priceFrom(price) != null;
}
