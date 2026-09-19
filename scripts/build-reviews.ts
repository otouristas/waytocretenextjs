/**
 * Builds content/reviews/reviews.json.
 *
 * Two sources are merged:
 *
 *  1. `content/reviews/google.raw.json` — a scrape of the Google Business
 *     Profile. It is the first source we have ever had that carries genuine
 *     numeric star values, which is why `schemaEligible` can finally be true
 *     for anything at all. Before this, `AggregateRating` was fabricated.
 *  2. `MANUAL` below — TripAdvisor and direct reviews transcribed by hand,
 *     which carry no star value and therefore never enter structured data.
 *
 * The `SUBJECT` table is the interesting part. Every Google review was read
 * and assigned to the tour or transfer route it actually describes — keyword
 * matching would have put "Ernesto was our driver for our day of hiking
 * Samaria Gorge" on the transfers page and "the transfers to Agreco Farms"
 * on a gorge page. Anything genuinely generic stays `general`. Those still
 * appear on the reviews hub and in each tour page's operator-wide pool;
 * they just do not pin a product that the guest never named.
 *
 * Run: npm run content:reviews
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const RAW = join(ROOT, "content/reviews/google.raw.json");
const OUT = join(ROOT, "content/reviews/reviews.json");

type RawGoogle = {
  name: string;
  stars: number;
  text?: string;
  reviewUrl?: string;
};

type Service = "tour" | "transfer" | "wedding" | "general";

type Subject = {
  service: Service;
  tour?: string;
  route?: string;
  /** ISO-639-1 code of the language the guest wrote in. */
  lang?: string;
  /** Display name when the scrape's `name` is a handle, not a person. */
  author?: string;
  /**
   * Override. Defaults to true for the Google scrape. The Plakias hotel
   * endorsement is a trade quote, not a guest review, so it stays out of
   * AggregateRating even though Google recorded five stars.
   */
  schemaEligible?: boolean;
};

/**
 * Google review → what it is about, keyed by author name as it appears in
 * the scrape. Read from the review text, one at a time.
 */
