import { findSharedPageByParam } from "@/lib/utils/shared-page-lookup";
import { truncateSharedPagePreview } from "@/lib/utils/shared-page-preview";
import { buildSharedPageSlug, extractSharedPageIdHint, isUuid } from "@/lib/utils/shared-page-slug";
import { generateSlug } from "@/lib/utils/slug";
import type { SharedPage } from "@/types";
import { describe, expect, it } from "vitest";

const samplePage: SharedPage = {
  id: "8f3d7a12-1111-4111-8111-abcdef012345",
  author_name: "Sofia T.",
  title: "Today I Almost Quit",
  content: "Today I almost quit software engineering. I didn't stay stuck though.",
  word_count: 12,
  status: "approved",
  submitted_at: "2026-07-02T12:00:00.000Z",
  published_at: "2026-07-02T12:00:00.000Z",
  updated_at: "2026-07-02T12:00:00.000Z",
};

describe("generateSlug", () => {
  it("creates a url-friendly slug", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  it("returns empty string for invalid input", () => {
    expect(generateSlug(null)).toBe("");
    expect(generateSlug(undefined)).toBe("");
    expect(generateSlug("")).toBe("");
  });
});

describe("shared page slug helpers", () => {
  it("builds slug from title and id suffix", () => {
    expect(buildSharedPageSlug(samplePage)).toBe("today-i-almost-quit-8f3d7a12");
  });

  it("handles missing page id", () => {
    expect(buildSharedPageSlug({ id: "", title: "x", content: "y" })).toBe("");
  });

  it("detects uuids and id hints", () => {
    expect(isUuid(samplePage.id)).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(extractSharedPageIdHint("today-i-almost-quit-8f3d7a12")).toBe("8f3d7a12");
    expect(extractSharedPageIdHint("no-hint")).toBeNull();
  });
});

describe("truncateSharedPagePreview", () => {
  it("returns short content unchanged", () => {
    expect(truncateSharedPagePreview("Short note.")).toBe("Short note.");
  });

  it("truncates long content with ellipsis", () => {
    const long = "word ".repeat(80).trim();
    const preview = truncateSharedPagePreview(long, 40);
    expect(preview.endsWith("…")).toBe(true);
    expect(preview.length).toBeLessThanOrEqual(42);
  });

  it("handles empty input", () => {
    expect(truncateSharedPagePreview(null)).toBe("");
    expect(truncateSharedPagePreview(undefined)).toBe("");
  });
});

describe("findSharedPageByParam", () => {
  it("finds by uuid", () => {
    expect(findSharedPageByParam([samplePage], samplePage.id)?.id).toBe(samplePage.id);
  });

  it("finds by public slug", () => {
    const slug = buildSharedPageSlug(samplePage);
    expect(findSharedPageByParam([samplePage], slug)?.author_name).toBe("Sofia T.");
  });

  it("returns null for unknown slug", () => {
    expect(findSharedPageByParam([samplePage], "missing-page-deadbeef")).toBeNull();
    expect(findSharedPageByParam([], "anything")).toBeNull();
  });
});
