"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { formatPrice } from "@/lib/format";
import { WHATSAPP } from "@/lib/site";
import { WhatsAppGlyph } from "@/components/desk/whatsapp-fab";
import { openDeskChat, setDeskDock } from "@/lib/desk/bus";

/**
 * The mobile booking dock.
 *
 * Rendered by the tour page, not by the global chrome — it is about one
 * product, so it only exists where that product does. The previous version
 * lived in the sitewide dock and put a context-free "From €40" pill over
 * every page including the home hero.
 *
 * It appears only once the booking widget has scrolled out of view, so it
 * never duplicates a control the reader can already see, and it hides at `lg`
 * where the sticky sidebar takes over.
 *
 * Three ways to reach us, in the order they cost the reader effort: the
 * booking form, WhatsApp for a question with a person on the end, and the
 * desk chat for one that answers now. While it is up it tells the sitewide
 * chrome to withdraw its own two orbs — otherwise WhatsApp appears twice,
 * overlapping, in the same corner of the same screen.
 */
export function MobileBookBar({
  lang,
  priceFrom,
  onRequestLabel,
  bookHref,
}: {
  lang: Lang;
  priceFrom: number | null;
  onRequestLabel?: boolean;
  bookHref?: string | null;
}) {
  const ui = t(lang);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const panel = document.getElementById("booking-panel");
    if (!panel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  // Told on every change, and told `false` on unmount — leaving a route with
  // the dock up would otherwise strand the orbs hidden on the next page.
  useEffect(() => {
    setDeskDock(show);
    return () => setDeskDock(false);
  }, [show]);

  const showPrice = priceFrom != null && !onRequestLabel;

  return (
    <div
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        "transition-transform duration-300",
        show ? "translate-y-0" : "translate-y-[150%]",
      ].join(" ")}
    >
      <div className="glass-pill pointer-events-auto mx-auto flex max-w-lg items-center gap-2 rounded-full p-2 pl-4">
        {showPrice ? (
          <p className="min-w-0 shrink-0 leading-none">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-faint">
              {ui.fromPrice}
            </span>
            <span className="font-display text-base font-semibold text-earth">
              {formatPrice(lang, priceFrom)}
            </span>
          </p>
        ) : null}

        {bookHref ? (
          <a
            href={bookHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center truncate rounded-full bg-olive px-4 text-sm font-semibold text-surface shadow-[0_1px_0_rgba(255,255,255,0.28)_inset] transition hover:bg-olive-deep"
          >
            {ui.bookNow}
          </a>
        ) : (
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("booking-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="inline-flex min-h-11 flex-1 items-center justify-center truncate rounded-full bg-olive px-4 text-sm font-semibold text-surface shadow-[0_1px_0_rgba(255,255,255,0.28)_inset] transition hover:bg-olive-deep"
          >
            {ui.bookNow}
          </button>
        )}

        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ui.whatsapp}
          title={ui.whatsapp}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-surface/60 text-[#25D366] ring-1 ring-line transition hover:bg-surface"
        >
          <WhatsAppGlyph className="size-5" />
        </a>

        <button
          type="button"
          onClick={openDeskChat}
          aria-label={ui.chatOpen}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-surface/60 px-3.5 text-xs font-semibold text-earth ring-1 ring-line transition hover:bg-surface"
        >
          <SparkGlyph className="size-4 text-olive" />
          <span>AI</span>
        </button>
      </div>
    </div>
  );
}

function SparkGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 3l1.2 4.2L17.5 8.5 13.2 9.8 12 14l-1.2-4.2L6.5 8.5l4.3-1.3L12 3zM18.5 13l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3zM6 14.5l.6 1.8 1.8.6-1.8.6L6 19.3l-.6-1.8-1.8-.6 1.8-.6L6 14.5z"
        fill="currentColor"
      />
    </svg>
  );
}
