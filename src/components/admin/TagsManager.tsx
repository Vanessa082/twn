"use client";

import { createTagAction, deleteTagAction } from "@/app/actions/tags";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import type { Tag } from "@/types";
import { Loader2, Plus, Tag as TagIcon, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

interface TagsManagerProps {
  initialTags: Tag[];
}

export default function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [tagName, setTagName] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toasts, showSuccess, showError } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = tagName.trim();
    if (!name) return;

    startTransition(async () => {
      const result = await createTagAction(name);
      if (result.success && result.data) {
        const newTag = result.data;
        setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
        setTagName("");
        showSuccess(`Tag "${newTag.name}" created.`);
      } else {
        showError(result.error || "Failed to create tag.");
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Delete Tag",
      message: `Are you sure you want to delete "${name}"? This will remove the tag from all associated articles.`,
      confirmLabel: "Delete Tag",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteTagAction(id);
      if (result.success) {
        setTags((prev) => prev.filter((t) => t.id !== id));
        showSuccess(`Tag "${name}" deleted.`);
      } else {
        showError(result.error || "Failed to delete tag.");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {ConfirmDialog}
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
          Tags Management
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage granular discovery labels used across articles and topic pages.
        </p>
      </div>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="p-6 border border-border bg-card rounded-xl space-y-4 shadow-xs"
      >
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-gold" /> Add New Tag
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="e.g. Mentorship, Python, Leadership"
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={isPending || !tagName.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Create Tag
          </button>
        </div>
      </form>

      {/* Tags List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Existing Tags ({tags.length})
        </h2>

        {tags.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              No tags created yet. Add your first tag above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border border-border bg-card rounded-lg hover:border-border/80 transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <TagIcon className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-foreground truncate">{tag.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      /topics/{tag.slug}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  disabled={isPending}
                  className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  title="Delete Tag"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
