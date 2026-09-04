export type RequestKind = "tour" | "transfer" | "contact" | "partner";

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
};

export function mailtoFor(payload: RequestPayload, to: string) {
  const subject = encodeURIComponent(subjectFor(payload));
  const body = encodeURIComponent(bodyFor(payload));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export function subjectFor(payload: RequestPayload) {
  if (payload.kind === "tour") return `Guest desk: ${payload.slug || "day"} · ${payload.date || "date TBC"}`;
  if (payload.kind === "transfer") return `Guest desk: transfer · ${payload.date || "date TBC"}`;
  if (payload.kind === "partner") return `Trade desk: ${payload.company || payload.name}`;
  return `Guest desk: message from ${payload.name}`;
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
  return rows
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
