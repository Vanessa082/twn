import type { NotebookEntry } from "@/types";
import {
  type NotebookRepository,
  SupabaseNotebookRepository,
} from "../infrastructure/notebook-repository";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns all active notebook entries ordered by priority then date.
 * Empty editorial systems stay empty: no fabricated fallback thoughts.
 */
export async function getAllActiveEntries(
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<NotebookEntry[]> {
  try {
    return await repository.findAllActive();
  } catch {
    console.warn("[getAllActiveEntries] Could not load notebook entries.");
    return [];
  }
}

/**
 * Returns one randomly selected active entry.
 * Becomes the opening thought when the page loads.
 */
export async function getRandomEntry(
  repository?: NotebookRepository
): Promise<NotebookEntry | null> {
  const entries = await getAllActiveEntries(repository);
  if (entries.length === 0) return null;
  return pickRandom(entries);
}
