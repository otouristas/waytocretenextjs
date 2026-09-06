/** Display-only cash-on-arrival discount. Never folded into `quote()` or JSON-LD. */
export const CASH_DISCOUNT_PERCENT = 10;

export function cashPrice(total: number) {
  return Math.round((total * (100 - CASH_DISCOUNT_PERCENT)) / 100);
}

export function newCashCode() {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `CASH10-${id}`;
}
