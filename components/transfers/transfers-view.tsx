import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Baby,
  Check,
  Clock,
  CreditCard,
  Heart,
  Luggage,
  MapPin,
  PlaneLanding,
  Users,
  X,
} from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { transfersCopy } from "@/lib/i18n/transfers";
import type { Review } from "@/lib/content/schema";
import {
  estimateRoute,
  routeDuration,
  shortPlace,
  transfers,
  transferRoutes,
  type TransferRoute,
} from "@/lib/transfers";
import { TransferForm } from "@/components/transfers/transfer-form";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { reviewExperienceOptions } from "@/lib/reviews/experiences";

/**
 * The transfers hub.
 *
 * Rebuilt from a two-column "prose beside a form" page into something that
 * states the product. The old page had three problems it could not answer
 * its way out of: it never showed a fare or a distance, so a guest could not
 * tell whether a transfer was €30 or €300; it hid the nine routes we
 * actually drive inside a paragraph; and it pointed the one paying customer
 * off to waytocrete.com before the form.
 *
 * Everything except the request form is server-rendered.
 */
export function TransfersView({ lang, reviews }: { lang: Lang; reviews: Review[] }) {
  const p = transfersCopy(lang);
  const ui = t(lang);
  const data = transfers();
  const routes = transferRoutes();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="relative h-[42vh] min-h-72 w-full">
          <Image
            src={data.vehicle.hero}
            alt={data.vehicle.description}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-earth-900/92 via-earth-900/55 to-earth-900/20" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-6xl px-4 pb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-paper">
                {p.kicker}
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl text-paper md:text-5xl">
                {p.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/90 md:text-base">
                {p.lead}
              </p>
            </div>
          </div>
        </div>

        {/* The four facts a guest checks before enquiring, taken straight
            from the booking engine's own configuration. */}
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-line lg:grid-cols-4">
          <Fact icon={<Users className="size-4" />} term={ui.transferVehicle} value={`${data.vehicle.passengers} ${ui.guests.toLowerCase()}`} />
          <Fact icon={<Luggage className="size-4" />} term="Bags" value={String(data.vehicle.bags)} />
          <Fact icon={<Clock className="size-4" />} term="Pickups" value={data.booking.pickupTimes.replace(/,.*$/, "")} />
          <Fact icon={<Baby className="size-4" />} term={ui.transferExtras} value={data.extras[0]?.label ?? "—"} />
        </ul>
      </section>

      {/* ── routes ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-3xl text-ink">{ui.transferRoutesTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{ui.transferRoutesLead}</p>
        </div>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <li key={route.slug}>
              <RouteCard route={route} lang={lang} />
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-faint">{ui.transferEstimateNote}</p>
      </section>

      {/* ── coverage ────────────────────────────────────────────────────── */}
      <section className="border-y border-line pattern-olive">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-ink">{ui.transferCoverage}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{data.coverage.statement}</p>
            <ul className="mt-6 grid gap-2.5">
              {p.weDo.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-surface p-6 ring-1 ring-line md:p-7">
            <h3 className="font-display text-xl text-ink">{ui.transferNotCovered}</h3>
            <ul className="mt-4 grid gap-2.5">
              {data.coverage.excluded.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-muted">
                  <X className="mt-0.5 size-4 shrink-0 text-clay" />
                  {item}
                </li>
              ))}
            </ul>
            {/* Stated up front rather than discovered after an enquiry. The
                exclusion is a hard operating limit, not a preference. */}
            {data.coverage.note ? (
              <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-faint">
                {data.coverage.note}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── weddings ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Link
          href={langPath(lang, "/transfers/weddings")}
          className="group grid gap-8 overflow-hidden rounded-2xl bg-earth p-8 text-paper transition hover:bg-earth-deep md:grid-cols-[1fr_auto] md:items-center md:p-10"
        >
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper">
              <Heart className="size-3.5" />
              {ui.weddingTransfers}
            </p>
            <h2 className="mt-3 font-display text-3xl text-paper">{p.weddingHeading}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/90">
              {data.weddings.positioning}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-olive px-6 py-3 text-sm font-semibold text-paper md:self-auto">
            {p.weddingCta}
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      {/* ── vehicle, price rules and the form ───────────────────────────── */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <div>
          <h2 className="font-display text-3xl text-ink">{ui.transferVehicle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{data.vehicle.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.vehicle.gallery.slice(0, 4).map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-line">
                <Image src={src} alt="" fill sizes="(min-width: 640px) 22vw, 45vw" className="object-cover" />
              </div>
            ))}
          </div>

          {data.vehicle.note ? (
            <p className="mt-4 text-xs leading-relaxed text-faint">{data.vehicle.note}</p>
          ) : null}

          <h3 className="mt-10 font-display text-2xl text-ink">{ui.transferPayment}</h3>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line sm:grid-cols-2">
            {data.pricing.perKmRates.map((rate) => (
              <PriceRow
                key={`${rate.minPassengers}-${rate.maxPassengers}`}
                term={`${rate.minPassengers}–${rate.maxPassengers} ${ui.guests.toLowerCase()}`}
                value={`€${rate.eurPerKm.toFixed(2)} / km`}
              />
            ))}
            <PriceRow term="Minimum" value={`€${data.pricing.minimumOrderEur} · ${data.pricing.minimumDistanceKm} km`} />
            <PriceRow term={ui.transferPayment} value={data.pricing.paymentMethods.join(", ")} />
          </dl>

          {data.extras.length > 0 ? (
            <ul className="mt-6 grid gap-2.5">
              {data.extras.map((extra) => (
                <li key={extra.label} className="flex gap-2.5 text-sm text-muted">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>
                    <span className="font-semibold text-ink">{extra.label}</span> — {extra.description}
                    {extra.priceEur === 0 ? ", free of charge" : ` · €${extra.priceEur}`}
                    {extra.maxQuantity ? `, up to ${extra.maxQuantity}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <TransferForm lang={lang} />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <ReviewsSection
          lang={lang}
          reviews={reviews}
          title={p.reviewsTitle}
          experiences={reviewExperienceOptions(lang)}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────── pieces ────────────────────────────── */

export function RouteCard({ route, lang }: { route: TransferRoute; lang: Lang }) {
  const ui = t(lang);
  const estimate = estimateRoute(route);
  const airport = /airport/i.test(route.from) || /airport/i.test(route.to);

  return (
    <Link
      href={langPath(lang, `/transfers/${route.slug}`)}
      className="group flex h-full flex-col rounded-2xl bg-surface p-5 ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(57,36,32,0.45)] hover:ring-olive-200"
    >
      <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
        {airport ? <PlaneLanding className="size-3.5" /> : <MapPin className="size-3.5" />}
        {airport ? "Airport" : "Regional"}
      </span>

      <h3 className="mt-3 font-display text-lg leading-snug text-ink">
        {shortPlace(route.from)}
        <span className="mx-1.5 text-faint">→</span>
        {shortPlace(route.to)}
      </h3>

      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span>
          <dt className="inline text-faint">{ui.transferDistance}: </dt>
          <dd className="inline font-semibold text-ink">{route.distanceKm} km</dd>
        </span>
        <span>
          <dt className="inline text-faint">{ui.transferDuration}: </dt>
          <dd className="inline font-semibold text-ink">{routeDuration(route.durationMinutes)}</dd>
        </span>
      </dl>

      <span className="mt-auto flex items-end justify-between gap-3 pt-5">
        {estimate ? (
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
              {ui.transferEstimate}
            </span>
            <span className="font-display text-xl text-ink">
              €{estimate.low}–{estimate.high}
            </span>
          </span>
        ) : (
          <span className="font-display text-lg text-ink">{ui.onRequest}</span>
        )}
        <ArrowRight className="mb-1 size-4 shrink-0 text-accent transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Fact({ icon, term, value }: { icon: React.ReactNode; term: string; value: string }) {
  return (
    <li className="bg-surface px-5 py-4">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
        <span className="text-accent">{icon}</span>
        {term}
      </p>
      <p className="mt-1 truncate font-semibold text-ink">{value}</p>
    </li>
  );
}

function PriceRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-surface px-4 py-3">
      <dt className="flex items-center gap-2 text-xs text-faint">
        <CreditCard className="size-3.5 text-accent" />
        {term}
      </dt>
      <dd className="text-right text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
