export type NoteStatus = "draft" | "published" | "scheduled";

export type NoteChapter =
  | "technology"
  | "leadership"
  | "learning"
  | "community"
  | "reflections";

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

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  note_id: string;
  position: number;
  note: NoteCard;
}

export interface CollectionWithNotes extends Collection {
  items: CollectionItem[];
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
