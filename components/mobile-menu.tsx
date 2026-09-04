"use client";

import { Phone, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { LANGS, LANG_META, type Lang, langPath } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function MobileMenu({ lang, restPath, onClose }: { lang: Lang; restPath: string; onClose: () => void }) {
  const copy = t(lang);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  const node = (
    <div className="fixed inset-0 z-[80] flex flex-col pattern-linen text-ink">
      <div className="flex h-16 items-center justify-between border-b border-line bg-surface px-4">
        <img src="https://waytocrete.com/wp-content/uploads/2024/05/logo-small-beige.png" alt="Way to Crete" className="h-9 w-auto" />
        <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full bg-bg" aria-label="Close menu"><X className="size-5" /></button>
      </div>
      <nav className="flex flex-col gap-2 px-5 py-8">
        {[[langPath(lang, "/tours"), copy.navTours], [langPath(lang, "/partners"), copy.navPartners], [langPath(lang, "/about"), copy.navAbout], [langPath(lang, "/contact"), copy.navContact]].map(([href, label]) => (
          <a key={href} href={href} onClick={onClose} className="font-display text-4xl text-olive-deep">{label}</a>
        ))}
      </nav>
      <div className="mt-auto grid grid-cols-6 gap-1 px-4 py-3">
        {LANGS.map((code) => (
          <a key={code} href={langPath(code, restPath)} className={cn("grid h-10 place-items-center rounded-sm text-[11px] font-semibold uppercase ring-1 ring-line", code === lang ? "bg-gold text-ink" : "bg-surface text-muted")}>{LANG_META[code].hreflang}</a>
        ))}
      </div>
      <div className="flex gap-2 bg-olive-deep px-4 py-3">
        <Button asChild className="h-12 flex-1 bg-gold text-ink hover:bg-gold-soft"><a href="tel:+306972531808"><Phone className="size-4" />{copy.bookNow}</a></Button>
      </div>
    </div>
  );
  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
