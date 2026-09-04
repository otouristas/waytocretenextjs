import Link from "next/link";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { Review, TourCopy, TourCore } from "@/lib/content/schema";
import { SISTER_BRAND, sisterUrl } from "@/lib/site";
import { TourHeroMosaic } from "@/components/tour/hero-mosaic";
import { priceFrom } from "@/lib/pricing";
import { BookingWidget } from "@/components/tour/booking-widget";
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
}: {
  core: TourCore;
  copy: TourCopy;
  lang: Lang;
  related: Array<{ slug: string; title: string; hero: string }>;
  linkablePlaces: ReadonlySet<string>;
  reviews: Review[];
}) {
  const ui = t(lang);
  const live = liveBooker(core.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <nav aria-label={ui.breadcrumb} className="text-xs text-muted">
        <Link href={langPath(lang)} className="hover:text-olive-deep">
          {ui.home}
        </Link>
        <span className="px-1.5 text-faint">/</span>
        <Link href={langPath(lang, "/tours")} className="hover:text-olive-deep">
          {ui.navTours}
        </Link>
        <span className="px-1.5 text-faint">/</span>
        <span className="text-ink">{copy.title}</span>
      </nav>

      <div className="mt-4">
        <TourHeroMosaic
          images={[core.hero, ...core.gallery.filter((src) => src !== core.hero)]}
          alt={copy.title}
        />
      </div>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_360px]">
        <article>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-olive">
            {ui.categories[core.category as keyof typeof ui.categories] ?? core.category}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-earth md:text-[2.75rem]">
            {copy.title}
          </h1>
          {copy.tagline ? (
            <p className="mt-3 text-lg leading-relaxed text-muted">{copy.tagline}</p>
          ) : null}

          {/* The score sits with the title rather than only beside the
              reviews further down: it is a decision input, and by the time a
              reader reaches the review block they have already decided. */}
          <RatingInline lang={lang} summary={ratingSummary(reviews)} className="mt-3" />

          <div className="mt-6">
            <QuickFacts core={core} lang={lang} />
          </div>

          {/* The answer-first summary. Deliberately the first prose on the
              page: it is what an answer engine quotes, and what a skimming
              reader needs before anything else. */}
          <p className="mt-8 text-base leading-relaxed text-ink">{copy.summary}</p>

          {copy.highlights.length > 0 ? (
            <ul className="mt-6 grid gap-2 rounded-xl bg-olive-50 p-5 sm:grid-cols-2">
              {copy.highlights.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-olive-900">
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

          <ReviewsSection lang={lang} reviews={reviews} title={ui.reviewsForThis} />

          {/*
            The contextual link to the sister site. In-content and topically
            matched — their page about this same route — rather than a sitewide
            footer link, which is the pattern that reads as a link scheme.
          */}
          <p className="mt-12 rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted ring-1 ring-line">
            {ui.storyHint}{" "}
            <a
              className="font-semibold text-olive-deep underline"
              href={sisterUrl(core.wpSlug)}
              rel="noopener"
            >
              {ui.storyLink} — {SISTER_BRAND}
            </a>
          </p>

          <RelatedTours lang={lang} tours={related} />
        </article>

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
            priceNote={copy.priceNote}
            live={live}
          />
        </div>
      </div>

      <MobileBookBar
        lang={lang}
        priceFrom={priceFrom(core.price)}
        onRequestLabel={core.price.kind === "on_request"}
        bookHref={live ? catalogUrl(live.serviceId, live.categoryId) : null}
      />
    </div>
  );
}
