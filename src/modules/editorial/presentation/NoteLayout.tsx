import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { routes } from "@/lib/site";
import type { NoteAuthor } from "@/modules/site/contracts";
import Link from "next/link";
import type { ReactNode } from "react";
import AuthorAvatar from "./AuthorAvatar";
import NoteBody from "./NoteBody";
import { chapterLabel, formatNoteDate } from "./note-format";

export interface NoteLayoutData {
  title: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  published_at: string | null;
}

export interface NoteTopic {
  id: string;
  name: string;
  slug: string;
}

interface NoteLayoutProps {
  note: NoteLayoutData;
  /** Already-sanitised HTML for the body. */
  bodyHtml: string;
  readingTime: string;
  author: NoteAuthor;
  topics?: NoteTopic[];
  /** Shown instead of the date for drafts. */
  dateFallback?: string;
  beforeBody?: ReactNode;
  afterBody?: ReactNode;
  /** Rendered at the end of the reading column (reflections, etc.). */
  children?: ReactNode;
}

/**
 * The single reading layout for a note: the public page, the admin full
 * preview and the editor's quick preview all render through this, so what
 * Vanessa previews is exactly what readers get.
 *
 * Every block spans the navbar container, so the note's left and right edges
 * line up with the logo and the search button at every width.
 */
export default function NoteLayout({
  note,
  bodyHtml,
  readingTime,
  author,
  topics = [],
  dateFallback = "",
  beforeBody,
  afterBody,
  children,
}: NoteLayoutProps) {
  const chapter = chapterLabel(note.category);
  const date = formatNoteDate(note.published_at) || dateFallback;

  return (
    <article className="flex-1">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-10 lg:px-20">
        <div>
          <header className="pb-8 pt-10 sm:pb-10 sm:pt-16">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em]">
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
                    {chapter}
                  </Link>
                </li>
              </ol>
            </nav>

            <h1
              className="mt-6 font-serif font-black leading-[1.08] tracking-[-0.02em] text-foreground text-balance"
              style={{ fontSize: "clamp(2rem, 5vw, 4.25rem)" }}
            >
              {note.title}
            </h1>

            {note.excerpt && (
              <p className="mt-5 font-serif text-lg leading-relaxed text-muted-foreground text-pretty sm:text-[1.35rem]">
                {note.excerpt}
              </p>
            )}

            <div className="mt-8 flex items-center gap-3.5">
              <Link href={routes.about} aria-label={`About ${author.name}`}>
                <AuthorAvatar name={author.name} portrait={author.portrait} />
              </Link>
              <div className="min-w-0">
                <Link
                  href={routes.about}
                  className="text-sm font-semibold text-foreground transition-opacity hover:opacity-70"
                >
                  {author.name}
                </Link>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{readingTime}</span>
                  {date && (
                    <>
                      <span aria-hidden="true">·</span>
                      <time dateTime={note.published_at ?? undefined}>{date}</time>
                    </>
                  )}
                </p>
              </div>
            </div>
          </header>

          {note.cover_image && (
            <figure className="mb-10 sm:mb-12">
              <div className="relative aspect-video w-full overflow-hidden rounded-[0.25rem] bg-muted">
                <ImageWithSkeleton
                  src={note.cover_image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1120px"
                  cloudinaryWidth={2000}
                  className="object-cover"
                />
              </div>
            </figure>
          )}

          {beforeBody}
          <NoteBody html={bodyHtml} />
          {afterBody}

          {topics.length > 0 && (
            <ul aria-label="Topics" className="mt-8 flex flex-wrap items-center gap-2">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <Link
                    href={routes.topic(topic.slug)}
                    className="inline-block border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {topic.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <aside
            aria-label="About the author"
            className="mt-14 grid grid-cols-[4.5rem_1fr] items-start gap-5 border-y border-border py-8 sm:grid-cols-[5.5rem_1fr] sm:gap-7"
          >
            <AuthorAvatar
              name={author.name}
              portrait={author.portrait}
              className="aspect-[4/5] w-full"
              sizes="88px"
            />
            <div>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Written by
              </p>
              <p className="mt-2 font-serif text-xl font-bold text-foreground">{author.name}</p>
              {author.lead && (
                <p className="mt-2 font-quote text-lg italic leading-snug text-foreground/75">
                  &ldquo;{author.lead}&rdquo;
                </p>
              )}
              <Link
                href={routes.about}
                className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                More about {author.name} →
              </Link>
            </div>
          </aside>

          {children}
        </div>
      </div>
    </article>
  );
}
