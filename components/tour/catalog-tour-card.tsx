import { ratingSummary, reviewsForTour } from "@/lib/content/load";
import { TourCard } from "@/components/tour/tour-card";
import type { TourCore, TourCopy } from "@/lib/content/schema";
import type { Lang } from "@/lib/i18n/langs";

/**
 * Tour card with the real Google rating looked up on the server.
 *
 * `TourCard` itself cannot import the review corpus: the saved list is a
 * client component and would pull `server-only` into the browser bundle.
 */
export function CatalogTourCard({
  core,
  copy,
  lang,
  priority = false,
}: {
  core: TourCore;
  copy: TourCopy;
  lang: Lang;
  priority?: boolean;
}) {
  return (
    <TourCard
      core={core}
      copy={copy}
      lang={lang}
      priority={priority}
      rating={ratingSummary(reviewsForTour(core.slug))}
    />
  );
}
