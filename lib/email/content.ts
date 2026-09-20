// Relative, extension-bearing imports so Node's type stripping can run the
// test beside this file without a bundler or a path-alias resolver.
import { LANG_META, isLang } from "../i18n/langs.ts";
import type { RequestKind, RequestPayload } from "../request.ts";

/**
 * What the two request emails say, as data.
 *
 * The desk notification and the guest confirmation are one template in two
 * voices, so the facts they show are planned here — as plain rows — and
 * `emails/*.tsx` only paints them. Keeping the plan out of JSX is what lets
 * `content.test.ts` assert the thing that actually goes wrong: a field is
 * added to `RequestPayload`, a form starts sending it, and no template ever
 * renders it. `photoPackage` and `departure` reached production that way —
 * the desk could read them in the plain-text part and nowhere else.
 *
 * Nothing here may import the content layer: `lib/content/load.ts` is
 * `server-only`, and `npm run email` renders these templates outside Next.
 * That is why a tour is titled from its slug rather than looked up.
 */

export type Row = { label: string; value?: string | number | boolean };

export type Hero = {
  /** The dark band across the top of the card. */
  heading: string;
  /** The one line that says what this request is. */
  headline: string;
  /** Up to three facts, side by side. Already filtered. */
  stats: Row[];
  /** The guest's own words, if they wrote any. */
  note?: string;
};

export type MailContent = {
  /** Small caps line in the masthead. */
  eyebrow: string;
  /** The <h1>. Not the subject line — that is `subjectFor`. */
  title: string;
  hero: Hero;
  /** Everything the hero did not already say. Already filtered. */
  rows: Row[];
};

export type Audience = "desk" | "guest";

/** What was asked for, in words rather than the form's enum value. */
export const KIND_LABEL: Record<RequestKind, string> = {
  tour: "Guided day",
  "custom-day": "Custom Crete day",
  transfer: "Private transfer",
  contact: "Message to the desk",
  partner: "Trade enquiry",
  photography: "Photography",
};

const DESK_EYEBROW: Record<RequestKind, string> = {
  tour: "New day request",
  "custom-day": "New custom Crete day",
  transfer: "New transfer request",
  contact: "New desk message",
  partner: "Trade desk",
  photography: "New photography request",
};

const GUEST_EYEBROW: Record<RequestKind, string> = {
  tour: "Request received",
  "custom-day": "Your Crete day",
  transfer: "Transfer requested",
  contact: "We have your note",
  partner: "Partner enquiry received",
  photography: "Photography request received",
};

