import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { photographyCopy } from "@/lib/i18n/photography";
import type { PhotographyEntry } from "@/lib/content/load";
import type { PhotographyCore } from "@/lib/content/schema";
import { PHOTOGRAPHY_PATH } from "@/lib/photography";
import {
  AddOnNote,
  GearRow,
  HeroLink,
  PhotoHero,
  ProductCard,
  PromiseChip,
  SettingsGrid,
} from "@/components/photography/sections";

/**
 * A family hub — `/photography/experiences` or `/photography/workshops`.
 *
 * A genuine collection page rather than a redirect to the single product each
 * family currently holds: the section is built to grow, and a hub that only
 * exists once there are three products is a hub that gets added late, with a
 * URL change and a redirect, exactly when traffic has started arriving.
 */
export function PhotographyFamilyView({
  lang,
  kind,
  entries,
}: {
  lang: Lang;
  kind: PhotographyCore["kind"];
  entries: PhotographyEntry[];
}) {
  const photo = photographyCopy(lang);
  const isExperience = kind === "experience";
  const lead = entries.find((entry) => entry.core.featured) ?? entries[0];
  const workshopCore = entries.find(
    (entry): entry is PhotographyEntry & { core: Extract<PhotographyCore, { kind: "workshop" }> } =>
      entry.core.kind === "workshop",
  );

  return (
    <div>
      <PhotoHero
        image={lead.core.hero}
        alt={lead.copy.title}
        kicker={isExperience ? photo.experienceKicker : photo.workshopKicker}
        title={isExperience ? photo.experienceTitle : photo.workshopTitle}
        lead={isExperience ? photo.experienceLead : photo.workshopLead}
        priority
        actions={
          <HeroLink href={langPath(lang, `/photography/${lead.core.slug}`)}>
            {photo.viewDetails}
            <ArrowRight className="size-4" />
          </HeroLink>
        }
      />

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PromiseChip kind={kind} lang={lang} />
          <Link
            href={langPath(lang, PHOTOGRAPHY_PATH)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            {photo.nav}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ul className="mt-7 grid gap-6 lg:grid-cols-2">
          {entries.map((entry, i) => (
            <li key={entry.core.slug}>
              <ProductCard core={entry.core} copy={entry.copy} lang={lang} priority={i === 0} />
            </li>
          ))}
        </ul>

        {/* The workshop family carries its kit and level promise on the hub,
            because "will my camera do?" is the question that stops people
            clicking through at all. */}
        {workshopCore ? (
          <GearRow workshop={workshopCore.core.workshop} lang={lang} />
        ) : (
          <AddOnNote lang={lang} />
        )}
      </section>

      <SettingsGrid core={lead.core} copy={lead.copy} lang={lang} />
    </div>
  );
}
