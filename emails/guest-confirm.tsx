import { DetailCard, EmailShell } from "@/emails/chrome";
import type { RequestPayload } from "@/lib/request";
import { EMAIL, WHATSAPP } from "@/lib/site";

export function GuestConfirmEmail({ payload }: { payload: RequestPayload }) {
  const first = payload.name.trim().split(/\s+/)[0] || payload.name;

  return (
    <EmailShell
      preview="The Rethymno desk has your note. Someone who hosts the day will reply within a few hours."
      eyebrow="Request received"
      title={`Thank you, ${first}`}
      lead="The Rethymno desk has your note. Someone who actually hosts the day will reply within a few hours — usually on WhatsApp or this email thread."
      ctaLabel="Message the desk on WhatsApp"
      ctaHref={WHATSAPP}
      secondaryLabel="Write to the desk"
      secondaryHref={`mailto:${EMAIL}`}
    >
      <DetailCard
        rows={[
          { label: "What you asked", value: payload.kind },
          { label: "Preferred date", value: payload.date || "To be confirmed" },
          { label: "Guests", value: payload.guests },
          { label: "Experience", value: payload.slug },
          { label: "Hotel / villa", value: payload.hotel },
          { label: "Pickup", value: payload.pickup },
          { label: "Drop-off", value: payload.dropoff },
          { label: "Your note", value: payload.message },
        ]}
      />
    </EmailShell>
  );
}

GuestConfirmEmail.PreviewProps = {
  payload: {
    kind: "tour",
    lang: "en",
    name: "Anna Bergström",
    email: "anna@example.com",
    hotel: "Casa Mooma, Rethymno",
    date: "2026-05-14",
    guests: 4,
    slug: "imbros-gorge-guided-tour",
    message: "We would like a gentle pace, and one of us has slightly sore knees.",
  },
} satisfies { payload: RequestPayload };

export default GuestConfirmEmail;
