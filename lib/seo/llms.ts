import "server-only";
import { LANGS, langPath, DEFAULT_LANG } from "@/lib/i18n/langs";
import {
  allGuides,
  allPhotography,
  allPlaces,
  allTours,
  allReviews,
  upcomingDepartures,
  ratingSummary,
  reviewsForTour,
  reviewsForTransfers,
  reviewsForWeddings,
} from "@/lib/content/load";
import { transfers, transferRoutes, shortPlace, routeDuration, estimateRoute } from "@/lib/transfers";
import { durationLabel } from "@/lib/content/format";
import { isPriced, priceFrom, priceTo } from "@/lib/pricing";
import {
  departureMonthLabel,
  departureStatusLabel,
  editedPhotosCount,
  gearLabel,
  photoPriceFrom,
} from "@/lib/photography";
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

/**
 * "€160–650 per session, 4 packages" / "€795–895 per person, 4 days".
 *
 * Photography prices never pass through `priceLine`: the tour price model
 * cannot express a package ladder, and forcing it through would have meant
 * either dropping the top of the range or inventing a per-person figure for
 * a session sold per party.
 */
function photoLine(core: Parameters<typeof photoPriceFrom>[0]): string {
  if (core.kind === "experience") {
    const prices = core.packages.map((pkg) => pkg.priceEur);
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    return `€${low}–${high} per session (whole party), ${core.packages.length} packages, ${core.packages
      .map((pkg) => `${editedPhotosCount(pkg)} edited photos`)
      .join(" / ")}.`;
  }
  const { standard, earlyBird, days, groupMin, groupMax } = core.workshop;
  const price = earlyBird ? `€${earlyBird}–${standard}` : `€${standard}`;
  return `${price} per person, ${days} days, group of ${groupMin}–${groupMax}, beginner level.`;
}

function ratingClause(
  reviews: Parameters<typeof ratingSummary>[0],
): string {
  const rating = ratingSummary(reviews);
  if (!rating) return "";
  return ` ${rating.average.toFixed(1)}/5 (${rating.count} Google reviews)`;
}

/** Headers Discover Cyclades-style: Canonical, Long-form/Short-form, Sitemap. */
export function llmFeedHeaders(kind: "index" | "full" | "offers"): HeadersInit {
  const origin = siteUrl();
  const date = new Date().toISOString().slice(0, 10);
  const canonical =
    kind === "index"
      ? `${origin}/llms.txt`
      : kind === "full"
        ? `${origin}/llms-full.txt`
        : `${origin}/offers.json`;
  return {
    "content-type":
      kind === "offers" ? "application/ld+json; charset=utf-8" : "text/plain; charset=utf-8",
    "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    "Last-Updated": date,
    Canonical: canonical,
    ...(kind === "full"
      ? { "Short-form": `${origin}/llms.txt` }
      : { "Long-form": `${origin}/llms-full.txt` }),
    Sitemap: `${origin}/sitemap.xml`,
  };
}

