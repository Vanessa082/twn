"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { canModerateSharedPages } from "@/lib/auth/policies";
import {
  enforceRateLimit,
  isBotSubmission,
  isDuplicateSubmission,
} from "@/lib/security/submission-protection";
import { recordAuditLog } from "@/platform/audit/audit-log";
import {
  deleteSharedPageAdmin,
  submitSharedPage,
  updateSharedPageStatusAdmin,
} from "@/lib/services/shared-pages";
import { buildSharedPageSlug } from "@/lib/utils/shared-page-slug";
import { submitSharedPageSchema } from "@/lib/validation/schemas";
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
  content: string,
  honeypot?: string
) {
  try {
    // 1. Honeypot Check
    if (isBotSubmission(honeypot)) {
      return { success: true, data: null, error: null };
    }

    // 2. Rate Limiting (max 3 submissions per 10 min)
    const rateLimit = await enforceRateLimit("submit_shared_page", 3);
    if (!rateLimit.success) {
      return { success: false, data: null, error: rateLimit.error! };
    }

    // 3. Duplicate Suppression
    if (await isDuplicateSubmission(content)) {
      return {
        success: false,
        data: null,
        error: "You have already submitted this reflection recently.",
      };
    }

    const validated = submitSharedPageSchema.parse({ authorName, title, content });
    const page = await submitSharedPage(
      validated.authorName,
      validated.title ?? null,
      validated.content
    );
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
      userFriendlyError = "Something went wrong on our end. Please try again in a few moments.";
    } else if (
      userFriendlyError.toLowerCase().includes("row-level security") ||
      userFriendlyError.toLowerCase().includes("violates") ||
      userFriendlyError.toLowerCase().includes("policy")
    ) {
      userFriendlyError = "We couldn't save your note right now. Please try again in a moment.";
    }
    return { success: false, data: null, error: userFriendlyError };
  }
}

export async function moderateSharedPageAction(id: string, status: ModerationStatus) {
  try {
    const { userId } = await canModerateSharedPages();
    const page = await updateSharedPageStatusAdmin(id, status);

    await recordAuditLog({
      userId,
      action: `shared_page.${status}`,
      targetType: "shared_page",
      targetId: page.id,
      details: { author_name: page.author_name, status },
    });

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
    const { userId } = await canModerateSharedPages();
    await deleteSharedPageAdmin(id);

    await recordAuditLog({
      userId,
      action: "shared_page.deleted",
      targetType: "shared_page",
      targetId: id,
    });

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
