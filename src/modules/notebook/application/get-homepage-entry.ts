import type { NotebookEntry } from "@/types";
import { FALLBACK_ENTRIES } from "../domain/notebook-entry";
import {
  type NotebookRepository,
  SupabaseNotebookRepository,
} from "../infrastructure/notebook-repository";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns all active notebook entries ordered by priority then date.
 * Used by the client-side hero animation to cycle through thoughts.
 * Falls back to editorial fallback entries if DB is unreachable.
 */
export async function getAllActiveEntries(
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<NotebookEntry[]> {
  try {
    const entries = await repository.findAllActive();
    return entries.length > 0 ? entries : FALLBACK_ENTRIES;
  } catch {
    console.warn("[getAllActiveEntries] Using fallback entries.");
    return FALLBACK_ENTRIES;
  }
}

/**
 * Returns one randomly selected active entry.
 * Becomes the opening thought when the page loads.
 */
export async function getRandomEntry(
  repository?: NotebookRepository
): Promise<NotebookEntry> {
  const entries = await getAllActiveEntries(repository);
  return pickRandom(entries);
}

/**
 * Returns the notebook entry assigned to today's date.
 * Used by the "Today's Page" homepage section.
 * Returns a fallback rather than null so the section is always populated.
 */
export async function getTodaysEntry(
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<NotebookEntry | null> {
  const today = new Date().toISOString().split("T")[0];

  try {
    const entry = await repository.findByDate(today);
    if (entry) return entry;

    const fallback = FALLBACK_ENTRIES.find((e) => e.id === "fe7");
    if (fallback) return { ...fallback, display_date: today };
    return null;
  } catch {
    const fallback = FALLBACK_ENTRIES.find((e) => e.id === "fe7");
    if (fallback) return { ...fallback, display_date: today };
    return null;
  }
}
