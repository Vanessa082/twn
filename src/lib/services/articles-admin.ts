import { createAdminClient } from "@/lib/db/server";
import { generateSlug } from "@/lib/utils/slug";
import type { Article, CreateArticleInput, UpdateArticleInput } from "@/types";
import { mapToArticle } from "./articles";

/**
 * Admin: Fetches all articles (drafts + published) bypassing RLS using service role.
 */
export async function getAllArticlesAdmin(): Promise<Article[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllArticlesAdmin] Admin Database error:", error.message);
      throw new Error(error.message);
    }

    // Explicitly type database row mapping to satisfy TS/Biome
    type DBArticleRow = Parameters<typeof mapToArticle>[0];
    return ((data as DBArticleRow[]) || []).map(mapToArticle);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[getAllArticlesAdmin] Service error:", err.message);
    throw error;
  }
}

/**
 * Admin: Creates a new article in the database.
 */
export async function createArticleAdmin(input: CreateArticleInput): Promise<Article> {
  if (!input.title || !input.content || !input.category) {
    throw new Error("Missing required article fields: title, content, category");
  }

  try {
    const adminSupabase = createAdminClient();
    const slug = input.slug || generateSlug(input.title);

    const payload = {
      title: input.title.trim(),
      slug: slug,
      excerpt: input.excerpt?.trim() || "",
      content: input.content,
      cover_image: input.cover_image,
      category: input.category,
      status: input.status || "draft",
      published_at: input.status === "published" ? new Date().toISOString() : input.published_at,
    };

    const { data, error } = await adminSupabase.from("articles").insert(payload).select().single();

    if (error) {
      console.error("[createArticleAdmin] DB insert error:", error.message);
      throw new Error(error.message);
    }

    type DBArticleRow = Parameters<typeof mapToArticle>[0];
    return mapToArticle(data as DBArticleRow);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[createArticleAdmin] Service error:", err.message);
    throw error;
  }
}

/**
 * Admin: Updates an existing article by ID.
 */
export async function updateArticleAdmin(id: string, input: UpdateArticleInput): Promise<Article> {
  if (!id) throw new Error("Article ID is required for updates");

  try {
    const adminSupabase = createAdminClient();

    // Type-safe payload construction without 'any'
    const updatePayload: Partial<CreateArticleInput> & { published_at?: string | null } = {
      ...input,
    };

    if (input.title) {
      updatePayload.title = input.title.trim();
      if (!input.slug) {
        updatePayload.slug = generateSlug(input.title);
      }
    }

    if (input.status === "published" && !updatePayload.published_at) {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data, error } = await adminSupabase
      .from("articles")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[updateArticleAdmin] DB update error:", error.message);
      throw new Error(error.message);
    }

    type DBArticleRow = Parameters<typeof mapToArticle>[0];
    return mapToArticle(data as DBArticleRow);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[updateArticleAdmin] Service error:", err.message);
    throw error;
  }
}

/**
 * Admin: Deletes an article by ID.
 */
export async function deleteArticleAdmin(id: string): Promise<boolean> {
  if (!id) throw new Error("Article ID is required for deletion");

  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("articles").delete().eq("id", id);

    if (error) {
      console.error("[deleteArticleAdmin] DB delete error:", error.message);
      throw new Error(error.message);
    }

    return true;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[deleteArticleAdmin] Service error:", err.message);
    throw error;
  }
}

/**
 * Admin: Fetches a single article by ID (bypassing RLS).
 */
export async function getArticleByIdAdmin(id: string): Promise<Article | null> {
  if (!id) return null;

  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[getArticleByIdAdmin] Admin Database error:", error.message);
      return null;
    }

    type DBArticleRow = Parameters<typeof mapToArticle>[0];
    return data ? mapToArticle(data as DBArticleRow) : null;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[getArticleByIdAdmin] Service error:", err.message);
    return null;
  }
}
