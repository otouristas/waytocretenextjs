"use client";

import { type Lang, langPath } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { TOURS } from "@/lib/tours";
import { tourCopy } from "@/lib/i18n/tours-copy";

export function Footer({ lang }: { lang: Lang }) {
  const copy = t(lang);
  return (
    <footer className="mt-8 border-t border-line pattern-olive">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <img src="https://waytocrete.com/wp-content/uploads/2024/05/logo-small-beige.png" alt="Way to Crete" className="h-14 w-auto object-contain" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{copy.tagline}</p>
          <p className="mt-4 text-sm text-olive-deep">+30 697 253 1808<br />info@waytocrete.com<br />Rethymno, Crete</p>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-olive">{copy.footerTours}</h3>
          <ul className="space-y-2 text-sm text-muted">
            {TOURS.slice(0, 8).map((tour) => (
              <li key={tour.slug}>
                <a className="hover:text-olive-deep" href={langPath(lang, `/tours/${tour.slug}`)}>{tourCopy(lang, tour.slug)?.title}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-olive">{copy.footerNav}</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href={langPath(lang, "/tours")}>{copy.navTours}</a></li>
            <li><a href={langPath(lang, "/partners")}>{copy.navPartners}</a></li>
            <li><a href={langPath(lang, "/about")}>{copy.navAbout}</a></li>
            <li><a href={langPath(lang, "/contact")}>{copy.navContact}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-faint">{copy.rights}</div>
    </footer>
  );
}
