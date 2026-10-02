import {
  createProject as addProject,
  getAllProjectsAdmin as loadProjectsAdmin,
  getPublishedProjects as loadPublishedProjects,
  deleteProject as removeProject,
  updateProject as saveProject,
} from "./application/projects";
import type { ProjectInput } from "./domain/project";
import { SupabaseProjectRepository } from "./infrastructure/projects";

export { PROJECT_STATUSES } from "./domain/project";
export type { Project, ProjectInput, ProjectStatus, ProjectsAdminResult } from "./domain/project";

function projects() {
  return new SupabaseProjectRepository();
}

export async function getPublishedProjects(limit?: number) {
  return loadPublishedProjects(projects(), limit);
}

export async function getAllProjectsAdmin() {
  return loadProjectsAdmin(projects());
}

export async function createProject(input: ProjectInput) {
  return addProject(input, projects());
}

export async function updateProject(id: string, input: Partial<ProjectInput>) {
  return saveProject(id, input, projects());
}

export async function deleteProject(id: string) {
  return removeProject(id, projects());
}
