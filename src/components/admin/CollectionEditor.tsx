"use client";

import { setCollectionArticlesAction, updateCollectionAction } from "@/app/actions/collections";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import type { ArticleCard, CollectionWithArticles } from "@/types";
import { ArrowDown, ArrowLeft, ArrowUp, Globe, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

interface CollectionEditorProps {
  collection: CollectionWithArticles;
  availableArticles: ArticleCard[];
}

export default function CollectionEditor({ collection, availableArticles }: CollectionEditorProps) {
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description || "");
  const [coverImage, setCoverImage] = useState(collection.cover_image || "");
  const [isPublished, setIsPublished] = useState(collection.is_published);
  const [items, setItems] = useState<ArticleCard[]>(collection.items.map((i) => i.article));

  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toasts, showSuccess, showError } = useToast();

  const unselectedArticles = availableArticles.filter(
    (a) => !items.some((item) => item.id === a.id)
  );

  const handleAddArticle = () => {
    if (!selectedArticleId) return;
    const target = availableArticles.find((a) => a.id === selectedArticleId);
    if (!target) return;
    setItems((prev) => [...prev, target]);
    setSelectedArticleId("");
  };

  const handleRemoveArticle = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const next = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setItems(next);
  };

  const handleSave = () => {
    startTransition(async () => {
      // 1. Update collection metadata
      const metaRes = await updateCollectionAction(collection.id, {
        title,
        description: description || null,
        cover_image: coverImage || null,
        is_published: isPublished,
      });

      if (!metaRes.success) {
        showError(metaRes.error || "Failed to update metadata.");
        return;
      }

      // 2. Sync ordered articles
      const articleIds = items.map((i) => i.id);
      const itemsRes = await setCollectionArticlesAction(collection.id, articleIds);

      if (!itemsRes.success) {
        showError(itemsRes.error || "Failed to save collection items.");
        return;
      }

      showSuccess("Collection saved successfully.");
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <ToastContainer toasts={toasts} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/collections"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
              Edit Collection
            </h1>
            <p className="text-xs text-muted-foreground">/collections/{collection.slug}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Ordered Articles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border border-border bg-card rounded-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Collection Items ({items.length})
              </h2>
            </div>

            {/* Add article select */}
            {unselectedArticles.length > 0 ? (
              <div className="flex gap-2">
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Select an article to add --</option>
                  {unselectedArticles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.category})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddArticle}
                  disabled={!selectedArticleId}
                  className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                All published articles are added to this collection.
              </p>
            )}

            {/* Ordered Item List */}
            {items.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-lg text-sm text-muted-foreground">
                No articles added yet. Select an article above to build your series.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((art, idx) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between p-3 border border-border bg-background rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <span className="w-6 h-6 rounded-full bg-muted-gold/10 text-muted-gold text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-semibold text-foreground truncate">{art.title}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {art.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === items.length - 1}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveArticle(art.id)}
                        className="p-1 text-muted-foreground hover:text-red-500 cursor-pointer ml-1"
                        title="Remove"
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

        {/* Right Col: Collection Settings */}
        <div className="space-y-6">
          <div className="p-6 border border-border bg-card rounded-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-gold" /> Settings
            </h2>

            <div className="space-y-2">
              <label
                htmlFor="edit-col-title"
                className="text-xs font-semibold text-muted-foreground"
              >
                Title
              </label>
              <input
                id="edit-col-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-col-desc"
                className="text-xs font-semibold text-muted-foreground"
              >
                Description
              </label>
              <textarea
                id="edit-col-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-col-cover"
                className="text-xs font-semibold text-muted-foreground"
              >
                Cover Image URL
              </label>
              <input
                id="edit-col-cover"
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="is-published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-border text-foreground focus:ring-ring h-4 w-4 cursor-pointer"
              />
              <label
                htmlFor="is-published"
                className="text-xs font-semibold text-foreground cursor-pointer"
              >
                Publish collection publicly
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