const SUBJECT: Record<string, Subject> = {
  // ── tours ──────────────────────────────────────────────────────────────
  // Honey trio plus a koroneiki olive-oil food pairing: that is Taste of
  // Crete, not the Honey & Wine day, which pairs honey with a winery.
  "Andi Muca": { service: "tour", tour: "taste-of-crete" },
  "Helga Geißer": { service: "tour", tour: "south-crete-highlights", lang: "de" },
  "Jess Duxbury": { service: "tour", tour: "samaria-gorge-explorer" },
  "Maria Helerea": { service: "tour", tour: "samaria-gorge-explorer", lang: "de" },
  "Maria Tzelai": {
    service: "tour",
    tour: "elafonisi-pink-sand-beach-tour-from-rethymno",
    lang: "de",
  },
  "Tina Markouli": { service: "tour", tour: "pachnes-summit" },
  "Ηρω Αλτζερινη": { service: "tour", tour: "samaria-gorge-explorer" },
  "Fereniki V": { service: "tour", tour: "taste-of-crete" },
  // Honey farm, then a vineyard and five wines — the Honey & Wine day.
  "Ekta Patel": { service: "tour", tour: "cretan-honey-wine-experience" },
  "Αναστασία Γεροντάκη": { service: "tour", tour: "imbros-gorge-guided-tour" },
  "Volker Salzinger": { service: "tour", tour: "romance-history-in-rethymno" },
  // Gious Kambos, Tulipa doerfleri, Ophrys heldreichii and a dakos picnic —
  // the one-day Cretan Wildflowers tour, not the seven-day April expedition.
  Marigooula: { service: "tour", tour: "botanical-tours-crete" },
  "alex ha": { service: "tour", tour: "botanical-tours-crete" },
  "miss Dior": { service: "tour", tour: "botanical-tours-crete" },
  "Des Top": { service: "tour", tour: "botanical-tours-crete" },
  // All three describe private guided hiking in the Lefka Ori / White
  // Mountains — Dariusz names the range, Artemis names Spathes inside it,
  // Nikolaos calls it a private mountain tour. Pachnes Summit is the only
  // Lefka Ori mountain product in the catalogue, so that is what they are
  // about; the gorge tours walk down through a gorge, not up a mountain.
  "Nikolaos Gizas": { service: "tour", tour: "pachnes-summit" },
  "Dariusz Szumacher": { service: "tour", tour: "pachnes-summit", lang: "pl" },
  "Artemis xeinou": { service: "tour", tour: "pachnes-summit" },
  // Imbros Gorge, named in Greek.
  "Γιώργος Τζουρμπάκης": { service: "tour", tour: "imbros-gorge-guided-tour" },
  // Preveli monastery and the palm forest — South Crete Highlights.
  "Konstantinos Galliakis": { service: "tour", tour: "south-crete-highlights" },
  // Preveli monastery plus the Hydria pottery workshop on that south-coast day.
  "Irida Mndk": { service: "tour", tour: "south-crete-highlights" },
  "Orley Garber": { service: "tour", tour: "south-crete-highlights" },
  // Olive-oil factory and honey factory: Taste of Crete, not Honey & Wine.
  "Gizem Gökalp": { service: "tour", tour: "taste-of-crete" },
  // Full-day or village-version Spili days. Cretan Nature & Village Journey
  // is the catalogue product that spends its first (and most distinctive)
  // stop in Spili; none of these name Kourtaliotiko or Kalypso, but Spili
  // is not sold as its own page.
  "Anthi Kaskoura": { service: "tour", tour: "cretan-nature-village-journey" },
  "Manthos Petrakis": { service: "tour", tour: "cretan-nature-village-journey" },
  "Manos Kavaklis": { service: "tour", tour: "cretan-nature-village-journey" },
  // Named gorges / caves that are not current catalogue products. They stay
  // on the tour service so they reach every tour page's operator-wide pool,
  // without pinning them to the wrong gorge.
  "eugenia manou": { service: "tour" },
  "Katerina Bitsakaki": { service: "tour" },
  "Алла Ескина": { service: "tour" },
  "ΜΑΤΘΑΙΟΣ ΒΑΡΒΑΝΤΑΚΗΣ": { service: "tour" },
  "Giannis Tranos": { service: "tour" },
  "Pavlos Marakis": { service: "tour" },
  "kostis marcelo": { service: "tour" },

  // ── transfers ──────────────────────────────────────────────────────────
  "Celine g": { service: "transfer", route: "chania-airport-to-rethymno", lang: "de" },
  "Mika tare": { service: "transfer", route: "heraklion-airport-to-rethymno" },
  "Ioanna Varela": { service: "transfer", route: "heraklion-airport-to-rethymno" },
  "Nick K": { service: "transfer", route: "heraklion-airport-to-rethymno" },
  "Rea Daskalou": { service: "transfer", route: "heraklion-airport-to-rethymno" },
  "Βαγγελινα Ριτζάκη": { service: "transfer", route: "heraklion-airport-to-rethymno" },
  "Steven Schwengler": {
    service: "transfer",
    route: "heraklion-airport-to-rethymno",
    lang: "de",
  },
  "Agapi Chatzaki": { service: "transfer", route: "chania-airport-to-rethymno" },
  "Μιχαλης Δαμβακερακης": { service: "transfer", route: "chania-airport-to-rethymno" },
  "Alketa Pako": { service: "transfer", route: "chania-airport-to-rethymno" },
  "D Edg": { service: "transfer" },
  "Marc JULIEN": { service: "transfer", lang: "fr" },
  "Thomas Thanos": { service: "transfer" },
  "Αnna Papoutsa": { service: "transfer" },
  "Melina Koutentaki": { service: "transfer" },
  "Giulia Dona": {
    service: "transfer",
    route: "heraklion-airport-to-rethymno",
    lang: "it",
  },
  "Sivan Shalom Mørch": { service: "transfer" },
  "Lavinia Schiopu": { service: "transfer" },
  "Tony Clegg": { service: "transfer" },
  "Γιώργος Τζαγκαρακης": { service: "transfer" },
  "Alena Bejčková": { service: "transfer", lang: "cs" },

  // ── weddings ───────────────────────────────────────────────────────────
  "Maria Koutoulaki": { service: "wedding" },

  // ── general ────────────────────────────────────────────────────────────
  "xarhs manousakas": { service: "general", lang: "el" },
  "Edward Sweet-Williams": { service: "general" },
  "Μπάμπης Βιδάκης": { service: "general", lang: "el" },
  "Μαριανικη Ιωαννιδου": { service: "general" },
  "İsmet Karatekin": { service: "general" },
  "Arpit Wanchoo": { service: "general" },
  Λορδος: { service: "general", lang: "el" },
  "Andreas Mathioudakis": { service: "general" },
  "Giorgos Leledakis": { service: "general" },
  "Zoe Kak": { service: "general" },
  "Gamers stars": { service: "general" },
  "stefanos maragkakis": { service: "general" },
  "Manolis Savvakis": { service: "general" },
  "Xρύσα Φιλιππίδου": { service: "general" },
  "Μιχαλης Καλοειδας": { service: "general" },
  "Νιτσα Φουστουκου": { service: "general" },
  "Μαρία Λουτριανάκη": { service: "general" },
  "Athina Theodoraki": { service: "general" },
  "Αλεχ Βρεν": { service: "general" },
  "G_ Rouk": { service: "general" },
  "Sandy Heretaki": { service: "general" },
  "increteblue suitesplakias": {
    service: "general",
    author: "Increteblue Suites Plakias",
    schemaEligible: false,
  },
  "George Papadakis": { service: "general" },
  Giannis: { service: "general" },
  "Diala Mello": { service: "general" },
  "Fergus Pryor": { service: "general" },
  "Emy Soyra": { service: "general" },
  "Gianna Marinaki": { service: "general" },
  "debbie Boop": { service: "general" },
  "Irini Samothrakiti": { service: "general" },
  "Ελένη Δαρδουμα": { service: "general" },
  "Konstantinos Lorthes": { service: "general" },
  "eugenia merkou": { service: "general" },
  "Giannis Papadakis": { service: "general" },
  "katerina sof": { service: "general" },
  "Maria Karavellaki": { service: "general" },
  "Sebastianos Adramis": { service: "general" },
  "IRENE TZ (Irene_tz)": { service: "general" },
  "m4 m4": { service: "general" },
  "Σεργκι Μερτσινα": { service: "general" },
  "Manolis Margaritis": { service: "general" },
  "Charly Sakko": { service: "general", lang: "de" },
  "stephen barley": { service: "general" },
  "Katerina Kabouraki": { service: "general" },
  Mixalis: { service: "general" },
  "stefanos pel0pas": { service: "general" },
  "Maria V.": { service: "general" },
  "Charlène LAVOREL": { service: "general" },
  "Еlena Fedorenko": { service: "general" },
  "petros sgoyromalis": { service: "general" },
  "Sp_ Vasil": { service: "general" },
  "Γιαννης Νακης": { service: "general" },
};

