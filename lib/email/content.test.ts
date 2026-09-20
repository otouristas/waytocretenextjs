import test from "node:test";
import assert from "node:assert/strict";
// Relative, extension-bearing imports so Node's type stripping can run this
// file directly without a bundler or a path-alias resolver.
import type { RequestPayload } from "../request.ts";
import {
  dateLabel,
  departureLabel,
  langLabel,
  mailContent,
  titleFromSlug,
  type MailContent,
} from "./content.ts";

/**
 * Run with:  npm run test
 *
 * The guard that matters is `every field reaches the desk`. A field lands on
 * `RequestPayload`, a form starts sending it, and both HTML templates quietly
 * omit it — that is exactly how `photoPackage` and `departure` shipped
 * readable only in the plain-text part of the mail.
 */

/** Every optional field filled, so nothing can hide behind `undefined`. */
const LOADED: RequestPayload = {
  kind: "photography",
  lang: "it",
  name: "Marco Rossi",
  email: "marco@example.com",
  phone: "+39 340 111 2222",
  company: "Rossi Studio",
  hotel: "Casa Mooma, Rethymno",
  date: "2027-10-12",
  time: "07:30",
  guests: 2,
  slug: "crete-photography-workshop",
  pickup: "Rethymno old town",
  dropoff: "Chania Airport (CHQ)",
  flight: "A3 352",
  message: "We would like the golden hour on the first morning.",
  wedding: true,
  payCash: true,
  cashCode: "CASH-7QK2",
  photoPackage: "explorer",
  departure: "2027-10",
};

/** Hero and table together — where a fact is shown does not matter here. */
function shown(content: MailContent): string {
  return [
    content.eyebrow,
    content.hero.heading,
    content.hero.headline,
    content.hero.note ?? "",
    ...content.hero.stats.map((stat) => `${stat.label}: ${stat.value}`),
    ...content.rows.map((row) => `${row.label}: ${row.value}`),
  ].join("\n");
}

test("the desk mail shows every field the guest filled in", () => {
  const text = shown(mailContent(LOADED, "desk"));
  const expected = [
    "Marco Rossi",
    "marco@example.com",
    "+39 340 111 2222",
    "Rossi Studio",
    "Italiano",
    "Casa Mooma, Rethymno",
    "October 2027", // departure
    "12 October 2027", // date
    "07:30",
    "Crete Photography Workshop", // slug
    "Rethymno old town",
    "Chania Airport (CHQ)",
    "A3 352",
    "golden hour",
    "CASH-7QK2",
  ];
  for (const fragment of expected) {
    assert.ok(text.includes(fragment), `desk mail is missing ${fragment}\n${text}`);
  }
  assert.match(text, /Guests: 2/);
  assert.match(text, /Wedding \/ event: Yes/);
  assert.match(text, /Pay cash 10%: Yes/);
});

test("the photography package reaches the desk, workshop or not", () => {
  const { hero, rows } = mailContent({ ...LOADED, departure: undefined }, "desk");
  const text = [...hero.stats, ...rows].map((row) => `${row.label}: ${row.value}`).join("\n");
  assert.match(text, /Package: Explorer/);
});

test("a fact is printed once — the table drops whatever the hero said", () => {
  for (const audience of ["desk", "guest"] as const) {
    const { hero, rows } = mailContent(LOADED, audience);
    const heroLabels = hero.stats.map((stat) => stat.label);
    for (const row of rows) {
      assert.ok(
        !heroLabels.includes(row.label),
        `${audience}: ${row.label} is in both the hero and the table`,
      );
    }
  }
});

test("the guest confirmation echoes their address and withholds the desk's notes", () => {
  const { rows } = mailContent(LOADED, "guest");
  const labels = rows.map((row) => row.label);
  assert.ok(labels.includes("We will reply to"));
  // The cash code gets its own panel in the guest mail, not a table row.
  assert.ok(!labels.includes("Cash code"));
  assert.ok(!labels.includes("Phone"));
});

test("a bare contact request still has a hero to show", () => {
  const { hero, rows } = mailContent(
    { kind: "contact", lang: "en", name: "Priya Nair", email: "priya@example.com", message: "Do you run tours in early April?" },
    "guest",
  );
  assert.equal(hero.headline, "A question for the desk");
  assert.equal(hero.note, "Do you run tours in early April?");
  assert.ok(hero.stats.length > 0);
  assert.ok(rows.length > 0);
});

