import { DetailCard, EmailShell } from "@/emails/chrome";
import { CustomDayCard } from "@/emails/custom-day-card";
import { SAMPLE_CUSTOM_DAY, subjectFor, type RequestPayload } from "@/lib/request";
import { WHATSAPP } from "@/lib/site";

const KIND_EYEBROW: Record<RequestPayload["kind"], string> = {
  tour: "New day request",
  "custom-day": "New custom Crete day",
  transfer: "New transfer request",
  contact: "New desk message",
  partner: "Trade desk",
};

export function DeskRequestEmail({ payload }: { payload: RequestPayload }) {
  const first = payload.name.trim().split(/\s+/)[0] || payload.name;
  const custom = payload.kind === "custom-day";

  return (
    <EmailShell
      preview={
        custom
          ? `${first} built a private Crete day${payload.itinerary?.price ? ` · ${payload.itinerary.price}` : ""}. Reply from this thread.`
          : `${first} wrote from the booking desk. Reply from this thread.`
      }
      eyebrow={KIND_EYEBROW[payload.kind]}
      title={custom ? customDeskTitle(payload) : subjectFor(payload)}
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
      {payload.itinerary ? <CustomDayCard day={payload.itinerary} heading="The day they built" /> : null}
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
          { label: "Experience", value: custom ? undefined : payload.slug },
          { label: "Pickup", value: payload.itinerary ? undefined : payload.pickup },
          { label: "Drop-off", value: payload.dropoff },
          { label: "Flight", value: payload.flight },
          { label: "Wedding / event", value: payload.wedding },
          { label: "Guest note", value: payload.message },
        ]}
      />
    </EmailShell>
  );
}

function customDeskTitle(payload: RequestPayload) {
  const date = payload.date || "date TBC";
  const guests = payload.guests ? `${payload.guests} guests` : null;
  const price = payload.itinerary?.price;
  return ["Custom Crete day", date, guests, price].filter(Boolean).join(" · ");
}

DeskRequestEmail.PreviewProps = {
  payload: SAMPLE_CUSTOM_DAY,
} satisfies { payload: RequestPayload };

export default DeskRequestEmail;
