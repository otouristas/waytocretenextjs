"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  CarFront,
  ChevronDown,
  Clock3,
  MessageCircle,
  Phone,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LANGS, LANG_META, type Lang, langPath } from "@/lib/i18n/langs";
import { secondaryNav, navCopy } from "@/lib/i18n/nav";
import { t } from "@/lib/i18n/ui";
import { MHTE_LICENCE, PHONE, PHONE_DISPLAY, WHATSAPP } from "@/lib/site";
import { GoogleWordmark, Stars } from "@/components/trust/source-logos";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import type { NavColumn, NavEntry, NavTour } from "@/lib/nav/catalog";
import { formatPrice } from "@/lib/format";

export function MobileMenu({
  lang,
  restPath,
  onClose,
  rating,
  nav,
  bookNowHref,
  bookNowExternal,
}: {
  lang: Lang;
  restPath: string;
  onClose: () => void;
  rating?: { average: number; count: number } | null;
  nav: NavEntry[];
  bookNowHref: string;
  bookNowExternal: boolean;
}) {
  const copy = t(lang);
  const labels = navCopy(lang);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.menu}
      className="pattern-linen fixed inset-0 z-[80] flex h-[100dvh] flex-col text-ink"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface pl-3 pr-2">
        <div onClick={onClose}>
          <BrandLogo lang={lang} height={36} />
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle toLight={copy.themeToLight} toDark={copy.themeToDark} />
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full bg-bg text-ink"
            aria-label={copy.menuClose}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <ul className="grid grid-cols-2 gap-px border-b border-line bg-line">
          <Perk icon={<Clock3 className="size-4" />} label={copy.freeCancel} />
          <Perk icon={<CarFront className="size-4" />} label={copy.pickup} />
          <Perk icon={<Users className="size-4" />} label={copy.smallGroup} />
          <Perk icon={<Camera className="size-4" />} label={copy.photoshoot} />
        </ul>

        {rating ? (
          <Link
            href={langPath(lang, "/reviews")}
            onClick={onClose}
            className="flex items-center gap-3 border-b border-line bg-surface px-5 py-3 text-xs text-muted"
          >
            <Stars value={rating.average} size={14} />
            <span className="font-semibold text-ink">{rating.average.toFixed(1)}</span>
            <span className="inline-flex translate-y-[1px] items-center">
              <GoogleWordmark className="h-3 w-auto" />
            </span>
            <span className="underline decoration-line">
              {rating.count} {copy.reviews}
            </span>
          </Link>
        ) : null}

        <nav className="px-5 py-5">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.id} className="border-b border-line/70">
                {item.kind === "link" || (!item.columns && !item.tours) ? (
                  <Link
                    href={item.href ?? "#"}
                    onClick={onClose}
                    className="group flex items-center justify-between gap-3 py-3.5"
                  >
                    <span className="font-display text-[1.65rem] leading-none text-accent">
                      {item.label}
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 text-line transition group-hover:text-accent" />
                  </Link>
                ) : (
                  <AccordionItem
                    item={item}
                    lang={lang}
                    open={open === item.id}
                    onToggle={() => setOpen((id) => (id === item.id ? null : item.id))}
                    onClose={onClose}
                  />
                )}
              </li>
            ))}
          </ul>

          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-muted">
            {secondaryNav(lang).map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={onClose} className="hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={langPath(lang, "/saved")} onClick={onClose} className="hover:text-accent">
                {copy.wishlist}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-line px-5 py-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
            {copy.languages}
          </p>
          <ul className="grid grid-cols-5 gap-1.5">
            {LANGS.map((code) => (
              <li key={code}>
                <Link
                  href={langPath(code, restPath)}
                  className={cn(
                    "grid h-10 place-items-center rounded-lg text-[11px] font-bold uppercase ring-1 ring-line",
                    code === lang ? "bg-olive text-paper ring-olive" : "bg-surface text-muted",
                  )}
                >
                  {LANG_META[code].hreflang}
                </Link>
              </li>
            ))}
          </ul>

          {MHTE_LICENCE ? (
            <p className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-faint">
              <BadgeCheck className="size-3.5 text-accent" />
              {copy.gntoLicence} {MHTE_LICENCE}
            </p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-line/20 bg-earth px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <a
            href={bookNowHref}
            {...(bookNowExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={onClose}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-olive text-sm font-semibold uppercase tracking-[0.12em] text-paper"
          >
            {labels.bookNow}
          </a>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={copy.whatsapp}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-paper/15 text-paper ring-1 ring-paper/25"
          >
            <MessageCircle className="size-5" />
          </a>
          <a
            href={`tel:${PHONE}`}
            aria-label={PHONE_DISPLAY}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-paper/15 text-paper ring-1 ring-paper/25"
          >
            <Phone className="size-5" />
          </a>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}

function AccordionItem({
  item,
  lang,
  open,
  onToggle,
  onClose,
}: {
  item: NavEntry;
  lang: Lang;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const copy = navCopy(lang);
  const [hub, setHub] = useState<string | null>(item.columns?.[0]?.id ?? null);

  return (
    <div>
      <div className="flex items-center gap-2">
        {item.href ? (
          <Link
            href={item.href}
            onClick={onClose}
            className="min-w-0 flex-1 py-3.5 font-display text-[1.65rem] leading-none text-accent"
          >
            {item.label}
          </Link>
        ) : (
          <span className="min-w-0 flex-1 py-3.5 font-display text-[1.65rem] leading-none text-accent">
            {item.label}
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${copy.openMenu}: ${item.label}`}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-bg text-ink"
        >
          <ChevronDown className={cn("size-5 transition", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <div className="pb-4">
          {item.columns?.map((col) => (
            <MobileColumn
              key={col.id}
              column={col}
              lang={lang}
              open={hub === col.id}
              onToggle={() => setHub((id) => (id === col.id ? null : col.id))}
              onClose={onClose}
              seeCollection={copy.seeCollection}
            />
          ))}
          {item.tours?.map((tour) => (
            <TourLink key={tour.slug} tour={tour} lang={lang} onClose={onClose} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileColumn({
  column,
  lang,
  open,
  onToggle,
  onClose,
  seeCollection,
}: {
  column: NavColumn;
  lang: Lang;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  seeCollection: string;
}) {
  return (
    <div className="border-t border-line/60">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-ink">{column.short}</span>
        <ChevronDown className={cn("size-4 text-faint transition", open && "rotate-180")} />
      </button>
      {open ? (
        <ul className="mb-2 space-y-1">
          {column.tours.map((tour) => (
            <li key={tour.slug}>
              <TourLink tour={tour} lang={lang} onClose={onClose} />
            </li>
          ))}
          <li>
            <Link
              href={column.href}
              onClick={onClose}
              className="block py-2 text-xs font-semibold text-accent"
            >
              {seeCollection}
            </Link>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function TourLink({ tour, lang, onClose }: { tour: NavTour; lang: Lang; onClose: () => void }) {
  const ui = t(lang);
  return (
    <Link href={tour.href} onClick={onClose} className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-sm text-ink">{tour.label}</span>
      <span className="shrink-0 text-[11px] font-semibold text-muted">
        {tour.priceFrom != null ? formatPrice(lang, tour.priceFrom) : ui.onRequest}
      </span>
    </Link>
  );
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2 bg-surface px-4 py-3 text-[11px] font-semibold leading-tight text-ink">
      <span className="shrink-0 text-accent">{icon}</span>
      {label}
    </li>
  );
}
