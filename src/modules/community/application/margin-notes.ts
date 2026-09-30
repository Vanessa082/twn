import { getNoteTitlesByIds } from "@/modules/editorial";
import type { MarginNoteRepository } from "../domain/ports";
import type { MarginNote, ModerationStatus } from "../domain/types";

export async function getApprovedMarginNotesForNote(
  noteId: string,
  repository: MarginNoteRepository
): Promise<MarginNote[]> {
  if (!noteId) return [];
  try {
    return await repository.findApprovedForNote(noteId);
  } catch {
    return [];
  }
}

export async function submitMarginNote(
  noteId: string,
  authorName: string,
  content: string,
  repository: MarginNoteRepository
): Promise<MarginNote> {
  const trimmedAuthor = authorName.trim() || "Anonymous";
  const trimmedContent = content.trim();

  if (!noteId) throw new Error("Note ID is required.");
  if (!trimmedContent) throw new Error("Reflection content cannot be empty.");
  if (trimmedContent.length > 120)
    throw new Error("Margin notes must be brief (maximum 120 characters).");

  return repository.insert(noteId, trimmedAuthor, trimmedContent);
}

export async function getAllMarginNotesAdmin(
  repository: MarginNoteRepository
): Promise<(MarginNote & { article_title?: string })[]> {
  const notes = await repository.findAllAdmin();
  const titles = await getNoteTitlesByIds(notes.map((note) => note.article_id));
  return notes.map((note) => ({
    ...note,
    article_title: titles[note.article_id] ?? "Unknown Note",
  }));
}

export async function updateMarginNoteStatusAdmin(
  id: string,
  status: ModerationStatus,
  repository: MarginNoteRepository
): Promise<MarginNote> {
  if (!id) throw new Error("ID is required");
  return repository.updateStatus(id, status);
}

export async function updateMarginNotePinAdmin(
  id: string,
  pinned: boolean,
  repository: MarginNoteRepository
): Promise<MarginNote> {
  if (!id) throw new Error("ID is required");
  return repository.updatePin(id, pinned);
}

export async function deleteMarginNoteAdmin(
  id: string,
  repository: MarginNoteRepository
): Promise<boolean> {
  if (!id) throw new Error("ID is required");
  return repository.delete(id);
}
