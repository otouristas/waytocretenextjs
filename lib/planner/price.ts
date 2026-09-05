import type { HourlyPrivate } from "../pricing.ts";

/**
 * The published rate for a guest-built private day.
 *
 * Elafonisi remains on its older €40/€50 hourly copy as a named product.
 * This is the rate for Create Your Own Crete Experience only.
 */
export const CUSTOM_DAY_PRICE: HourlyPrivate = {
  kind: "hourly_private",
  currency: "EUR",
  minHours: 5,
  maxHours: 11,
  warnHours: 8.5,
  incrementMinutes: 30,
  bands: [
    { minGuests: 1, maxGuests: 4, perHour: 50 },
    { minGuests: 5, maxGuests: 8, perHour: 60 },
  ],
};
