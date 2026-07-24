import { getAuditLogsAdmin } from "@/platform/audit/audit-log";
import { ShieldCheck, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const logs = await getAuditLogsAdmin(100);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
              Audit Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted-gold/10 text-muted-gold border border-muted-gold/20">
              {logs.length} events
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            System audit records tracking all administrative mutations and moderation actions.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
          <ShieldCheck className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-foreground mb-1">No Audit Logs Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Administrative actions such as creating articles, publishing, and moderating community
            submissions will be automatically recorded here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Type</th>
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/15 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-foreground/5 text-foreground border border-border">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-foreground uppercase tracking-wider whitespace-nowrap">
                      {log.target_type}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground max-w-[150px] truncate">
                      <span className="inline-flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-muted-gold" />
                        {log.user_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate">
                      {Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : log.target_id
                          ? `ID: ${log.target_id}`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
