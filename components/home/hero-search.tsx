"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CornerDownLeft,
  Mountain,
  Plane,
  Search,
  Users,
  BookOpen,
} from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { SearchIndex, SearchItem, SearchKind } from "@/lib/search-index";

/**
 * The hero search.
 *
 * A combobox over the whole catalogue rather than a free-text box that only
 * ever led to `/tours?q=`. Most visitors arrive knowing the noun — "Samaria",
 * "Elafonisi", "airport" — and the previous field made them guess whether we
 * sold it, submit, and find out on a filtered listing. Now the answer is in
 * the dropdown before they finish the word, and the tours and the airport
 * runs sit in it side by side, because a guest searching "chania" may want
 * either.
 *
 * The index is built on the server (`lib/search-index.ts`) and passed in, so
 * filtering is local and instant. Date and party size still ride along to
 * whatever is selected.
 */

const KIND_ICON: Record<SearchKind, React.ComponentType<{ className?: string }>> = {
  tour: Mountain,
  transfer: Plane,
  place: Mountain,
  guide: BookOpen,
};

/** The order groups appear in. Transfers rank above places and guides
 *  because they are the other thing we sell. */
const KIND_ORDER: SearchKind[] = ["tour", "transfer", "place", "guide"];

const MAX_RESULTS = 8;

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function score(item: SearchItem, needle: string): number {
  const title = fold(item.title);
  if (title.startsWith(needle)) return 0;
  if (title.includes(needle)) return 1;
  if (item.keywords.includes(` ${needle}`) || item.keywords.startsWith(needle)) return 2;
  if (item.keywords.includes(needle)) return 3;
  return -1;
}

