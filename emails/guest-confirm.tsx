import { DetailCard, EmailShell } from "@/emails/chrome";
import { CustomDayCard } from "@/emails/custom-day-card";
import { SAMPLE_CUSTOM_DAY, type RequestPayload } from "@/lib/request";
import { EMAIL, WHATSAPP } from "@/lib/site";

export function GuestConfirmEmail({ payload }: { payload: RequestPayload }) {
  const first = payload.name.trim().split(/\s+/)[0] || payload.name;
  const custom = payload.kind === "custom-day";

  return (
    <EmailShell
      preview={
        custom
          ? "The Rethymno desk has the day you built. Someone who hosts it will reply within a few hours."
          : "The Rethymno desk has your note. Someone who hosts the day will reply within a few hours."
      }
      eyebrow={custom ? "Your Crete day" : "Request received"}
      title={custom ? `${first}, we have your day` : `Thank you, ${first}`}
      lead={
        custom
          ? "The desk has the route, the hours and the live price below. Someone who actually hosts the day will reply within a few hours — usually on WhatsApp or this thread — to confirm the date, then send how to pay. Nothing is charged on this email."
          : "The Rethymno desk has your note. Someone who actually hosts the day will reply within a few hours — usually on WhatsApp or this email thread."
      }
      ctaLabel="Message the desk on WhatsApp"
      ctaHref={WHATSAPP}
      secondaryLabel="Write to the desk"
      secondaryHref={`mailto:${EMAIL}`}
    >
      {payload.itinerary ? (
        <CustomDayCard day={payload.itinerary} heading="The day you built" />
      ) : null}
      <DetailCard
        rows={[
          { label: "What you asked", value: custom ? "Private custom day" : payload.kind },
          { label: "Preferred date", value: payload.date || "To be confirmed" },
          { label: "Guests", value: payload.guests },
          { label: "Experience", value: custom ? undefined : payload.slug },
          { label: "Hotel / villa", value: payload.hotel },
          { label: "Pickup", value: payload.itinerary ? undefined : payload.pickup },
          { label: "Drop-off", value: payload.dropoff },
          { label: "Your note", value: payload.message },
        ]}
      />
    </EmailShell>
  );
}

GuestConfirmEmail.PreviewProps = {
  payload: SAMPLE_CUSTOM_DAY,
} satisfies { payload: RequestPayload };

export default GuestConfirmEmail;
