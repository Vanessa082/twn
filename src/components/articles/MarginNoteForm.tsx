"use client";

import { submitMarginNoteAction } from "@/app/actions/margin-notes";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";

interface MarginNoteFormProps {
  articleId: string;
}

export default function MarginNoteForm({ articleId }: MarginNoteFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const charLimit = 120;
  const charsLeft = charLimit - content.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write something before submitting.");
      return;
    }
    if (content.length > charLimit) {
      setError("Your reflection must be 120 characters or less.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await submitMarginNoteAction(
        articleId,
        authorName.trim() || "Anonymous",
        content.trim()
      );

      if (result.success) {
        setSuccess(true);
        setContent("");
        setAuthorName("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.error || "Failed to submit reflection.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Leave a Margin Note
        </h4>
        <p className="text-[11px] text-muted-foreground">
          Write a concise reflection (maximum 120 characters). It will appear in the margin once
          approved.
        </p>
      </div>

      {success ? (
        <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded-lg flex items-start gap-2.5 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Note submitted to the margins! It will appear here once approved by TWN editors.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-500 text-[11px] flex items-start gap-2 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {/* Content Area */}
            <div className="relative">
              <textarea
                rows={2}
                maxLength={charLimit}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g. This is exactly what we struggle with in early startups."
                disabled={isPending}
                className="w-full p-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60 leading-relaxed font-serif"
                required
              />
              <span
                className={`absolute right-3 bottom-3 text-[9px] font-bold ${
                  charsLeft < 15 ? "text-red-500" : "text-muted-foreground/50"
                }`}
              >
                {charsLeft}
              </span>
            </div>

            {/* Author details & Submit inline */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name (Anonymous)"
                disabled={isPending}
                className="flex-1 p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60"
              />

              <button
                type="submit"
                disabled={isPending || !content.trim() || content.length > charLimit}
                className="inline-flex h-9 items-center justify-center gap-1.5 border border-foreground bg-foreground px-4 text-xs font-bold uppercase tracking-wider text-background hover:bg-background hover:text-foreground transition-all cursor-pointer rounded-lg disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Send
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