export function HeroSearch({ lang, index }: { lang: Lang; index: SearchIndex }) {
  const copy = t(lang);
  const router = useRouter();
  const listId = useId();

  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const needle = fold(q.trim());

    // Nothing typed yet: show what we most want a first-time visitor to
    // discover — the tours they book most, and the two airport runs.
    if (!needle) {
      const featured = index.items.filter((i) => i.featured);
      const tours = featured.filter((i) => i.kind === "tour").slice(0, 5);
      const transfers = featured.filter((i) => i.kind === "transfer").slice(0, 3);
      return [...tours, ...transfers];
    }

    return index.items
      .map((item) => ({ item, rank: score(item, needle) }))
      .filter((x) => x.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.item.title.localeCompare(b.item.title))
      .slice(0, MAX_RESULTS)
      .map((x) => x.item);
  }, [q, index.items]);

  // Grouped for display, but `results` stays the flat keyboard order so
  // ArrowDown walks the list the reader sees.
  const groups = useMemo(() => {
    const byKind = new Map<SearchKind, SearchItem[]>();
    for (const item of results) {
      const bucket = byKind.get(item.kind);
      if (bucket) bucket.push(item);
      else byKind.set(item.kind, [item]);
    }
    return KIND_ORDER.filter((k) => byKind.has(k)).map((kind) => ({
      kind,
      items: byKind.get(kind)!,
    }));
  }, [results]);

  useEffect(() => setActive(0), [q]);

  // Close on an outside click. Focus-out alone is not enough: a mouse press
  // on a result blurs the input before the click lands.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  /** Selection carries the date and party size onto the target page. */
  function hrefFor(item: SearchItem) {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (guests && guests !== "2") params.set("guests", guests);
    return params.size ? `${item.href}?${params}` : item.href;
  }

  /** The fallback when nothing is picked: the filtered tour listing. */
  function fallbackHref() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (date) params.set("date", date);
    if (guests) params.set("guests", guests);
    return `${langPath(lang, "/tours")}${params.size ? `?${params}` : ""}`;
  }

  function go(item?: SearchItem) {
    setOpen(false);
    router.push(item ? hrefFor(item) : fallbackHref());
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (results.length ? (i + delta + results.length) % results.length : 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(open ? results[active] : undefined);
    }
  }

  function focusField() {
    setOpen(true);
    // iOS zooms any field under 16px and then leaves the page stuck
    // mid-zoom. The inputs themselves are 16px; this just keeps the
    // card above the keyboard instead of under the sticky header.
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    window.setTimeout(() => {
      rootRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 50);
  }

  return (
    <div ref={rootRef} className="relative scroll-mt-20">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(open && results.length ? results[active] : undefined);
        }}
        className="grid gap-px overflow-hidden rounded-2xl bg-line shadow-[0_28px_70px_-30px_rgba(57,36,32,0.55)] ring-1 ring-line md:grid-cols-[1.5fr_1fr_0.75fr_auto]"
      >
        <label className="flex items-center gap-3 bg-surface px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive-50">
            <Search className="size-4 text-olive" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              {copy.searchWhere}
            </span>
            <input
              ref={inputRef}
              name="q"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setOpen(true);
              }}
              onFocus={focusField}
              onKeyDown={onKeyDown}
              placeholder={copy.searchHint}
              autoComplete="off"
              enterKeyHint="search"
              autoCorrect="off"
              autoCapitalize="none"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                open && results[active] ? `${listId}-${results[active].id}` : undefined
              }
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-faint"
            />
          </span>
        </label>

        <Field icon={<CalendarDays className="size-4 text-olive" />} label={copy.holdDate}>
          <input
            type="date"
            name="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full bg-transparent text-base text-ink outline-none"
          />
        </Field>

        <Field icon={<Users className="size-4 text-olive" />} label={copy.guests}>
          <input
            type="number"
            name="guests"
            min={1}
            max={19}
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
            inputMode="numeric"
            className="w-full bg-transparent text-base text-ink outline-none"
          />
        </Field>

        <div className="bg-surface p-2">
          <button
            type="submit"
            className="flex h-full min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-olive px-7 text-sm font-semibold text-surface transition hover:bg-olive-deep"
          >
            <Search className="size-4" />
            {copy.checkAvail}
          </button>
        </div>
      </form>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl bg-surface shadow-[0_40px_90px_-30px_rgba(57,36,32,0.6)] ring-1 ring-line">
          {results.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted">
              <p>{copy.searchNoResults}</p>
              <Link
                href={langPath(lang, "/tours")}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-deep hover:text-olive"
                onClick={() => setOpen(false)}
              >
                {copy.searchSeeAll}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <>
              <ul id={listId} role="listbox" aria-label={copy.searchWhere} className="max-h-[min(22rem,50dvh)] overflow-y-auto py-2">
                {groups.map((group) => (
                  <li key={group.kind} role="presentation">
                    <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
                      {index.labels[group.kind]}
                    </p>
                    <ul role="presentation">
                      {group.items.map((item) => {
                        const flatIndex = results.indexOf(item);
                        const Icon = KIND_ICON[item.kind];
                        return (
                          <li key={item.id} role="presentation">
                            <Link
                              id={`${listId}-${item.id}`}
                              role="option"
                              aria-selected={flatIndex === active}
                              href={hrefFor(item)}
                              onMouseEnter={() => setActive(flatIndex)}
                              onClick={() => setOpen(false)}
                              className={[
                                "flex items-center gap-3 px-5 py-2.5 transition",
                                flatIndex === active ? "bg-olive-50" : "",
                              ].join(" ")}
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt=""
                                  width={48}
                                  height={48}
                                  className="size-11 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-olive-50 text-olive">
                                  <Icon className="size-4" />
                                </span>
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-earth">
                                  {item.title}
                                </span>
                                <span className="block truncate text-xs text-faint">{item.hint}</span>
                              </span>
                              {flatIndex === active ? (
                                <CornerDownLeft className="size-3.5 shrink-0 text-olive" />
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>

              <div className="border-t border-line px-5 py-2.5">
                <Link
                  href={fallbackHref()}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-olive-deep hover:text-olive"
                >
                  {copy.searchSeeAll}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 bg-surface px-4 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive-50">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}
