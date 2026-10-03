import { describe, expect, it } from "vitest";
import type { CollectionRepository, RelatedCandidatePool, TagRepository } from "../domain/ports";
import type { SeriesRecord } from "../domain/series";
import type { NoteCard, NoteChapter } from "../domain/types";
import { getNoteConnections } from "./connections";

function card(id: string, category: NoteChapter = "technology"): NoteCard {
  return {
    id,
    title: `Note ${id}`,
    slug: `note-${id}`,
    excerpt: "",
    cover_image: null,
    category,
    status: "published",
    published_at: "2026-09-01T00:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  };
}

function repositories(series: SeriesRecord | null, pool: RelatedCandidatePool) {
  return {
    collections: { findSeriesForNote: async () => series } as unknown as CollectionRepository,
    tags: { findRelatedCandidates: async () => pool } as unknown as TagRepository,
  };
}

const emptyPool: RelatedCandidatePool = {
  tagNames: {},
  tagFrequency: {},
  publishedTotal: 10,
  candidates: [],
};

describe("getNoteConnections", () => {
  it("links series neighbours and keeps them out of the recommendations", async () => {
    const series: SeriesRecord = {
      title: "180 Days",
      slug: "180-days",
      entries: ["a", "b", "c", "d"].map((id) => ({
        noteId: id,
        label: null,
        note: card(id, "learning"),
      })),
    };
    const pool: RelatedCandidatePool = {
      ...emptyPool,
      tagNames: { t: "Supabase" },
      tagFrequency: { t: 2 },
      candidates: [
        { note: card("a", "learning"), sharedTagIds: ["t"] },
        { note: card("x"), sharedTagIds: ["t"] },
      ],
    };

    const result = await getNoteConnections(
      { id: "b", category: "technology" },
      repositories(series, pool)
    );

    expect(result.series?.previous?.note.id).toBe("a");
    expect(result.series?.next?.note.id).toBe("c");
    expect(result.related.map((r) => r.note.id)).toEqual(["x", "d"]);
    expect(result.related[1].reason).toEqual({ kind: "series", title: "180 Days" });
  });

  it("works for notes outside any series", async () => {
    const result = await getNoteConnections(
      { id: "solo", category: "technology" },
      repositories(null, { ...emptyPool, candidates: [{ note: card("y"), sharedTagIds: [] }] })
    );
    expect(result.series).toBeNull();
    expect(result.related.map((r) => r.note.id)).toEqual(["y"]);
  });
});
