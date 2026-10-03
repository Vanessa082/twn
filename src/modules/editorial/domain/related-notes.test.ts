import { describe, expect, it } from "vitest";
import { type RelatedContext, rankRelatedNotes, tagWeight } from "./related-notes";
import type { NoteCard } from "./types";

const NOW = new Date("2026-10-01T00:00:00Z");

function card(id: string, overrides: Partial<NoteCard> = {}): NoteCard {
  return {
    id,
    title: `Note ${id}`,
    slug: `note-${id}`,
    excerpt: "",
    cover_image: null,
    category: "technology",
    status: "published",
    published_at: "2026-09-01T00:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

function context(overrides: Partial<RelatedContext> = {}): RelatedContext {
  return {
    noteId: "current",
    category: "technology",
    tagNames: { rare: "Supabase RLS", common: "Engineering" },
    tagFrequency: { rare: 2, common: 12 },
    publishedTotal: 14,
    series: null,
    excludeIds: [],
    now: NOW,
    ...overrides,
  };
}

describe("tagWeight", () => {
  it("weights rare tags above common ones", () => {
    expect(tagWeight(2, 14)).toBeGreaterThan(tagWeight(12, 14));
  });
});

describe("rankRelatedNotes", () => {
  it("ranks a note sharing a rare tag above one sharing a common tag", () => {
    const result = rankRelatedNotes(
      context(),
      [
        { note: card("common"), sharedTagIds: ["common"] },
        { note: card("rare"), sharedTagIds: ["rare"] },
      ],
      3
    );
    expect(result.map((r) => r.note.id)).toEqual(["rare", "common"]);
    expect(result[0].reason).toEqual({ kind: "tags", tags: ["Supabase RLS"] });
  });

  it("explains same-chapter and same-series picks", () => {
    const result = rankRelatedNotes(
      context({ series: { title: "180 Days", noteIds: ["sibling"] } }),
      [
        { note: card("chapter"), sharedTagIds: [] },
        { note: card("sibling", { category: "learning" }), sharedTagIds: [] },
      ],
      3
    );
    expect(result.map((r) => r.note.id)).toEqual(["sibling", "chapter"]);
    expect(result[0].reason).toEqual({ kind: "series", title: "180 Days" });
    expect(result[1].reason).toEqual({ kind: "chapter", category: "technology" });
  });

  it("never pads the list with unrelated notes", () => {
    const result = rankRelatedNotes(
      context(),
      [{ note: card("other", { category: "leadership" }), sharedTagIds: [] }],
      3
    );
    expect(result).toEqual([]);
  });

  it("excludes the current note and notes already linked on the page", () => {
    const result = rankRelatedNotes(
      context({ excludeIds: ["next"] }),
      [
        { note: card("current"), sharedTagIds: ["rare"] },
        { note: card("next"), sharedTagIds: ["rare"] },
        { note: card("kept"), sharedTagIds: ["common"] },
      ],
      3
    );
    expect(result.map((r) => r.note.id)).toEqual(["kept"]);
  });

  it("merges duplicate candidates and respects the limit", () => {
    const result = rankRelatedNotes(
      context(),
      [
        { note: card("a"), sharedTagIds: ["common"] },
        { note: card("a"), sharedTagIds: ["rare"] },
        { note: card("b"), sharedTagIds: ["common"] },
        { note: card("c"), sharedTagIds: [] },
      ],
      2
    );
    expect(result.map((r) => r.note.id)).toEqual(["a", "b"]);
    expect(result[0].reason).toEqual({ kind: "tags", tags: ["Supabase RLS", "Engineering"] });
  });

  it("prefers the newer note when relevance is equal", () => {
    const result = rankRelatedNotes(
      context(),
      [
        { note: card("old", { published_at: "2024-01-01T00:00:00Z" }), sharedTagIds: ["rare"] },
        { note: card("new", { published_at: "2026-09-20T00:00:00Z" }), sharedTagIds: ["rare"] },
      ],
      3
    );
    expect(result.map((r) => r.note.id)).toEqual(["new", "old"]);
  });
});
