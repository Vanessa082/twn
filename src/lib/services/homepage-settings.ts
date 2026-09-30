import { createAdminClient, createClient } from "@/lib/db/server";
import type { Article } from "@/types";
import type {
  HomepageSettings,
  HomepageSettingsWithArticle,
  UpdateHomepageSettingsInput,
} from "@/types/cms";
import { cache } from "react";
import { type DatabaseArticleRow, mapToArticle } from "./articles";

export type {
  HomepageSettings,
  HomepageSettingsWithArticle,
  SocialLink,
  UpdateHomepageSettingsInput,
} from "@/types/cms";

// ── Defaults ──────────────────────────────────────────────────────────────────
// Mirrors the seed row in migration_homepage_settings.sql so the site renders the
// same before and after the migration runs.

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

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Current homepage and site settings, including the resolved featured article.
 * Cached per request so the public layout (footer) and the homepage share one query.
 */
export const getHomepageSettings = cache(async (): Promise<HomepageSettingsWithArticle> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return { ...normalize(null), featured_article: null };

    const settings = normalize(data as Partial<HomepageSettings>);

    let featured_article: Article | null = null;
    if (settings.featured_article_id) {
      const { data: articleData } = await supabase
        .from("articles")
        .select("*")
        .eq("id", settings.featured_article_id)
        .eq("status", "published")
        .maybeSingle();
      if (articleData) featured_article = mapToArticle(articleData as DatabaseArticleRow);
    }

    return { ...settings, featured_article };
  } catch {
    return { ...normalize(null), featured_article: null };
  }
});

// ── Admin API ─────────────────────────────────────────────────────────────────

export interface HomepageSettingsAdminResult {
  settings: HomepageSettings;
  /** False when the homepage_settings table has not been created yet. */
  tableReady: boolean;
}

export async function getHomepageSettingsAdmin(): Promise<HomepageSettingsAdminResult> {
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

/** Updates the singleton settings row, creating it on first save. */
export async function updateHomepageSettings(
  input: UpdateHomepageSettingsInput
): Promise<HomepageSettings> {
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
