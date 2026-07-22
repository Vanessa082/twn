import { buildSharedPageSlug, extractSharedPageIdHint, isUuid } from "@/lib/utils/shared-page-slug";
import type { SharedPage } from "@/types";

/**
 * Resolve a shared page from a route param (UUID or public slug).
 */
export function findSharedPageByParam(pages: SharedPage[], param: string): SharedPage | null {
  if (!Array.isArray(pages) || !param || typeof param !== "string") return null;

  const trimmed = param.trim();
  if (!trimmed) return null;

  if (isUuid(trimmed)) {
    return pages.find((page) => page.id === trimmed) ?? null;
  }

  const exact = pages.find((page) => buildSharedPageSlug(page) === trimmed);
  if (exact) return exact;

  const hint = extractSharedPageIdHint(trimmed);
  if (!hint) return null;

  return pages.find((page) => page.id.replace(/-/g, "").toLowerCase().startsWith(hint)) ?? null;
}
