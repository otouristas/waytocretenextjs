import { ArrowDown, Banknote, ShieldCheck } from "lucide-react";
import { fill, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { TourCore } from "@/lib/content/schema";
import { isPriced, priceFrom, priceTo, priceUnit } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { cashPrice } from "@/lib/cash";

/**
 * The price, directly under the heading and the fact strip.
 *
 * It used to live only in the sidebar widget, which on a phone sits below
 * roughly two thousand words of itinerary — so the one number every visitor
 * is looking for arrived last. This puts it where the eye already is, in the
 * reading order the page is built in: gallery, title, facts, price.
 *
 * Every figure comes from `priceFrom()` / `priceTo()`, the same functions the
 * JSON-LD `Offer` reads, so the band and the widget below it cannot show two
 * different numbers for one tour. Nothing here computes a price.
 */
export function PriceBand({ core, lang }: { core: TourCore; lang: Lang }) {
  const ui = t(lang);
  const from = priceFrom(core.price);
  const to = priceTo(core.price);
  const unit = priceUnit(core.price);

  // An unpriced product says so plainly rather than showing a dash. Inventing
  // a "from" figure for an enquiry-only tour is the one thing this must not do.
  const priced = isPriced(core.price) && from != null;

  // A ladder that genuinely gets cheaper with group size is worth stating:
  // it is the honest reason a party of six pays less a head than a couple.
  const laddered = priced && to != null && to > from && unit === "person";

  return (
    <aside
      className="mt-6 overflow-hidden rounded-2xl bg-olive-50 ring-1 ring-olive-200"
      aria-label={priced ? ui.total : ui.onRequest}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 p-5 sm:p-6">
        <div className="min-w-0">
          {priced ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {ui.fromPrice}
            </p>
          ) : null}

          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            {priced ? (
              <>
                <span className="font-display text-4xl leading-none text-ink sm:text-[2.75rem]">
                  {formatPrice(lang, from)}
                </span>
                {unit ? <span className="text-sm text-accent">{ui.priceKind[unit]}</span> : null}
              </>
            ) : (
              <span className="font-display text-3xl leading-none text-ink">{ui.onRequest}</span>
            )}
          </p>

          {laddered ? (
            <p className="mt-2 text-sm leading-relaxed text-accent">
              {fill(ui.priceLadderNote, {
                low: formatPrice(lang, from),
                high: formatPrice(lang, to),
              })}
            </p>
          ) : null}

          <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-accent">
            {core.cancelFreeHours > 0 ? (
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" aria-hidden />
                {ui.freeCancel}
              </li>
            ) : null}
            {priced ? (
              <li className="inline-flex items-center gap-1.5">
                <Banknote className="size-3.5" aria-hidden />
                {formatPrice(lang, cashPrice(from))} · {ui.cashOffPrice}
              </li>
            ) : null}
          </ul>
        </div>

        {/* An anchor, not a button: the booking panel is on this page, and a
            link that simply moves the reader to it works with no JavaScript. */}
        <a
          href="#booking-panel"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-olive px-5 text-sm font-semibold text-paper transition-colors hover:bg-olive-deep"
        >
          {ui.bookThis}
          <ArrowDown className="size-4" aria-hidden />
        </a>
      </div>
    </aside>
  );
}
