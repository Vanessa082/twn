import { createAdminClient, createClient } from "@/lib/db/server";
import type {
  HomepageSettings,
  HomepageSettingsAdminResult,
  UpdateHomepageSettingsInput,
} from "../domain/homepage";
import type { HomepageSettingsRepository } from "../domain/ports";

const DEFAULT_SETTINGS: Omit<HomepageSettings, "id" | "updated_at"> = {
  featured_article_id: null,
  volume_label: "Vol. 01",
  volume_subtitle: "",
  volume_season: "September 2026",
  hero_eyebrow: "The Notebook of a Tech Woman",
  hero_title: "Notes from becoming.",
  hero_topics: ["Technology", "Work", "Learning", "Building", "Life"],
  contact_email: "wahvanessa22@gmail.com",
  location: "Yaoundé, Cameroon",
  social_links: [],
};

function normalize(row: Partial<HomepageSettings> | null): HomepageSettings {
  const merged = { ...DEFAULT_SETTINGS, ...(row ?? {}) };
  return {
    ...merged,
    id: row?.id ?? "fallback",
    updated_at: row?.updated_at ?? new Date().toISOString(),
    hero_topics: Array.isArray(merged.hero_topics) ? merged.hero_topics : [],
    social_links: Array.isArray(merged.social_links)
      ? merged.social_links.filter((link) => link?.label && link?.url)
      : [],
  };
}

export class SupabaseHomepageSettingsRepository implements HomepageSettingsRepository {
  async findCurrent(): Promise<HomepageSettings> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("homepage_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return normalize(null);
      return normalize(data as Partial<HomepageSettings>);
    } catch {
      return normalize(null);
    }
  }

  async findCurrentAdmin(): Promise<HomepageSettingsAdminResult> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("homepage_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { settings: normalize(null), tableReady: false };
    return { settings: normalize(data as Partial<HomepageSettings> | null), tableReady: true };
  }

  async upsert(input: UpdateHomepageSettingsInput): Promise<HomepageSettings> {
    const supabase = createAdminClient();

    const { data: existing, error: readError } = await supabase
      .from("homepage_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (readError) throw new Error(readError.message);

    const query = existing?.id
      ? supabase.from("homepage_settings").update(input).eq("id", existing.id)
      : supabase.from("homepage_settings").insert({ ...DEFAULT_SETTINGS, ...input });

    const { data, error } = await query.select().single();
    if (error) throw new Error(error.message);
    return normalize(data as HomepageSettings);
  }
}
