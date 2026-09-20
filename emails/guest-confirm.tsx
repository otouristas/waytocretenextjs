import { CodePanel, DetailCard, EmailShell } from "@/emails/chrome";
import { CustomDayCard } from "@/emails/custom-day-card";
import { SummaryCard } from "@/emails/summary-card";
import { mailContent } from "@/lib/email/content";
import { SAMPLE_REQUESTS, type RequestPayload } from "@/lib/request";
import { EMAIL, WHATSAPP } from "@/lib/site";

/**
 * The receipt the guest gets back, in the same chrome as the desk mail and
 * with the same card — a tour, a transfer or a plain question is confirmed as
 * fully as a custom day. What each one says is decided in
 * `lib/email/content.ts`.
 */
export function GuestConfirmEmail({ payload }: { payload: RequestPayload }) {
  const custom = payload.kind === "custom-day";
  const { eyebrow, title, hero, rows } = mailContent(payload, "guest");

  return (
    <EmailShell
      preview={
        custom
          ? "The desk in Crete has the day you built. Someone who hosts it will reply within a few hours."
          : payload.cashCode
            ? `Your cash code is ${payload.cashCode}. The desk in Crete will confirm the date.`
            : "The desk in Crete has your note. Someone who hosts the day will reply within a few hours."
      }
      eyebrow={eyebrow}
      title={title}
      lead={
        custom
          ? "The desk has the route, the hours and the live price below. Someone who actually hosts the day will reply within a few hours — usually on WhatsApp or this thread — to confirm the date, then send how to pay. Nothing is charged on this email."
          : payload.cashCode
            ? "The desk in Crete has your request. Pay in cash on the day of the tour for 10% off — quote the code below when we confirm the date. Nothing is charged on this email."
            : "The desk in Crete has your note. Someone who actually hosts the day will reply within a few hours — usually on WhatsApp or this email thread."
      }
      ctaLabel="Message the desk on WhatsApp"
      ctaHref={WHATSAPP}
      secondaryLabel="Write to the desk"
      secondaryHref={`mailto:${EMAIL}`}
    >
      {payload.itinerary ? (
        <CustomDayCard
          day={payload.itinerary}
          heading={hero.heading}
          note={hero.note}
          noteLabel="In your words"
        />
      ) : (
        <SummaryCard hero={hero} noteLabel="In your words" />
      )}
      {payload.cashCode ? (
        <CodePanel
          label="Your cash code"
          code={payload.cashCode}
          note="10% off when you pay in cash on the day of the tour. Quote it to us when we confirm the date."
        />
      ) : null}
      <DetailCard rows={rows} />
    </EmailShell>
  );
}

/** Swap for any other key of `SAMPLE_REQUESTS` to preview that kind. */
GuestConfirmEmail.PreviewProps = {
  payload: SAMPLE_REQUESTS.tour,
} satisfies { payload: RequestPayload };

export default GuestConfirmEmail;
