export interface Notebook {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotebookEntry {
  id: string;
  notebook_id: string;
  title: string | null;
  thought: string;
  slug: string | null;
  source_article_id: string | null;
  is_active: boolean;
  priority: number;
  display_date: string | null;
  created_at: string;
  updated_at: string;
}
