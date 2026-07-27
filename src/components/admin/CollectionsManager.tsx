"use client";

import { createCollectionAction, deleteCollectionAction } from "@/app/actions/collections";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import type { Collection } from "@/types";
import { Layers, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

interface CollectionsManagerProps {
  initialCollections: Collection[];
}

export default function CollectionsManager({ initialCollections }: CollectionsManagerProps) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toasts, showSuccess, showError } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      const result = await createCollectionAction({
        title: title.trim(),
        description: description.trim() || null,
        is_published: false,
      });

      if (result.success && result.data) {
        setCollections((prev) => [result.data as Collection, ...prev]);
        setTitle("");
        setDescription("");
        showSuccess(`Collection "${result.data.title}" created.`);
      } else {
        showError(result.error || "Failed to create collection.");
      }
    });
  };

  const handleDelete = async (id: string, colTitle: string) => {
    const ok = await confirm({
      title: "Delete Collection",
      message: `Are you sure you want to delete "${colTitle}"? This will not delete the individual articles.`,
      confirmLabel: "Delete Collection",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteCollectionAction(id);
      if (result.success) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        showSuccess(`Collection "${colTitle}" deleted.`);
      } else {
        showError(result.error || "Failed to delete collection.");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {ConfirmDialog}
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
          Editorial Collections
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Curate ordered reading series and learning paths for readers.
        </p>
      </div>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="p-6 border border-border bg-card rounded-xl space-y-4 shadow-xs"
      >
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-gold" /> Create New Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="collection-title"
              className="text-xs font-semibold text-muted-foreground"
            >
              Title
            </label>
            <input
              id="collection-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NAO Robotics Optimization Series"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="collection-desc"
              className="text-xs font-semibold text-muted-foreground"
            >
              Description (Optional)
            </label>
            <input
              id="collection-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of what readers will learn"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Create Collection
          </button>
        </div>
      </form>

      {/* Collections List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Existing Collections ({collections.length})
        </h2>

        {collections.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              No collections created yet. Add your first collection above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((col) => (
              <div
                key={col.id}
                className="p-5 border border-border bg-card rounded-xl space-y-3 flex flex-col justify-between hover:border-border/80 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        col.is_published
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {col.is_published ? "Published" : "Draft"}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      /collections/{col.slug}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-foreground">{col.title}</h3>
                  {col.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{col.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/collections/${col.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-gold hover:underline"
                  >
                    <Layers className="h-3.5 w-3.5" /> Manage Articles
                  </Link>
                  <button
                    onClick={() => handleDelete(col.id, col.title)}
                    disabled={isPending}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Collection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
