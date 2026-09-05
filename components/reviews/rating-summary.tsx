import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fill, langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { REVIEW_READ } from "@/lib/site";
import type { RatingSummary } from "@/lib/content/schema";
import { GoogleWordmark, Stars, TripAdvisorOwl } from "@/components/trust/source-logos";

/**
 * The score panel.
 *
 * Only ever renders a number that exists. `summary` is null whenever nothing
 * in the set carries a real star value, and then the panel falls back to the
 * two platform links without a figure — which is the honest state for
 * TripAdvisor, whose star values we have never captured.
 *
 * The counts are stated per platform rather than pooled into one headline,
 * because pooling a rated set with an unrated one produces an average that
 * describes neither.
 */
export function RatingPanel({
  lang,
  summary,
  googleCount,
  tripadvisorCount,
  className = "",
}: {
  lang: Lang;
  summary: RatingSummary | null;
  googleCount: number;
  tripadvisorCount: number;
  className?: string;
}) {
  const ui = t(lang);

  return (
    <div
      className={`grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-3 ${className}`}
    >
      <div className="flex flex-col justify-center gap-2 bg-surface p-6">
        {summary ? (
          <>
            <p className="flex items-baseline gap-2">
              <span className="font-display text-4xl leading-none text-ink">
                {summary.average.toFixed(1)}
              </span>
              <span className="text-sm text-faint">/ 5</span>
            </p>
            <Stars value={summary.average} size={17} label={fill(ui.starsOutOf, { n: summary.average.toFixed(1) })} />
            <p className="text-xs text-muted">
              {reviewCountLabel(lang, summary.count)} · {ui.reviewsGoogle}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">{ui.verifiedNote}</p>
        )}
      </div>

      <PlatformTile
        href={REVIEW_READ.google}
        count={googleCount}
        label={ui.readOnGoogle}
        countLabel={ui.reviews}
        mark={<GoogleWordmark className="h-5 w-auto" />}
      />

      <PlatformTile
        href={REVIEW_READ.tripadvisor}
        count={tripadvisorCount}
        label={ui.readOnTripadvisor}
        countLabel={ui.reviews}
        mark={
          <span className="inline-flex items-center gap-2">
            <TripAdvisorOwl className="h-4 w-auto" />
            <span className="text-sm font-semibold tracking-tight text-[#08808a]">Tripadvisor</span>
          </span>
        }
      />
    </div>
  );
}

function PlatformTile({
  href,
  count,
  label,
  countLabel,
  mark,
}: {
  href: string;
  count: number;
  label: string;
  countLabel: string;
  mark: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      // nofollow on outbound review-platform links: these are navigational
      // for the reader, not endorsements we are passing equity to.
      rel="noopener noreferrer nofollow"
      className="group flex flex-col justify-between gap-4 bg-surface p-6 transition hover:bg-olive-50"
    >
      <span>{mark}</span>
      <span>
        <span className="block text-sm text-muted">
          {count} {countLabel}
        </span>
        <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
          {label}
          <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </span>
    </a>
  );
}

/** A compact one-line version for tour titles and the header strip. */
export function RatingInline({
  lang,
  summary,
  className = "",
  /** False inside another link (tour cards) so we do not nest `<a>`. */
  link = true,
}: {
  lang: Lang;
  summary: RatingSummary | null;
  className?: string;
  link?: boolean;
}) {
  if (!summary) return null;
  const ui = t(lang);
  const inner = (
    <>
      <Stars value={summary.average} size={14} label={fill(ui.starsOutOf, { n: summary.average.toFixed(1) })} />
      <span className="font-semibold text-ink">{summary.average.toFixed(1)}</span>
      <span>· {reviewCountLabel(lang, summary.count)}</span>
      <GoogleWordmark className="h-3.5 w-auto" />
    </>
  );
  const cls = `inline-flex items-center gap-2 text-sm text-muted ${link ? "hover:text-accent" : ""} ${className}`;
  if (!link) return <span className={cls}>{inner}</span>;
  return (
    <Link href={langPath(lang, "/reviews")} className={cls}>
      {inner}
    </Link>
  );
}

/**
 * The score strip that opens the embeddable review module on tour and
 * transfer pages. A number this large would be noise beside a title; it
 * belongs with the quotes themselves.
 */
export function RatingBanner({
  lang,
  summary,
  className = "",
}: {
  lang: Lang;
  summary: RatingSummary | null;
  className?: string;
}) {
  const ui = t(lang);
  if (!summary) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line bg-olive-50 px-6 py-5 ${className}`}>
      <p className="flex items-baseline gap-1.5">
        <span className="font-display text-5xl leading-none text-ink">
          {summary.average.toFixed(1)}
        </span>
        <span className="text-sm text-faint">/ 5</span>
      </p>
      <div className="min-w-0">
        <Stars value={summary.average} size={16} label={fill(ui.starsOutOf, { n: summary.average.toFixed(1) })} />
        <p className="mt-1.5 text-sm text-muted">
          {reviewCountLabel(lang, summary.count)} · {ui.reviewsGoogle}
        </p>
      </div>
      <GoogleWordmark className="ml-auto h-4 w-auto shrink-0" />
    </div>
  );
}

export function reviewCountLabel(lang: Lang, count: number): string {
  const ui = t(lang);
  return `${count} ${count === 1 ? ui.review : ui.reviews}`;
}
