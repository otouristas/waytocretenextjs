import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Aperture,
  BookOpen,
  Camera,
  Check,
  Clock,
  GraduationCap,
  Home,
  Images,
  Landmark,
  MapPin,
  Mountain,
  Route,
  Sunset,
  Telescope,
  Trees,
  Users,
  Waves,
} from "lucide-react";
import { fill, langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { photographyCopy } from "@/lib/i18n/photography";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type {
  PhotoDeparture,
  PhotoSetting,
  PhotographyCopy,
  PhotographyCore,
} from "@/lib/content/schema";
import {
  departureCta,
  departureDatesLabel,
  departureMonthLabel,
  departureStatusLabel,
  editedPhotosLabel,
  gearLabel,
  locationsLabel,
  packageDuration,
  photoPath,
  photoPriceFrom,
} from "@/lib/photography";

/**
 * The photography section's building blocks.
 *
 * Server components throughout — the only client island in this section is
 * the request form. The section is sold on photographs, so every block here
 * is built to give an image room and to keep the text around it short.
 */

/* ────────────────────────────── hero ────────────────────────────── */

export function PhotoHero({
  image,
  alt,
  kicker,
  title,
  lead,
  actions,
  priority = false,
}: {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  lead: string;
  actions?: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Tall on desktop, and never taller than the phone it is read on. */}
      <div className="relative h-[58vh] min-h-[22rem] w-full md:h-[66vh] md:max-h-[40rem]">
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-earth-900/94 via-earth-900/55 to-earth-900/15"
        />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-10 md:pb-14">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-paper">
              <Aperture className="size-3.5" />
              {kicker}
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] text-paper md:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/90 md:text-base">
              {lead}
            </p>
            {actions ? <div className="mt-6 flex flex-wrap gap-2.5">{actions}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroLink({
  href,
  children,
  variant = "solid",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  external?: boolean;
}) {
  const className = cn(
    "inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition",
    variant === "solid"
      ? "bg-olive text-paper hover:bg-olive-deep"
      : "bg-paper/12 text-paper ring-1 ring-paper/35 backdrop-blur hover:bg-paper/20",
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/* ────────────────────────── the two families ────────────────────────── */

/**
 * The promise chip.
 *
 * Rendered on every card, every hub header and both product pages. It is the
 * one piece of copy in this section that must never be edited into something
 * clever: a guest who books a workshop expecting portraits of themselves has
 * been mis-sold, and this chip is the last thing between them and that.
 */
export function PromiseChip({
  kind,
  lang,
  tone = "light",
}: {
  kind: PhotographyCore["kind"];
  lang: Lang;
  tone?: "light" | "dark";
}) {
  const copy = photographyCopy(lang);
  const Icon = kind === "experience" ? Camera : GraduationCap;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
        tone === "dark" ? "bg-paper/15 text-paper" : "bg-olive-50 text-accent",
      )}
    >
      <Icon className="size-3.5" />
      {kind === "experience" ? copy.weShootYou : copy.youLearn}
    </span>
  );
}

export function ProductCard({
  core,
  copy,
  lang,
  priority = false,
}: {
  core: PhotographyCore;
  copy: PhotographyCopy;
  lang: Lang;
  priority?: boolean;
}) {
  const ui = t(lang);
  const photo = photographyCopy(lang);
  const from = photoPriceFrom(core);

  return (
    <Link
      href={langPath(lang, photoPath(core.slug))}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-34px_rgba(57,36,32,0.55)] hover:ring-olive-200"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={core.hero}
          alt={copy.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-hero/70 via-hero/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <PromiseChip kind={core.kind} lang={lang} tone="dark" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl leading-tight text-ink group-hover:text-accent">
          {copy.title}
        </h3>
        {copy.tagline ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{copy.tagline}</p>
        ) : null}

        <ProductFacts core={core} lang={lang} />

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <span>
            {from != null ? (
              <>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                  {ui.fromPrice}
                </span>
                <span className="font-display text-2xl text-ink">
                  {formatPrice(lang, from)}
                </span>
                {core.kind === "workshop" ? (
                  <span className="ml-1 text-xs text-muted">{ui.perPerson}</span>
                ) : null}
              </>
            ) : (
              <span className="font-display text-xl text-ink">{ui.onRequest}</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            {photo.viewDetails}
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The two or three numbers a reader checks before opening a product. */
export function ProductFacts({ core, lang }: { core: PhotographyCore; lang: Lang }) {
  const ui = t(lang);
  const photo = photographyCopy(lang);

  const items: Array<{ icon: React.ReactNode; text: string }> =
    core.kind === "experience"
      ? [
          {
            icon: <Clock className="size-3.5" />,
            text: `${packageDuration(core.packages[0], lang)} – ${packageDuration(
              core.packages[core.packages.length - 1],
              lang,
            )}`,
          },
          {
            icon: <Users className="size-3.5" />,
            text: fill(photo.upToPeople, {
              n: Math.max(...core.packages.map((p) => p.maxGuests)),
            }),
          },
          {
            icon: <Images className="size-3.5" />,
            text: editedPhotosLabel(core.packages[0], lang),
          },
        ]
      : [
          {
            icon: <Clock className="size-3.5" />,
            text: `${core.workshop.days} ${core.workshop.days === 1 ? ui.day : ui.days}`,
          },
          {
            icon: <Users className="size-3.5" />,
            text: `${core.workshop.groupMin}–${core.workshop.groupMax}`,
          },
          {
            icon: <BookOpen className="size-3.5" />,
            text: photo.levelTitle,
          },
        ];

  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
      {items.map((item) => (
        <li key={item.text} className="inline-flex items-center gap-1.5">
          <span className="text-accent">{item.icon}</span>
          {item.text}
        </li>
      ))}
    </ul>
  );
}

/* ────────────────────────── package ladder ────────────────────────── */

/**
 * The four packages, as a comparable ladder.
 *
 * Duration, party size, locations and the delivered image count are read out
 * of `photo.json` and rendered in the same order in every card, so the ladder
 * can be compared down a column rather than read four times. The prose
 * bullets underneath deliberately never repeat those four facts.
 */
export function PackageLadder({
  core,
  copy,
  lang,
}: {
  core: Extract<PhotographyCore, { kind: "experience" }>;
  copy: PhotographyCopy;
  lang: Lang;
}) {
  const photo = photographyCopy(lang);
  const byId = new Map(copy.packages.map((p) => [p.id, p]));

  return (
    <section id="packages" className="scroll-mt-28">
      <header className="max-w-2xl">
        <h2 className="font-display text-3xl text-ink">{photo.packagesTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{photo.packagesLead}</p>
      </header>

      {/*
        Rows, not columns.

        The ladder lives in the article column beside a 380px booking form, so
        four cards side by side left each package about 170 pixels — too narrow
        for "80–100 professionally edited photos" to sit on one line, and far
        too narrow to compare anything. Stacked rows give every package the full
        column width, and put price and call to action in the same place on
        each one, which is what actually makes a ladder comparable.
      */}
      <ul className="mt-8 grid gap-4">
        {core.packages.map((pkg) => {
          const text = byId.get(pkg.id);
          const facts = [
            { icon: <Clock className="size-3.5" />, value: packageDuration(pkg, lang), strong: false },
            {
              icon: <Users className="size-3.5" />,
              value: fill(photo.upToPeople, { n: pkg.maxGuests }),
              strong: false,
            },
            { icon: <MapPin className="size-3.5" />, value: locationsLabel(pkg, lang), strong: false },
            { icon: <Images className="size-3.5" />, value: editedPhotosLabel(pkg, lang), strong: true },
            ...(pkg.transport
              ? [{ icon: <Route className="size-3.5" />, value: photo.transportIncluded, strong: false }]
              : []),
            ...(pkg.goldenHour
              ? [{ icon: <Sunset className="size-3.5" />, value: photo.goldenHourOption, strong: false }]
              : []),
          ];

          return (
            <li key={pkg.id}>
              <article
                className={cn(
                  "grid gap-5 rounded-2xl p-6 ring-1 transition sm:grid-cols-[minmax(0,1fr)_11rem]",
                  pkg.popular
                    ? "bg-surface ring-2 ring-olive shadow-[0_30px_60px_-38px_rgba(57,36,32,0.6)]"
                    : "bg-surface ring-line",
                )}
              >
                <div className="min-w-0">
                  {pkg.popular ? (
                    <p className="mb-3 inline-flex rounded-full bg-olive px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-paper">
                      {photo.mostPopular}
                    </p>
                  ) : null}

                  <h3 className="font-display text-xl text-ink">{text?.name ?? pkg.id}</h3>
                  {text?.tagline ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{text.tagline}</p>
                  ) : null}

                  {/* The four comparable numbers, in the same order on every
                      row so the eye can run down them. */}
                  <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-y border-line py-3 text-xs text-muted">
                    {facts.map((fact) => (
                      <Fact key={fact.value} icon={fact.icon} value={fact.value} strong={fact.strong} />
                    ))}
                  </dl>

                  {text?.features.length ? (
                    <ul className="mt-4 grid gap-2 text-xs text-muted">
                      {text.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-line pt-5 sm:flex-col sm:items-stretch sm:justify-start sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
                  <p className="font-display text-3xl leading-none text-ink">
                    {formatPrice(lang, pkg.priceEur)}
                  </p>
                  <a
                    href="#photo-request"
                    className={cn(
                      // `min-h` and `py`, not a fixed `h-11`: the German label
                      // is three words longer and has to be allowed to wrap
                      // rather than spill out of the button.
                      "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-center text-sm font-semibold leading-tight transition sm:mt-4",
                      pkg.popular
                        ? "bg-olive text-paper hover:bg-olive-deep"
                        : // Filled, not a hairline outline. `ring-olive-200` on
                          // `bg-surface` is nearly the same colour in dark mode,
                          // which left this button all but invisible there.
                          "bg-olive-50 text-accent ring-1 ring-olive-200 hover:bg-olive-100",
                    )}
                  >
                    {photo.formExperienceTitle}
                  </a>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-5 rounded-2xl bg-olive-50 p-6 md:grid-cols-2 md:p-8">
        <div>
          <h3 className="font-display text-xl text-accent">{photo.qualityTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-accent/90">{photo.qualityLead}</p>
        </div>
        <div className="md:border-l md:border-olive-200 md:pl-8">
          <h3 className="font-display text-xl text-accent">{photo.customTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-accent/90">{photo.customLead}</p>
          <a
            href="#photo-request"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-olive px-5 py-2.5 text-sm font-semibold leading-tight text-paper transition hover:bg-olive-deep"
          >
            {photo.customCta}
            <ArrowRight className="size-4 shrink-0" />
          </a>
        </div>
      </div>

      {copy.priceNote ? (
        <p className="mt-4 text-xs leading-relaxed text-faint">{copy.priceNote}</p>
      ) : null}
    </section>
  );
}

function Fact({
  icon,
  value,
  strong = false,
}: {
  icon: React.ReactNode;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <span className={cn(strong && "font-semibold text-ink")}>{value}</span>
    </div>
  );
}

/* ────────────────────────── where we shoot ────────────────────────── */

const SETTING_ICON: Record<PhotoSetting, typeof Waves> = {
  beaches: Waves,
  mountains: Mountain,
  villages: Home,
  "old-town": Landmark,
  gorges: Route,
  "olive-groves": Trees,
  viewpoints: Telescope,
  "golden-hour": Sunset,
};

export function SettingsGrid({
  core,
  copy,
  lang,
}: {
  core: PhotographyCore;
  copy: PhotographyCopy;
  lang: Lang;
}) {
  const photo = photographyCopy(lang);
  const byId = new Map(copy.settings.map((s) => [s.id, s]));
  const entries = core.settings
    .map((id) => ({ id, text: byId.get(id) }))
    .filter((entry): entry is { id: PhotoSetting; text: NonNullable<typeof entry.text> } =>
      entry.text != null,
    );
  if (entries.length === 0) return null;

  return (
    <section className="border-y border-line pattern-olive">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <header className="max-w-2xl">
          <h2 className="font-display text-3xl text-ink">{photo.settingsTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{photo.settingsLead}</p>
        </header>

        <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(({ id, text }) => {
            const Icon = SETTING_ICON[id];
            return (
              <li key={id} className="bg-surface p-5">
                <p className="flex items-center gap-2 font-display text-base text-ink">
                  <Icon className="size-4 shrink-0 text-accent" />
                  {text.name}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{text.blurb}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ────────────────────────── workshop blocks ────────────────────────── */

export function Curriculum({ copy, lang }: { copy: PhotographyCopy; lang: Lang }) {
  const photo = photographyCopy(lang);
  if (copy.days.length === 0) return null;

  return (
    <section className="mt-14">
      <header className="max-w-2xl">
        <h2 className="font-display text-3xl text-ink">{photo.curriculumTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{photo.curriculumLead}</p>
      </header>

      <ol className="mt-8 grid gap-5 lg:grid-cols-2">
        {copy.days.map((day, i) => (
          <li
            key={day.title}
            className="rounded-2xl bg-surface p-6 ring-1 ring-line"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {photo.day} {i + 1}
            </p>
            <h3 className="mt-1.5 font-display text-xl leading-snug text-ink">{day.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{day.focus}</p>
            <ul className="mt-4 grid gap-1.5 text-sm text-muted sm:grid-cols-2">
              {day.topics.map((topic) => (
                <li key={topic} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-olive" />
                  {topic}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function GearRow({
  workshop,
  lang,
}: {
  workshop: Extract<PhotographyCore, { kind: "workshop" }>["workshop"];
  lang: Lang;
}) {
  const photo = photographyCopy(lang);
  return (
    <section className="mt-14 grid gap-8 rounded-2xl bg-earth p-8 text-paper md:grid-cols-2 md:p-10">
      <div>
        <h2 className="font-display text-2xl text-paper">{photo.gearTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-paper/85">{photo.gearLead}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {workshop.gear.map((gear) => (
            <li
              key={gear}
              className="inline-flex items-center gap-1.5 rounded-full bg-paper/12 px-3 py-1.5 text-xs font-semibold text-paper ring-1 ring-paper/25"
            >
              <Camera className="size-3.5" />
              {gearLabel(gear, lang)}
            </li>
          ))}
        </ul>
      </div>
      <div className="md:border-l md:border-paper/15 md:pl-8">
        <h2 className="font-display text-2xl text-paper">{photo.levelTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-paper/85">{photo.levelLead}</p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-paper/12 px-3 py-1.5 text-xs font-semibold text-paper ring-1 ring-paper/25">
          <Users className="size-3.5" />
          {photo.groupSize}: {workshop.groupMin}–{workshop.groupMax}
        </p>
      </div>
    </section>
  );
}

/**
 * The seasonal departure board.
 *
 * Status is the whole point of this block. A departure below its minimum
 * group is shown as exactly that — a request to join — rather than as a
 * bookable date, because the workshop genuinely does not run without four
 * people and a "Book now" here would be a promise the operator cannot keep.
 */
export function Departures({
  workshop,
  departures,
  copy,
  lang,
}: {
  workshop: Extract<PhotographyCore, { kind: "workshop" }>["workshop"];
  departures: PhotoDeparture[];
  copy: PhotographyCopy;
  lang: Lang;
}) {
  const photo = photographyCopy(lang);
  const editions = new Map(copy.editions.map((e) => [e.id, e]));
  const hasLimited = departures.some((d) => d.status === "limited");

  return (
    <section id="departures" className="mt-14 scroll-mt-28">
      <header className="max-w-2xl">
        <h2 className="font-display text-3xl text-ink">{photo.departuresTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{photo.departuresLead}</p>
      </header>

      {copy.editions.length > 0 ? (
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {copy.editions.map((edition) => (
            <li key={edition.id} className="rounded-2xl bg-olive-50 p-5">
              <p className="font-display text-lg text-accent">{edition.name}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-accent/90">{edition.blurb}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {departures.length === 0 ? null : (
        <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line">
          {departures.map((departure) => (
            <li
              key={departure.id}
              className="flex flex-wrap items-center justify-between gap-4 bg-surface px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-display text-lg text-ink">
                  {departureMonthLabel(departure.month, lang)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {departureDatesLabel(departure, lang)}
                  {editions.get(departure.edition)
                    ? ` · ${editions.get(departure.edition)?.name}`
                    : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusPill status={departure.status} lang={lang} />
                {/* A seat count only says something once seats have gone.
                    "6 places left" on a group of six is an empty departure
                    dressed up as availability. */}
                {departure.spotsLeft != null &&
                departure.spotsLeft > 0 &&
                departure.spotsLeft < workshop.groupMax ? (
                  <span className="hidden text-xs text-muted sm:inline">
                    {fill(photo.spotsLeft, { n: departure.spotsLeft })}
                  </span>
                ) : null}
                <a
                  href="#photo-request"
                  className="inline-flex h-10 items-center rounded-full bg-olive px-4 text-xs font-semibold text-paper transition hover:bg-olive-deep"
                >
                  {departureCta(departure.status, lang)}
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs leading-relaxed text-faint">
        {fill(photo.groupNote, { min: workshop.groupMin, max: workshop.groupMax })}
      </p>
      {hasLimited ? (
        <p className="mt-2 text-xs leading-relaxed text-faint">{photo.limitedNote}</p>
      ) : null}
    </section>
  );
}

export function StatusPill({
  status,
  lang,
}: {
  status: PhotoDeparture["status"];
  lang: Lang;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        status === "confirmed" && "bg-olive text-paper",
        status === "forming" && "bg-olive-50 text-accent",
        status === "limited" && "bg-clay-soft text-clay-deep",
      )}
    >
      {status === "confirmed" ? <Check className="size-3" /> : null}
      {departureStatusLabel(status, lang)}
    </span>
  );
}

/* ────────────────────────── positioning ────────────────────────── */

export function NotStudioNote({ lang }: { lang: Lang }) {
  const photo = photographyCopy(lang);
  return (
    <section className="mt-14 rounded-2xl bg-surface p-6 ring-1 ring-line md:p-8">
      <h2 className="font-display text-2xl text-ink">{photo.notStudioTitle}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{photo.notStudioLead}</p>
    </section>
  );
}

export function AddOnNote({ lang }: { lang: Lang }) {
  const photo = photographyCopy(lang);
  return (
    <section className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-olive-50 p-6 md:p-8">
      <div className="max-w-xl">
        <h2 className="font-display text-2xl text-accent">{photo.addOnTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-accent/90">{photo.addOnLead}</p>
      </div>
      <Link
        href={langPath(lang, "/tours")}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-olive px-5 text-sm font-semibold text-paper transition hover:bg-olive-deep"
      >
        {photo.addOnCta}
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

/* ────────────────────────── gallery ────────────────────────── */

/**
 * A photography section that shows four thumbnails is not selling
 * photography. The strip runs the full gallery at a size worth looking at,
 * and stays a plain grid of `next/image` so it costs no JavaScript.
 */
export function GalleryStrip({ images, alt }: { images: string[]; alt: string }) {
  if (images.length === 0) return null;
  return (
    <section className="mt-14">
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.map((src, i) => (
          <li
            key={src}
            className={cn(
              "relative overflow-hidden rounded-xl ring-1 ring-line",
              // The first tile of each row of four is given double width, so
              // the strip reads as a layout rather than a contact sheet.
              i % 4 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square",
            )}
          >
            <Image
              src={src}
              alt={i === 0 ? alt : ""}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition duration-700 hover:scale-105"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
