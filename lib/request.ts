export type RequestKind =
  | "tour"
  | "transfer"
  | "contact"
  | "partner"
  | "custom-day"
  | "photography";

export type CustomDayStop = {
  name: string;
  stay: string;
};

export type CustomDayItinerary = {
  start: string;
  route: string;
  stops: CustomDayStop[];
  driving: string;
  stays: string;
  billed: string;
  price: string;
  addons: string[];
  shareUrl?: string;
  mapsUrl?: string;
};

export type RequestPayload = {
  kind: RequestKind;
  lang: string;
  name: string;
  email: string;
  phone?: string;
  hotel?: string;
  date?: string;
  guests?: number;
  slug?: string;
  pickup?: string;
  dropoff?: string;
  time?: string;
  flight?: string;
  company?: string;
  message?: string;
  wedding?: boolean;
  itinerary?: CustomDayItinerary;
  payCash?: boolean;
  cashCode?: string;
  /**
   * Photography requests only.
   *
   * The chosen package ("explorer") or workshop departure ("2026-10"), sent
   * as its own field rather than buried in `message`, so the desk can read
   * what was actually asked for without parsing prose. `photoPackage` is the
   * literal string "custom" when the guest wants something off the ladder.
   */
  photoPackage?: string;
  departure?: string;
};

