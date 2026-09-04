import type { Metadata } from "next";
import { parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  return pageMeta({ lang, title: `${t(lang).aboutTitle} | Way to Crete`, description: t(lang).aboutLead, path: "/about" });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  const copy = t(lang);
  return (
    <main>
      <section className="relative h-[46vh] min-h-72 overflow-hidden pattern-olive">
        <img src="https://waytocrete.com/wp-content/uploads/2024/05/DJI_0715-scaled.jpg" alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-hero/35" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-10">
          <div className="mx-auto max-w-3xl text-surface">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-soft">{copy.navAbout}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">{copy.aboutTitle}</h1>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-lg leading-relaxed">{copy.aboutLead}</p>
        <p className="mt-4 text-muted">{copy.aboutBody}</p>
        <p className="mt-6 text-sm text-muted">{copy.ernest}</p>
      </div>
    </main>
  );
}
