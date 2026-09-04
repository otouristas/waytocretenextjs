"use client";

import { useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { Tour } from "@/lib/tours";
import { formatPrice } from "@/lib/format";
import { useWayStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BookingPanel({ tour, lang }: { tour: Tour; lang: Lang }) {
  const copy = t(lang);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const add = useWayStore((s) => s.addBooking);
  const total = useMemo(() => (tour.priceType === "group" ? tour.priceFrom : tour.priceFrom * Math.max(1, guests)), [tour, guests]);
  if (done) return <aside className="rounded-lg bg-surface p-6 ring-1 ring-line"><p className="font-display text-xl">{copy.submitted}</p></aside>;
  return (
    <aside className="rounded-lg bg-surface p-5 ring-1 ring-line">
      <p className="text-sm text-muted">{copy.fromPrice}</p>
      <p className="font-display text-3xl font-semibold">{formatPrice(lang, tour.priceFrom)}</p>
      <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!date || !name || !email) return; add({ slug: tour.slug, date, guests, name, email, hotel: "", message: "", total }); setDone(true); }}>
        <div className="grid gap-1.5"><Label>{copy.selectDate}</Label><Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>{copy.guests}</Label><Input type="number" min={1} max={tour.groupMax} value={guests} onChange={(e) => setGuests(Number(e.target.value))} /></div>
        <div className="grid gap-1.5"><Label>{copy.name}</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>{copy.email}</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="flex justify-between text-sm"><span>{copy.total}</span><span className="font-semibold">{formatPrice(lang, total)}</span></div>
        <Button type="submit" className="h-12">{copy.confirm}</Button>
      </form>
    </aside>
  );
}
