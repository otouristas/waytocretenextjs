import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, MessageCircle, Mountain, Users } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { Review } from "@/lib/content/schema";
import { SOCIAL } from "@/lib/site";
import { GoogleWordmark, TripAdvisorOwl } from "@/components/trust/source-logos";

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
              ? "text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft"
              : "text-xs font-semibold uppercase tracking-[0.2em] text-olive"
          }
        >
          {eyebrow}
        </p>
        <h2
          className={
            tone === "dark"
              ? "mt-2 font-display text-3xl text-surface md:text-4xl"
              : "mt-2 font-display text-3xl text-earth md:text-4xl"
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
              ? "inline-flex items-center gap-1.5 text-sm font-semibold text-gold-soft hover:text-surface"
              : "inline-flex items-center gap-1.5 text-sm font-semibold text-olive-deep hover:text-olive"
          }
        >
          {linkLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
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
              <span className="font-display text-lg text-surface">
                {ui.categories[tile.key as keyof typeof ui.categories] ?? tile.key}
              </span>
              <ArrowRight className="size-4 shrink-0 text-gold-soft transition group-hover:translate-x-1" />
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
    <section className="bg-earth py-16 text-surface md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHead eyebrow={ui.whyUs} title={ui.pointsTitle} tone="dark" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ui.points.map((point, i) => {
            const Icon = REASON_ICONS[i % REASON_ICONS.length];
            return (
              <li
                key={point}
                className="flex gap-3 rounded-xl bg-earth-deep/45 p-5 ring-1 ring-gold/20"
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-soft">
                  <Icon className="size-4" />
                </span>
                <p className="text-sm leading-relaxed text-sand-200/90">{point}</p>
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
export function Reviews({ lang, reviews }: { lang: Lang; reviews: Review[] }) {
  const ui = t(lang);
  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <SectionHead eyebrow={ui.trustLine} title={ui.stories} />
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
              <span className="font-semibold text-earth">{review.author}</span>
              <span className="text-faint"> · {review.source}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {/* The marks come from components/trust/source-logos, not from
          /brand/trust/*.png — those two files never existed, so both logos
          rendered as empty boxes. The .svg versions on disk would not have
          worked through <Image> either: the optimiser rejects SVG unless
          `dangerouslyAllowSVG` is set. Inline SVG is what these marks are
          for at this size. */}
      <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
        <PlatformLink href={SOCIAL.google} label="Google">
          <GoogleWordmark className="h-5 w-auto" />
        </PlatformLink>
        <PlatformLink href={SOCIAL.tripadvisor} label="Tripadvisor">
          <TripAdvisorOwl className="h-4 w-auto" />
          <span className="text-sm font-semibold tracking-tight text-[#08808a]">Tripadvisor</span>
        </PlatformLink>
      </p>
    </section>
  );
}

/**
 * A review platform's own mark, as the link.
 *
 * The mark carries the platform name, so the word is not repeated beside it;
 * `label` is the accessible name instead. `nofollow` matches the rule the
 * rating panel already follows — outbound review links are navigational for
 * the reader, not equity we are passing on.
 */
function PlatformLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={label}
      className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 ring-1 ring-line transition hover:ring-olive"
    >
      {children}
    </a>
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
                <h3 className="font-display text-lg leading-snug text-earth">{guide.title}</h3>
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
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-earth marker:content-['']">
              {item.q}
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-olive-50 text-olive-deep transition group-open:rotate-45">
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
