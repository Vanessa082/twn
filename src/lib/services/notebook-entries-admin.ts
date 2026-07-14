// ─────────────────────────────────────────────────────────────────────────────
// Notebook Entries — Admin Service Layer
// Executes exclusively on the server, bypassing RLS via service role.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from "@/lib/db/server";
import type { Notebook, NotebookEntry } from "@/types";

/**
 * Admin: Fetches all notebooks.
 */
export async function getAllNotebooksAdmin(): Promise<Notebook[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("notebooks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getAllNotebooksAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return (data as Notebook[]) || [];
  } catch (error) {
    console.error("[getAllNotebooksAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Gets the default notebook ID.
 */
export async function getDefaultNotebookIdAdmin(): Promise<string> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("notebooks")
      .select("id")
      .eq("is_default", true)
      .maybeSingle();

    if (error) {
      console.error("[getDefaultNotebookIdAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    if (data) {
      return data.id;
    }

    // If no default notebook exists in DB, fetch the first one
    const { data: firstNotebook, error: firstError } = await adminSupabase
      .from("notebooks")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (firstError) {
      console.error("[getDefaultNotebookIdAdmin] DB first notebook error:", firstError.message);
      throw new Error(firstError.message);
    }

    if (firstNotebook) {
      return firstNotebook.id;
    }

    throw new Error("No notebooks found in the database. Please seed the default notebook.");
  } catch (error) {
    console.error("[getDefaultNotebookIdAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Fetches all notebook entries (active + inactive) bypassing RLS.
 */
export async function getAllEntriesAdmin(): Promise<NotebookEntry[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("notebook_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllEntriesAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return (data as NotebookEntry[]) || [];
  } catch (error) {
    console.error("[getAllEntriesAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Creates a new notebook entry.
 * If notebook_id is not provided, defaults it to the default notebook.
 */
export async function createEntryAdmin(
  input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">
): Promise<NotebookEntry> {
  if (!input.thought) {
    throw new Error("Missing required field: thought");
  }

  try {
    const adminSupabase = createAdminClient();
    let notebookId = input.notebook_id;

    if (!notebookId || notebookId === "default") {
      notebookId = await getDefaultNotebookIdAdmin();
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

    if (error) {
      console.error("[createEntryAdmin] DB insert error:", error.message);
      throw new Error(error.message);
    }

    return data as NotebookEntry;
  } catch (error) {
    console.error("[createEntryAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Updates an existing notebook entry.
 */
export async function updateEntryAdmin(
  id: string,
  input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>
): Promise<NotebookEntry> {
  if (!id) {
    throw new Error("Entry ID is required for updates");
  }

  try {
    const adminSupabase = createAdminClient();

    const updatePayload: Record<string, any> = {};
    if (input.notebook_id) updatePayload.notebook_id = input.notebook_id;
    if (input.title !== undefined) updatePayload.title = input.title?.trim() || null;
    if (input.thought !== undefined) updatePayload.thought = input.thought.trim();
    if (input.slug !== undefined) updatePayload.slug = input.slug?.trim() || null;
    if (input.source_article_id !== undefined)
      updatePayload.source_article_id = input.source_article_id;
    if (input.is_active !== undefined) updatePayload.is_active = input.is_active;
    if (input.priority !== undefined) updatePayload.priority = input.priority;
    if (input.display_date !== undefined) updatePayload.display_date = input.display_date || null;

    const { data, error } = await adminSupabase
      .from("notebook_entries")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[updateEntryAdmin] DB update error:", error.message);
      throw new Error(error.message);
    }

    return data as NotebookEntry;
  } catch (error) {
    console.error("[updateEntryAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Deletes a notebook entry.
 */
export async function deleteEntryAdmin(id: string): Promise<boolean> {
  if (!id) {
    throw new Error("Entry ID is required for deletion");
  }

  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("notebook_entries").delete().eq("id", id);

    if (error) {
      console.error("[deleteEntryAdmin] DB delete error:", error.message);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error("[deleteEntryAdmin] Service error:", error);
    throw error;
  }
}
