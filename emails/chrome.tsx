import type { CSSProperties, ReactNode } from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
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
import type { Row as DetailRow } from "@/lib/email/content";

/**
 * The email palette, derived from the three anchors in `app/globals.css`:
 *
 *   paper  #ecede9    pine  #506551    earth  #392420
 *
 * The site mixes its tones with `color-mix()`. No email client can, so every
 * tone here is the same mix pre-computed in sRGB and written out as hex. The
 * percentages name the globals.css rule each one comes from, so the two
 * palettes can be checked against each other by eye.
 *
 * They had drifted: `sand`, `cream` and `gold` were all `#ecede9` and the
 * page behind them was `#f5f5f2`, so a card, the band it sat on and the text
 * meant to stand out against them were one flat near-white. That is what made
 * these mails read as unstyled.
 */
export const emailTheme = {
  paper: "#ecede9",
  pine: "#506551",
  earth: "#392420",
  /** `--surface-raised`, paper 92% + pine — panels inside the card. */
  raised: "#dfe2dd",
  /** paper 88% + pine — the backdrop the 600px card floats on. */
  backdrop: "#d9ddd7",
  /** `--line`, paper 85% + pine — hairlines. */
  line: "#d5d9d2",
  /** `--muted`, earth 70% + paper — body copy and captions on paper. 5.1:1. */
  muted: "#6f605c",
  /** paper 70% + earth — the second line on an earth band. 6.8:1. */
  onEarth: "#b6b1ad",
  /** `--earth-900` — the price band. */
  earthDeep: "#241614",
};

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: emailTheme,
    },
  },
};

/**
 * Gmail and Outlook block remote images until the reader allows them, and
 * this masthead is otherwise the only thing at the top of the mail. Styling
 * the alt text means a blocked logo still prints the brand in brand type
 * rather than leaving a white gap above the fold.
 */
const logoAlt: CSSProperties = {
  color: emailTheme.earth,
  fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: "83px",
};

function logoSrc() {
  const origin = (process.env.EMAIL_ASSET_ORIGIN || SITE_ORIGIN).replace(/\/$/, "");
  return `${origin}/brand/logos/logo-full.png`;
}

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
        <Body className="m-0 bg-backdrop font-serif">
          <Preview>{preview}</Preview>
          <Container className="mx-auto my-0 w-full max-w-[600px] bg-paper">
            <Section className="bg-paper px-[36px] pb-[20px] pt-[28px]">
              <Img
                src={logoSrc()}
                alt={BRAND}
                width="180"
                height="83"
                style={logoAlt}
                className="h-[83px] w-[180px]"
              />
            </Section>

            {/* The one band that paints with images off. It carries the brand
                so a blocked mail is still recognisably from the desk. */}
            <Section className="bg-earth px-[36px] pb-[26px] pt-[26px]">
              <Text className="m-0 text-[11px] font-semibold uppercase tracking-[3px] text-paper">
                {eyebrow}
              </Text>
              <Text className="mb-0 mt-[10px] text-[13px] leading-[20px] text-onEarth">
                {BRAND} · {ADDRESS_DISPLAY}
              </Text>
            </Section>

            <Section className="h-[4px] bg-pine p-0 leading-[4px]">
              <Text className="m-0 text-[0px] leading-[4px]">&nbsp;</Text>
            </Section>

            <Section className="bg-paper px-[36px] pb-[8px] pt-[32px]">
              <Heading as="h1" className="m-0 text-[26px] font-normal leading-[32px] text-earth">
                {title}
              </Heading>
              <Text className="mb-0 mt-[14px] text-[16px] leading-[25px] text-muted">{lead}</Text>
            </Section>

            <Section className="bg-paper px-[36px] py-[18px]">{children}</Section>

            <Section className="bg-paper px-[36px] pb-[28px] pt-[8px]">
              <Button
                href={ctaHref}
                className="box-border rounded-[999px] bg-pine px-[22px] py-[14px] text-center text-[14px] font-semibold text-paper no-underline"
              >
                {ctaLabel}
              </Button>
              {secondaryLabel && secondaryHref ? (
                <Text className="mb-0 mt-[16px] text-[14px] leading-[22px]">
                  <Link href={secondaryHref} className="text-pine underline">
                    {secondaryLabel}
                  </Link>
                </Text>
              ) : null}
            </Section>

            {/* A full-bleed hairline rather than <Hr>, whose hard-coded
                width:100% plus side margins overflows the container. */}
            <Section className="h-[1px] bg-line p-0 leading-[1px]">
              <Text className="m-0 text-[0px] leading-[1px]">&nbsp;</Text>
            </Section>

            <Section className="bg-paper px-[36px] pb-[36px] pt-[24px]">
              <Text className="m-0 text-[13px] leading-[22px] text-muted">
                The Rethymno desk · {PHONE_DISPLAY}
                <br />
                <Link href={`mailto:${EMAIL}`} className="text-pine no-underline">
                  {EMAIL}
                </Link>
                {" · "}
                <Link href={WHATSAPP} className="text-pine no-underline">
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

