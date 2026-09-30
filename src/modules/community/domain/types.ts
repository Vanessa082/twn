export type ModerationStatus = "pending" | "approved" | "rejected";

export interface SharedPage {
  id: string;
  author_name: string;
  title: string | null;
  content: string;
  word_count: number;
  status: ModerationStatus;
  submitted_at: string;
  published_at: string | null;
  updated_at: string;
}

export interface MarginNote {
  id: string;
  article_id: string;
  author_name: string;
  content: string;
  status: ModerationStatus;
  display_order: number;
  submitted_at: string;
  published_at: string | null;
  updated_at: string;
}
