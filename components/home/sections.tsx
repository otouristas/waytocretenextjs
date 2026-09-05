import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, MessageCircle, Mountain, Users } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { plannerCopy } from "@/lib/i18n/planner";
import type { Review } from "@/lib/content/schema";
import { WriteReviewCta, type ExperienceOption } from "@/components/reviews/write-review-cta";

/* ────────────────────────── shared section chrome ────────────────────────── */

export function SectionHead({
  eyebrow,
  title,
  href,
  linkLabel,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p
          className={
            tone === "dark"
              ? "text-xs font-semibold uppercase tracking-[0.2em] text-paper"
              : "text-xs font-semibold uppercase tracking-[0.2em] text-accent"
          }
        >
          {eyebrow}
        </p>
        <h2
          className={
            tone === "dark"
              ? "mt-2 font-display text-3xl text-paper md:text-4xl"
              : "mt-2 font-display text-3xl text-ink md:text-4xl"
          }
        >
          {title}
        </h2>
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className={
            tone === "dark"
              ? "inline-flex items-center gap-1.5 text-sm font-semibold text-paper hover:text-paper"
              : "inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
          }
        >
          {linkLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function PlannerHomeBand({ lang }: { lang: Lang }) {
  const copy = plannerCopy(lang);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 md:pt-12">
      <Link
        href={langPath(lang, "/create")}
        className="group flex flex-col gap-4 overflow-hidden rounded-3xl bg-earth px-6 py-8 text-paper ring-1 ring-earth-deep transition hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between md:px-10 md:py-9"
      >
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper">{copy.homeEyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-paper md:text-4xl">{copy.homeTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-paper/90 md:text-base">{copy.homeLead}</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-olive px-5 py-3 text-sm font-semibold text-paper group-hover:bg-olive-deep">
          {copy.homeCta}
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </section>
  );
}

/* ────────────────────────────── categories ────────────────────────────── */

type Tile = { key: string; href: string; image: string; span?: boolean };

/**
 * Category tiles.
 *
 * A deliberately uneven mosaic rather than a uniform grid — the two widest
 * tiles carry what Rethymno is actually searched for (gorge walks and food),
 * so the layout itself states the priority.
 */
export function CategoryTiles({ lang, tiles }: { lang: Lang; tiles: Tile[] }) {
  const ui = t(lang);
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <SectionHead
        eyebrow={ui.whyUs}
        title={ui.homeCategoriesTitle}
        href={langPath(lang, "/tours")}
        linkLabel={ui.viewAll}
      />
      <div className="grid auto-rows-[13rem] grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((tile, i) => (
          <Link
            key={tile.key}
            href={tile.href}
            className={[
              "group relative overflow-hidden rounded-2xl ring-1 ring-line",
              tile.span ? "col-span-2" : "",
            ].join(" ")}
          >
            <Image
              src={tile.image}
              alt=""
              fill
              sizes={tile.span ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
              className="object-cover transition duration-700 group-hover:scale-105"
              priority={i < 2}
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-hero/80 via-hero/20 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
              <span className="font-display text-lg text-paper">
                {ui.categories[tile.key as keyof typeof ui.categories] ?? tile.key}
              </span>
              <ArrowRight className="size-4 shrink-0 text-paper transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────── why book direct ────────────────────────── */

const REASON_ICONS = [Users, Camera, Mountain, BadgeCheck, MessageCircle, BadgeCheck];

export function WhyBookDirect({ lang }: { lang: Lang }) {
  const ui = t(lang);
  return (
    <section className="bg-earth py-16 text-paper md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHead eyebrow={ui.whyUs} title={ui.pointsTitle} tone="dark" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ui.points.map((point, i) => {
            const Icon = REASON_ICONS[i % REASON_ICONS.length];
            return (
              <li
                key={point}
                className="flex gap-3 rounded-xl bg-earth-deep/45 p-5 ring-1 ring-paper/20"
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-paper/15 text-paper">
                  <Icon className="size-4" />
                </span>
                <p className="text-sm leading-relaxed text-paper/90">{point}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ────────────────────────────── reviews ────────────────────────────── */

/**
 * Guest reviews.
 *
 * No aggregate score is displayed, because none exists: not one review in the
 * source data carries a numeric star rating. Showing "5.0" here would be the
 * same fabrication that was removed from the structured data.
 */
export function Reviews({
  lang,
  reviews,
  experiences,
}: {
  lang: Lang;
  reviews: Review[];
  experiences: ExperienceOption[];
}) {
  const ui = t(lang);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <SectionHead eyebrow={ui.trustLine} title={ui.stories} />
      {reviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <figure
              key={review.id}
              className="flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-line"
            >
              <blockquote className="flex-1 text-sm leading-relaxed text-muted">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-5 border-t border-line pt-4 text-xs">
                <span className="font-semibold text-ink">{review.author}</span>
                <span className="text-faint"> · {review.source}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
      <WriteReviewCta
        lang={lang}
        experiences={experiences}
        className={reviews.length > 0 ? "mt-8" : undefined}
      />
    </section>
  );
}

/* ────────────────────────────── guides ────────────────────────────── */

export function GuidesTeaser({
  lang,
  guides,
}: {
  lang: Lang;
  guides: Array<{ slug: string; title: string; summary: string; hero: string | null }>;
}) {
  const ui = t(lang);
  if (guides.length === 0) return null;
  return (
    <section className="border-t border-line pattern-olive">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <SectionHead
          eyebrow={ui.homeGuidesEyebrow}
          title={ui.homeGuidesTitle}
          href={langPath(lang, "/guides")}
          linkLabel={ui.homeGuidesAll}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {guides.slice(0, 3).map((guide) => (
            <Link
              key={guide.slug}
              href={langPath(lang, `/guides/${guide.slug}`)}
              className="group overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(57,36,32,0.45)]"
            >
              {guide.hero ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={guide.hero}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="p-5">
                <h3 className="font-display text-lg leading-snug text-ink">{guide.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{guide.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── FAQ ────────────────────────────── */

/**
 * Native `<details>` — an accordion with zero JavaScript, and one that works
 * before hydration and inside Ctrl-F.
 */
export function HomeFaq({ lang }: { lang: Lang }) {
  const ui = t(lang);
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <SectionHead eyebrow={ui.faq} title={ui.faq} />
      <div className="divide-y divide-line border-y border-line">
        {ui.faqs.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-ink marker:content-['']">
              {item.q}
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-olive-50 text-accent transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
