import type { Project, ProjectInput, ProjectsAdminResult } from "./project";

export interface ProjectRepository {
  findPublished(limit?: number): Promise<Project[]>;
  findAllAdmin(): Promise<ProjectsAdminResult>;
  create(input: ProjectInput): Promise<Project>;
  update(id: string, input: Partial<ProjectInput>): Promise<Project>;
  delete(id: string): Promise<void>;
}
