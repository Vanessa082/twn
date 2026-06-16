"use server";

import {
  createArticleAdmin,
  updateArticleAdmin,
  deleteArticleAdmin,
} from "@/lib/services/articles";
import { revalidatePath } from "next/cache";
import type { CreateArticleInput, UpdateArticleInput } from "@/types";

/**
 * Server Action to handle article creation.
 */
export async function createArticleAction(input: CreateArticleInput) {
  try {
    const article = await createArticleAdmin(input);
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/articles");
    return { success: true, data: article, error: null };
  } catch (error: any) {
    console.error("[createArticleAction] Error:", error.message);
    return { success: false, data: null, error: error.message || "Failed to create article" };
  }
}

/**
 * Server Action to handle article updates.
 */
export async function updateArticleAction(id: string, input: UpdateArticleInput) {
  try {
    const article = await updateArticleAdmin(id, input);
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/admin/articles");
    return { success: true, data: article, error: null };
  } catch (error: any) {
    console.error("[updateArticleAction] Error:", error.message);
    return { success: false, data: null, error: error.message || "Failed to update article" };
  }
}

/**
 * Server Action to handle article deletion.
 */
export async function deleteArticleAction(id: string) {
  try {
    await deleteArticleAdmin(id);
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/articles");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("[deleteArticleAction] Error:", error.message);
    return { success: false, error: error.message || "Failed to delete article" };
  }
}
