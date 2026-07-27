import type { MarginNote, ModerationStatus } from "@/types";
import { FALLBACK_MARGIN_NOTES } from "../domain/community-content";
import {
  type MarginNoteRepository,
  SupabaseMarginNoteRepository,
} from "../infrastructure/margin-note-repository";

export async function getApprovedMarginNotesForArticle(
  articleId: string,
  repository: MarginNoteRepository = new SupabaseMarginNoteRepository()
): Promise<MarginNote[]> {
  if (!articleId) return [];
  try {
    const notes = await repository.findApprovedForArticle(articleId);
    return notes;
  } catch {
    return FALLBACK_MARGIN_NOTES.map((n) => ({ ...n, article_id: articleId }));
  }
}

export async function submitMarginNote(
  articleId: string,
  authorName: string,
  content: string,
  repository: MarginNoteRepository = new SupabaseMarginNoteRepository()
): Promise<MarginNote> {
  const trimmedAuthor = authorName.trim() || "Anonymous";
  const trimmedContent = content.trim();

  if (!articleId) throw new Error("Article ID is required.");
  if (!trimmedContent) throw new Error("Reflection content cannot be empty.");
  if (trimmedContent.length > 120)
    throw new Error("Margin notes must be brief (maximum 120 characters).");

  return repository.insert(articleId, trimmedAuthor, trimmedContent);
}

export async function getAllMarginNotesAdmin(
  repository: MarginNoteRepository = new SupabaseMarginNoteRepository()
): Promise<(MarginNote & { article_title?: string })[]> {
  return repository.findAllAdmin();
}

export async function updateMarginNoteStatusAdmin(
  id: string,
  status: ModerationStatus,
  repository: MarginNoteRepository = new SupabaseMarginNoteRepository()
): Promise<MarginNote> {
  if (!id) throw new Error("ID is required");
  return repository.updateStatus(id, status);
}

export async function updateMarginNotePinAdmin(
  id: string,
  pinned: boolean,
  repository: MarginNoteRepository = new SupabaseMarginNoteRepository()
): Promise<MarginNote> {
  if (!id) throw new Error("ID is required");
  return repository.updatePin(id, pinned);
}

export async function deleteMarginNoteAdmin(
  id: string,
  repository: MarginNoteRepository = new SupabaseMarginNoteRepository()
): Promise<boolean> {
  if (!id) throw new Error("ID is required");
  return repository.delete(id);
}
