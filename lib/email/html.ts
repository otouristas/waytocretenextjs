import { PHONE_DISPLAY, WHATSAPP, BRAND } from "@/lib/site";
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
