import { Resend } from "resend";
import { DeskRequestEmail } from "@/emails/desk-request";
import { GuestConfirmEmail } from "@/emails/guest-confirm";
import { EMAIL, PARTNERS_EMAIL } from "@/lib/site";
import { bodyFor, subjectFor, type RequestPayload } from "@/lib/request";
import { guestConfirmSubject, guestConfirmText, templateVars } from "@/lib/email/html";

export type MailResult =
  | { ok: true }
  | { ok: false; fallback: "mailto"; to: string; subject: string; body: string };

/** Every request is forwarded here. Override with RESEND_DESK_TO if needed. */
function deskInbox() {
  return process.env.RESEND_DESK_TO || EMAIL;
}

function deskRecipients(payload: RequestPayload) {
  const inbox = deskInbox();
  if (payload.kind === "partner" && PARTNERS_EMAIL !== inbox) {
    return [inbox, PARTNERS_EMAIL];
  }
  return [inbox];
}

function fromAddress() {
  return process.env.RESEND_FROM || "Rethymno Tours desk <onboarding@resend.dev>";
}

async function sendOne(
  resend: Resend,
  input: Parameters<Resend["emails"]["send"]>[0],
  idempotencyKey: string,
) {
  const { data, error } = await resend.emails.send(input, { idempotencyKey });
  if (error) {
    console.error("Resend send failed:", error.message);
    return null;
  }
  return data?.id ?? "sent";
}

export async function sendRequestMail(payload: RequestPayload): Promise<MailResult> {
  const to = deskRecipients(payload);
  const inbox = deskInbox();
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, fallback: "mailto", to: inbox, subject: subjectFor(payload), body: bodyFor(payload) };
  }

  const resend = new Resend(key);
  const id = crypto.randomUUID();
  const from = fromAddress();
  const vars = templateVars(payload);
  const deskTemplate = process.env.RESEND_TEMPLATE_DESK;
  const guestTemplate = process.env.RESEND_TEMPLATE_GUEST;

  const deskSent = deskTemplate
    ? await sendOne(
        resend,
        {
          from,
          to,
          replyTo: payload.email,
          template: { id: deskTemplate, variables: vars },
          tags: [
            { name: "kind", value: payload.kind },
            { name: "stream", value: "desk" },
          ],
        },
        `desk-request/${id}`,
      )
    : await sendOne(
        resend,
        {
          from,
          to,
          replyTo: payload.email,
          subject: subjectFor(payload),
          react: <DeskRequestEmail payload={payload} />,
          text: bodyFor(payload),
          tags: [
            { name: "kind", value: payload.kind },
            { name: "stream", value: "desk" },
          ],
        },
        `desk-request/${id}`,
      );

  if (!deskSent) {
    return { ok: false, fallback: "mailto", to: inbox, subject: subjectFor(payload), body: bodyFor(payload) };
  }

  const guestBcc = payload.email.toLowerCase() === inbox.toLowerCase() ? undefined : [inbox];

  const guestResult = guestTemplate
    ? await sendOne(
        resend,
        {
          from,
          to: payload.email,
          replyTo: inbox,
          bcc: guestBcc,
          template: { id: guestTemplate, variables: vars },
          tags: [
            { name: "kind", value: payload.kind },
            { name: "stream", value: "guest" },
          ],
        },
        `guest-confirm/${id}`,
      )
    : await sendOne(
        resend,
        {
          from,
          to: payload.email,
          replyTo: inbox,
          bcc: guestBcc,
          subject: guestConfirmSubject(payload),
          react: <GuestConfirmEmail payload={payload} />,
          text: guestConfirmText(payload),
          tags: [
            { name: "kind", value: payload.kind },
            { name: "stream", value: "guest" },
          ],
        },
        `guest-confirm/${id}`,
      );

  if (!guestResult) {
    console.error("Guest confirmation email failed; desk notification was sent.");
  }

  return { ok: true };
}
