"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createEntryAdmin,
  deleteEntryAdmin,
  updateEntryAdmin,
} from "@/lib/services/notebook-entries";
import type { NotebookEntry } from "@/types";
import { revalidatePath } from "next/cache";

export async function createEntryAction(
  input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">
) {
  try {
    await requireAdmin();
    const entry = await createEntryAdmin(input);
    revalidatePath("/");
    revalidatePath("/admin/content/notebook");
    return { success: true, data: entry, error: null };
  } catch (error: unknown) {
    console.error("[createEntryAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to create entry",
    };
  }
}

export async function updateEntryAction(
  id: string,
  input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>
) {
  try {
    await requireAdmin();
    const entry = await updateEntryAdmin(id, input);
    revalidatePath("/");
    revalidatePath("/admin/content/notebook");
    return { success: true, data: entry, error: null };
  } catch (error: unknown) {
    console.error("[updateEntryAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update entry",
    };
  }
}

export async function deleteEntryAction(id: string) {
  try {
    await requireAdmin();
    await deleteEntryAdmin(id);
    revalidatePath("/");
    revalidatePath("/admin/content/notebook");
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteEntryAction] Error:", toAdminActionError(error));
    return { success: false, error: toAdminActionError(error) || "Failed to delete entry" };
  }
}
