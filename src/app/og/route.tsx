import { loadSerifFont } from "@/lib/og-font";
import { site } from "@/lib/site";
import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

function clean(value: string | null, max: number, fallback: string): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * Branded social card used whenever a page has no editor-supplied image.
 * Inputs are clamped because this URL is public.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clean(searchParams.get("title"), 110, site.name);
  const eyebrow = clean(searchParams.get("eyebrow"), 40, "The Notebook");

  const font = await loadSerifFont(`${title}TWN`);
  const titleSize = title.length > 70 ? 58 : title.length > 40 ? 68 : 80;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#ffffff",
        color: "#111111",
        borderTop: "14px solid #111111",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#8a6d4b" }} />
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#6b6b6b",
          }}
        >
          {eyebrow}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontFamily: font ? "Playfair" : "serif",
          fontSize: titleSize,
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          maxWidth: 1000,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: "1px solid #e5e5e5",
          paddingTop: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: font ? "Playfair" : "serif",
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: 8,
          }}
        >
          TWN
        </div>
        <div style={{ fontSize: 22, color: "#6b6b6b" }}>{site.name}</div>
      </div>
    </div>,
    {
      ...SIZE,
      fonts: font ? [{ name: "Playfair", data: font, weight: 900, style: "normal" }] : undefined,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
    }
  );
}
