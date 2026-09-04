import { ADDRESS_DISPLAY, BRAND, EMAIL, PHONE_DISPLAY, WHATSAPP } from "@/lib/site";
import { bodyFor, subjectFor, type RequestPayload } from "@/lib/request";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string | number | boolean | undefined) {
  if (value === undefined || value === "" || value === false) return "";
  const text = value === true ? "yes" : String(value);
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #e4dccb;width:38%;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6c7c59;font-family:Georgia,serif;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #e4dccb;font-size:15px;color:#392420;font-family:Georgia,serif;">${escapeHtml(text)}</td>
  </tr>`;
}

function shell(opts: { eyebrow: string; title: string; lead: string; inner: string; ctaLabel: string; ctaHref: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#e8e1d3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8e1d3;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#f1ece1;border-radius:18px;overflow:hidden;box-shadow:0 18px 40px rgba(57,36,32,0.12);">
          <tr>
            <td style="background:#392420;padding:28px 36px 24px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#e6d39a;font-family:Georgia,serif;">${escapeHtml(opts.eyebrow)}</p>
              <p style="margin:10px 0 0;font-size:28px;line-height:1.15;color:#f7f3ea;font-family:Georgia,serif;">${escapeHtml(BRAND)}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#c9b8a8;font-family:Georgia,serif;">${escapeHtml(ADDRESS_DISPLAY)}</p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:#6c7c59;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 36px 8px;">
              <h1 style="margin:0;font-size:26px;line-height:1.2;color:#442f29;font-family:Georgia,serif;">${escapeHtml(opts.title)}</h1>
              <p style="margin:14px 0 0;font-size:16px;line-height:1.55;color:#5c554c;font-family:Georgia,serif;">${escapeHtml(opts.lead)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 36px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${opts.inner}</table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 8px;" align="left">
              <a href="${escapeHtml(opts.ctaHref)}" style="display:inline-block;background:#6c7c59;color:#f7f3ea;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:14px;font-family:Georgia,serif;">${escapeHtml(opts.ctaLabel)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 32px;font-size:13px;line-height:1.6;color:#8a8474;font-family:Georgia,serif;">
              Ernest and the desk · ${escapeHtml(PHONE_DISPLAY)} · ${escapeHtml(EMAIL)}<br />
              Stories stay on waytocrete.com. This mail is from the guest desk.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function deskRequestHtml(payload: RequestPayload) {
  const inner = [
    row("Kind", payload.kind),
    row("Language", payload.lang),
    row("Name", payload.name),
    row("Email", payload.email),
    row("Phone", payload.phone),
    row("Company", payload.company),
    row("Hotel / villa", payload.hotel),
    row("Date", payload.date),
    row("Time", payload.time),
    row("Guests", payload.guests),
    row("Experience", payload.slug),
    row("Pickup", payload.pickup),
    row("Drop-off", payload.dropoff),
    row("Flight", payload.flight),
    row("Wedding / event", payload.wedding),
    row("Note", payload.message),
  ].join("");

  return shell({
    eyebrow: payload.kind === "partner" ? "Trade desk" : "New guest request",
    title: subjectFor(payload),
    lead: "A guest wrote from the booking desk. Reply from this thread so they keep one conversation.",
    inner,
    ctaLabel: "Open WhatsApp",
    ctaHref: WHATSAPP,
  });
}

export function guestConfirmHtml(payload: RequestPayload) {
  const inner = [
    row("What you asked", payload.kind),
    row("Preferred date", payload.date || "To be confirmed"),
    row("Guests", payload.guests),
    row("Experience", payload.slug),
    row("Hotel / villa", payload.hotel),
    row("Pickup", payload.pickup),
    row("Drop-off", payload.dropoff),
    row("Your note", payload.message),
  ].join("");

  return shell({
    eyebrow: "Request received",
    title: `Thank you, ${payload.name.split(" ")[0] || payload.name}`,
    lead: "The Rethymno desk has your note. Someone who actually hosts the day will reply within a few hours — usually on WhatsApp or this email thread.",
    inner,
    ctaLabel: "Message the desk on WhatsApp",
    ctaHref: WHATSAPP,
  });
}

export function deskRequestText(payload: RequestPayload) {
  return bodyFor(payload);
}

export function guestConfirmText(payload: RequestPayload) {
  return [
    `Thank you, ${payload.name}.`,
    "The Way to Crete guest desk in Rethymno has your request. We will reply within a few hours.",
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