/**
 * TripAdvisor and direct reviews transcribed by hand.
 *
 * None carries a trustworthy numeric rating, so every entry here is
 * `rating: null` and `schemaEligible: false`: displayed, never counted
 * into an AggregateRating.
 */
const MANUAL = [
  {
    id: "ta-emma-d-south-crete",
    author: "Emma D",
    source: "TripAdvisor",
    service: "tour",
    tour: "south-crete-highlights",
    text: "We had a lovely time on our South Crete Hilights tour as part of our honeymoon in Greece! From the van ride itself, to our guide, to the experiences & locations themselves. Everywhere we saw was absolutely beautiful. We loved walking through the Preveli Palm Forest and swimming in the beautiful blue waters nearby. We enjoyed the history of the monastery, the amazing formations at Triopetra Beach, and seeing beautiful Spili village. Our traditional lunch was incredible and we were able to have Greek coffee at a long standing cafe. Thank you Way To Crete for enabling us to see & enjoy so many incredible sights during our time in Crete with an amazing, personable, well informed tour guide.",
  },
  {
    id: "ta-mari-j-taste-of-crete",
    author: "Mari J",
    source: "TripAdvisor",
    service: "tour",
    tour: "taste-of-crete",
    text: 'We did the "Taste of Crete" tour with Ernest on 02.09.2025. Absolutely recommend! Why?\n- Tour guide Ernest led the tour with great passion. You can feel how he loves nature and culture and passes it on to his guests\n- no mass tourism: you experience small manufactories, the real life in Crete\n- Value for money is unbeatable\nLooking forward to the next Crete holiday and will surely book a tour with Ernest of Waytocrete again',
  },
  {
    id: "ta-stephen-b",
    author: "Stephen B",
    source: "TripAdvisor",
    service: "general",
    text: "Very good experience ernesto was veary knowledgeable and helpful was happy to Taylor trip around me and good not have bean more helpful would defiantly use way to Crete again",
  },
  {
    id: "direct-elafonisi-traveller-tip",
    author: "Traveller tip",
    source: "Direct",
    service: "tour",
    tour: "elafonisi-pink-sand-beach-tour-from-rethymno",
    text: "Go early. By eleven the shallow lagoon at Elafonisi is busy and the pink sand on the far spit is the only quiet stretch left — the tour gets you there before the coaches.",
  },

  // Older Google reviews that used to live only in the WordPress carousel
  // (Zoe Kak, Gizem Gökalp, Orley Garber, Fergus Pryor, and the rest) are
  // now in the Business Profile scrape, with original-language text, a
  // real star value and a link back to the review. They come through the
  // RAW path above.
] as const;

