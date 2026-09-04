"use client";

import { Clock, Heart, Star } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { langPath } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { tourCopy } from "@/lib/i18n/tours-copy";
import type { Tour } from "@/lib/tours";
import { formatPrice } from "@/lib/format";
import { useWayStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TourCard({ tour, lang }: { tour: Tour; lang: Lang }) {
  const copy = t(lang);
  const info = tourCopy(lang, tour.slug);
  const saved = useWayStore((s) => s.saved.includes(tour.slug));
  const toggle = useWayStore((s) => s.toggleSaved);
  if (!info) return null;
  return (
    <article className="group overflow-hidden rounded-lg bg-surface ring-1 ring-line">
      <a href={langPath(lang, `/tours/${tour.slug}`)} className="relative block aspect-[3/4] overflow-hidden">
        <img src={tour.image} alt={info.title} className="size-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-hero via-hero/15 to-transparent" />
        <Badge variant="ghost" className="absolute left-3 top-3">{copy.categories[tour.category]}</Badge>
        <button type="button" onClick={(e) => { e.preventDefault(); toggle(tour.slug); }} className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-surface/92" aria-label={copy.saved}>
          <Heart className={cn("size-4", saved && "fill-olive text-olive")} />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-4 text-surface">
          <div className="mb-2 flex items-center gap-1 text-xs text-gold-soft">
            <Star className="size-3.5 fill-gold text-gold" />
            <span className="font-semibold tabular-nums">{tour.rating.toFixed(1)}</span>
            <span className="opacity-80">({tour.reviews})</span>
            <Clock className="size-3.5" /> {tour.durationLabel}
          </div>
          <h3 className="font-display text-xl font-semibold leading-tight">{info.title}</h3>
        </div>
      </a>
      <div className="flex items-end justify-between gap-3 px-4 py-3">
        <p className="text-sm text-muted">{copy.fromPrice} <span className="font-display text-lg font-semibold text-ink">{formatPrice(lang, tour.priceFrom)}</span></p>
        <Button asChild size="sm"><a href={langPath(lang, `/tours/${tour.slug}`)}>{copy.bookNow}</a></Button>
      </div>
    </article>
  );
}
