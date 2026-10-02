import type { NoteRevisionRepository } from "../domain/ports";
import type { Note, NoteRevision } from "../domain/types";

export async function createRevision(
  note: Pick<Note, "id" | "title" | "excerpt" | "content" | "cover_image" | "category" | "status">,
  savedByClerkId: string | null | undefined,
  repository: NoteRevisionRepository
): Promise<void> {
  return repository.createSnapshot(note, savedByClerkId);
}

export async function getRevisionsForNote(
  noteId: string,
  limit: number,
  repository: NoteRevisionRepository
): Promise<NoteRevision[]> {
  return repository.findForNote(noteId, limit);
}

export async function getRevisionById(
  id: string,
  repository: NoteRevisionRepository
): Promise<NoteRevision | null> {
  return repository.findById(id);
}
