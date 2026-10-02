export const PROJECT_STATUSES = ["Building", "Active", "Shipped", "Continuous", "Paused"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  name: string;
  category: string;
  status: ProjectStatus;
  overview: string;
  why_started: string | null;
  what_im_learning: string | null;
  stack: string[];
  url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput extends Omit<Project, "id" | "created_at" | "updated_at"> {}

export interface ProjectsAdminResult {
  projects: Project[];
  tableReady: boolean;
}
