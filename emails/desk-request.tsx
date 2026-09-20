import { DetailCard, EmailShell } from "@/emails/chrome";
import { CustomDayCard } from "@/emails/custom-day-card";
import { SummaryCard } from "@/emails/summary-card";
import { mailContent } from "@/lib/email/content";
import { SAMPLE_REQUESTS, type RequestPayload } from "@/lib/request";
import { WHATSAPP } from "@/lib/site";

/**
 * What lands in the desk inbox.
 *
 * Every kind gets the same card — the itinerary card for a built custom day,
 * the summary card for everything else — so a transfer or a trade enquiry
 * arrives looking like the day-planner mail rather than like a form dump.
 * What each one says is decided in `lib/email/content.ts`.
 */
export function DeskRequestEmail({ payload }: { payload: RequestPayload }) {
  const first = payload.name.trim().split(/\s+/)[0] || payload.name;
  const custom = payload.kind === "custom-day";
  const { eyebrow, title, hero, rows } = mailContent(payload, "desk");

  return (
    <EmailShell
      preview={
        custom
          ? `${first} built a private Crete day${payload.itinerary?.price ? ` · ${payload.itinerary.price}` : ""}. Reply from this thread.`
          : `${first} wrote from the booking desk. Reply from this thread.`
      }
      eyebrow={eyebrow}
      title={title}
      lead={
        custom
          ? "A guest built this private day on the site. The hours and the euro amount are the live quote from the planner — confirm the date, then send how to pay."
          : "A guest wrote from the booking desk. Reply from this thread so they keep one conversation."
      }
      ctaLabel="Reply to guest"
      ctaHref={`mailto:${payload.email}`}
      secondaryLabel="Open WhatsApp"
      secondaryHref={WHATSAPP}
    >
      {payload.itinerary ? (
        <CustomDayCard
          day={payload.itinerary}
          heading={hero.heading}
          note={hero.note}
          noteLabel="In their words"
        />
      ) : (
        <SummaryCard hero={hero} noteLabel="In their words" />
      )}
      <DetailCard rows={rows} />
    </EmailShell>
  );
}


/** Swap for any other key of `SAMPLE_REQUESTS` to preview that kind. */
DeskRequestEmail.PreviewProps = {
  payload: SAMPLE_REQUESTS.tour,
} satisfies { payload: RequestPayload };

export default DeskRequestEmail;
