import { describe, expect, it } from "vitest";
import {
  createNoteSchema,
  entityIdSchema,
  fieldNoteSchema,
  homepageSettingsSchema,
  projectSchema,
  submitMarginNoteSchema,
  submitSharedPageSchema,
  subscribeNewsletterSchema,
} from "./schemas";

describe("Validation Schemas", () => {
  describe("createNoteSchema", () => {
    const note = {
      title: "A complete note",
      slug: "a-complete-note",
      excerpt: "A required introduction for Today’s Page and note lists.",
      content: "This is enough note content to pass validation.",
      category: "technology",
      status: "published",
      cover_image: "https://example.com/cover.jpg",
      published_at: "2026-09-30T08:00:00.000Z",
      seo_title: null,
      seo_description: null,
      og_image: null,
      canonical_url: null,
    };

    it("requires an editorial excerpt for every note", () => {
      expect(createNoteSchema.safeParse({ ...note, excerpt: "" }).success).toBe(false);
      expect(createNoteSchema.safeParse(note).success).toBe(true);
    });

    it("rejects unexpected fields and unsafe URLs", () => {
      expect(
        createNoteSchema.safeParse({ ...note, display_date: "2026-09-30" }).success
      ).toBe(false);
      expect(
        createNoteSchema.safeParse({ ...note, canonical_url: "javascript:alert(1)" }).success
      ).toBe(false);
    });
  });

  describe("submitMarginNoteSchema", () => {
    it("validates correct margin note", () => {
      const valid = submitMarginNoteSchema.safeParse({
        noteId: "123e4567-e89b-12d3-a456-426614174000",
        authorName: "Vanessa",
        content: "This is a thoughtful margin note on engineering architecture.",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects short content or author", () => {
      const invalid = submitMarginNoteSchema.safeParse({
        noteId: "invalid-uuid",
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

  describe("projectSchema", () => {
    const base = {
      name: "TWN",
      category: "Publishing",
      status: "Building",
      overview: "A digital notebook for a woman in tech.",
      why_started: "",
      what_im_learning: "  ",
      stack: ["Next.js"],
      url: "",
      is_published: true,
      display_order: 0,
    };

    it("normalises blank optional story fields to null", () => {
      const parsed = projectSchema.parse(base);
      expect(parsed.why_started).toBeNull();
      expect(parsed.what_im_learning).toBeNull();
      expect(parsed.url).toBeNull();
    });

    it("rejects unknown statuses and non-http links", () => {
      expect(projectSchema.safeParse({ ...base, status: "Done" }).success).toBe(false);
      expect(projectSchema.safeParse({ ...base, url: "javascript:alert(1)" }).success).toBe(false);
    });

    it("rejects unexpected fields", () => {
      expect(projectSchema.safeParse({ ...base, trusted: true }).success).toBe(false);
    });
  });

  describe("fieldNoteSchema", () => {
    it("requires a real body", () => {
      const result = fieldNoteSchema.safeParse({
        note_number: "001",
        tag: "Craft",
        headline: "Short",
        body: "Too short",
        is_published: false,
        display_order: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("homepageSettingsSchema", () => {
    const base = {
      featured_article_id: "",
      volume_label: "Vol. 01",
      volume_subtitle: "",
      volume_season: "September 2026",
      hero_eyebrow: "The Notebook of a Tech Woman",
      hero_title: "Notes from becoming.",
      hero_topics: ["Technology", "Life"],
      contact_email: "",
      location: "",
      social_links: [{ label: "GitHub", url: "https://github.com/Vanessa082" }],
    };

    it("treats an empty featured note as automatic", () => {
      const parsed = homepageSettingsSchema.parse(base);
      expect(parsed.featured_article_id).toBeNull();
      expect(parsed.contact_email).toBeNull();
    });

    it("rejects unsafe social link schemes", () => {
      const result = homepageSettingsSchema.safeParse({
        ...base,
        social_links: [{ label: "Bad", url: "javascript:alert(1)" }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("record identifiers", () => {
    it("accepts UUIDs and rejects arbitrary identifiers", () => {
      expect(entityIdSchema.safeParse("123e4567-e89b-12d3-a456-426614174000").success).toBe(true);
      expect(entityIdSchema.safeParse("project-1").success).toBe(false);
    });
  });
});
