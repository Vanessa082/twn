import type { CollectionRepository, TagRepository } from "../domain/ports";
import { type RelatedCandidate, rankRelatedNotes } from "../domain/related-notes";
import { buildSeriesNavigation } from "../domain/series";
import type { NoteConnections } from "../domain/types";

interface ConnectionRepositories {
  tags: TagRepository;
  collections: CollectionRepository;
}

/**
 * Everything that links a note to the rest of the notebook: its place in a
 * series and the notes worth reading next. Series neighbours shown in the
 * previous/next links are left out of the recommendations.
 */
export async function getNoteConnections(
  note: { id: string; category: string },
  { tags, collections }: ConnectionRepositories,
  limit = 3,
  now = new Date()
): Promise<NoteConnections> {
  const [seriesRecord, pool] = await Promise.all([
    collections.findSeriesForNote(note.id),
    tags.findRelatedCandidates(note.id, note.category),
  ]);

  const series = seriesRecord ? buildSeriesNavigation(seriesRecord, note.id) : null;

  const seriesCandidates: RelatedCandidate[] =
    series?.entries.map((entry) => ({ note: entry.note, sharedTagIds: [] })) ?? [];

  const related = rankRelatedNotes(
    {
      noteId: note.id,
      category: note.category,
      tagNames: pool.tagNames,
      tagFrequency: pool.tagFrequency,
      publishedTotal: pool.publishedTotal,
      series: series
        ? { title: series.series.title, noteIds: series.entries.map((entry) => entry.note.id) }
        : null,
      excludeIds: [series?.previous?.note.id, series?.next?.note.id].filter((id): id is string =>
        Boolean(id)
      ),
      now,
    },
    [...pool.candidates, ...seriesCandidates],
    limit
  );

  return { series, related };
}
