import type { Notebook, NotebookEntry } from "./domain/types";
import {
  getAllActiveEntries as loadActiveEntries,
  getRandomEntry as loadRandomEntry,
} from "./application/get-homepage-entry";
import {
  createEntryAdmin as createThought,
  deleteEntryAdmin as deleteThought,
  getDefaultNotebookIdAdmin as loadDefaultNotebookId,
  getAllEntriesAdmin as loadEntriesAdmin,
  getAllNotebooksAdmin as loadNotebooksAdmin,
  updateEntryAdmin as updateThought,
} from "./application/manage-entries";
import { SupabaseNotebookRepository } from "./infrastructure/notebook-repository";

function thoughts() {
  return new SupabaseNotebookRepository();
}

export async function getAllActiveEntries() {
  return loadActiveEntries(thoughts());
}

export async function getRandomEntry() {
  return loadRandomEntry(thoughts());
}

export async function getAllEntriesAdmin(): Promise<NotebookEntry[]> {
  return loadEntriesAdmin(thoughts());
}

export async function getAllNotebooksAdmin(): Promise<Notebook[]> {
  return loadNotebooksAdmin(thoughts());
}

export async function getDefaultNotebookIdAdmin(): Promise<string> {
  return loadDefaultNotebookId(thoughts());
}

export async function createEntryAdmin(
  input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">
) {
  return createThought(input, thoughts());
}

export async function updateEntryAdmin(
  id: string,
  input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>
) {
  return updateThought(id, input, thoughts());
}

export async function deleteEntryAdmin(id: string) {
  return deleteThought(id, thoughts());
}

export type { Notebook, NotebookEntry };

