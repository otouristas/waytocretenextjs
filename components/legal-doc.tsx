import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { LANG_META, langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { LegalDoc as Doc } from "@/lib/content/legal";
import { Prose } from "@/components/prose";
import { EMAIL, PHONE, PHONE_DISPLAY } from "@/lib/site";

/**
 * The shell both legal documents render in.
 *
 * No hero image. A photograph of a gorge above a cancellation table is
 * decoration on a page people open for one reason — to find a specific
 * clause — so the room goes to a contents rail instead, and every h2 is a
 * link target so support can send a guest straight to the paragraph that
 * answers them.
 */
export function LegalDoc({ doc, lang }: { doc: Doc; lang: Lang }) {
  const ui = t(lang);
  const other = doc.slug === "terms" ? "privacy" : "terms";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{ui.legalKicker}</p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{doc.title}</h1>
        <p className="mt-4 leading-relaxed text-muted">{doc.description}</p>
        <p className="mt-4 text-xs text-faint">
          {ui.lastUpdated}{" "}
          <time dateTime={doc.updated}>
            {new Date(doc.updated).toLocaleDateString(LANG_META[lang].dateLocale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_200px] lg:items-start">
        <div className="min-w-0 max-w-2xl">
          <Prose markdown={doc.markdown} anchors />

          <aside className="mt-12 rounded-2xl bg-surface p-5 ring-1 ring-line">
            <h2 className="font-display text-lg text-ink">{ui.getInTouch}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{ui.legalAsk}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-olive px-4 py-2 text-xs font-semibold text-paper transition hover:bg-olive-deep"
              >
                <Mail className="size-3.5" />
                {EMAIL}
              </a>
              <a
                href={`tel:${PHONE}`}
                className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-semibold text-ink ring-1 ring-line transition hover:ring-olive-200"
              >
                <Phone className="size-3.5 text-accent" />
                {PHONE_DISPLAY}
              </a>
            </div>
            <p className="mt-4 text-xs text-faint">
              {ui.seeAlso}{" "}
              <Link
                href={langPath(lang, `/${other}`)}
                className="font-medium text-accent underline"
              >
                {other === "privacy" ? ui.privacy : ui.terms}
              </Link>
              .
            </p>
          </aside>
        </div>

        {/* The contents rail. Sticky on desktop; on narrow screens it sits
            above the body, where it works as the jump list it already is. */}
        <nav
          aria-label={ui.onThisPage}
          className="order-first lg:order-none lg:sticky lg:top-28"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
            {ui.onThisPage}
          </h2>
          <ol className="mt-3 grid gap-2 border-l border-line pl-4 text-sm">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted transition hover:text-accent"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
