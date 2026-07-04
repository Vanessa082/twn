// ─────────────────────────────────────────────────────────────────────────────
// Notebook Entries — Public Service Layer
// Powers the hero animation and "Today's Page" section.
// All functions have graceful fallbacks so the hero never breaks.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/db/server";
import type { NotebookEntry } from "@/types";

// ── Fallback Data ─────────────────────────────────────────────────────────────
// Shown when the DB is unreachable. Curated, editorial, on-brand.
// The hero animation works entirely from this list when offline.

const NOTEBOOK_ID_PLACEHOLDER = "default";

export const FALLBACK_ENTRIES: NotebookEntry[] = [
  {
    id: "fe1",
    notebook_id: NOTEBOOK_ID_PLACEHOLDER,
    title: null,
    thought: "A notebook for women building the future.",
    slug: null,
    source_article_id: null,
    is_active: true,
    priority: 10,
    display_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fe2",
    notebook_id: NOTEBOOK_ID_PLACEHOLDER,
    title: "Today I learned...",
    thought: "Curiosity scales better than certainty.",
    slug: null,
    source_article_id: null,
    is_active: true,
    priority: 0,
    display_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fe3",
    notebook_id: NOTEBOOK_ID_PLACEHOLDER,
    title: null,
    thought: "Some problems cannot be solved with code alone.",
    slug: null,
    source_article_id: null,
    is_active: true,
    priority: 0,
    display_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fe4",
    notebook_id: NOTEBOOK_ID_PLACEHOLDER,
    title: null,
    thought: "Technology remembers. People forget.",
    slug: null,
    source_article_id: null,
    is_active: true,
    priority: 0,
    display_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fe5",
    notebook_id: NOTEBOOK_ID_PLACEHOLDER,
    title: null,
    thought: "The smallest lesson today may become tomorrow's breakthrough.",
    slug: null,
    source_article_id: null,
    is_active: true,
    priority: 0,
    display_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fe6",
    notebook_id: NOTEBOOK_ID_PLACEHOLDER,
    title: null,
    thought: "Every notebook begins with one blank page.",
    slug: null,
    source_article_id: null,
    is_active: true,
    priority: 0,
    display_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fe7",
    notebook_id: NOTEBOOK_ID_PLACEHOLDER,
    title: null,
    thought: "There are questions that no search engine can answer.",
    slug: null,
    source_article_id: null,
    is_active: true,
    priority: 0,
    display_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fe8",
    notebook_id: NOTEBOOK_ID_PLACEHOLDER,
    title: null,
    thought: "Growth often looks like repeating the same difficult thing until it becomes ordinary.",
    slug: null,
    source_article_id: null,
    is_active: true,
    priority: 0,
    display_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 * Isolated for testability.
 */
function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Picks one random entry from an array without modifying it.
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches all active notebook entries, ordered by priority DESC then created_at ASC.
 * Used by the client-side rotation after the initial random entry is shown.
 * Falls back to FALLBACK_ENTRIES if the DB is unreachable.
 */
export async function getAllActiveEntries(): Promise<NotebookEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notebook_entries")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[getAllActiveEntries] DB error, using fallback:", error.message);
      return FALLBACK_ENTRIES;
    }

    return data && data.length > 0 ? (data as NotebookEntry[]) : FALLBACK_ENTRIES;
  } catch (error) {
    console.warn("[getAllActiveEntries] Service error, using fallback:", error);
    return FALLBACK_ENTRIES;
  }
}

/**
 * Returns one randomly selected active entry.
 * This becomes the opening thought when the page loads.
 * The client then continues cycling through the rest in order.
 */
export async function getRandomEntry(): Promise<NotebookEntry> {
  const entries = await getAllActiveEntries();
  return pickRandom(entries);
}

/**
 * Returns the notebook entry assigned to today's date, if one exists.
 * Used by the "Today's Page" homepage section.
 * Returns null (not a fallback) if no entry is scheduled for today —
 * the UI hides the section entirely when null.
 */
export async function getTodaysEntry(): Promise<NotebookEntry | null> {
  const today = getTodayISO();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notebook_entries")
      .select("*")
      .eq("display_date", today)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.warn("[getTodaysEntry] DB error:", error.message);
      return null;
    }

    return data ? (data as NotebookEntry) : null;
  } catch (error) {
    console.warn("[getTodaysEntry] Service error:", error);
    return null;
  }
}

// Re-export Admin Services
export * from "./notebook-entries-admin";

