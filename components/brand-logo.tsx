import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { BRAND } from "@/lib/site";

/**
 * The brand lockup: the Cretan with the stick and bedroll, the Rethymno Tours
 * wordmark, and the “powered by WaytoCrete.com” line.
 *
 * One file. The art is two-tone — earth mascot, pine wordmark — so the old
 * `brightness-0 invert` dark-mode trick is wrong: it crushes both tones to
 * black, then inverts them to the same white. The CSS inverse that keeps
 * the two colours is `invert(1) hue-rotate(180deg)` (`.brand-logo` in
 * globals.css): lightness flips, hue stays. Cream shepherd, sage wordmark,
 * on the earth surface.
 *
 * Intrinsic size is 1200 × 551 (~2.18:1). Callers set the painted height;
 * `w-auto max-w-full` lets a tight header shrink the mark instead of shoving
 * the menu button off the right edge. The header paints the full lockup at
 * every breakpoint — the mascot-only compact cut was a 3:1 lockup workaround
 * this artwork does not need.
 */
const WIDTH = 1200;
const HEIGHT = 551;

export function BrandLogo({
  lang,
  className,
  fetchPriority,
}: {
  lang: Lang;
  className?: string;
  fetchPriority?: "high" | "low" | "auto";
}) {
  return (
    <Link
      href={langPath(lang)}
      aria-label={BRAND}
      className="inline-flex min-w-0 items-center transition-opacity duration-200 hover:opacity-80"
    >
      <Image
        src="/brand/logos/logo-full.png"
        alt=""
        width={WIDTH}
        height={HEIGHT}
        fetchPriority={fetchPriority}
        sizes="(min-width: 1024px) 220px, (min-width: 640px) 180px, 140px"
        className={cn(
          "brand-logo h-9 w-auto max-w-full object-contain object-left sm:h-11 lg:h-12",
          className,
        )}
      />
    </Link>
  );
}
