import { createAdminClient, createClient } from "@/lib/db/server";
import type { ProjectRepository } from "../domain/ports";
import type { Project, ProjectInput, ProjectsAdminResult } from "../domain/project";

export class SupabaseProjectRepository implements ProjectRepository {
  async findPublished(limit?: number): Promise<Project[]> {
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

  async findAllAdmin(): Promise<ProjectsAdminResult> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return { projects: [], tableReady: false };
    return { projects: (data ?? []) as Project[], tableReady: true };
  }

  async create(input: ProjectInput): Promise<Project> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("projects").insert(input).select().single();
    if (error) throw new Error(error.message);
    return data as Project;
  }

  async update(id: string, input: Partial<ProjectInput>): Promise<Project> {
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

  async delete(id: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
