import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { routes } from "@/lib/site";
import type { Note, NoteCard as NoteCardType } from "@/modules/editorial/contracts";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface NoteCardProps {
  note: Note | NoteCardType;
  /** Why this card is shown, e.g. "Also tagged Supabase". */
  reason?: string;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * The title link is stretched over the whole card with `after:inset-0`, so any
 * click (image, excerpt, "Read more") opens the note while assistive tech
 * hears a single, descriptive link instead of three duplicates.
 */
export default function NoteCard({ note, reason }: NoteCardProps) {
  const t = useTranslations("notes");
  const href = routes.note(note.slug);

  return (
    <ScrollReveal className="h-full">
      <article className="group relative flex h-full flex-col items-start gap-4 border-b border-border pb-6 transition-colors duration-300 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-foreground">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[4px] bg-muted">
          <ImageWithSkeleton
            src={note.cover_image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            cloudinaryWidth={800}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>

        <div className="mt-2 flex w-full flex-1 flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-accent">
              {note.category}
            </span>
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <span className="text-[11px] text-muted-foreground">
              {t("readingTime", { minutes: note.reading_time || 1 })}
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold leading-snug text-foreground text-balance transition-opacity duration-300 group-hover:opacity-70 sm:text-xl">
            <Link
              href={href}
              data-cursor="link"
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {note.title}
            </Link>
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {note.excerpt}
          </p>

          {reason && <p className="font-quote text-sm italic text-foreground/60">{reason}</p>}
        </div>

        <div className="mt-auto flex w-full items-center justify-between pt-4 text-xs text-muted-foreground">
          <time dateTime={note.published_at ?? undefined}>{formatDate(note.published_at)}</time>
          <span
            aria-hidden="true"
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground"
          >
            {t("readMore")}
            <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </ScrollReveal>
  );
}
