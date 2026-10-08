import type { Lang } from "@/lib/i18n/langs";
import { transfersCopy } from "@/lib/i18n/transfers";
import type { FixedTransferRate } from "@/lib/transfer-pricing";
import { shortPlace, transfers } from "@/lib/transfers";

export function FixedTransferRates({ rates, lang }: { rates: FixedTransferRate[]; lang: Lang }) {
  const p = transfersCopy(lang);
  return (
    <dl className="mt-3 grid gap-2">
      {rates.map((rate) => (
        <div key={rate.minPassengers} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <dt className="text-xs text-muted">{p.rateBand(rate.minPassengers, rate.maxPassengers)}</dt>
          <dd className="font-semibold text-ink">{p.totalFare(rate.totalEur)}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The four published pairs, including the city journeys without detail pages. */
export function FixedTransferPricing({ lang }: { lang: Lang }) {
  const p = transfersCopy(lang);
  const { fixedRoutes, fixedRates } = transfers().pricing;
  return (
    <section>
      <h2 className="font-display text-2xl text-ink">{p.fixedPriceTitle}</h2>
      <div className="mt-5 overflow-x-auto rounded-xl ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-olive-50 text-accent">
            <tr>
              <th scope="col" className="px-4 py-3">{p.routeColumn}</th>
              {fixedRates.map((rate) => (
                <th key={rate.minPassengers} scope="col" className="px-4 py-3">
                  {p.rateBand(rate.minPassengers, rate.maxPassengers)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {fixedRoutes.map((route) => (
              <tr key={route.from}>
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  {shortPlace(route.from)} ↔ {shortPlace(route.to)}
                </th>
                {fixedRates.map((rate) => (
                  <td key={rate.minPassengers} className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                    {p.totalFare(rate.totalEur)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">{p.fixedPriceNote}</p>
    </section>
  );
}
