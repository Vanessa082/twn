"use client";

import { moderateSharedPageAction, deleteSharedPageAction } from "@/app/actions/shared-pages";
import type { SharedPage, ModerationStatus } from "@/types";
import { Check, X, Trash2, Calendar, AlertCircle, Clock, Eye } from "lucide-react";
import { useState, useTransition } from "react";

interface SharedPagesModeratorProps {
  initialPages: SharedPage[];
}

export default function SharedPagesModerator({ initialPages }: SharedPagesModeratorProps) {
  const [pages, setPages] = useState<SharedPage[]>(initialPages);
  const [filter, setFilter] = useState<ModerationStatus | "all">("pending");
  const [isPending, startTransition] = useTransition();
  const [readingPage, setReadingPage] = useState<SharedPage | null>(null);

  const filteredPages = pages.filter((page) => {
    if (filter === "all") return true;
    return page.status === filter;
  });

  const handleModerate = async (id: string, status: ModerationStatus) => {
    startTransition(async () => {
      const result = await moderateSharedPageAction(id, status);
      if (result.success && result.data) {
        setPages((prev) =>
          prev.map((p) => (p.id === id ? result.data! : p))
        );
      } else {
        alert(result.error || "Failed to update moderation status.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this shared page submission?")) return;

    startTransition(async () => {
      const result = await deleteSharedPageAction(id);
      if (result.success) {
        setPages((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(result.error || "Failed to delete submission.");
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
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
          Shared Pages Moderation
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review, approve, or reject reflections submitted by visitors for the Shared Pages section.
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
            {tab} ({pages.filter((p) => tab === "all" || p.status === tab).length})
          </button>
        ))}
      </div>

      {/* List */}
      {filteredPages.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No submissions found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="p-6 border border-border bg-card rounded-xl space-y-4 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Submitted by:
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {page.author_name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${getStatusBadgeClass(page.status)}`}>
                      {page.status}
                    </span>
                  </div>
                  {page.title && (
                    <h3 className="font-serif font-bold text-lg text-foreground">
                      {page.title}
                    </h3>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {new Date(page.submitted_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="border-l border-border pl-2">
                    {page.word_count} words
                  </span>
                </div>
              </div>

              {/* Thought Text */}
              <p className="font-serif text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 border border-border/60 rounded-lg italic">
                &ldquo;{page.content}&rdquo;
              </p>

              {/* Actions panel */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <button
                  onClick={() => setReadingPage(page)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Eye className="h-4 w-4" /> Full Preview
                </button>

                <div className="flex items-center gap-2">
                  {page.status !== "approved" && (
                    <button
                      onClick={() => handleModerate(page.id, "approved")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {page.status !== "rejected" && (
                    <button
                      onClick={() => handleModerate(page.id, "rejected")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}
                  {page.status !== "pending" && (
                    <button
                      onClick={() => handleModerate(page.id, "pending")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted/10 border border-border text-muted-foreground hover:bg-muted/25 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Clock className="h-3.5 w-3.5" /> Move to Pending
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(page.id)}
                    disabled={isPending}
                    className="p-1.5 border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Permanently"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      {readingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fade-in">
          <div
            className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-xl p-8 sm:p-10 overflow-y-auto max-h-[85vh] transition-colors"
            style={{
              backgroundImage: "linear-gradient(to right, rgba(220, 38, 38, 0.08) 1px, transparent 1px)",
              backgroundSize: "40px 100%",
              backgroundPosition: "left",
            }}
          >
            <div className="absolute left-[39px] inset-y-0 w-[1px] bg-red-500/15" />

            <button
              onClick={() => setReadingPage(null)}
              className="absolute right-6 top-6 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pl-6 space-y-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/65 px-2 py-0.5 rounded-sm">
                Full Preview
              </span>

              {readingPage.title && (
                <h3 className="font-serif text-2xl font-black leading-tight text-foreground">
                  {readingPage.title}
                </h3>
              )}

              <p className="font-serif text-base sm:text-lg text-foreground leading-relaxed italic whitespace-pre-wrap">
                &ldquo;{readingPage.content}&rdquo;
              </p>

              <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">— {readingPage.author_name}</span>
                <span>Submitted at {new Date(readingPage.submitted_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
