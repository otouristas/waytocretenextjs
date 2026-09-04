import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DeskChrome } from "@/components/desk/desk-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { LANGS, LANG_META, parseLang, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { orgJsonLd } from "@/lib/seo";
import { allReviews, ratingSummary } from "@/lib/content/load";
import { decorateNav } from "@/lib/nav/catalog";
import { BRAND, isIndexable, siteUrl } from "@/lib/site";
import "../globals.css";

/**
 * The root layout.
 *
 * It lives under `[lang]` on purpose: that is the only way `<html lang>` can
 * reflect the actual locale. The previous build kept the root layout at
 * `app/layout.tsx` and hard-coded `lang="en"`, so all six locales shipped as
 * English to screen readers and to Google. Five locales ship: en, de, it, fr, sv.
 */

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  const ui = t(lang);
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${BRAND} | ${ui.heroKicker}`,
      template: `%s | ${BRAND}`,
    },
    description: ui.layoutDesc,
    robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
    icons: { icon: "/brand/logos/favicon.png" },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = parseLang(raw) as Lang;

  return (
    <html lang={LANG_META[lang].hreflang} suppressHydrationWarning>
      <head>
        {/* Only the body face is preloaded. Cornetta is a below-the-fold
            accent; preloading it would compete with LCP for bandwidth. */}
        <link
          rel="preload"
          href="/brand/fonts/CFAsty.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <JsonLd data={orgJsonLd(lang)} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:ring-2 focus:ring-ring"
        >
          {t(lang).skipToContent}
        </a>
        {/*
          A flex column, not a plain block with `pb-28`.

          The old `pb-28` painted seven rems of page background *below* the
          footer to clear the fixed WhatsApp and chat orbs, which read as a
          rendering fault at the bottom of every page. That clearance now
          lives inside the footer's own legal row, where it is footer-coloured.
          `flex-1` on `<main>` also keeps the footer at the bottom of the
          viewport on pages too short to fill it, instead of leaving a band of
          bare ground under it.
        */}
        <div className="flex min-h-screen flex-col bg-bg text-ink">
          <Header lang={lang} rating={ratingSummary(allReviews())} nav={decorateNav(lang)} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer lang={lang} />
          <DeskChrome lang={lang} />
        </div>
      </body>
    </html>
  );
}
