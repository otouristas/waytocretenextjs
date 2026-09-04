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
 * on a gorge page. Anything genuinely generic stays `general`, and a generic
 * review is shown on the reviews hub only.
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
  // Named the range but not the peak or the route, so it stays a hiking
  // review rather than being assigned to a product it may not describe.
  "Nikolaos Gizas": { service: "tour" },
  "Dariusz Szumacher": { service: "tour", lang: "pl" },
  "Artemis xeinou": { service: "tour" },

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
  "Giulia Dona": { service: "transfer", lang: "it" },
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
  "Μαριανικη Ιωαννιδου": { service: "general", lang: "el" },
  "İsmet Karatekin": { service: "general", lang: "tr" },
  "Arpit Wanchoo": { service: "general" },
  Λορδος: { service: "general", lang: "el" },
  "Andreas Mathioudakis": { service: "general" },
};

/**
 * Reviews that exist only in the WordPress testimonial carousel, plus the
 * TripAdvisor and direct ones.
 *
 * None carries a trustworthy numeric rating. The carousel does render five
 * stars and the label "Google Maps" on every card, but it renders them on
 * cards that are demonstrably TripAdvisor reviews too — they are template
 * defaults, not captured values. So every entry here is `rating: null` and
 * `schemaEligible: false`: displayed, never counted into an
 * `AggregateRating`. Only the Google Business Profile scrape, which carries
 * per-review stars and a link back to the review, feeds structured data.
 *
 * The pairing of name to text was re-derived from the carousel's own DOM
 * (`<strong class="elementskit-author-name">` then
 * `<div class="elementskit-commentor-content">`), because an earlier
 * transcription of this block had the names shifted one card against the
 * quotes — it credited Fergus Pryor with Katerina Sof's words, and so on.
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

  // Google reviews that predate the scrape and survive only in the
  // WordPress carousel. Kept because they are genuine and attributable;
  // unrated because the carousel's stars are decoration.
  {
    id: "google-zoe-kak",
    author: "Zoe Kak",
    source: "Google",
    service: "general",
    text: "I highly recommend the WaytoCrete agency for those who want to explore Crete. With impeccable organization and friendly service, they offer unique excursions to impressive places.",
  },
  {
    id: "google-g-rouk",
    author: "G_ Rouk",
    source: "Google",
    service: "general",
    text: "Excellent excursion options. Very organized office!! Crete from a different perspective!",
  },
  {
    // A hotel in Plakias, not a traveller — this is a trade endorsement and
    // it reads like one.
    id: "google-increteblue-suites-plakias",
    author: "Increteblue Suites Plakias",
    source: "Google",
    service: "general",
    text: "We have an excellent collaboration with the agency which is characterized by consistency, reliability and professionalism. Our clients are completely satisfied with the excursions and experience unique experiences.",
  },
  {
    id: "google-fergus-pryor",
    author: "Fergus Pryor",
    source: "Google",
    service: "general",
    text: "I was in Spili for two weeks and went on several excursions with Ernesto and his team. I was extremely impressed with their levels of service, professionalism and care. Ernesto is a great guy and tailored excursions to fit with the intricacies of our group (we had a combination of elderly people, babies and toddlers as well as my wife and I). They truly went above and beyond to ensure that we had the best experience. I would not hesitate to recommend Ernesto and his team to anyone looking to see Crete and all the beautiful places it has to offer. If you're thinking of booking with these guys, you won't regret it!",
  },
  {
    id: "google-katerina-sof",
    author: "Katerina Sof",
    source: "Google",
    service: "general",
    text: "Fantastic service!!! Well done!!! Very nice excursions I highly recommend it if you are in Crete!!",
  },
  {
    // The olive-oil farm and the beekeeper are the two stops that define
    // Taste of Crete.
    id: "google-gizem-gokalp",
    author: "Gizem Gökalp",
    source: "Google",
    service: "tour",
    tour: "taste-of-crete",
    text: "We had the pleasure of having Ernest as our tour guide, and he truly made our experience unforgettable. Ernest was incredibly generous and friendly, making us feel welcomed and comfortable from the start. His knowledge and passion shone through during our visits to both the olive oil factory and the honey factory. Ernest provided insightful information and answered all our questions with enthusiasm. Highly recommend Ernest for an exceptional tour experience!",
  },
  {
    id: "google-charly-sakko",
    author: "Charly Sakko",
    source: "Google",
    service: "general",
    text: "Very beautiful and unique excursions. Ernesto is a very good and friendly guide. His bird knowledge is excellent. Highly recommended for young and old. The prices are very good for what is offered.",
  },
  {
    id: "google-stephen-barley",
    author: "Stephen Barley",
    source: "Google",
    service: "general",
    text: "Very friendly helpful and knowledgeable, full of helpful info and nothing too much for him to help with. Good time doing this tour.",
  },
  {
    // Pottery workshop, monastery, Preveli beach and a Cretan lunch — the
    // South Crete Highlights route, stop for stop.
    id: "google-orley-garber",
    author: "Orley Garber",
    source: "Google",
    service: "tour",
    tour: "south-crete-highlights",
    text: "This organization is a rare find. Ernest the leader and tour guide gave us an unforgettable day in Crete - easily our favorite tour. Not only did we experience a pottery workshop, a monastery visit, a visit to the breathtaking Preveli beach, and a scrumptious Greek meal... we also had a caring guide who watched our belongings, gave us copious amounts of water, and shared information about Crete throughout the drive. I will recommend Way To Crete to any friends going to Crete.",
  },
] as const;

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
      author: r.name,
      source: "Google",
      sourceUrl: r.reviewUrl ?? null,
      rating: r.stars,
      date: null,
      lang: subject?.lang ?? "en",
      service: subject?.service ?? "general",
      tour: subject?.tour ?? null,
      route: subject?.route ?? null,
      text,
      // Google reviews are attributable, carry a real star value and link
      // back to the review on Google. These are the only ones that may
      // enter an AggregateRating.
      schemaEligible: true,
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
