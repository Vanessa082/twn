import type { PaginatedResult } from "@/types";
import type { TagRepository } from "../domain/ports";
import type { Category, NoteCard, Tag } from "../domain/types";

export async function getAllTags(repository: TagRepository): Promise<Tag[]> {
  return repository.findAll();
}

export async function getTagBySlug(
  slug: string,
  repository: TagRepository
): Promise<Tag | null> {
  return repository.findBySlug(slug);
}

export async function getTagsForNote(
  noteId: string,
  repository: TagRepository
): Promise<Tag[]> {
  return repository.findForNote(noteId);
}

export async function getNotesByTagPage(
  tagSlug: string,
  query: { page: number; pageSize: number },
  repository: TagRepository
): Promise<PaginatedResult<NoteCard>> {
  return repository.findNotesByTagPage(tagSlug, query);
}

export async function getRelatedNotes(
  noteId: string,
  category: string,
  limit: number,
  repository: TagRepository
): Promise<NoteCard[]> {
  return repository.findRelatedNotes(noteId, category, limit);
}

export async function createTagAdmin(name: string, repository: TagRepository): Promise<Tag> {
  return repository.create(name);
}

export async function deleteTagAdmin(id: string, repository: TagRepository): Promise<void> {
  return repository.delete(id);
}

export async function setNoteTagsAdmin(
  noteId: string,
  tagIds: string[],
  repository: TagRepository
): Promise<void> {
  return repository.setNoteTags(noteId, tagIds);
}

export async function getCategories(repository: TagRepository): Promise<Category[]> {
  return repository.findCategories();
}
