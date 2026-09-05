"use client";

import { WHATSAPP } from "@/lib/site";
import { t } from "@/lib/i18n/ui";
import type { Lang } from "@/lib/i18n/langs";
import { cn } from "@/lib/cn";

export function WhatsAppFab({ lang, className }: { lang: Lang; className?: string }) {
  const copy = t(lang);
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={copy.whatsapp}
      className={cn(
        "glass-orb group relative grid size-[52px] place-items-center rounded-full text-paper transition hover:scale-[1.03] active:scale-95",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-olive/30 opacity-0 blur-md transition group-hover:opacity-100" />
      <WhatsAppGlyph className="relative size-6" />
    </a>
  );
}

/** The mark on its own, so the tour dock does not carry a second copy of it. */
export function WhatsAppGlyph({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.15h.04c5.46 0 9.89-4.4 9.89-9.83 0-2.63-1.04-5.1-2.93-6.96A9.96 9.96 0 0 0 12.04 2Zm0 18.01h-.03a8.3 8.3 0 0 1-4.22-1.16l-.3-.18-3.2.84.86-3.11-.2-.32a8.18 8.18 0 0 1-1.26-4.42c0-4.52 3.71-8.2 8.27-8.2 2.21 0 4.28.85 5.84 2.4a8.12 8.12 0 0 1 2.42 5.8c0 4.52-3.71 8.2-8.18 8.2Zm4.52-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.4-.12-.56.12-.17.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.38-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.77-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.14-1.17-.06-.12-.23-.18-.48-.3Z" />
    </svg>
  );
}
