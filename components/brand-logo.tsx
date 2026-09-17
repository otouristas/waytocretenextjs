import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { BRAND } from "@/lib/site";

/**
 * The brand mark: the Cretan with the stick and bedroll, and the wordmark
 * stacked beside him.
 *
 * Two files per lockup, not one filtered file. The art is two-tone — earth
 * mascot, pine wordmark — and `brightness-0 invert`, which is what used to
 * carry it into dark mode, collapses both tones into the same flat white and
 * throws the brand green out with them. The dark art mirrors the light one
 * tone for tone instead: the mascot in paper, at the same 12.3:1 it has on
 * paper in light mode, and the wordmark in pine lifted 38% toward paper —
 * 4.9:1 on the header's earth surface, 5.9:1 on the footer's, the greenest
 * mix that clears AA on both. Only ever one of the two is displayed.
 *
 * `compact` hands phones the mascot on his own. The lockup is three times as
 * wide as it is tall, and a phone header that also carries a theme toggle, a
 * language switch, Book Now and a menu button has no 108 pixels to spare —
 * with the full lockup that row overflowed its own viewport at 390px and the
 * menu button fell off the right edge. The mascot is the half of the mark
 * that survives being small anyway; it is what the favicon has always been.
 *
 * Both files are padded to an exact ratio — 1608 × 536 and 536 × 536 — so
 * that `(3h, h)` and `(h, h)` describe them without rounding. Next derives the
 * aspect ratio from the numbers it is handed and complains when the box it
 * lands in disagrees by a pixel, which 1592 × 536 could not help doing.
 *
 * None of the four is marked `priority`, which the single filtered image used
 * to be. At most one of them is ever shown, and an eager image is fetched even
 * from a `display:none` subtree — preloading the lot would have cost a phone
 * 35KB of art it will never paint. A lazy one in a hidden subtree is not
 * fetched at all, and a lazy one already in the viewport still loads on first
 * layout: the visible file arrives in that pass and the other three never do.
 */
const LOCKUP = 3;
const MARK = 1;

export function BrandLogo({
  lang,
  height = 48,
  className = "h-9 sm:h-10 lg:h-12",
  compact = false,
}: {
  lang: Lang;
  /**
   * The tallest CSS height `className` resolves to. It never sets the rendered
   * size — it sizes the srcset, so the browser is offered art for the largest
   * box the mark can land in and nothing wider.
   */
  height?: number;
  className?: string;
  /** Below `sm`, show the mascot alone rather than the full lockup. */
  compact?: boolean;
}) {
  return (
    <Link
      href={langPath(lang)}
      aria-label={BRAND}
      className="inline-flex shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
    >
      {compact ? (
        // The breakpoint switches on the wrapper and the theme inside it, so
        // the two never have to out-specify each other in one class list. The
        // height lives here too: the mark is square where the lockup is a 3:1
        // band, so it is sized against the 40px controls beside it rather than
        // against a lockup that is never on screen at the same time.
        <span className="flex h-11 items-center sm:hidden">
          <Art
            file="logo-mark"
            width={Math.round(height * MARK)}
            height={height}
            className="h-full"
          />
        </span>
      ) : null}
      <span className={cn("items-center", compact ? "hidden sm:flex" : "flex")}>
        <Art
          file="logo-full"
          width={Math.round(height * LOCKUP)}
          height={height}
          className={className}
        />
      </span>
    </Link>
  );
}

function Art({
  file,
  width,
  height,
  className,
}: {
  file: "logo-full" | "logo-mark";
  width: number;
  height: number;
  className: string;
}) {
  return (
    <>
      <Image
        src={`/brand/logos/${file}.png`}
        alt={BRAND}
        width={width}
        height={height}
        className={cn("w-auto dark:hidden", className)}
      />
      {/* The same mark again, so it carries no second accessible name — the
          link is already labelled and only one of the pair is ever shown. */}
      <Image
        src={`/brand/logos/${file}-dark.png`}
        alt=""
        aria-hidden
        width={width}
        height={height}
        className={cn("hidden w-auto dark:block", className)}
      />
    </>
  );
}
