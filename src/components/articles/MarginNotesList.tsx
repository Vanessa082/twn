"use client";

import type { MarginNote } from "@/types";
import { MessageSquare, Pin } from "lucide-react";
import MarginNoteForm from "./MarginNoteForm";

interface MarginNotesListProps {
  articleId: string;
  notes: MarginNote[];
}

export default function MarginNotesList({ articleId, notes }: MarginNotesListProps) {
  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-10 border-t border-border pt-12">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <MessageSquare className="h-4.5 w-4.5 text-muted-foreground" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Margin Reflections ({notes.length})
        </h3>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="p-6 border border-dashed border-border rounded-lg text-center bg-card/20">
          <p className="text-xs text-muted-foreground">
            No reflections left in the margin yet. Be the first to leave one below.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const isPinned = note.display_order === 0;

            return (
              <div
                key={note.id}
                className={`relative p-4 border rounded-lg bg-card/40 transition-colors ${
                  isPinned ? "border-amber-500/25 bg-amber-500/[0.01]" : "border-border/60"
                }`}
              >
                {isPinned && (
                  <span
                    title="Editor's Choice / Pinned"
                    className="absolute right-3 top-3 text-amber-600"
                  >
                    <Pin className="h-3 w-3 fill-amber-600 rotate-45" />
                  </span>
                )}

                <div className="space-y-2 max-w-[95%]">
                  <p className="font-serif text-sm text-foreground/80 leading-relaxed italic">
                    &ldquo;{note.content}&rdquo;
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground">— {note.author_name}</span>
                    <span className="text-border select-none">·</span>
                    <span>{formatDate(note.published_at || note.submitted_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Form */}
      <div className="bg-muted/15 border border-border/80 p-5 sm:p-6 rounded-xl">
        <MarginNoteForm articleId={articleId} />
      </div>
    </div>
  );
}
