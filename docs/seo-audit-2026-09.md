# Search audit — Google Search Console, 3–20 September 2026

Source: GSC exports for `rethymnotours.com` (chart, queries, pages, countries,
devices) covering 3–20 September 2026.

## The window

| | |
| --- | --- |
| Clicks | 35 |
| Impressions | 1,576 |
| CTR | 2.22% |
| Average position | ~31 |
| Queries returning any impression | 346 |
| Queries returning a click | **5** |

The first day in the export records 0 impressions and the second records 1.
This is not a mature property being under-served: it is the first three weeks
of a site's life, and the shape of the curve says so — impressions peak at 219
on 7 September, then settle to 40–70/day. That is the normal initial-crawl
spike and decay, not a regression to fix.

Read every number below against that. On-page work is not what is holding this
site back, and a plan that assumes otherwise will spend effort where there is
none to recover.

## What is actually good

Worth stating plainly, because it changes what is worth doing:

- Metadata is already answer-first and specific. `crete-without-a-car` opens
  its description with "Yes, Crete works without a hire car." The boat cruise
  already names Kamarola in its title. These do not need rewriting.
- `lib/seo/meta.ts` restricts hreflang to locales with reviewed copy, which is
  the correct and uncommon behaviour.
- `robots.txt` makes a deliberate, argued choice to admit citing AI crawlers
  and block training-only ones — the right posture for AEO.
- Place pages carry `quickAnswers` and FAQ blocks. That is the structure answer
  engines extract, and it is already in place.

The gap is authority and index maturity, not optimisation.

## Finding 1 — the home page and the tours hub shipped the same description

`app/[lang]/page.tsx` and `app/[lang]/tours/page.tsx` both passed `ui.heroSub`
to `pageMeta` as `description`. Ten URLs, five sentences, in the one field that
decides whether an impression becomes a click.

These are not obscure pages. Every one of them ranks and none of them converts:

| URL | Impressions | Position | Clicks |
| --- | --- | --- | --- |
| `/de` | 13 | 2.0 | 0 |
| `/sv` | 11 | 2.1 | 0 |
| `/it` | 12 | 10.8 | 0 |
| `/fr/tours` | 19 | 11.6 | 0 |
| `/it/tours` | 10 | 8.1 | 0 |
| `/sv/tours` | 9 | 17.1 | 0 |

A German home page at position 2 taking no clicks from 13 impressions is the
clearest signal in the export. Position 2 is not a ranking problem.

**Fixed** in this change: `homeSeoDesc` and `toursSeoDesc` added for all five
locales, and both pages repointed. `heroSub` stays what it always was, the
sentence under the hero heading.

## Finding 2 — the sitemap and the page head disagreed about hreflang

`app/sitemap.ts` emitted all five locale alternates for every tour, guide,
place and photography URL. `lib/seo/meta.ts` emits alternates only for locales
with reviewed copy. For any page missing a translation the two files told
Google different things about the same URL.

Google discards conflicting hreflang annotations rather than reconciling them,
and it discards the cluster, not the disputed entry. On a five-locale site
where four locales already underperform — `sv` runs 479 impressions at 0.63%
CTR — that is an expensive failure mode.

Only 4 of 340 content URLs are affected today, so this is not what is
suppressing traffic now. It is worth fixing because it is silent and because
it gets worse with every EN-first page added.

**Fixed** in this change: the sitemap now takes the locale list from the same
`*Langs()` helpers the pages use, and omits locale URLs with no reviewed copy
rather than listing an English page at a localised URL.

## Finding 3 — 20% of impressions are spent at positions no one sees

52 queries at position >40 account for 311 impressions and zero clicks:

| Query | Impressions | Position |
| --- | --- | --- |
| preveli beach | 20 | 49.6 |
| spinalonga | 20 | 76.8 |
| knossos palace | 15 | 84.5 |
| palace of knossos | 14 | 79.1 |
| cretan villages | 13 | 46.0 |
| wedding in crete | 11 | 52.5 |
| imbros gorge | 10 | 92.8 |

These are head terms owned by Wikipedia, the Ministry of Culture and the large
OTAs. A three-week-old operator site does not take them, and no title rewrite
changes that — at position 80 the snippet is never rendered.

