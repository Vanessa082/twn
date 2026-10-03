import { sanitizeNoteHtml } from "@/lib/security/sanitize-note-html";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, routes, site } from "@/lib/site";
import { getApprovedMarginNotesForNote } from "@/modules/community";
import { MarginNotesList } from "@/modules/community/ui";
import { getNoteBySlug, getNoteConnections, getTagsForNote } from "@/modules/editorial";
import {
  InlineActionBar,
  NoteLayout,
  ReadingProgress,
  RelatedNotes,
  SeriesBanner,
  SeriesNavigation,
  chapterLabel,
} from "@/modules/editorial/ui";
import { NewsletterSection } from "@/modules/newsletter/ui";
import { getAboutData, getNoteAuthor } from "@/modules/site";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { cache } from "react";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const getNote = cache((slug: string) => getNoteBySlug(slug));

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) return { title: "Note not found", robots: { index: false } };

  const metadata = pageMetadata({
    title: note.seo_title || note.title,
    description: note.seo_description || note.excerpt,
    path: routes.note(note.slug),
    image: note.og_image || note.cover_image,
    type: "article",
    publishedTime: note.published_at,
    modifiedTime: note.updated_at,
    tags: [note.category],
    eyebrow: chapterLabel(note.category),
  });

  return note.canonical_url
    ? { ...metadata, alternates: { canonical: note.canonical_url } }
    : metadata;
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) notFound();

  const [marginNotes, tags, connections, about, t] = await Promise.all([
    getApprovedMarginNotesForNote(note.id),
    getTagsForNote(note.id),
    getNoteConnections(note),
    getAboutData(),
    getTranslations("notes"),
  ]);

  const noteUrl = absoluteUrl(routes.note(note.slug));
  const actionBar = (
    <InlineActionBar
      slug={note.slug}
      title={note.title}
      initialLikesCount={note.likes_count ?? 0}
    />
  );

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: note.title,
      description: note.excerpt,
      image: note.og_image || note.cover_image || undefined,
      datePublished: note.published_at ?? undefined,
      dateModified: note.updated_at,
      author: { "@type": "Person", name: site.author, url: absoluteUrl(routes.about) },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
      mainEntityOfPage: noteUrl,
      articleSection: chapterLabel(note.category),
      keywords: tags.map((tag) => tag.name).join(", ") || undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "The Notebook",
          item: absoluteUrl(routes.notebook),
        },
        { "@type": "ListItem", position: 3, name: note.title, item: noteUrl },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialised server data, not markup
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ReadingProgress />

      <NoteLayout
        note={note}
        bodyHtml={sanitizeNoteHtml(note.content)}
        readingTime={t("readingTime", { minutes: note.reading_time || 1 })}
        author={getNoteAuthor(about.hero)}
        topics={tags}
        beforeBody={
          <>
            {connections.series && <SeriesBanner series={connections.series} />}
            {actionBar}
          </>
        }
        afterBody={actionBar}
      >
        <div id="comments" className="scroll-mt-28 pb-20 pt-12">
          <MarginNotesList noteId={note.id} notes={marginNotes} />
        </div>
      </NoteLayout>

      {connections.series && <SeriesNavigation series={connections.series} />}
      <RelatedNotes notes={connections.related} />
      <NewsletterSection />
    </div>
  );
}
