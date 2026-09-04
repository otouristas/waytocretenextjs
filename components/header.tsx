"use client";

import { Globe, Heart, Menu, Phone } from "lucide-react";
import { useState } from "react";
import { LANGS, LANG_META, type Lang, langPath } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { useWayStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/mobile-menu";

export function Header({ lang, restPath }: { lang: Lang; restPath: string }) {
  const copy = t(lang);
  const [open, setOpen] = useState(false);
  const [langs, setLangs] = useState(false);
  const saved = useWayStore((s) => s.saved);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95">
        <div className="hidden border-b border-line bg-olive text-surface lg:block">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-[11px] font-medium">
            <span>5.0 · 148 {copy.reviews} · {copy.photoshoot} · {copy.pickup}</span>
            <a href="tel:+306972531808" className="hover:text-gold-soft">+30 697 253 1808</a>
          </div>
        </div>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 lg:h-[76px]">
          <a href={langPath(lang)} className="flex items-center">
            <img src="https://waytocrete.com/wp-content/uploads/2024/05/logo-small-beige.png" alt="Way to Crete" className="h-10 w-auto lg:h-12" />
          </a>
          <nav className="hidden items-center gap-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink xl:flex">
            <a href={langPath(lang)} className="hover:text-olive">Home</a>
            <a href={langPath(lang, "/tours")} className="hover:text-olive">{copy.navTours}</a>
            <a href={langPath(lang, "/partners")} className="hover:text-olive">{copy.navPartners}</a>
            <a href={langPath(lang, "/about")} className="hover:text-olive">{copy.navAbout}</a>
            <a href={langPath(lang, "/contact")} className="hover:text-olive">{copy.navContact}</a>
          </nav>
          <div className="flex items-center gap-1">
            <a href={langPath(lang, "/saved")} className="relative grid size-11 place-items-center rounded-full hover:bg-bg" aria-label={copy.wishlist}>
              <Heart className="size-4" />
              {saved.length > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-olive text-[10px] text-surface">{saved.length}</span>}
            </a>
            <div className="relative hidden sm:block">
              <button type="button" onClick={() => setLangs((v) => !v)} className="grid size-11 place-items-center rounded-full hover:bg-bg" aria-label={copy.languages}><Globe className="size-4" /></button>
              {langs && (
                <ul className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-md border border-line bg-surface shadow-lg">
                  {LANGS.map((code) => (
                    <li key={code}>
                      <a href={langPath(code, restPath)} className={cn("flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-bg", code === lang && "bg-bg font-semibold text-olive-deep")}>
                        <span>{LANG_META[code].native}</span>
                        <span className="uppercase text-faint">{code}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button asChild size="sm" className="hidden bg-gold text-ink hover:bg-gold-soft sm:inline-flex">
              <a href={langPath(lang, "/tours")}><Phone className="size-3.5" />{copy.bookNow}</a>
            </Button>
            <button type="button" className="grid size-11 place-items-center rounded-full bg-olive text-surface xl:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>
      {open ? <MobileMenu lang={lang} restPath={restPath} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
