import "server-only";
import { LANGS, langPath, DEFAULT_LANG } from "@/lib/i18n/langs";
import {
  allGuides,
  allPlaces,
  allTours,
  allReviews,
  ratingSummary,
} from "@/lib/content/load";
import { transfers, transferRoutes, shortPlace, routeDuration, estimateRoute } from "@/lib/transfers";
import { durationLabel } from "@/lib/content/format";
import { isPriced, priceFrom, priceTo } from "@/lib/pricing";
import { legalDoc, LEGAL_SLUGS } from "@/lib/content/legal";
import {
  ADDRESS_DISPLAY,
  BRAND,
  EMAIL,
  MHTE_LICENCE,
  PHONE_DISPLAY,
  SISTER_ORIGIN,
  siteUrl,
} from "@/lib/site";

/**
 * llms.txt and llms-full.txt.
 *
 * The premise of this site is that answer engines, not blue links, are where
 * a Rethymno operator can still win — so these two files are treated as a
 * first-class surface rather than a checkbox. The sister site advertises an
 * `llms.txt` through its SEO plugin and then 404s it, which is worse than
 * having none.
 *
 * `llms.txt` is the index: what this business is, what it sells, and where
 * every page lives. `llms-full.txt` is the corpus: the actual answer-first
 * summary of every tour, attraction and guide, with the prices and the
 * durations and the drive times, so a model quoting us quotes something
 * true rather than reconstructing it from a listing page.
 *
 * Both are English-only and point at the English URLs. Six translations of
 * the same corpus would dilute rather than help, and the English URL is the
 * canonical one for every page on the site.
 */

const LANG = DEFAULT_LANG;

function url(path = "") {
  return `${siteUrl()}${langPath(LANG, path)}`;
}

/** "€44–145 per person" / "€350 for the group" / "On request". */
function priceLine(price: Parameters<typeof isPriced>[0]): string {
  if (!isPriced(price)) return "On request";
  const low = priceFrom(price);
  const high = priceTo(price);
  if (low == null) return "On request";

  const unit =
    price.kind === "flat_group"
      ? price.unitLabel === "couple"
        ? "per couple"
        : "for the group"
      : price.kind === "banded_group"
        ? "for the group"
        : price.kind === "hourly_private"
          ? "for a 5-hour private day"
        : "per person";

  if (high != null && high !== low) return `€${low}–${high} ${unit}`;
  return `€${low} ${unit}`;
}

