/**
 * Truncates shared-page body for carousel/list previews.
 */
export function truncateSharedPagePreview(
  content: string | null | undefined,
  maxChars = 140
): string {
  if (!content || typeof content !== "string") return "";
  const trimmed = content.trim();
  if (trimmed.length <= maxChars) return trimmed;
  const slice = trimmed.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  const safe = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return `${safe.trimEnd()}…`;
}
