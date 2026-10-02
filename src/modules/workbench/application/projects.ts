import type { ProjectRepository } from "../domain/ports";
import type { Project, ProjectInput, ProjectsAdminResult } from "../domain/project";

export async function getPublishedProjects(
  repository: ProjectRepository,
  limit?: number
): Promise<Project[]> {
  return repository.findPublished(limit);
}

export async function getAllProjectsAdmin(
  repository: ProjectRepository
): Promise<ProjectsAdminResult> {
  return repository.findAllAdmin();
}

export async function createProject(
  input: ProjectInput,
  repository: ProjectRepository
): Promise<Project> {
  return repository.create(input);
}

export async function updateProject(
  id: string,
  input: Partial<ProjectInput>,
  repository: ProjectRepository
): Promise<Project> {
  return repository.update(id, input);
}

export async function deleteProject(id: string, repository: ProjectRepository): Promise<void> {
  return repository.delete(id);
}
