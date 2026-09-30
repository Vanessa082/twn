import {
  createNoteAdmin as addNote,
  deleteNoteAdmin as removeNote,
  getAllNotesAdmin as loadNotesAdmin,
  getLatestNotes as loadLatestNotes,
  getNoteByIdAdmin as loadNoteByIdAdmin,
  getNoteBySlug as loadNoteBySlug,
  getNoteTitlesByIds as loadNoteTitles,
  getPublishedNoteById as loadPublishedNoteById,
  getPublishedNoteRefs as loadPublishedNoteRefs,
  getPublishedNotesPage as loadPublishedNotesPage,
  notesStoreResponds as checkNotesStore,
  toggleNoteLike as flipNoteLike,
  updateNoteAdmin as saveNote,
} from "./application/notes";
import {
  createCollectionAdmin as addCollection,
  deleteCollectionAdmin as removeCollection,
  getAllCollectionsAdmin as loadCollectionsAdmin,
  getCollectionByIdAdmin as loadCollectionByIdAdmin,
  getCollectionBySlug as loadCollectionBySlug,
  getPublicCollections as loadPublicCollections,
  setCollectionNotesAdmin as saveCollectionNotes,
  updateCollectionAdmin as saveCollection,
} from "./application/collections";
import {
  createFieldNote as addFieldNote,
  deleteFieldNote as removeFieldNote,
  getAllFieldNotesAdmin as loadFieldNotesAdmin,
  getPublishedFieldNotes as loadPublishedFieldNotes,
  updateFieldNote as saveFieldNote,
} from "./application/field-notes";
import {
  createRevision as addRevision,
  getRevisionById as loadRevisionById,
  getRevisionsForNote as loadRevisionsForNote,
} from "./application/revisions";
import {
  createTagAdmin as addTag,
  deleteTagAdmin as removeTag,
  getAllTags as loadAllTags,
  getCategories as loadCategories,
  getNotesByTagPage as loadNotesByTagPage,
  getRelatedNotes as loadRelatedNotes,
  getTagBySlug as loadTagBySlug,
  getTagsForNote as loadTagsForNote,
  setNoteTagsAdmin as saveNoteTags,
} from "./application/tags";
import type { NotesPageQuery } from "./domain/ports";
import type {
  CreateCollectionInput,
  CreateNoteInput,
  FieldNoteInput,
  Note,
  UpdateNoteInput,
} from "./domain/types";
import { SupabaseCollectionRepository } from "./infrastructure/collections";
import { SupabaseFieldNoteRepository } from "./infrastructure/field-notes";
import { SupabaseNoteRevisionRepository } from "./infrastructure/revisions";
import { SupabaseNoteAdminRepository } from "./infrastructure/supabase-note-admin-repository";
import { SupabaseNoteRepository } from "./infrastructure/supabase-note-repository";
import { SupabaseTagRepository } from "./infrastructure/tags";

function notes() {
  return new SupabaseNoteRepository();
}

function adminNotes() {
  return new SupabaseNoteAdminRepository();
}

function tags() {
  return new SupabaseTagRepository();
}

function collections() {
  return new SupabaseCollectionRepository();
}

function fieldNotes() {
  return new SupabaseFieldNoteRepository();
}

function revisions() {
  return new SupabaseNoteRevisionRepository();
}

export async function getLatestNotes(limit = 10) {
  return loadLatestNotes(limit, notes());
}

export async function getPublishedNotesPage(query: NotesPageQuery) {
  return loadPublishedNotesPage(query, notes());
}

export async function getNoteBySlug(slug: string) {
  return loadNoteBySlug(slug, notes());
}

export async function getPublishedNoteById(id: string) {
  return loadPublishedNoteById(id, notes());
}

export async function getPublishedNoteRefs() {
  return loadPublishedNoteRefs(notes());
}

export async function toggleNoteLike(slug: string, increment: boolean) {
  return flipNoteLike(slug, increment, notes());
}

