import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Languages, MapPin, Users } from "lucide-react";
import { fill, LANGS, LANG_META, langPath, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { allReviews, allTours, ratingSummary } from "@/lib/content/load";
import { transfers } from "@/lib/transfers";
import { breadcrumbNode, graph, id, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { RatingInline } from "@/components/reviews/rating-summary";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import {
  ADDRESS_DISPLAY,
  BRAND,
  MHTE_LICENCE,
  SISTER_BRAND,
  sisterUrl,
} from "@/lib/site";

/**
 * About.
 *
 * Rebuilt from three centred paragraphs under a photograph. An about page on
 * an operator site is not an essay — it is where a visitor checks whether
 * this is a real, licensed, locally-staffed business before handing over a
 * holiday day, so the page states the facts that answer that: the licence,
 * where the vans are based, how many guests fit in one, how many languages
 * the desk answers in, and what guests scored it.
 */

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

const HERO = "https://waytocrete.com/wp-content/uploads/2025/02/lefka-ori-19-1024x683.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang) as Lang;
  return pageMeta({
    lang,
    title: `${t(lang).aboutSeoTitle} | ${BRAND}`,
    description: t(lang).aboutLead,
    path: "/about",
    image: HERO,
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const copy = t(lang);
  const reviews = allReviews();
  const rating = ratingSummary(reviews);
  const tourCount = allTours(lang).length;
  const vehicle = transfers().vehicle;

  const crumbs: Crumb[] = [
    { name: copy.home, path: "/" },
    { name: copy.navAbout, path: "/about" },
  ];

  const jsonLd = graph([
    webPageNode({
      lang,
      path: "/about",
      name: copy.aboutTitle,
      description: copy.aboutLead,
      crumbs,
    }),
    breadcrumbNode(lang, "/about", crumbs),
    { "@type": "AboutPage", mainEntity: { "@id": id.organization() } },
  ]);

  const facts = [
    {
      icon: <MapPin className="size-4" />,
      term: copy.aboutBasedIn,
      value: ADDRESS_DISPLAY,
    },
    {
      icon: <Users className="size-4" />,
      term: copy.aboutGroupSize,
      value: fill(copy.aboutGroupSizeValue, { n: vehicle.passengers }),
    },
    {
      icon: <Languages className="size-4" />,
      term: copy.languages,
      value: LANGS.map((l) => LANG_META[l].hreflang.toUpperCase()).join(" · "),
    },
    {
      icon: <BadgeCheck className="size-4" />,
      term: copy.aboutLicensed,
      value: MHTE_LICENCE ? `GNTO ${MHTE_LICENCE}` : copy.gntoLicence,
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="relative h-[50vh] min-h-80 overflow-hidden">
        <Image
          src={HERO}
          alt={copy.aboutHeroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-earth-900/92 via-earth-900/45 to-earth-900/15" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-4 pb-10">
            <p className="font-script text-2xl text-gold-soft md:text-3xl">{copy.desk}</p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl text-surface md:text-5xl">
              {copy.aboutTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* The operator facts, immediately under the hero. This is the block a
          cautious visitor is scanning for, and it is a definition list so an
          answer engine asked "is Rethymno Tours licensed" can lift it. */}
      <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-line lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.term} className="bg-surface px-5 py-4">
            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
              <span className="text-olive">{fact.icon}</span>
              {fact.term}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-earth">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem] lg:items-start">
          <article>
            <p className="text-lg leading-relaxed text-ink">{copy.aboutLead}</p>
            <p className="mt-5 leading-relaxed text-muted">{copy.aboutBody}</p>

            <figure className="mt-10 border-l-2 border-olive pl-6">
              <blockquote className="font-display text-xl leading-snug text-earth">
                {copy.ernest}
              </blockquote>
            </figure>

            <h2 className="mt-12 font-display text-2xl text-earth">{copy.pointsTitle}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {copy.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 rounded-xl bg-surface p-4 text-sm leading-relaxed text-muted ring-1 ring-line"
                >
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-olive" />
                  {point}
                </li>
              ))}
            </ul>

            {/*
              The contextual link to the sister site — in-content, topically
              matched and singular, rather than a sitewide footer link in
              either direction.
            */}
            <p className="mt-10 rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted ring-1 ring-line">
              {copy.storyHint}{" "}
              <a
                className="font-semibold text-olive-deep underline"
                href={sisterUrl("about-us")}
                rel="noopener"
              >
                {copy.storyLink} — {SISTER_BRAND}
              </a>
            </p>
          </article>

          <aside className="grid gap-4 lg:sticky lg:top-28">
            <div className="rounded-2xl bg-olive-50 p-5 ring-1 ring-olive-200">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-olive-deep">
                {copy.trustLine}
              </p>
              <RatingInline lang={lang} summary={rating} className="mt-2" />
              <p className="mt-3 text-sm leading-relaxed text-olive-900">{copy.verifiedNote}</p>
              <Link
                href={langPath(lang, "/reviews")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-deep hover:text-olive"
              >
                {copy.reviewsAll}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <Link
              href={langPath(lang, "/tours")}
              className="group flex items-center justify-between gap-3 rounded-2xl bg-surface p-5 ring-1 ring-line transition hover:ring-olive-200"
            >
              <span>
                <span className="block font-display text-lg text-earth">{copy.viewAll}</span>
                <span className="text-sm text-muted">
                  {tourCount} {copy.navTours.toLowerCase()}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-olive transition group-hover:translate-x-0.5" />
            </Link>

            <Link
              href={langPath(lang, "/contact")}
              className="group flex items-center justify-between gap-3 rounded-2xl bg-surface p-5 ring-1 ring-line transition hover:ring-olive-200"
            >
              <span>
                <span className="block font-display text-lg text-earth">{copy.getInTouch}</span>
                <span className="text-sm text-muted">{copy.whatsapp}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-olive transition group-hover:translate-x-0.5" />
            </Link>

            <p className="flex items-start gap-2.5 rounded-2xl bg-surface p-5 text-sm leading-relaxed text-muted ring-1 ring-line">
              <Camera className="mt-0.5 size-4 shrink-0 text-olive" />
              {copy.photoshoot}
            </p>
          </aside>
        </div>

        <ReviewsSection lang={lang} reviews={reviews} title={copy.stories} />
      </div>
    </>
  );
}
