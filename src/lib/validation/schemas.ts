import { z } from "zod";

/**
 * Centralized Validation Schemas (Milestone 2.3)
 * Every write operation MUST validate input on the server using these schemas.
 */

// ── 1. Margin Notes (Reader Comments) ────────────────────────────────────────

export const submitMarginNoteSchema = z.object({
  articleId: z.string().uuid("Invalid article ID format."),
  authorName: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters.")
    .max(80, "Author name cannot exceed 80 characters."),
  content: z
    .string()
    .trim()
    .min(5, "Margin note must be at least 5 characters.")
    .max(1000, "Margin note cannot exceed 1000 characters."),
});

// ── 2. Shared Pages (Community Reflections) ──────────────────────────────────

export const submitSharedPageSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters.")
    .max(80, "Author name cannot exceed 80 characters."),
  title: z.string().trim().max(120, "Title cannot exceed 120 characters.").nullable().optional(),
  content: z
    .string()
    .trim()
    .refine((val) => {
      const words = val.split(/\s+/).filter(Boolean).length;
      return words >= 10;
    }, "Shared thoughts should be reflective (minimum 10 words).")
    .refine((val) => {
      const words = val.split(/\s+/).filter(Boolean).length;
      return words <= 300;
    }, "Shared thoughts must not exceed 300 words to maintain notebook layout."),
});

// ── 3. Articles (CMS) ─────────────────────────────────────────────────────────

export const articleCategoryEnum = z.enum([
  "technology",
  "leadership",
  "learning",
  "community",
  "reflections",
]);

export const createArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title cannot exceed 200 characters."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(200, "Slug cannot exceed 200 characters.")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  excerpt: z
    .string()
    .trim()
    .min(10, "Excerpt must be at least 10 characters.")
    .max(500, "Excerpt cannot exceed 500 characters."),
  content: z.string().trim().min(20, "Article content must be at least 20 characters."),
  category: articleCategoryEnum.default("technology"),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  cover_image: z.string().url("Invalid image URL.").nullable().optional(),
  published_at: z.string().nullable().optional().default(null),
  display_date: z.string().nullable().optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

// ── 4. Notebook Entries (Hero rotation & Today's Page) ───────────────────────

export const createNotebookEntrySchema = z.object({
  thought: z
    .string()
    .trim()
    .min(5, "Thought must be at least 5 characters.")
    .max(500, "Thought cannot exceed 500 characters."),
  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters.")
    .nullable()
    .optional()
    .default(null),
  slug: z.string().nullable().optional().default(null),
  notebook_id: z.string().optional().default("00000000-0000-0000-0000-000000000000"),
  source_article_id: z.string().nullable().optional().default(null),
  display_date: z.string().nullable().optional().default(null),
  is_active: z.boolean().default(true),
  priority: z.number().default(0),
});

export const updateNotebookEntrySchema = createNotebookEntrySchema.partial();

// ── 5. Newsletter Subscription ───────────────────────────────────────────────

export const subscribeNewsletterSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  source: z.string().trim().optional().default("website"),
});
