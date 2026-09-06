"use client";

import { useState } from "react";
import { CalendarDays, Check, Loader2, ShieldCheck } from "lucide-react";
import { fill, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { photographyCopy } from "@/lib/i18n/photography";
import { formatPrice } from "@/lib/format";
import { sendRequest } from "@/lib/send-request";
import type { PhotoDeparture, PhotographyCore } from "@/lib/content/schema";
import {
  departureMonthLabel,
  departureStatusLabel,
  editedPhotosCount,
  packageDuration,
} from "@/lib/photography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

/**
 * The photography request form — the section's only client island.
 *
 * It never computes a price. The amount beside a package is the figure from
 * `photo.json`, the same one the card and the JSON-LD offer carry, so the
 * guest and the desk are always looking at one number.
 *
 * The workshop variant says "request to join" rather than "book" because a
 * departure below its minimum group genuinely does not run. This form is how
 * the operator finds out whether it will.
 */
export function PhotoRequestForm({
  core,
  title,
  packageNames,
  editionNames,
  departures,
  lang,
  bookingNote,
}: {
  core: PhotographyCore;
  title: string;
  /** Package id → display name, from the locale copy. */
  packageNames: Record<string, string>;
  /** Edition id → display name, from the locale copy. */
  editionNames: Record<string, string>;
  departures: PhotoDeparture[];
  lang: Lang;
  bookingNote?: string;
}) {
  const ui = t(lang);
  const photo = photographyCopy(lang);
  const isWorkshop = core.kind === "workshop";

  const [choice, setChoice] = useState<string>(
    core.kind === "experience"
      ? (core.packages.find((p) => p.popular) ?? core.packages[0]).id
      : (departures[0]?.id ?? ""),
  );
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hotel, setHotel] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  /** The line the desk reads first — what was actually selected. */
  function selectionSummary() {
    if (core.kind === "experience") {
      const pkg = core.packages.find((p) => p.id === choice);
      if (!pkg) return `${title} — ${photo.formCustom}`;
      return `${title} — ${packageNames[choice] ?? choice}, ${formatPrice(lang, pkg.priceEur)}`;
    }
    const departure = departures.find((d) => d.id === choice);
    if (!departure) return title;
    return `${title} — ${departureMonthLabel(departure.month, lang)} (${departureStatusLabel(
      departure.status,
      lang,
    )})`;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    const result = await sendRequest({
      kind: "photography",
      lang,
      slug: core.slug,
      name,
      email,
      hotel,
      date,
      guests,
      message: `${message}\n\n— ${selectionSummary()}`.trim(),
      ...(isWorkshop ? { departure: choice } : { photoPackage: choice }),
    });
    setSending(false);
    if (result.ok) setSent(true);
    else window.location.href = result.mailto;
  }

  if (sent) {
    return (
      <aside id="photo-request" className="scroll-mt-28 rounded-2xl bg-surface p-6 ring-1 ring-line">
        <div className="grid size-11 place-items-center rounded-full bg-olive-50 text-accent">
          <Check className="size-5" />
        </div>
        <p className="mt-4 font-display text-xl text-ink">{ui.requestSent}</p>
        <p className="mt-2 text-sm text-muted">{ui.submitted}</p>
      </aside>
    );
  }

  return (
    <aside
      id="photo-request"
      className="scroll-mt-28 overflow-hidden rounded-2xl bg-surface ring-1 ring-line"
    >
      <div className="border-b border-line p-5">
        <h2 className="font-display text-xl text-ink">
          {isWorkshop ? photo.formWorkshopTitle : photo.formExperienceTitle}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{photo.formLead}</p>
      </div>

      <form onSubmit={(e) => void submit(e)} className="grid gap-4 p-5">
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            {isWorkshop ? photo.formDeparture : photo.formPackage}
          </legend>

          {core.kind === "experience"
            ? [
                ...core.packages.map((pkg) => ({
                  id: pkg.id,
                  label: packageNames[pkg.id] ?? pkg.id,
                  meta: `${packageDuration(pkg, lang)} · ${editedPhotosCount(pkg)}`,
                  aside: formatPrice(lang, pkg.priceEur),
                })),
                // The escape hatch. Three hours, a proposal, a second
                // photographer: none of it fits the ladder, and all of it is
                // work the operator wants.
                {
                  id: "custom",
                  label: photo.formCustom,
                  meta: photo.customTitle,
                  aside: ui.onRequest,
                },
              ].map((option) => (
                <Option
                  key={option.id}
                  name="photo-choice"
                  checked={choice === option.id}
                  onSelect={() => setChoice(option.id)}
                  label={option.label}
                  meta={option.meta}
                  aside={option.aside}
                />
              ))
            : departures.map((departure) => (
                <Option
                  key={departure.id}
                  name="photo-choice"
                  checked={choice === departure.id}
                  onSelect={() => setChoice(departure.id)}
                  label={departureMonthLabel(departure.month, lang)}
                  meta={editionNames[departure.edition] ?? ""}
                  aside={departureStatusLabel(departure.status, lang)}
                />
              ))}
        </fieldset>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            {ui.selectDate}
          </span>
          <span className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9"
              // A workshop departure is a month the operator has not fixed to
              // a day yet, so demanding one here would be theatre.
              required={!isWorkshop}
            />
          </span>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            {ui.guests}
          </span>
          <Input
            type="number"
            min={1}
            max={isWorkshop ? core.workshop.groupMax : 12}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>

        <div className="grid gap-3">
          <Input placeholder={ui.name} value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            type="email"
            placeholder={ui.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!isWorkshop ? (
            <Input placeholder={ui.hotel} value={hotel} onChange={(e) => setHotel(e.target.value)} />
          ) : null}
          <Textarea
            placeholder={ui.message}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" disabled={sending} className="w-full">
          {sending ? <Loader2 className="size-4 animate-spin" /> : null}
          {sending ? ui.sending : photo.formSend}
        </Button>

        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" />
          {bookingNote ?? photo.formNoPayment}
        </p>

        {isWorkshop ? (
          <p className="text-xs leading-relaxed text-faint">
            {fill(photo.groupNote, {
              min: core.workshop.groupMin,
              max: core.workshop.groupMax,
            })}
          </p>
        ) : null}
      </form>
    </aside>
  );
}

/**
 * A radio rendered as a card.
 *
 * A real `<input type="radio">` inside the label rather than a button with
 * `aria-checked`: arrow-key navigation within the group and native form
 * semantics both come free, and neither is worth reimplementing.
 */
function Option({
  name,
  checked,
  onSelect,
  label,
  meta,
  aside,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  label: string;
  meta: string;
  aside: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 ring-1 transition",
        checked ? "bg-olive-50 ring-olive" : "bg-bg ring-line hover:ring-olive-200",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full ring-1 transition",
          checked ? "bg-olive ring-olive" : "ring-line",
        )}
      >
        {checked ? <span className="size-1.5 rounded-full bg-paper" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {meta ? <span className="mt-0.5 block text-[11px] text-muted">{meta}</span> : null}
      </span>
      <span className="shrink-0 text-xs font-semibold text-accent">{aside}</span>
    </label>
  );
}
