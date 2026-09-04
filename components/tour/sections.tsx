import Link from "next/link";
import Image from "next/image";
import { Check, Clock, Gauge, MapPin, Sunrise, Users, X } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { TourCopy, TourCore } from "@/lib/content/schema";
import { cadenceLabel, durationLabel } from "@/lib/content/format";

/* ────────────────────────── quick facts ────────────────────────── */

/**
 * The fact strip.
 *
 * Rendered as a definition list rather than styled spans on purpose: this is
 * the block answer engines lift when asked "how long is the Imbros hike" or
 * "what time does it start", and `<dl>` makes the term/value pairing explicit.
 */
export function QuickFacts({ core, lang }: { core: TourCore; lang: Lang }) {
  const ui = t(lang);
  const facts: Array<{ icon: React.ReactNode; term: string; value: string }> = [
    {
      icon: <Clock className="size-4" />,
      term: ui.hours,
      value: durationLabel(core.durationMinutes, lang),
    },
    { icon: <Gauge className="size-4" />, term: ui.difficulty, value: ui[core.difficulty] },
    {
      icon: <Users className="size-4" />,
      term: ui.smallGroup,
      value: `${core.groupMin}–${core.groupMax}`,
    },
    { icon: <Sunrise className="size-4" />, term: ui.cadence, value: cadenceLabel(core.cadence, lang) },
  ];
  if (core.pickupTime) {
    facts.push({
      icon: <MapPin className="size-4" />,
      term: ui.pickupTime,
      value: core.pickupTime,
    });
  }

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line sm:grid-cols-3 lg:grid-cols-5">
      {facts.map((fact) => (
        <div key={fact.term} className="bg-surface px-4 py-3.5">
          <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
            <span className="text-olive">{fact.icon}</span>
            {fact.term}
          </dt>
          <dd className="mt-1 font-semibold text-earth">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ────────────────────────── itinerary ────────────────────────── */

/**
 * The itinerary, as a vertical timeline.
 *
 * An ordered list with a CSS spine — no JavaScript, and it degrades to a
 * numbered list if the styles never arrive.
 */
export function ItineraryTimeline({
  itinerary,
  lang,
  title,
  linkablePlaces,
}: {
  itinerary: TourCopy["itinerary"];
  lang: Lang;
  title: string;
  /**
   * Slugs that have a /places page. Tours name more stops than we have pages
   * for, and linking one we have not written yet is a 404 in the middle of a
   * product page.
   */
  linkablePlaces: ReadonlySet<string>;
}) {
  if (itinerary.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl text-earth">{title}</h2>
      <ol className="relative mt-6 grid gap-8 before:absolute before:bottom-4 before:left-[11px] before:top-3 before:w-px before:bg-line">
        {itinerary.map((step, i) => (
          <li key={`${step.heading}-${i}`} className="relative pl-10">
            <span
              aria-hidden
              className="absolute left-0 top-1 grid size-6 place-items-center rounded-full bg-olive text-[11px] font-semibold text-surface ring-4 ring-bg"
            >
              {i + 1}
            </span>
            <h3 className="font-display text-lg text-earth">{step.heading}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
            {step.place && linkablePlaces.has(step.place) ? (
              <Link
                href={langPath(lang, `/places/${step.place}`)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-olive-deep hover:underline"
              >
                <MapPin className="size-3" />
                {step.place.replace(/-/g, " ")}
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ────────────────────────── inclusions ────────────────────────── */

export function IncludedExcluded({
  included,
  excluded,
  lang,
}: {
  included: string[];
  excluded: string[];
  lang: Lang;
}) {
  const ui = t(lang);
  if (included.length === 0 && excluded.length === 0) return null;
  return (
    <section className="mt-12 grid gap-6 sm:grid-cols-2">
      {included.length > 0 ? (
        <div className="rounded-xl bg-surface p-5 ring-1 ring-line">
          <h2 className="font-display text-xl text-earth">{ui.included}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            {included.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-olive" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {excluded.length > 0 ? (
        <div className="rounded-xl bg-surface p-5 ring-1 ring-line">
          <h2 className="font-display text-xl text-earth">{ui.notIncluded}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            {excluded.map((item) => (
              <li key={item} className="flex gap-2">
                <X className="mt-0.5 size-4 shrink-0 text-faint" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/* ────────────────────────── what to bring ────────────────────────── */

export function PackingLists({
  wear,
  bring,
  lang,
}: {
  wear: string[];
  bring: string[];
  lang: Lang;
}) {
  const ui = t(lang);
  if (wear.length === 0 && bring.length === 0) return null;
  return (
    <section className="mt-12 grid gap-6 sm:grid-cols-2">
      {wear.length > 0 ? (
        <div>
          <h2 className="font-display text-xl text-earth">{ui.wearTitle}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
            {wear.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {bring.length > 0 ? (
        <div>
          <h2 className="font-display text-xl text-earth">{ui.bringTitle}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
            {bring.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/* ────────────────────────── FAQ ────────────────────────── */

/** Native `<details>` — an accordion that needs no JavaScript at all. */
export function FaqList({
  faqs,
  title,
}: {
  faqs: Array<{ q: string; a: string }>;
  title: string;
}) {
  if (faqs.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl text-earth">{title}</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {faqs.map((faq) => (
          <details key={faq.q} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-earth marker:content-['']">
              {faq.q}
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-olive-50 text-olive-deep transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────── related ────────────────────────── */

export function RelatedTours({
  lang,
  tours,
}: {
  lang: Lang;
  tours: Array<{ slug: string; title: string; hero: string }>;
}) {
  const ui = t(lang);
  if (tours.length === 0) return null;
  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="font-display text-2xl text-earth">{ui.relatedTours}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {tours.map((tour) => (
          <Link
            key={tour.slug}
            href={langPath(lang, `/tours/${tour.slug}`)}
            className="group overflow-hidden rounded-xl bg-surface ring-1 ring-line transition hover:-translate-y-0.5"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={tour.hero}
                alt=""
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <p className="p-4 font-display text-base leading-snug text-earth">{tour.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
