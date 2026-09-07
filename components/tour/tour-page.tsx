import Link from "next/link";
import { Eye } from "lucide-react";
import { fill, langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { plannerCopy } from "@/lib/i18n/planner";
import { PLANNER_STOPS } from "@/lib/planner/catalog";
import { tourIsOpen, type Review, type TourCopy, type TourCore } from "@/lib/content/schema";
import { SISTER_BRAND, sisterUrl } from "@/lib/site";
import { TourHeroMosaic } from "@/components/tour/hero-mosaic";
import { priceFrom } from "@/lib/pricing";
import type { Crumb } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BookingWidget } from "@/components/tour/booking-widget";
import { PriceBand } from "@/components/tour/price-band";
import { MobileBookBar } from "@/components/tour/mobile-book-bar";
import { catalogUrl, liveBooker } from "@/lib/travelotopos";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { RatingInline } from "@/components/reviews/rating-summary";
import { ratingSummary } from "@/lib/content/load";
import {
  FaqList,
  IncludedExcluded,
  ItineraryTimeline,
  PackingLists,
  QuickFacts,
  RelatedTours,
} from "@/components/tour/sections";

/**
 * The tour detail page.
 *
 * A server component end to end; the only client island is the booking
 * widget. The previous implementation made the whole page `"use client"` for
 * the sake of one form, which shipped the catalogue and the icon set to every
 * visitor before they could read a word.
 */
export function TourPage({
  core,
  copy,
  lang,
  related,
  linkablePlaces,
  reviews,
  browsing,
  fewDates,
  crumbs,
}: {
  core: TourCore;
  copy: TourCopy;
  lang: Lang;
  related: Array<{ slug: string; title: string; hero: string }>;
  linkablePlaces: ReadonlySet<string>;
  reviews: Review[];
  browsing: number | null;
  fewDates: boolean;
  /** Built by the route, so the trail and its JSON-LD come from one array. */
  crumbs: Crumb[];
}) {
  const ui = t(lang);
  const live = liveBooker(core.slug);
  const open = tourIsOpen(core);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <Breadcrumbs crumbs={crumbs} lang={lang} />

      <div className="mt-4">
        <TourHeroMosaic
          images={[core.hero, ...core.gallery.filter((src) => src !== core.hero)]}
          alt={copy.title}
        />
      </div>

      <div className={open ? "mt-8 grid items-start gap-10 lg:grid-cols-[1fr_360px]" : "mt-8"}>
        <article>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {ui.categories[core.category as keyof typeof ui.categories] ?? core.category}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-ink md:text-[2.75rem]">
            {copy.title}
          </h1>
          {copy.tagline ? (
            <p className="mt-3 text-lg leading-relaxed text-muted">{copy.tagline}</p>
          ) : null}

          <RatingInline lang={lang} summary={ratingSummary(reviews)} className="mt-3" />

          {!open ? (
            <div className="mt-6 rounded-xl bg-olive-50 p-5 ring-1 ring-olive-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                {ui.temporarilyUnavailable}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">{ui.unavailableLead}</p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2 text-xs text-accent">
              <li className="rounded-full bg-olive-50 px-2.5 py-1">
                {core.privateOnly ? ui.privateDeparture : fill(ui.onlySeats, { n: core.groupMax })}
              </li>
              {fewDates ? (
                <li className="rounded-full bg-olive-50 px-2.5 py-1">{ui.fewDates}</li>
              ) : null}
              {browsing ? (
                <li className="inline-flex items-center gap-1 rounded-full bg-olive-50 px-2.5 py-1">
                  <Eye className="size-3" />
                  {fill(ui.browsingNow, { n: browsing })}
                </li>
              ) : null}
            </ul>
          )}

          <div className="mt-6">
            <QuickFacts core={core} lang={lang} />
          </div>

          {/* Gallery, title, facts, price. The number used to appear only in
              the sidebar, which on a phone lands below the whole itinerary —
              last, when it is the first thing most visitors look for. */}
          {open ? <PriceBand core={core} lang={lang} /> : null}

          <p className="mt-8 text-base leading-relaxed text-ink">{copy.summary}</p>

          {core.durationMinutes < 1440 ? (
            <p className="mt-6">
              <Link
                href={customDayHref(lang, core.places)}
                className="text-sm font-semibold text-accent hover:text-accent"
              >
                {plannerCopy(lang).buildDifferent}
              </Link>
            </p>
          ) : null}

          {copy.highlights.length > 0 ? (
            <ul className="mt-6 grid gap-2 rounded-xl bg-olive-50 p-5 sm:grid-cols-2">
              {copy.highlights.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-accent">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-olive" />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}

          {copy.overview.map((para, i) => (
            <p key={i} className="mt-4 leading-relaxed text-muted">
              {para}
            </p>
          ))}

          <ItineraryTimeline
            itinerary={copy.itinerary}
            lang={lang}
            title={ui.itinerary}
            linkablePlaces={linkablePlaces}
          />
          <IncludedExcluded included={copy.included} excluded={copy.excluded} lang={lang} />
          <PackingLists wear={copy.whatToWear} bring={copy.whatToBring} lang={lang} />
          <FaqList faqs={copy.faqs} title={ui.faq} />

          <ReviewsSection
            lang={lang}
            reviews={reviews}
            title={ui.reviewsForThis}
            experience={copy.title}
          />

          <p className="mt-12 rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted ring-1 ring-line">
            {ui.storyHint}{" "}
            <a
              className="font-semibold text-accent underline"
              href={sisterUrl(core.wpSlug)}
              rel="noopener"
            >
              {ui.storyLink} — {SISTER_BRAND}
            </a>
          </p>

          <RelatedTours lang={lang} tours={related} />
        </article>

        {open ? (
          <div className="lg:sticky lg:top-28">
            <BookingWidget
              slug={core.slug}
              title={copy.title}
              lang={lang}
              price={core.price}
              groupMin={core.groupMin}
              groupMax={core.groupMax}
              cancelFreeHours={core.cancelFreeHours}
              thirdPartyCosts={core.thirdPartyCosts}
              privateGuide={core.privateGuide}
              photoshoot={core.photoshoot}
              priceNote={copy.priceNote}
              live={live}
            />
          </div>
        ) : null}
      </div>

      {open ? (
        <MobileBookBar
          lang={lang}
          priceFrom={priceFrom(core.price)}
          onRequestLabel={core.price.kind === "on_request"}
          bookHref={live ? catalogUrl(live.serviceId, live.categoryId) : null}
        />
      ) : null}
    </div>
  );
}

function customDayHref(lang: Lang, places: readonly string[]): string {
  const stops = places
    .map((place) => PLANNER_STOPS.find((s) => s.place === place || s.slug === place))
    .filter((s): s is (typeof PLANNER_STOPS)[number] => !!s);
  const unique = [...new Map(stops.map((s) => [s.slug, s])).values()];
  const qs = unique.length
    ? `?s=${unique.map((s) => `${s.slug}:${s.suggestedStayMin}`).join(",")}`
    : "";
  return langPath(lang, `/create${qs}`);
}
