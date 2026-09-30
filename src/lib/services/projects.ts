import { createAdminClient, createClient } from "@/lib/db/server";
import type { Project, ProjectInput } from "@/types/cms";

export type { Project, ProjectInput, ProjectStatus } from "@/types/cms";

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Published projects in display order. Returns [] when none are published (or the
 * table does not exist yet) so the Workbench stays quiet instead of inventing work.
 */
export async function getPublishedProjects(limit?: number): Promise<Project[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.warn("[getPublishedProjects] DB error:", error.message);
      return [];
    }
    return (data ?? []) as Project[];
  } catch {
    return [];
  }
}

// ── Admin API ─────────────────────────────────────────────────────────────────

export interface ProjectsAdminResult {
  projects: Project[];
  /** False when the projects table has not been created yet. */
  tableReady: boolean;
}

export async function getAllProjectsAdmin(): Promise<ProjectsAdminResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { projects: [], tableReady: false };
  return { projects: (data ?? []) as Project[], tableReady: true };
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("projects").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
