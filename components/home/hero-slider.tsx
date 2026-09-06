"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { fill } from "@/lib/i18n/langs";
import { cn } from "@/lib/cn";

const INTERVAL_MS = 7000;
const SWIPE_PX = 48;

/**
 * The home hero photograph track.
 *
 * Isolated as a client component so the headline and chips stay on the
 * server. The first real frame is also painted by `HomeHero` for LCP;
 * this track takes over after hydration. Autoplay is a forward slide; it
 * pauses on hover, focus, or a held swipe, and it is off when the reader
 * has asked for reduced motion.
 *
 * The track is cloned at both ends so the wrap from last to first (and
 * back) keeps travelling in the same direction instead of rewinding.
 */
export function HomeHeroSlider({
  images,
  alts,
  label,
  goToLabel,
}: {
  images: readonly string[];
  alts: readonly string[];
  label: string;
  goToLabel: string;
}) {
  const count = images.length;
  const loop = count > 1;
  const [offset, setOffset] = useState(loop ? 1 : 0);
  const [animate, setAnimate] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const hover = useRef(false);
  const focus = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const slides = loop ? [images[count - 1], ...images, images[0]] : [...images];
  const index = loop ? (offset === 0 ? count - 1 : offset === count + 1 ? 0 : offset - 1) : offset;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || !loop) return;
    const id = window.setInterval(() => {
      if (hover.current || focus.current) return;
      setAnimate(true);
      setOffset((current) => current + 1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, loop]);

  const goTo = useCallback(
    (next: number) => {
      if (!loop) {
        setOffset(next);
        return;
      }
      setAnimate(!reduceMotion);
      if (reduceMotion) {
        setOffset(next + 1);
        return;
      }
      // Adjacent wrap keeps travelling the same way the clones do.
      if (index === count - 1 && next === 0) {
        setOffset(count + 1);
        return;
      }
      if (index === 0 && next === count - 1) {
        setOffset(0);
        return;
      }
      setOffset(next + 1);
    },
    [count, index, loop, reduceMotion],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      if (reduceMotion) {
        goTo((index + direction + count) % count);
        return;
      }
      setAnimate(true);
      setOffset((current) => current + direction);
    },
    [count, goTo, index, reduceMotion],
  );

  return (
    <div
      className="absolute inset-0"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => {
        hover.current = true;
      }}
      onMouseLeave={() => {
        hover.current = false;
      }}
      onFocusCapture={() => {
        focus.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focus.current = false;
        }
      }}
      onTouchStart={(event) => {
        const point = event.changedTouches[0];
        if (!point) return;
        touch.current = { x: point.clientX, y: point.clientY };
        hover.current = true;
      }}
      onTouchEnd={(event) => {
        const start = touch.current;
        touch.current = null;
        hover.current = false;
        const point = event.changedTouches[0];
        if (!start || !point) return;
        const dx = point.clientX - start.x;
        const dy = point.clientY - start.y;
        if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
        step(dx < 0 ? 1 : -1);
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "flex h-full w-full",
            animate && !reduceMotion && "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}
          style={{ transform: `translate3d(-${offset * 100}%, 0, 0)` }}
          onTransitionEnd={() => {
            if (!loop) return;
            if (offset === count + 1) {
              setAnimate(false);
              setOffset(1);
            } else if (offset === 0) {
              setAnimate(false);
              setOffset(count);
            }
          }}
        >
          {slides.map((src, i) => {
            const real = loop ? (i === 0 ? count - 1 : i === count + 1 ? 0 : i - 1) : i;
            const active = i === offset;
            return (
              <div key={`${src}-${i}`} className="relative h-full w-full min-w-full shrink-0" aria-hidden={!active}>
                <Image
                  src={src}
                  alt={active ? (alts[real] ?? "") : ""}
                  fill
                  priority={loop ? i === 1 : i === 0}
                  loading={loop ? (i === 1 ? "eager" : "lazy") : i === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {loop ? (
        <div className="absolute inset-x-0 bottom-20 z-20 flex justify-center md:bottom-24">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={fill(goToLabel, { n: i + 1 })}
              aria-current={i === index ? "true" : undefined}
              onClick={() => goTo(i)}
              className="group flex h-8 items-center justify-center px-1.5"
            >
              <span
                className={cn(
                  "h-2 rounded-full ring-1 ring-paper/30 transition-all",
                  i === index ? "w-7 bg-paper" : "w-2 bg-paper/40 group-hover:bg-paper/70",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
