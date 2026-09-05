import { fill, langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { deskCopy } from "@/lib/i18n/desk";
import { allTours, getTourCopy, getTourCore } from "@/lib/content/load";
import { priceFrom, isPriced } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { cadenceLabel, durationLabel } from "@/lib/content/format";
import type { TourCategory } from "@/lib/content/schema";
import { EMAIL, PHONE_DISPLAY, WHATSAPP } from "@/lib/site";
import { bookUrl, catalogUrl, getMonthAvailability, liveBooker } from "@/lib/travelotopos";
import { ratingSummary, reviewsForTour } from "@/lib/content/load";
import {
  estimateRoute,
  routeDuration,
  shortPlace,
  transferRoutes,
  transfers,
} from "@/lib/transfers";
import type { DeskAnswer, DeskRouteCard, DeskTourCard } from "@/lib/desk/cards";

export type DeskHit = {
  slug: string;
  title: string;
  href: string;
  price: string;
  duration: string;
  category: string;
  pickup: boolean;
  cancelHours: number;
  blurb: string;
};

export function tourSlugFromPath(path: string) {
  const match = path.match(/\/tours\/([^/?#]+)/);
  return match?.[1] ?? null;
}

/** The same "From €X" / "On request" wording the cards and widget use. */
function priceText(lang: Lang, price: Parameters<typeof priceFrom>[0]): string {
  const from = priceFrom(price);
  if (!isPriced(price) || from == null) return t(lang).onRequest;
  return `${t(lang).fromPrice} ${formatPrice(lang, from)}`;
}

export function searchDesk(query: string, lang: Lang, category?: string): DeskHit[] {
  const copy = t(lang);
  const q = query.toLowerCase().trim();
  const cat = category as TourCategory | undefined;
  const scored = allTours(lang).map(({ core: tour, copy: info }) => {
    if (cat && tour.category !== cat) return null;
    const hay = [tour.slug, info.title, info.summary, info.highlights.join(" "), tour.category, ...tour.places].join(" ").toLowerCase();
    let score = 0;
    if (!q) score = tour.featured ? 4 : 1;
    else {
      for (const word of q.split(/\s+/).filter((w) => w.length > 2)) {
        if (hay.includes(word)) score += 2;
        if (info.title.toLowerCase().includes(word)) score += 3;
      }
      if (/(hike|hiking|gorge)/.test(q) && tour.category === "hiking") score += 6;
      if (/(wine|food|cook|taste)/.test(q) && tour.category === "gastronomy") score += 6;
      if (/(boat|beach|sea|swim)/.test(q) && tour.category === "beach") score += 6;
      if (/(yoga|wellness|sunset)/.test(q) && tour.category === "wellness") score += 6;
    }
    if (score <= 0) return null;
    return {
      score,
      hit: {
        slug: tour.slug,
        title: info.title,
        href: langPath(lang, `/tours/${tour.slug}`),
        price: priceText(lang, tour.price),
        duration: durationLabel(tour.durationMinutes, lang),
        category: copy.categories[tour.category],
        pickup: tour.hotelPickup,
        cancelHours: tour.cancelFreeHours,
        blurb: info.summary.slice(0, 180),
      } satisfies DeskHit,
    };
  }).filter(Boolean) as { score: number; hit: DeskHit }[];
  return scored.sort((a, b) => b.score - a.score).slice(0, 5).map((row) => row.hit);
}

export function experienceCard(slug: string, lang: Lang) {
  const tour = getTourCore(slug);
  const info = getTourCopy(slug, lang) ?? getTourCopy(slug, "en");
  if (!tour || !info) return { found: false as const, slug };
  const copy = t(lang);
  return {
    found: true as const,
    slug: tour.slug,
    title: info.title,
    href: langPath(lang, `/tours/${tour.slug}`),
    price: priceText(lang, tour.price),
    priceNote: info.priceNote ?? "",
    duration: durationLabel(tour.durationMinutes, lang),
    pickup: tour.hotelPickup ? (tour.pickupTime ?? deskCopy(lang).pickupOnBooking) : deskCopy(lang).meetInTown,
    groupMax: tour.groupMax,
    cadence: cadenceLabel(tour.cadence, lang),
    cancelHours: tour.cancelFreeHours,
    photoshoot: tour.photoshoot,
    highlights: info.highlights.slice(0, 4),
    liveCalendar: false,
    payment: deskCopy(lang).tourPayment,
    privateGuide: tour.privateGuide
      ? `Optional private local guide €${tour.privateGuide.amount}, payable to the guide on the day, not charged online.`
      : null,
  };
}

export function transferFacts(lang: Lang) {
  const desk = deskCopy(lang);
  return {
    area: desk.transferArea,
    notCovered: desk.transferNotCovered,
    payment: desk.transferPayment,
    href: "/transfers",
  };
}

export function deskSystemPrompt(lang: Lang, path: string) {
  const current = tourSlugFromPath(path);
  const currentCard = current ? experienceCard(current, lang) : null;
  const catalog = allTours(lang)
    .map(({ core: tour, copy: info }) => {
      const from = priceFrom(tour.price);
      const price = from == null ? "on request" : `from ${formatPrice(lang, from)}`;
      return `- ${tour.slug}: ${info.title} · ${price} · ${durationLabel(tour.durationMinutes, lang)} · ${cadenceLabel(tour.cadence, lang)} · pickup ${tour.hotelPickup ? "yes" : "no"}`;
    })
    .join("\n");

  return `You are Olive, the concierge for Rethymno Tours, a local tour operator in Rethymno, Crete. You help guests hold a date, a private van, or a transfer. You are not a brochure writer and you never use the line "Don't visit Crete. Belong to it."

Voice: warm, specific, short. Like a cousin at the harbour desk. Reply in the guest's language (${lang}). Never invent prices, calendars, or availability. If a price is unknown, say on request. Never collect card numbers. Every booking is a request: we confirm availability first, and no payment is taken on this site.

Facts:
- Host: Ernest. Phone ${PHONE_DISPLAY}. Email ${EMAIL}. WhatsApp ${WHATSAPP}.
- Longer route write-ups are published by our sister brand Way to Crete.
- Hotel pickup is from the Rethymno area on most land days. Walks and the boat meet in town.
- Free cancellation where listed, typically 48 hours before pickup.
- Groups stay small (often 8 or fewer on land days). A photographer is on almost every experience.
- Transfers: Rethymno-area stays, airports when the villa is in our area. Not an island-wide taxi.

Catalog (use tools to quote a day; do not dump this list unless asked):
${catalog}

Current page: ${path || "unknown"}
${currentCard?.found ? `The guest is looking at: ${currentCard.title} (${currentCard.slug}), ${currentCard.price}. Prefer this day unless they ask for something else.` : ""}
${currentCard?.found && currentCard.privateGuide ? `Private guide add-on: ${currentCard.privateGuide}` : ""}

When they name a feeling (hike, wine, boat, yoga, family, wedding), call searchExperiences. When they name a slug or a specific day, call getExperience. If they ask whether a date is free, or they are on a live-calendar day, call checkAvailability — do not guess the diary. For airports, vans, weddings, call transferRules. Offer the live book URL when checkAvailability returns one, otherwise a date request and WhatsApp.`;
}


/* ───────────────────────── cards from local content ───────────────────────── */

/**
 * A tour, as the chat draws it.
 *
 * Everything comes out of content/tours and content/reviews. `rating` stays
 * null unless real, schema-eligible scores exist for that tour — the same
 * rule the tour grid follows, and the reason no card here shows five stars
 * by default.
 */
export function tourCard(slug: string, lang: Lang): DeskTourCard | null {
  const tour = getTourCore(slug);
  const info = getTourCopy(slug, lang) ?? getTourCopy(slug, "en");
  if (!tour || !info) return null;
  const copy = t(lang);
  const booker = liveBooker(tour.slug);
  return {
    kind: "tour",
    slug: tour.slug,
    title: info.title,
    href: langPath(lang, `/tours/${tour.slug}`),
    hero: tour.hero,
    price: priceText(lang, tour.price),
    duration: durationLabel(tour.durationMinutes, lang),
    cadence: cadenceLabel(tour.cadence, lang),
    category: copy.categories[tour.category],
    groupMax: tour.groupMax,
    pickup: tour.hotelPickup,
    photoshoot: tour.photoshoot,
    cancelHours: tour.cancelFreeHours,
    blurb: info.summary.slice(0, 150),
    highlights: info.highlights.slice(0, 3),
    featured: tour.featured,
    rating: ratingSummary(reviewsForTour(tour.slug)),
    bookUrl: booker ? catalogUrl(booker.serviceId, booker.categoryId) : null,
  };
}

/** The same ranking `searchDesk` uses, returning full cards. */
export function searchTourCards(query: string, lang: Lang, category?: string): DeskTourCard[] {
  return searchDesk(query, lang, category)
    .map((hit) => tourCard(hit.slug, lang))
    .filter((card): card is DeskTourCard => card !== null);
}

function routeCard(route: ReturnType<typeof transferRoutes>[number], lang: Lang): DeskRouteCard {
  const estimate = estimateRoute(route);
  return {
    kind: "route",
    slug: route.slug,
    from: shortPlace(route.from),
    to: shortPlace(route.to),
    href: langPath(lang, `/transfers/${route.slug}`),
    distanceKm: Math.round(route.distanceKm),
    duration: routeDuration(route.durationMinutes),
    estimate: estimate ? { low: estimate.low, high: estimate.high } : null,
    atMinimum: estimate?.atMinimum ?? false,
  };
}

/**
 * Transfer routes matching what the guest named.
 *
 * Matches on either end of the route and on airport shorthand, so "chq",
 * "chania airport" and "from the airport" all land somewhere sensible. With
 * no usable term it returns the published routes in file order rather than
 * nothing — an empty transfer answer is worse than the wrong first row.
 */
export function searchRouteCards(query: string, lang: Lang, limit = 3): DeskRouteCard[] {
  const q = query.toLowerCase();
  const words = q.split(/[^a-zα-ω0-9]+/i).filter((w) => w.length > 2);
  const scored = transferRoutes().map((route) => {
    const hay = `${route.slug} ${route.from} ${route.to}`.toLowerCase();
    let score = 0;
    for (const word of words) if (hay.includes(word)) score += 3;
    if (/\bchq\b/.test(q) && hay.includes("chania")) score += 4;
    if (/\bher\b|\bhrk\b/.test(q) && hay.includes("heraklion")) score += 4;
    if (/(airport|flight|arrival|landing)/.test(q) && hay.includes("airport")) score += 2;
    return { score, card: routeCard(route, lang) };
  });
  const hits = scored.filter((row) => row.score > 0).sort((a, b) => b.score - a.score);
  const rows = hits.length ? hits : scored;
  return rows.slice(0, limit).map((row) => row.card);
}


/**
 * The best published FAQ answer for what was asked.
 *
 * Tour pages carry their own FAQs, and the wedding product carries a set of
 * its own; between them they already answer much of what arrives in the chat
 * — what to bring, whether children are fine, what happens if it rains. This
 * matches on meaningful word overlap and returns the operator's own wording
 * rather than a paraphrase of it.
 *
 * The current page's FAQs are weighted up, so "is it hard?" on a gorge page
 * answers about that gorge.
 */
function faqAnswer(query: string, lang: Lang, currentSlug: string | null): string | null {
  const words = new Set(
    query.toLowerCase().split(/[^a-zα-ω0-9]+/i).filter((w) => w.length > 3),
  );
  if (words.size === 0) return null;

  const pool: { q: string; a: string; boost: number }[] = [];
  for (const { core, copy: info } of allTours(lang)) {
    for (const faq of info.faqs) {
      pool.push({ q: faq.q, a: faq.a, boost: core.slug === currentSlug ? 3 : 0 });
    }
  }
  // The only FAQ set on the transfer side lives under weddings.
  for (const faq of transfers().weddings.faqs) pool.push({ q: faq.q, a: faq.a, boost: 0 });

  let best: { score: number; a: string } | null = null;
  for (const row of pool) {
    const hay = row.q.toLowerCase();
    let score = row.boost;
    for (const word of words) if (hay.includes(word)) score += 2;
    if (score >= 4 && (!best || score > best.score)) best = { score, a: row.a };
  }
  return best?.a ?? null;
}

/* ─────────────────────────── the offline answer ─────────────────────────── */

/**
 * The desk without a model behind it.
 *
 * This is not a degraded fallback that apologises — it is the site answering
 * out of its own content, and on the questions guests actually ask (what does
 * it cost, does it pick me up, can I cancel, how do I get from the airport)
 * it can be exact where a model would have to hedge. It is the only path
 * the chat route uses — never a model, never gateway credits.
 *
 * It returns cards as well as prose, so the answer is something you can act
 * on rather than read.
 */
export async function answerLocally(userText: string, lang: Lang, path: string): Promise<DeskAnswer> {
  const copy = t(lang);
  const desk = deskCopy(lang);
  const q = userText.toLowerCase();
  const current = tourSlugFromPath(path);
  const pricing = transfers().pricing;

  const ask = {
    transfer: /(transfer|airport|heraklion|chania|taxi|van|flight|pick.?up from|drive|driver)/i.test(q),
    cancel: /(cancel|refund|change the date|reschedul)/i.test(q),
    pay: /(pay|payment|card|stripe|deposit|cash|cost me)/i.test(q),
    price: /(price|cost|how much|€|eur|budget|cheap)/i.test(q),
    wedding: /(wedding|bride|groom|marriage)/i.test(q),
    group: /(group|people|guests|kids|children|family|private)/i.test(q),
    whatsapp: /(whatsapp|call|phone|human|speak|talk)/i.test(q),
    included: /(included|include|bring|wear|cover|what do i get|what.s in)/i.test(q),
  };

  const followUps = copy.chatChips.slice(0, 3);

  if (ask.whatsapp) {
    return {
      text: fill(desk.whatsappReply, { phone: PHONE_DISPLAY }),
      tours: [],
      routes: [],
      followUps,
    };
  }

  if (ask.wedding) {
    return {
      text: desk.weddingReply,
      tours: [],
      routes: searchRouteCards(userText, lang, 2),
      followUps,
    };
  }

  if (ask.transfer) {
    const routes = searchRouteCards(userText, lang);
    const facts = transferFacts(lang);
    // `returnLegRate` is the bare word "same" in the source data, so it is
    // read as a flag rather than dropped into a sentence.
    const perKm = pricing.perKmRates.map((r) => r.eurPerKm);
    const meter = `${fill(desk.meterLine, {
      min: Math.min(...perKm),
      max: Math.max(...perKm),
      minimum: pricing.minimumOrderEur,
    })}${pricing.returnLegRate === "same" ? desk.meterReturn : ""}.`;
    return {
      text: `${facts.area} ${meter} ${facts.payment}`,
      tours: [],
      routes,
      followUps,
    };
  }

  if (ask.cancel) {
    return {
      text: desk.cancelReply,
      tours: current ? [tourCard(current, lang)].filter((c): c is DeskTourCard => c !== null) : [],
      routes: [],
      followUps,
    };
  }

  if (ask.pay) {
    return {
      text: desk.payReply,
      tours: [],
      routes: [],
      followUps,
    };
  }

  // "What's included" is answered from the tour's own list, never from a
  // general description of what days like this usually include.
  if (ask.included && current) {
    const info = getTourCopy(current, lang) ?? getTourCopy(current, "en");
    const card = tourCard(current, lang);
    if (info && card) {
      const included = info.included.slice(0, 5).join(", ");
      const excluded = info.excluded.length
        ? fill(desk.notIncluded, { list: info.excluded.slice(0, 3).join(", ") })
        : "";
      const bring = info.whatToBring.length
        ? fill(desk.bringPrefix, { list: info.whatToBring.slice(0, 3).join(", ").toLowerCase() })
        : "";
      return {
        text: `${fill(desk.onTour, { title: card.title, included })}${excluded}${bring}`,
        tours: [card],
        routes: [],
        followUps,
      };
    }
  }

  // Anything the operator has already written an answer to, answered in their
  // own words rather than approximated.
  const faq = faqAnswer(userText, lang, current);
  if (faq) {
    const card = current ? tourCard(current, lang) : null;
    return { text: faq, tours: card ? [card] : [], routes: [], followUps };
  }

  // On a tour page with no other intent, answer about *that* day.
  if (current) {
    const card = tourCard(current, lang);
    if (card) {
      const booker = liveBooker(current);
      if (booker) {
        const result = await getMonthAvailability(current);
        if (result.ok) {
          const sample = result.data.open.slice(0, 5).join(", ");
          const n = result.data.open.length;
          return {
            text: fill(desk.liveDiary, {
              title: card.title,
              n,
              days: n === 1 ? copy.day : copy.days,
              month: result.data.month,
              sample: sample ? ` — ${sample}` : "",
            }),
            tours: [card],
            routes: [],
            followUps,
          };
        }
      }
      const perks = [
        card.pickup ? desk.perkPickup : desk.perkMeet,
        fill(desk.perkGroup, { n: card.groupMax }),
        card.photoshoot ? desk.perkPhoto : null,
        card.cancelHours ? fill(desk.perkCancel, { n: card.cancelHours }) : null,
      ].filter(Boolean).join(", ");
      return {
        text: fill(desk.currentTour, {
          title: card.title,
          price: card.price,
          duration: card.duration,
          perks,
        }),
        tours: [card],
        routes: [],
        followUps,
      };
    }
  }

  const tours = searchTourCards(userText, lang);
  if (tours.length) {
    const lead = ask.price ? desk.leadPrice : ask.group ? desk.leadGroup : desk.leadFit;
    return { text: lead, tours: tours.slice(0, 3), routes: [], followUps };
  }

  return {
    text: copy.chatGreeting,
    tours: searchTourCards("", lang).slice(0, 2),
    routes: [],
    followUps: copy.chatChips,
  };
}
