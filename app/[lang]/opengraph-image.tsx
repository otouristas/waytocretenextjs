import { ImageResponse } from "next/og";
import { LANGS, parseLang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { BRAND } from "@/lib/site";

/**
 * The default social card.
 *
 * Generated rather than shipped as a static asset so it stays in step with the
 * brand tokens, and per-locale so a shared link reads in the reader's
 * language. Pages with their own imagery (tours) override this with a real
 * photograph — a photo of the gorge converts better than a wordmark.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${BRAND} — private tours from Rethymno, Crete`;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  const ui = t(lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #392420 0%, #392420 55%, #241614 100%)",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#506551" }} />
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#ecede9",
            }}
          >
            {ui.ogLocation}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, lineHeight: 1.02, color: "#ecede9", letterSpacing: -2 }}>
            {BRAND}
          </div>
          <div style={{ fontSize: 36, lineHeight: 1.25, color: "#a6afa4", maxWidth: 900 }}>
            {ui.ogTagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ height: 6, width: 120, background: "#506551", borderRadius: 999 }} />
          <div style={{ fontSize: 26, color: "#b6b1ad" }}>rethymnotours.com</div>
        </div>
      </div>
    ),
    size,
  );
}
