import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fill, LANGS, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import {
  getPlaceCopy,
  getPlaceCore,
  getTourCopy,
  getTourCore,
  placeLangs,
  placeSlugs,
} from "@/lib/content/load";
import { breadcrumbNode, faqNode, graph, id, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { Prose, QuickAnswers } from "@/components/prose";
import { FaqList } from "@/components/tour/sections";
import { TourCard } from "@/components/tour/tour-card";

/**
 * Attraction pages.
 *
 * These carry the SEO load. Product pages convert traffic; terms like
 * "kourtaliotiko gorge" and "lake kournas" are what actually earn it, and a
 * page that is genuinely about the place — with coordinates, an entry fee, an
 * open season and a drive time — is what ranks and what answer engines cite.
 */

export function generateStaticParams() {
  return placeSlugs().flatMap((slug) => LANGS.map((lang) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw) as Lang;
  const core = getPlaceCore(slug);
  const copy = getPlaceCopy(slug, lang) ?? getPlaceCopy(slug, "en");
  if (!core || !copy) return {};

  return pageMeta({
    lang,
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: `/places/${slug}`,
    image: core.hero,
    imageAlt: copy.name,
    availableLangs: placeLangs(slug),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw) as Lang;
  const core = getPlaceCore(slug);
  const copy = getPlaceCopy(slug, lang) ?? getPlaceCopy(slug, "en");
  if (!core || !copy) notFound();

  const ui = t(lang);
  const path = `/places/${slug}`;
  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navPlaces, path: "/places" },
    { name: copy.name, path },
  ];

  const tours = core.tours
    .map((s) => {
      const c = getTourCore(s);
      const cp = getTourCopy(s, lang) ?? getTourCopy(s, "en");
      return c && cp ? { core: c, copy: cp } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const jsonLd = graph([
    webPageNode({ lang, path, name: copy.seoTitle, description: copy.seoDescription, crumbs }),
    breadcrumbNode(lang, path, crumbs),
    {
      "@type": "TouristAttraction",
      "@id": id.place(slug),
      name: copy.name,
      description: copy.summary,
      url: absolute(lang, path),
      geo: { "@type": "GeoCoordinates", latitude: core.geo.lat, longitude: core.geo.lng },
      ...(core.sameAs.length ? { sameAs: core.sameAs } : {}),
      ...(core.hero ? { image: [core.hero] } : {}),
      ...(core.entryFeeEur != null
        ? {
            isAccessibleForFree: core.entryFeeEur === 0,
            offers: {
              "@type": "Offer",
              price: core.entryFeeEur,
              priceCurrency: "EUR",
            },
          }
        : {}),
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Crete, Greece",
      },
    },
    faqNode(copy.faqs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <div>
        {core.hero ? (
          <div className="relative h-[min(52vh,26rem)] w-full overflow-hidden">
            <Image
              src={core.hero}
              alt={copy.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-earth-900/85 via-earth-900/25 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto max-w-4xl px-4 pb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">
                  {ui.placeKinds[core.kind]}
                </p>
                <h1 className="mt-2 font-display text-4xl text-surface md:text-5xl">{copy.name}</h1>
              </div>
            </div>
          </div>
        ) : null}

        <article className="mx-auto max-w-4xl px-4 py-10">
          <nav aria-label={ui.breadcrumb} className="text-xs text-muted">
            <Link href={`/${lang}`} className="hover:text-olive-deep">
              {ui.home}
            </Link>
            <span className="px-1.5 text-faint">/</span>
            <span className="text-ink">{copy.name}</span>
          </nav>

          {!core.hero ? (
            <h1 className="mt-4 font-display text-4xl text-earth">{copy.name}</h1>
          ) : null}

          <p className="mt-6 border-l-2 border-olive pl-4 text-lg leading-relaxed text-ink">
            {copy.summary}
          </p>

          <QuickAnswers items={copy.quickAnswers} title={ui.atAGlance} />

          <div className="mt-8">
            <Prose markdown={copy.body} />
          </div>

          <FaqList faqs={copy.faqs} title={ui.faq} />

          {tours.length > 0 ? (
            <section className="mt-14 border-t border-line pt-10">
              <h2 className="font-display text-2xl text-earth">{fill(ui.visitWithUs, { name: copy.name })}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {tours.slice(0, 4).map(({ core: c, copy: cp }) => (
                  <TourCard key={c.slug} core={c} copy={cp} lang={lang} />
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </>
  );
}
