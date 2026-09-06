import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { photographyCopy } from "@/lib/i18n/photography";
import { formatPrice } from "@/lib/format";
import type { PhotoDeparture, PhotographyCopy, PhotographyCore } from "@/lib/content/schema";
import { familyPath, photoPriceFrom } from "@/lib/photography";
import { FaqList, IncludedExcluded } from "@/components/tour/sections";
import {
  AddOnNote,
  Curriculum,
  Departures,
  GalleryStrip,
  GearRow,
  HeroLink,
  NotStudioNote,
  PackageLadder,
  PhotoHero,
  ProductFacts,
  PromiseChip,
  SettingsGrid,
} from "@/components/photography/sections";
import { PhotoRequestForm } from "@/components/photography/request-form";

/**
 * A photography product page.
 *
 * One component for both families, branching on the `kind` discriminant
 * rather than duplicating a near-identical page twice: the shell, the
 * request form and the inclusions are genuinely the same, and only the
 * middle — a package ladder or a curriculum and a departure board — differs.
 */
export function PhotographyProductView({
  core,
  copy,
  lang,
  departures,
}: {
  core: PhotographyCore;
  copy: PhotographyCopy;
  lang: Lang;
  /** Upcoming only, already filtered and sorted by the route. */
  departures: PhotoDeparture[];
}) {
  const ui = t(lang);
  const photo = photographyCopy(lang);
  const from = photoPriceFrom(core);
  const familyLabel = core.kind === "experience" ? photo.experienceNav : photo.workshopNav;
  const packageNames = Object.fromEntries(copy.packages.map((p) => [p.id, p.name]));
  const editionNames = Object.fromEntries(copy.editions.map((e) => [e.id, e.name]));

  return (
    <div>
      <PhotoHero
        image={core.hero}
        alt={copy.title}
        kicker={familyLabel}
        title={copy.title}
        lead={copy.tagline ?? copy.promise}
        priority
        actions={
          <>
            <HeroLink href="#photo-request">
              {core.kind === "workshop" ? photo.requestToJoin : photo.formExperienceTitle}
              <ArrowRight className="size-4" />
            </HeroLink>
            {from != null ? (
              <span className="inline-flex h-12 items-center rounded-full bg-paper/12 px-6 text-sm font-semibold text-paper ring-1 ring-paper/35 backdrop-blur">
                {ui.fromPrice} {formatPrice(lang, from)}
                {core.kind === "workshop" ? ` ${ui.perPerson}` : ""}
              </span>
            ) : null}
          </>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <nav aria-label={ui.breadcrumb} className="text-xs text-muted">
          <Link href={langPath(lang)} className="hover:text-accent">
            {ui.home}
          </Link>
          <span className="px-1.5 text-faint">/</span>
          <Link href={langPath(lang, "/photography")} className="hover:text-accent">
            {photo.nav}
          </Link>
          <span className="px-1.5 text-faint">/</span>
          <Link href={langPath(lang, familyPath(core.kind))} className="hover:text-accent">
            {familyLabel}
          </Link>
          <span className="px-1.5 text-faint">/</span>
          <span className="text-ink">{copy.title}</span>
        </nav>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1fr_380px]">
          <article className="min-w-0">
            <PromiseChip kind={core.kind} lang={lang} />
            <p className="mt-4 font-display text-2xl leading-snug text-ink">{copy.promise}</p>
            <ProductFacts core={core} lang={lang} />

            {/* The answer-first paragraph, first prose on the page: it is what
                an answer engine quotes and what a skimming reader needs. */}
            <p className="mt-7 text-base leading-relaxed text-ink">{copy.summary}</p>

            {copy.highlights.length > 0 ? (
              <ul className="mt-6 grid gap-2 rounded-xl bg-olive-50 p-5 sm:grid-cols-2">
                {copy.highlights.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-accent">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-olive" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            {copy.overview.map((para, i) => (
              <p key={i} className="mt-4 leading-relaxed text-muted">
                {para}
              </p>
            ))}

            {core.kind === "experience" ? (
              <div className="mt-14">
                <PackageLadder core={core} copy={copy} lang={lang} />
              </div>
            ) : (
              <>
                <Curriculum copy={copy} lang={lang} />
                <Departures
                  workshop={core.workshop}
                  departures={departures}
                  copy={copy}
                  lang={lang}
                />
                <GearRow workshop={core.workshop} lang={lang} />
              </>
            )}

            <IncludedExcluded included={copy.included} excluded={copy.excluded} lang={lang} />
            <FaqList faqs={copy.faqs} title={ui.faq} />
            <GalleryStrip images={[core.hero, ...core.gallery]} alt={copy.title} />
          </article>

          <div className="lg:sticky lg:top-28">
            <PhotoRequestForm
              core={core}
              title={copy.title}
              packageNames={packageNames}
              editionNames={editionNames}
              departures={departures}
              lang={lang}
              bookingNote={copy.bookingNote}
            />
          </div>
        </div>
      </div>

      <SettingsGrid core={core} copy={copy} lang={lang} />

      <div className="mx-auto max-w-6xl px-4 py-14">
        {core.kind === "experience" ? (
          <>
            <NotStudioNote lang={lang} />
            <AddOnNote lang={lang} />
          </>
        ) : null}

        {/* The cross-link between the two families. It is the one internal
            link on this page that changes what a confused reader buys. */}
        <section className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-surface p-6 ring-1 ring-line md:p-8">
          <div className="max-w-xl">
            <PromiseChip
              kind={core.kind === "experience" ? "workshop" : "experience"}
              lang={lang}
            />
            <h2 className="mt-3 font-display text-2xl text-ink">
              {core.kind === "experience" ? photo.workshopNav : photo.experienceNav}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {core.kind === "experience" ? photo.workshopLead : photo.experienceLead}
            </p>
          </div>
          <Link
            href={langPath(
              lang,
              familyPath(core.kind === "experience" ? "workshop" : "experience"),
            )}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-olive-50 px-5 py-2.5 text-sm font-semibold leading-tight text-accent ring-1 ring-olive-200 transition hover:bg-olive-100"
          >
            {core.kind === "experience" ? photo.hubCtaWorkshop : photo.hubCtaExperience}
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
