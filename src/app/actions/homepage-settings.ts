"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { canManageHomepage } from "@/lib/auth/policies";
import {
  type UpdateHomepageSettingsInput,
  updateHomepageSettings,
} from "@/lib/services/homepage-settings";
import { homepageSettingsSchema } from "@/lib/validation/schemas";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { revalidatePath } from "next/cache";

export async function updateHomepageSettingsAction(input: UpdateHomepageSettingsInput) {
  try {
    const { userId } = await canManageHomepage();
    const settings = await updateHomepageSettings(homepageSettingsSchema.parse(input));

    await recordAuditLog({
      userId,
      action: "homepage_settings.updated",
      targetType: "homepage_settings",
      targetId: settings.id,
      details: {
        featuredArticleId: settings.featured_article_id,
        volume: `${settings.volume_label} · ${settings.volume_season}`,
      },
    });

    // The footer reads these settings on every public page.
    revalidatePath("/", "layout");
    revalidatePath("/admin/content/homepage");
    return { success: true, data: settings, error: null };
  } catch (error: unknown) {
    console.error("[updateHomepageSettingsAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update homepage settings",
    };
  }
}
