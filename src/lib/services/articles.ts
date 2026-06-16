import { createClient, createAdminClient } from "@/lib/db/server";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { generateSlug } from "@/lib/utils/slug";
import type { Article, CreateArticleInput, UpdateArticleInput, ArticleCategory } from "@/types";
import { FALLBACK_ARTICLES } from "./fallback-articles";

// ── Helper ──────────────────────────────────────────────────────────────────

/** Maps raw database row to our clean Article type, adding calculated fields */
function mapToArticle(row: any): Article {
  const content = row.content || "";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: content,
    cover_image: row.cover_image,
    category: row.category as ArticleCategory,
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reading_time: calculateReadingTime(content),
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * 🧠 LEARNING POINT: Fetching Data via Services (Separation of Concerns)
 * Instead of making inline database queries directly inside React components, we delegate
 * data access to this dedicated Service Layer. 
 * Benefits:
 *  1. Reusability: Multiple routes can fetch the latest articles without duplicate code.
 *  2. Maintainability: If we migrate from Supabase to another database or cache server, 
 *     we only need to modify this file; all UI files remain untouched.
 *  3. Testability: We can easily write unit tests for this service by mocking the DB client.
 * 
 * 🧠 LEARNING POINT: Defensive Coding & Input Validation
 *  - "Validate all inputs": The service checks the `limit` argument. We enforce a floor of 1 
 *    and a ceiling of 100 using Math.max/min. This prevents memory overflow if a client sends 
 *    an astronomical limit, and prevents SQL errors if they pass a negative number.
 */
export async function getLatestArticles(limit = 10): Promise<Article[]> {
  // 1. Validate inputs defensively
  const safeLimit = Math.max(1, Math.min(limit, 100));

  try {
    // 2. Instantiate the cookie-based database client for the current request context
    const supabase = await createClient();

    // 3. Execute query with filters:
    //    - Only published articles.
    //    - Published date is in the past (handles scheduled/delayed publishing).
    //    - Sorted descending by date.
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(safeLimit);

    // 4. Handle DB exceptions gracefully instead of crashing the process
    if (error) {
      console.warn("[getLatestArticles] Database error, falling back to local seed:", error.message);
      return FALLBACK_ARTICLES.slice(0, safeLimit); // Fallback to seed articles
    }

    // 5. Transform database records into clean, type-safe models for the frontend
    return data && data.length > 0 
      ? data.map(mapToArticle) 
      : FALLBACK_ARTICLES.slice(0, safeLimit); // Fallback if table is empty
  } catch (error) {
    console.warn("[getLatestArticles] Service error, falling back to local seed:", error);
    return FALLBACK_ARTICLES.slice(0, safeLimit);
  }
}

/**
 * Fetches published articles in a specific category.
 */
export async function getArticlesByCategory(
  category: ArticleCategory,
  limit = 10
): Promise<Article[]> {
  // 1. Validate inputs
  if (!category) return [];
  const safeLimit = Math.max(1, Math.min(limit, 100));

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("category", category)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(safeLimit);

    if (error) {
      console.warn("[getArticlesByCategory] Database error, falling back to local seed:", error.message);
      return FALLBACK_ARTICLES.filter((a) => a.category === category).slice(0, safeLimit);
    }

    return data && data.length > 0
      ? data.map(mapToArticle)
      : FALLBACK_ARTICLES.filter((a) => a.category === category).slice(0, safeLimit);
  } catch (error) {
    console.warn("[getArticlesByCategory] Service error, falling back to local seed:", error);
    return FALLBACK_ARTICLES.filter((a) => a.category === category).slice(0, safeLimit);
  }
}

/**
 * Fetches a single published article by its slug.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // 1. Validate inputs
  if (!slug || typeof slug !== "string") return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.warn("[getArticleBySlug] Database error, falling back to local seed:", error.message);
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
    }

    return data 
      ? mapToArticle(data) 
      : (FALLBACK_ARTICLES.find((a) => a.slug === slug) || null);
  } catch (error) {
    console.warn("[getArticleBySlug] Service error, falling back to local seed:", error);
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
  }
}

// ── Admin API ───────────────────────────────────────────────────────────────

/**
 * Admin: Fetches all articles (drafts + published) bypasses RLS using service role.
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

    return (data || []).map(mapToArticle);
  } catch (error: any) {
    console.error("[getAllArticlesAdmin] Service error:", error.message);
    throw error;
  }
}

/**
 * Admin: Creates a new article in the database.
 */
export async function createArticleAdmin(input: CreateArticleInput): Promise<Article> {
  // 1. Validate input
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

    const { data, error } = await adminSupabase
      .from("articles")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[createArticleAdmin] DB insert error:", error.message);
      throw new Error(error.message);
    }

    return mapToArticle(data);
  } catch (error: any) {
    console.error("[createArticleAdmin] Service error:", error.message);
    throw error;
  }
}

/**
 * Admin: Updates an existing article by ID.
 */
export async function updateArticleAdmin(
  id: string,
  input: UpdateArticleInput
): Promise<Article> {
  // 1. Validate inputs
  if (!id) throw new Error("Article ID is required for updates");

  try {
    const adminSupabase = createAdminClient();
    const updatePayload: any = { ...input };

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

    return mapToArticle(data);
  } catch (error: any) {
    console.error("[updateArticleAdmin] Service error:", error.message);
    throw error;
  }
}

/**
 * Admin: Deletes an article by ID.
 */
export async function deleteArticleAdmin(id: string): Promise<boolean> {
  // 1. Validate inputs
  if (!id) throw new Error("Article ID is required for deletion");

  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[deleteArticleAdmin] DB delete error:", error.message);
      throw new Error(error.message);
    }

    return true;
  } catch (error: any) {
    console.error("[deleteArticleAdmin] Service error:", error.message);
    throw error;
  }
}

/**
 * Admin: Fetches a single article by ID (bypassing RLS).
 */
export async function getArticleByIdAdmin(id: string): Promise<Article | null> {
  // 1. Validate inputs
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

    return data ? mapToArticle(data) : null;
  } catch (error) {
    console.error("[getArticleByIdAdmin] Service error:", error);
    return null;
  }
}

