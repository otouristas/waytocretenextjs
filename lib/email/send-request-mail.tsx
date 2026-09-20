import { Resend } from "resend";
import { DeskRequestEmail } from "@/emails/desk-request";
import { GuestConfirmEmail } from "@/emails/guest-confirm";
import { EMAIL, PARTNERS_EMAIL } from "@/lib/site";
import { bodyFor, subjectFor, type RequestPayload } from "@/lib/request";
import { guestConfirmSubject, guestConfirmText } from "@/lib/email/html";

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

/**
 * Sends the desk notification and the guest confirmation.
 *
 * Both are rendered from `emails/` and nowhere else. There used to be a
 * second path — `RESEND_TEMPLATE_DESK` / `RESEND_TEMPLATE_GUEST` swapped in a
 * template built in the Resend dashboard — and whichever of the two was set
 * sent an unstyled mail while the other kept the branded one. That is the
 * whole reason some requests arrived designed and some arrived plain. The
 * templates live in the repo, where they are reviewed and previewed, so the
 * escape hatch is gone rather than fixed twice.
 *
 * `text` stays alongside `react`: it is the multipart alternative, which
 * plain-text clients read and spam filters expect, not a fallback layout.
 */
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

  const deskSent = await sendOne(
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

  const guestResult = await sendOne(
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
