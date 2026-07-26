import { createAdminClient, createClient } from "@/lib/db/server";
import type { Notebook, NotebookEntry } from "@/types";

// ── Port (interface) ──────────────────────────────────────────────────────────

export interface NotebookRepository {
  findAllActive(): Promise<NotebookEntry[]>;
  findByDate(date: string): Promise<NotebookEntry | null>;
  // Admin operations
  findAllAdmin(): Promise<NotebookEntry[]>;
  findAllNotebooks(): Promise<Notebook[]>;
  getDefaultNotebookId(): Promise<string>;
  create(input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">): Promise<NotebookEntry>;
  update(id: string, input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>): Promise<NotebookEntry>;
  delete(id: string): Promise<boolean>;
}

// ── Supabase Implementation ───────────────────────────────────────────────────

export class SupabaseNotebookRepository implements NotebookRepository {
  async findAllActive(): Promise<NotebookEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notebook_entries")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[NotebookRepository] findAllActive DB error:", error.message);
      return [];
    }
    return (data as NotebookEntry[]) || [];
  }

  async findByDate(date: string): Promise<NotebookEntry | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notebook_entries")
      .select("*")
      .eq("display_date", date)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.warn("[NotebookRepository] findByDate DB error:", error.message);
      return null;
    }
    return data ? (data as NotebookEntry) : null;
  }

  async findAllAdmin(): Promise<NotebookEntry[]> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("notebook_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[NotebookRepository] findAllAdmin DB error:", error.message);
      throw new Error(error.message);
    }
    return (data as NotebookEntry[]) || [];
  }

  async findAllNotebooks(): Promise<Notebook[]> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("notebooks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[NotebookRepository] findAllNotebooks DB error:", error.message);
      throw new Error(error.message);
    }
    return (data as Notebook[]) || [];
  }

  async getDefaultNotebookId(): Promise<string> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("notebooks")
      .select("id")
      .eq("is_default", true)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) return data.id;

    const { data: first, error: firstError } = await adminSupabase
      .from("notebooks")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (firstError) throw new Error(firstError.message);
    if (first) return first.id;

    throw new Error("No notebooks found in the database. Please seed the default notebook.");
  }

  async create(
    input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">
  ): Promise<NotebookEntry> {
    if (!input.thought) throw new Error("Missing required field: thought");

    const adminSupabase = createAdminClient();
    let notebookId = input.notebook_id;

    if (!notebookId || notebookId === "default") {
      notebookId = await this.getDefaultNotebookId();
    }

    const payload = {
      notebook_id: notebookId,
      title: input.title?.trim() || null,
      thought: input.thought.trim(),
      slug: input.slug?.trim() || null,
      source_article_id: input.source_article_id || null,
      is_active: input.is_active !== undefined ? input.is_active : true,
      priority: input.priority || 0,
      display_date: input.display_date || null,
    };

    const { data, error } = await adminSupabase
      .from("notebook_entries")
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as NotebookEntry;
  }

  async update(
    id: string,
    input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>
  ): Promise<NotebookEntry> {
    if (!id) throw new Error("Entry ID is required for updates");

    const adminSupabase = createAdminClient();
    const payload: Record<string, unknown> = {};
    if (input.notebook_id) payload.notebook_id = input.notebook_id;
    if (input.title !== undefined) payload.title = input.title?.trim() || null;
    if (input.thought !== undefined) payload.thought = input.thought.trim();
    if (input.slug !== undefined) payload.slug = input.slug?.trim() || null;
    if (input.source_article_id !== undefined) payload.source_article_id = input.source_article_id;
    if (input.is_active !== undefined) payload.is_active = input.is_active;
    if (input.priority !== undefined) payload.priority = input.priority;
    if (input.display_date !== undefined) payload.display_date = input.display_date || null;

    const { data, error } = await adminSupabase
      .from("notebook_entries")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as NotebookEntry;
  }

  async delete(id: string): Promise<boolean> {
    if (!id) throw new Error("Entry ID is required for deletion");

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("notebook_entries").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  }
}
