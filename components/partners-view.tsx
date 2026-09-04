"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n/langs";
import { partnersCopy } from "@/lib/i18n/partners";
import { t } from "@/lib/i18n/ui";
import { sendRequest } from "@/lib/send-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function PartnersView({ lang }: { lang: Lang }) {
  const p = partnersCopy(lang);
  const copy = t(lang);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div>
      <section className="pattern-olive">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-olive">{p.kicker}</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] text-earth md:text-6xl">{p.heroTitle}</h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-olive-deep">{p.heroLine}</p>
          <p className="mt-5 max-w-xl text-base text-muted">{p.heroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><a href="#partner-form">{p.become}</a></Button>
            <Button asChild variant="outline"><a href="#brochure">{p.brochure}</a></Button>
          </div>
          <p className="mt-4 text-xs text-faint">{p.ratesNote}</p>
        </div>
      </section>
      <section className="bg-earth py-16 text-surface">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl md:text-5xl">{p.oneTitle}</h2>
          <p className="mt-4 max-w-3xl text-gold-soft">{p.oneLead}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.pillars.map((item) => (
              <div key={item.title} className="rounded-sm bg-earth-deep/40 p-4 ring-1 ring-gold/30">
                <p className="font-display text-lg">{item.title}</p>
                <p className="mt-1 text-xs text-gold-soft">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-hero py-24 text-center text-surface">
        <h2 className="mx-auto max-w-3xl font-display text-4xl md:text-6xl">{p.hookTitle}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-gold-soft">{p.hookLead}</p>
        <p className="mt-6 font-display text-xl text-gold">{p.hookClose}</p>
      </section>
      <section id="partner-form" className="pattern-olive border-t border-line">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <form
            id="booking-panel"
            className="scroll-mt-28 rounded-sm bg-surface p-6 ring-1 ring-line"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const result = await sendRequest({ kind: "partner", lang, name: person, email, company, message });
              setBusy(false);
              if (!result.ok) window.location.href = result.mailto;
              setDone(true);
            }}
          >
            <h2 className="font-display text-3xl text-earth">{p.formTitle}</h2>
            <p className="mt-2 text-sm text-muted">{p.formLead}</p>
            {done ? <p className="mt-6 text-sm">{p.sent}</p> : (
              <div className="mt-6 grid gap-3">
                <div className="grid gap-1.5"><Label>{p.company}</Label><Input required value={company} onChange={(e) => setCompany(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>{p.person}</Label><Input required value={person} onChange={(e) => setPerson(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>{p.bizEmail}</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>{p.message}</Label><Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
                <Button type="submit" className="h-12" disabled={busy}>{busy ? copy.sending : p.submit}</Button>
              </div>
            )}
          </form>
          <p id="brochure" className="mt-6 text-sm text-muted">{p.requestRates}: partners@waytocrete.com</p>
        </div>
      </section>
    </div>
  );
}
