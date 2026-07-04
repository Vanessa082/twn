"use server";

import {
  deleteSharedPageAdmin,
  submitSharedPage,
  updateSharedPageStatusAdmin,
} from "@/lib/services/shared-pages";
import type { ModerationStatus } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Action: Visitor submits a reflection.
 * Defaults status to 'pending'.
 */
export async function submitSharedPageAction(
  authorName: string,
  title: string | null,
  content: string
) {
  try {
    const page = await submitSharedPage(authorName, title, content);
    revalidatePath("/");
    revalidatePath("/admin/content/shared-pages");
    return { success: true, data: page, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[submitSharedPageAction] Error:", err.message);
    return { success: false, data: null, error: err.message || "Failed to submit reflection." };
  }
}

/**
 * Action: Admin updates moderation status (approved/rejected).
 */
export async function moderateSharedPageAction(id: string, status: ModerationStatus) {
  try {
    const page = await updateSharedPageStatusAdmin(id, status);
    revalidatePath("/");
    revalidatePath("/admin/content/shared-pages");
    return { success: true, data: page, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[moderateSharedPageAction] Error:", err.message);
    return { success: false, data: null, error: err.message || "Failed to update moderation status." };
  }
}

/**
 * Action: Admin deletes a shared page submission.
 */
export async function deleteSharedPageAction(id: string) {
  try {
    await deleteSharedPageAdmin(id);
    revalidatePath("/");
    revalidatePath("/admin/content/shared-pages");
    return { success: true, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[deleteSharedPageAction] Error:", err.message);
    return { success: false, error: err.message || "Failed to delete submission." };
  }
}
