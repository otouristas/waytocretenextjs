"use client";

import { useParams } from "next/navigation";
import { TourCard } from "@/components/tour-card";
import { parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { TOURS } from "@/lib/tours";
import { useWayStore } from "@/lib/store";

export default function SavedPage() {
  const lang = parseLang(useParams().lang as string);
  const copy = t(lang);
  const saved = useWayStore((s) => s.saved);
  const rows = TOURS.filter((tour) => saved.includes(tour.slug));
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">{copy.wishlist}</h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-muted">{copy.emptyTours}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((tour) => <TourCard key={tour.slug} tour={tour} lang={lang} />)}
        </div>
      )}
    </main>
  );
}
