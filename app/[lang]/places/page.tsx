import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Car, Euro, Mountain, Ticket } from "lucide-react";
import { LANGS, langPath, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { allPlaces } from "@/lib/content/load";
import { breadcrumbNode, graph, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";

/**
 * The attractions index.
 *
 * This page did not exist. `/places/[slug]` shipped thirteen attraction
 * pages — the pages carrying the site's whole organic strategy — with no hub
 * above them, so `/places` 404'd, the footer had nowhere to point, and the
 * thirteen were reachable only from whichever tour happened to list them.
 *
 * Grouped by what the place is, because that is how a trip gets planned: a
 * visitor picks a gorge day or a beach day before picking which gorge.
 */

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

const KIND_ORDER = [
  "gorge",
  "beach",
  "site",
  "monastery",
  "lake",
  "cave",
  "town",
  "village",
  "summit",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  return pageMeta({ lang, title: ui.placesSeoTitle, description: ui.placesSeoDesc, path: "/places" });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const places = allPlaces(lang);

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navPlaces, path: "/places" },
  ];

  const jsonLd = graph([
    webPageNode({ lang, path: "/places", name: ui.placesSeoTitle, description: ui.placesSeoDesc, crumbs }),
    breadcrumbNode(lang, "/places", crumbs),
    {
      "@type": "ItemList",
      numberOfItems: places.length,
      itemListElement: places.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(lang, `/places/${p.core.slug}`),
        name: p.copy.name,
      })),
    },
  ]);

  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    label: ui.placeKinds[kind],
    items: places.filter((p) => p.core.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {ui.navPlaces}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
            {ui.placesHubTitle}
          </h1>
          <p className="mt-4 leading-relaxed text-muted">{ui.placesSeoDesc}</p>
        </header>

        {places.length === 0 ? (
          <p className="mt-10 rounded-xl bg-surface p-8 text-center text-muted ring-1 ring-line">
            {ui.placesEmpty}
          </p>
        ) : (
          grouped.map((group) => (
            <section key={group.kind} className="mt-12">
              <div className="mb-5 flex items-center gap-4">
                <h2 className="font-display text-2xl text-ink">{group.label}</h2>
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs text-faint">{group.items.length}</span>
              </div>

              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map(({ core, copy }) => (
                  <li key={core.slug}>
                    <Link
                      href={langPath(lang, `/places/${core.slug}`)}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(57,36,32,0.45)]"
                    >
                      {core.hero ? (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={core.hero}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition duration-700 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        // Not every attraction has a photograph that is
                        // genuinely of it, and a wrong hero is worse than
                        // none — so those cards lead with type instead.
                        <div className="grid aspect-[16/10] place-items-center bg-olive-50 text-accent">
                          <Mountain className="size-8" />
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-lg leading-snug text-ink">{copy.name}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                          {copy.summary}
                        </p>

                        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-4 text-xs text-faint">
                          {core.driveFromRethymnoMinutes != null ? (
                            <Meta icon={<Car className="size-3.5" />}>
                              {core.driveFromRethymnoMinutes} {ui.minShort}
                            </Meta>
                          ) : null}
                          {core.lengthKm != null ? (
                            <Meta icon={<Mountain className="size-3.5" />}>{core.lengthKm} km</Meta>
                          ) : null}
                          {core.entryFeeEur != null ? (
                            <Meta icon={<Ticket className="size-3.5" />}>
                              {core.entryFeeEur === 0 ? ui.freeEntry : `€${core.entryFeeEur}`}
                            </Meta>
                          ) : null}
                          {core.tours.length > 0 ? (
                            <Meta icon={<Euro className="size-3.5" />}>
                              {core.tours.length}{" "}
                              {core.tours.length === 1 ? ui.tourSingular : ui.navTours.toLowerCase()}
                            </Meta>
                          ) : null}
                        </ul>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <span className="text-accent">{icon}</span>
      {children}
    </li>
  );
}
