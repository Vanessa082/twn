import type { Notebook, NotebookEntry } from "./types";
export interface NotebookRepository {
  findAllActive(): Promise<NotebookEntry[]>;
  findByDate(date: string): Promise<NotebookEntry | null>;
  findAllAdmin(): Promise<NotebookEntry[]>;
  findAllNotebooks(): Promise<Notebook[]>;
  getDefaultNotebookId(): Promise<string>;
  create(input: Omit<NotebookEntry, "id" | "created_at" | "updated_at">): Promise<NotebookEntry>;
  update(
    id: string,
    input: Partial<Omit<NotebookEntry, "id" | "created_at" | "updated_at">>
  ): Promise<NotebookEntry>;
  delete(id: string): Promise<boolean>;
}
