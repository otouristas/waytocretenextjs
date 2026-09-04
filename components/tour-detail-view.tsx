"use client";

import { Clock, MapPin, Star, Users } from "lucide-react";
import { BookingPanel } from "@/components/booking-panel";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { tourCopy } from "@/lib/i18n/tours-copy";
import { getTour } from "@/lib/tours";

export function TourDetailView({ lang, slug }: { lang: Lang; slug: string }) {
  const tour = getTour(slug);
  const info = tourCopy(lang, slug);
  const copy = t(lang);
  if (!tour || !info) return <main className="px-4 py-16">Not found</main>;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-muted">
        <a href={langPath(lang)}>{copy.home}</a> / <a href={langPath(lang, "/tours")}>{copy.navTours}</a> / {info.title}
      </nav>
      <img src={tour.image} alt={info.title} className="mt-4 h-[50vh] w-full rounded-lg object-cover" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <article>
          <h1 className="font-display text-4xl font-semibold">{info.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1"><Star className="size-4 fill-gold text-gold" /> {tour.rating.toFixed(1)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-4" /> {tour.durationLabel}</span>
            <span className="inline-flex items-center gap-1"><Users className="size-4" /> {copy.smallGroup}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {tour.meeting}</span>
          </div>
          <p className="mt-6 text-muted">{info.long}</p>
        </article>
        <BookingPanel tour={tour} lang={lang} />
      </div>
    </main>
  );
}
