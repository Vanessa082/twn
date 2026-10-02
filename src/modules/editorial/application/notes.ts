import type { PaginatedResult } from "@/types";
import type { NoteAdminRepository, NoteRepository, NotesPageQuery } from "../domain/ports";
import type { CreateNoteInput, Note, UpdateNoteInput } from "../domain/types";

export async function getLatestNotes(limit: number, repository: NoteRepository): Promise<Note[]> {
  return repository.findLatestPublished(limit);
}

export async function getPublishedNotesPage(
  query: NotesPageQuery,
  repository: NoteRepository
): Promise<PaginatedResult<Note>> {
  return repository.findPublishedPage(query);
}

export async function getNoteBySlug(
  slug: string,
  repository: NoteRepository
): Promise<Note | null> {
  return repository.findPublishedBySlug(slug);
}

export async function getPublishedNoteById(
  id: string,
  repository: NoteRepository
): Promise<Note | null> {
  return repository.findPublishedById(id);
}

export async function getPublishedNoteRefs(repository: NoteRepository) {
  return repository.findPublishedRefs();
}

export async function toggleNoteLike(
  slug: string,
  increment: boolean,
  repository: NoteRepository
): Promise<number> {
  return repository.toggleLike(slug, increment);
}

export async function getAllNotesAdmin(repository: NoteAdminRepository): Promise<Note[]> {
  return repository.findAllAdmin();
}

export async function getNoteByIdAdmin(
  id: string,
  repository: NoteAdminRepository
): Promise<Note | null> {
  return repository.findByIdAdmin(id);
}

export async function createNoteAdmin(
  input: CreateNoteInput,
  repository: NoteAdminRepository
): Promise<Note> {
  return repository.create(input);
}

export async function updateNoteAdmin(
  id: string,
  input: UpdateNoteInput,
  repository: NoteAdminRepository
): Promise<Note> {
  return repository.update(id, input);
}

export async function deleteNoteAdmin(
  id: string,
  repository: NoteAdminRepository
): Promise<boolean> {
  return repository.delete(id);
}

export async function getNoteTitlesByIds(
  ids: string[],
  repository: NoteAdminRepository
): Promise<Record<string, string>> {
  return repository.findTitlesByIds(ids);
}

export async function notesStoreResponds(repository: NoteRepository): Promise<boolean> {
  return repository.responds();
}
