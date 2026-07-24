import { createAdminClient } from "@/lib/db/server";

export interface AuditLogInput {
  userId: string;
  action: string;
  targetType: "article" | "margin_note" | "shared_page" | "notebook_entry" | "subscriber";
  targetId?: string | null;
  details?: Record<string, unknown>;
}

export interface AuditLogItem {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

/**
 * Record an audit log entry on the server using service role.
 * Non-blocking: fails silently with console warning so core actions succeed.
 */
export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("audit_logs").insert({
      user_id: input.userId,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId ?? null,
      details: input.details ?? {},
    });

    if (error) {
      console.warn("[AuditLog] Failed to insert audit log entry:", error.message);
    }
  } catch (err) {
    console.warn("[AuditLog] Audit log recording failed silently:", err);
  }
}

/**
 * Fetch latest audit logs for admin review.
 */
export async function getAuditLogsAdmin(limit = 50): Promise<AuditLogItem[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[AuditLog] Error fetching audit logs:", error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      action: row.action,
      target_type: row.target_type,
      target_id: row.target_id,
      details: (row.details as Record<string, unknown>) || {},
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error("[AuditLog] Exception fetching audit logs:", err);
    return [];
  }
}
