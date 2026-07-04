"use client";

import { createEntryAction, deleteEntryAction, updateEntryAction } from "@/app/actions/notebook-entries";
import type { Article, Notebook, NotebookEntry } from "@/types";
import { Plus, Edit2, Trash2, Calendar, Sparkles, Check, X, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";

interface NotebookEntriesManagerProps {
  initialEntries: NotebookEntry[];
  notebooks: Notebook[];
  articles: Article[];
}

export default function NotebookEntriesManager({
  initialEntries,
  notebooks,
  articles,
}: NotebookEntriesManagerProps) {
  const [entries, setEntries] = useState<NotebookEntry[]>(initialEntries);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NotebookEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [thought, setThought] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [sourceArticleId, setSourceArticleId] = useState("");
  const [notebookId, setNotebookId] = useState(
    notebooks.find((n) => n.is_default)?.id || notebooks[0]?.id || ""
  );

  const resetForm = () => {
    setTitle("");
    setThought("");
    setDisplayDate("");
    setPriority(0);
    setIsActive(true);
    setSourceArticleId("");
    setNotebookId(notebooks.find((n) => n.is_default)?.id || notebooks[0]?.id || "");
    setEditingEntry(null);
    setFormError(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (entry: NotebookEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title || "");
    setThought(entry.thought);
    setDisplayDate(entry.display_date || "");
    setPriority(entry.priority);
    setIsActive(entry.is_active);
    setSourceArticleId(entry.source_article_id || "");
    setNotebookId(entry.notebook_id);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim()) {
      setFormError("The thought content is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        notebook_id: notebookId,
        title: title.trim() || null,
        thought: thought.trim(),
        slug: null,
        source_article_id: sourceArticleId || null,
        is_active: isActive,
        priority: Number(priority),
        display_date: displayDate || null,
      };

      if (editingEntry) {
        const result = await updateEntryAction(editingEntry.id, payload);
        if (result.success && result.data) {
          setEntries((prev) =>
            prev.map((e) => (e.id === editingEntry.id ? result.data! : e))
          );
          resetForm();
        } else {
          setFormError(result.error || "Failed to update entry");
        }
      } else {
        const result = await createEntryAction(payload);
        if (result.success && result.data) {
          setEntries((prev) => [result.data!, ...prev]);
          resetForm();
        } else {
          setFormError(result.error || "Failed to create entry");
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notebook entry?")) return;

    startTransition(async () => {
      const result = await deleteEntryAction(id);
      if (result.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert(result.error || "Failed to delete entry");
      }
    });
  };

  const handleToggleActive = async (entry: NotebookEntry) => {
    startTransition(async () => {
      const newActive = !entry.is_active;
      const result = await updateEntryAction(entry.id, { is_active: newActive });
      if (result.success && result.data) {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? result.data! : e))
        );
      } else {
        alert(result.error || "Failed to toggle status");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
            Notebook Entries
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Write and schedule thoughts for the home page ink-drying hero and Today&apos;s Page.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-md"
          >
            <Plus className="h-4 w-4" /> Add Entry
          </button>
        )}
      </div>

      {/* Editor Form (Modal-like Inline Container) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-6 border border-border bg-card rounded-xl space-y-6 animate-fade-in shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-serif font-bold text-foreground">
              {editingEntry ? "Edit Notebook Entry" : "Create Notebook Entry"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-500 text-xs flex items-center gap-2 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thought Content */}
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="thought" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Thought / Sentence (Required)
              </label>
              <textarea
                id="thought"
                rows={3}
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="e.g. Curiosity scales better than certainty."
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
                required
              />
            </div>

            {/* Context Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Label / Title (Optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Today I wondered..."
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            {/* Notebook ID */}
            <div className="space-y-1.5">
              <label htmlFor="notebook" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Notebook Collection
              </label>
              <select
                id="notebook"
                value={notebookId}
                onChange={(e) => setNotebookId(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              >
                {notebooks.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} {n.is_default ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Date */}
            <div className="space-y-1.5">
              <label htmlFor="displayDate" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Today&apos;s Page Schedule (Optional)
              </label>
              <input
                id="displayDate"
                type="date"
                value={displayDate}
                onChange={(e) => setDisplayDate(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
              <p className="text-[10px] text-muted-foreground">
                Assign a calendar day to pin this entry on the home page as &ldquo;Today&apos;s Page&rdquo;.
              </p>
            </div>

            {/* Linked Article */}
            <div className="space-y-1.5">
              <label htmlFor="sourceArticle" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Inspired / Source Article (Optional)
              </label>
              <select
                id="sourceArticle"
                value={sourceArticleId}
                onChange={(e) => setSourceArticleId(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              >
                <option value="">None</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Rotation Priority
              </label>
              <input
                id="priority"
                type="number"
                min={0}
                max={100}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
              <p className="text-[10px] text-muted-foreground">
                Higher numbers appear more frequently in the hero rotation (0 = standard).
              </p>
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center gap-3 pt-6">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4.5 w-4.5 rounded-sm border-border text-foreground focus:ring-0 focus:ring-offset-0 accent-foreground cursor-pointer"
              />
              <label htmlFor="isActive" className="text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer select-none">
                Active in Rotation
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-border hover:bg-muted/10 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer rounded-md"
            >
              {isPending ? "Saving..." : editingEntry ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </form>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-foreground">All Notebook Thoughts</h2>
        {entries.length === 0 ? (
          <div className="p-8 border border-dashed border-border rounded-xl text-center">
            <p className="text-sm text-muted-foreground">No thoughts written yet. Write your first thought above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {entries.map((entry) => {
              const matchedArticle = articles.find((a) => a.id === entry.source_article_id);
              const matchedNotebook = notebooks.find((n) => n.id === entry.notebook_id);

              return (
                <div
                  key={entry.id}
                  className={`p-6 border rounded-xl bg-card transition-all duration-200 ${
                    entry.is_active ? "border-border" : "border-border/40 opacity-60"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Content Area */}
                    <div className="space-y-3 flex-1">
                      {/* Top labels */}
                      <div className="flex flex-wrap items-center gap-2">
                        {entry.title && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-sm">
                            {entry.title}
                          </span>
                        )}
                        {matchedNotebook && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-foreground bg-foreground/5 border border-foreground/10 px-2 py-0.5 rounded-sm">
                            {matchedNotebook.name}
                          </span>
                        )}
                        {entry.priority > 0 && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-sm inline-flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> Priority {entry.priority}
                          </span>
                        )}
                        {entry.display_date && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 rounded-sm inline-flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" /> {entry.display_date}
                          </span>
                        )}
                      </div>

                      {/* Main Thought Text */}
                      <blockquote className="font-serif text-lg font-bold text-foreground leading-snug">
                        &ldquo;{entry.thought}&rdquo;
                      </blockquote>

                      {/* Attached Article */}
                      {matchedArticle && (
                        <p className="text-[11px] text-muted-foreground">
                          Inspired by article: <span className="font-semibold text-foreground">{matchedArticle.title}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-2 self-end md:self-start">
                      {/* Active Status toggle */}
                      <button
                        onClick={() => handleToggleActive(entry)}
                        title={entry.is_active ? "Deactivate" : "Activate"}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          entry.is_active
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10"
                            : "border-border bg-muted/5 text-muted-foreground hover:bg-muted/10"
                        }`}
                      >
                        {entry.is_active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick(entry)}
                        title="Edit Entry"
                        className="p-2 rounded-lg border border-border bg-card text-foreground hover:border-foreground transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        title="Delete Entry"
                        className="p-2 rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
