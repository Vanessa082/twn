"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { canManageProjects } from "@/lib/auth/policies";
import {
  type ProjectInput,
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/services/projects";
import { entityIdSchema, projectSchema, updateProjectSchema } from "@/lib/validation/schemas";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { revalidatePath } from "next/cache";

function revalidateWorkbench() {
  revalidatePath("/");
  revalidatePath("/workbench");
  revalidatePath("/admin/content/workbench");
}

export async function createProjectAction(input: ProjectInput) {
  try {
    const { userId } = await canManageProjects();
    const project = await createProject(projectSchema.parse(input));

    await recordAuditLog({
      userId,
      action: "project.created",
      targetType: "project",
      targetId: project.id,
      details: { name: project.name, published: project.is_published },
    });

    revalidateWorkbench();
    return { success: true, data: project, error: null };
  } catch (error: unknown) {
    console.error("[createProjectAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to create project",
    };
  }
}

export async function updateProjectAction(id: string, input: Partial<ProjectInput>) {
  try {
    const { userId } = await canManageProjects();
    const validatedId = entityIdSchema.parse(id);
    const project = await updateProject(validatedId, updateProjectSchema.parse(input));

    await recordAuditLog({
      userId,
      action: "project.updated",
      targetType: "project",
      targetId: project.id,
      details: { name: project.name, published: project.is_published },
    });

    revalidateWorkbench();
    return { success: true, data: project, error: null };
  } catch (error: unknown) {
    console.error("[updateProjectAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update project",
    };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const { userId } = await canManageProjects();
    const validatedId = entityIdSchema.parse(id);
    await deleteProject(validatedId);

    await recordAuditLog({
      userId,
      action: "project.deleted",
      targetType: "project",
      targetId: validatedId,
    });

    revalidateWorkbench();
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteProjectAction] Error:", toAdminActionError(error));
    return { success: false, error: toAdminActionError(error) || "Failed to delete project" };
  }
}
