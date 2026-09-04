"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { cn } from "@/lib/cn";

/**
 * Tour filtering.
 *
 * Every control writes to the URL rather than to component state. An earlier
 * implementation kept filters in `useState`, which meant no filtered view had
 * an address: it could not be linked, shared, bookmarked or crawled, and the
 * `?q=` parameter the home search sends was read once and then lost.
 *
 * Two surfaces share that state and the same set of groups:
 *
 * - `FilterRail` — the panel beside the results on desktop. It is a card and
 *   it sticks, because a rail that scrolls away is a rail you scroll back up
 *   to.
 * - `FilterBar` — the row above the results at every width. It owns the
 *   result count, the sort control, the chips for what is currently applied,
 *   and, below `lg`, the button that opens the same groups in a sheet.
 *
 * Below `lg` the rail is not rendered at all. Twenty pills stacked above the
 * first tour card pushed the actual product a screen and a half down on a
 * phone, which is the wrong trade on the page that has to sell.
 */

export type Facet = { value: string; label: string; count: number };

export type Facets = {
  categories: Facet[];
  durations: Facet[];
  difficulties: Facet[];
};

/** The parameters that are filters. `sort` is deliberately not one of them. */
const FILTER_KEYS = ["cat", "dur", "diff", "q"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const SORTS = ["popular", "price", "duration"] as const;

function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const commit = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      // Clicking an active pill clears it — a filter you can only add is a trap.
      if (value === null || next.get(key) === value) next.delete(key);
      else next.set(key, value);
      commit(next);
    },
    [commit, params],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    for (const key of FILTER_KEYS) next.delete(key);
    // `sort` survives. Clearing what you filtered by is not a request to
    // re-order the results you are looking at.
    commit(next);
  }, [commit, params]);

  const active: Record<FilterKey, string | null> = {
    cat: params.get("cat"),
    dur: params.get("dur"),
    diff: params.get("diff"),
    q: params.get("q"),
  };

  return {
    setParam,
    clearAll,
    active,
    count: FILTER_KEYS.filter((key) => active[key]).length,
    sort: params.get("sort") ?? "popular",
  };
}

/* ─────────────────────────── desktop rail ─────────────────────────── */

