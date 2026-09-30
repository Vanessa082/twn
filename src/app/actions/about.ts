"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { canAccessAdmin } from "@/lib/auth/policies";
import { updateAboutData } from "@/lib/services/about";
import { aboutDataSchema } from "@/lib/validation/schemas";
import { recordAuditLog } from "@/platform/audit/audit-log";
import type { AboutData } from "@/types/about";
import { revalidatePath } from "next/cache";

export async function updateAboutAction(data: AboutData) {
  try {
    const { userId } = await canAccessAdmin();
    const validated = aboutDataSchema.parse(data);
    const updated = await updateAboutData(validated);

    await recordAuditLog({
      userId,
      action: "about_page.updated",
      targetType: "about_settings",
      targetId: "default",
      details: {
        sections: Object.keys(validated.section_visibility),
        updatedAt: updated.updated_at,
      },
    });

    revalidatePath("/about");
    revalidatePath("/admin/content/about");
    return { success: true, data: updated, error: null };
  } catch (error: unknown) {
    console.error("[updateAboutAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update about page sections",
    };
  }
}
