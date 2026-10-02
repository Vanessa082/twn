import { createAdminClient } from "@/lib/db/server";
import type { NoteRevisionRepository } from "../domain/ports";
import type { Note, NoteRevision } from "../domain/types";
import { NOTE_REVISIONS_TABLE } from "./tables";

const MAX_REVISIONS_PER_NOTE = 20;

interface RevisionRow {
  id: string;
  article_id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  status: string;
  saved_by_clerk_id: string | null;
  created_at: string;
}

function mapRevision(row: RevisionRow): NoteRevision {
  return {
    id: row.id,
    note_id: row.article_id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    cover_image: row.cover_image,
    category: row.category,
    status: row.status,
    saved_by_clerk_id: row.saved_by_clerk_id,
    created_at: row.created_at,
  };
}

async function createRevision(
  note: Pick<Note, "id" | "title" | "excerpt" | "content" | "cover_image" | "category" | "status">,
  savedByClerkId?: string | null
): Promise<void> {
  const adminSupabase = createAdminClient();

  await adminSupabase.from(NOTE_REVISIONS_TABLE).insert({
    article_id: note.id,
    title: note.title,
    excerpt: note.excerpt,
    content: note.content,
    cover_image: note.cover_image,
    category: note.category,
    status: note.status,
    saved_by_clerk_id: savedByClerkId ?? null,
  });

  const { data: oldRevisions } = await adminSupabase
    .from(NOTE_REVISIONS_TABLE)
    .select("id, created_at")
    .eq("article_id", note.id)
    .order("created_at", { ascending: false })
    .range(MAX_REVISIONS_PER_NOTE, 9999);

  if (oldRevisions && oldRevisions.length > 0) {
    await adminSupabase
      .from(NOTE_REVISIONS_TABLE)
      .delete()
      .in(
        "id",
        oldRevisions.map((revision) => revision.id)
      );
  }
}

async function getRevisionsForNote(noteId: string, limit = 10): Promise<NoteRevision[]> {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from(NOTE_REVISIONS_TABLE)
    .select("*")
    .eq("article_id", noteId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return ((data ?? []) as RevisionRow[]).map(mapRevision);
}

async function getRevisionById(id: string): Promise<NoteRevision | null> {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from(NOTE_REVISIONS_TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return mapRevision(data as RevisionRow);
}

export class SupabaseNoteRevisionRepository implements NoteRevisionRepository {
  createSnapshot(
    note: Pick<
      Note,
      "id" | "title" | "excerpt" | "content" | "cover_image" | "category" | "status"
    >,
    savedByClerkId?: string | null
  ) {
    return createRevision(note, savedByClerkId);
  }

  findForNote(noteId: string, limit = 10) {
    return getRevisionsForNote(noteId, limit);
  }

  findById(id: string) {
    return getRevisionById(id);
  }
}
