import RelatedArticles from "@/components/article/RelatedArticles";
import { InlineActionBar } from "@/components/articles/ArticleEngagement";
import NoteArticle from "@/components/notes/NoteArticle";
import { readingTimeLabel } from "@/components/notes/note-format";
import { getNoteAuthor } from "@/lib/about/portrait";
import { sanitizeNoteHtml } from "@/lib/security/sanitize-note-html";
import { getAboutData } from "@/lib/services/about";
import { getArticleByIdAdmin } from "@/lib/services/articles";
import { getRelatedArticles, getTagsForArticle } from "@/lib/services/tags";
import { routes } from "@/lib/site";
import { ArrowLeft, Edit2, Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface NotePreviewPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Note preview",
  robots: { index: false, follow: false },
};

const STATUS_COPY: Record<string, string> = {
  draft: "Draft · only you can see this",
  scheduled: "Scheduled · not public yet",
  published: "Published · this is the live version",
};

export default async function NotePreviewPage({ params }: NotePreviewPageProps) {
  const { id } = await params;
  const note = await getArticleByIdAdmin(id);
  if (!note) notFound();

  const [relatedNotes, tags, about] = await Promise.all([
    getRelatedArticles(note.id, note.category, 3),
    getTagsForArticle(note.id),
    getAboutData(),
  ]);

  const actionBar = (
    <div inert className="pointer-events-none">
      <InlineActionBar
        slug={note.slug}
        title={note.title}
        initialLikesCount={note.likes_count ?? 0}
      />
    </div>
  );

  return (
    <>
      <div className="border-b border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-10 lg:px-20">
          <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]">
            <Eye className="size-3.5 shrink-0" aria-hidden="true" />
            Preview · {STATUS_COPY[note.status] ?? note.status}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/admin/articles/${note.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-background px-3 py-1.5 font-semibold text-foreground transition-opacity hover:opacity-85"
            >
              <Edit2 className="size-3.5" aria-hidden="true" /> Back to editor
            </Link>
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-background/30 px-3 py-1.5 font-semibold transition-colors hover:bg-background/10"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" /> All notes
            </Link>
            {note.status === "published" && (
              <Link
                href={routes.note(note.slug)}
                className="hidden items-center gap-1.5 rounded-[4px] border border-background/30 px-3 py-1.5 font-semibold transition-colors hover:bg-background/10 sm:inline-flex"
              >
                View live
              </Link>
            )}
          </div>
        </div>
      </div>

      <NoteArticle
        note={note}
        bodyHtml={sanitizeNoteHtml(note.content)}
        readingTime={readingTimeLabel(note.reading_time)}
        author={getNoteAuthor(about.hero)}
        topics={tags}
        dateFallback="Not yet published"
        beforeBody={actionBar}
        afterBody={actionBar}
      >
        <div className="pb-20 pt-12">
          <p className="border border-dashed border-border px-5 py-6 text-center text-sm text-muted-foreground">
            Readers&apos; reflections appear here once the note is published.
          </p>
        </div>
      </NoteArticle>

      <RelatedArticles articles={relatedNotes} />
    </>
  );
}
