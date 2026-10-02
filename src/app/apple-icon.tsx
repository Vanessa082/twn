import { TwnMarkImage } from "@/brand/mark-image";
import { TWN_MARK_SIZES } from "@/brand/tokens";
import { loadSerifFont } from "@/lib/og-font";
import { ImageResponse } from "next/og";

export const size = { width: TWN_MARK_SIZES.apple, height: TWN_MARK_SIZES.apple };
export const contentType = "image/png";

export default async function AppleIcon() {
  const font = await loadSerifFont("TWN");

  return new ImageResponse(<TwnMarkImage size={size.width} />, {
    ...size,
    fonts: font ? [{ name: "Playfair", data: font, weight: 900, style: "normal" }] : undefined,
  });
}