export function llmsTxt(): string {
  const tours = allTours(LANG);
  const places = allPlaces(LANG);
  const guides = allGuides(LANG);
  const routes = transferRoutes();
  const photography = allPhotography(LANG);
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
      `- [${copy.title}](${url(`/tours/${core.slug}`)}): ${durationLabel(core.durationMinutes, LANG)}, ${core.difficulty}, ${priceLine(core.price)}.${ratingClause(reviewsForTour(core.slug))} ${copy.summary.split(". ")[0]}.`,
    );
  }
  lines.push("");

  lines.push("## Photography");
  lines.push("");
  lines.push(
    `- [Photography in Crete](${url("/photography")}): two separate products — an outdoor photoshoot OF the guest, and a multi-day workshop where the guest LEARNS photography. They are not versions of each other.`,
  );
  for (const { core, copy } of photography) {
    lines.push(`- [${copy.title}](${url(`/photography/${core.slug}`)}): ${photoLine(core)} ${copy.promise}`);
  }
  lines.push("");

  lines.push("## Transfers");
  lines.push("");
  lines.push(`- [All transfers](${url("/transfers")}): ${transfers().coverage.statement}${ratingClause(reviewsForTransfers())}`);
  lines.push(
    `- [Wedding transfers](${url("/transfers/weddings")}): guest transport for destination weddings in the Rethymno region.${ratingClause(reviewsForWeddings())}`,
  );
  for (const route of routes) {
    const estimate = estimateRoute(route);
    lines.push(
      `- [${shortPlace(route.from)} to ${shortPlace(route.to)}](${url(`/transfers/${route.slug}`)}): ${route.distanceKm} km, about ${routeDuration(route.durationMinutes)}${
        estimate ? `, estimated €${estimate.low}–${estimate.high}` : ""
      }.${ratingClause(reviewsForTransfers(route.slug))}`,
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
  lines.push(`- [Machine-readable offers catalog](${siteUrl()}/offers.json)`);
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
    {
      const rating = ratingSummary(reviewsForTour(core.slug));
      if (rating) {
        out.push(`- Rating: ${rating.average.toFixed(1)}/5 (${rating.count} Google reviews)`);
      }
    }
    if (core.pickupTime) out.push(`- Pickup time: ${core.pickupTime}`);
    out.push(`- Hotel pickup: ${core.hotelPickup ? "yes, across the Rethymno area" : "no"}`);
    if (core.photoshoot === "included") {
      out.push("- Includes a professional photoshoot at no extra cost");
    } else if (core.photoshoot === "with_guide") {
      // Stated with its condition attached. An answer engine that reads
      // "includes a photoshoot" here will tell a traveller so, and the
      // booking will not deliver one unless they added the guide.
      out.push(
        "- Professional photoshoot: included only when the optional private guide is added, at no extra cost on top of the guide",
      );
    }
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

  /* ── photography ───────────────────────────────────────────────────── */
  out.push("---");
  out.push("");
  out.push("## Photography");
  out.push("");
  out.push(
    "Two separate products under one section, and confusing them is the mistake to avoid. The Photography Experience is a professional photographer photographing the GUEST outdoors in Crete. The Photography Escape is a multi-day workshop in which the GUEST learns to photograph Crete. Neither is a version of the other.",
  );
  out.push("");
  for (const { core, copy } of allPhotography("en")) {
    out.push(`### ${copy.title}`);
    out.push("");
    out.push(`URL: ${url(`/photography/${core.slug}`)}`);
    out.push(`What it is: ${copy.promise}`);
    out.push("");
    out.push(copy.summary);
    out.push("");
    out.push(`- Price: ${photoLine(core)}`);
    if (core.kind === "experience") {
      for (const pkg of core.packages) {
        const name = copy.packages.find((entry) => entry.id === pkg.id)?.name ?? pkg.id;
        const hours = pkg.minutesMax
          ? `${pkg.minutes / 60}–${pkg.minutesMax / 60} hours`
          : `${pkg.minutes / 60} hour${pkg.minutes === 60 ? "" : "s"}`;
        const locations =
          pkg.locations[0] === pkg.locations[1]
            ? `${pkg.locations[0]} location${pkg.locations[0] === 1 ? "" : "s"}`
            : `${pkg.locations[0]}–${pkg.locations[1]} locations`;
        out.push(
          `  - ${name}: €${pkg.priceEur}, ${hours}, up to ${pkg.maxGuests} people, ${locations}, ${editedPhotosCount(pkg)} professionally edited photos${pkg.transport ? ", private transport between locations" : ""}${pkg.goldenHour ? ", Golden Hour session when possible" : ""}.`,
        );
      }
    } else {
      out.push(
        `- Group size: ${core.workshop.groupMin}–${core.workshop.groupMax}. The workshop only runs once the minimum is reached, so joining is a request, not an instant confirmation.`,
      );
      out.push(
        `- Cameras supported: ${core.workshop.gear.map((gear) => gearLabel(gear, "en")).join(", ")}. No previous professional experience required.`,
      );
      for (const departure of upcomingDepartures(core.workshop)) {
        out.push(
          `- Departure ${departureMonthLabel(departure.month, "en")}: ${departureStatusLabel(departure.status, "en")}${departure.start && departure.end ? `, ${departure.start} to ${departure.end}` : ", exact dates confirmed on departure"}.`,
        );
      }
      for (const day of copy.days) {
        out.push(`- ${day.title}: ${day.topics.join(", ")}.`);
      }
    }
    out.push("");
    out.push("Highlights:");
    for (const highlight of copy.highlights) out.push(`- ${highlight}`);
    out.push("");
    out.push(`Included: ${copy.included.join("; ")}`);
    out.push("");
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
  {
    const rating = ratingSummary(reviewsForTransfers());
    if (rating) {
      out.push(
        `Rating: ${rating.average.toFixed(1)}/5 (${rating.count} Google reviews).`,
      );
      out.push("");
    }
  }
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
      `- ${route.from} to ${route.to} — ${route.distanceKm} km, about ${routeDuration(route.durationMinutes)}${estimate ? `, estimated €${estimate.low}–${estimate.high}` : ""}.${ratingClause(reviewsForTransfers(route.slug))} ${url(`/transfers/${route.slug}`)}`,
    );
  }
  out.push("");
  out.push("### Wedding transfers");
  out.push("");
  out.push(`URL: ${url("/transfers/weddings")}`);
  out.push("");
  {
    const rating = ratingSummary(reviewsForWeddings());
    if (rating) {
      out.push(`Rating: ${rating.average.toFixed(1)}/5 (${rating.count} Google reviews).`);
      out.push("");
    }
  }
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
