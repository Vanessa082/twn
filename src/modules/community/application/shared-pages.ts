import type { SharedPageRepository } from "../domain/ports";
import type { ModerationStatus, SharedPage } from "../domain/types";

export async function getApprovedSharedPages(
  repository: SharedPageRepository
): Promise<SharedPage[]> {
  try {
    return await repository.findAllApproved();
  } catch {
    return [];
  }
}

export async function getApprovedSharedPageBySlug(
  slug: string,
  repository: SharedPageRepository
): Promise<SharedPage | null> {
  if (!slug || typeof slug !== "string") return null;
  const trimmed = slug.trim();
  if (!trimmed) return null;

  try {
    return repository.findBySlug(trimmed);
  } catch {
    return null;
  }
}

export async function submitSharedPage(
  authorName: string,
  title: string | null,
  content: string,
  repository: SharedPageRepository
): Promise<SharedPage> {
  const trimmedAuthor = authorName.trim() || "Anonymous";
  const trimmedTitle = title?.trim() || null;
  const trimmedContent = content.trim();

  if (!trimmedContent) throw new Error("Content cannot be empty.");

  const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) throw new Error("Shared thoughts should be reflective (minimum 10 words).");
  if (wordCount > 300)
    throw new Error("Shared thoughts must not exceed 300 words to maintain notebook layout.");

  return repository.insert(trimmedAuthor, trimmedTitle, trimmedContent, wordCount);
}

export async function getAllSharedPagesAdmin(
  repository: SharedPageRepository
): Promise<SharedPage[]> {
  return repository.findAllAdmin();
}

export async function updateSharedPageStatusAdmin(
  id: string,
  status: ModerationStatus,
  repository: SharedPageRepository
): Promise<SharedPage> {
  if (!id) throw new Error("ID is required");
  return repository.updateStatus(id, status);
}

export async function deleteSharedPageAdmin(
  id: string,
  repository: SharedPageRepository
): Promise<boolean> {
  if (!id) throw new Error("ID is required");
  return repository.delete(id);
}
