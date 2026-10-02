/**
 * Calculates reading time in minutes for a given text content.
 * Assumes average reading speed of 200 words per minute.
 */
export function calculateReadingTime(content: string | null | undefined): number {
  if (!content || typeof content !== "string") {
    return 0;
  }

  const plainText = content.replace(/<[^>]*>/g, "");
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const minutes = Math.ceil(words / 200);

  return minutes > 0 ? minutes : 1;
}
