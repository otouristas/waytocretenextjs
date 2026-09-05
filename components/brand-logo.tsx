import Image from "next/image";
import Link from "next/link";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { BRAND } from "@/lib/site";

/**
 * The brand mark.
 *
 * Uses `logo-full.png` (earth + pine on transparent). In dark mode the
 * pixels invert to paper white so the lockup reads on chocolate without
 * a plate behind it.
 *
 * Intrinsic size is 1024 × 527, so the aspect ratio is ~1.943.
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
        className="h-11 w-auto lg:h-14 dark:brightness-0 dark:invert"
        priority
      />
    </Link>
  );
}
