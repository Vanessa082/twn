"use client";

import { submitSharedPageAction } from "@/app/actions/shared-pages";
import { AlertCircle, CheckCircle2, Feather, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

interface LeaveAPageFormProps {
  onSuccess?: () => void;
}

export default function LeaveAPageForm({ onSuccess }: LeaveAPageFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Word count calculator
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isWordCountValid = wordCount >= 10 && wordCount <= 300;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write a reflection before submitting.");
      return;
    }
    if (wordCount < 10) {
      setError("Please expand your reflection a bit more (minimum 10 words).");
      return;
    }
    if (wordCount > 300) {
      setError("Please shorten your reflection (maximum 300 words).");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await submitSharedPageAction(
        authorName.trim() || "Anonymous",
        title.trim() || null,
        content.trim()
      );

      if (result.success) {
        setSuccess(true);
        setAuthorName("");
        setTitle("");
        setContent("");
        if (onSuccess) {
          setTimeout(onSuccess, 3000);
        }
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    });
  };

  if (success) {
    return (
      <div className="p-8 text-center space-y-4 animate-fade-in">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-foreground">Reflection Shared</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Your page has been added to our pending pile. Once reviewed by our editorial team, it will
          appear on the Shared Pages wall. Thank you for reading and sharing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {error && (
        <div className="p-3.5 border border-red-500/20 bg-red-500/5 text-red-500 text-xs flex items-start gap-2.5 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Author Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="authorName"
          className="text-[10px] font-bold uppercase tracking-wider text-foreground"
        >
          Your Name / Display Alias (Optional)
        </label>
        <input
          id="authorName"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="e.g. Sarah K. (or leave blank to remain Anonymous)"
          disabled={isPending}
          className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
        />
      </div>

      {/* Reflection Title */}
      <div className="space-y-1.5">
        <label
          htmlFor="refTitle"
          className="text-[10px] font-bold uppercase tracking-wider text-foreground"
        >
          Reflection Title (Optional)
        </label>
        <input
          id="refTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Transitioning at Thirty"
          disabled={isPending}
          className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
        />
      </div>

      {/* Content Area */}
      <div className="space-y-1.5 relative">
        <div className="flex justify-between items-center">
          <label
            htmlFor="refContent"
            className="text-[10px] font-bold uppercase tracking-wider text-foreground"
          >
            Your Reflection (Required)
          </label>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              wordCount > 0 && !isWordCountValid ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {wordCount} / 300 words
          </span>
        </div>
        <textarea
          id="refContent"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience, lessons, challenges or ideas. What would you write on a physical notebook page for others to see?"
          disabled={isPending}
          className="w-full p-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors disabled:opacity-50 leading-relaxed font-serif"
          required
        />
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Feather className="h-3 w-3" />
          <span>Write between 10 and 300 words.</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || (content.length > 0 && !isWordCountValid)}
        className="w-full inline-flex h-11 items-center justify-center gap-2 border-2 border-foreground bg-foreground px-6 text-xs font-bold uppercase tracking-wider text-background hover:bg-background hover:text-foreground transition-all-premium disabled:opacity-50 cursor-pointer rounded-lg"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting Page...
          </>
        ) : (
          "Submit Reflection Page"
        )}
      </button>
    </form>
  );
}
