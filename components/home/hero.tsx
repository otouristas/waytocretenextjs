import Image from "next/image";
import { CalendarCheck, Camera, MapPin, Users } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { searchIndex } from "@/lib/search-index";
import { HeroSearch } from "@/components/home/hero-search";
import { HomeHeroSlider } from "@/components/home/hero-slider";
import { HOME_HERO_IMAGES } from "@/lib/seo/images";

/**
 * The home hero.
 *
 * Headline, chips and the search card stay on the server. The photograph
 * track is the only extra client island — three frames, sliding, with the
 * first marked `priority` so LCP does not wait on hydration.
 */

export function HomeHero({ lang }: { lang: Lang }) {
  const copy = t(lang);

  return (
    <section className="relative">
      <div className="relative h-[min(86vh,780px)] min-h-[540px] w-full overflow-hidden">
        {/* Static first frame so LCP is a server-rendered <img>, not a
            slide that only exists after the client island hydrates. */}
        <div aria-hidden className="absolute inset-0">
          <Image
            src={HOME_HERO_IMAGES[0]}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <HomeHeroSlider
          images={HOME_HERO_IMAGES}
          alts={copy.heroImageAlts}
          label={copy.heroSlider}
          goToLabel={copy.heroGoToSlide}
        />

        {/* Two scrims: one bottom-up for the headline block, one from the left
            so the text keeps contrast on wide screens without dimming the
            whole photograph into mud. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-earth-900/92 via-earth-900/45 to-earth-900/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-earth-900/70 via-transparent to-transparent"
        />

        <div className="pointer-events-none absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-28 md:pb-32">
            <p className="font-script text-2xl text-paper md:text-3xl">{copy.desk}</p>

            <h1 className="mt-3 max-w-3xl font-display text-[2.6rem] leading-[1.02] text-paper md:text-6xl lg:text-[4.25rem]">
              {copy.heroTitle}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/90 md:text-lg">
              {copy.heroSub}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2">
              <Chip icon={<CalendarCheck className="size-3.5" />}>{copy.freeCancel}</Chip>
              <Chip icon={<Users className="size-3.5" />}>{copy.smallGroup}</Chip>
              <Chip icon={<MapPin className="size-3.5" />}>{copy.pickup}</Chip>
              <Chip icon={<Camera className="size-3.5" />}>{copy.photoshootMost}</Chip>
            </ul>
          </div>
        </div>
      </div>

      {/* The search card overlaps the photograph's bottom edge — it belongs to
          both the hero and the page, and the overlap is what makes it read as
          the primary action rather than a form in a stack. */}
      <div className="relative z-10 mx-auto -mt-16 w-full max-w-5xl px-4 md:-mt-14">
        <HeroSearch lang={lang} index={searchIndex(lang)} />
      </div>
    </section>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 rounded-full bg-paper/12 px-3.5 py-1.5 text-xs font-medium text-paper ring-1 ring-paper/25 backdrop-blur-sm">
      <span className="text-paper">{icon}</span>
      {children}
    </li>
  );
}
