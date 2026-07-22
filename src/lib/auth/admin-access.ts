/**
 * Pure admin authorization helpers (no Clerk imports).
 * Used by middleware, requireAdmin, and unit tests.
 */

export type AdminAccessInput = {
  userId: string | null | undefined;
  /** Comma-separated Clerk user IDs from ADMIN_USER_IDS */
  allowlistRaw: string | null | undefined;
  /** Clerk publicMetadata.role (or session claim equivalent) */
  role: string | null | undefined;
  nodeEnv: string | null | undefined;
};

export function parseAdminUserIds(raw: string | null | undefined): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

/**
 * Decide whether a signed-in user may access admin surfaces.
 *
 * Rules (first match wins):
 * 1. No userId → deny
 * 2. Allowlist non-empty → userId must be listed
 * 3. role === "admin" → allow
 * 4. development + empty allowlist + no role → allow (local learning), else deny
 */
export function isAuthorizedAdmin(input: AdminAccessInput): boolean {
  const userId = input.userId?.trim();
  if (!userId) return false;

  const allowlist = parseAdminUserIds(input.allowlistRaw);
  if (allowlist.length > 0) {
    return allowlist.includes(userId);
  }

  if (input.role === "admin") {
    return true;
  }

  const env = input.nodeEnv ?? "development";
  if (env === "development") {
    return true;
  }

  return false;
}