test("a transfer is titled by its route", () => {
  const { hero } = mailContent(
    {
      kind: "transfer",
      lang: "de",
      name: "Lukas Weber",
      email: "lukas@example.com",
      pickup: "Chania Airport (CHQ)",
      dropoff: "Hotel Fortezza, Rethymno",
    },
    "desk",
  );
  assert.equal(hero.headline, "Chania Airport (CHQ) → Hotel Fortezza, Rethymno");
});

test("every kind produces a headline and an eyebrow", () => {
  const kinds = ["tour", "custom-day", "transfer", "contact", "partner", "photography"] as const;
  for (const kind of kinds) {
    for (const audience of ["desk", "guest"] as const) {
      const content = mailContent({ ...LOADED, kind }, audience);
      assert.ok(content.eyebrow.length > 0, `${kind}/${audience} eyebrow`);
      assert.ok(content.hero.headline.length > 0, `${kind}/${audience} headline`);
      assert.ok(content.hero.heading.length > 0, `${kind}/${audience} heading`);
    }
  }
});

test("titleFromSlug lowercases the joining words but never the first", () => {
  assert.equal(titleFromSlug("imbros-gorge-guided-tour"), "Imbros Gorge Guided Tour");
  assert.equal(titleFromSlug("the-road-to-preveli"), "The Road to Preveli");
  assert.equal(titleFromSlug("explorer"), "Explorer");
});

test("departureLabel names the month", () => {
  assert.equal(departureLabel("2027-10"), "October 2027");
  assert.equal(departureLabel("2026-01"), "January 2026");
  assert.equal(departureLabel("spring-intake"), "Spring Intake");
});

test("langLabel answers in the language the form was filled in", () => {
  assert.equal(langLabel("de"), "Deutsch — German");
  assert.equal(langLabel("en"), "English");
  assert.equal(langLabel("pt"), "pt");
});

test("dateLabel spells the month out and passes free text through", () => {
  assert.equal(dateLabel("2026-10-04"), "Sun, 4 October 2026");
  // Same for a guest who wrote in German: the template around it is English.
  assert.equal(mailContent({ ...LOADED, kind: "transfer", lang: "de" }, "guest").hero.stats[0].value, "Tue, 12 October 2027");
  assert.equal(dateLabel("sometime in May"), "sometime in May");
  assert.equal(dateLabel(undefined), "");
});

test("the desk heading is readable prose, not the subject line", () => {
  const titles = {
    tour: "A guided day for Marco Rossi",
    transfer: "A private transfer for Marco Rossi",
    photography: "Photography for Marco Rossi",
    partner: "A trade enquiry from Rossi Studio",
    contact: "A message from Marco Rossi",
  } as const;
  for (const [kind, expected] of Object.entries(titles)) {
    const content = mailContent({ ...LOADED, kind: kind as keyof typeof titles }, "desk");
    assert.equal(content.title, expected);
  }
  assert.equal(
    mailContent({ ...LOADED, kind: "custom-day" }, "desk").title,
    "Custom Crete day · Tue, 12 October 2027 · 2 guests",
  );
});

test("the guest heading greets them by their first name", () => {
  assert.equal(mailContent(LOADED, "guest").title, "Thank you, Marco");
  assert.equal(
    mailContent({ ...LOADED, kind: "custom-day" }, "guest").title,
    "Marco, we have your day",
  );
});

test("the table never repeats a fact the card already printed", () => {
  const partner = mailContent(
    {
      kind: "partner",
      lang: "en",
      name: "Sofia Marin",
      email: "sofia@example.com",
      company: "Blue Aegean Travel",
    },
    "desk",
  );
  // "Contact: Sofia Marin" is in the card, so "Name: Sofia Marin" is not
  // repeated in the table under it.
  const printed = partner.rows.map((row) => String(row.value));
  assert.ok(!printed.includes("Sofia Marin"));
  assert.ok(printed.includes("sofia@example.com"));
});

test("the table never repeats the card's own headline", () => {
  const tour = mailContent(
    { kind: "tour", lang: "en", name: "Anna", email: "a@example.com", slug: "imbros-gorge-guided-tour" },
    "desk",
  );
  assert.equal(tour.hero.headline, "Imbros Gorge Guided Tour");
  assert.ok(!tour.rows.some((row) => row.value === "Imbros Gorge Guided Tour"));

  const partner = mailContent(
    { kind: "partner", lang: "en", name: "Sofia", email: "s@example.com", company: "Blue Aegean Travel" },
    "desk",
  );
  assert.equal(partner.hero.headline, "Blue Aegean Travel");
  assert.ok(!partner.rows.some((row) => row.value === "Blue Aegean Travel"));
});