export function FilterRail({ lang, facets }: { lang: Lang; facets: Facets }) {
  const ui = t(lang);
  const { clearAll, count } = useFilters();

  return (
    <aside className="hidden lg:sticky lg:top-28 lg:block">
      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-base text-earth">{ui.filters}</h2>
          {count > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full px-2 py-1 text-xs font-semibold text-olive-deep underline decoration-olive-200 underline-offset-4 transition hover:decoration-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
            >
              {ui.filterClearAll}
            </button>
          ) : null}
        </div>
        <div className="px-5 py-5">
          <FilterGroups lang={lang} facets={facets} />
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────── toolbar, chips, sheet, sort ──────────────────── */

export function FilterBar({
  lang,
  facets,
  total,
}: {
  lang: Lang;
  facets: Facets;
  total: number;
}) {
  const ui = t(lang);
  const { active, clearAll, count, setParam } = useFilters();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const chips = [
    { key: "q" as const, label: `${ui.filterSearchTerm}: ${active.q}`, on: active.q },
    { key: "cat" as const, label: labelFor(facets.categories, active.cat), on: active.cat },
    { key: "dur" as const, label: labelFor(facets.durations, active.dur), on: active.dur },
    { key: "diff" as const, label: labelFor(facets.difficulties, active.diff), on: active.diff },
  ].filter((chip) => chip.on);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          <span className="font-semibold text-earth">{total}</span>{" "}
          {total === 1 ? ui.experience : ui.experiences}
        </p>

        <div className="flex items-center gap-2">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-earth ring-1 ring-line transition hover:ring-olive-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive lg:hidden"
          >
            <SlidersHorizontal className="size-4 text-olive" />
            {ui.filters}
            {count > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-olive text-[11px] font-semibold tabular-nums text-surface">
                {count}
              </span>
            ) : null}
          </button>

          <SortSelect lang={lang} />
        </div>
      </div>

      {chips.length > 0 ? (
        <ul className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => setParam(chip.key, null)}
                aria-label={`${ui.filterClearOne}: ${chip.label}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-olive-50 py-1.5 pl-3 pr-2.5 text-xs font-medium text-olive-deep transition hover:bg-olive-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
              >
                {chip.label}
                <X className="size-3.5" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full px-2 py-1.5 text-xs font-semibold text-faint underline underline-offset-4 transition hover:text-olive-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
            >
              {ui.filterClearAll}
            </button>
          </li>
        </ul>
      ) : null}

      {open ? (
        <FilterSheet
          lang={lang}
          facets={facets}
          total={total}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      ) : null}
    </>
  );
}

function labelFor(facets: Facet[], value: string | null) {
  if (!value) return "";
  return facets.find((facet) => facet.value === value)?.label ?? value;
}

function SortSelect({ lang }: { lang: Lang }) {
  const ui = t(lang);
  const { setParam, sort } = useFilters();
  const labels: Record<(typeof SORTS)[number], string> = {
    popular: ui.sortPopular,
    price: ui.sortPrice,
    duration: ui.sortDuration,
  };

  return (
    <label className="inline-flex items-center gap-2 rounded-full bg-surface py-2 pl-4 pr-2 text-sm ring-1 ring-line focus-within:ring-olive-200">
      <span className="text-faint">{ui.sortBy}</span>
      <select
        value={sort}
        onChange={(event) =>
          // "popular" is the default, so it is the absence of the parameter
          // rather than a value for it — no `?sort=popular` in shared links.
          setParam("sort", event.target.value === "popular" ? null : event.target.value)
        }
        className="cursor-pointer appearance-none bg-transparent pr-1 font-semibold text-earth focus:outline-none"
      >
        {SORTS.map((value) => (
          <option key={value} value={value}>
            {labels[value]}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterSheet({
  lang,
  facets,
  total,
  onClose,
}: {
  lang: Lang;
  facets: Facets;
  total: number;
  onClose: () => void;
}) {
  const ui = t(lang);
  const { clearAll, count } = useFilters();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Without this the page behind the sheet scrolls under the reader's
    // finger while they are still choosing.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        aria-label={ui.filterClose}
        onClick={onClose}
        className="absolute inset-0 bg-hero/45 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ui.filters}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-surface shadow-[0_-24px_60px_-20px_rgba(57,36,32,0.55)] focus:outline-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg text-earth">{ui.filters}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={ui.filterClose}
            className="grid size-9 place-items-center rounded-full text-earth transition hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <FilterGroups lang={lang} facets={facets} />
        </div>

        <div className="flex items-center gap-3 border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          {count > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full px-3 py-2.5 text-sm font-semibold text-muted underline underline-offset-4 transition hover:text-olive-deep"
            >
              {ui.filterClearAll}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full bg-olive px-6 py-2.5 text-sm font-semibold text-surface transition hover:bg-olive-deep"
          >
            {ui.filterShow} {total} {total === 1 ? ui.experience : ui.experiences}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── the groups themselves ────────────────────────── */

function FilterGroups({ lang, facets }: { lang: Lang; facets: Facets }) {
  const ui = t(lang);
  const { active, setParam } = useFilters();
  // The rail and the sheet both render these groups, so the ids that tie each
  // heading to its group have to be unique per instance.
  const headingPrefix = useId();

  const groups: Array<{ key: FilterKey; title: string; facets: Facet[] }> = [
    { key: "cat", title: ui.filterCategory, facets: facets.categories },
    { key: "dur", title: ui.filterDuration, facets: facets.durations },
    { key: "diff", title: ui.difficulty, facets: facets.difficulties },
  ];

  return (
    <div className="grid gap-5">
      {/* A plain labelled group, not a fieldset: a `legend` sits *on* the
          element's top border and punches a gap through it, which is exactly
          the broken hairline it produced above each heading here. */}
      {groups.map((group) => (
        <div
          key={group.key}
          role="group"
          aria-labelledby={`${headingPrefix}-${group.key}`}
          className="border-t border-line pt-5 first:border-t-0 first:pt-0"
        >
          <h3
            id={`${headingPrefix}-${group.key}`}
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint"
          >
            {group.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.facets.map((facet) => (
              <Pill
                key={facet.value}
                active={active[group.key] === facet.value}
                count={facet.count}
                emptyLabel={ui.filterNoneMatch}
                onClick={() => setParam(group.key, facet.value)}
              >
                {facet.label}
              </Pill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Pill({
  active,
  count,
  emptyLabel,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  emptyLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  // A facet that would return nothing given the other filters is shown, but
  // dead. Hiding it makes the group jump around as you click; leaving it live
  // invites a click that empties the page.
  const empty = count === 0 && !active;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={empty}
      aria-pressed={active}
      title={empty ? emptyLabel : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive",
        active && "bg-olive text-surface shadow-[0_6px_16px_-10px_rgba(57,36,32,0.8)]",
        !active && !empty && "bg-bg text-ink ring-1 ring-line hover:ring-olive-200",
        empty && "cursor-not-allowed bg-bg/60 text-faint/60 ring-1 ring-line/60",
      )}
    >
      {active ? <Check className="size-3" /> : null}
      {children}
      <span className={cn("tabular-nums", active ? "text-surface/70" : "text-faint")}>{count}</span>
    </button>
  );
}
