"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { toAdminActionError } from "@/lib/auth/admin-errors";
import {
  deleteSharedPageAdmin,
  submitSharedPage,
  updateSharedPageStatusAdmin,
} from "@/lib/services/shared-pages";
import { buildSharedPageSlug } from "@/lib/utils/shared-page-slug";
import type { ModerationStatus } from "@/types";
import { revalidatePath } from "next/cache";

function revalidateSharedPagePaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/community");
  revalidatePath("/admin/content/shared-pages");
  if (slug) revalidatePath(`/pages/${slug}`);
}

export async function submitSharedPageAction(
  authorName: string,
  title: string | null,
  content: string
) {
  try {
    const page = await submitSharedPage(authorName, title, content);
    revalidateSharedPagePaths();
    return { success: true, data: page, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[submitSharedPageAction] Error:", err.message);
    let userFriendlyError = err.message || "Failed to submit reflection.";
    if (
      userFriendlyError.includes("fetch failed") ||
      userFriendlyError.includes("TypeError") ||
      userFriendlyError.includes("failed to fetch")
    ) {
      userFriendlyError = "Unable to connect to the database right now. Please try again later.";
    }
    return { success: false, data: null, error: userFriendlyError };
  }
}

export async function moderateSharedPageAction(id: string, status: ModerationStatus) {
  try {
    await requireAdmin();
    const page = await updateSharedPageStatusAdmin(id, status);
    revalidateSharedPagePaths(buildSharedPageSlug(page));
    return { success: true, data: page, error: null };
  } catch (error: unknown) {
    console.error("[moderateSharedPageAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update moderation status.",
    };
  }
}

export async function deleteSharedPageAction(id: string) {
  try {
    await requireAdmin();
    await deleteSharedPageAdmin(id);
    revalidateSharedPagePaths();
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteSharedPageAction] Error:", toAdminActionError(error));
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to delete submission.",
    };
  }
}
