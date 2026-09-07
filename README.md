# Rethymno Tours

Next.js 16 (App Router) site for **rethymnotours.com** — private guided tours, gorge hikes, food
experiences and airport transfers from Rethymno, Crete. Six locales: `en el de it fr sv`.

Sister brand: [waytocrete.com](https://waytocrete.com/) — same operator, separate site. Links
between the two are **contextual and in-content only**; there is deliberately no sitewide footer
or header link in either direction (see `lib/seo/links.ts`).

```bash
npm install
npm run dev      # open /en
npm run test     # pricing engine, against the real published rate ladders
npm run typecheck
npm run build
```

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Indexability switch. Canonicals, JSON-LD `WebSite`/`Organization` URLs and the sitemap always use `https://rethymnotours.com`. Set this to that same origin on production so the site is indexable; leave unset on previews. |
| `RESEND_API_KEY`, `RESEND_FROM` | Desk mail via Resend. Without a key, forms fall back to a `mailto:` draft. After the domain is verified, set `RESEND_FROM` to `Rethymno Tours desk <desk@rethymnotours.com>`. |
| `RESEND_DESK_TO` | Inbox that receives every request. Defaults to `info@waytocrete.com`. |

`isIndexable()` in `lib/site.ts` only returns true for the real production host — a Vercel preview
that ranks would compete with production for the same content.

## Vercel

This repo deploys as the **rethymnotours.com** site (Frankfurt, `fra1`). Sister brand
[waytocrete.com](https://waytocrete.com/) stays a separate origin.

On the Vercel project, set production-only:

```
NEXT_PUBLIC_SITE_URL=https://rethymnotours.com
```

Leave it unset on Preview and Development so those builds stay `noindex`. Optional:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY`, `RESEND_FROM` | Desk request mail. Forms fall back to `mailto:` without them. After DNS, `RESEND_FROM=Rethymno Tours desk <desk@rethymnotours.com>`. |
| `RESEND_DESK_TO` | Forward target. Defaults to `info@waytocrete.com`. |
| `RESEND_TEMPLATE_DESK`, `RESEND_TEMPLATE_GUEST` | Optional Resend template IDs. |

## Architecture

- **`lib/content/schema.ts`** — the content contract, as zod schemas. Every file under `content/`
  is validated at build time and the build fails on violation. This is what stops the known
  WordPress data defects (duplicated bodies, contradictory difficulty ratings, prices that
  disagree between two copies of a page) from shipping silently.
- **`lib/pricing.ts`** — the single pricing authority. The catalogue has five genuinely different
  pricing shapes (sliding per-person ladders, flat group rates, adult/child/private buyouts, fixed
  departures with deposits, and enquiry-only), modelled as a discriminated union. Both the booking
  UI and the JSON-LD `Offer` call `quote()`, so the price a guest sees and the price Google indexes
  cannot drift apart.
- **`content/photography/`** — the photography section, modelled as its own discriminated union
  (`PhotographyCore`) rather than squeezed into `TourCore`. Two families sit under `/photography`
  and must never be confused: an `experience` is a photographer photographing the **guest** (a
  ladder of packages, priced per session), a `workshop` is the **guest learning** photography (a
  multi-day fixed departure that only runs once its minimum group is reached). Every card, hub and
  feed renders the `promise` line for exactly that reason. Adding a product is a new folder.
- **`lib/seo/`** — one JSON-LD `@graph` per page, cross-referenced by `@id`. `graph.ts` builds the
  nodes, `meta.ts` the metadata, `ids.ts` the stable identifiers.
- **`app/[lang]/layout.tsx`** is the root layout. It lives under the dynamic segment so
  `<html lang>` reflects the actual locale.

## Rules that are easy to break

1. **No invented ratings.** `aggregateRatingNode()` takes real star values or returns `null`. No
   `AggregateRating` ships until genuine ratings are imported from Google and TripAdvisor.
2. **hreflang is coverage-gated.** A locale gets an alternate only when it has reviewed content for
   that page. Advertising six alternates over identical English is duplicate content.
3. **Prices come from `quote()`.** Nothing else may compute one.
4. **No sitewide link to the sister site.**

## Content

Harvested from waytocrete.com via the Novamira MCP and validated by `npm run content:lint`:

| | count |
|---|---|
| Tours | 21 |
| Guides | 29 (incl. 4 answer pages that never existed on WordPress) |
| Places | 12 attraction entities |
| Photography | 2 — one shoot experience (4 packages), one 4-day beginner workshop |
| Reviews | 15 — **0 with a numeric rating**, so no `AggregateRating` is emitted |

Re-sync by re-running the harvest; the linter is the gate. Anything with a structural file but no
`en.json` is not routed, so a half-finished sync cannot 404.

## Status

The site builds 531 static pages across five locales — Greek was retired and `/el/*` 308s to
`/en/*`. Design tokens, content schema, pricing engine, SEO graph, per-locale `<html lang>`, 301
redirects, robots and a sitemap with hreflang alternates are all in place, as are the redesigned
home, tours, tour detail, guide and place pages. All nine transfer origin-pairs ship, including
both airport runs in both directions. All five locales carry reviewed copy, so hreflang advertises
all five.

Still to do:

- **The image pipeline.** 215 unique images are hot-linked from waytocrete.com and `public/` holds
  no photographs. `scripts/media-build.ts` is referenced by `next.config.ts` and has never been
  written, so LCP depends on someone else's WordPress server and filenames cannot be made
  descriptive. All 29 guide heroes also render `alt=""` with no schema field to hold one.
- **Verified entity data.** `content/business.json` has no legal name, no VAT, an address with
  `confidence: "low"` and three contradictory opening-hours claims, and the Google Business Profile
  is still the sister brand's. None of it should become `LocalBusiness` markup until the operator
  confirms it.

### SEO notes

Two rules that are easy to undo by accident:

- **Internal links in Markdown bodies are rewritten to the reader's locale** at render time by
  `localiseHref()`. Authored links may be written unprefixed (`/tours/…`); do not "fix" them by
  hard-coding `/en/`.
- **Cross-domain links are capped by a list**, `SISTER_STORY_TOURS` in `lib/seo/links.ts`, not by
  convention. The tour template used to carry one unconditionally and shipped 105 anchors. The
  relationship is stated sitewide as text and as `alternateName` on the organization node; the
  hyperlink is not.
