import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { cn } from "@/lib/cn";
import type { Review } from "@/lib/content/schema";
import { ratingSummary } from "@/lib/content/load";
import { ReviewCard } from "@/components/reviews/review-card";
import { RatingBanner } from "@/components/reviews/rating-summary";
import {
  WriteReviewCta,
  type ExperienceOption,
} from "@/components/reviews/write-review-cta";

/**
 * The embeddable review block.
 *
 * Dropped onto tour pages, the transfers hub, each route page and the
 * wedding page. Quotes hide when the set is empty — an empty card frame
 * is worse than none — but the write-review form still renders, so a
 * tour nobody has reviewed yet is exactly where the CTA belongs.
 *
 * The cards live in a framed module rather than a three-column grid. Tour
 * pages place this block in the article column beside the booking widget,
 * where three columns leave a single review looking stranded. Container
 * queries open a second and third column only when the frame is actually
 * wide enough — the about page and the transfers hub, not a tour body.
 */
export function ReviewsSection({
  lang,
  reviews,
  title,
  limit = 3,
  className = "",
  experience,
  experiences,
}: {
  lang: Lang;
  reviews: Review[];
  title?: string;
  limit?: number;
  className?: string;
  experience?: string;
  experiences?: ExperienceOption[];
}) {
  const ui = t(lang);
  const shown = reviews.slice(0, limit);
  const summary = ratingSummary(reviews);
  const single = shown.length === 1;

  return (
    <section className={cn("@container mt-12", className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">{title ?? ui.reviewsForThis}</h2>
        <Link
          href={langPath(lang, "/reviews")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
        >
          {ui.reviewsAll}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {shown.length > 0 ? (
        <div className="overflow-hidden rounded-3xl bg-line shadow-[0_24px_50px_-32px_rgba(57,36,32,0.45)] ring-1 ring-line">
          <RatingBanner lang={lang} summary={summary} />
          <div
            className={
              single
                ? "grid"
                : "grid gap-px @4xl:grid-cols-2 @5xl:grid-cols-3"
            }
          >
            {shown.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                lang={lang}
                flush
                featured={single}
                clamp={!single}
              />
            ))}
          </div>
        </div>
      ) : null}

      {shown.length > 0 ? (
        <p className="mt-4 text-xs text-faint">{ui.verifiedNote}</p>
      ) : null}

      <WriteReviewCta
        lang={lang}
        experience={experience}
        experiences={experiences}
        className={shown.length > 0 ? "mt-6" : undefined}
      />
    </section>
  );
}
