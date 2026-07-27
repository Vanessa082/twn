import type { Notebook, NotebookEntry } from "@/types";
import {
  type NotebookRepository,
  SupabaseNotebookRepository,
} from "../infrastructure/notebook-repository";

export async function getAllEntriesAdmin(
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<NotebookEntry[]> {
  return repository.findAllAdmin();
}

export async function getAllNotebooksAdmin(
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<Notebook[]> {
  return repository.findAllNotebooks();
}

export async function getDefaultNotebookIdAdmin(
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<string> {
  return repository.getDefaultNotebookId();
}

export async function createEntryAdmin(
  input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">,
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<NotebookEntry> {
  return repository.create(input);
}

export async function updateEntryAdmin(
  id: string,
  input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>,
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<NotebookEntry> {
  return repository.update(id, input);
}

export async function deleteEntryAdmin(
  id: string,
  repository: NotebookRepository = new SupabaseNotebookRepository()
): Promise<boolean> {
  return repository.delete(id);
}
