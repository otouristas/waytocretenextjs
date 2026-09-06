"use client";

import { useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { t } from "@/lib/i18n/ui";
import type { Lang } from "@/lib/i18n/langs";
import { MARKETPLACE_PARTNERS, type MarketplacePartner } from "@/lib/marketplace";
import { TripAdvisorOwl } from "@/components/trust/source-logos";
import { cn } from "@/lib/cn";

/**
 * Where the tours already sell — a logo reel above the footer.
 *
 * The strip is identification, not navigation: we do not have a single
 * canonical listing URL for every platform, and a sitewide link to each
 * OTA home page would send bookers away. Tripadvisor stays in the footer
 * reviews row, where the link is to our actual listing.
 */
export function SoldOn({ lang }: { lang: Lang }) {
  const ui = t(lang);
  const [paused, setPaused] = useState(false);

  return (
    <section className="mt-16 border-t border-line bg-raised" aria-labelledby="sold-on-title">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{ui.soldOnKicker}</p>
          <h2 id="sold-on-title" className="mt-2 font-display text-2xl text-ink md:text-3xl">
            {ui.soldOnTitle}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? ui.soldOnPlay : ui.soldOnPause}
          className="sold-on-pause inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-muted ring-1 ring-line transition hover:bg-bg hover:text-ink"
        >
          {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
          {paused ? ui.soldOnPlay : ui.soldOnPause}
        </button>
      </div>

      <div className="sold-on-mask">
        <div className={cn("sold-on-marquee", paused && "sold-on-marquee-still")}>
          <LogoSet />
          <LogoSet decorative />
        </div>
      </div>
    </section>
  );
}

function LogoSet({ decorative = false }: { decorative?: boolean }) {
  return (
    <ul className="sold-on-set" aria-hidden={decorative || undefined} data-duplicate={decorative || undefined}>
      {MARKETPLACE_PARTNERS.map((partner) => (
        <li key={partner.id}>
          <PartnerTile partner={partner} decorative={decorative} />
        </li>
      ))}
    </ul>
  );
}

function PartnerTile({
  partner,
  decorative = false,
}: {
  partner: MarketplacePartner;
  decorative?: boolean;
}) {
  const alt = decorative ? "" : partner.name;

  return (
    <div className="grid h-[4.5rem] w-[10rem] place-items-center rounded-2xl bg-paper px-4 shadow-[0_1px_0_color-mix(in_srgb,var(--earth)_6%,transparent)] ring-1 ring-earth/10 sm:h-[4.75rem] sm:w-[12.5rem] sm:px-5">
      {partner.id === "tripadvisor" ? (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden>
            <TripAdvisorOwl className="h-7 w-auto" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[#08808a]">Tripadvisor</span>
        </span>
      ) : partner.id === "airbnb" ? (
        <span className="inline-flex items-center gap-2.5">
          <Image
            src={partner.src}
            alt={alt}
            width={partner.width}
            height={partner.height}
            className="h-8 w-auto"
            unoptimized
          />
          <span className="text-[15px] font-semibold tracking-tight text-[#FF385C]" aria-hidden>
            Airbnb
          </span>
        </span>
      ) : (
        <Image
          src={partner.src}
          alt={alt}
          width={partner.width}
          height={partner.height}
          className={cn(
            "w-auto object-contain",
            partner.id === "getyourguide"
              ? "h-12 max-w-[9.5rem]"
              : partner.fit === "icon"
                ? "h-9"
                : "h-8 max-w-[10.5rem]",
          )}
          unoptimized={partner.src.endsWith(".svg")}
        />
      )}
    </div>
  );
}
