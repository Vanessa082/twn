"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { toAdminActionError } from "@/lib/auth/admin-errors";
import {
  createArticleAdmin,
  deleteArticleAdmin,
  updateArticleAdmin,
} from "@/lib/services/articles";
import { broadcastNewArticle } from "@/lib/services/subscribers";
import type { CreateArticleInput, UpdateArticleInput } from "@/types";
import { revalidatePath } from "next/cache";

export async function createArticleAction(input: CreateArticleInput) {
  try {
    await requireAdmin();
    const article = await createArticleAdmin(input);
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/articles");

    if (article.status === "published") {
      broadcastNewArticle({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        cover_image: article.cover_image,
        reading_time: article.reading_time ?? null,
        category: article.category,
      }).catch((err) => console.error("[createArticleAction] Broadcast failed silently:", err));
    }

    return { success: true, data: article, error: null };
  } catch (error: unknown) {
    console.error("[createArticleAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to create article",
    };
  }
}

export async function updateArticleAction(id: string, input: UpdateArticleInput) {
  try {
    await requireAdmin();
    const article = await updateArticleAdmin(id, input);
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/admin/articles");
    return { success: true, data: article, error: null };
  } catch (error: unknown) {
    console.error("[updateArticleAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update article",
    };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    await requireAdmin();
    await deleteArticleAdmin(id);
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/articles");
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteArticleAction] Error:", toAdminActionError(error));
    return { success: false, error: toAdminActionError(error) || "Failed to delete article" };
  }
}
