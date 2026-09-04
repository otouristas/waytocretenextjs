import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LANGS = new Set(["en", "el", "de", "it", "fr", "sv"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/" || pathname === "") return NextResponse.redirect(new URL("/en", request.url));
  const first = pathname.split("/")[1];
  if (first && !LANGS.has(first) && !first.includes(".")) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon|brand|tours|patterns|api).*)"],
};
