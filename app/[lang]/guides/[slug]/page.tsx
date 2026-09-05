import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LANGS, LANG_META, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import {
  getGuideCopy,
  getGuideCore,
  getTourCopy,
  getTourCore,
  guideLangs,
  guideSlugs,
} from "@/lib/content/load";
import { breadcrumbNode, faqNode, graph, id, pageMeta, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { Prose, QuickAnswers } from "@/components/prose";
import { FaqList } from "@/components/tour/sections";
import { TourCard } from "@/components/tour/tour-card";
import { BRAND } from "@/lib/site";

export function generateStaticParams() {
  return guideSlugs().flatMap((slug) => LANGS.map((lang) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw) as Lang;
  const core = getGuideCore(slug);
  const copy = getGuideCopy(slug, lang) ?? getGuideCopy(slug, "en");
  if (!core || !copy) return {};

  return pageMeta({
    lang,
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: `/guides/${slug}`,
    image: core.hero,
    imageAlt: copy.title,
    availableLangs: guideLangs(slug),
    type: "article",
    publishedTime: core.published,
    modifiedTime: core.updated,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang = parseLang(raw) as Lang;
  const core = getGuideCore(slug);
  const copy = getGuideCopy(slug, lang) ?? getGuideCopy(slug, "en");
  if (!core || !copy) notFound();

  const ui = t(lang);
  const path = `/guides/${slug}`;
  const crumbs: Crumb[] = [
    { name: ui.home, path: "/" },
    { name: ui.navGuides, path: "/guides" },
    { name: copy.title, path },
  ];

  // Products this guide should funnel to — the whole point of an answer page.
  const linked = core.tours
    .map((s) => {
      const c = getTourCore(s);
      const cp = getTourCopy(s, lang) ?? getTourCopy(s, "en");
      return c && cp ? { core: c, copy: cp } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const jsonLd = graph([
    webPageNode({
      lang,
      path,
      name: copy.seoTitle,
      description: copy.seoDescription,
      crumbs,
      modified: core.updated,
    }),
    breadcrumbNode(lang, path, crumbs),
    {
      "@type": "Article",
      "@id": id.guide(lang, slug),
      headline: copy.title,
      description: copy.summary,
      url: absolute(lang, path),
      datePublished: core.published,
      dateModified: core.updated,
      ...(core.hero ? { image: [core.hero] } : {}),
      author: { "@id": id.organization() },
      publisher: { "@id": id.organization() },
      isPartOf: { "@id": id.website() },
    },
    faqNode(copy.faqs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <nav aria-label={ui.breadcrumb} className="text-xs text-muted">
          <Link href={`/${lang}`} className="hover:text-accent">
            {ui.home}
          </Link>
          <span className="px-1.5 text-faint">/</span>
          <Link href={`/${lang}/guides`} className="hover:text-accent">
            {ui.navGuides}
          </Link>
        </nav>

        <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
          {copy.title}
        </h1>

        <p className="mt-3 text-xs text-faint">
          {BRAND} ·{" "}
          <time dateTime={core.updated}>
            {ui.updatedOn}{" "}
            {new Date(`${core.updated}T00:00:00Z`).toLocaleDateString(LANG_META[lang].dateLocale, {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
        </p>

        {/* The answer, before anything else. */}
        <p className="mt-6 border-l-2 border-olive pl-4 text-lg leading-relaxed text-ink">
          {copy.summary}
        </p>

        {core.hero ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={core.hero}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <QuickAnswers items={copy.quickAnswers} title={ui.atAGlance} />

        <div className="mt-8">
          <Prose markdown={copy.body} />
        </div>

        <FaqList faqs={copy.faqs} title={ui.faq} />

        {linked.length > 0 ? (
          <section className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink">{ui.guidesMentioned}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {linked.slice(0, 4).map(({ core: c, copy: cp }) => (
                <TourCard key={c.slug} core={c} copy={cp} lang={lang} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
