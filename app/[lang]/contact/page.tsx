"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const lang = parseLang(useParams().lang as string);
  const copy = t(lang);
  const [done, setDone] = useState(false);
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-olive">{copy.getInTouch}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">{copy.contactTitle}</h1>
        <p className="mt-4 text-muted">{copy.contactLead}</p>
        <p className="mt-6 text-sm">
          {copy.phone}: <a className="font-semibold text-olive-deep" href="tel:+306972531808">+30 697 253 1808</a><br />
          {copy.email}: <a className="font-semibold text-olive-deep" href="mailto:info@waytocrete.com">info@waytocrete.com</a>
        </p>
      </div>
      {done ? (
        <p className="rounded-lg bg-surface p-6 ring-1 ring-line">{copy.submitted}</p>
      ) : (
        <form className="flex flex-col gap-3 rounded-lg bg-surface p-6 ring-1 ring-line" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
          <Input required placeholder={copy.name} />
          <Input required type="email" placeholder={copy.email} />
          <Input placeholder={copy.hotel} />
          <Textarea required placeholder={copy.message} rows={5} />
          <Button type="submit" className="h-12">{copy.send}</Button>
        </form>
      )}
    </main>
  );
}
