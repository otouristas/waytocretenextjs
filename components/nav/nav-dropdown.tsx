"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { navCopy } from "@/lib/i18n/nav";
import type { NavEntry } from "@/lib/nav/catalog";
import { t } from "@/lib/i18n/ui";
import { formatPrice } from "@/lib/format";

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
  const extra =
    item.id === "transfer"
      ? { href: item.href, label: copy.allTransfers }
      : null;

  return (
    <div
      id={`nav-menu-${item.id}`}
      role="region"
      aria-label={item.label}
      className="mega-panel absolute left-1/2 top-full z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 pt-2"
    >
      <div className="overflow-hidden rounded-2xl bg-surface shadow-[0_28px_60px_-24px_rgba(36,22,20,0.5)] ring-1 ring-line">
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
                  <span className="block font-display text-[15px] leading-snug text-earth group-hover:text-olive-deep">
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
                      <span className="font-semibold text-earth">
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
        {extra && extra.href ? (
          <Link
            href={extra.href}
            onClick={onNavigate}
            className="flex items-center justify-between border-t border-line px-4 py-3 text-xs font-semibold text-olive-deep hover:bg-olive-50"
          >
            {extra.label}
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
