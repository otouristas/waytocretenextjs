import { EMAIL, PHONE_DISPLAY, WHATSAPP, BRAND } from "@/lib/site";
import { bodyFor, type RequestPayload } from "@/lib/request";

export function guestConfirmText(payload: RequestPayload) {
  return [
    `Thank you, ${payload.name}.`,
    "The Rethymno Tours desk has your request. We will reply within a few hours.",
    "",
    bodyFor(payload),
    "",
    `WhatsApp: ${WHATSAPP}`,
    `Phone: ${PHONE_DISPLAY}`,
  ].join("\n");
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
    HOTEL: payload.hotel || "",
    NOTE: payload.message || "",
    PICKUP: payload.pickup || "",
    DROPOFF: payload.dropoff || "",
    FLIGHT: payload.flight || "",
    COMPANY: payload.company || "",
    PHONE_LINE: payload.phone || "",
    TIME: payload.time || "",
    WEDDING: payload.wedding ? "yes" : "",
    WHATSAPP_URL: WHATSAPP,
    DESK_MAIL: EMAIL,
    PHONE_DISPLAY,
  };
}
