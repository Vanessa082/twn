import type { NotebookRepository } from "../domain/ports";
import type { Notebook, NotebookEntry } from "../domain/types";

export async function getAllEntriesAdmin(repository: NotebookRepository): Promise<NotebookEntry[]> {
  return repository.findAllAdmin();
}

export async function getAllNotebooksAdmin(repository: NotebookRepository): Promise<Notebook[]> {
  return repository.findAllNotebooks();
}

export async function getDefaultNotebookIdAdmin(repository: NotebookRepository): Promise<string> {
  return repository.getDefaultNotebookId();
}

export async function createEntryAdmin(
  input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">,
  repository: NotebookRepository
): Promise<NotebookEntry> {
  return repository.create(input);
}

export async function updateEntryAdmin(
  id: string,
  input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>,
  repository: NotebookRepository
): Promise<NotebookEntry> {
  return repository.update(id, input);
}

export async function deleteEntryAdmin(
  id: string,
  repository: NotebookRepository
): Promise<boolean> {
  return repository.delete(id);
}
