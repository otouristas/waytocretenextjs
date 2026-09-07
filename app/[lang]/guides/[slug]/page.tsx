import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LANGS, LANG_META, langPath, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import {
  getGuideCopy,
  getGuideCore,
  getTourCopy,
  getTourCore,
  guideLangs,
  guideSlugs,
} from "@/lib/content/load";
import { breadcrumbNode, faqNode, graph, id, pageMeta, personNode, webPageNode, type Crumb } from "@/lib/seo";
import { absolute } from "@/lib/seo/ids";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Prose, QuickAnswers } from "@/components/prose";
import { FaqList } from "@/components/tour/sections";
import { CatalogTourCard } from "@/components/tour/catalog-tour-card";
import { HOST_IMAGES, HOST_NAME, hostCopy } from "@/lib/i18n/host";

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
  const host = hostCopy(lang);
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
      author: { "@id": id.author(core.authorId) },
      publisher: { "@id": id.organization() },
      isPartOf: { "@id": id.website() },
    },
    // The author node itself, so the `@id` above resolves on this page rather
    // than pointing at something a consumer has to go and find.
    personNode({
      name: HOST_NAME,
      description: host.paragraphs[0],
      image: HOST_IMAGES[0].src,
    }),
    faqNode(copy.faqs),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <Breadcrumbs crumbs={crumbs} lang={lang} />

        <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
          {copy.title}
        </h1>

        <p className="mt-3 text-xs text-faint">
          <Link href={langPath(lang, "/about")} className="font-semibold text-accent hover:underline">
            {HOST_NAME}
          </Link>{" "}
          ·{" "}
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
              // The LCP image on 29 guides in five locales shipped with no
              // alt at all. The title is what every other content image on
              // the site describes itself with, and there is no per-image
              // description in the schema to draw on.
              alt={copy.title}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <QuickAnswers items={copy.quickAnswers} title={ui.atAGlance} />

        <div className="mt-8">
          <Prose markdown={copy.body} lang={lang} />
        </div>

        <FaqList faqs={copy.faqs} title={ui.faq} />

        {/* Who wrote this, at the end where a reader who has just finished
            2,000 words is deciding whether to trust it. The bio is the same
            one the About page publishes — one source, two placements. */}
        <aside className="mt-14 flex gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line">
          <Image
            src={HOST_IMAGES[0].src}
            alt={HOST_IMAGES[0].alt}
            width={72}
            height={72}
            className="size-16 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {host.eyebrow}
            </p>
            <p className="mt-1 font-display text-lg text-ink">{HOST_NAME}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{host.paragraphs[0]}</p>
            <Link
              href={langPath(lang, "/about")}
              className="mt-2 inline-block text-sm font-semibold text-accent hover:underline"
            >
              {ui.navAbout}
            </Link>
          </div>
        </aside>

        {linked.length > 0 ? (
          <section className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink">{ui.guidesMentioned}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {linked.slice(0, 4).map(({ core: c, copy: cp }) => (
                <CatalogTourCard key={c.slug} core={c} copy={cp} lang={lang} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
