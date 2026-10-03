import { calculateReadingTime } from "../domain/reading-time";
import type { Note, NoteCard, NoteChapter } from "../domain/types";
export interface DatabaseNoteRow {
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
  likes_count?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
}

export function mapToNote(row: DatabaseNoteRow): Note {
  const content = row.content || "";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content,
    cover_image: row.cover_image,
    category: row.category as NoteChapter,
    status: row.status as Note["status"],
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reading_time: calculateReadingTime(content),
    likes_count: row.likes_count || 0,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    og_image: row.og_image,
    canonical_url: row.canonical_url,
  };
}

/** A note without its body, with reading time computed from the body. */
export function toNoteCard(row: DatabaseNoteRow): NoteCard {
  const { content: _content, ...card } = mapToNote(row);
  return card;
}
