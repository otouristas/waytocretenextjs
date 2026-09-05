"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useWayStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/**
 * The only interactive part of a tour card, so it is the only part that is a
 * client component. Rendered unfilled on the server and reconciled after
 * rehydration, which avoids a hydration mismatch on persisted state.
 */
export function SaveButton({ slug, label }: { slug: string; label: string }) {
  const [mounted, setMounted] = useState(false);
  const saved = useWayStore((s) => s.saved);
  const toggle = useWayStore((s) => s.toggleSaved);

  useEffect(() => {
    void useWayStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const isSaved = mounted && saved.includes(slug);

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSaved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={cn(
        "absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full",
        "bg-paper/90 text-ink shadow-sm backdrop-blur transition",
        "hover:scale-105 hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <Heart className={cn("size-4 transition", isSaved && "fill-clay text-clay")} />
    </button>
  );
}
