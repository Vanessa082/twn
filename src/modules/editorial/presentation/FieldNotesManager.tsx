"use client";

import {
  createFieldNoteAction,
  deleteFieldNoteAction,
  updateFieldNoteAction,
} from "@/modules/editorial/actions";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import MigrationNotice from "@/components/admin/ui/MigrationNotice";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import { fieldNoteSchema } from "@/lib/validation/schemas";
import type { FieldNote, FieldNoteInput } from "@/modules/editorial/contracts";
import { AlertCircle, Edit2, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";

interface FieldNotesManagerProps {
  initialNotes: FieldNote[];
  tableReady: boolean;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none";
const labelClass = "text-xs font-bold uppercase tracking-wider text-foreground";
const hintClass = "text-[11px] text-muted-foreground";

function nextNoteNumber(notes: FieldNote[]): string {
  const highest = notes.reduce((max, note) => {
    const value = Number.parseInt(note.note_number, 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
  return String(highest + 1).padStart(3, "0");
}

function sortNotes(notes: FieldNote[]) {
  return [...notes].sort(
    (a, b) => a.display_order - b.display_order || b.created_at.localeCompare(a.created_at)
  );
}

export default function FieldNotesManager({ initialNotes, tableReady }: FieldNotesManagerProps) {
  const [notes, setNotes] = useState<FieldNote[]>(initialNotes);
  const [draft, setDraft] = useState<FieldNoteInput | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toasts, showError, showSuccess } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const update = <K extends keyof FieldNoteInput>(key: K, value: FieldNoteInput[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const openNew = () => {
    setDraft({
      note_number: nextNoteNumber(notes),
      tag: "",
      headline: "",
      body: "",
      is_published: false,
      display_order: 0,
    });
    setEditingId(null);
    setFormError(null);
  };

  const openEdit = (note: FieldNote) => {
    setDraft({
      note_number: note.note_number,
      tag: note.tag,
      headline: note.headline,
      body: note.body,
      is_published: note.is_published,
      display_order: note.display_order,
    });
    setEditingId(note.id);
    setFormError(null);
  };

  const close = () => {
    setDraft(null);
    setEditingId(null);
    setFormError(null);
  };

  const replaceNote = (next: FieldNote) =>
    setNotes((prev) => sortNotes(prev.map((n) => (n.id === next.id ? next : n))));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const validation = fieldNoteSchema.safeParse(draft);
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message ?? "Check the field note.");
      return;
    }
    setFormError(null);

    startTransition(async () => {
      const result = editingId
        ? await updateFieldNoteAction(editingId, validation.data)
        : await createFieldNoteAction(validation.data);

      if (!result.success || !result.data) {
        setFormError(result.error);
        return;
      }
      const saved = result.data;
      if (editingId) replaceNote(saved);
      else setNotes((prev) => sortNotes([saved, ...prev]));
      showSuccess(editingId ? "Field note updated." : "Field note saved.");
      close();
    });
  };

  const togglePublished = (note: FieldNote) =>
    startTransition(async () => {
      const result = await updateFieldNoteAction(note.id, { is_published: !note.is_published });
      if (result.success && result.data) {
        replaceNote(result.data);
        showSuccess(result.data.is_published ? "Published to the homepage." : "Moved to drafts.");
      } else {
        showError(result.error ?? "Failed to update field note");
      }
    });

  const handleDelete = async (note: FieldNote) => {
    const ok = await confirm({
      title: "Delete field note?",
      message: `No. ${note.note_number}, “${note.headline}”, will be removed permanently.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteFieldNoteAction(note.id);
      if (result.success) {
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
        showSuccess("Field note deleted.");
      } else {
        showError(result.error ?? "Failed to delete field note");
      }
    });
  };

  const publishedCount = notes.filter((n) => n.is_published).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-foreground">
            Field Notes
          </h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Short observations, a paragraph or two, written close to the work. The homepage shows up
            to three published notes and adapts to however many there are. With none published, the
            section disappears.
          </p>
        </div>
        {tableReady && !draft && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-foreground bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
          >
            <Plus className="size-4" /> Write a note
          </button>
        )}
      </div>

      {!tableReady && (
        <MigrationNotice table="field_notes" migrationFile="src/lib/db/migration_field_notes.sql" />
      )}

      {draft && (
        <form
          onSubmit={handleSubmit}
          className="animate-fade-in space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-serif text-lg font-bold text-foreground">
              {editingId ? "Edit field note" : "New field note"}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close form"
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-500"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-1.5">
              <label htmlFor="note-number" className={labelClass}>
                No.
              </label>
              <input
                id="note-number"
                value={draft.note_number}
                onChange={(e) => update("note_number", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-3">
              <label htmlFor="note-tag" className={labelClass}>
                Tag
              </label>
              <input
                id="note-tag"
                value={draft.tag}
                onChange={(e) => update("tag", e.target.value)}
                placeholder="e.g. Craft, Teaching, Infrastructure"
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-4">
              <label htmlFor="note-headline" className={labelClass}>
                Headline
              </label>
              <input
                id="note-headline"
                value={draft.headline}
                onChange={(e) => update("headline", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-4">
              <label htmlFor="note-body" className={labelClass}>
                The note
              </label>
              <textarea
                id="note-body"
                rows={6}
                value={draft.body}
                onChange={(e) => update("body", e.target.value)}
                className={inputClass}
                required
              />
              <p className={hintClass}>
                {draft.body.trim().split(/\s+/).filter(Boolean).length} words. Field notes read best
                between 50 and 300.
              </p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="note-order" className={labelClass}>
                Pin position
              </label>
              <input
                id="note-order"
                type="number"
                min={0}
                max={999}
                value={draft.display_order}
                onChange={(e) => update("display_order", Number(e.target.value))}
                className={inputClass}
              />
              <p className={hintClass}>0 = newest first.</p>
            </div>
            <label className="flex cursor-pointer select-none items-center gap-3 md:col-span-3 md:pt-6">
              <input
                type="checkbox"
                checked={draft.is_published}
                onChange={(e) => update("is_published", e.target.checked)}
                className="size-4 cursor-pointer rounded-sm accent-foreground"
              />
              <span className={labelClass}>Published</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={close}
              className="cursor-pointer rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-muted/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-md border border-foreground bg-foreground px-5 py-2 text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
            >
              {isPending ? "Saving…" : editingId ? "Update note" : "Save note"}
            </button>
          </div>
        </form>
      )}

      {tableReady && (
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-foreground">
            All field notes{" "}
            <span className="text-sm font-normal text-muted-foreground">
              · {publishedCount} published, {notes.length - publishedCount} draft
            </span>
          </h2>

          {notes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No field notes yet. The homepage section stays hidden until you publish one.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className={`rounded-xl border bg-card p-5 transition-opacity ${
                    note.is_published ? "border-border" : "border-border/50 opacity-70"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-foreground">No. {note.note_number}</span>
                        <span className="text-muted-foreground">{note.tag}</span>
                        {note.is_published && note.published_at ? (
                          <span className="text-muted-foreground">
                            ·{" "}
                            {new Date(note.published_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="rounded-sm bg-muted px-2 py-0.5 text-muted-foreground">
                            Draft
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        {note.headline}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{note.body}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => togglePublished(note)}
                        disabled={isPending}
                        title={note.is_published ? "Unpublish" : "Publish"}
                        className="cursor-pointer rounded-lg border border-border p-2 text-foreground hover:border-foreground"
                      >
                        {note.is_published ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(note)}
                        title="Edit"
                        className="cursor-pointer rounded-lg border border-border p-2 text-foreground hover:border-foreground"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note)}
                        disabled={isPending}
                        title="Delete"
                        className="cursor-pointer rounded-lg border border-red-500/10 bg-red-500/5 p-2 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {ConfirmDialog}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
