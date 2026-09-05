import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Camera, Clock, Users } from "lucide-react";
import { fill, langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { TourCore, TourCopy } from "@/lib/content/schema";
import { priceFrom, isPriced } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { cadenceLabel, durationLabel } from "@/lib/content/format";
import { SaveButton } from "@/components/tour/save-button";

/**
 * A tour card.
 *
 * Server-rendered: the whole card is a link and static content, with a single
 * client leaf for the save button. The previous card was a client component
 * in its entirety, which shipped the store and the icon set to every grid.
 *
 * Deliberately absent: a star rating. Every tour in the source data carries
 * the same default 5.0 with no real reviews behind it, so showing one would
 * be a fabricated trust signal.
 */
export function TourCard({
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
  const ui = t(lang);
  const from = priceFrom(core.price);

  return (
    <article className="group relative">
      <SaveButton slug={core.slug} label={ui.saved} />

      <Link
        href={langPath(lang, `/tours/${core.slug}`)}
        className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(57,36,32,0.5)] hover:ring-olive-200"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={core.hero}
            alt={copy.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.06]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-hero/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper backdrop-blur-sm">
            {ui.categories[core.category as keyof typeof ui.categories] ?? core.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-lg leading-snug text-ink">{copy.title}</h3>

          {copy.tagline ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{copy.tagline}</p>
          ) : null}

          <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
            <li className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {durationLabel(core.durationMinutes, lang)}
            </li>
            <li className="inline-flex items-center gap-1">
              <Users className="size-3.5" /> {ui.smallGroup.toLowerCase()} · {fill(ui.maxGuests, { n: core.groupMax })}
            </li>
            <li>{cadenceLabel(core.cadence, lang)}</li>
          </ul>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {core.cancelFreeHours > 0 ? (
              <Tag icon={<CalendarCheck className="size-3" />}>{ui.freeCancel}</Tag>
            ) : null}
            {core.photoshoot ? <Tag icon={<Camera className="size-3" />}>{ui.photoshoot}</Tag> : null}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <p className="text-sm">
              {isPriced(core.price) && from != null ? (
                <>
                  <span className="text-faint">{ui.fromPrice} </span>
                  <span className="font-display text-xl font-semibold text-ink">
                    {formatPrice(lang, from)}
                  </span>
                </>
              ) : (
                <span className="font-display text-lg font-semibold text-ink">{ui.onRequest}</span>
              )}
            </p>
            <span className="rounded-full bg-olive-50 px-3.5 py-1.5 text-xs font-semibold text-accent transition group-hover:bg-olive group-hover:text-paper">
              {ui.bookThis}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function Tag({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-olive-50 px-2 py-0.5 text-[10px] font-medium text-accent">
      {icon}
      {children}
    </span>
  );
}
