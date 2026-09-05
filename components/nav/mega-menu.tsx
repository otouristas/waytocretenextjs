"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  CarFront,
  Clock,
  Flower2,
  Footprints,
  Landmark,
  Mountain,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { navCopy, type NavBadge } from "@/lib/i18n/nav";
import type { NavColumn, NavEntry, NavTour } from "@/lib/nav/catalog";
import { t } from "@/lib/i18n/ui";
import { formatPrice } from "@/lib/format";
import { BOOK_NOW_URL } from "@/lib/site";
import { cn } from "@/lib/cn";
import type { HubId } from "@/lib/nav/hubs";

const HUB_ICON: Record<HubId, typeof Mountain> = {
  "outdoor-activities-nature-tours-crete": Mountain,
  "cretan-history-tours": Landmark,
  "cretan-culture-tours": Landmark,
  "cretan-gastronomy-food-tours": UtensilsCrossed,
  "hiking-trekking-from-rethymno": Footprints,
  "signature-experiences": Sparkles,
  "multiday-tours": Flower2,
};

export function MegaMenu({
  item,
  lang,
  activeHub,
  onHub,
  onNavigate,
}: {
  item: NavEntry;
  lang: Lang;
  activeHub: HubId;
  onHub: (id: HubId) => void;
  onNavigate: () => void;
}) {
  const columns = item.columns ?? [];
  const column = columns.find((c) => c.id === activeHub) ?? columns[0];
  if (!column) return null;

  const copy = navCopy(lang);
  const ui = t(lang);
  const featured = column.tours.find((tour) => tour.featured) ?? column.tours[0] ?? null;

  return (
    <div
      id="nav-mega-tours"
      role="region"
      aria-label={item.label}
      className="mega-panel absolute left-1/2 top-full z-50 w-screen -translate-x-1/2 border-t border-line bg-surface shadow-[0_40px_80px_-28px_rgba(36,22,20,0.45)]"
    >
      <div className="grid xl:grid-cols-[252px_minmax(0,1fr)_320px]">
        <CategoryRail
          columns={columns}
          activeId={column.id}
          experiences={copy.experiences}
          onHub={onHub}
        />

        <div className="min-w-0 px-6 py-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                {item.label}
              </p>
              <h3 className="mt-1 font-display text-2xl leading-tight text-ink">{column.label}</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{column.blurb}</p>
            </div>
            <Link
              href={column.href}
              onClick={onNavigate}
              className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent lg:inline-flex"
            >
              {copy.seeCollection}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {column.tours.map((tour) => (
              <li key={tour.slug}>
                <TourTile tour={tour} lang={lang} copy={copy} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>

        {featured ? (
          <FeaturedPanel
            tour={featured}
            lang={lang}
            kicker={copy.featured}
            bookLabel={copy.bookNow}
            fromLabel={ui.fromPrice}
            onRequest={ui.onRequest}
            onNavigate={onNavigate}
          />
        ) : null}
      </div>

      <TrustBar
        lang={lang}
        toursHref={item.href ?? "#"}
        seeAll={copy.seeAllTours}
        bookNow={copy.bookNow}
        licensed={copy.licensed}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function CategoryRail({
  columns,
  activeId,
  experiences,
  onHub,
}: {
  columns: NavColumn[];
  activeId: HubId;
  experiences: string;
  onHub: (id: HubId) => void;
}) {
  return (
    <ul className="flex gap-1 overflow-x-auto border-b border-line bg-earth px-3 py-3 text-paper xl:block xl:overflow-visible xl:border-b-0 xl:border-r xl:border-paper/10 xl:px-0 xl:py-3">
      {columns.map((col) => {
        const Icon = HUB_ICON[col.id];
        const active = col.id === activeId;
        return (
          <li key={col.id} className="shrink-0 xl:block">
            <button
              type="button"
              onMouseEnter={() => onHub(col.id)}
              onFocus={() => onHub(col.id)}
              onClick={() => onHub(col.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-full px-3 py-2 text-left transition xl:rounded-none xl:px-6 xl:py-3",
                active
                  ? "bg-paper/15 text-paper xl:bg-paper/10 xl:shadow-[inset_3px_0_0_0_var(--pine)]"
                  : "text-paper/70 hover:bg-paper/10 hover:text-paper",
              )}
            >
              <Icon className="size-4 shrink-0 text-paper" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold leading-tight">{col.short}</span>
                <span className="hidden text-[10px] uppercase tracking-[0.14em] text-paper/50 xl:block">
                  {col.tours.length} {experiences}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function TourTile({
  tour,
  lang,
  copy,
  onNavigate,
}: {
  tour: NavTour;
  lang: Lang;
  copy: ReturnType<typeof navCopy>;
  onNavigate: () => void;
}) {
  const ui = t(lang);
  return (
    <Link
      href={tour.href}
      onClick={onNavigate}
      className="group flex gap-3 rounded-xl bg-bg/80 p-2 ring-1 ring-line transition hover:-translate-y-px hover:bg-surface hover:shadow-[0_16px_32px_-20px_rgba(57,36,32,0.55)] hover:ring-olive-200"
    >
      <span className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-olive-100">
        {tour.hero ? (
          <Image
            src={tour.hero}
            alt=""
            fill
            sizes="72px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1 py-0.5">
        <span className="flex flex-wrap gap-1">
          {tour.badges.map((badge) => (
            <BadgeChip key={badge} badge={badge} copy={copy} />
          ))}
        </span>
        <span className="mt-1 block font-display text-[15px] leading-snug text-ink group-hover:text-accent">
          {tour.label}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-faint">
          {tour.duration ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {tour.duration}
            </span>
          ) : null}
          <span className="font-semibold text-ink">
            {tour.priceFrom != null ? (
              <>
                {ui.fromPrice} {formatPrice(lang, tour.priceFrom)}
              </>
            ) : (
              ui.onRequest
            )}
          </span>
        </span>
      </span>
    </Link>
  );
}

function FeaturedPanel({
  tour,
  lang,
  kicker,
  bookLabel,
  fromLabel,
  onRequest,
  onNavigate,
}: {
  tour: NavTour;
  lang: Lang;
  kicker: string;
  bookLabel: string;
  fromLabel: string;
  onRequest: string;
  onNavigate: () => void;
}) {
  const ui = t(lang);
  return (
    <div className="relative hidden min-h-[22rem] h-full overflow-hidden xl:block">
      {tour.hero ? (
        <Image
          src={tour.hero}
          alt=""
          fill
          sizes="320px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-earth" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-hero via-hero/40 to-hero/5" />
      <div className="relative flex h-full flex-col justify-end p-6 text-paper">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper">
          {kicker}
        </p>
        <h4 className="mt-2 font-display text-2xl leading-tight">{tour.label}</h4>
        <p className="mt-2 text-sm text-paper/80">
          {[tour.duration, tour.hotelPickup ? ui.pickup : null, tour.photoshoot ? ui.photoshoot : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-3 font-display text-2xl">
          {tour.priceFrom != null ? (
            <>
              <span className="text-sm font-sans text-paper/70">{fromLabel} </span>
              {formatPrice(lang, tour.priceFrom)}
            </>
          ) : (
            onRequest
          )}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={tour.href}
            onClick={onNavigate}
            className="inline-flex h-11 items-center justify-center rounded-full bg-olive text-sm font-semibold text-paper transition hover:bg-olive-deep"
          >
            {bookLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

function TrustBar({
  lang,
  toursHref,
  seeAll,
  bookNow,
  licensed,
  onNavigate,
}: {
  lang: Lang;
  toursHref: string;
  seeAll: string;
  bookNow: string;
  licensed: string;
  onNavigate: () => void;
}) {
  const ui = t(lang);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-olive-50 px-6 py-3 lg:px-8">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-ink">
        <li className="inline-flex items-center gap-1.5">
          <CalendarCheck className="size-3.5 text-accent" />
          {ui.freeCancel}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <CarFront className="size-3.5 text-accent" />
          {ui.pickup}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <Camera className="size-3.5 text-accent" />
          {ui.photoshoot}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <Users className="size-3.5 text-accent" />
          {ui.smallGroup}
        </li>
        <li className="hidden text-faint lg:inline">{licensed}</li>
      </ul>
      <div className="flex items-center gap-2">
        <Link
          href={toursHref}
          onClick={onNavigate}
          className="inline-flex h-9 items-center rounded-full px-3.5 text-xs font-semibold text-ink ring-1 ring-line transition hover:bg-surface"
        >
          {seeAll}
        </Link>
        <a
          href={BOOK_NOW_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="inline-flex h-9 items-center rounded-full bg-olive px-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-paper transition hover:bg-olive-deep"
        >
          {bookNow}
        </a>
      </div>
    </div>
  );
}

function BadgeChip({ badge, copy }: { badge: NavBadge; copy: ReturnType<typeof navCopy> }) {
  const label =
    badge === "most_booked"
      ? copy.mostBooked
      : badge === "private"
        ? copy.private
        : badge === "seasonal"
          ? copy.seasonal
          : badge === "couples"
            ? copy.couples
            : copy.multidayBadge;
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]",
        badge === "most_booked" && "bg-olive-50 text-accent",
        badge === "private" && "bg-olive-100 text-accent",
        badge === "seasonal" && "bg-olive-50 text-accent",
        badge === "couples" && "bg-earth-100 text-ink",
        badge === "multiday" && "bg-earth text-paper",
      )}
    >
      {label}
    </span>
  );
}
