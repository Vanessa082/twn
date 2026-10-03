import type { NoteCard, RelatedNote, RelatedReason } from "./types";

export interface RelatedCandidate {
  note: NoteCard;
  /** Tags this candidate shares with the note being read. */
  sharedTagIds: string[];
}

export interface RelatedContext {
  noteId: string;
  category: string;
  /** Tag id → display name, for the tags on the note being read. */
  tagNames: Record<string, string>;
  /** Tag id → number of published notes carrying it. */
  tagFrequency: Record<string, number>;
  publishedTotal: number;
  /** The note's series, if any, so siblings can be recommended with that reason. */
  series: { title: string; noteIds: string[] } | null;
  /** Notes already linked elsewhere on the page (series previous/next). */
  excludeIds: string[];
  now: Date;
}

const CHAPTER_WEIGHT = 0.6;
const SERIES_WEIGHT = 0.8;
const RECENCY_WEIGHT = 0.3;
const RECENCY_HALF_LIFE_DAYS = 180;
const DAY_MS = 86_400_000;

/** Rare tags say more about a note than common ones (inverse document frequency). */
export function tagWeight(frequency: number, publishedTotal: number): number {
  return Math.log(1 + Math.max(publishedTotal, 1) / Math.max(frequency, 1));
}

function recencyBoost(publishedAt: string | null, now: Date): number {
  if (!publishedAt) return 0;
  const published = Date.parse(publishedAt);
  if (Number.isNaN(published)) return 0;
  const ageDays = Math.max(0, (now.getTime() - published) / DAY_MS);
  return RECENCY_WEIGHT * 0.5 ** (ageDays / RECENCY_HALF_LIFE_DAYS);
}

interface Scored {
  note: NoteCard;
  score: number;
  reason: RelatedReason;
}

function scoreCandidate(candidate: RelatedCandidate, context: RelatedContext): Scored | null {
  const weightedTags = [...new Set(candidate.sharedTagIds)]
    .filter((id) => context.tagNames[id])
    .map((id) => ({
      name: context.tagNames[id],
      weight: tagWeight(context.tagFrequency[id] ?? 1, context.publishedTotal),
    }))
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name));

  const tagScore = weightedTags.reduce((sum, tag) => sum + tag.weight, 0);
  const inSeries = context.series?.noteIds.includes(candidate.note.id) ?? false;
  const sameChapter = candidate.note.category === context.category;

  const relevance = tagScore + (inSeries ? SERIES_WEIGHT : 0) + (sameChapter ? CHAPTER_WEIGHT : 0);
  if (relevance <= 0) return null;

  let reason: RelatedReason;
  if (weightedTags.length > 0) {
    reason = { kind: "tags", tags: weightedTags.slice(0, 2).map((tag) => tag.name) };
  } else if (inSeries && context.series) {
    reason = { kind: "series", title: context.series.title };
  } else {
    reason = { kind: "chapter", category: candidate.note.category };
  }

  return {
    note: candidate.note,
    score: relevance + recencyBoost(candidate.note.published_at, context.now),
    reason,
  };
}

/**
 * "You may also like": shared rare tags count most, then being in the same
 * series, then the same chapter, with a small nudge towards newer notes.
 * Unrelated notes are never used as filler, so the list may be short or empty.
 */
export function rankRelatedNotes(
  context: RelatedContext,
  candidates: RelatedCandidate[],
  limit: number
): RelatedNote[] {
  const excluded = new Set([context.noteId, ...context.excludeIds]);
  const merged = new Map<string, RelatedCandidate>();

  for (const candidate of candidates) {
    if (excluded.has(candidate.note.id)) continue;
    const existing = merged.get(candidate.note.id);
    merged.set(
      candidate.note.id,
      existing
        ? {
            note: existing.note,
            sharedTagIds: [...existing.sharedTagIds, ...candidate.sharedTagIds],
          }
        : candidate
    );
  }

  return [...merged.values()]
    .map((candidate) => scoreCandidate(candidate, context))
    .filter((scored): scored is Scored => scored !== null)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.note.published_at ?? "").localeCompare(a.note.published_at ?? "") ||
        a.note.id.localeCompare(b.note.id)
    )
    .slice(0, Math.max(0, limit))
    .map(({ note, reason }) => ({ note, reason }));
}
