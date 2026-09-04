import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LANG, LANGS } from "@/lib/i18n/langs";
import { SITE_HOST } from "@/lib/site";

/**
 * Locale prefixing.
 *
 * Every route lives under `/{lang}`, including English, so canonical and
 * hreflang are trivially derivable from the path. This middleware is the only
 * thing that puts a visitor on a prefixed URL — `app/page.tsx` used to do it
 * too, and the duplication meant two places to keep in step.
 */

const SUPPORTED = new Set<string>(LANGS);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  // Apex is the only public host. www must 308 onto it so signals land on
  // the same origin the canonical and WebSite.url already name.
  if (host === `www.${SITE_HOST}`) {
    const dest = request.nextUrl.clone();
    dest.protocol = "https";
    dest.host = SITE_HOST;
    dest.port = "";
    return NextResponse.redirect(dest, 308);
  }

  // The site root. Temporary on purpose: browsers cache permanent redirects
  // aggressively, and locking `/` to English forever would make adding
  // Accept-Language negotiation later effectively impossible.
  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LANG}`, request.url), 307);
  }

  const first = pathname.split("/")[1];
  // Retired temporary Greek locale — send those URLs to English, not /en/el.
  if (first === "el") {
    const rest = pathname.replace(/^\/el(?=\/|$)/, "") || "";
    return NextResponse.redirect(new URL(`/${DEFAULT_LANG}${rest}`, request.url), 308);
  }
  if (first && !SUPPORTED.has(first) && !first.includes(".")) {
    // A path that simply lacks its locale prefix. This is a permanent
    // correction — the unprefixed form is never a valid URL on this site —
    // so 308 lets the destination consolidate the signals.
    return NextResponse.redirect(new URL(`/${DEFAULT_LANG}${pathname}`, request.url), 308);
  }

  return NextResponse.next();
}

export const config = {
  // robots.txt / sitemap / llms stay in the matcher so www → apex applies
  // to them too. The locale rewrite below ignores dotted first segments,
  // so those files still fall straight through on the apex host.
  matcher: [
    "/((?!_next|favicon|brand|patterns|api|icon|opengraph-image).*)",
  ],
};
