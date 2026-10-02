import type { NotebookRepository } from "../domain/ports";
import type { NotebookEntry } from "../domain/types";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function getAllActiveEntries(
  repository: NotebookRepository
): Promise<NotebookEntry[]> {
  try {
    return await repository.findAllActive();
  } catch {
    console.warn("[getAllActiveEntries] Could not load notebook entries.");
    return [];
  }
}

export async function getRandomEntry(
  repository: NotebookRepository
): Promise<NotebookEntry | null> {
  const entries = await getAllActiveEntries(repository);
  if (entries.length === 0) return null;
  return pickRandom(entries);
}
