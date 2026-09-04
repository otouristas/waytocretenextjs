"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, CarFront, Check, Clock3, ShieldCheck, Users } from "lucide-react";
import { fill, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { WHATSAPP } from "@/lib/site";
import { Stars } from "@/components/trust/source-logos";
import type { DeskRouteCard, DeskTourCard } from "@/lib/desk/cards";
import { WhatsAppGlyph } from "@/components/desk/whatsapp-fab";

/**
 * The cards the desk answers with.
 *
 * Every badge is a fact the site already publishes for that specific product
 * — the pickup flag, the group cap, the cancellation window, the
 * photographer. None of it is written for the chat, which is the point: a
 * card that claims something the tour page does not is a card that gets
 * caught out at the booking form.
 *
 * The one deliberately conditional element is the star row. It renders only
 * where real, schema-eligible scores exist for that tour, so most cards carry
 * no rating at all rather than the default 5.0 the source data ships with.
 *
 * These sit directly on the sheet, not inside a message bubble — they own the
 * only frame in the reply.
 */

export function TourCards({ cards, lang }: { cards: DeskTourCard[]; lang: Lang }) {
  if (!cards.length) return null;
  return (
    <ul className="mt-3 space-y-3">
      {cards.map((card) => (
        <li key={card.slug}>
          <TourResult card={card} lang={lang} />
        </li>
      ))}
    </ul>
  );
}

function TourResult({ card, lang }: { card: DeskTourCard; lang: Lang }) {
  const ui = t(lang);
  return (
    <article className="overflow-hidden rounded-[20px] bg-surface shadow-[0_10px_30px_-18px_rgba(57,36,32,0.55)] ring-1 ring-line">
      <Link href={card.href} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={card.hero}
            alt=""
            fill
            sizes="(min-width: 640px) 30rem, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-hero/90 via-hero/25 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <span className="rounded-full bg-hero/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-surface backdrop-blur-sm">
              {card.category}
            </span>
            {card.featured ? (
              <span className="rounded-full bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink shadow">
                {ui.popular}
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3.5">
            {card.rating ? (
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] text-surface/85">
                <Stars
                  value={card.rating.average}
                  size={12}
                  label={fill(ui.starsOutOf, { n: card.rating.average.toFixed(1) })}
                />
                <span className="font-bold text-surface">{card.rating.average.toFixed(1)}</span>
                <span>· {card.rating.count} {ui.reviews}</span>
              </p>
            ) : null}
            <h4 className="font-display text-[1.35rem] leading-tight text-surface drop-shadow-sm">
              {card.title}
            </h4>
          </div>
        </div>
      </Link>

      <div className="p-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-lg leading-none text-earth">{card.price}</p>
          <p className="text-[11px] text-faint">{card.cadence}</p>
        </div>

        {card.highlights.length ? (
          <ul className="mt-2.5 space-y-1">
            {card.highlights.slice(0, 2).map((line) => (
              <li key={line} className="flex gap-1.5 text-[12px] leading-snug text-muted">
                <Check className="mt-0.5 size-3 shrink-0 text-olive" />
                <span className="line-clamp-1">{line}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          <Chip icon={<Clock3 className="size-3" />}>{card.duration}</Chip>
          <Chip icon={<Users className="size-3" />}>≤ {card.groupMax}</Chip>
          {card.pickup ? <Chip icon={<CarFront className="size-3" />}>{ui.pickup}</Chip> : null}
          {card.photoshoot ? <Chip icon={<Camera className="size-3" />}>{ui.photoshoot}</Chip> : null}
          {card.cancelHours ? (
            <Chip icon={<ShieldCheck className="size-3" />}>{card.cancelHours}h</Chip>
          ) : null}
        </ul>

        <div className="mt-3.5 flex items-center gap-2">
          <Link
            href={card.href}
            className="group inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-olive px-4 text-sm font-semibold text-surface transition hover:bg-olive-deep"
          >
            {card.bookUrl ? ui.chatHold : ui.chatSeeDay}
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <WhatsAppAsk label={`${ui.whatsapp} — ${card.title}`} />
        </div>
      </div>
    </article>
  );
}

export function RouteCards({ cards, lang }: { cards: DeskRouteCard[]; lang: Lang }) {
  const ui = t(lang);
  if (!cards.length) return null;
  return (
    <div className="mt-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-olive">
        {ui.chatRoutesTitle}
      </p>
      <ul className="space-y-2">
        {cards.map((card) => (
          <li key={card.slug}>
            <RouteResult card={card} lang={lang} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RouteResult({ card, lang }: { card: DeskRouteCard; lang: Lang }) {
  const ui = t(lang);
  return (
    <article className="rounded-[20px] bg-surface p-3.5 ring-1 ring-line">
      <div className="flex items-start justify-between gap-3">
        <Link href={card.href} className="min-w-0 flex-1">
          <p className="font-display text-base leading-tight text-earth">
            {card.from}
            <span className="mx-1.5 text-olive">→</span>
            {card.to}
          </p>
        </Link>

        {/* A range, never a headline figure. The booking engine quotes the
            binding fare off these same per-km bands; one number here would be
            a promise this panel is not in a position to make. */}
        {card.estimate ? (
          <p className="shrink-0 text-right leading-none">
            <span className="font-display text-lg text-earth">
              €{card.estimate.low}–{card.estimate.high}
            </span>
            <span className="mt-1 block text-[9px] uppercase tracking-wider text-faint">
              {ui.chatEstimate}
            </span>
          </p>
        ) : null}
      </div>

      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        <Chip icon={<Clock3 className="size-3" />}>{card.duration}</Chip>
        <Chip icon={<CarFront className="size-3" />}>{card.distanceKm} km</Chip>
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={card.href}
          className="group inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-earth px-4 text-sm font-semibold text-surface transition hover:bg-hero"
        >
          {ui.chatRequestRide}
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
        <WhatsAppAsk label={`${ui.whatsapp} — ${card.from} → ${card.to}`} />
      </div>
    </article>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-[10px] font-semibold text-muted">
      <span className="text-olive">{icon}</span>
      {children}
    </li>
  );
}

function WhatsAppAsk({ label }: { label: string }) {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="grid size-11 shrink-0 place-items-center rounded-full bg-bg text-[#25D366] ring-1 ring-line transition hover:bg-olive-50"
    >
      <WhatsAppGlyph className="size-5" />
    </a>
  );
}
