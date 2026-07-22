import { generateSlug } from "@/lib/utils/slug";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SharedPageSlugSource = {
  id: string;
  title: string | null;
  content: string;
};

/**
 * Builds a stable public slug: `{title-or-excerpt}-{first-8-id-chars}`.
 * Example: `today-i-almost-quit-8f3d7a12`
 */
export function buildSharedPageSlug(page: SharedPageSlugSource): string {
  if (!page?.id || typeof page.id !== "string") return "";

  const source = page.title?.trim() || page.content?.slice(0, 80) || "page";
  const base = generateSlug(source) || "page";
  const suffix = page.id.replace(/-/g, "").slice(0, 8).toLowerCase();
  return `${base}-${suffix}`;
}

export function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Returns the 8-char id hint from a slug suffix, if present. */
export function extractSharedPageIdHint(slug: string): string | null {
  if (!slug || typeof slug !== "string") return null;
  const match = slug
    .trim()
    .toLowerCase()
    .match(/-([a-f0-9]{8})$/);
  return match?.[1] ?? null;
}
