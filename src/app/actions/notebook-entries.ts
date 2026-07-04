"use server";

import {
  createEntryAdmin,
  deleteEntryAdmin,
  updateEntryAdmin,
} from "@/lib/services/notebook-entries";
import type { NotebookEntry } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Server Action to handle notebook entry creation.
 */
export async function createEntryAction(
  input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">
) {
  try {
    const entry = await createEntryAdmin(input);
    revalidatePath("/");
    revalidatePath("/admin/content/notebook");
    return { success: true, data: entry, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[createEntryAction] Error:", err.message);
    return { success: false, data: null, error: err.message || "Failed to create entry" };
  }
}

/**
 * Server Action to handle notebook entry updates.
 */
export async function updateEntryAction(
  id: string,
  input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>
) {
  try {
    const entry = await updateEntryAdmin(id, input);
    revalidatePath("/");
    revalidatePath("/admin/content/notebook");
    return { success: true, data: entry, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[updateEntryAction] Error:", err.message);
    return { success: false, data: null, error: err.message || "Failed to update entry" };
  }
}

/**
 * Server Action to handle notebook entry deletion.
 */
export async function deleteEntryAction(id: string) {
  try {
    await deleteEntryAdmin(id);
    revalidatePath("/");
    revalidatePath("/admin/content/notebook");
    return { success: true, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[deleteEntryAction] Error:", err.message);
    return { success: false, error: err.message || "Failed to delete entry" };
  }
}
