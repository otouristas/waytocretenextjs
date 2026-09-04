import { DetailCard, EmailShell } from "@/emails/chrome";
import { subjectFor, type RequestPayload } from "@/lib/request";
import { WHATSAPP } from "@/lib/site";

const KIND_EYEBROW: Record<RequestPayload["kind"], string> = {
  tour: "New day request",
  transfer: "New transfer request",
  contact: "New desk message",
  partner: "Trade desk",
};

export function DeskRequestEmail({ payload }: { payload: RequestPayload }) {
  const first = payload.name.trim().split(/\s+/)[0] || payload.name;

  return (
    <EmailShell
      preview={`${first} wrote from the booking desk. Reply from this thread.`}
      eyebrow={KIND_EYEBROW[payload.kind]}
      title={subjectFor(payload)}
      lead="A guest wrote from the booking desk. Reply from this thread so they keep one conversation."
      ctaLabel="Reply to guest"
      ctaHref={`mailto:${payload.email}`}
      secondaryLabel="Open WhatsApp"
      secondaryHref={WHATSAPP}
    >
      <DetailCard
        rows={[
          { label: "Kind", value: payload.kind },
          { label: "Language", value: payload.lang },
          { label: "Name", value: payload.name },
          { label: "Email", value: payload.email },
          { label: "Phone", value: payload.phone },
          { label: "Company", value: payload.company },
          { label: "Hotel / villa", value: payload.hotel },
          { label: "Date", value: payload.date },
          { label: "Time", value: payload.time },
          { label: "Guests", value: payload.guests },
          { label: "Experience", value: payload.slug },
          { label: "Pickup", value: payload.pickup },
          { label: "Drop-off", value: payload.dropoff },
          { label: "Flight", value: payload.flight },
          { label: "Wedding / event", value: payload.wedding },
          { label: "Note", value: payload.message },
        ]}
      />
    </EmailShell>
  );
}

DeskRequestEmail.PreviewProps = {
  payload: {
    kind: "tour",
    lang: "en",
    name: "Anna Bergström",
    email: "anna@example.com",
    phone: "+46 70 123 4567",
    hotel: "Casa Mooma, Rethymno",
    date: "2026-05-14",
    guests: 4,
    slug: "imbros-gorge-guided-tour",
    message: "We would like a gentle pace, and one of us has slightly sore knees.",
  },
} satisfies { payload: RequestPayload };

export default DeskRequestEmail;