This is the main reason the site-wide average position reads 31 rather than
~15. The recommendation is to leave these pages alone and stop reading the
average as a health metric; it is an average over queries the site is not
competing for.

Same effect by device: mobile sits at position 12.31 and desktop at 50.16. The
desktop number is almost entirely these deep head-term impressions.

## Finding 4 — the winnable demand is logistics, and it is already covered

55 queries sit at position 3–20 with zero clicks, totalling 110 impressions.
Every one of them is practical rather than inspirational:

| Query | Impressions | Position |
| --- | --- | --- |
| triopetra beach | 12 | 17.2 |
| kamarola | 7 | 8.1 |
| imbrosravinen kreta | 5 | 11.4 |
| samariaravinen längd | 5 | 11.8 |
| kourtaliotiko gorge opening hours | 4 | 10.5 |
| imbros vs samaria gorge | 4 | 10.8 |
| limni kourna | 4 | 11.0 |
| margarites kreta töpferei | 4 | 12.0 |
| distance rethymnon heraklion airport | 3 | 8.0 |
| lake kournas pedalo | 1 | 6.0 |

The obvious move is to build landing pages for these. **Do not.** Every one of
them already has a page ranking: `/en/places/kourtaliotiko-gorge` answers the
opening-hours query in its `quickAnswers`, `/de/places/margarites` is the
site's strongest German page at 65 impressions and position 13.3, and
`/en/tours/boat-cruise` is what ranks for "kamarola". Adding guides beside
them would split relevance between two of our own URLs.

Zero clicks on 110 impressions spread over 55 queries is not a content defect.
At four impressions a query, position 10 and a 5% CTR, the expected return is
0.2 clicks. These pages are not failing; the sample is too small to show the
difference between working and not.

The action here is patience and links, not pages.

## Finding 5 — the commercial pages are starved

| Section | URLs | Impressions | Clicks | Avg position |
| --- | --- | --- | --- | --- |
| places | 48 | 958 | 5 | 43.0 |
| guides | 60 | 579 | 13 | 29.1 |
| **tours** | **58** | **154** | **3** | **37.8** |
| transfers | 37 | 111 | 1 | 34.0 |

Place pages draw six times the impressions of tour pages. That is the right
shape for an attraction-led funnel, but only if the attraction pages hand
visitors to the product pages, and only if the product pages have enough
internal link equity to rank once someone searches commercially.

This is the highest-value open item and it is not a metadata problem. It wants
internal linking and, more than anything, time and referring domains.

## What this change does and does not claim

Shipped here: the duplicate-description fix, the sitemap hreflang fix, and the
brand-network entity work (see below). Those are defects with identifiable
causes.

Not shipped, deliberately: new pages for Finding 4, and rewritten titles on the
Finding 3 head terms. Both would be motion without mechanism, and the first
would actively cost relevance.

A 20x clicks target (35 → 700 in an 18-day window) is not reachable by on-page
change on a three-week-old domain, and nothing in this export suggests
otherwise. What reaches it is index maturity, referring domains, and the
long-tail impressions compounding as more of the 340 URLs are crawled and
trusted. The work above removes the two things that were actively wasting the
impressions the site already earns.

## Brand network and entity consolidation

The footer now links `waytocrete.com` (parent brand) and `elafonisitours.com`
(sister site), and `organizationNode()` declares the same relationship as
`parentOrganization` with the sibling as `subOrganization`.

The link half of this carries a real risk and it should be recorded. A
same-owner reciprocal link in a sitewide footer across three properties is the
recognised shape of a link network, and `components/footer.tsx` and
`lib/seo/links.ts` both previously argued against exactly this. The mitigations
applied: branded anchors only, never a commercial keyword; a label that says
"our sites" rather than dressing the row as a recommendation; and the schema
declaration, so an engine reading the links has the relationship stated rather
than inferred.

The entity half is an unambiguous gain and is the part worth having for AEO and
GEO. Three domains describing one licensed operator currently read as three
competing entities. `parentOrganization` merges them into one, which is what
lets an answer engine attribute a citation to the business rather than to
whichever domain it happened to crawl.

If rankings on any of the three properties move adversely, the footer row is
the first thing to revert; the schema should stay either way.