export function mailtoFor(payload: RequestPayload, to: string) {
  const subject = encodeURIComponent(subjectFor(payload));
  const body = encodeURIComponent(bodyFor(payload));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export function subjectFor(payload: RequestPayload) {
  if (payload.kind === "tour" && payload.payCash && payload.cashCode) {
    return `Guest desk: CASH 10% ${payload.cashCode} · ${payload.slug || "day"} · ${payload.date || "date TBC"}`;
  }
  if (payload.kind === "tour") return `Guest desk: ${payload.slug || "day"} · ${payload.date || "date TBC"}`;
  if (payload.kind === "custom-day") {
    const bits = [
      "Guest desk: custom Crete day",
      payload.date || "date TBC",
      payload.guests ? `${payload.guests} guests` : null,
      payload.itinerary?.price,
    ].filter(Boolean);
    return bits.join(" · ");
  }
  if (payload.kind === "photography") {
    const bits = [
      "Guest desk: photography",
      payload.slug || "session",
      payload.photoPackage || payload.departure || null,
      payload.date || "date TBC",
    ].filter(Boolean);
    return bits.join(" · ");
  }
  if (payload.kind === "transfer") return `Guest desk: transfer · ${payload.date || "date TBC"}`;
  if (payload.kind === "partner") return `Trade desk: ${payload.company || payload.name}`;
  return `Guest desk: message from ${payload.name}`;
}

export function itineraryText(day: CustomDayItinerary): string {
  const lines = [
    `Route: ${day.route}`,
    `Start: ${day.start}`,
    `Driving: ${day.driving}`,
    `Time at stops: ${day.stays}`,
    `Billed: ${day.billed} (5-hour minimum)`,
    `Price: ${day.price} · private tour`,
    "",
    "Stops:",
    ...day.stops.map((stop, i) => `  ${i + 1}. ${stop.name} — stay ${stop.stay}`),
  ];
  if (day.addons.length) {
    lines.push("", `Add-ons (to confirm, no price on this request): ${day.addons.join(", ")}`);
  }
  lines.push("", "Photoshoot included.");
  if (day.shareUrl) lines.push(`Itinerary: ${day.shareUrl}`);
  if (day.mapsUrl) lines.push(`Maps: ${day.mapsUrl}`);
  return lines.join("\n");
}

export function bodyFor(payload: RequestPayload) {
  const rows: [string, string | number | boolean | undefined][] = [
    ["Kind", payload.kind],
    ["Language", payload.lang],
    ["Name", payload.name],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Company", payload.company],
    ["Hotel", payload.hotel],
    ["Date", payload.date],
    ["Time", payload.time],
    ["Guests", payload.guests],
    ["Experience", payload.slug],
    ["Package", payload.photoPackage],
    ["Departure", payload.departure],
    ["Pickup", payload.pickup],
    ["Drop-off", payload.dropoff],
    ["Flight", payload.flight],
    ["Wedding/event", payload.wedding ? "yes" : undefined],
    ["Pay cash 10%", payload.payCash ? "yes" : undefined],
    ["Cash code", payload.cashCode],
    ["Message", payload.message],
  ];
  const head = rows
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  if (!payload.itinerary) return head;
  return `${head}\n\n${itineraryText(payload.itinerary)}`;
}

export const SAMPLE_CUSTOM_DAY: RequestPayload = {
  kind: "custom-day",
  lang: "en",
  name: "Anna Bergström",
  email: "anna@example.com",
  phone: "+46 70 123 4567",
  hotel: "Casa Mooma, Rethymno",
  date: "2026-09-10",
  guests: 2,
  slug: "create-your-own-crete-experience",
  pickup: "Rethymno",
  message: "We would like a gentle pace, and one of us has slightly sore knees.",
  itinerary: {
    start: "Rethymno",
    route: "Rethymno → Kourtaliotiko Gorge → Preveli Monastery → Preveli Beach → Triopetra → Spili → Rethymno",
    stops: [
      { name: "Kourtaliotiko Gorge", stay: "30m" },
      { name: "Preveli Monastery", stay: "45m" },
      { name: "Preveli Beach", stay: "1h 30m" },
      { name: "Triopetra Beach", stay: "1h 30m" },
      { name: "Spili", stay: "45m" },
    ],
    driving: "3h 20m",
    stays: "4h 00m",
    billed: "7h 30m",
    price: "€375",
    addons: ["Licensed guide", "Village lunch"],
    shareUrl: "https://rethymnotours.com/en/create?d=2026-09-10&s=kourtaliotiko-gorge:30",
  },
};

/**
 * One realistic request per kind, for `npm run email`.
 *
 * The custom day above was for a long time the only sample anyone could
 * preview, which is how five of the six kinds shipped with a template nobody
 * had looked at. Point a `PreviewProps` at any of these to see that kind.
 */
export const SAMPLE_REQUESTS: Record<RequestKind, RequestPayload> = {
  "custom-day": SAMPLE_CUSTOM_DAY,
  tour: {
    kind: "tour",
    lang: "en",
    name: "Anna Fischer",
    email: "anna@example.com",
    phone: "+49 171 234 5678",
    slug: "imbros-gorge-guided-tour",
    date: "2026-10-04",
    guests: 2,
    hotel: "Hotel Fortezza, Rethymno",
    message: "We would like a morning pickup, and one of us walks slowly downhill.",
    payCash: true,
    cashCode: "CASH-7QK2",
  },
  transfer: {
    kind: "transfer",
    lang: "de",
    name: "Lukas Weber",
    email: "lukas@example.com",
    phone: "+49 171 234 5678",
    date: "2026-07-18",
    time: "14:30",
    guests: 3,
    pickup: "Chania Airport (CHQ)",
    dropoff: "Hotel Fortezza, Rethymno",
    flight: "A3 352",
    message: "Two large suitcases and a child seat, please.",
  },
  contact: {
    kind: "contact",
    lang: "en",
    name: "Priya Nair",
    email: "priya@example.com",
    message: "Do you run the gorge walks in early April, or is it still too wet?",
  },
  partner: {
    kind: "partner",
    lang: "en",
    name: "Sofia Marin",
    email: "sofia@blueaegean.example",
    company: "Blue Aegean Travel",
    message: "We place around forty guests a season in Rethymno and need a day-tour partner.",
  },
  photography: {
    kind: "photography",
    lang: "it",
    name: "Marco Rossi",
    email: "marco@example.com",
    slug: "crete-photography-workshop",
    departure: "2027-10",
    date: "2027-10-12",
    guests: 1,
    hotel: "Casa Mooma, Rethymno",
    message: "Is the October departure still open, and what lenses would you bring?",
  },
};
