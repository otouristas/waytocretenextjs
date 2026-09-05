"use client";

import { useState } from "react";
import { ExternalLink, MapPin, Navigation, Play } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import {
  ADDRESS,
  ADDRESS_DISPLAY,
  BRAND,
  GEO,
  MAP_DIRECTIONS,
  MAP_EMBED_SRC,
  MAP_LINK,
} from "@/lib/site";

/**
 * The office map.
 *
 * Click-to-load, not an iframe in the markup, for two reasons that both bite
 * on a page whose whole job is to be reachable:
 *
 *  1. A Google Maps embed pulls roughly a megabyte of Google's JavaScript and
 *     sets Google cookies (`NID`, `SOCS`) the moment the page renders. This is
 *     a Greek business selling to EU visitors and the site carries no consent
 *     banner — because until now it had nothing to ask consent for. Loading it
 *     on a click is the consent.
 *  2. It is the heaviest thing on the contact page by an order of magnitude,
 *     and most visitors came to find a phone number.
 *
 * Nothing is hidden behind the button that a reader actually needs: the
 * address, the coordinates, a Google Maps link and a directions link are all
 * in the markup, all crawlable, and all work if the button is never pressed.
 */
export function ContactMap({ lang }: { lang: Lang }) {
  const copy = t(lang);
  const [loaded, setLoaded] = useState(false);

  return (
    <section aria-labelledby="find-us" className="mt-12">
      <h2 id="find-us" className="font-display text-2xl text-ink">
        {copy.findUs}
      </h2>

      <div className="mt-5 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        <div className="relative aspect-[16/10] sm:aspect-[2/1]">
          {loaded ? (
            <iframe
              // The embed URL is the one Google generated for this Business
              // Profile; `MAP_PLACE_ID` in lib/site.ts is the same place the
              // review links point at.
              src={MAP_EMBED_SRC}
              title={`${BRAND} — ${ADDRESS_DISPLAY}`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="group absolute inset-0 grid place-items-center gap-3 pattern-olive text-center transition hover:bg-olive-50"
            >
              {/* A schematic pin over the texture rather than a static map
                  image: a real Maps static tile is another Google request,
                  which is the thing this component exists to defer. */}
              <span className="grid size-14 place-items-center rounded-full bg-olive text-paper shadow-[0_12px_28px_-10px_rgba(57,36,32,0.55)] transition group-hover:scale-105">
                <MapPin className="size-6" />
              </span>
              <span className="px-6">
                <span className="flex items-center justify-center gap-2 font-display text-lg text-ink">
                  <Play className="size-3.5 fill-current text-accent" />
                  {copy.showMap}
                </span>
                <span className="mt-1 block max-w-sm text-xs leading-relaxed text-muted">
                  {copy.mapConsent}
                </span>
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4">
          <address className="text-sm not-italic leading-relaxed text-muted">
            <span className="block font-semibold text-ink">{BRAND}</span>
            {ADDRESS.street}, {ADDRESS.locality} {ADDRESS.postalCode}, {ADDRESS.region}
            <span className="mt-0.5 block text-xs text-faint">
              {GEO.lat.toFixed(5)}, {GEO.lng.toFixed(5)}
            </span>
          </address>

          <div className="flex flex-wrap gap-2">
            <a
              href={MAP_DIRECTIONS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-olive px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-olive-deep"
            >
              <Navigation className="size-3.5" />
              {copy.directions}
            </a>
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-accent ring-1 ring-line transition hover:bg-bg"
            >
              <ExternalLink className="size-3.5" />
              {copy.openInMaps}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