export async function getAllNotesAdmin() {
  return loadNotesAdmin(adminNotes());
}

export async function getNoteByIdAdmin(id: string) {
  return loadNoteByIdAdmin(id, adminNotes());
}

export async function createNoteAdmin(input: CreateNoteInput) {
  return addNote(input, adminNotes());
}

export async function updateNoteAdmin(id: string, input: UpdateNoteInput) {
  return saveNote(id, input, adminNotes());
}

export async function deleteNoteAdmin(id: string) {
  return removeNote(id, adminNotes());
}

export async function getNoteTitlesByIds(ids: string[]) {
  return loadNoteTitles(ids, adminNotes());
}

export async function notesStoreResponds() {
  return checkNotesStore(notes());
}

export async function getAllTags() {
  return loadAllTags(tags());
}

export async function getTagBySlug(slug: string) {
  return loadTagBySlug(slug, tags());
}

export async function getTagsForNote(noteId: string) {
  return loadTagsForNote(noteId, tags());
}

export async function getNotesByTagPage(
  tagSlug: string,
  query: { page: number; pageSize: number }
) {
  return loadNotesByTagPage(tagSlug, query, tags());
}

export async function getRelatedNotes(noteId: string, category: string, limit = 3) {
  return loadRelatedNotes(noteId, category, limit, tags());
}

export async function createTagAdmin(name: string) {
  return addTag(name, tags());
}

export async function deleteTagAdmin(id: string) {
  return removeTag(id, tags());
}

export async function setNoteTagsAdmin(noteId: string, tagIds: string[]) {
  return saveNoteTags(noteId, tagIds, tags());
}

export async function getCategories() {
  return loadCategories(tags());
}

export async function getPublicCollections() {
  return loadPublicCollections(collections());
}

export async function getCollectionBySlug(slug: string) {
  return loadCollectionBySlug(slug, collections());
}

export async function getAllCollectionsAdmin() {
  return loadCollectionsAdmin(collections());
}

export async function getCollectionByIdAdmin(id: string) {
  return loadCollectionByIdAdmin(id, collections());
}

export async function createCollectionAdmin(input: CreateCollectionInput) {
  return addCollection(input, collections());
}

export async function updateCollectionAdmin(id: string, input: Partial<CreateCollectionInput>) {
  return saveCollection(id, input, collections());
}

export async function deleteCollectionAdmin(id: string) {
  return removeCollection(id, collections());
}

export async function setCollectionNotesAdmin(collectionId: string, noteIdsInOrder: string[]) {
  return saveCollectionNotes(collectionId, noteIdsInOrder, collections());
}

export async function createRevision(
  note: Pick<Note, "id" | "title" | "excerpt" | "content" | "cover_image" | "category" | "status">,
  savedByClerkId?: string | null
) {
  return addRevision(note, savedByClerkId, revisions());
}

export async function getRevisionsForNote(noteId: string, limit = 10) {
  return loadRevisionsForNote(noteId, limit, revisions());
}

export async function getRevisionById(id: string) {
  return loadRevisionById(id, revisions());
}

export async function getPublishedFieldNotes(limit = 3) {
  return loadPublishedFieldNotes(limit, fieldNotes());
}

export async function getAllFieldNotesAdmin() {
  return loadFieldNotesAdmin(fieldNotes());
}

export async function createFieldNote(input: FieldNoteInput) {
  return addFieldNote(input, fieldNotes());
}

export async function updateFieldNote(id: string, input: Partial<FieldNoteInput>) {
  return saveFieldNote(id, input, fieldNotes());
}

export async function deleteFieldNote(id: string) {
  return removeFieldNote(id, fieldNotes());
}

export { calculateReadingTime } from "./domain/reading-time";
export type {
  Category,
  Collection,
  CollectionItem,
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
  NoteStatus,
  Tag,
  UpdateNoteInput,
} from "./domain/types";
