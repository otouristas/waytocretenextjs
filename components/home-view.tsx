"use client";

import { useState } from "react";
import { TourCard } from "@/components/tour-card";
import { orgJsonLd } from "@/lib/seo";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { Button } from "@/components/ui/button";
import { TOURS } from "@/lib/tours";

export function HomeView({ lang }: { lang: Lang }) {
  const copy = t(lang);
  const [q, setQ] = useState("");
  const featured = TOURS.slice(0, 6);
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }} />
      <section className="pattern-olive">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-olive">{copy.heroKicker}</p>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] text-olive-deep md:text-7xl">{copy.tagline}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{copy.heroSub}</p>
            <div className="mt-8 rounded-sm bg-surface p-4 ring-1 ring-line">
              <form className="grid gap-2 sm:grid-cols-2">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={copy.searchWhere} className="h-11 rounded-sm border border-line bg-bg px-3 text-sm" />
                <Button asChild className="h-11 rounded-sm bg-gold text-ink hover:bg-gold-soft">
                  <a href={`${langPath(lang, "/tours")}?q=${encodeURIComponent(q)}`}>{copy.bookNow}</a>
                </Button>
              </form>
            </div>
          </div>
          <img src={TOURS[0].image} alt="" className="h-80 w-full rounded-sm object-cover ring-4 ring-gold" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">{copy.viewAll}</h2>
          <a href={langPath(lang, "/tours")} className="text-sm font-semibold text-olive-deep">{copy.viewAll}</a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tour) => <TourCard key={tour.slug} tour={tour} lang={lang} />)}
        </div>
      </section>
    </main>
  );
}
