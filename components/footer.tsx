import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { fill, type Lang, langPath } from "@/lib/i18n/langs";
import { mainNav, secondaryNav } from "@/lib/i18n/nav";
import { t } from "@/lib/i18n/ui";
import { allGuides, allPlaces, allTours, allReviews, ratingSummary } from "@/lib/content/load";
import { transferRoutes } from "@/lib/transfers";
import { GoogleWordmark, Stars, TripAdvisorOwl } from "@/components/trust/source-logos";
import { BrandLogo } from "@/components/brand-logo";
import {
  ADDRESS_DISPLAY,
  BRAND,
  EMAIL,
  MHTE_LICENCE,
  PHONE,
  PHONE_DISPLAY,
  SOCIAL,
} from "@/lib/site";

/**
 * The footer.
 *
 * A server component — it was previously marked `"use client"` despite having
 * no state or browser API at all.
 *
 * Note what is not here: a sitewide link to the sister site. A link on every
 * page of both properties is the clearest cross-site footprint there is, so
 * links to waytocrete.com are contextual and in-content only.
 */
export function Footer({ lang }: { lang: Lang }) {
  const ui = t(lang);
  const tours = allTours(lang)
    .filter((x) => x.core.featured)
    .slice(0, 6);
  // What the Explore column leaves out: a hub with nothing behind it yet,
  // which would be a link to an empty page, and anything the columns beside
  // it already list under the same label.
  const skipInExplore = new Set<string>([langPath(lang, "/transfers/weddings")]);
  if (allPlaces(lang).length === 0) skipInExplore.add(langPath(lang, "/places"));
  if (allGuides(lang).length === 0) skipInExplore.add(langPath(lang, "/guides"));
  const routes = transferRoutes().slice(0, 5);
  const rating = ratingSummary(allReviews());

  return (
    <footer className="mt-16 border-t border-line pattern-olive">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <BrandLogo lang={lang} height={56} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{ui.aboutLead}</p>

          <address className="mt-5 grid gap-2 text-sm not-italic text-muted">
            <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 hover:text-accent">
              <Phone className="size-3.5 text-accent" />
              {PHONE_DISPLAY}
            </a>
            <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 hover:text-accent">
              <Mail className="size-3.5 text-accent" />
              {EMAIL}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-3.5 text-accent" />
              {ADDRESS_DISPLAY}
            </span>
          </address>

          {/* Icons, not the words "Instagram · TikTok · Facebook". Three
              platform names set in caps read as a list of links to nowhere;
              the marks are recognised at a glance and take a third of the
              room. Each keeps an accessible name. */}
          <ul className="mt-5 flex items-center gap-2">
            <SocialIcon href={SOCIAL.instagram} label="Instagram">
              <Instagram className="size-4" />
            </SocialIcon>
            <SocialIcon href={SOCIAL.facebook} label="Facebook">
              <Facebook className="size-4" />
            </SocialIcon>
            <SocialIcon href={SOCIAL.tiktok} label="TikTok">
              <TikTokGlyph className="size-4" />
            </SocialIcon>
            <SocialIcon href={SOCIAL.tripadvisor} label="Tripadvisor">
              <TripAdvisorOwl className="h-3 w-auto" />
            </SocialIcon>
          </ul>
        </div>

        <FooterColumn title={ui.footerTours}>
          {tours.map(({ core, copy }) => (
            <FooterLink key={core.slug} href={langPath(lang, `/tours/${core.slug}`)}>
              {copy.title}
            </FooterLink>
          ))}
          <FooterLink href={langPath(lang, "/tours")}>{ui.viewAll}</FooterLink>
        </FooterColumn>

        <FooterColumn title={ui.navTransfers}>
          {routes.map((route) => (
            <FooterLink key={route.slug} href={langPath(lang, `/transfers/${route.slug}`)}>
              {route.from} → {route.to}
            </FooterLink>
          ))}
          <FooterLink href={langPath(lang, "/transfers/weddings")}>{ui.weddingTransfers}</FooterLink>
        </FooterColumn>

        {/* Every link here comes from the nav lists and nowhere else. This
            column used to name Places, Guides and Reviews by hand as well,
            which was correct until each of them was promoted into `mainNav`
            or `secondaryNav` — after which the footer listed all three
            twice. */}
        <FooterColumn title={ui.footerNav}>
          {[...mainNav(lang), ...secondaryNav(lang)]
            .filter((item) => !skipInExplore.has(item.href))
            .map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
        </FooterColumn>
      </div>

      {/* Trust row: what we are licensed as, what guests scored us, and what
          we take payment in. All three are claims a first-time visitor
          checks for, and all three are verifiable. */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-6 px-4 py-8">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/trust/gnto.png"
              alt=""
              width={135}
              height={132}
              className="size-12 shrink-0 object-contain"
            />
            <p className="text-xs leading-relaxed text-muted">
              <span className="block font-semibold text-ink">{ui.licensedTitle}</span>
              {MHTE_LICENCE ? `${ui.gntoLicence} ${MHTE_LICENCE}` : ui.gntoLicence}
            </p>
          </div>

          {rating ? (
            <Link
              href={langPath(lang, "/reviews")}
              className="group flex items-center gap-3 text-xs text-muted"
            >
              <Stars value={rating.average} size={14} label={fill(ui.starsOutOf, { n: rating.average.toFixed(1) })} />
              <span>
                <span className="font-semibold text-ink">{rating.average.toFixed(1)}</span>{" "}
                {ui.reviewsOn}{" "}
                <span className="inline-flex translate-y-[1px] items-center gap-1.5">
                  <GoogleWordmark className="h-3 w-auto" />
                </span>{" "}
                <span className="underline decoration-line group-hover:decoration-olive">
                  {rating.count} {ui.reviews}
                </span>
              </span>
            </Link>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              {ui.paymentTitle}
            </span>
            {/* One flat sprite from the operator's own site rather than five
                separate scheme marks — the card networks' brand guidelines
                forbid recolouring or rebuilding them, so this ships the
                artwork exactly as supplied. */}
            <Image
              src="/brand/payments/payment-methods.png"
              alt={ui.paymentAlt}
              width={600}
              height={90}
              className="h-6 w-auto opacity-90"
            />
          </div>
        </div>
      </div>

      {/*
        The legal row carries the page's bottom padding.

        This used to be `pb-28` on the layout's outermost div, which put seven
        rems of bare page background *below* the footer and read as a
        rendering bug. The clearance is genuinely needed — the WhatsApp and
        chat orbs are `fixed` to the bottom corners and would otherwise sit on
        top of this text — so it now belongs to the footer, where it is
        footer-coloured rather than empty ground.
      */}
      <div className="border-t border-line px-4 pt-5 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+5rem))]">
        <div className="mx-auto grid max-w-6xl gap-4 text-xs text-faint">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              © {new Date().getFullYear()} {BRAND} · {ADDRESS_DISPLAY}
            </p>
            <nav className="flex gap-4">
              <Link href={langPath(lang, "/terms")} className="hover:text-accent">
                {ui.terms}
              </Link>
              <Link href={langPath(lang, "/privacy")} className="hover:text-accent">
                {ui.privacy}
              </Link>
              <Link href={langPath(lang, "/contact")} className="hover:text-accent">
                {ui.navContact}
              </Link>
            </nav>
          </div>

          {/* Credits and the partner property. The Discover Crete mark is
              self-hosted: their /favicon.svg is a 1.3 MB PNG in an SVG
              wrapper, which is not something to pull on every page view. */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:justify-end">
            <a
              href="https://anotherseoguru.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              Designed by <span className="font-semibold text-muted">AnotherSEOGuru</span>
            </a>
            <a
              href="https://touristas.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              Powered by <span className="font-semibold text-muted">Touristas AI</span>
            </a>
            <a
              href="https://discover-crete.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition hover:opacity-90"
            >
              <Image
                src="/brand/partners/discover-crete.png"
                alt=""
                width={63}
                height={64}
                className="size-5 object-contain"
              />
              <span className="leading-tight">
                <span className="block text-xs font-bold text-ink">Discover Crete</span>
                <span className="block text-[9px] font-medium uppercase tracking-wider text-faint">
                  Partner
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{title}</h3>
      <ul className="space-y-2 text-sm text-muted">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-accent">
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className="grid size-9 place-items-center rounded-full bg-surface text-ink ring-1 ring-line transition hover:bg-olive hover:text-paper hover:ring-olive"
      >
        {children}
      </a>
    </li>
  );
}

/** lucide-react has no TikTok glyph, so it is drawn here. */
function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1 0-5.18c.27 0 .52.04.76.12v-3.2a5.9 5.9 0 0 0-.76-.05A5.72 5.72 0 0 0 4.14 15.3 5.72 5.72 0 0 0 9.86 21a5.72 5.72 0 0 0 5.72-5.72V9.01a7.35 7.35 0 0 0 4.28 1.37V7.3a4.29 4.29 0 0 1-3.26-1.48z" />
    </svg>
  );
}
