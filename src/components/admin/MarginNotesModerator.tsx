"use client";

import {
  deleteMarginNoteAction,
  moderateMarginNoteAction,
  pinMarginNoteAction,
} from "@/app/actions/margin-notes";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import type { MarginNote, ModerationStatus } from "@/types";
import { Check, Clock, Pin, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";

interface MarginNotesModeratorProps {
  initialNotes: (MarginNote & { article_title?: string })[];
}

export default function MarginNotesModerator({ initialNotes }: MarginNotesModeratorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [filter, setFilter] = useState<ModerationStatus | "all">("pending");
  const [isPending, startTransition] = useTransition();
  const { toasts, showSuccess, showError } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const filteredNotes = notes.filter((note) => {
    if (filter === "all") return true;
    return note.status === filter;
  });

  const handleModerate = async (id: string, status: ModerationStatus) => {
    startTransition(async () => {
      const result = await moderateMarginNoteAction(id, status);
      if (result.success && result.data) {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...result.data } : n)));
        showSuccess(`Note ${status} successfully.`);
      } else {
        showError(result.error || "Failed to update moderation status.");
      }
    });
  };

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    startTransition(async () => {
      const result = await pinMarginNoteAction(id, !currentlyPinned);
      if (result.success && result.data) {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...result.data } : n)));
        showSuccess(currentlyPinned ? "Note unpinned." : "Note pinned to top.");
      } else {
        showError(result.error || "Failed to toggle pin status.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Margin Note",
      message:
        "Are you sure you want to permanently delete this margin note? This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteMarginNoteAction(id);
      if (result.success) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        showSuccess("Note deleted.");
      } else {
        showError(result.error || "Failed to delete note.");
      }
    });
  };

  const getStatusBadgeClass = (status: ModerationStatus) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/5 text-emerald-600 border border-emerald-500/20";
      case "rejected":
        return "bg-red-500/5 text-red-600 border border-red-500/20";
      default:
        return "bg-amber-500/5 text-amber-600 border border-amber-500/20";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {ConfirmDialog}
      <ToastContainer toasts={toasts} />
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
          Margin Notes Moderation
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review, approve, reject, or pin reader reflections in the margins of article pages.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              filter === tab
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab} ({notes.filter((n) => tab === "all" || n.status === tab).length})
          </button>
        ))}
      </div>

      {/* List */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No notes found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredNotes.map((note) => {
            const isPinned = note.display_order === 0;

            return (
              <div
                key={note.id}
                className="p-6 border border-border bg-card rounded-xl space-y-4 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Author:
                      </span>
                      <span className="text-xs font-bold text-foreground">{note.author_name}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${getStatusBadgeClass(note.status)}`}
                      >
                        {note.status}
                      </span>
                      {isPinned && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 border border-amber-500/20 inline-flex items-center gap-0.5">
                          <Pin className="h-2.5 w-2.5 rotate-45 fill-amber-600" /> Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Article:{" "}
                      <span className="font-semibold text-foreground">
                        {note.article_title || "Unknown Article"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(note.submitted_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="border-l border-border pl-2">
                      {note.content.length} / 120 chars
                    </span>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="font-serif text-sm text-foreground/80 leading-relaxed bg-muted/20 p-4 border border-border/60 rounded-lg italic">
                  &ldquo;{note.content}&rdquo;
                </p>

                {/* Actions panel */}
                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  {/* Pin option - only available if Approved */}
                  {note.status === "approved" && (
                    <button
                      onClick={() => handleTogglePin(note.id, isPinned)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 border text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50 ${
                        isPinned
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5 rotate-45" />
                      {isPinned ? "Unpin Note" : "Pin Note"}
                    </button>
                  )}

                  {note.status !== "approved" && (
                    <button
                      onClick={() => handleModerate(note.id, "approved")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {note.status !== "rejected" && (
                    <button
                      onClick={() => handleModerate(note.id, "rejected")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}
                  {note.status !== "pending" && (
                    <button
                      onClick={() => handleModerate(note.id, "pending")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted/10 border border-border text-muted-foreground hover:bg-muted/25 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Clock className="h-3.5 w-3.5" /> Move to Pending
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={isPending}
                    className="p-1.5 border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Permanently"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
