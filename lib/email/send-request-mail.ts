import { Resend } from "resend";
import { EMAIL, PARTNERS_EMAIL } from "@/lib/site";
import { bodyFor, subjectFor, type RequestPayload } from "@/lib/request";
import {
  deskRequestHtml,
  deskRequestText,
  guestConfirmHtml,
  guestConfirmSubject,
  guestConfirmText,
  templateVars,
} from "@/lib/email/html";

export type MailResult =
  | { ok: true }
  | { ok: false; fallback: "mailto"; to: string; subject: string; body: string };

function deskTo(payload: RequestPayload) {
  return payload.kind === "partner" ? PARTNERS_EMAIL : EMAIL;
}

function fromAddress() {
  return process.env.RESEND_FROM || "Way to Crete desk <onboarding@resend.dev>";
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
  const to = deskTo(payload);
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, fallback: "mailto", to, subject: subjectFor(payload), body: bodyFor(payload) };
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
          html: deskRequestHtml(payload),
          text: deskRequestText(payload),
          tags: [
            { name: "kind", value: payload.kind },
            { name: "stream", value: "desk" },
          ],
        },
        `desk-request/${id}`,
      );

  if (!deskSent) {
    return { ok: false, fallback: "mailto", to, subject: subjectFor(payload), body: bodyFor(payload) };
  }

  const guestSend = guestTemplate
    ? sendOne(
        resend,
        {
          from,
          to: payload.email,
          replyTo: to,
          template: { id: guestTemplate, variables: vars },
          tags: [
            { name: "kind", value: payload.kind },
            { name: "stream", value: "guest" },
          ],
        },
        `guest-confirm/${id}`,
      )
    : sendOne(
        resend,
        {
          from,
          to: payload.email,
          replyTo: to,
          subject: guestConfirmSubject(payload),
          html: guestConfirmHtml(payload),
          text: guestConfirmText(payload),
          tags: [
            { name: "kind", value: payload.kind },
            { name: "stream", value: "guest" },
          ],
        },
        `guest-confirm/${id}`,
      );

  const guestResult = await guestSend;
  if (!guestResult) {
    console.error("Guest confirmation email failed; desk notification was sent.");
  }

  return { ok: true };
}
