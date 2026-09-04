import { tool } from "ai";
import { z } from "zod";
import type { Lang } from "@/lib/i18n/langs";
import { deskCopy } from "@/lib/i18n/desk";
import { experienceCard, searchRouteCards, searchTourCards, transferFacts, tourCard } from "@/lib/desk/brain";
import { PHONE_DISPLAY, WHATSAPP } from "@/lib/site";
import type { Category } from "@/lib/tours";
import { bookUrl, catalogUrl, getMonthAvailability, liveBooker } from "@/lib/travelotopos";

export function deskTools(lang: Lang) {
  return {
    searchExperiences: tool({
      description: "Search the guest-desk catalog for days that match a feeling, place, or keyword.",
      inputSchema: z.object({
        query: z.string().describe("What the guest wants: gorge, wine, boat, yoga, family, Knossos…"),
        category: z.string().optional().describe("Optional category: hiking, gastronomy, culture, beach, wellness, signature, nature"),
      }),
      // Full cards, not bare hits: the chat draws the same component here
      // that the offline path draws, so a model answer and a local one are
      // indistinguishable to the reader.
      execute: async ({ query, category }) => ({
        matches: searchTourCards(query, lang, category as Category | undefined),
      }),
    }),
    getExperience: tool({
      description: "Get operational facts for one experience by slug: price, pickup, group size, cancellation.",
      inputSchema: z.object({
        slug: z.string().describe("Tour slug from the catalog, e.g. south-crete-highlights"),
      }),
      execute: async ({ slug }) => ({ ...experienceCard(slug, lang), card: tourCard(slug, lang) }),
    }),
    checkAvailability: tool({
      description: "Live Travelotopos diary for a tour: closed and open dates this month, plus the book URL. Never invent dates. Use when the guest asks if a day is free or is on a live-calendar tour.",
      inputSchema: z.object({
        slug: z.string().describe("Tour slug from the catalog, e.g. imbros-gorge-guided-tour"),
        month: z.string().optional().describe("YYYY-MM. Defaults to the current month in Crete."),
      }),
      execute: async ({ slug, month }) => {
        const booker = liveBooker(slug);
        if (!booker) {
          return {
            live: false as const,
            slug,
            hint: deskCopy(lang).noLiveCalendar,
          };
        }
        const result = await getMonthAvailability(slug, month);
        if (!result.ok) {
          return {
            live: true as const,
            slug,
            error: result.error,
            catalogUrl: catalogUrl(booker.serviceId, booker.categoryId),
          };
        }
        const firstOpen = result.data.open[0];
        return {
          live: true as const,
          slug,
          month: result.data.month,
          openCount: result.data.open.length,
          open: result.data.open.slice(0, 12),
          closed: result.data.closed,
          catalogUrl: result.data.catalogUrl,
          bookUrl: firstOpen ? bookUrl(booker.serviceId, booker.categoryId, firstOpen) : result.data.catalogUrl,
        };
      },
    }),
    transferRules: tool({
      description: "Rethymno-area transfer coverage, airports, weddings, and where card checkout still lives.",
      inputSchema: z.object({
        note: z.string().optional().describe("Optional pickup or drop-off the guest mentioned"),
      }),
      execute: async ({ note }) => ({
        ...transferFacts(lang),
        guestNote: note ?? "",
        routes: searchRouteCards(note ?? "", lang),
      }),
    }),
    whatsappDesk: tool({
      description: "Share the live WhatsApp link for Ernest and the Rethymno desk.",
      inputSchema: z.object({
        reason: z.string().optional(),
      }),
      execute: async ({ reason }) => ({
        url: WHATSAPP,
        phone: PHONE_DISPLAY,
        hint: reason || deskCopy(lang).whatsappHint,
      }),
    }),
  };
}
