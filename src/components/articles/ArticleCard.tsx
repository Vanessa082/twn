import Link from "next/link";
import type { Article } from "@/types";
import { useTranslations } from "next-intl";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const t = useTranslations("articles");

  // Format the date nicely
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ScrollReveal>
      <article className="group flex flex-col items-start gap-4 pb-6 border-b border-border h-full transition-colors duration-300">
        {/* Article Cover Image — ImageWithSkeleton handles loading states and URL optimization */}
        <Link
          href={`/articles/${article.slug}`}
          className="w-full relative aspect-[16/10] overflow-hidden bg-muted rounded-[var(--radius)]"
        >
          <ImageWithSkeleton
            src={article.cover_image}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            cloudinaryWidth={800}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Article Meta */}
        <div className="flex flex-col gap-2.5 w-full flex-1 mt-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground bg-foreground/5 dark:bg-foreground/10 px-2 py-0.5 rounded-sm">
              {article.category}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {t("readingTime", { minutes: article.reading_time || 1 })}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold font-serif leading-snug text-foreground transition-all duration-300 group-hover:opacity-70">
            <Link href={`/articles/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>

        {/* Date */}
        <div className="w-full pt-4 mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(article.published_at)}</span>
          <span className="font-bold uppercase tracking-wider text-[11px] text-foreground group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1">
            {t("readMore")} →
          </span>
        </div>
      </article>
    </ScrollReveal>
  );
}
