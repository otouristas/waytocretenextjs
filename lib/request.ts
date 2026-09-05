export type RequestKind = "tour" | "transfer" | "contact" | "partner" | "custom-day";

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
};

export function mailtoFor(payload: RequestPayload, to: string) {
  const subject = encodeURIComponent(subjectFor(payload));
  const body = encodeURIComponent(bodyFor(payload));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export function subjectFor(payload: RequestPayload) {
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
    ["Pickup", payload.pickup],
    ["Drop-off", payload.dropoff],
    ["Flight", payload.flight],
    ["Wedding/event", payload.wedding ? "yes" : undefined],
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
