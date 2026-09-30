import type { FieldNoteRepository } from "../domain/ports";
import type { FieldNote, FieldNoteInput, FieldNotesAdminResult } from "../domain/types";

export async function getPublishedFieldNotes(
  limit: number,
  repository: FieldNoteRepository
): Promise<FieldNote[]> {
  return repository.findPublished(limit);
}

export async function getAllFieldNotesAdmin(
  repository: FieldNoteRepository
): Promise<FieldNotesAdminResult> {
  return repository.findAllAdmin();
}

export async function createFieldNote(
  input: FieldNoteInput,
  repository: FieldNoteRepository
): Promise<FieldNote> {
  return repository.create(input);
}

export async function updateFieldNote(
  id: string,
  input: Partial<FieldNoteInput>,
  repository: FieldNoteRepository
): Promise<FieldNote> {
  return repository.update(id, input);
}

export async function deleteFieldNote(
  id: string,
  repository: FieldNoteRepository
): Promise<void> {
  return repository.delete(id);
}
