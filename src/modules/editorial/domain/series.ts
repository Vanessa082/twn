import type { NoteCard, SeriesEntry, SeriesNavigation } from "./types";

export interface SeriesEntryRecord {
  noteId: string;
  label: string | null;
  /** Null when the reader cannot see the note (draft, scheduled, deleted). */
  note: NoteCard | null;
}

export interface SeriesRecord {
  title: string;
  slug: string;
  /** Ordered by position. */
  entries: SeriesEntryRecord[];
}

export function entryLabel(label: string | null | undefined, position: number): string {
  const trimmed = label?.trim();
  return trimmed ? trimmed : `Part ${position}`;
}

/**
 * Where a note sits in its series. Entries the reader cannot see are skipped,
 * so previous/next never point at a draft and "Part N" counts only what is
 * public. The current note is kept even when hidden, so an admin previewing a
 * draft still sees where it will land.
 */
export function buildSeriesNavigation(
  series: SeriesRecord,
  currentNoteId: string
): SeriesNavigation | null {
  const visible = series.entries.filter(
    (entry) => entry.note !== null || entry.noteId === currentNoteId
  );
  const index = visible.findIndex((entry) => entry.noteId === currentNoteId);
  if (index === -1) return null;

  const toEntry = (record: SeriesEntryRecord | undefined, position: number): SeriesEntry | null =>
    record?.note ? { label: entryLabel(record.label, position), note: record.note } : null;

  const entries = visible
    .map((record, i) => toEntry(record, i + 1))
    .filter((entry): entry is SeriesEntry => entry !== null);

  return {
    series: { title: series.title, slug: series.slug },
    currentLabel: entryLabel(visible[index].label, index + 1),
    position: index + 1,
    total: visible.length,
    previous: toEntry(visible[index - 1], index),
    next: toEntry(visible[index + 1], index + 2),
    entries,
  };
}