export function llmsTxt(): string {
  const tours = allTours(LANG);
  const places = allPlaces(LANG);
  const guides = allGuides(LANG);
  const routes = transferRoutes();
  const rating = ratingSummary(allReviews());

  const lines: string[] = [];

  lines.push(`# ${BRAND}`);
  lines.push("");
  lines.push(
    `> Private guided day tours, gorge hikes, food experiences and airport transfers operated from Rethymno, Crete. Small groups of up to eight, local guides, hotel pickup across the Rethymno region, and free cancellation up to 48 hours before pickup.`,
  );
  lines.push("");

  lines.push("## About this operator");
  lines.push("");
  lines.push(`- Based in ${ADDRESS_DISPLAY}`);
  if (MHTE_LICENCE) {
    lines.push(`- Licensed Greek tour operator, Ministry of Tourism (GNTO/MHTE) ${MHTE_LICENCE}`);
  }
  lines.push(`- Contact: ${EMAIL}, ${PHONE_DISPLAY}`);
  lines.push(`- Sister brand, same operator: ${SISTER_ORIGIN}`);
  if (rating) {
    lines.push(
      `- ${rating.average.toFixed(1)} out of 5 from ${rating.count} Google reviews: ${url("/reviews")}`,
    );
  }
  lines.push(
    `- No payment is taken on this site. A booking is a request; the operator confirms the date in writing.`,
  );
  lines.push(`- Site languages: ${LANGS.join(", ")}. Canonical URLs are the /${LANG}/ ones.`);
  lines.push("");

  lines.push("## Tours and experiences");
  lines.push("");
  for (const { core, copy } of tours) {
    lines.push(
      `- [${copy.title}](${url(`/tours/${core.slug}`)}): ${durationLabel(core.durationMinutes, LANG)}, ${core.difficulty}, ${priceLine(core.price)}. ${copy.summary.split(". ")[0]}.`,
    );
  }
  lines.push("");

  lines.push("## Transfers");
  lines.push("");
  lines.push(`- [All transfers](${url("/transfers")}): ${transfers().coverage.statement}`);
  lines.push(
    `- [Wedding transfers](${url("/transfers/weddings")}): guest transport for destination weddings in the Rethymno region.`,
  );
  for (const route of routes) {
    const estimate = estimateRoute(route);
    lines.push(
      `- [${shortPlace(route.from)} to ${shortPlace(route.to)}](${url(`/transfers/${route.slug}`)}): ${route.distanceKm} km, about ${routeDuration(route.durationMinutes)}${
        estimate ? `, estimated €${estimate.low}–${estimate.high}` : ""
      }.`,
    );
  }
  lines.push("");

  lines.push("## Places in Crete");
  lines.push("");
  for (const { core, copy } of places) {
    lines.push(
      `- [${copy.name}](${url(`/places/${core.slug}`)}): ${core.kind}${
        core.driveFromRethymnoMinutes != null
          ? `, ${core.driveFromRethymnoMinutes} minutes from Rethymno`
          : ""
      }.`,
    );
  }
  lines.push("");

  lines.push("## Guides");
  lines.push("");
  for (const { core, copy } of guides) {
    lines.push(`- [${copy.title}](${url(`/guides/${core.slug}`)}): ${copy.seoDescription}`);
  }
  lines.push("");

  lines.push("## Optional");
  lines.push("");
  lines.push(`- [Reviews](${url("/reviews")}): every Google and Tripadvisor review, unedited.`);
  lines.push(`- [About](${url("/about")})`);
  lines.push(`- [Contact](${url("/contact")})`);
  lines.push(`- [For travel trade](${url("/partners")})`);
  for (const slug of LEGAL_SLUGS) {
    lines.push(`- [${legalDoc(slug, LANG).title}](${url(`/${slug}`)})`);
  }
  lines.push(`- [Full content for language models](${siteUrl()}/llms-full.txt)`);
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function llmsFullTxt(): string {
  const data = transfers();
  const out: string[] = [];

  out.push(`# ${BRAND} — full content`);
  out.push("");
  out.push(
    `Everything this operator sells, with the facts that answer the questions people ask. Generated from the site's own content files, so it cannot drift from the pages. Source: ${siteUrl()}`,
  );
  out.push("");
  out.push("---");
  out.push("");

  /* ── tours ─────────────────────────────────────────────────────────── */
  out.push("## Tours and experiences");
  out.push("");
  for (const { core, copy } of allTours("en")) {
    out.push(`### ${copy.title}`);
    out.push("");
    out.push(`URL: ${url(`/tours/${core.slug}`)}`);
    out.push("");
    out.push(copy.summary);
    out.push("");
    out.push(`- Duration: ${durationLabel(core.durationMinutes, "en")}`);
    out.push(`- Difficulty: ${core.difficulty}`);
    out.push(`- Group size: ${core.groupMin}–${core.groupMax}`);
    out.push(`- Price: ${priceLine(core.price)}`);
    if (core.pickupTime) out.push(`- Pickup time: ${core.pickupTime}`);
    out.push(`- Hotel pickup: ${core.hotelPickup ? "yes, across the Rethymno area" : "no"}`);
    if (core.photoshoot) out.push("- Includes a professional photoshoot at no extra cost");
    out.push(`- Free cancellation: up to ${core.cancelFreeHours} hours before pickup`);
    if (core.privateGuide) {
      out.push(
        `- Optional private local guide: €${core.privateGuide.amount}, payable to the guide on the day of the tour, not part of the tour price and not charged online`,
      );
    }
    if (core.thirdPartyCosts.length > 0) {
      out.push(
        `- Paid on the day to third parties: ${core.thirdPartyCosts
          .map((c) => `${c.label}${c.amount != null ? ` €${c.amount}` : ""}`)
          .join(", ")}`,
      );
    }
    out.push("");
    out.push("Highlights:");
    for (const highlight of copy.highlights) out.push(`- ${highlight}`);
    out.push("");
    if (copy.included.length > 0) {
      out.push(`Included: ${copy.included.join("; ")}`);
      out.push("");
    }
    if (copy.excluded.length > 0) {
      out.push(`Not included: ${copy.excluded.join("; ")}`);
      out.push("");
    }
    for (const faq of copy.faqs) {
      out.push(`**${faq.q}** ${faq.a}`);
      out.push("");
    }
  }

  /* ── transfers ─────────────────────────────────────────────────────── */
  out.push("---");
  out.push("");
  out.push("## Transfers");
  out.push("");
  out.push(`URL: ${url("/transfers")}`);
  out.push("");
  out.push(data.coverage.statement);
  out.push("");
  out.push(
    `Fares are metered per kilometre, not sold as flat route fares: ${data.pricing.perKmRates
      .map(
        (r) =>
          `€${r.eurPerKm.toFixed(2)} per km for ${r.minPassengers}–${r.maxPassengers} passengers`,
      )
      .join(", ")}. Minimum distance ${data.pricing.minimumDistanceKm} km, minimum order €${data.pricing.minimumOrderEur}. Payment: ${data.pricing.paymentMethods.join(", ")}.`,
  );
  out.push("");
  out.push(
    `Vehicle: ${data.vehicle.name}, up to ${data.vehicle.passengers} passengers and ${data.vehicle.bags} bags. ${data.vehicle.description}`,
  );
  out.push("");
  for (const extra of data.extras) {
    out.push(
      `- ${extra.label}: ${extra.description}${extra.priceEur === 0 ? ", free of charge" : `, €${extra.priceEur}`}${extra.maxQuantity ? `, up to ${extra.maxQuantity} per booking` : ""}.`,
    );
  }
  out.push("");
  out.push("### Routes");
  out.push("");
  for (const route of transferRoutes()) {
    const estimate = estimateRoute(route);
    out.push(
      `- ${route.from} to ${route.to} — ${route.distanceKm} km, about ${routeDuration(route.durationMinutes)}${estimate ? `, estimated €${estimate.low}–${estimate.high}` : ""}. ${url(`/transfers/${route.slug}`)}`,
    );
  }
  out.push("");
  out.push("### Wedding transfers");
  out.push("");
  out.push(`URL: ${url("/transfers/weddings")}`);
  out.push("");
  out.push(data.weddings.positioning);
  out.push("");
  for (const service of data.weddings.services) out.push(`- ${service}`);
  out.push("");
  out.push(data.weddings.coverageNote);
  out.push("");
  for (const faq of data.weddings.faqs) {
    out.push(`**${faq.q}** ${faq.a}`);
    out.push("");
  }

  /* ── places ────────────────────────────────────────────────────────── */
  out.push("---");
  out.push("");
  out.push("## Places in Crete");
  out.push("");
  for (const { core, copy } of allPlaces("en")) {
    out.push(`### ${copy.name}`);
    out.push("");
    out.push(`URL: ${url(`/places/${core.slug}`)}`);
    out.push("");
    out.push(copy.summary);
    out.push("");
    for (const answer of copy.quickAnswers) out.push(`- ${answer.term}: ${answer.value}`);
    if (core.entryFeeEur != null) {
      out.push(`- Entry fee: ${core.entryFeeEur === 0 ? "free" : `€${core.entryFeeEur}`}`);
    }
    if (core.driveFromRethymnoMinutes != null) {
      out.push(`- Drive from Rethymno: ${core.driveFromRethymnoMinutes} minutes`);
    }
    out.push(`- Coordinates: ${core.geo.lat}, ${core.geo.lng}`);
    out.push("");
    for (const faq of copy.faqs) {
      out.push(`**${faq.q}** ${faq.a}`);
      out.push("");
    }
  }

  /* ── guides ────────────────────────────────────────────────────────── */
  out.push("---");
  out.push("");
  out.push("## Guides");
  out.push("");
  for (const { core, copy } of allGuides("en")) {
    out.push(`### ${copy.title}`);
    out.push("");
    out.push(`URL: ${url(`/guides/${core.slug}`)}`);
    out.push(`Updated: ${core.updated}`);
    out.push("");
    out.push(copy.summary);
    out.push("");
    for (const answer of copy.quickAnswers) out.push(`- ${answer.term}: ${answer.value}`);
    out.push("");
  }

  /* ── reviews ───────────────────────────────────────────────────────── */
  const rating = ratingSummary(allReviews());
  if (rating) {
    out.push("---");
    out.push("");
    out.push("## Reviews");
    out.push("");
    out.push(
      `${rating.average.toFixed(1)} out of 5 from ${rating.count} Google reviews carrying a real star value. Tripadvisor reviews are published on the same page without a numeric rating, because star values were never captured for them. Every review is reproduced unedited at ${url("/reviews")}.`,
    );
    out.push("");
  }

  return `${out.join("\n")}\n`;
}