/**
 * The panel every card on this page is built from: an earth band with a
 * heading and one headline, then whatever the card puts under it.
 */
export function CardShell({
  heading,
  headline,
  children,
}: {
  heading: string;
  headline: string;
  children?: ReactNode;
}) {
  return (
    <Section className="mb-[8px] border border-solid border-line bg-raised p-0">
      <Section className="bg-earth px-[20px] py-[18px]">
        <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2.5px] text-paper">
          {heading}
        </Text>
        <Text className="mb-0 mt-[8px] text-[17px] leading-[25px] text-paper">{headline}</Text>
      </Section>
      {children}
    </Section>
  );
}

/** One fact in a side-by-side row. Always used inside a `<Row>`. */
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Column className="px-[12px] py-[12px] align-top">
      <Text className="m-0 text-[10px] font-semibold uppercase tracking-[1.6px] text-pine">
        {label}
      </Text>
      <Text className="mb-0 mt-[4px] text-[16px] leading-[22px] text-earth">{value}</Text>
    </Column>
  );
}

export function StatRow({ stats }: { stats: DetailRow[] }) {
  if (!stats.length) return null;
  return (
    <Section className="px-[8px] py-[4px]">
      <Row>
        {stats.map((stat) => (
          <Stat key={stat.label} label={stat.label} value={String(stat.value)} />
        ))}
      </Row>
    </Section>
  );
}

/** The guest's own words, set apart from the facts around them. */
export function Quote({ label, children }: { label: string; children: string }) {
  return (
    <Section className="px-[20px] pb-[18px] pt-[6px]">
      <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2px] text-pine">
        {label}
      </Text>
      <Section
        className="mt-[8px] bg-paper px-[16px] py-[12px]"
        style={{ borderLeft: `3px solid ${emailTheme.pine}` }}
      >
        <Text className="m-0 whitespace-pre-line text-[15px] leading-[23px] text-earth">
          {children}
        </Text>
      </Section>
    </Section>
  );
}

/**
 * A code the guest has to quote back — set in a band of its own, because a
 * row in the same grey table as everything else is not something anyone
 * copies down.
 */
export function CodePanel({
  label,
  code,
  note,
}: {
  label: string;
  code: string;
  note: string;
}) {
  return (
    <Section className="mb-[8px] bg-earthDeep px-[20px] py-[20px]">
      <Text className="m-0 text-[11px] font-semibold uppercase tracking-[2.5px] text-paper">
        {label}
      </Text>
      <Text className="mb-0 mt-[8px] font-mono text-[28px] leading-[34px] tracking-[2px] text-paper">
        {code}
      </Text>
      <Text className="mb-0 mt-[10px] text-[13px] leading-[20px] text-onEarth">{note}</Text>
    </Section>
  );
}

/**
 * The label/value record.
 *
 * The hairline between rows is set through `style`, not a class. Written as
 * `border-none border-b border-solid border-b-line` it compiled to
 * `border-style:solid` with no width or colour on the other three sides, so
 * every client fell back to `medium currentColor` and drew a thick dark box
 * around each cell. That is the black grid these mails used to show.
 */
export function DetailCard({ rows }: { rows: DetailRow[] }) {
  const visible = rows.filter(
    (row) => row.value !== undefined && row.value !== "" && row.value !== false,
  );
  if (!visible.length) return null;

  return (
    <Section className="mb-[8px] border border-solid border-line bg-raised p-0">
      {visible.map((row, index) => {
        const rule: CSSProperties =
          index < visible.length - 1 ? { borderBottom: `1px solid ${emailTheme.line}` } : {};
        return (
          <Row key={row.label}>
            <Column className="w-[38%] px-[16px] py-[12px] align-top" style={rule}>
              <Text className="m-0 text-[11px] uppercase tracking-[1.5px] text-pine">
                {row.label}
              </Text>
            </Column>
            <Column className="px-[16px] py-[12px] align-top" style={rule}>
              <Text className="m-0 text-[15px] leading-[22px] text-earth">
                {row.value === true ? "Yes" : String(row.value)}
              </Text>
            </Column>
          </Row>
        );
      })}
    </Section>
  );
}
