import RelatedArticles from "@/components/article/RelatedArticles";
import { InlineActionBar } from "@/components/articles/ArticleEngagement";
import MarginNotesList from "@/components/articles/MarginNotesList";
import ReadingProgress from "@/components/articles/ReadingProgress";
import NewsletterSection from "@/components/home/NewsletterSection";
import NoteArticle from "@/components/notes/NoteArticle";
import { chapterLabel } from "@/components/notes/note-format";
import { getNoteAuthor } from "@/lib/about/portrait";
import { sanitizeNoteHtml } from "@/lib/security/sanitize-note-html";
import { pageMetadata } from "@/lib/seo";
import { getAboutData } from "@/lib/services/about";
import { getArticleBySlug } from "@/lib/services/articles";
import { getRelatedArticles, getTagsForArticle } from "@/lib/services/tags";
import { absoluteUrl, routes, site } from "@/lib/site";
import { getApprovedMarginNotesForArticle } from "@/modules/community";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { cache } from "react";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const getNote = cache((slug: string) => getArticleBySlug(slug));

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

  const [marginNotes, tags, relatedNotes, about, t] = await Promise.all([
    getApprovedMarginNotesForArticle(note.id),
    getTagsForArticle(note.id),
    getRelatedArticles(note.id, note.category),
    getAboutData(),
    getTranslations("articles"),
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

      <NoteArticle
        note={note}
        bodyHtml={sanitizeNoteHtml(note.content)}
        readingTime={t("readingTime", { minutes: note.reading_time || 1 })}
        author={getNoteAuthor(about.hero)}
        topics={tags}
        beforeBody={actionBar}
        afterBody={actionBar}
      >
        <div id="comments" className="scroll-mt-28 pb-20 pt-12">
          <MarginNotesList articleId={note.id} notes={marginNotes} />
        </div>
      </NoteArticle>

      <RelatedArticles articles={relatedNotes} />
      <NewsletterSection />
    </div>
  );
}
