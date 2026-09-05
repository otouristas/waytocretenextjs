"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Minus,
  Plus,
} from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { fill } from "@/lib/i18n/langs";
import { plannerCopy } from "@/lib/i18n/planner";
import type { PlannerAddon, PlannerInterest } from "@/lib/content/schema";
import {
  CUSTOM_DAY_PRICE,
  PLANNER_STARTS,
  PLANNER_STOPS,
  clampStay,
  clock,
  feasibility,
  geoOf,
  googleMapsDir,
  hoursClock,
  matchPackagedTour,
  parsePlannerSearch,
  routeLabels,
  serializePlannerSearch,
  startName,
  stopBlurb,
  stopName,
  stopOf,
  suggestDay,
  tripDuration,
  type PlannerState,
} from "@/lib/planner";
import { quote } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { sendRequest } from "@/lib/send-request";
import { SITE_ORIGIN, WHATSAPP } from "@/lib/site";
import { setDeskDock } from "@/lib/desk/bus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PlannerMapPin } from "@/components/planner/crete-map";
import { cn } from "@/lib/cn";

const CreteMap = dynamic(
  () => import("@/components/planner/crete-map").then((m) => m.CreteMap),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-olive-50" /> },
);

const INTERESTS: PlannerInterest[] = [
  "beach",
  "villages",
  "food",
  "wine",
  "history",
  "hiking",
  "hidden",
  "nature",
];

const ADDONS: PlannerAddon[] = ["guide", "lunch", "wine", "experience"];

const SELECT =
  "h-11 w-full rounded-md border border-line bg-bg px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring";

export type PlannerTwin = {
  slug: string;
  title: string;
  href: string;
  priceFrom: number | null;
};

