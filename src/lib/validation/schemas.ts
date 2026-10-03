import { PROJECT_STATUSES } from "@/modules/workbench/contracts";
import { z } from "zod";

/**
 * Centralized Validation Schemas (Milestone 2.3)
 * Every write operation MUST validate input on the server using these schemas.
 */

export const entityIdSchema = z.string().uuid("Invalid record identifier.");

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD.")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Date is invalid.");

export const safeHttpUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .refine((value) => {
    if (!URL.canParse(value)) return false;
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "Links must start with http:// or https://");

// ── 1. Margin Notes (Reader Comments) ────────────────────────────────────────

export const submitMarginNoteSchema = z.object({
  noteId: z.string().uuid("Invalid note ID format."),
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

// ── 3. Notes (CMS) ─────────────────────────────────────────────────────────

export const noteChapterEnum = z.enum([
  "technology",
  "leadership",
  "learning",
  "community",
  "reflections",
]);

export const createNoteSchema = z
  .object({
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
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain lowercase letters, numbers and single hyphens."
      ),
    excerpt: z
      .string()
      .trim()
      .min(10, "Excerpt must be at least 10 characters.")
      .max(500, "Excerpt cannot exceed 500 characters."),
    content: z
      .string()
      .trim()
      .min(20, "Note content must be at least 20 characters.")
      .max(200_000, "Note content is too large."),
    category: noteChapterEnum.default("technology"),
    status: z.enum(["draft", "published", "scheduled"]).default("draft"),
    cover_image: safeHttpUrlSchema.nullable().optional(),
    published_at: z
      .string()
      .datetime("Publication date is invalid.")
      .nullable()
      .optional()
      .default(null),
    seo_title: z
      .string()
      .trim()
      .max(70, "SEO title cannot exceed 70 characters.")
      .nullable()
      .optional(),
    seo_description: z
      .string()
      .trim()
      .max(320, "SEO description cannot exceed 320 characters.")
      .nullable()
      .optional(),
    og_image: safeHttpUrlSchema.nullable().optional(),
    canonical_url: safeHttpUrlSchema.nullable().optional(),
  })
  .strict();

export const updateNoteSchema = createNoteSchema.partial();

// ── 4. Notebook Entries ──────────────────────────────────────────────────────

export const createNotebookEntrySchema = z
  .object({
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
    slug: z
      .string()
      .trim()
      .max(255)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain lowercase letters, numbers and dashes."
      )
      .nullable()
      .optional()
      .default(null),
    notebook_id: entityIdSchema.optional().default("00000000-0000-0000-0000-000000000000"),
    source_article_id: entityIdSchema.nullable().optional().default(null),
    display_date: calendarDateSchema.nullable().optional().default(null),
    is_active: z.boolean().default(true),
    priority: z.number().int().min(0).max(100).default(0),
  })
  .strict();

export const updateNotebookEntrySchema = createNotebookEntrySchema.partial();

// ── 5. Workbench Projects ────────────────────────────────────────────────────

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} cannot exceed ${max} characters.`)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null));

const optionalUrl = z
  .union([safeHttpUrlSchema, z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);

export const projectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required.")
      .max(120, "Name cannot exceed 120 characters."),
    category: z
      .string()
      .trim()
      .min(2, "Category is required.")
      .max(60, "Category cannot exceed 60 characters."),
    status: z.enum(PROJECT_STATUSES),
    overview: z
      .string()
      .trim()
      .min(10, "Say what the project is in at least 10 characters.")
      .max(600, "Overview cannot exceed 600 characters."),
    why_started: optionalText(800, "Why I started"),
    what_im_learning: optionalText(800, "What I'm learning"),
    stack: z
      .array(z.string().trim().min(1).max(40))
      .max(12, "Keep the stack to 12 items or fewer."),
    url: optionalUrl,
    is_published: z.boolean(),
    display_order: z.number().int().min(0).max(999),
  })
  .strict();

export const updateProjectSchema = projectSchema.partial();

// ── 6. Field Notes ───────────────────────────────────────────────────────────

export const fieldNoteSchema = z
  .object({
    note_number: z
      .string()
      .trim()
      .min(1, "Note number is required.")
      .max(10, "Note number cannot exceed 10 characters."),
    tag: z.string().trim().min(2, "Tag is required.").max(60, "Tag cannot exceed 60 characters."),
    headline: z
      .string()
      .trim()
      .min(4, "Headline is required.")
      .max(160, "Headline cannot exceed 160 characters."),
    body: z
      .string()
      .trim()
      .min(20, "A field note needs at least a sentence or two.")
      .max(2400, "Field notes are short. Keep the body under 2400 characters."),
    is_published: z.boolean(),
    display_order: z.number().int().min(0).max(999),
  })
  .strict();

export const updateFieldNoteSchema = fieldNoteSchema.partial();

// ── 6b. Collections & Series ─────────────────────────────────────────────────

export const collectionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title is required.")
      .max(255, "Title cannot exceed 255 characters."),
    slug: z
      .string()
      .trim()
      .max(255, "Slug cannot exceed 255 characters.")
      .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, "Slugs use lowercase letters, numbers and dashes.")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters.")
      .nullable()
      .optional(),
    cover_image: safeHttpUrlSchema.nullable().optional(),
    is_published: z.boolean().optional(),
  })
  .strict();

export const updateCollectionSchema = collectionSchema.partial();

export const COLLECTION_ENTRY_LABEL_MAX = 60;
export const COLLECTION_ENTRIES_MAX = 500;

export const collectionEntriesSchema = z
  .object({
    kind: z.enum(["collection", "series"]),
    entries: z
      .array(
        z
          .object({
            note_id: entityIdSchema,
            label: z
              .string()
              .trim()
              .max(
                COLLECTION_ENTRY_LABEL_MAX,
                `Labels cannot exceed ${COLLECTION_ENTRY_LABEL_MAX} characters.`
              )
              .nullable()
              .transform((label) => label || null),
          })
          .strict()
      )
      .max(COLLECTION_ENTRIES_MAX, `A collection can hold up to ${COLLECTION_ENTRIES_MAX} notes.`)
      .refine(
        (entries) => new Set(entries.map((entry) => entry.note_id)).size === entries.length,
        "Each note can appear only once."
      ),
  })
  .strict();

// ── 7. Homepage & Site Settings ──────────────────────────────────────────────

export const homepageSettingsSchema = z
  .object({
    featured_article_id: z
      .string()
      .uuid()
      .nullable()
      .or(z.literal("").transform(() => null)),
    volume_label: z.string().trim().min(1, "Volume label is required.").max(60),
    volume_subtitle: z.string().trim().max(120),
    volume_season: z.string().trim().max(60),
    hero_eyebrow: z.string().trim().max(120),
    hero_title: z.string().trim().min(2, "The hero needs a title.").max(160),
    hero_topics: z.array(z.string().trim().min(1).max(40)).max(8, "Keep it to 8 topics or fewer."),
    contact_email: z
      .string()
      .trim()
      .nullable()
      .transform((value) => (value ? value : null))
      .refine((value) => value === null || z.string().email().safeParse(value).success, {
        message: "Contact email must be a valid address.",
      }),
    location: optionalText(120, "Location"),
    social_links: z
      .array(
        z
          .object({
            label: z.string().trim().min(1, "Each link needs a label.").max(40),
            url: safeHttpUrlSchema,
          })
          .strict()
      )
      .max(6, "Keep social links to 6 or fewer."),
  })
  .strict();

// ── 8. About Page ────────────────────────────────────────────────────────────

const requiredEditorialText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const assetUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.startsWith("/") || safeHttpUrlSchema.safeParse(value).success,
    "Use a site-relative path or a valid http(s) URL."
  );

export const aboutDataSchema = z
  .object({
    hero: z
      .object({
        title: requiredEditorialText("Name", 120),
        tagline: requiredEditorialText("Tagline", 160),
        lead: requiredEditorialText("Lead", 300),
        story: z.array(requiredEditorialText("Story paragraph", 1500)).max(12),
        roles: z
          .array(
            z
              .object({
                label: requiredEditorialText("Role", 80),
                sub: requiredEditorialText("Role description", 200),
              })
              .strict()
          )
          .max(12),
        image_url: z.union([z.literal(""), assetUrlSchema]),
        image_alt: z.string().trim().max(250, "Portrait description is too long."),
        image_caption: z.string().trim().max(200),
        image_location: z.string().trim().max(60, "Portrait location is too long."),
      })
      .strict(),
    short_version: z
      .object({
        heading: requiredEditorialText("Short-version heading", 240),
        body: requiredEditorialText("Short-version body", 1200),
      })
      .strict(),
    timeline: z
      .array(
        z
          .object({
            period: requiredEditorialText("Timeline period", 60),
            title: requiredEditorialText("Timeline title", 160),
            detail: requiredEditorialText("Timeline detail", 800),
          })
          .strict()
      )
      .max(30),
    projects: z
      .array(
        z
          .object({
            name: requiredEditorialText("Project name", 120),
            desc: requiredEditorialText("Project description", 800),
            tag: requiredEditorialText("Project tag", 60),
            link: safeHttpUrlSchema.optional(),
          })
          .strict()
      )
      .max(20),
    open_knowledge: z
      .object({
        heading: requiredEditorialText("Open-knowledge heading", 240),
        lead: requiredEditorialText("Open-knowledge lead", 1200),
        quote: requiredEditorialText("Open-knowledge quote", 800),
        closing: z.string().trim().max(800),
        topics: z.array(requiredEditorialText("Open-knowledge topic", 120)).max(20),
      })
      .strict(),
    manifesto: z
      .object({
        quote: requiredEditorialText("Manifesto quote", 800),
        body: requiredEditorialText("Manifesto body", 1600),
        closing: z.string().trim().max(400),
      })
      .strict(),
    currently: z
      .array(
        z
          .object({
            verb: requiredEditorialText("Current focus", 80),
            detail: requiredEditorialText("Current-focus detail", 400),
          })
          .strict()
      )
      .max(20),
    still_figuring_out: z
      .array(
        z
          .object({
            question: requiredEditorialText("Question", 300),
            reflection: requiredEditorialText("Reflection", 1600),
            tag: z.string().trim().max(80).optional(),
          })
          .strict()
      )
      .max(20),
    identity_stages: z
      .array(
        z
          .object({
            number: requiredEditorialText("Version number", 10),
            role: requiredEditorialText("Version role", 100),
            description: requiredEditorialText("Version description", 600),
          })
          .strict()
      )
      .max(20),
    closing: z.object({ quote: requiredEditorialText("Closing quote", 800) }).strict(),
    section_visibility: z
      .object({
        hero: z.boolean(),
        short_version: z.boolean(),
        timeline: z.boolean(),
        projects: z.boolean(),
        open_knowledge: z.boolean(),
        manifesto: z.boolean(),
        currently: z.boolean(),
        still_figuring_out: z.boolean(),
        closing: z.boolean(),
        identity_stages: z.boolean(),
      })
      .strict(),
    updated_at: z.string().datetime().optional(),
  })
  .strict();

// ── 9. Newsletter Subscription ───────────────────────────────────────────────

export const subscribeNewsletterSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  source: z.string().trim().optional().default("website"),
});
