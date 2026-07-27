import { createAdminClient, createClient } from "@/lib/db/server";
import type { MarginNote, ModerationStatus } from "@/types";

export interface MarginNoteRepository {
  findApprovedForArticle(articleId: string): Promise<MarginNote[]>;
  insert(
    articleId: string,
    authorName: string,
    content: string
  ): Promise<MarginNote>;
  findAllAdmin(): Promise<(MarginNote & { article_title?: string })[]>;
  updateStatus(id: string, status: ModerationStatus): Promise<MarginNote>;
  updatePin(id: string, pinned: boolean): Promise<MarginNote>;
  delete(id: string): Promise<boolean>;
}

export class SupabaseMarginNoteRepository implements MarginNoteRepository {
  async findApprovedForArticle(articleId: string): Promise<MarginNote[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("margin_notes")
      .select("*")
      .eq("article_id", articleId)
      .eq("status", "approved")
      .order("display_order", { ascending: true })
      .order("submitted_at", { ascending: false });

    if (error) {
      console.warn("[MarginNoteRepository] findApprovedForArticle error:", error.message);
      return [];
    }
    return (data as MarginNote[]) ?? [];
  }

  async insert(articleId: string, authorName: string, content: string): Promise<MarginNote> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("margin_notes")
      .insert({
        article_id: articleId,
        author_name: authorName,
        content,
        status: "approved",
        display_order: 999,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as MarginNote;
  }

  async findAllAdmin(): Promise<(MarginNote & { article_title?: string })[]> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("margin_notes")
      .select(`*, articles(title)`)
      .order("submitted_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: row.id,
      article_id: row.article_id,
      author_name: row.author_name,
      content: row.content,
      status: row.status,
      display_order: row.display_order,
      submitted_at: row.submitted_at,
      published_at: row.published_at,
      updated_at: row.updated_at,
      article_title: row.articles?.title || "Unknown Article",
    }));
  }

  async updateStatus(id: string, status: ModerationStatus): Promise<MarginNote> {
    const adminSupabase = createAdminClient();
    const payload: Record<string, string | null> = { status };
    payload.published_at = status === "approved" ? new Date().toISOString() : null;

    const { data, error } = await adminSupabase
      .from("margin_notes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as MarginNote;
  }

  async updatePin(id: string, pinned: boolean): Promise<MarginNote> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("margin_notes")
      .update({ display_order: pinned ? 0 : 999 })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as MarginNote;
  }

  async delete(id: string): Promise<boolean> {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("margin_notes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
}
