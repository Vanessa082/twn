/**
 * Calculates reading time in minutes for a given text content.
 * Assumes average reading speed of 200 words per minute.
 *
 * @param content The text/HTML content of the article
 * @returns The calculated reading time in minutes (minimum of 1)
 */
export function calculateReadingTime(content: string | null | undefined): number {
  // 1. Validate input
  if (!content || typeof content !== "string") {
    return 0;
  }

  // 2. Core logic
  // Strip HTML tags if any (basic clean up for reading time calculation)
  const plainText = content.replace(/<[^>]*>/g, "");
  const words = plainText.trim().split(/\s+/).filter((word) => word.length > 0).length;
  const minutes = Math.ceil(words / 200);

  // 3. Return predictable output
  return minutes > 0 ? minutes : 1;
}