/** Desk voice, guest voice. The custom-day card has said this since day one. */
const HERO_HEADING: Record<RequestKind, [desk: string, guest: string]> = {
  tour: ["The day they asked for", "The day you asked for"],
  "custom-day": ["The day they built", "The day you built"],
  transfer: ["The transfer they asked for", "The transfer you asked for"],
  contact: ["What they asked", "What you asked"],
  partner: ["The agency", "Your agency"],
  photography: ["What they chose", "What you chose"],
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Lowercase inside a title, never at the front of one. */
const SMALL_WORDS = new Set([
  "a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with",
]);

/**
 * `imbros-gorge-guided-tour` → `Imbros Gorge Guided Tour`.
 *
 * Also does duty for package ids (`explorer`), which are slugs by another
 * name. A published tour title may punctuate differently — this is a label in
 * an email, not a heading on the page, and it never goes stale.
 */
export function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && SMALL_WORDS.has(word.toLowerCase())
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

/** A workshop departure id — `2027-10` → `October 2027`. */
export function departureLabel(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  return match && month ? `${month} ${match[1]}` : titleFromSlug(value);
}

/**
 * The language the guest filled the form in. Native first, because that is
 * the one the desk has to answer in; the English name follows for whoever
 * reads the inbox.
 */
export function langLabel(lang: string): string {
  if (!isLang(lang)) return lang;
  const { native, label } = LANG_META[lang];
  return native === label ? native : `${native} — ${label}`;
}

/**
 * `2026-10-04` → `Sun, 4 October 2026`.
 *
 * en-GB for both audiences, including a guest who filled the form in German:
 * these templates are written in English, and `So., 4. Oktober 2026` sitting
 * in a line of English prose reads as a defect rather than as a courtesy.
 * Spelling the month out also settles 04/10 for whoever is reading it.
 *
 * Anything that is not an ISO date — the field is free text on some forms —
 * is passed through untouched.
 */
export function dateLabel(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(`${raw}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function kept(rows: Row[]): Row[] {
  return rows.filter(
    (row) => row.value !== undefined && row.value !== "" && row.value !== false,
  );
}

function packageRow(payload: RequestPayload): Row {
  return {
    label: "Package",
    value: payload.photoPackage ? titleFromSlug(payload.photoPackage) : undefined,
  };
}

function departureRow(payload: RequestPayload): Row {
  return {
    label: "Departure",
    value: payload.departure ? departureLabel(payload.departure) : undefined,
  };
}

function headlineFor(payload: RequestPayload): string {
  switch (payload.kind) {
    case "custom-day":
      return payload.itinerary?.route || "A private Crete day";
    case "tour":
      return payload.slug ? titleFromSlug(payload.slug) : "A day in Crete";
    case "transfer": {
      const legs = [payload.pickup, payload.dropoff].filter(Boolean) as string[];
      return legs.length ? legs.join(" → ") : "A private transfer";
    }
    case "photography":
      return payload.slug ? titleFromSlug(payload.slug) : "Photography in Crete";
    case "partner":
      return payload.company || payload.name;
    case "contact":
      return "A question for the desk";
  }
}

/**
 * The heading the desk reads, which is not the subject line.
 *
 * `subjectFor()` is built for an inbox list — `Guest desk: photography ·
 * crete-photography-workshop · 2027-10 · 2027-10-12` scans well in a column
 * of subjects and badly as the first line inside the mail, where it was being
 * printed verbatim.
 */
function firstName(payload: RequestPayload): string {
  return payload.name.trim().split(/\s+/)[0] || payload.name;
}

/** The heading the guest reads. Their name, because the mail is to them. */
export function guestTitle(payload: RequestPayload): string {
  return payload.kind === "custom-day"
    ? `${firstName(payload)}, we have your day`
    : `Thank you, ${firstName(payload)}`;
}

export function deskTitle(payload: RequestPayload): string {
  switch (payload.kind) {
    case "custom-day":
      return [
        "Custom Crete day",
        dateLabel(payload.date) || "date TBC",
        payload.guests ? `${payload.guests} guests` : null,
        payload.itinerary?.price,
      ]
        .filter(Boolean)
        .join(" · ");
    case "tour":
      return `A guided day for ${payload.name}`;
    case "transfer":
      return `A private transfer for ${payload.name}`;
    case "photography":
      return `Photography for ${payload.name}`;
    case "partner":
      return `A trade enquiry from ${payload.company || payload.name}`;
    case "contact":
      return `A message from ${payload.name}`;
  }
}

function statsFor(payload: RequestPayload): Row[] {
  const date: Row = { label: "Date", value: dateLabel(payload.date) };
  const guests: Row = { label: "Guests", value: payload.guests };

  switch (payload.kind) {
    // The custom-day card prints driving, time at stops and the billed hours
    // in this slot, and the euro amount in a band of its own. Date and guests
    // stay in the table below rather than being shown twice.
    case "custom-day":
      return [];
    case "tour":
      return kept([date, guests, { label: "Hotel / villa", value: payload.hotel }]);
    case "transfer":
      return kept([date, { label: "Time", value: payload.time }, guests]);
    case "photography":
      return kept([
        payload.departure ? departureRow(payload) : packageRow(payload),
        date,
        guests,
      ]);
    case "partner":
      return kept([
        { label: "Contact", value: payload.name },
        { label: "Language", value: langLabel(payload.lang) },
      ]);
    case "contact":
      return kept([{ label: "Language", value: langLabel(payload.lang) }, date]);
  }
}

function heroFor(payload: RequestPayload, audience: Audience): Hero {
  return {
    heading: HERO_HEADING[payload.kind][audience === "desk" ? 0 : 1],
    headline: headlineFor(payload),
    stats: statsFor(payload),
    note: payload.message?.trim() || undefined,
  };
}

/**
 * Identity and logistics for the inbox. Whatever the hero already showed is
 * dropped below, so a fact is printed once — matched on the label, which is
 * why the hero and the table must name the same fact the same way.
 */
function deskRows(payload: RequestPayload): Row[] {
  const custom = payload.kind === "custom-day";
  return [
    { label: "Name", value: payload.name },
    { label: "Email", value: payload.email },
    { label: "Phone", value: payload.phone },
    { label: "Company", value: payload.company },
    { label: "Language", value: langLabel(payload.lang) },
    { label: "Request", value: KIND_LABEL[payload.kind] },
    { label: "Experience", value: !custom && payload.slug ? titleFromSlug(payload.slug) : undefined },
    packageRow(payload),
    departureRow(payload),
    { label: "Date", value: dateLabel(payload.date) },
    { label: "Time", value: payload.time },
    { label: "Guests", value: payload.guests },
    // The custom-day card prints its own pickup, and the planner never fills
    // `hotel` — for every other kind these are two different facts.
    { label: "Hotel / villa", value: payload.hotel },
    { label: "Pickup", value: custom ? undefined : payload.pickup },
    { label: "Drop-off", value: payload.dropoff },
    { label: "Flight", value: payload.flight },
    { label: "Wedding / event", value: payload.wedding ? "Yes" : undefined },
    { label: "Pay cash 10%", value: payload.payCash ? "Yes" : undefined },
    { label: "Cash code", value: payload.cashCode },
  ];
}

/**
 * What the guest gets back. Their own contact details are echoed last, on
 * purpose: a mistyped address is the one failure this email cannot report,
 * and seeing it written out is the only chance to catch it.
 *
 * The cash code is left out — the guest confirmation gives it a panel of its
 * own rather than a table row.
 */
function guestRows(payload: RequestPayload): Row[] {
  const custom = payload.kind === "custom-day";
  return [
    { label: "Request", value: KIND_LABEL[payload.kind] },
    { label: "Experience", value: !custom && payload.slug ? titleFromSlug(payload.slug) : undefined },
    packageRow(payload),
    departureRow(payload),
    { label: "Date", value: dateLabel(payload.date) || "To be confirmed" },
    { label: "Time", value: payload.time },
    { label: "Guests", value: payload.guests },
    { label: "Hotel / villa", value: payload.hotel },
    { label: "Pickup", value: custom ? undefined : payload.pickup },
    { label: "Drop-off", value: payload.dropoff },
    { label: "Flight", value: payload.flight },
    { label: "Wedding / event", value: payload.wedding ? "Yes" : undefined },
    { label: "We will reply to", value: payload.email },
  ];
}

export function mailContent(payload: RequestPayload, audience: Audience): MailContent {
  const hero = heroFor(payload, audience);
  // The card speaks first; the table carries what is left. Matching on the
  // printed value as well as the label is what stops `Contact: Sofia Marin`
  // in the card and `Name: Sofia Marin` in the table two inches below.
  const shownLabels = new Set(hero.stats.map((stat) => stat.label));
  const shownValues = new Set([hero.headline, ...hero.stats.map((stat) => String(stat.value))]);
  const rows = kept(audience === "desk" ? deskRows(payload) : guestRows(payload)).filter(
    (row) => !shownLabels.has(row.label) && !shownValues.has(String(row.value)),
  );
  return {
    eyebrow: (audience === "desk" ? DESK_EYEBROW : GUEST_EYEBROW)[payload.kind],
    title: audience === "desk" ? deskTitle(payload) : guestTitle(payload),
    hero,
    rows,
  };
}
