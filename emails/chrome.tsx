import type { ReactNode } from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";
import {
  ADDRESS_DISPLAY,
  BRAND,
  EMAIL,
  PHONE_DISPLAY,
  SITE_ORIGIN,
  WHATSAPP,
} from "@/lib/site";

export const emailTheme = {
  earth: "#392420",
  earthSoft: "#392420",
  olive: "#506551",
  oliveDeep: "#506551",
  gold: "#ecede9",
  cream: "#ecede9",
  sand: "#ecede9",
  paper: "#f5f5f2",
  line: "#d5d9d2",
  muted: "#6f605c",
  ink: "#392420",
};

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: emailTheme,
    },
  },
};

export function EmailShell({
  preview,
  eyebrow,
  title,
  lead,
  children,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
}: {
  preview: string;
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Html lang="en">
      <Tailwind config={tailwindConfig}>
        <Head />
        <Body className="m-0 bg-paper font-serif">
          <Preview>{preview}</Preview>
          <Container className="mx-auto my-0 w-full max-w-[600px] bg-sand">
            <Section className="bg-cream px-[36px] pb-[20px] pt-[28px]">
              <Img
                src={`${(process.env.EMAIL_ASSET_ORIGIN || SITE_ORIGIN).replace(/\/$/, "")}/brand/logos/logo-full.png`}
                alt={BRAND}
                width="168"
                height="86"
                className="h-[86px] w-[168px]"
              />
            </Section>
            <Section className="bg-earth px-[36px] pb-[26px] pt-[26px]">
              <Text className="m-0 text-[11px] font-semibold uppercase tracking-[3px] text-gold">
                {eyebrow}
              </Text>
              <Text className="mb-0 mt-[10px] text-[13px] leading-[20px] text-[#c9b8a8]">
                {ADDRESS_DISPLAY}
              </Text>
            </Section>

            <Section className="h-[4px] bg-olive p-0">
              <Text className="m-0 text-[0] leading-[0]">&nbsp;</Text>
            </Section>

            <Section className="bg-sand px-[36px] pb-[8px] pt-[32px]">
              <Heading
                as="h1"
                className="m-0 text-[26px] font-normal leading-[32px] text-earthSoft"
              >
                {title}
              </Heading>
              <Text className="mb-0 mt-[14px] text-[16px] leading-[25px] text-[#5c554c]">
                {lead}
              </Text>
            </Section>

            <Section className="bg-sand px-[36px] py-[18px]">{children}</Section>

            <Section className="bg-sand px-[36px] pb-[8px] pt-[8px]">
              <Button
                href={ctaHref}
                className="box-border rounded-[999px] bg-olive px-[22px] py-[14px] text-center text-[14px] text-cream no-underline"
              >
                {ctaLabel}
              </Button>
              {secondaryLabel && secondaryHref ? (
                <Text className="mb-0 mt-[16px] text-[14px] leading-[22px]">
                  <Link href={secondaryHref} className="text-oliveDeep underline">
                    {secondaryLabel}
                  </Link>
                </Text>
              ) : null}
            </Section>

            <Hr className="mx-[36px] my-[24px] border-solid border-line" />

            <Section className="bg-sand px-[36px] pb-[36px] pt-0">
              <Text className="m-0 text-[13px] leading-[22px] text-muted">
                The Rethymno desk · {PHONE_DISPLAY}
                <br />
                <Link href={`mailto:${EMAIL}`} className="text-oliveDeep no-underline">
                  {EMAIL}
                </Link>
                {" · "}
                <Link href={WHATSAPP} className="text-oliveDeep no-underline">
                  WhatsApp
                </Link>
              </Text>
              <Text className="mb-0 mt-[10px] text-[12px] leading-[18px] text-muted">
                {BRAND} · Licensed Greek tour operator
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function DetailCard({
  rows,
}: {
  rows: { label: string; value?: string | number | boolean }[];
}) {
  const visible = rows.filter(
    (row) => row.value !== undefined && row.value !== "" && row.value !== false,
  );

  return (
    <Section className="border-solid border border-line bg-cream px-[4px] py-[4px]">
      {visible.map((row, index) => (
        <Row key={row.label}>
          <Column
            className={`w-[38%] px-[16px] py-[12px] align-top ${
              index < visible.length - 1 ? "border-none border-b border-solid border-b-line" : ""
            }`}
          >
            <Text className="m-0 text-[11px] uppercase tracking-[1.5px] text-olive">
              {row.label}
            </Text>
          </Column>
          <Column
            className={`px-[16px] py-[12px] align-top ${
              index < visible.length - 1 ? "border-none border-b border-solid border-b-line" : ""
            }`}
          >
            <Text className="m-0 text-[15px] leading-[22px] text-earth">
              {row.value === true ? "Yes" : String(row.value)}
            </Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}
