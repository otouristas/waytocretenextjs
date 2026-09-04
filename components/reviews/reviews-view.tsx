import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { Review } from "@/lib/content/schema";
import { ratingSummary } from "@/lib/content/load";
import { GoogleWordmark, TripAdvisorOwl } from "@/components/trust/source-logos";
import { ReviewCard } from "@/components/reviews/review-card";
import { RatingPanel } from "@/components/reviews/rating-summary";

/**
 * The reviews page.
 *
 * Deliberately one URL rather than `/reviews`, `/reviews/google` and
 * `/reviews/tripadvisor`. Splitting by platform would put the same reviews
 * on two URLs, one a strict subset of the other, which is the near-duplicate
 * pattern this whole rebuild exists to avoid. Everything lives here, grouped
 * under its platform's own mark, and the jump list at the top does the work
 * a filter would.
 *
 * The wall is a CSS multi-column layout, not a grid: reviews vary from one
 * line to two hundred words and a grid would leave a ragged column of empty
 * cards. `break-inside-avoid` on the card keeps each one whole.
 */
export function ReviewsView({
  lang,
  reviews,
  tourIndex,
}: {
  lang: Lang;
  reviews: Review[];
  /** Slug → title, for the "reviews by experience" jump list. */
  tourIndex: Map<string, string>;
}) {
  const ui = t(lang);

  const google = reviews.filter((r) => r.source === "Google");
  const tripadvisor = reviews.filter((r) => r.source === "TripAdvisor");
  const direct = reviews.filter((r) => r.source === "Direct");

  // Which tours guests actually wrote about, most-reviewed first. Nine of
  // the twenty-one have no review yet and simply do not appear.
  const byTour = new Map<string, Review[]>();
  for (const review of reviews) {
    if (!review.tour || !tourIndex.has(review.tour)) continue;
    const bucket = byTour.get(review.tour);
    if (bucket) bucket.push(review);
    else byTour.set(review.tour, [review]);
  }
  const tourCounts = [...byTour.entries()].sort((a, b) => b[1].length - a[1].length);

  const transfers = reviews.filter((r) => r.service === "transfer");
  const weddings = reviews.filter((r) => r.service === "wedding");

  return (
    <div>
      <section className="pattern-olive border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-olive">
            {ui.trustLine}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl text-earth md:text-5xl">
            {ui.reviewsTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">{ui.reviewsLead}</p>

          <RatingPanel
            lang={lang}
            summary={ratingSummary(reviews)}
            googleCount={google.length}
            tripadvisorCount={tripadvisor.length}
            className="mt-10"
          />
        </div>
      </section>

      {/* What guests reviewed. This is the block that turns a testimonial
          page into a navigational one: a reader deciding between Samaria and
          Imbros can get straight to the words about the one they mean. */}
      {(tourCounts.length > 0 || transfers.length > 0) && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-2xl text-earth">{ui.reviewsForThis}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {tourCounts.map(([slug, list]) => (
              <li key={slug}>
                <Link
                  href={langPath(lang, `/tours/${slug}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-earth ring-1 ring-line transition hover:bg-olive-50 hover:ring-olive-200"
                >
                  {tourIndex.get(slug)}
                  <span className="text-xs text-faint">{list.length}</span>
                </Link>
              </li>
            ))}
            {transfers.length > 0 ? (
              <li>
                <Link
                  href={langPath(lang, "/transfers")}
                  className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-earth ring-1 ring-line transition hover:bg-olive-50 hover:ring-olive-200"
                >
                  {ui.navTransfers}
                  <span className="text-xs text-faint">{transfers.length}</span>
                </Link>
              </li>
            ) : null}
            {weddings.length > 0 ? (
              <li>
                <Link
                  href={langPath(lang, "/transfers/weddings")}
                  className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-earth ring-1 ring-line transition hover:bg-olive-50 hover:ring-olive-200"
                >
                  {ui.weddingTransfers}
                  <span className="text-xs text-faint">{weddings.length}</span>
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      )}

      <SourceWall
        id="google"
        mark={<GoogleWordmark className="h-6 w-auto" />}
        reviews={google}
        lang={lang}
        tourIndex={tourIndex}
        emptyLabel={ui.reviewsEmpty}
      />

      <SourceWall
        id="tripadvisor"
        mark={
          <span className="inline-flex items-center gap-2.5">
            <TripAdvisorOwl className="h-5 w-auto" />
            <span className="text-xl font-semibold tracking-tight text-[#08808a]">Tripadvisor</span>
          </span>
        }
        reviews={tripadvisor}
        lang={lang}
        tourIndex={tourIndex}
        emptyLabel={ui.reviewsEmpty}
        tone="tinted"
      />

      {direct.length > 0 ? (
        <SourceWall
          id="direct"
          mark={<span className="font-display text-xl text-earth">{ui.travellerTips}</span>}
          reviews={direct}
          lang={lang}
          tourIndex={tourIndex}
          emptyLabel={ui.reviewsEmpty}
        />
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-earth px-6 py-8 text-surface">
          <p className="max-w-md text-sm leading-relaxed text-sand-200/90">{ui.contactLead}</p>
          <Link
            href={langPath(lang, "/tours")}
            className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-6 py-3 text-sm font-semibold text-earth transition hover:bg-surface"
          >
            {ui.viewAll}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function SourceWall({
  id,
  mark,
  reviews,
  lang,
  tourIndex,
  emptyLabel,
  tone = "plain",
}: {
  id: string;
  mark: React.ReactNode;
  reviews: Review[];
  lang: Lang;
  tourIndex: Map<string, string>;
  emptyLabel: string;
  tone?: "plain" | "tinted";
}) {
  return (
    <section
      id={id}
      className={tone === "tinted" ? "border-y border-line pattern-olive" : undefined}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 flex items-center gap-4">
          {mark}
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs text-faint">{reviews.length}</span>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-muted">{emptyLabel}</p>
        ) : (
          <div className="gap-4 [column-fill:balance] sm:columns-2 lg:columns-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                lang={lang}
                context={
                  review.tour && tourIndex.has(review.tour)
                    ? { slug: review.tour, title: tourIndex.get(review.tour)! }
                    : null
                }
                className="mb-4"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
