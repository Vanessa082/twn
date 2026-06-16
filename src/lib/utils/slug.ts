/**
 * Generates a clean URL slug from an article title.
 * Removes special characters, converts to lowercase, and replaces spaces with hyphens.
 *
 * @param title The title of the article
 * @returns A validated, URL-friendly slug
 */
export function generateSlug(title: string | null | undefined): string {
  // 1. Validate input
  if (!title || typeof title !== "string") {
    return "";
  }

  // 2. Core logic
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove all non-word characters except spaces and hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces or underscores with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim leading or trailing hyphens

  // 3. Return predictable output
  return slug;
}
