import { Button, Column, Link, Row, Section, Text } from "react-email";
import { CardShell, Quote, Stat } from "@/emails/chrome";
import type { CustomDayItinerary } from "@/lib/request";

/**
 * The custom-day itinerary, as it appears in both the desk mail and the
 * guest confirmation. Tables only — Outlook still cannot do flex.
 */
export function CustomDayCard({
  day,
  heading = "The day they built",
  note,
  noteLabel,
}: {
  day: CustomDayItinerary;
  heading?: string;
  note?: string;
  noteLabel?: string;
}) {
  return (
    <CardShell heading={heading} headline={day.route}>
      <Section className="px-[8px] py-[4px]">
        <Row>
          <Stat label="Driving" value={day.driving} />
          <Stat label="At stops" value={day.stays} />
          <Stat label="Billed" value={day.billed} />
        </Row>
      </Section>

      <Section className="px-[20px] pb-[8px] pt-[4px]">
        <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-pine">
          Pickup
        </Text>
        <Text className="mb-[12px] mt-[4px] text-[15px] leading-[22px] text-earth">{day.start}</Text>

        <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-pine">
          Stops
        </Text>
        {day.stops.map((stop, index) => (
          <Row key={`${stop.name}-${index}`} className="mt-[8px]">
            <Column className="w-[36px] align-top">
              <Text className="m-0 h-[28px] w-[28px] rounded-[14px] bg-pine text-center text-[13px] font-semibold leading-[28px] text-paper">
                {index + 1}
              </Text>
            </Column>
            <Column className="align-middle">
              <Text className="m-0 text-[15px] leading-[20px] text-earth">{stop.name}</Text>
              <Text className="m-0 text-[12px] leading-[18px] text-muted">Stay {stop.stay}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Inset by a padded parent, not by margins: a react-email Section is a
          100%-wide table, so `mx-` pushes it past the card's right edge. */}
      <Section className="px-[20px] pb-[16px] pt-[12px]">
        <Section className="bg-earthDeep px-[18px] py-[16px]">
          <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-paper">
            Private tour
          </Text>
          <Text className="mb-0 mt-[6px] text-[28px] leading-[32px] text-paper">{day.price}</Text>
          <Text className="mb-0 mt-[6px] text-[13px] leading-[20px] text-onEarth">
            {day.billed} billed · 5-hour minimum · photoshoot included
          </Text>
        </Section>
      </Section>

      {day.addons.length ? (
        <Section className="px-[20px] pb-[8px]">
          <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-pine">
            Add-ons to confirm
          </Text>
          <Text className="mb-0 mt-[6px] text-[14px] leading-[22px] text-earth">
            {day.addons.join(" · ")}
          </Text>
          <Text className="mb-0 mt-[4px] text-[12px] leading-[18px] text-muted">
            Requested with the day — no extra amount on this quote.
          </Text>
        </Section>
      ) : null}

      {note && noteLabel ? <Quote label={noteLabel}>{note}</Quote> : null}

      {day.shareUrl || day.mapsUrl ? (
        <Section className="px-[20px] pb-[20px] pt-[8px]">
          {day.shareUrl ? (
            <Button
              href={day.shareUrl}
              className="box-border rounded-[999px] bg-pine px-[18px] py-[12px] text-center text-[13px] font-semibold text-paper no-underline"
            >
              Open the itinerary
            </Button>
          ) : null}
          {day.mapsUrl ? (
            <Text className="mb-0 mt-[12px] text-[13px] leading-[20px]">
              <Link href={day.mapsUrl} className="text-pine underline">
                Open this day in Google Maps
              </Link>
            </Text>
          ) : null}
        </Section>
      ) : null}
    </CardShell>
  );
}
