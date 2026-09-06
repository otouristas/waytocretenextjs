"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Clock, GraduationCap } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { navCopy } from "@/lib/i18n/nav";
import type { NavEntry, NavSection } from "@/lib/nav/catalog";
import { t } from "@/lib/i18n/ui";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function NavDropdown({
  item,
  lang,
  onNavigate,
}: {
  item: NavEntry;
  lang: Lang;
  onNavigate: () => void;
}) {
  const copy = navCopy(lang);
  const ui = t(lang);
  const tours = item.tours ?? [];
  const sections = item.sections ?? [];
  const extra =
    item.id === "transfer"
      ? { href: item.href, label: copy.allTransfers }
      : null;

  return (
    <div
      id={`nav-menu-${item.id}`}
      role="region"
      aria-label={item.label}
      className={cn(
        "mega-panel absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2",
        // A family panel carries a photograph and a blurb per column, so it
        // needs the room; the tour list stays in its narrow column.
        sections.length > 0
          ? "w-[min(44rem,calc(100vw-2rem))]"
          : "w-[min(24rem,calc(100vw-2rem))]",
      )}
    >
      <div className="overflow-hidden rounded-2xl bg-surface shadow-[0_28px_60px_-24px_rgba(36,22,20,0.5)] ring-1 ring-line">
        {sections.length > 0 ? (
          <ul className="grid gap-2 p-2 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <SectionTile
                  section={section}
                  lang={lang}
                  fromLabel={ui.fromPrice}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {tours.length > 0 ? (
          <ul className="p-2">
            {tours.map((tour) => (
              <li key={tour.slug}>
                <Link
                  href={tour.href}
                  onClick={onNavigate}
                  className="group flex gap-3 rounded-xl p-2 transition hover:bg-bg"
                >
                  {tour.hero ? (
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-olive-100">
                      <Image src={tour.hero} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15px] leading-snug text-ink group-hover:text-accent">
                      {tour.label}
                    </span>
                    {tour.duration || tour.priceFrom != null ? (
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-faint">
                        {tour.duration ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {tour.duration}
                          </span>
                        ) : null}
                        <span className="font-semibold text-ink">
                          {tour.priceFrom != null
                            ? `${ui.fromPrice} ${formatPrice(lang, tour.priceFrom)}`
                            : null}
                        </span>
                      </span>
                    ) : (
                      <span className="mt-1 block text-[11px] text-muted">{copy.seeCollection}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {extra && extra.href ? (
          <Link
            href={extra.href}
            onClick={onNavigate}
            className="flex items-center justify-between border-t border-line px-4 py-3 text-xs font-semibold text-accent hover:bg-olive-50"
          >
            {extra.label}
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null}

        {sections.length > 0 && item.href ? (
          <Link
            href={item.href}
            onClick={onNavigate}
            className="flex items-center justify-between border-t border-line px-4 py-3 text-xs font-semibold text-accent hover:bg-olive-50"
          >
            {item.label}
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function SectionTile({
  section,
  lang,
  fromLabel,
  onNavigate,
}: {
  section: NavSection;
  lang: Lang;
  fromLabel: string;
  onNavigate: () => void;
}) {
  const Icon = section.id === "experience" ? Camera : GraduationCap;
  return (
    <Link
      href={section.href}
      onClick={onNavigate}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-bg/80 ring-1 ring-line transition hover:bg-surface hover:ring-olive-200"
    >
      <span className="relative block h-28 w-full overflow-hidden bg-olive-100">
        {section.hero ? (
          <Image
            src={section.hero}
            alt=""
            fill
            sizes="(min-width: 640px) 20rem, 90vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-hero/80 to-hero/5" />
        <span className="absolute inset-x-3 bottom-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper">
          <Icon className="size-3.5" />
          {section.blurb}
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col p-3">
        <span className="font-display text-[15px] leading-snug text-ink group-hover:text-accent">
          {section.label}
        </span>
        <span className="mt-1.5 flex flex-wrap gap-1">
          {section.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-olive-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-accent"
            >
              {chip}
            </span>
          ))}
        </span>
        {section.priceFrom != null ? (
          <span className="mt-2.5 text-[11px] text-faint">
            {fromLabel}{" "}
            <span className="font-semibold text-ink">
              {formatPrice(lang, section.priceFrom)}
            </span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}
