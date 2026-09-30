import { promises as fs } from "node:fs";
import path from "node:path";
import defaultAboutData from "@/content/about-data.json";
import { createAdminClient, createClient } from "@/lib/db/server";
import type { AboutData } from "@/types/about";

const JSON_FILE_PATH = path.join(process.cwd(), "src", "content", "about-data.json");

export async function getAboutData(): Promise<AboutData> {
  // 1. Attempt reading from Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_settings")
      .select("data")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data?.data) {
      const stored = data.data as Partial<AboutData>;
      const defaults = defaultAboutData as AboutData;
      // Object sections merge field by field so rows saved before a field existed
      // still pick up its default.
      return {
        ...defaults,
        ...stored,
        hero: { ...defaults.hero, ...stored.hero },
        short_version: { ...defaults.short_version, ...stored.short_version },
        open_knowledge: { ...defaults.open_knowledge, ...stored.open_knowledge },
        manifesto: { ...defaults.manifesto, ...stored.manifesto },
        closing: { ...defaults.closing, ...stored.closing },
        section_visibility: { ...defaults.section_visibility, ...stored.section_visibility },
      };
    }
  } catch (err) {
    console.warn("[AboutService] Database read skipped or failed, using file fallback:", err);
  }

  // 2. Read from filesystem fallback
  try {
    const fileContent = await fs.readFile(JSON_FILE_PATH, "utf-8");
    const parsed = JSON.parse(fileContent);
    return parsed as AboutData;
  } catch (_err) {
    // 3. Fallback to imported default JSON
    return defaultAboutData as AboutData;
  }
}

export async function updateAboutData(newData: AboutData): Promise<AboutData> {
  const preparedData: AboutData = {
    ...newData,
    updated_at: new Date().toISOString(),
  };

  let fileSaved = false;
  let dbError: string | null = null;

  // 1. Try writing to filesystem first for immediate local resilience
  try {
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(preparedData, null, 2), "utf-8");
    fileSaved = true;
  } catch (fsErr) {
    console.warn("[AboutService] File write warning:", fsErr);
  }

  // 2. Try writing to Supabase using Admin Client
  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("about_settings").upsert(
      {
        id: "default",
        data: preparedData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      dbError = error.message;
      console.warn("[AboutService] Supabase upsert failed:", error.message);
    }
  } catch (dbErr) {
    dbError = dbErr instanceof Error ? dbErr.message : "Database write failed";
    console.warn("[AboutService] Supabase admin client write error:", dbErr);
  }

  // In production the filesystem is read-only, so the database is the only store.
  if (dbError && !fileSaved) throw new Error(dbError);

  return preparedData;
}
