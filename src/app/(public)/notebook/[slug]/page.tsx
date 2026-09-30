import RelatedArticles from "@/components/article/RelatedArticles";
import { InlineActionBar } from "@/components/articles/ArticleEngagement";
import MarginNotesList from "@/components/articles/MarginNotesList";
import ReadingProgress from "@/components/articles/ReadingProgress";
import NewsletterSection from "@/components/home/NewsletterSection";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { sanitizeNoteHtml } from "@/lib/security/sanitize-note-html";
import { pageMetadata } from "@/lib/seo";
import { getAboutData } from "@/lib/services/about";
import { getArticleBySlug } from "@/lib/services/articles";
import { getRelatedArticles, getTagsForArticle } from "@/lib/services/tags";
import { absoluteUrl, routes, site } from "@/lib/site";
import { getApprovedMarginNotesForArticle } from "@/modules/community";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const getNote = cache((slug: string) => getArticleBySlug(slug));

const container = "mx-auto w-full max-w-7xl px-5 sm:px-10 lg:px-20";

const proseClasses = [
  "twn-prose text-foreground/90 leading-[1.85] text-[17px] sm:text-[18px] font-sans space-y-6",
  "[&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-serif [&_h2]:font-black [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:tracking-tight [&_h2]:scroll-mt-28",
  "[&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3",
  "[&_p]:text-foreground/85 [&_p]:leading-[1.85]",
  "[&_a]:text-ink-accent [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-ink-accent/40 hover:[&_a]:decoration-ink-accent [&_a]:transition-all",
  "[&_blockquote]:border-l-[3px] [&_blockquote]:border-foreground [&_blockquote]:pl-6 [&_blockquote]:my-8 [&_blockquote]:not-italic",
  "[&_blockquote_p]:text-xl [&_blockquote_p]:sm:text-2xl [&_blockquote_p]:font-serif [&_blockquote_p]:italic [&_blockquote_p]:text-foreground [&_blockquote_p]:leading-snug",
  "[&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-[0.85em] [&_code]:font-mono",
  "[&_pre]:bg-card [&_pre]:border [&_pre]:border-border [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:overflow-x-auto",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2",
  "[&_li]:text-foreground/85",
  "[&_hr]:border-border [&_hr]:my-10",
].join(" ");

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function chapterLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

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

  const body = sanitizeNoteHtml(note.content);
  const readingTime = t("readingTime", { minutes: note.reading_time || 1 });
  const noteUrl = absoluteUrl(routes.note(note.slug));

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

      <article className="flex-1">
        <div className={container}>
          <header className="max-w-4xl pb-8 pt-10 sm:pb-12 sm:pt-16">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
                <li>
                  <Link
                    href={routes.notebook}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    The Notebook
                  </Link>
                </li>
                <li aria-hidden="true" className="text-border">
                  /
                </li>
                <li>
                  <Link
                    href={routes.notebookTopic(note.category)}
                    className="text-ink-accent transition-colors hover:text-foreground"
                  >
                    {chapterLabel(note.category)}
                  </Link>
                </li>
              </ol>
            </nav>

            <h1
              className="mt-6 font-serif font-black leading-[1.08] tracking-[-0.02em] text-foreground text-balance"
              style={{ fontSize: "clamp(2.1rem, 5vw, 4rem)" }}
            >
              {note.title}
            </h1>

            <p className="mt-5 max-w-3xl font-serif text-lg leading-relaxed text-muted-foreground text-pretty sm:text-2xl">
              {note.excerpt}
            </p>

            <div className="mt-8 flex items-center gap-3.5">
              <Link
                href={routes.about}
                className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted"
              >
                <Image
                  src={about.hero.image_url}
                  alt={`Portrait of ${site.author}`}
                  fill
                  sizes="44px"
                  className="object-cover object-top"
                />
              </Link>
              <div className="min-w-0">
                <Link
                  href={routes.about}
                  className="text-sm font-semibold text-foreground transition-opacity hover:opacity-70"
                >
                  {site.author}
                </Link>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{readingTime}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={note.published_at ?? undefined}>
                    {formatDate(note.published_at)}
                  </time>
                </p>
              </div>
            </div>
          </header>

          {note.cover_image && (
            <figure className="mb-10 sm:mb-14">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted sm:aspect-[16/9]">
                <ImageWithSkeleton
                  src={note.cover_image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1120px"
                  cloudinaryWidth={1600}
                  className="object-cover"
                />
              </div>
            </figure>
          )}

          <div className="grid grid-cols-1 gap-x-16 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8">
              <div className="max-w-[680px]">
                <InlineActionBar
                  slug={note.slug}
                  title={note.title}
                  initialLikesCount={note.likes_count ?? 0}
                />

                <div
                  className={proseClasses}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised with an allow-list above
                  dangerouslySetInnerHTML={{ __html: body }}
                />

                <InlineActionBar
                  slug={note.slug}
                  title={note.title}
                  initialLikesCount={note.likes_count ?? 0}
                />

                {tags.length > 0 && (
                  <ul aria-label="Topics" className="mt-8 flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                      <li key={tag.id}>
                        <Link
                          href={routes.topic(tag.slug)}
                          className="inline-block border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
                        >
                          {tag.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <aside
                  aria-label="About the author"
                  className="mt-14 grid grid-cols-[4.5rem_1fr] items-start gap-5 border-y border-border py-8 sm:grid-cols-[5.5rem_1fr] sm:gap-7"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                    <Image
                      src={about.hero.image_url}
                      alt=""
                      fill
                      sizes="88px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Written by
                    </p>
                    <p className="mt-2 font-serif text-xl font-bold text-foreground">
                      {about.hero.title}
                    </p>
                    <p className="mt-2 font-quote text-lg italic leading-snug text-foreground/75">
                      &ldquo;{about.hero.lead}&rdquo;
                    </p>
                    <Link
                      href={routes.about}
                      className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      More about {site.author} →
                    </Link>
                  </div>
                </aside>

                <div id="comments" className="scroll-mt-28 pb-20 pt-12">
                  <MarginNotesList articleId={note.id} notes={marginNotes} />
                </div>
              </div>
            </div>

            <aside aria-label="About this note" className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-28 space-y-8 border-l border-border pl-8">
                <dl className="space-y-5">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Chapter
                    </dt>
                    <dd className="mt-1.5">
                      <Link
                        href={routes.notebookTopic(note.category)}
                        className="font-serif text-lg text-foreground underline-offset-4 hover:underline"
                      >
                        {chapterLabel(note.category)}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Published
                    </dt>
                    <dd className="mt-1.5 font-serif text-lg text-foreground">
                      {formatDate(note.published_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Reading time
                    </dt>
                    <dd className="mt-1.5 font-serif text-lg text-foreground">{readingTime}</dd>
                  </div>
                </dl>
                {tags.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Topics
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <li key={tag.id}>
                          <Link
                            href={routes.topic(tag.slug)}
                            className="text-sm text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
                          >
                            #{tag.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <a
                  href="#comments"
                  className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Leave a reflection ↓
                </a>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <RelatedArticles articles={relatedNotes} />
      <NewsletterSection />
    </div>
  );
}
