import { z } from "zod";
import { SEARCH_DOC_TYPES } from "./engine";

/** Shared by the API route and the /search page so both reject the same input. */
export const searchQuerySchema = z.object({
  q: z.string().trim().max(120, "Searches are limited to 120 characters.").optional().default(""),
  type: z.enum(SEARCH_DOC_TYPES).optional().catch(undefined),
  limit: z.coerce.number().int().min(1).max(50).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(500).optional().default(1).catch(1),
});

export const SEARCH_RESULTS_PER_PAGE = 10;

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const SEARCH_TYPE_LABELS = {
  note: "Notes",
  field_note: "Field notes",
  project: "Workbench",
  collection: "Collections",
  topic: "Topics",
  shared_page: "Shared pages",
} as const;

export const SEARCH_TYPE_SINGULAR = {
  note: "Note",
  field_note: "Field note",
  project: "Project",
  collection: "Collection",
  topic: "Topic",
  shared_page: "Shared page",
} as const;
