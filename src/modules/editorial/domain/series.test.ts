import { describe, expect, it } from "vitest";
import { type SeriesEntryRecord, buildSeriesNavigation, entryLabel } from "./series";
import type { NoteCard } from "./types";

function card(id: string): NoteCard {
  return {
    id,
    title: `Note ${id}`,
    slug: `note-${id}`,
    excerpt: "",
    cover_image: null,
    category: "technology",
    status: "published",
    published_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

function entry(id: string, label: string | null = null, visible = true): SeriesEntryRecord {
  return { noteId: id, label, note: visible ? card(id) : null };
}

const series = (entries: SeriesEntryRecord[]) => ({
  title: "180 Days of Building TWN",
  slug: "180-days",
  entries,
});

describe("entryLabel", () => {
  it("uses the author's label when present", () => {
    expect(entryLabel("Day 42", 3)).toBe("Day 42");
    expect(entryLabel("  Prologue  ", 1)).toBe("Prologue");
  });

  it("falls back to Part N", () => {
    expect(entryLabel(null, 3)).toBe("Part 3");
    expect(entryLabel("   ", 2)).toBe("Part 2");
  });
});

describe("buildSeriesNavigation", () => {
  it("links the previous and next entries around the current note", () => {
    const nav = buildSeriesNavigation(series([entry("a"), entry("b"), entry("c")]), "b");
    expect(nav?.position).toBe(2);
    expect(nav?.total).toBe(3);
    expect(nav?.currentLabel).toBe("Part 2");
    expect(nav?.previous?.note.id).toBe("a");
    expect(nav?.previous?.label).toBe("Part 1");
    expect(nav?.next?.note.id).toBe("c");
    expect(nav?.next?.label).toBe("Part 3");
  });

  it("has no previous on the first entry and no next on the last", () => {
    const entries = [entry("a", "Day 1"), entry("b", "Day 2")];
    expect(buildSeriesNavigation(series(entries), "a")?.previous).toBeNull();
    expect(buildSeriesNavigation(series(entries), "b")?.next).toBeNull();
  });

  it("skips entries readers cannot see and renumbers the rest", () => {
    const nav = buildSeriesNavigation(
      series([entry("a"), entry("draft", null, false), entry("c")]),
      "c"
    );
    expect(nav?.total).toBe(2);
    expect(nav?.position).toBe(2);
    expect(nav?.previous?.note.id).toBe("a");
    expect(nav?.entries.map((e) => e.note.id)).toEqual(["a", "c"]);
  });

  it("keeps a hidden current note so a draft preview shows its place", () => {
    const nav = buildSeriesNavigation(
      series([entry("a"), entry("draft", "Day 2", false), entry("c")]),
      "draft"
    );
    expect(nav?.currentLabel).toBe("Day 2");
    expect(nav?.position).toBe(2);
    expect(nav?.total).toBe(3);
    expect(nav?.entries.map((e) => e.note.id)).toEqual(["a", "c"]);
  });

  it("returns null when the note is not in the series", () => {
    expect(buildSeriesNavigation(series([entry("a")]), "zzz")).toBeNull();
  });
});
