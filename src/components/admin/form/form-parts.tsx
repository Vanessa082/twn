"use client";

import { ChevronDown, ChevronUp, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormContext } from "./form-context";

interface ListSectionProps {
  title: string;
  description?: string;
  addLabel: string;
  onAdd: () => void;
  count: number;
  max?: number;
  emptyText: string;
  children: ReactNode;
}

/** A card holding a repeatable list: heading, an Add button, and an empty state. */
export function ListSection({
  title,
  description,
  addLabel,
  onAdd,
  count,
  max,
  emptyText,
  children,
}: ListSectionProps) {
  const full = max !== undefined && count >= max;
  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={full}
          title={full ? `You can add up to ${max}.` : undefined}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-3.5" aria-hidden="true" /> {addLabel}
        </button>
      </div>
      {count === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ol className="space-y-4">{children}</ol>
      )}
    </section>
  );
}

interface ListItemProps {
  index: number;
  count: number;
  label: string;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  children: ReactNode;
}

/** One entry of a ListSection with reorder and remove controls. */
export function ListItem({ index, count, label, onMove, onRemove, children }: ListItemProps) {
  const control =
    "cursor-pointer rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <li className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
      <div className="flex shrink-0 gap-1 sm:flex-col">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          className={control}
          aria-label={`Move ${label} ${index + 1} up`}
        >
          <ChevronUp className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={index === count - 1}
          onClick={() => onMove(index, index + 1)}
          className={control}
          aria-label={`Move ${label} ${index + 1} down`}
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className={`${control} hover:text-destructive`}
          aria-label={`Remove ${label} ${index + 1}`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export function FieldCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div>
        <h2 className="font-serif text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Save / discard controls that react to the form's dirty and submitting state. */
export function SaveBar({ saveLabel = "Publish changes" }: { saveLabel?: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.isDirty, state.isSubmitting] as const}>
      {([isDirty, isSubmitting]) => (
        <div className="flex items-center gap-2">
          <span
            className={`hidden text-[11px] font-semibold sm:inline ${
              isDirty ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
            }`}
            aria-live="polite"
          >
            {isSubmitting ? "Saving…" : isDirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <button
            type="button"
            onClick={() => form.reset()}
            disabled={!isDirty || isSubmitting}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" /> Discard
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-foreground px-4 text-xs font-bold uppercase tracking-wider text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {saveLabel}
          </button>
        </div>
      )}
    </form.Subscribe>
  );
}
