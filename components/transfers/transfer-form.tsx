"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { transfersCopy } from "@/lib/i18n/transfers";
import { sendRequest } from "@/lib/send-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * The transfer request form.
 *
 * The only client component in the transfers section — everything around it
 * is server-rendered. `preset` lets a route page or the wedding page open it
 * with the journey already filled in, so a guest arriving from
 * `/transfers/chania-airport-to-rethymno` does not retype what the page they
 * came from already knew.
 */
export function TransferForm({
  lang,
  preset,
  wedding = false,
  title,
}: {
  lang: Lang;
  preset?: { pickup?: string; dropoff?: string };
  wedding?: boolean;
  title?: string;
}) {
  const p = transfersCopy(lang);
  const copy = t(lang);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    pickup: preset?.pickup ?? "",
    dropoff: preset?.dropoff ?? "",
    date: "",
    time: "",
    flight: "",
    guests: "2",
    hotel: "",
    message: "",
    wedding,
  });

  const set =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target.type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  if (done) {
    return (
      <div
        id="booking-panel"
        className="flex scroll-mt-28 items-start gap-4 rounded-2xl bg-olive-50 p-6 ring-1 ring-olive-200"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive text-paper">
          <Check className="size-4" />
        </span>
        <p className="text-sm leading-relaxed text-accent">{copy.submitted}</p>
      </div>
    );
  }

  return (
    <form
      id="booking-panel"
      className="grid scroll-mt-28 gap-3 rounded-2xl bg-surface p-6 ring-1 ring-line md:p-7"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        const result = await sendRequest({
          kind: "transfer",
          lang,
          name: form.name,
          email: form.email,
          hotel: form.hotel,
          date: form.date,
          time: form.time,
          guests: Number(form.guests),
          pickup: form.pickup,
          dropoff: form.dropoff,
          flight: form.flight,
          message: form.message,
          wedding: form.wedding,
        });
        setBusy(false);
        if (!result.ok) window.location.href = result.mailto;
        setDone(true);
      }}
    >
      <h2 className="font-display text-2xl text-ink">{title ?? p.formTitle}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={copy.name}>
          <Input required value={form.name} onChange={set("name")} autoComplete="name" />
        </Field>
        <Field label={copy.email}>
          <Input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={p.pickup}>
          <Input required value={form.pickup} onChange={set("pickup")} />
        </Field>
        <Field label={p.dropoff}>
          <Input required value={form.dropoff} onChange={set("dropoff")} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={p.date}>
          <Input required type="date" value={form.date} onChange={set("date")} />
        </Field>
        <Field label={p.time}>
          <Input type="time" value={form.time} onChange={set("time")} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={p.passengers}>
          <Input type="number" min={1} max={8} value={form.guests} onChange={set("guests")} />
        </Field>
        <Field label={p.flight}>
          <Input value={form.flight} onChange={set("flight")} />
        </Field>
      </div>

      <Field label={copy.hotel}>
        <Input value={form.hotel} onChange={set("hotel")} />
      </Field>

      {/* Hidden when the form is already the wedding form — asking a couple
          to tick "this is for a wedding" on the wedding page is noise. */}
      {wedding ? null : (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.wedding}
            onChange={set("wedding")}
            className="size-4 accent-[var(--pine)]"
          />
          {p.wedding}
        </label>
      )}

      <Field label={copy.message}>
        <Textarea rows={3} value={form.message} onChange={set("message")} />
      </Field>

      <Button type="submit" className="h-12" disabled={busy}>
        {busy ? copy.sending : copy.send}
      </Button>
      <p className="text-xs text-faint">{p.checkoutNote}</p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
