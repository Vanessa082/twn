import type { MarginNote, ModerationStatus, SharedPage } from "@/types";
import { describe, expect, it } from "vitest";

/**
 * Pure state machine transition helper mirroring DB moderation logic for unit verification.
 */
function transitionModerationState<T extends { status: ModerationStatus; published_at?: string | null }>(
  item: T,
  newStatus: ModerationStatus,
  nowIso = new Date().toISOString()
): T {
  return {
    ...item,
    status: newStatus,
    published_at: newStatus === "approved" ? nowIso : item.published_at ?? null,
  };
}

describe("Moderation Lifecycle State Machine", () => {
  const initialSharedPage: SharedPage = {
    id: "sp-101",
    author_name: "Vanessa",
    title: "Learning Software Engineering",
    content: "Building real software requires systematic discipline and clean architecture.",
    word_count: 9,
    status: "pending",
    submitted_at: "2026-07-24T10:00:00Z",
    published_at: null,
    updated_at: "2026-07-24T10:00:00Z",
  };

  const initialMarginNote: MarginNote = {
    id: "mn-202",
    article_id: "art-1",
    author_name: "Tech Reader",
    content: "Great explanation of server vs client component boundaries!",
    status: "pending",
    display_order: 999,
    submitted_at: "2026-07-24T10:00:00Z",
    published_at: null,
    updated_at: "2026-07-24T10:00:00Z",
  };

  it("transitions pending shared page to approved and sets published_at timestamp", () => {
    const approved = transitionModerationState(initialSharedPage, "approved", "2026-07-24T12:00:00Z");
    expect(approved.status).toBe("approved");
    expect(approved.published_at).toBe("2026-07-24T12:00:00Z");
  });

  it("transitions pending shared page to rejected without setting published_at", () => {
    const rejected = transitionModerationState(initialSharedPage, "rejected", "2026-07-24T12:00:00Z");
    expect(rejected.status).toBe("rejected");
    expect(rejected.published_at).toBeNull();
  });

  it("moderates margin notes correctly", () => {
    const approvedNote = transitionModerationState(initialMarginNote, "approved");
    expect(approvedNote.status).toBe("approved");

    const rejectedNote = transitionModerationState(initialMarginNote, "rejected");
    expect(rejectedNote.status).toBe("rejected");
  });
});
