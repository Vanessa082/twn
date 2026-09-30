import { describe, expect, it } from "vitest";

/**
 * Mirrors shared-page word-count rules from the service layer for unit testing
 * without hitting Supabase.
 */
function validateSharedPageContent(content: string | null | undefined): {
  ok: boolean;
  wordCount: number;
  error: string | null;
} {
  if (content == null || typeof content !== "string") {
    return { ok: false, wordCount: 0, error: "Content cannot be empty." };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { ok: false, wordCount: 0, error: "Content cannot be empty." };
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) {
    return {
      ok: false,
      wordCount,
      error: "Shared thoughts should be reflective (minimum 10 words).",
    };
  }
  if (wordCount > 300) {
    return {
      ok: false,
      wordCount,
      error: "Shared thoughts must not exceed 300 words to maintain notebook layout.",
    };
  }

  return { ok: true, wordCount, error: null };
}

describe("validateSharedPageContent", () => {
  it("accepts reflective content in range", () => {
    const content = "Today I almost quit software engineering but I chose to stay and learn.";
    const result = validateSharedPageContent(content);
    expect(result.ok).toBe(true);
    expect(result.wordCount).toBeGreaterThanOrEqual(10);
    expect(result.error).toBeNull();
  });

  it("rejects empty content", () => {
    expect(validateSharedPageContent("").ok).toBe(false);
    expect(validateSharedPageContent(null).ok).toBe(false);
  });

  it("rejects too-short reflections", () => {
    const result = validateSharedPageContent("Too short still.");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/minimum 10 words/i);
  });
});
