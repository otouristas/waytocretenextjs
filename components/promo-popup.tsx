"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { cn } from "@/lib/cn";

/** Session key so the offer shows once per browser tab visit. */
const STORAGE_KEY = "wtc-promo-tours-10-dismissed";
const SHOW_DELAY_MS = 900;

/**
 * Sitewide offer dialog: 10% off every tour, with the final figure quoted on
 * request rather than published on the page. Mounted from the locale layout
 * so it appears on the first paint of any route.
 */
export function PromoPopup({ lang }: { lang: Lang }) {
  const copy = t(lang);
  const titleId = useId();
  const bodyId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore — closing still works for this visit.
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // Private mode / blocked storage — still show once this mount.
    }

    const preferReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = preferReduced ? 0 : SHOW_DELAY_MS;
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div className="promo-popup-root fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={copy.promoClose}
        className="promo-popup-backdrop absolute inset-0 bg-earth/55 backdrop-blur-[2px]"
        onClick={dismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className={cn(
          "promo-popup-panel relative z-10 w-full max-w-md overflow-hidden rounded-[28px]",
          "bg-surface text-ink shadow-[0_24px_60px_-20px_rgba(57,36,32,0.55)]",
          "ring-1 ring-olive-200",
        )}
      >
        <div className="relative overflow-hidden bg-olive px-6 pb-8 pt-7 text-paper sm:px-8">
          <div className="absolute -right-8 -top-10 size-36 rounded-full bg-paper/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-10 size-40 rounded-full bg-earth/25 blur-2xl" />

          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            aria-label={copy.promoClose}
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-paper/85 transition hover:bg-paper/15 hover:text-paper"
          >
            <X className="size-5" aria-hidden />
          </button>

          <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/75">
            {copy.promoKicker}
          </p>
          <p
            id={titleId}
            className="relative mt-3 font-display text-[2.15rem] leading-[1.05] tracking-tight sm:text-[2.4rem]"
          >
            {copy.promoTitle}
          </p>
          <p className="relative mt-2 font-script text-[1.85rem] leading-none text-paper/90">
            {copy.promoPercent}
          </p>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
          <p id={bodyId} className="text-[15px] leading-relaxed text-muted">
            {copy.promoBody}
          </p>
          <p className="text-sm leading-relaxed text-accent">{copy.promoPriceNote}</p>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              href={langPath(lang, "/tours")}
              onClick={dismiss}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-olive px-5 text-sm font-semibold text-paper transition-colors hover:bg-olive-deep"
            >
              {copy.promoCta}
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-accent transition-colors hover:bg-olive-50 hover:text-ink"
            >
              {copy.promoDismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
