import type { MarginNote, ModerationStatus, SharedPage } from "./types";

export interface MarginNoteRepository {
  findApprovedForNote(noteId: string): Promise<MarginNote[]>;
  insert(noteId: string, authorName: string, content: string): Promise<MarginNote>;
  findAllAdmin(): Promise<MarginNote[]>;
  updateStatus(id: string, status: ModerationStatus): Promise<MarginNote>;
  updatePin(id: string, pinned: boolean): Promise<MarginNote>;
  delete(id: string): Promise<boolean>;
}

export interface SharedPageRepository {
  findAllApproved(): Promise<SharedPage[]>;
  findBySlug(slug: string): Promise<SharedPage | null>;
  insert(
    authorName: string,
    title: string | null,
    content: string,
    wordCount: number
  ): Promise<SharedPage>;
  findAllAdmin(): Promise<SharedPage[]>;
  updateStatus(id: string, status: ModerationStatus): Promise<SharedPage>;
  delete(id: string): Promise<boolean>;
}
