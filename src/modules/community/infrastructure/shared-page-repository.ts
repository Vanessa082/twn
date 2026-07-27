import { createAdminClient, createClient } from "@/lib/db/server";
import { findSharedPageByParam } from "@/lib/utils/shared-page-lookup";
import type { ModerationStatus, SharedPage } from "@/types";

export interface SharedPageRepository {
  findAllApproved(): Promise<SharedPage[]>;
  findBySlug(slug: string): Promise<SharedPage | null>;
  insert(
    authorName: string,
    title: string | null,
    content: string,
    wordCount: number
  ): Promise<SharedPage>;
  findAllAdmin(): Promise<SharedPage[]>;
  updateStatus(id: string, status: ModerationStatus): Promise<SharedPage>;
  delete(id: string): Promise<boolean>;
}

export class SupabaseSharedPageRepository implements SharedPageRepository {
  async findAllApproved(): Promise<SharedPage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shared_pages")
      .select("*")
      .eq("status", "approved")
      .order("published_at", { ascending: false });

    if (error) {
      console.warn("[SharedPageRepository] findAllApproved error:", error.message);
      return [];
    }
    return (data as SharedPage[]) ?? [];
  }

  async findBySlug(slug: string): Promise<SharedPage | null> {
    const pages = await this.findAllApproved();
    return findSharedPageByParam(pages, slug);
  }

  async insert(
    authorName: string,
    title: string | null,
    content: string,
    wordCount: number
  ): Promise<SharedPage> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("shared_pages")
      .insert({
        author_name: authorName,
        title,
        content,
        word_count: wordCount,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as SharedPage;
  }

  async findAllAdmin(): Promise<SharedPage[]> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("shared_pages")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as SharedPage[]) || [];
  }

  async updateStatus(id: string, status: ModerationStatus): Promise<SharedPage> {
    const adminSupabase = createAdminClient();
    const payload: Record<string, string | null> = { status };
    payload.published_at = status === "approved" ? new Date().toISOString() : null;

    const { data, error } = await adminSupabase
      .from("shared_pages")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as SharedPage;
  }

  async delete(id: string): Promise<boolean> {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("shared_pages").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
}
