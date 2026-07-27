import type { ModerationStatus, SharedPage } from "@/types";
import { FALLBACK_SHARED_PAGES } from "../domain/community-content";
import {
  type SharedPageRepository,
  SupabaseSharedPageRepository,
} from "../infrastructure/shared-page-repository";

export async function getApprovedSharedPages(
  repository: SharedPageRepository = new SupabaseSharedPageRepository()
): Promise<SharedPage[]> {
  try {
    const pages = await repository.findAllApproved();
    return pages.length > 0 ? pages : FALLBACK_SHARED_PAGES;
  } catch {
    return FALLBACK_SHARED_PAGES;
  }
}

export async function getApprovedSharedPageBySlug(
  slug: string,
  repository: SharedPageRepository = new SupabaseSharedPageRepository()
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
  repository: SharedPageRepository = new SupabaseSharedPageRepository()
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
  repository: SharedPageRepository = new SupabaseSharedPageRepository()
): Promise<SharedPage[]> {
  return repository.findAllAdmin();
}

export async function updateSharedPageStatusAdmin(
  id: string,
  status: ModerationStatus,
  repository: SharedPageRepository = new SupabaseSharedPageRepository()
): Promise<SharedPage> {
  if (!id) throw new Error("ID is required");
  return repository.updateStatus(id, status);
}

export async function deleteSharedPageAdmin(
  id: string,
  repository: SharedPageRepository = new SupabaseSharedPageRepository()
): Promise<boolean> {
  if (!id) throw new Error("ID is required");
  return repository.delete(id);
}
