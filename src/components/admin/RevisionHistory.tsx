"use client";

import { restoreRevisionAction } from "@/app/actions/articles";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import type { ArticleRevision } from "@/types";
import { Clock, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface RevisionHistoryProps {
  revisions: ArticleRevision[];
  articleId: string;
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * RevisionHistory
 *
 * Displays the last N save snapshots for an article with a one-click restore.
 * Rendered as a collapsible sidebar card inside ArticleForm.
 *
 * Engineering note: each restore first saves the current state as a new revision
 * before overwriting, creating an implicit "undo" chain.
 */
export default function RevisionHistory({ revisions, articleId }: RevisionHistoryProps) {
  const [isPending, startTransition] = useTransition();
  const { toasts, showSuccess, showError } = useToast();
  const router = useRouter();

  const handleRestore = (revision: ArticleRevision) => {
    if (isPending) return;
    startTransition(async () => {
      const result = await restoreRevisionAction(revision.id);
      if (result.success) {
        showSuccess(`Restored to version from ${formatRelativeTime(revision.created_at)}.`);
        // Refresh the page so the form fields reflect the restored content
        setTimeout(() => router.refresh(), 800);
      } else {
        showError(result.error ?? "Failed to restore revision.");
      }
    });
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card space-y-4">
      <ToastContainer toasts={toasts} />

      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Clock className="h-4 w-4 text-muted-gold" />
        <h3 className="font-bold text-sm text-foreground">Revision History</h3>
      </div>

      {revisions.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No revisions yet. Each save creates a restore point.
        </p>
      ) : (
        <ul className="space-y-2">
          {revisions.map((rev, idx) => (
            <li
              key={rev.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0"
            >
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{rev.title}</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      rev.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {rev.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(rev.created_at)}
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-gold">
                      Latest
                    </span>
                  )}
                </div>
              </div>

              {idx !== 0 && (
                <button
                  type="button"
                  onClick={() => handleRestore(rev)}
                  disabled={isPending}
                  title={`Restore to version from ${formatRelativeTime(rev.created_at)}`}
                  className="shrink-0 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer disabled:opacity-40"
                >
                  <RotateCcw className="h-3 w-3" /> Restore
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-muted-foreground">
        Up to 20 revisions are kept. Restoring creates a new save point first.
      </p>
    </div>
  );
}
