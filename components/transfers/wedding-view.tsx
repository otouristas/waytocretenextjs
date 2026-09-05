import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Heart, MapPin } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { transfersCopy } from "@/lib/i18n/transfers";
import type { Review } from "@/lib/content/schema";
import { transfers } from "@/lib/transfers";
import { TransferForm } from "@/components/transfers/transfer-form";
import { ReviewsSection } from "@/components/reviews/reviews-section";

/**
 * Wedding transfers.
 *
 * This existed on waytocrete.com as a full page and here as a single
 * checkbox on the transfer form, which is why nobody could find it. The
 * content model already carried everything it needs — services, typical
 * routes, the planning process, its own FAQs — under `weddings` in
 * content/transfers.json; none of it had a page to sit on.
 *
 * No price is shown, because none is published. The page says so plainly
 * rather than showing a "from" figure that would be invented.
 */
export function WeddingTransfersView({ lang, reviews }: { lang: Lang; reviews: Review[] }) {
  const ui = t(lang);
  const p = transfersCopy(lang);
  const data = transfers();
  const w = data.weddings;

  return (
    <div>
      <section className="relative border-b border-line">
        <div className="relative h-[40vh] min-h-64 w-full">
          <Image
            src={data.vehicle.gallery[0] ?? data.vehicle.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-earth-900/94 via-earth-900/60 to-earth-900/25" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-6xl px-4 pb-10">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-paper">
                <Heart className="size-3.5" />
                {p.weddingKicker}
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl text-paper md:text-5xl">
                {p.weddingHeading}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/90 md:text-base">
                {p.weddingLead}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="max-w-3xl text-lg leading-relaxed text-ink">{w.positioning}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(0,24rem)]">
          <div>
            <h2 className="font-display text-2xl text-ink">{p.weddingWhatTitle}</h2>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {w.services.map((service) => (
                <li key={service} className="flex gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  {service}
                </li>
              ))}
            </ul>

            <h2 className="mt-12 font-display text-2xl text-ink">{p.weddingRoutesTitle}</h2>
            <ol className="mt-5 grid gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line">
              {w.typicalRoutes.map((item) => (
                <li
                  key={item.route}
                  className="flex flex-wrap items-center justify-between gap-2 bg-surface px-5 py-4"
                >
                  <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-ink">
                    <MapPin className="size-4 shrink-0 text-accent" />
                    {item.route}
                  </span>
                  <span className="text-xs text-faint">{item.when}</span>
                </li>
              ))}
            </ol>

            <h2 className="mt-12 font-display text-2xl text-ink">{p.weddingProcessTitle}</h2>
            <ol className="mt-5 grid gap-4">
              {w.process.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-olive text-xs font-semibold text-paper">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed text-muted">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <Note title={p.weddingPriceTitle} body={w.priceNote} />
              <Note title={ui.transferVehicle} body={w.vehicleNote} />
            </div>

            {/* The coverage limit again, in full, because a venue in the
                wrong regional unit is the one thing that makes the whole
                plan impossible — and a couple needs to know before they
                book the venue, not after. */}
            <div className="mt-4 rounded-2xl bg-surface p-6 text-sm leading-relaxed text-muted ring-1 ring-line">
              <h3 className="font-display text-lg text-ink">{ui.transferCoverage}</h3>
              <p className="mt-2">{w.coverageNote}</p>
            </div>

            {w.faqs.length > 0 ? (
              <section className="mt-12">
                <h2 className="font-display text-2xl text-ink">{ui.faq}</h2>
                <div className="mt-4 divide-y divide-line border-y border-line">
                  {w.faqs.map((faq) => (
                    <details key={faq.q} className="group py-4">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-ink marker:content-['']">
                        {faq.q}
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-olive-50 text-accent transition group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}

            <ReviewsSection
              lang={lang}
              reviews={reviews}
              title={p.reviewsTitle}
              experience={ui.weddingTransfers}
            />
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <TransferForm lang={lang} wedding title={p.weddingFormTitle} />
            <p className="mt-4 rounded-xl bg-surface p-4 text-xs leading-relaxed text-faint ring-1 ring-line">
              {w.enquiryFields.join(" · ")}
            </p>
            <Link
              href={langPath(lang, "/transfers")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
            >
              {p.routeBackToAll}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-surface p-6 ring-1 ring-line">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
