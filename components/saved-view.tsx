"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { TourCopy, TourCore } from "@/lib/content/schema";
import { useWayStore } from "@/lib/store";
import { TourCard } from "@/components/tour/tour-card";
import { Button } from "@/components/ui/button";

/**
 * The saved list.
 *
 * The catalogue is passed in from the server rather than imported here, so the
 * page still renders its content server-side and this component only decides
 * which of them to show.
 */
export function SavedView({
  lang,
  tours,
}: {
  lang: Lang;
  tours: Array<{ core: TourCore; copy: TourCopy }>;
}) {
  const ui = t(lang);
  const [mounted, setMounted] = useState(false);
  const saved = useWayStore((s) => s.saved);

  useEffect(() => {
    void useWayStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const chosen = mounted ? tours.filter((x) => saved.includes(x.core.slug)) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl text-ink">{ui.wishlist}</h1>

      {!mounted ? (
        <div className="mt-10 h-40" />
      ) : chosen.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-surface p-10 text-center ring-1 ring-line">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-olive-50 text-accent">
            <Heart className="size-5" />
          </span>
          <p className="mt-4 text-muted">{ui.emptyTours}</p>
          <Button asChild className="mt-6">
            <Link href={langPath(lang, "/tours")}>{ui.viewAll}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {chosen.map(({ core, copy }) => (
            <TourCard key={core.slug} core={core} copy={copy} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
