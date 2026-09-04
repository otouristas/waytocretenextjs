"use client";

import { useMemo, useState } from "react";
import { TourCard } from "@/components/tour-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { CATEGORIES, TOURS, type Category } from "@/lib/tours";

export function ToursView({ lang, initialQ = "", initialCat = "" }: { lang: Lang; initialQ?: string; initialCat?: string }) {
  const copy = t(lang);
  const [cat, setCat] = useState(initialCat || "all");
  const [sort, setSort] = useState<"popular" | "price" | "duration">("popular");
  const [q, setQ] = useState(initialQ);
  const list = useMemo(() => {
    let rows = [...TOURS];
    if (cat !== "all") rows = rows.filter((r) => r.category === cat);
    if (q.trim()) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) => r.slug.includes(needle) || r.category.includes(needle) || r.meeting.toLowerCase().includes(needle));
    }
    if (sort === "price") rows.sort((a, b) => a.priceFrom - b.priceFrom);
    if (sort === "duration") rows.sort((a, b) => a.durationHours - b.durationHours);
    if (sort === "popular") rows.sort((a, b) => b.reviews - a.reviews);
    return rows;
  }, [cat, q, sort]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-olive">{copy.navTours}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{copy.viewAll}</h1>
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={copy.searchWhere} className="flex-1 bg-surface" />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-11 rounded-md border border-line bg-surface px-3 text-sm">
          <option value="popular">{copy.sortPopular}</option>
          <option value="price">{copy.sortPrice}</option>
          <option value="duration">{copy.sortDuration}</option>
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={cat === "all" ? "default" : "outline"} onClick={() => setCat("all")}>{copy.all}</Button>
        {CATEGORIES.map((c) => (
          <Button key={c} type="button" size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>{copy.categories[c as Category]}</Button>
        ))}
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((tour) => <TourCard key={tour.slug} tour={tour} lang={lang} />)}
      </div>
    </main>
  );
}
