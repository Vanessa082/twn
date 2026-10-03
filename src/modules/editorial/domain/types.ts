export type NoteStatus = "draft" | "published" | "scheduled";

export type NoteChapter = "technology" | "leadership" | "learning" | "community" | "reflections";

export interface Note {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: NoteChapter;
  status: NoteStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  reading_time?: number;
  likes_count?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
}

export interface NoteCard extends Omit<Note, "content"> {}

export interface CreateNoteInput
  extends Omit<Note, "id" | "created_at" | "updated_at" | "reading_time" | "likes_count"> {}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface NoteWithTags extends Note {
  tags: Tag[];
}

export interface NoteRevision {
  id: string;
  note_id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  status: string;
  saved_by_clerk_id: string | null;
  created_at: string;
}

/** A series is read in order and a note belongs to at most one; a collection is a loose, curated set. */
export type CollectionKind = "collection" | "series";

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  is_published: boolean;
  kind: CollectionKind;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  note_id: string;
  position: number;
  /** Free text such as "Part 1" or "Day 42". Null falls back to "Part N". */
  label: string | null;
  note: NoteCard;
}

export interface CollectionWithNotes extends Collection {
  items: CollectionItem[];
}

export interface CollectionEntryInput {
  note_id: string;
  label: string | null;
}

export interface SaveCollectionEntriesInput {
  kind: CollectionKind;
  entries: CollectionEntryInput[];
}

export interface SeriesEntry {
  label: string;
  note: NoteCard;
}

export interface SeriesNavigation {
  series: { title: string; slug: string };
  /** Label of the note being read, e.g. "Part 3" or "Day 42". */
  currentLabel: string;
  /** 1-based position among entries readers can see. */
  position: number;
  total: number;
  previous: SeriesEntry | null;
  next: SeriesEntry | null;
  /** Every visible entry in order, so related notes can tell series siblings apart. */
  entries: SeriesEntry[];
}

export type RelatedReason =
  | { kind: "tags"; tags: string[] }
  | { kind: "series"; title: string }
  | { kind: "chapter"; category: string };

export interface RelatedNote {
  note: NoteCard;
  reason: RelatedReason;
}

export interface NoteConnections {
  series: SeriesNavigation | null;
  related: RelatedNote[];
}

export interface CreateCollectionInput {
  title: string;
  slug?: string;
  description?: string | null;
  cover_image?: string | null;
  is_published?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: NoteChapter;
}

export interface FieldNote {
  id: string;
  note_number: string;
  tag: string;
  headline: string;
  body: string;
  is_published: boolean;
  display_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FieldNoteInput
  extends Omit<FieldNote, "id" | "published_at" | "created_at" | "updated_at"> {}

export interface FieldNotesAdminResult {
  notes: FieldNote[];
  tableReady: boolean;
}
