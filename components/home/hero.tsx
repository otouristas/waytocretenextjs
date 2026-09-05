import Image from "next/image";
import { CalendarCheck, Camera, MapPin, Users } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { searchIndex } from "@/lib/search-index";
import { HeroSearch } from "@/components/home/hero-search";
import { HOME_OG_IMAGE } from "@/lib/seo/images";

/**
 * The home hero.
 *
 * A server component: the image, the headline and the trust chips are static,
 * so only the search card below ships JavaScript. The LCP element is the
 * background image, marked `priority` and served at explicit sizes so it
 * never shifts.
 */

export function HomeHero({ lang }: { lang: Lang }) {
  const copy = t(lang);

  return (
    <section className="relative">
      <div className="relative h-[min(86vh,780px)] min-h-[540px] w-full overflow-hidden">
        <Image
          src={HOME_OG_IMAGE}
          alt={copy.heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Two scrims: one bottom-up for the headline block, one from the left
            so the text keeps contrast on wide screens without dimming the
            whole photograph into mud. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-earth-900/92 via-earth-900/45 to-earth-900/10"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-earth-900/70 via-transparent to-transparent"
        />

        <div className="absolute inset-0 flex items-end">
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
              <Chip icon={<Camera className="size-3.5" />}>{copy.photoshoot}</Chip>
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
