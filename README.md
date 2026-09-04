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
| `AI_GATEWAY_API_KEY`, `AI_GATEWAY_MODEL` | Guest-desk chat. OIDC on Vercel also works without a key. |

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
| Reviews | 15 — **0 with a numeric rating**, so no `AggregateRating` is emitted |

Re-sync by re-running the harvest; the linter is the gate. Anything with a structural file but no
`en.json` is not routed, so a half-finished sync cannot 404.

## Status

The site builds 434 static pages across six locales. Design tokens, content schema, pricing engine,
SEO graph, per-locale `<html lang>`, 301 redirects, robots and a 414-URL sitemap with hreflang
alternates are all in place, as are the redesigned home, tours, tour detail, guide and place pages.

Still to do: the five transfer origin-pair pages, the `/rethymno` hub, the image pipeline
(imagery is still hot-linked from waytocrete.com), and locales beyond English — every non-English
page currently falls back to English copy and is correctly excluded from hreflang until it does not.
