"use server";

import {
  createArticleAdmin,
  deleteArticleAdmin,
  updateArticleAdmin,
} from "@/lib/services/articles";
import { broadcastNewArticle } from "@/lib/services/subscribers";
import type { CreateArticleInput, UpdateArticleInput } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Server Action to handle article creation.
 */
export async function createArticleAction(input: CreateArticleInput) {
  try {
    const article = await createArticleAdmin(input);
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/articles");

    // Notify all subscribers when a new article is published.
    // Non-fatal: errors are caught inside broadcastNewArticle and never
    // block the response returned to the admin UI.
    if (article.status === "published") {
      broadcastNewArticle({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        cover_image: article.cover_image,
        reading_time: article.reading_time ?? null,
        category: article.category,
      }).catch((err) =>
        console.error("[createArticleAction] Broadcast failed silently:", err)
      );
    }

    return { success: true, data: article, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[createArticleAction] Error:", err.message);
    return { success: false, data: null, error: err.message || "Failed to create article" };
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[updateArticleAction] Error:", err.message);
    return { success: false, data: null, error: err.message || "Failed to update article" };
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[deleteArticleAction] Error:", err.message);
    return { success: false, error: err.message || "Failed to delete article" };
  }
}
