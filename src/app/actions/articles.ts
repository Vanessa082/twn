"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { requireAdmin } from "@/lib/auth/require-admin";
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

export async function toggleArticleLikeAction(slug: string, increment: boolean) {
  try {
    const { toggleArticleLike } = await import("@/lib/services/articles");
    const count = await toggleArticleLike(slug, increment);
    revalidatePath(`/articles/${slug}`);
    return { success: true, count, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[toggleArticleLikeAction] Error:", err.message);
    return { success: false, count: 0, error: err.message || "Failed to toggle like" };
  }
}
