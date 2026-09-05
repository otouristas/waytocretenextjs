import { Button, Column, Link, Row, Section, Text } from "react-email";
import type { CustomDayItinerary } from "@/lib/request";

/**
 * The custom-day itinerary, as it appears in both the desk mail and the
 * guest confirmation. Tables only — Outlook still cannot do flex.
 */
export function CustomDayCard({
  day,
  heading = "The day they built",
}: {
  day: CustomDayItinerary;
  heading?: string;
}) {
  return (
    <Section className="mb-[8px] overflow-hidden border-solid border border-line bg-cream">
      <Section className="bg-earth px-[20px] py-[18px]">
        <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2.5px] text-gold">
          {heading}
        </Text>
        <Text className="mb-0 mt-[8px] text-[17px] leading-[25px] text-cream">{day.route}</Text>
      </Section>

      <Section className="px-[8px] py-[4px]">
        <Row>
          <Stat label="Driving" value={day.driving} />
          <Stat label="At stops" value={day.stays} />
          <Stat label="Billed" value={day.billed} />
        </Row>
      </Section>

      <Section className="px-[20px] pb-[8px] pt-[4px]">
        <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-olive">
          Pickup
        </Text>
        <Text className="mb-[12px] mt-[4px] text-[15px] leading-[22px] text-earth">{day.start}</Text>

        <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-olive">
          Stops
        </Text>
        {day.stops.map((stop, index) => (
          <Row key={`${stop.name}-${index}`} className="mt-[8px]">
            <Column className="w-[36px] align-top">
              <Text className="m-0 h-[28px] w-[28px] rounded-[14px] bg-olive text-center text-[13px] font-semibold leading-[28px] text-cream">
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

      <Section className="mx-[20px] mb-[16px] mt-[12px] bg-earth px-[18px] py-[16px]">
        <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-gold">
          Private tour
        </Text>
        <Text className="mb-0 mt-[6px] text-[28px] leading-[32px] text-cream">{day.price}</Text>
        <Text className="mb-0 mt-[6px] text-[13px] leading-[20px] text-[#c9b8a8]">
          {day.billed} billed · 5-hour minimum · photoshoot included
        </Text>
      </Section>

      {day.addons.length ? (
        <Section className="px-[20px] pb-[8px]">
          <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-olive">
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

      <Section className="px-[20px] pb-[20px] pt-[8px]">
        {day.shareUrl ? (
          <Button
            href={day.shareUrl}
            className="box-border rounded-[999px] bg-olive px-[18px] py-[12px] text-center text-[13px] text-cream no-underline"
          >
            Open the itinerary
          </Button>
        ) : null}
        {day.mapsUrl ? (
          <Text className="mb-0 mt-[12px] text-[13px] leading-[20px]">
            <Link href={day.mapsUrl} className="text-oliveDeep underline">
              Open this day in Google Maps
            </Link>
          </Text>
        ) : null}
      </Section>
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Column className="px-[12px] py-[12px] align-top">
      <Text className="m-0 text-[10px] font-semibold uppercase tracking-[1.6px] text-olive">{label}</Text>
      <Text className="mb-0 mt-[4px] text-[16px] leading-[22px] text-earth">{value}</Text>
    </Column>
  );
}
