import { describe, expect, it } from "vitest";
import {
  submitMarginNoteSchema,
  submitSharedPageSchema,
  subscribeNewsletterSchema,
} from "./schemas";

describe("Validation Schemas", () => {
  describe("submitMarginNoteSchema", () => {
    it("validates correct margin note", () => {
      const valid = submitMarginNoteSchema.safeParse({
        articleId: "123e4567-e89b-12d3-a456-426614174000",
        authorName: "Vanessa",
        content: "This is a thoughtful margin note on engineering architecture.",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects short content or author", () => {
      const invalid = submitMarginNoteSchema.safeParse({
        articleId: "invalid-uuid",
        authorName: "A",
        content: "Hi",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("submitSharedPageSchema", () => {
    it("validates reflective shared page content", () => {
      const valid = submitSharedPageSchema.safeParse({
        authorName: "Tech Woman",
        title: "A reflection on learning",
        content:
          "Today I documented how system design choices compound over time. Writing is documentation and documentation is leadership.",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects reflections under 10 words", () => {
      const invalid = submitSharedPageSchema.safeParse({
        authorName: "Tech Woman",
        title: null,
        content: "Too short to be a reflective thought.",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("subscribeNewsletterSchema", () => {
    it("accepts valid email", () => {
      expect(subscribeNewsletterSchema.safeParse({ email: "reader@twn.com" }).success).toBe(true);
    });

    it("rejects invalid email", () => {
      expect(subscribeNewsletterSchema.safeParse({ email: "invalid-email" }).success).toBe(false);
    });
  });
});
