import { TwnMarkImage } from "@/brand/mark-image";
import { loadSerifFont } from "@/lib/og-font";
import { site } from "@/lib/site";
import { ImageResponse } from "next/og";

const ICONS = [
  { id: "32", size: 32 },
  { id: "192", size: 192 },
  { id: "512", size: 512 },
] as const;

type IconId = (typeof ICONS)[number]["id"];

export function generateImageMetadata() {
  return ICONS.map((icon) => ({
    contentType: "image/png" as const,
    size: { width: icon.size, height: icon.size },
    id: icon.id,
    alt: site.shortName,
  }));
}

export default async function Icon({ id }: { id: string | Promise<string> }) {
  const resolved = String(await id) as IconId;
  const icon = ICONS.find((item) => item.id === resolved) ?? ICONS[0];
  const font = await loadSerifFont("TWN");

  return new ImageResponse(<TwnMarkImage size={icon.size} />, {
    width: icon.size,
    height: icon.size,
    fonts: font ? [{ name: "Playfair", data: font, weight: 900, style: "normal" }] : undefined,
  });
}
