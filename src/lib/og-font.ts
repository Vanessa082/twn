/**
 * Loads a subset of Playfair Display (only the glyphs in `text`) for
 * next/og image generation. Returns null when offline so callers can fall
 * back to the built-in font instead of failing the whole image.
 */
export async function loadSerifFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&text=${encodeURIComponent(text)}`,
      { next: { revalidate: 60 * 60 * 24 * 30 } }
    ).then((res) => res.text());
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    return await fetch(src).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}
