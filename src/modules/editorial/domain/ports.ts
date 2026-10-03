import type { PaginatedResult } from "@/types";
import type { RelatedCandidate } from "./related-notes";
import type { SeriesRecord } from "./series";
import type {
  Category,
  Collection,
  CollectionWithNotes,
  CreateCollectionInput,
  CreateNoteInput,
  FieldNote,
  FieldNoteInput,
  FieldNotesAdminResult,
  Note,
  NoteCard,
  NoteChapter,
  NoteRevision,
  SaveCollectionEntriesInput,
  Tag,
  UpdateNoteInput,
} from "./types";

export interface RelatedCandidatePool {
  tagNames: Record<string, string>;
  tagFrequency: Record<string, number>;
  publishedTotal: number;
  candidates: RelatedCandidate[];
}

export interface NotesPageQuery {
  page: number;
  pageSize: number;
  category?: NoteChapter;
}

export interface PublishedNoteRef {
  slug: string;
  updated_at: string;
  published_at: string | null;
}

export interface NoteRepository {
  findLatestPublished(limit: number): Promise<Note[]>;
  findPublishedPage(query: NotesPageQuery): Promise<PaginatedResult<Note>>;
  findPublishedBySlug(slug: string): Promise<Note | null>;
  findPublishedById(id: string): Promise<Note | null>;
  findPublishedRefs(): Promise<PublishedNoteRef[]>;
  toggleLike(slug: string, increment: boolean): Promise<number>;
  /** True when the notes table answers. An empty table still counts as reachable. */
  responds(): Promise<boolean>;
}

export interface NoteAdminRepository {
  findAllAdmin(): Promise<Note[]>;
  findByIdAdmin(id: string): Promise<Note | null>;
  findTitlesByIds(ids: string[]): Promise<Record<string, string>>;
  create(input: CreateNoteInput): Promise<Note>;
  update(id: string, input: UpdateNoteInput): Promise<Note>;
  delete(id: string): Promise<boolean>;
}

export interface NoteRevisionRepository {
  createSnapshot(
    note: Pick<
      Note,
      "id" | "title" | "excerpt" | "content" | "cover_image" | "category" | "status"
    >,
    savedByClerkId?: string | null
  ): Promise<void>;
  findForNote(noteId: string, limit?: number): Promise<NoteRevision[]>;
  findById(id: string): Promise<NoteRevision | null>;
}

export interface TagRepository {
  findAll(): Promise<Tag[]>;
  findBySlug(slug: string): Promise<Tag | null>;
  findForNote(noteId: string): Promise<Tag[]>;
  findNotesByTagPage(
    tagSlug: string,
    query: { page: number; pageSize: number }
  ): Promise<PaginatedResult<NoteCard>>;
  /** Published notes worth scoring as related to this one, plus the tag statistics to score them. */
  findRelatedCandidates(noteId: string, category: string): Promise<RelatedCandidatePool>;
  create(name: string): Promise<Tag>;
  delete(id: string): Promise<void>;
  setNoteTags(noteId: string, tagIds: string[]): Promise<void>;
  findCategories(): Promise<Category[]>;
}

export interface CollectionRepository {
  findAllPublished(): Promise<Collection[]>;
  findPublishedBySlug(slug: string): Promise<CollectionWithNotes | null>;
  findAllAdmin(): Promise<Collection[]>;
  findByIdAdmin(id: string): Promise<CollectionWithNotes | null>;
  create(input: CreateCollectionInput): Promise<Collection>;
  update(id: string, input: Partial<CreateCollectionInput>): Promise<Collection>;
  delete(id: string): Promise<void>;
  /** Replaces kind and ordered entries in one transaction. */
  saveEntries(collectionId: string, input: SaveCollectionEntriesInput): Promise<void>;
  /** The published series containing this note, with entries readers can see. */
  findSeriesForNote(noteId: string): Promise<SeriesRecord | null>;
}

export interface FieldNoteRepository {
  findPublished(limit?: number): Promise<FieldNote[]>;
  findAllAdmin(): Promise<FieldNotesAdminResult>;
  create(input: FieldNoteInput): Promise<FieldNote>;
  update(id: string, input: Partial<FieldNoteInput>): Promise<FieldNote>;
  delete(id: string): Promise<void>;
}
