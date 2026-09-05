"use client";

import { CalendarCheck, Camera, CarFront, ChevronDown, Menu, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fill, LANGS, LANG_META, type Lang, langPath } from "@/lib/i18n/langs";
import { activeNavId, navCopy } from "@/lib/i18n/nav";
import { t } from "@/lib/i18n/ui";
import { PHONE, PHONE_DISPLAY, WHATSAPP } from "@/lib/site";
import { bookNowTarget } from "@/lib/travelotopos";
import { cn } from "@/lib/cn";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { MegaMenu } from "@/components/nav/mega-menu";
import { NavDropdown } from "@/components/nav/nav-dropdown";
import type { NavEntry } from "@/lib/nav/catalog";
import type { HubId } from "@/lib/nav/hubs";
import { GoogleWordmark, Stars } from "@/components/trust/source-logos";

/**
 * Site header: edge-to-edge promo strip, primary bar, and a full-bleed
 * mega menu for Crete Tours. Booking CTA opens the matching Travelotopos
 * listing on a live tour page, the request form on the others, and the
 * catalog everywhere else.
 */
export function Header({
  lang,
  rating,
  nav,
}: {
  lang: Lang;
  rating?: { average: number; count: number } | null;
  nav: NavEntry[];
}) {
  const copy = t(lang);
  const labels = navCopy(lang);
  const pathname = usePathname();
  const restPath = pathname.replace(/^\/(en|de|it|fr|sv)(?=\/|$)/, "") || "";
  const book = bookNowTarget(pathname);
  const current = activeNavId(pathname);
  const [sheet, setSheet] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [hub, setHub] = useState<HubId>("outdoor-activities-nature-tours-crete");
  const [langs, setLangs] = useState(false);
  const langBox = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    setOpen(null);
    setLangs(false);
    setSheet(false);
  }, [pathname]);

  useEffect(() => {
    if (!langs) return;
    const onDown = (event: MouseEvent | TouchEvent) => {
      if (!langBox.current?.contains(event.target as Node)) setLangs(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLangs(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [langs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(null), 160);
  };

  const openMenu = (id: string) => {
    cancelClose();
    setLangs(false);
    setOpen(id);
  };

  return (
    <>
      <header
        className="sticky top-0 z-[60] border-b border-line bg-surface/95 backdrop-blur"
        onMouseLeave={scheduleClose}
        onMouseEnter={cancelClose}
      >
        <PromoStrip lang={lang} rating={rating} />

        <div className="flex h-16 items-center gap-3 px-3 sm:px-5 lg:h-[78px] lg:px-6 xl:px-8">
          <BrandLogo lang={lang} />

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
            aria-label={copy.menu}
          >
            <ul className="flex items-center gap-0.5">
              {nav.map((item) => (
                <li
                  key={item.id}
                  className={cn("relative", item.kind === "mega" && "static")}
                  onMouseEnter={() => {
                    if (item.kind !== "link") openMenu(item.id);
                    else setOpen(null);
                  }}
                >
                  <NavTrigger
                    item={item}
                    active={current === item.id}
                    expanded={open === item.id}
                    openLabel={labels.openMenu}
                    onToggle={() => {
                      if (item.kind === "link") return;
                      if (open === item.id) setOpen(null);
                      else openMenu(item.id);
                    }}
                  />
                  {item.kind === "mega" && open === item.id ? (
                    <MegaMenu
                      item={item}
                      lang={lang}
                      activeHub={hub}
                      onHub={setHub}
                      onNavigate={() => setOpen(null)}
                    />
                  ) : null}
                  {item.kind === "menu" && open === item.id ? (
                    <NavDropdown item={item} lang={lang} onNavigate={() => setOpen(null)} />
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
            <ThemeToggle toLight={copy.themeToLight} toDark={copy.themeToDark} />
            <div className="relative" ref={langBox}>
              <button
                type="button"
                onClick={() => {
                  setOpen(null);
                  setLangs((v) => !v);
                }}
                aria-label={copy.languages}
                aria-expanded={langs}
                className="flex h-10 items-center gap-0.5 rounded-full px-2 text-[11px] font-bold uppercase tracking-wider text-ink ring-1 ring-line transition hover:bg-bg sm:px-2.5"
              >
                {LANG_META[lang].hreflang}
                <ChevronDown className={cn("size-3 transition", langs && "rotate-180")} />
              </button>
              {langs ? (
                <ul className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                  {LANGS.map((code) => (
                    <li key={code}>
                      <Link
                        href={langPath(code, restPath)}
                        onClick={() => setLangs(false)}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-bg",
                          code === lang && "bg-bg font-semibold text-accent",
                        )}
                      >
                        <span>{LANG_META[code].native}</span>
                        <span className="uppercase text-faint">{code}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <a
              href={book.href}
              {...(book.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-olive px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-olive-deep sm:px-4 sm:text-xs"
            >
              <CalendarCheck className="size-3.5 shrink-0" />
              <span className="truncate">{labels.bookNow}</span>
            </a>

            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-olive text-paper xl:hidden"
              onClick={() => setSheet(true)}
              aria-label={copy.menu}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

      </header>
      {open ? (
        <button
          type="button"
          aria-label={copy.menuClose}
          className="fixed inset-0 z-50 hidden cursor-default bg-hero/25 xl:block"
          onClick={() => setOpen(null)}
        />
      ) : null}
      {sheet ? (
        <MobileMenu
          lang={lang}
          restPath={restPath}
          rating={rating}
          nav={nav}
          bookNowHref={book.href}
          bookNowExternal={book.external}
          onClose={() => setSheet(false)}
        />
      ) : null}
    </>
  );
}

function NavTrigger({
  item,
  active,
  expanded,
  openLabel,
  onToggle,
}: {
  item: NavEntry;
  active: boolean;
  expanded: boolean;
  openLabel: string;
  onToggle: () => void;
}) {
  const className = cn(
    "inline-flex items-center gap-0.5 rounded-full px-2.5 py-2 text-[12px] font-semibold tracking-[0.04em] text-ink transition hover:text-accent",
    (active || expanded) && "text-accent",
  );

  if (!item.href) {
    return (
      <button
        type="button"
        className={className}
        aria-expanded={expanded}
        aria-haspopup="true"
        onClick={onToggle}
      >
        {item.label}
        <ChevronDown className={cn("size-3.5 transition", expanded && "rotate-180")} />
      </button>
    );
  }

  return (
    <span className="inline-flex items-center">
      <Link
        href={item.href}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
      {item.kind !== "link" ? (
        <button
          type="button"
          className={cn("grid size-7 place-items-center rounded-full text-ink hover:bg-bg", expanded && "text-accent")}
          aria-label={`${openLabel}: ${item.label}`}
          aria-expanded={expanded}
          aria-haspopup="true"
          aria-controls={item.kind === "mega" ? "nav-mega-tours" : `nav-menu-${item.id}`}
          onClick={onToggle}
        >
          <ChevronDown className={cn("size-3.5 transition", expanded && "rotate-180")} />
        </button>
      ) : null}
    </span>
  );
}

function PromoStrip({
  lang,
  rating,
}: {
  lang: Lang;
  rating?: { average: number; count: number } | null;
}) {
  const copy = t(lang);
  return (
    <div className="hidden border-b border-olive-800/40 bg-olive text-paper lg:block">
      <div className="flex items-center justify-between gap-4 px-6 py-1.5 text-[11px] font-medium xl:px-8">
        <ul className="flex flex-wrap items-center gap-x-5">
          <li className="inline-flex items-center gap-1.5">
            <CalendarCheck className="size-3 text-paper" />
            {copy.freeCancel}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <CarFront className="size-3 text-paper" />
            {copy.pickup}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Camera className="size-3 text-paper" />
            {copy.photoshoot}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Users className="size-3 text-paper" />
            {copy.smallGroup}
          </li>
        </ul>
        <div className="flex items-center gap-4">
          {rating ? (
            <Link
              href={langPath(lang, "/reviews")}
              className="inline-flex items-center gap-2 hover:text-paper"
            >
              <Stars
                value={rating.average}
                size={12}
                label={fill(copy.starsOutOf, { n: rating.average.toFixed(1) })}
              />
              <span className="font-semibold">{rating.average.toFixed(1)}</span>
              <span className="rounded-sm bg-surface px-1.5 py-0.5">
                <GoogleWordmark className="h-2.5 w-auto" />
              </span>
              <span>
                {rating.count} {copy.reviews}
              </span>
            </Link>
          ) : null}
          <a href={WHATSAPP} className="hover:text-paper">
            {copy.whatsapp}
          </a>
          <a href={`tel:${PHONE}`} className="hover:text-paper">
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
}
