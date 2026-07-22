"use server";

import { isAuthorizedAdmin } from "@/lib/auth/admin-access";
import { auth, currentUser } from "@clerk/nextjs/server";
import { AdminAuthError } from "./admin-errors";

/**
 * Ensures the caller is a signed-in, authorized admin before service-role mutations.
 * Throws AdminAuthError on failure.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      throw new AdminAuthError("Unauthorized: sign in required.", 401);
    }

    const user = await currentUser();
    const role = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : null;

    const allowed = isAuthorizedAdmin({
      userId,
      allowlistRaw: process.env.ADMIN_USER_IDS,
      role,
      nodeEnv: process.env.NODE_ENV,
    });

    if (!allowed) {
      console.warn("[requireAdmin] Forbidden admin attempt:", userId);
      throw new AdminAuthError("Forbidden: admin access required.", 403);
    }

    if (
      process.env.NODE_ENV === "development" &&
      !process.env.ADMIN_USER_IDS?.trim() &&
      role !== "admin"
    ) {
      console.warn(
        "[requireAdmin] ADMIN_USER_IDS unset — allowing any signed-in user in development only."
      );
    }

    return { userId };
  } catch (error) {
    if (error instanceof AdminAuthError) throw error;
    console.error("[requireAdmin] Unexpected error:", error);
    throw new AdminAuthError("Unauthorized: admin check failed.", 401);
  }
}
