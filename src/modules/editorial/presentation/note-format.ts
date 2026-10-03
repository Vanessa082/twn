import type { RelatedReason } from "@/modules/editorial/contracts";

export function formatNoteDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function chapterLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function relatedReasonLabel(reason: RelatedReason): string {
  switch (reason.kind) {
    case "tags":
      return `Also tagged ${reason.tags.join(" & ")}`;
    case "series":
      return `Also in ${reason.title}`;
    case "chapter":
      return `More in ${chapterLabel(reason.category)}`;
  }
}

export function readingTimeLabel(minutes: number | null | undefined): string {
  return `${Math.max(1, minutes ?? 1)} min read`;
}