export function PlannerApp({
  lang,
  twins,
}: {
  lang: Lang;
  twins: Record<string, PlannerTwin>;
}) {
  const copy = plannerCopy(lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<PlannerState>(() => parsePlannerSearch(searchParams));
  const [phase, setPhase] = useState<"onboard" | "build">(() =>
    parsePlannerSearch(searchParams).stops.length ? "build" : "onboard",
  );
  const [justCreated, setJustCreated] = useState(false);
  const [category, setCategory] = useState<PlannerInterest | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hotel, setHotel] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const q = serializePlannerSearch(state);
    const next = q ? `${pathname}?${q}` : pathname;
    router.replace(next, { scroll: false });
  }, [state, pathname, router]);

  useEffect(() => {
    const active = phase !== "onboard";
    setDeskDock(active);
    return () => setDeskDock(false);
  }, [phase]);

  const trip = useMemo(() => tripDuration(state.start, state.stops), [state.start, state.stops]);
  const party = { adults: state.people, children: 0, infants: 0 };
  const q = useMemo(
    () => quote(CUSTOM_DAY_PRICE, party, state.date || undefined, trip.billableHours),
    [state.people, state.date, trip.billableHours],
  );
  const feas = useMemo(() => feasibility(state.start, state.stops), [state.start, state.stops]);
  const twin = matchPackagedTour(state.stops);
  const twinInfo = twin ? twins[twin.slug] : null;

  const stopNames = state.stops.map((s) => stopName(s.slug, lang));
  const routeLine = routeLabels(startName(state.start, lang), stopNames);

  const startGeo = geoOf(state.start);
  const routePts = [
    ...(startGeo ? [startGeo] : []),
    ...state.stops.map((s) => geoOf(s.slug)).filter((g): g is { lat: number; lng: number } => !!g),
    ...(startGeo ? [startGeo] : []),
  ];

  const pins = useMemo(() => {
    const next: PlannerMapPin[] = [];
    if (startGeo) {
      next.push({
        slug: state.start,
        lat: startGeo.lat,
        lng: startGeo.lng,
        kind: "start",
        label: startName(state.start, lang),
      });
    }
    for (const [index, stop] of state.stops.entries()) {
      const geo = geoOf(stop.slug);
      if (!geo) continue;
      next.push({
        slug: stop.slug,
        lat: geo.lat,
        lng: geo.lng,
        kind: "stop",
        label: stopName(stop.slug, lang),
        order: index + 1,
      });
    }
    const extras =
      category === "all"
        ? []
        : PLANNER_STOPS.filter(
            (stop) =>
              stop.categories.includes(category) && !state.stops.some((s) => s.slug === stop.slug),
          );
    for (const stop of extras) {
      next.push({
        slug: stop.slug,
        lat: stop.geo.lat,
        lng: stop.geo.lng,
        kind: "available",
        label: stopName(stop.slug, lang),
      });
    }
    if (
      selected &&
      selected !== state.start &&
      !next.some((pin) => pin.slug === selected)
    ) {
      const geo = geoOf(selected);
      if (geo) {
        next.push({
          slug: selected,
          lat: geo.lat,
          lng: geo.lng,
          kind: "available",
          label: stopName(selected, lang),
        });
      }
    }
    return next;
  }, [startGeo, state.start, state.stops, category, selected]);

  const visibleStops = PLANNER_STOPS.filter((stop) =>
    category === "all" ? true : stop.categories.includes(category),
  );

  const mapsUrl = googleMapsDir(routePts);
  const sharePath = `${pathname}${serializePlannerSearch(state) ? `?${serializePlannerSearch(state)}` : ""}`;
  const shareUrl = `${SITE_ORIGIN}${sharePath}`;
  const priceLabel = q.kind === "priced" ? formatPrice(lang, q.total) : copy.fromPrice;

  function update(partial: Partial<PlannerState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function toggleInterest(interest: PlannerInterest) {
    update({
      interests: state.interests.includes(interest)
        ? state.interests.filter((i) => i !== interest)
        : [...state.interests, interest],
    });
  }

  function createSuggested() {
    const { stops } = suggestDay(state.interests, state.start);
    update({ stops });
    setPhase("build");
    setJustCreated(true);
    if (stops[0]) setSelected(stops[0].slug);
  }

  function addStop(slug: string) {
    if (state.stops.some((s) => s.slug === slug)) {
      setSelected(slug);
      setPhase("build");
      return;
    }
    const stop = stopOf(slug);
    if (!stop) return;
    update({ stops: [...state.stops, { slug, stayMin: stop.suggestedStayMin }] });
    setSelected(slug);
    setPhase("build");
  }

  function removeStop(slug: string) {
    update({ stops: state.stops.filter((s) => s.slug !== slug) });
  }

  function moveStop(slug: string, dir: -1 | 1) {
    const i = state.stops.findIndex((s) => s.slug === slug);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= state.stops.length) return;
    const next = [...state.stops];
    [next[i], next[j]] = [next[j], next[i]];
    update({ stops: next });
  }

  function setStay(slug: string, stayMin: number) {
    update({
      stops: state.stops.map((s) => (s.slug === slug ? { ...s, stayMin: clampStay(slug, stayMin) } : s)),
    });
  }

  function applyRewrite() {
    if (!feas.rewrite?.length) return;
    update({
      stops: feas.rewrite.map((slug) => {
        const existing = state.stops.find((s) => s.slug === slug);
        const stop = stopOf(slug);
        return existing ?? { slug, stayMin: stop?.suggestedStayMin ?? 60 };
      }),
    });
  }

  function toggleAddon(addon: PlannerAddon) {
    update({
      addons: state.addons.includes(addon)
        ? state.addons.filter((a) => a !== addon)
        : [...state.addons, addon],
    });
  }

  function itineraryMessage() {
    const extras = state.addons.length
      ? `\nAdd-ons: ${state.addons.map((a) => copy.addonsLabel[a]).join(", ")}`
      : "";
    const price = q.kind === "priced" ? formatPrice(lang, q.total) : copy.fromPrice;
    return [
      copy.title,
      `${state.date || "date TBC"} · ${state.people} ${copy.guests}`,
      routeLine,
      `${hoursClock(trip.billableHours)} · ${price} · ${copy.privateTour}`,
      extras.trim(),
      shareUrl,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const result = await sendRequest({
      kind: "custom-day",
      lang,
      slug: "create-your-own-crete-experience",
      name,
      email,
      phone,
      hotel,
      date: state.date,
      guests: state.people,
      pickup: startName(state.start, lang),
      message: note.trim() || undefined,
      itinerary: {
        start: startName(state.start, lang),
        route: routeLine,
        stops: state.stops.map((s) => ({ name: stopName(s.slug, lang), stay: clock(s.stayMin) })),
        driving: clock(trip.drivingMin),
        stays: clock(trip.stayMin),
        billed: hoursClock(trip.billableHours),
        price: q.kind === "priced" ? formatPrice("en", q.total) : plannerCopy("en").fromPrice,
        addons: state.addons.map((a) => plannerCopy("en").addonsLabel[a]),
        shareUrl,
        mapsUrl: mapsUrl ?? undefined,
      },
    });
    setSending(false);
    if (result.ok) setSent(true);
    else if (result.mailto) window.location.href = result.mailto;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function openBook() {
    setBookOpen(true);
    window.setTimeout(
      () => document.getElementById("booking-panel")?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  function onMapSelect(slug: string) {
    setSelected(slug);
    if (PLANNER_STOPS.some((s) => s.slug === slug) && !state.stops.some((s) => s.slug === slug)) {
      addStop(slug);
    }
  }

  const rail = (
    <StudioRail
      copy={copy}
      lang={lang}
      state={state}
      trip={trip}
      routeLine={routeLine}
      priceLabel={priceLabel}
      feasBlocked={feas.blocked}
      pins={pins}
      route={state.stops.length ? routePts : []}
      selected={selected}
      onSelect={onMapSelect}
      mapsUrl={mapsUrl}
      onMove={moveStop}
      onStay={setStay}
      onRemove={removeStop}
      onToggleAddon={toggleAddon}
      onBook={openBook}
      onCopy={copyLink}
      copied={copied}
      whatsappHref={`${WHATSAPP}?text=${encodeURIComponent(itineraryMessage())}`}
    />
  );

  if (phase === "onboard") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <Onboard
          lang={lang}
          state={state}
          onStart={(start) => update({ start })}
          onPeople={(people) => update({ people })}
          onDate={(date) => update({ date })}
          onToggle={toggleInterest}
          onCreate={createSuggested}
          onSkip={() => setPhase("build")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 pb-28 pt-8 md:px-6 md:pt-10 lg:pb-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{copy.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink md:text-[2.5rem]">{copy.title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          {state.stops.length ? routeLine : copy.lead}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
          <Field label={copy.start}>
            <select className={SELECT} value={state.start} onChange={(e) => update({ start: e.target.value })}>
              {PLANNER_STARTS.map((start) => (
                <option key={start.slug} value={start.slug}>
                  {startName(start.slug, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.people}>
            <select
              className={SELECT}
              value={state.people}
              onChange={(e) => update({ people: Number(e.target.value) })}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.date}>
            <Input type="date" value={state.date} onChange={(e) => update({ date: e.target.value })} />
          </Field>
        </div>
      </header>

      <div className="mt-8 grid min-w-0 items-start gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="order-2 flex min-w-0 flex-col gap-8 lg:order-1">
          {justCreated ? (
            <div className="rounded-2xl bg-olive-50 px-5 py-4 ring-1 ring-olive-200">
              <p className="font-display text-xl text-ink">{copy.weCreated}</p>
              <p className="mt-1 text-sm text-muted">
                {hoursClock(trip.billableHours)} · {priceLabel} · {copy.privateTour}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setJustCreated(false)}>
                  {copy.useThis}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setJustCreated(false)}>
                  {copy.changeStops}
                </Button>
              </div>
            </div>
          ) : null}

          {feas.warn ? (
            <div
              className={cn(
                "rounded-2xl p-4 text-sm leading-relaxed ring-1",
                feas.blocked
                  ? "bg-clay/10 text-ink ring-clay/30"
                  : "bg-olive-50 text-ink ring-olive-200",
              )}
            >
              <p>{feas.message || copy.longWarn}</p>
              {feas.rewrite?.length ? (
                <button type="button" onClick={applyRewrite} className="mt-2 text-sm font-semibold text-accent">
                  {copy.rewrite}
                </button>
              ) : null}
            </div>
          ) : null}

          {twinInfo ? (
            <div className="rounded-2xl bg-olive-50 p-4 text-sm text-ink ring-1 ring-olive-200">
              <p>{fill(copy.packagedLead, { title: twinInfo.title })}</p>
              <Link href={twinInfo.href} className="mt-2 inline-block font-semibold text-accent hover:text-accent">
                {copy.bookPackaged}
                {twinInfo.priceFrom != null ? ` · ${formatPrice(lang, twinInfo.priceFrom)}` : ""}
              </Link>
            </div>
          ) : null}

          <div>
            <div className="flex gap-2 overflow-x-auto pt-1 pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>
                {copy.all}
              </Chip>
              {INTERESTS.map((interest) => (
                <Chip key={interest} active={category === interest} onClick={() => setCategory(interest)}>
                  {copy.categories[interest]}
                </Chip>
              ))}
            </div>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {visibleStops.map((stop) => {
              const added = state.stops.some((s) => s.slug === stop.slug);
              return (
                <li key={stop.slug}>
                  <article
                    className={cn(
                      "flex h-full flex-col rounded-2xl bg-surface p-5 ring-1 ring-line transition",
                      selected === stop.slug && "ring-2 ring-olive",
                      added && "bg-olive-50/70",
                    )}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                      {copy.categories[stop.categories[0]]}
                    </p>
                    <h2 className="mt-1.5 font-display text-xl leading-snug text-ink">{stopName(stop.slug, lang)}</h2>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{stopBlurb(stop.slug, lang)}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs text-faint">
                        <Clock className="size-3.5" />
                        {clock(stop.suggestedStayMin)}
                      </p>
                      {added ? (
                        <Button size="sm" variant="outline" onClick={() => removeStop(stop.slug)}>
                          {copy.remove}
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => addStop(stop.slug)}>
                          <Plus className="size-3.5" /> {copy.add}
                        </Button>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {(bookOpen || sent) && (
            <section id="booking-panel" className="mt-10 max-w-xl scroll-mt-28">
              {sent ? (
                <div className="rounded-2xl bg-surface p-6 ring-1 ring-line">
                  <div className="grid size-11 place-items-center rounded-full bg-olive-50 text-accent">
                    <Check className="size-5" />
                  </div>
                  <p className="mt-4 font-display text-2xl text-ink">{copy.sent}</p>
                  <p className="mt-2 text-sm text-muted">{copy.submitted}</p>
                </div>
              ) : (
                <form onSubmit={submit} className="rounded-2xl bg-surface p-6 ring-1 ring-line">
                  <h2 className="font-display text-2xl text-ink">{copy.bookTitle}</h2>
                  <p className="mt-1 text-sm text-muted">{routeLine}</p>
                  <div className="mt-5 grid gap-3">
                    <Field label={copy.name}>
                      <Input required value={name} onChange={(e) => setName(e.target.value)} />
                    </Field>
                    <Field label={copy.email}>
                      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    <Field label={copy.hotel}>
                      <Input value={hotel} onChange={(e) => setHotel(e.target.value)} />
                    </Field>
                    <Field label={copy.phone}>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </Field>
                    <Field label={copy.message}>
                      <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
                    </Field>
                  </div>
                  <Button type="submit" className="mt-5 w-full" size="lg" disabled={sending}>
                    {sending ? copy.sending : copy.send}
                  </Button>
                </form>
              )}
            </section>
          )}
          </div>
        </div>

        <div className="order-1 min-w-0 w-full lg:order-2 lg:sticky lg:top-28 lg:self-start">{rail}</div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="glass-pill pointer-events-auto mx-auto flex max-w-lg items-center gap-3 rounded-full p-2 pl-4">
          <p className="min-w-0 leading-none">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-faint">
              {hoursClock(trip.billableHours)}
            </span>
            <span className="font-display text-base font-semibold text-ink">{priceLabel}</span>
          </p>
          <button
            type="button"
            disabled={feas.blocked || state.stops.length === 0}
            onClick={openBook}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-olive px-4 text-sm font-semibold text-paper disabled:opacity-50"
          >
            {copy.bookMyTour}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudioRail({
  copy,
  lang,
  state,
  trip,
  routeLine,
  priceLabel,
  feasBlocked,
  pins,
  route,
  selected,
  onSelect,
  mapsUrl,
  onMove,
  onStay,
  onRemove,
  onToggleAddon,
  onBook,
  onCopy,
  copied,
  whatsappHref,
}: {
  copy: ReturnType<typeof plannerCopy>;
  lang: Lang;
  state: PlannerState;
  trip: ReturnType<typeof tripDuration>;
  routeLine: string;
  priceLabel: string;
  feasBlocked: boolean;
  pins: readonly PlannerMapPin[];
  route: ReadonlyArray<{ lat: number; lng: number }>;
  selected: string | null;
  onSelect: (slug: string) => void;
  mapsUrl: string | null;
  onMove: (slug: string, dir: -1 | 1) => void;
  onStay: (slug: string, stayMin: number) => void;
  onRemove: (slug: string) => void;
  onToggleAddon: (addon: PlannerAddon) => void;
  onBook: () => void;
  onCopy: () => void;
  copied: boolean;
  whatsappHref: string;
}) {
  return (
    <div className="grid gap-4">
      <figure className="min-w-0 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        <div className="planner-map-frame relative isolate z-0 aspect-[16/10] w-full min-w-0">
          <CreteMap pins={pins} route={route} selected={selected} onSelect={onSelect} />
        </div>
        {mapsUrl ? (
          <figcaption className="border-t border-line px-4 py-2.5">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-ink"
            >
              <ExternalLink className="size-3.5" />
              {copy.openMaps}
            </a>
          </figcaption>
        ) : null}
      </figure>

      <aside className="rounded-2xl bg-surface p-5 ring-1 ring-line md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{copy.yourTrip}</p>
        <p className="mt-2 font-display text-lg leading-snug text-ink">
          {state.stops.length ? routeLine : copy.emptyTrip}
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat label={copy.driving} value={clock(trip.drivingMin)} icon={<Car className="size-3.5" />} />
          <Stat label={copy.stays} value={clock(trip.stayMin)} icon={<MapPin className="size-3.5" />} />
          <Stat
            label={copy.total}
            value={hoursClock(trip.billableHours)}
            icon={<Clock className="size-3.5" />}
          />
        </dl>
        <p className="mt-2 text-center text-[11px] text-faint">{copy.minNote}</p>

        {state.stops.length > 0 ? (
          <ol className="mt-5 space-y-2">
            {state.stops.map((s, i) => (
              <li key={s.slug} className="rounded-xl bg-bg px-3 py-3 ring-1 ring-line">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {i + 1}. {stopName(s.slug, lang)}
                  </p>
                  <span className="flex shrink-0 gap-0.5">
                    <button type="button" aria-label="Up" className="p-1" onClick={() => onMove(s.slug, -1)}>
                      <ChevronUp className="size-4 text-muted" />
                    </button>
                    <button type="button" aria-label="Down" className="p-1" onClick={() => onMove(s.slug, 1)}>
                      <ChevronDown className="size-4 text-muted" />
                    </button>
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted">
                    {copy.stay} {clock(s.stayMin)}
                  </span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded-full ring-1 ring-line"
                      onClick={() => onStay(s.slug, s.stayMin - 30)}
                    >
                      <Minus className="size-3" />
                    </button>
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded-full ring-1 ring-line"
                      onClick={() => onStay(s.slug, s.stayMin + 30)}
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      type="button"
                      className="ml-1 text-[11px] font-semibold text-clay"
                      onClick={() => onRemove(s.slug)}
                    >
                      {copy.remove}
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : null}

        <p className="mt-6 font-display text-3xl text-ink">{priceLabel}</p>
        <p className="mt-0.5 text-sm text-muted">
          {state.people} {copy.guests} · {copy.privateTour}
        </p>
        <p className="mt-2 text-xs text-accent">{copy.photoshoot}</p>
        <p className="mt-1 text-xs leading-relaxed text-faint">{copy.included}</p>

        <fieldset className="mt-5">
          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{copy.addons}</legend>
          <p className="mt-1 text-xs leading-relaxed text-faint">{copy.addonHint}</p>
          <ul className="mt-3 space-y-2">
            {ADDONS.map((addon) => (
              <li key={addon}>
                <label className="flex items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-line accent-olive"
                    checked={state.addons.includes(addon)}
                    onChange={() => onToggleAddon(addon)}
                  />
                  {copy.addonsLabel[addon]}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <Button
          className="mt-6 w-full"
          size="lg"
          disabled={feasBlocked || state.stops.length === 0}
          onClick={onBook}
        >
          {copy.bookMyTour}
        </Button>
        <div className="mt-3 flex gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full px-3 py-2 text-center text-xs font-semibold text-accent ring-1 ring-line hover:bg-bg"
          >
            {copy.whatsapp}
          </a>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-accent ring-1 ring-line hover:bg-bg"
          >
            <Copy className="size-3.5" />
            {copied ? copy.copied : copy.share}
          </button>
        </div>
        <p className="sr-only">{lang}</p>
      </aside>
    </div>
  );
}

function Onboard({
  lang,
  state,
  onStart,
  onPeople,
  onDate,
  onToggle,
  onCreate,
  onSkip,
}: {
  lang: Lang;
  state: PlannerState;
  onStart: (start: string) => void;
  onPeople: (n: number) => void;
  onDate: (d: string) => void;
  onToggle: (i: PlannerInterest) => void;
  onCreate: () => void;
  onSkip: () => void;
}) {
  const copy = plannerCopy(lang);
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{copy.eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink md:text-5xl">{copy.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{copy.lead}</p>

      <div className="mt-8 rounded-2xl bg-surface p-5 ring-1 ring-line md:p-7">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={copy.start}>
            <select className={SELECT} value={state.start} onChange={(e) => onStart(e.target.value)}>
              {PLANNER_STARTS.map((start) => (
                <option key={start.slug} value={start.slug}>
                  {startName(start.slug, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.people}>
            <select className={SELECT} value={state.people} onChange={(e) => onPeople(Number(e.target.value))}>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.date}>
            <Input type="date" value={state.date} onChange={(e) => onDate(e.target.value)} />
          </Field>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-faint">{copy.startsHint}</p>

        <p className="mt-7 text-sm font-semibold text-ink">{copy.interestsHeading}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const on = state.interests.includes(interest);
            return (
              <li key={interest}>
                <button
                  type="button"
                  onClick={() => onToggle(interest)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                    on ? "bg-olive text-paper ring-olive" : "bg-bg text-ink ring-line hover:bg-olive-50",
                  )}
                >
                  {copy.categories[interest]}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button onClick={onCreate}>{copy.createDay}</Button>
          <Button variant="ghost" onClick={onSkip}>
            {copy.changeStops}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-bg px-2 py-3 ring-1 ring-line">
      <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
        <span className="text-accent">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition",
        active ? "bg-olive text-paper ring-olive" : "bg-surface text-ink ring-line hover:bg-olive-50",
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </label>
  );
}
