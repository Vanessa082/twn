"use client";

import ImageUploadField from "@/components/admin/media/ImageUploadField";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import { COLLECTION_ENTRY_LABEL_MAX } from "@/lib/validation/schemas";
import { saveCollectionEntriesAction, updateCollectionAction } from "@/modules/editorial/actions";
import type { CollectionKind, CollectionWithNotes, NoteCard } from "@/modules/editorial/contracts";
import { ArrowDown, ArrowLeft, ArrowUp, Globe, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

interface CollectionEditorProps {
  collection: CollectionWithNotes;
  availableNotes: NoteCard[];
}

interface EditableEntry {
  note: NoteCard;
  label: string;
}

export default function CollectionEditor({ collection, availableNotes }: CollectionEditorProps) {
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description || "");
  const [coverImage, setCoverImage] = useState(collection.cover_image || "");
  const [isPublished, setIsPublished] = useState(collection.is_published);
  const [kind, setKind] = useState<CollectionKind>(collection.kind);
  const [items, setItems] = useState<EditableEntry[]>(
    collection.items.map((item) => ({ note: item.note, label: item.label ?? "" }))
  );

  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toasts, showSuccess, showError } = useToast();

  const unselectedNotes = availableNotes.filter(
    (a) => !items.some((item) => item.note.id === a.id)
  );

  const handleAddNote = () => {
    if (!selectedNoteId) return;
    const target = availableNotes.find((a) => a.id === selectedNoteId);
    if (!target) return;
    setItems((prev) => [...prev, { note: target, label: "" }]);
    setSelectedNoteId("");
  };

  const handleRemoveNote = (id: string) => {
    setItems((prev) => prev.filter((item) => item.note.id !== id));
  };

  const handleLabelChange = (id: string, label: string) => {
    setItems((prev) => prev.map((item) => (item.note.id === id ? { ...item, label } : item)));
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

      // 2. Sync kind and ordered entries
      const itemsRes = await saveCollectionEntriesAction(collection.id, {
        kind,
        entries: items.map((item) => ({ note_id: item.note.id, label: item.label.trim() || null })),
      });

      if (!itemsRes.success) {
        showError(itemsRes.error || "Failed to save collection items.");
        return;
      }

      showSuccess(kind === "series" ? "Series saved." : "Collection saved.");
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
              {kind === "series" ? "Edit Series" : "Edit Collection"}
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
        {/* Left 2 Cols: Ordered Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border border-border bg-card rounded-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {kind === "series" ? "Series entries" : "Collection items"} ({items.length})
              </h2>
            </div>
            {kind === "series" && (
              <p className="text-xs text-muted-foreground">
                Readers see these in order, with previous/next links on each note. Give an entry a
                label such as &ldquo;Day 42&rdquo; or &ldquo;Prologue&rdquo;, or leave it empty to
                show &ldquo;Part N&rdquo;.
              </p>
            )}

            {/* Add note select */}
            {unselectedNotes.length > 0 ? (
              <div className="flex gap-2">
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Select a note to add --</option>
                  {unselectedNotes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.status === "published" ? a.category : a.status})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!selectedNoteId}
                  className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Every note is already in this collection.
              </p>
            )}

            {/* Ordered Item List */}
            {items.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-lg text-sm text-muted-foreground">
                No notes added yet. Select a note above to start.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(({ note: art, label }, idx) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between p-3 border border-border bg-background rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <span className="w-6 h-6 rounded-full bg-muted-gold/10 text-muted-gold text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="font-semibold text-foreground truncate">{art.title}</p>
                        <p className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="capitalize">{art.category}</span>
                          {art.status !== "published" && (
                            <span className="rounded bg-muted px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                              {art.status} · hidden from readers
                            </span>
                          )}
                        </p>
                        {kind === "series" && (
                          <>
                            <label htmlFor={`entry-label-${art.id}`} className="sr-only">
                              Label for {art.title}
                            </label>
                            <input
                              id={`entry-label-${art.id}`}
                              type="text"
                              value={label}
                              maxLength={COLLECTION_ENTRY_LABEL_MAX}
                              placeholder={`Part ${idx + 1}`}
                              onChange={(e) => handleLabelChange(art.id, e.target.value)}
                              className="w-full max-w-56 px-2 py-1 text-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </>
                        )}
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
                        onClick={() => handleRemoveNote(art.id)}
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

            <ImageUploadField
              label="Cover image"
              value={coverImage}
              onChange={setCoverImage}
              purpose="cover"
              description="Shown on the collection card and page. Leave empty for a text-only card."
              allowUrl
            />

            <fieldset className="space-y-2 pt-2">
              <legend className="text-xs font-semibold text-muted-foreground">Type</legend>
              {(
                [
                  {
                    value: "collection",
                    title: "Collection",
                    hint: "A curated set. Notes can be in many collections.",
                  },
                  {
                    value: "series",
                    title: "Series",
                    hint: "Read in order, with previous/next on each note. A note can be in one series.",
                  },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-3 has-[:checked]:border-foreground"
                >
                  <input
                    type="radio"
                    name="collection-kind"
                    value={option.value}
                    checked={kind === option.value}
                    onChange={() => setKind(option.value)}
                    className="mt-0.5 cursor-pointer"
                  />
                  <span>
                    <span className="block text-xs font-semibold text-foreground">
                      {option.title}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">{option.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

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
