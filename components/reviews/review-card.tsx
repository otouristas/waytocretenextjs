import Link from "next/link";
import { fill, langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { cn } from "@/lib/cn";
import type { Review } from "@/lib/content/schema";
import { SourceMark, Stars } from "@/components/trust/source-logos";

/**
 * One review.
 *
 * Marked up as a `<figure>` with the attribution in `<figcaption>`, so the
 * quote and the person who wrote it are associated for a screen reader
 * rather than being two adjacent blocks of text.
 *
 * The star row appears only when the review carries a real numeric rating.
 * Most do now — the Google Business Profile export has them — but the
 * TripAdvisor and WordPress-carousel entries do not, and drawing five stars
 * on those would be inventing the number all over again.
 */
export function ReviewCard({
  review,
  lang,
  /** The tour this review names, when the surrounding page is not that tour. */
  context,
  className = "",
  /** Full-bleed cell inside the framed tour module — no ring of its own. */
  flush = false,
  /** Larger type and a pull-quote mark, used when this is the only review. */
  featured = false,
  /** Tour embeds clamp long quotes; the reviews wall shows them in full. */
  clamp = false,
}: {
  review: Review;
  lang: Lang;
  context?: { title: string; slug: string } | null;
  className?: string;
  flush?: boolean;
  featured?: boolean;
  clamp?: boolean;
}) {
  const ui = t(lang);
  const quote = review.text.trim();

  return (
    <figure
      className={cn(
        "flex break-inside-avoid flex-col self-stretch",
        flush
          ? "bg-raised p-6 sm:p-7"
          : "rounded-2xl bg-raised p-6 shadow-[0_18px_40px_-28px_rgba(57,36,32,0.35)] ring-1 ring-line",
        featured && "sm:p-8",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={cn(
              "select-none font-script leading-none text-gold",
              featured ? "text-5xl" : "text-4xl",
            )}
          >
            “
          </span>
          {typeof review.rating === "number" ? (
            <Stars
              value={review.rating}
              size={featured ? 16 : 15}
              label={fill(ui.starsOutOf, { n: review.rating })}
            />
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              {review.source === "Direct" ? ui.travellerTip : review.source}
            </span>
          )}
        </div>
        <SourceMark source={review.source} className="h-4 w-auto shrink-0" />
      </div>

      <blockquote
        className={cn(
          "flex-1 leading-relaxed text-earth/80",
          featured ? "text-base sm:text-lg" : "text-sm",
          clamp ? "line-clamp-7 min-h-0" : "whitespace-pre-line",
        )}
        // Reviews are written in the guest's own language; the page around
        // them may be in another. Without this a screen reader in English
        // pronounces the German ones as English.
        lang={review.lang}
      >
        {quote}
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
        <AuthorMark name={review.author} />
        <div className="min-w-0 text-xs">
          <p className="truncate font-semibold text-earth">{review.author}</p>
          {review.sourceUrl ? (
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-faint underline decoration-line hover:text-olive-deep"
            >
              {review.source}
            </a>
          ) : (
            <span className="text-faint">{review.source}</span>
          )}
          {context ? (
            <Link
              href={langPath(lang, `/tours/${context.slug}`)}
              className="mt-0.5 block truncate text-olive-deep hover:text-olive"
            >
              {context.title}
            </Link>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

const AVATAR_TONES = [
  "bg-olive-100 text-olive-800",
  "bg-earth-100 text-earth",
  "bg-sand-300 text-earth",
  "bg-olive-50 text-olive-deep",
] as const;

function AuthorMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-semibold tracking-wide",
        AVATAR_TONES[toneIndex(name)],
      )}
    >
      {initials(name)}
    </span>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
}

function toneIndex(name: string): number {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i) * (i + 1);
  return n % AVATAR_TONES.length;
}
