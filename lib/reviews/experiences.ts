import "server-only";
import { allTours } from "@/lib/content/load";
import { type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { plannerCopy } from "@/lib/i18n/planner";

export type ExperienceOption = { value: string; label: string };

/** Tours plus the three services that are not a tour slug. */
export function reviewExperienceOptions(lang: Lang): ExperienceOption[] {
  const ui = t(lang);
  return [
    ...allTours(lang).map(({ core, copy }) => ({
      value: `tour:${core.slug}`,
      label: copy.title,
    })),
    { value: "transfers", label: ui.navTransfers },
    { value: "weddings", label: ui.weddingTransfers },
    { value: "custom-day", label: plannerCopy(lang).title },
  ];
}