/** Guest-written language. SUBJECT.lang wins when the script cannot tell. */
function detectLang(text: string): string {
  if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(text)) return "el";
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  return "en";
}

/** "Maria Koutoulaki" → "google-maria-koutoulaki", ASCII-folded. */
function idFor(name: string): string {
  const ascii = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // Greek, Turkish and Cyrillic names fold to nothing usable. A stable hash
  // of the original keeps the id deterministic across rebuilds.
  if (ascii.length >= 3) return `google-${ascii}`;
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return `google-${h.toString(36)}`;
}

function main() {
  const raw = JSON.parse(readFileSync(RAW, "utf8")) as RawGoogle[];

  const unmapped: string[] = [];
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];

  for (const r of raw) {
    // A star-only review with no prose is real, and it still counts toward
    // the rating; it just has nothing to display.
    const text = (r.text ?? "").trim();
    if (!text) continue;

    const subject = SUBJECT[r.name];
    if (!subject) unmapped.push(r.name);

    const id = idFor(r.name);
    if (seen.has(id)) continue;
    seen.add(id);

    out.push({
      id,
      author: subject?.author ?? r.name,
      source: "Google",
      sourceUrl: r.reviewUrl ?? null,
      rating: r.stars,
      date: null,
      lang: subject?.lang ?? detectLang(text),
      service: subject?.service ?? "general",
      tour: subject?.tour ?? null,
      route: subject?.route ?? null,
      text,
      // Google reviews are attributable, carry a real star value and link
      // back to the review on Google. These are the only ones that may
      // enter an AggregateRating — unless SUBJECT opts a trade endorsement
      // out.
      schemaEligible: subject?.schemaEligible ?? true,
    });
  }

  for (const m of MANUAL) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push({
      id: m.id,
      author: m.author,
      source: m.source,
      sourceUrl: null,
      rating: null,
      date: null,
      lang: "en",
      service: m.service,
      tour: "tour" in m ? m.tour : null,
      route: null,
      text: m.text,
      schemaEligible: false,
    });
  }

  writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);

  const counts = out.reduce<Record<string, number>>((acc, r) => {
    const key = String(r.service);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`wrote ${out.length} reviews → ${OUT}`);
  console.log("by service:", counts);
  const rated = out.filter((r) => typeof r.rating === "number");
  console.log(`schema-eligible with a star value: ${rated.length}`);
  if (unmapped.length) {
    console.warn(
      `\n${unmapped.length} review(s) have no SUBJECT entry and defaulted to "general":\n  ${unmapped.join("\n  ")}\n` +
        "Read them and add them to SUBJECT so they reach the right page.",
    );
  }
}

main();
