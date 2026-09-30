export type PageWindowItem = number | "gap";

export const MAX_PAGE = 10_000;

/** Reads ?page= defensively: anything that isn't a positive whole number is page 1. */
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d{1,5}$/.test(raw)) return 1;
  const page = Number(raw);
  return page >= 1 ? Math.min(page, MAX_PAGE) : 1;
}

export function totalPagesFor(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, pageSize)));
}

/** Adds ?page=N to a URL, leaving page 1 as the clean canonical URL. */
export function withPageParam(href: string, page: number): string {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Zero-based inclusive row range, as Supabase's .range() expects. */
export function pageRange(page: number, pageSize: number): { from: number; to: number } {
  const from = (Math.max(1, page) - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

/**
 * Which page numbers to show: always the first and last, the current page
 * with `siblings` either side, and a gap wherever pages are skipped. The
 * result has a constant length for a given total, so the control never jumps.
 *
 *   pageWindow(1, 10)  → [1, 2, 3, 4, 5, "gap", 10]
 *   pageWindow(5, 10)  → [1, "gap", 4, 5, 6, "gap", 10]
 *   pageWindow(10, 10) → [1, "gap", 6, 7, 8, 9, 10]
 */
export function pageWindow(current: number, total: number, siblings = 1): PageWindowItem[] {
  const slots = siblings * 2 + 5;
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1);

  const page = Math.min(Math.max(1, current), total);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, total);
  const showLeftGap = left > 3;
  const showRightGap = right < total - 2;
  const edgeCount = 3 + siblings * 2;

  if (!showLeftGap && showRightGap) {
    return [...Array.from({ length: edgeCount }, (_, i) => i + 1), "gap", total];
  }
  if (showLeftGap && !showRightGap) {
    return [1, "gap", ...Array.from({ length: edgeCount }, (_, i) => total - edgeCount + i + 1)];
  }
  return [1, "gap", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "gap", total];
}
