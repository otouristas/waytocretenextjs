import Image from "next/image";
import Link from "next/link";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { BRAND } from "@/lib/site";

/**
 * The brand mark.
 *
 * Uses `logo-full.png` — the real logo (the Cretan shepherd + wordmark).
 * `wordmark-beige.png` is not a wordmark at all: it is a plain beige minibus
 * icon, which rendered almost invisibly against the cream header.
 *
 * Intrinsic size is 1024 × 527, so the aspect ratio is ~1.943. This is the
 * artwork supplied from the operator's asset store; the previous file was a
 * 2560 × 1209 upscale of a smaller source and went soft at header sizes.
 */
const RATIO = 1024 / 527;

export function BrandLogo({ lang, height = 44 }: { lang: Lang; height?: number }) {
  return (
    <Link href={langPath(lang)} className="flex items-center" aria-label={BRAND}>
      <Image
        src="/brand/logos/logo-full.png"
        alt={BRAND}
        width={Math.round(height * RATIO)}
        height={height}
        className="h-11 w-auto lg:h-14"
        priority
      />
    </Link>
  );
}
