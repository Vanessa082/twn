import { createClient } from "@/lib/db/server";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import type { Article, ArticleCategory } from "@/types";
import { FALLBACK_ARTICLES } from "./fallback-articles";

// ── Database Row Type ────────────────────────────────────────────────────────

export interface DatabaseArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | null;
  cover_image: string | null;
  category: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Maps raw database row to our clean Article type, adding calculated fields */
export function mapToArticle(row: DatabaseArticleRow): Article {
  const content = row.content || "";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: content,
    cover_image: row.cover_image,
    category: row.category as ArticleCategory,
    status: row.status as Article["status"],
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reading_time: calculateReadingTime(content),
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetching Data via Services (Separation of Concerns)
 * Instead of making inline database queries directly inside React components, we delegate
 * data access to this dedicated Service Layer.
 */
export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(safeLimit);

    if (error) {
      // Only fall back when DB is genuinely unreachable
      console.warn(
        "[getLatestArticles] Database error, falling back to local seed:",
        error.message
      );
      return FALLBACK_ARTICLES.slice(0, safeLimit);
    }

    // Return real data — empty array when DB has no published articles yet
    return data ? (data as DatabaseArticleRow[]).map(mapToArticle) : [];
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
      // Only fall back when DB is genuinely unreachable
      console.warn(
        "[getArticlesByCategory] Database error, falling back to local seed:",
        error.message
      );
      return FALLBACK_ARTICLES.filter((a) => a.category === category).slice(0, safeLimit);
    }

    // Return real data — empty array when category has no published articles yet
    return data ? (data as DatabaseArticleRow[]).map(mapToArticle) : [];
  } catch (error) {
    console.warn("[getArticlesByCategory] Service error, falling back to local seed:", error);
    return FALLBACK_ARTICLES.filter((a) => a.category === category).slice(0, safeLimit);
  }
}

/**
 * Fetches a single published article by its slug.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
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
      // Only fallback on DB error
      console.warn("[getArticleBySlug] Database error, falling back to local seed:", error.message);
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
    }

    // Return the mapping or null if not found
    return data ? mapToArticle(data as DatabaseArticleRow) : null;
  } catch (error) {
    console.warn("[getArticleBySlug] Service error, falling back to local seed:", error);
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
  }
}

// Re-export Admin Services for backward compatibility and clean importing
export * from "./articles-admin";
