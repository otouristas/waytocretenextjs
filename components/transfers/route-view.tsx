import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Baby, Check, Clock, PlaneLanding, Route as RouteIcon, Users } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { transfersCopy } from "@/lib/i18n/transfers";
import type { Review } from "@/lib/content/schema";
import {
  estimateRoute,
  otherRoutes,
  routeDuration,
  shortPlace,
  transfers,
  type TransferRoute,
} from "@/lib/transfers";
import { TransferForm } from "@/components/transfers/transfer-form";
import { RouteCard } from "@/components/transfers/transfers-view";
import { ReviewsSection } from "@/components/reviews/reviews-section";

/**
 * One origin-pair page, e.g. /transfers/chania-airport-to-rethymno.
 *
 * These exist because "chania airport to rethymno" is a query people type
 * and a page nobody local has written well. The page answers the query in
 * its first screen — distance, drive time, what the meter comes to — and
 * only then asks for the booking.
 *
 * The fare is always a range and always labelled an estimate: the operator
 * publishes no flat fare for any route, and the booking form's meter is the
 * only binding quote.
 */
export function RouteView({
  route,
  lang,
  reviews,
}: {
  route: TransferRoute;
  lang: Lang;
  reviews: Review[];
}) {
  const ui = t(lang);
  const p = transfersCopy(lang);
  const data = transfers();
  const estimate = estimateRoute(route);
  const from = shortPlace(route.from);
  const to = shortPlace(route.to);
  const duration = routeDuration(route.durationMinutes);
  const airport = /airport/i.test(route.from) || /airport/i.test(route.to);
  const others = otherRoutes(route.slug, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <nav aria-label={ui.breadcrumb} className="text-xs text-muted">
        <Link href={langPath(lang)} className="hover:text-olive-deep">
          {ui.home}
        </Link>
        <span className="px-1.5 text-faint">/</span>
        <Link href={langPath(lang, "/transfers")} className="hover:text-olive-deep">
          {ui.navTransfers}
        </Link>
        <span className="px-1.5 text-faint">/</span>
        <span className="text-ink">
          {from} → {to}
        </span>
      </nav>

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,24rem)]">
        <article>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-olive">
            {airport ? <PlaneLanding className="size-3.5" /> : <RouteIcon className="size-3.5" />}
            {p.kicker}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-earth md:text-[2.75rem]">
            {p.routeHeading(from, to)}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            {p.routeLead(from, to, duration)}
          </p>

          {/* The fact strip. Marked up as a definition list because this is
              the block an answer engine lifts for "how far is Chania airport
              from Rethymno" — a question the page should win outright. */}
          <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line sm:grid-cols-4">
            <Fact icon={<RouteIcon className="size-4" />} term={ui.transferDistance} value={`${route.distanceKm} km`} />
            <Fact icon={<Clock className="size-4" />} term={ui.transferDuration} value={duration} />
            <Fact
              icon={<Users className="size-4" />}
              term={ui.transferVehicle}
              value={`${data.vehicle.passengers} ${ui.guests.toLowerCase()}`}
            />
            <Fact
              icon={<Baby className="size-4" />}
              term={ui.transferExtras}
              value={data.extras[0]?.priceEur === 0 ? "Free" : "—"}
            />
          </dl>

          <div className="mt-8 rounded-2xl bg-olive-50 p-6 ring-1 ring-olive-200">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-olive-deep">
              {ui.transferEstimate}
            </p>
            {estimate ? (
              <>
                <p className="mt-1 font-display text-3xl text-earth">
                  €{estimate.low}
                  <span className="text-faint">–</span>
                  {estimate.high}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-olive-900">
                  {data.pricing.perKmRates
                    .map(
                      (rate) =>
                        `€${rate.eurPerKm.toFixed(2)}/km for ${rate.minPassengers}–${rate.maxPassengers}`,
                    )
                    .join(" · ")}
                  {estimate.atMinimum
                    ? `. This route is under the ${data.pricing.minimumDistanceKm} km minimum, so it bills at the minimum.`
                    : ""}
                </p>
              </>
            ) : (
              <p className="mt-1 font-display text-2xl text-earth">{ui.onRequest}</p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-olive-900/70">
              {ui.transferEstimateNote}
            </p>
          </div>

          <h2 className="mt-10 font-display text-2xl text-earth">{ui.transferExtras}</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {p.weDo.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-ink">
                <Check className="mt-0.5 size-4 shrink-0 text-olive" />
                {item}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl text-earth">{ui.transferVehicle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{data.vehicle.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[data.vehicle.hero, ...data.vehicle.gallery].slice(0, 3).map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-line">
                <Image src={src} alt="" fill sizes="(min-width: 640px) 22vw, 45vw" className="object-cover" />
              </div>
            ))}
          </div>

          <ReviewsSection lang={lang} reviews={reviews} title={p.reviewsTitle} />

          {others.length > 0 ? (
            <section className="mt-12">
              <h2 className="font-display text-2xl text-earth">{p.routeOther}</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                {others.map((other) => (
                  <li key={other.slug}>
                    <RouteCard route={other} lang={lang} />
                  </li>
                ))}
              </ul>
              <Link
                href={langPath(lang, "/transfers")}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-deep hover:text-olive"
              >
                {p.routeBackToAll}
                <ArrowRight className="size-4" />
              </Link>
            </section>
          ) : null}
        </article>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <TransferForm
            lang={lang}
            preset={{ pickup: route.from, dropoff: route.to }}
            title={ui.transferBook}
          />
        </div>
      </div>
    </div>
  );
}

function Fact({ icon, term, value }: { icon: React.ReactNode; term: string; value: string }) {
  return (
    <div className="bg-surface px-4 py-3.5">
      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
        <span className="text-olive">{icon}</span>
        {term}
      </dt>
      <dd className="mt-1 font-semibold text-earth">{value}</dd>
    </div>
  );
}
