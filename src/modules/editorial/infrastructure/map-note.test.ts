import { describe, expect, it } from "vitest";
import { toNoteCard } from "./map-note";
import { NOTE_CARD_COLUMNS } from "./tables";

describe("NOTE_CARD_COLUMNS", () => {
  it("selects only stored columns (reading time is computed, not stored)", () => {
    const columns = NOTE_CARD_COLUMNS.split(",").map((column) => column.trim());
    expect(columns).not.toContain("reading_time");
    expect(columns).toContain("content");
  });
});

describe("toNoteCard", () => {
  it("computes reading time from the body and drops the body", () => {
    const card = toNoteCard({
      id: "1",
      title: "T",
      slug: "t",
      excerpt: "",
      content: `<p>${"word ".repeat(600)}</p>`,
      cover_image: null,
      category: "technology",
      status: "published",
      published_at: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    expect(card.reading_time).toBeGreaterThan(1);
    expect("content" in card).toBe(false);
  });
});
