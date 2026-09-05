import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LANGS, langPath, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { allGuides } from "@/lib/content/load";
import { breadcrumbNode, graph, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  return pageMeta({ lang, title: ui.guidesSeoTitle, description: ui.guidesSeoDesc, path: "/guides" });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang) as Lang;
  const ui = t(lang);
  const guides = allGuides(lang);

  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navGuides, path: "/guides" },
  ];

  const jsonLd = graph([
    webPageNode({ lang, path: "/guides", name: ui.guidesSeoTitle, description: ui.guidesSeoDesc, crumbs }),
    breadcrumbNode(lang, "/guides", crumbs),
    {
      "@type": "ItemList",
      numberOfItems: guides.length,
      itemListElement: guides.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(lang, `/guides/${g.core.slug}`),
        name: g.copy.title,
      })),
    },
  ]);

  const [lead, ...rest] = guides;

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{ui.navGuides}</p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
            {ui.guidesHubTitle}
          </h1>
          <p className="mt-4 leading-relaxed text-muted">{ui.guidesSeoDesc}</p>
        </header>

        {guides.length === 0 ? (
          <p className="mt-10 rounded-xl bg-surface p-8 text-center text-muted ring-1 ring-line">
            {ui.guidesEmpty}
          </p>
        ) : (
          <>
            {/* The most recent guide gets a wide lead slot. */}
            <Link
              href={langPath(lang, `/guides/${lead.core.slug}`)}
              className="group mt-10 grid overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition hover:shadow-[0_28px_60px_-34px_rgba(57,36,32,0.5)] md:grid-cols-2"
            >
              {lead.core.hero ? (
                <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[19rem]">
                  <Image
                    src={lead.core.hero}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-col justify-center p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {ui.guideKinds[lead.core.kind]}
                </p>
                <h2 className="mt-2 font-display text-2xl leading-snug text-ink md:text-3xl">
                  {lead.copy.title}
                </h2>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">
                  {lead.copy.summary}
                </p>
              </div>
            </Link>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map(({ core, copy }) => (
                <Link
                  key={core.slug}
                  href={langPath(lang, `/guides/${core.slug}`)}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition hover:-translate-y-0.5"
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
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                      {ui.guideKinds[core.kind]}
                    </p>
                    <h2 className="mt-1.5 font-display text-lg leading-snug text-ink">
                      {copy.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                      {copy.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
