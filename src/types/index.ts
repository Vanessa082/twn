// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types for The Notebook of a Tech Woman (TWN)
// Single source of truth — import from here, never redefine elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

// ── Moderation ───────────────────────────────────────────────────────────────
// Maps to the PostgreSQL ENUM: moderation_status
export type ModerationStatus = "pending" | "approved" | "rejected";

// ── Notebook ─────────────────────────────────────────────────────────────────
// A named collection of entries. Initially one default notebook exists.
// Future: Engineering Notebook, Leadership Notebook, Community Notebook...
export interface Notebook {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ── Notebook Entry ────────────────────────────────────────────────────────────
// Admin-authored sentences/paragraphs that power the hero animation and
// Today's Page. Can optionally reference an article (source_article_id).
export interface NotebookEntry {
  id: string;
  notebook_id: string; // References notebooks.id
  title: string | null; // e.g. "Today I wondered..."
  thought: string; // The actual sentence or paragraph
  slug: string | null; // For future /notes/[slug] route
  source_article_id: string | null; // Article this entry references (optional)
  is_active: boolean; // Show in hero rotation?
  priority: number; // 0 = normal, higher = more prominent
  display_date: string | null; // ISO date string e.g. "2026-07-04"
  created_at: string;
  updated_at: string;
}

// ── Shared Page ───────────────────────────────────────────────────────────────
// Visitor-submitted reflections (150–300 words). Require moderation before
// appearing on the homepage "Pages from the Community" section.
export interface SharedPage {
  id: string;
  author_name: string;
  title: string | null; // Optional heading
  content: string;
  word_count: number;
  status: ModerationStatus;
  submitted_at: string;
  published_at: string | null;
  updated_at: string;
}

// ── Margin Note ───────────────────────────────────────────────────────────────
// One short reflection (max 120 chars) left by a reader at the end of an
// article. No replies, no likes, no threads — just a note in the margin.
export interface MarginNote {
  id: string;
  article_id: string; // UUID — references articles.id (not slug)
  author_name: string;
  content: string; // Max 120 characters
  status: ModerationStatus;
  display_order: number; // 999 = default; 0 = pinned to top
  submitted_at: string;
  published_at: string | null;
  updated_at: string;
}

// ── Tag ───────────────────────────────────────────────────────────────────────
// Granular labels, separate from editorial Categories.
// e.g. Category = "Leadership", Tags = ["Mentorship", "Africa", "Confidence"]
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// ── Article ──────────────────────────────────────────────────────────────────

export type ArticleStatus = "draft" | "published" | "scheduled";

export type ArticleCategory =
  | "technology"
  | "leadership"
  | "learning"
  | "community"
  | "reflections";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: ArticleCategory;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  reading_time?: number; // computed, minutes
}

/** Minimal projection used in article lists (no full content) */
export type ArticleCard = Omit<Article, "content">;

/** Payload for creating a new article */
export type CreateArticleInput = Omit<Article, "id" | "created_at" | "updated_at" | "reading_time">;

/** Payload for updating an existing article */
export type UpdateArticleInput = Partial<CreateArticleInput>;

// ── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: ArticleCategory;
}

// ── Subscriber ───────────────────────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface SubscribeInput {
  email: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  article: ArticleCard;
  score: number;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}
