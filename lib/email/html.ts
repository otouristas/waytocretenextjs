import { EMAIL, PHONE_DISPLAY, WHATSAPP, BRAND } from "@/lib/site";
import { bodyFor, type RequestPayload } from "@/lib/request";

export function guestConfirmText(payload: RequestPayload) {
  return [
    `Thank you, ${payload.name}.`,
    "The Rethymno Tours desk in Crete has your request. We will reply within a few hours.",
    payload.cashCode
      ? `Your cash code is ${payload.cashCode}. Quote it when we confirm the date. Pay in cash on the day of the tour for 10% off.`
      : "",
    "",
    bodyFor(payload),
    "",
    `WhatsApp: ${WHATSAPP}`,
    `Phone: ${PHONE_DISPLAY}`,
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");
}

export function guestConfirmSubject(payload: RequestPayload) {
  const date = payload.date ? ` · ${payload.date}` : "";
  return `We have your request${date} · ${BRAND} desk`;
}

/** Variables for Resend dashboard templates. Do not use the reserved name EMAIL. Use {{{VAR}}} in the dashboard for unescaped HTML. */
export function templateVars(payload: RequestPayload): Record<string, string | number> {
  return {
    GUEST_NAME: payload.name,
    GUEST_MAIL: payload.email,
    KIND: payload.kind,
    LANG: payload.lang,
    DATE: payload.date || "TBC",
    GUESTS_COUNT: payload.guests ?? "",
    EXPERIENCE: payload.slug || "",
    PHOTO_PACKAGE: payload.photoPackage || "",
    DEPARTURE: payload.departure || "",
    HOTEL: payload.hotel || "",
    NOTE: payload.message || "",
    PICKUP: payload.pickup || "",
    DROPOFF: payload.dropoff || "",
    FLIGHT: payload.flight || "",
    COMPANY: payload.company || "",
    PHONE_LINE: payload.phone || "",
    TIME: payload.time || "",
    WEDDING: payload.wedding ? "yes" : "",
    PAY_CASH: payload.payCash ? "yes" : "",
    CASH_CODE: payload.cashCode || "",
    ROUTE: payload.itinerary?.route || "",
    STOPS: payload.itinerary?.stops.map((s, i) => `${i + 1}. ${s.name} (${s.stay})`).join("\n") || "",
    DRIVING: payload.itinerary?.driving || "",
    STAYS: payload.itinerary?.stays || "",
    BILLED: payload.itinerary?.billed || "",
    PRICE_QUOTE: payload.itinerary?.price || "",
    ADDONS: payload.itinerary?.addons.join(", ") || "",
    SHARE_URL: payload.itinerary?.shareUrl || "",
    MAPS_URL: payload.itinerary?.mapsUrl || "",
    WHATSAPP_URL: WHATSAPP,
    DESK_MAIL: EMAIL,
    PHONE_DISPLAY,
  };
}
