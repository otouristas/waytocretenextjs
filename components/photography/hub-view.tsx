import Link from "next/link";
import { ArrowRight, Camera, GraduationCap } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { photographyCopy } from "@/lib/i18n/photography";
import { t } from "@/lib/i18n/ui";
import type { PhotographyEntry } from "@/lib/content/load";
import {
  PHOTO_EXPERIENCES_PATH,
  PHOTO_WORKSHOPS_PATH,
} from "@/lib/photography";
import { HeroLink, PhotoHero, ProductCard, SettingsGrid } from "@/components/photography/sections";

/**
 * The photography section landing page.
 *
 * Its one job is to route a reader into the right family. Everything above
 * the fold is built around the distinction — we photograph you, or you learn
 * to photograph — because the products underneath are close enough in name
 * that a guest can and will book the wrong one.
 */
export function PhotographyHubView({
  lang,
  experiences,
  workshops,
  heroImage,
}: {
  lang: Lang;
  experiences: PhotographyEntry[];
  workshops: PhotographyEntry[];
  heroImage: string;
}) {
  const photo = photographyCopy(lang);
  const ui = t(lang);

  return (
    <div>
      <PhotoHero
        image={heroImage}
        alt={photo.hubTitle}
        kicker={photo.hubKicker}
        title={photo.hubTitle}
        lead={photo.hubLead}
        priority
        actions={
          <>
            {experiences.length > 0 ? (
              <HeroLink href={langPath(lang, PHOTO_EXPERIENCES_PATH)}>
                <Camera className="size-4" />
                {photo.hubCtaExperience}
              </HeroLink>
            ) : null}
            {workshops.length > 0 ? (
              <HeroLink href={langPath(lang, PHOTO_WORKSHOPS_PATH)} variant="ghost">
                <GraduationCap className="size-4" />
                {photo.hubCtaWorkshop}
              </HeroLink>
            ) : null}
          </>
        }
      />

      {/* ── the distinction ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <header className="max-w-2xl">
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            {photo.differenceTitle}
          </h2>
          <p className="mt-3 leading-relaxed text-muted">{photo.differenceLead}</p>
        </header>

        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line md:grid-cols-2">
          <Half
            icon={<Camera className="size-5" />}
            promise={photo.weShootYou}
            title={photo.experienceNav}
            lead={photo.experienceLead}
            chips={photo.experienceChips}
            href={langPath(lang, PHOTO_EXPERIENCES_PATH)}
            cta={photo.hubCtaExperience}
            available={experiences.length > 0}
          />
          <Half
            icon={<GraduationCap className="size-5" />}
            promise={photo.youLearn}
            title={photo.workshopNav}
            lead={photo.workshopLead}
            chips={photo.workshopChips}
            href={langPath(lang, PHOTO_WORKSHOPS_PATH)}
            cta={photo.hubCtaWorkshop}
            available={workshops.length > 0}
          />
        </div>
      </section>

      <Family
        lang={lang}
        entries={experiences}
        kicker={photo.experienceKicker}
        title={photo.experienceTitle}
        href={langPath(lang, PHOTO_EXPERIENCES_PATH)}
        seeAll={photo.hubCtaExperience}
        priority
      />

      <Family
        lang={lang}
        entries={workshops}
        kicker={photo.workshopKicker}
        title={photo.workshopTitle}
        href={langPath(lang, PHOTO_WORKSHOPS_PATH)}
        seeAll={photo.hubCtaWorkshop}
      />

      {/* The landscapes, taken from whichever product publishes them — the
          list is the same island either way. */}
      {experiences[0] ? (
        <SettingsGrid core={experiences[0].core} copy={experiences[0].copy} lang={lang} />
      ) : workshops[0] ? (
        <SettingsGrid core={workshops[0].core} copy={workshops[0].copy} lang={lang} />
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-earth p-8 text-paper md:p-10">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-paper">{photo.notStudioTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-paper/85">{photo.notStudioLead}</p>
          </div>
          <Link
            href={langPath(lang, "/contact")}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-olive px-6 text-sm font-semibold text-paper transition hover:bg-olive-deep"
          >
            {ui.getInTouch}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Half({
  icon,
  promise,
  title,
  lead,
  chips,
  href,
  cta,
  available,
}: {
  icon: React.ReactNode;
  promise: string;
  title: string;
  lead: string;
  chips: readonly string[];
  href: string;
  cta: string;
  available: boolean;
}) {
  return (
    <div className="flex flex-col bg-surface p-7 md:p-9">
      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        <span className="text-accent">{icon}</span>
        {promise}
      </p>
      <h3 className="mt-3 font-display text-2xl leading-tight text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{lead}</p>
      <ul className="mt-5 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <li
            key={chip}
            className="rounded-full bg-olive-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent"
          >
            {chip}
          </li>
        ))}
      </ul>
      {available ? (
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-semibold text-accent hover:underline"
        >
          {cta}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

function Family({
  lang,
  entries,
  kicker,
  title,
  href,
  seeAll,
  priority = false,
}: {
  lang: Lang;
  entries: PhotographyEntry[];
  kicker: string;
  title: string;
  href: string;
  seeAll: string;
  priority?: boolean;
}) {
  if (entries.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            {kicker}
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-ink">{title}</h2>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
        >
          {seeAll}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <ul className="mt-7 grid gap-6 lg:grid-cols-2">
        {entries.map((entry, i) => (
          <li key={entry.core.slug}>
            <ProductCard
              core={entry.core}
              copy={entry.copy}
              lang={lang}
              priority={priority && i === 0}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
