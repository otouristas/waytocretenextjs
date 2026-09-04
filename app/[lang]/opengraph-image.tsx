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
          background: "linear-gradient(135deg, #442f29 0%, #392420 55%, #1a1c14 100%)",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#c9a227" }} />
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#e6d39a",
            }}
          >
            {ui.ogLocation}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, lineHeight: 1.02, color: "#f7f3ea", letterSpacing: -2 }}>
            {BRAND}
          </div>
          <div style={{ fontSize: 36, lineHeight: 1.25, color: "#c8d2b9", maxWidth: 900 }}>
            {ui.ogTagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ height: 6, width: 120, background: "#6c7c59", borderRadius: 999 }} />
          <div style={{ fontSize: 26, color: "#8a8474" }}>rethymnotours.com</div>
        </div>
      </div>
    ),
    size,
  );
}
