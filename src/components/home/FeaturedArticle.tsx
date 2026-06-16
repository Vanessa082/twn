import Link from "next/link";
import type { Article } from "@/types";
import { useTranslations } from "next-intl";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";

interface FeaturedArticleProps {
  article: Article;
}

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  const t = useTranslations("home.featured");
  const artT = useTranslations("articles");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="py-16 border-b border-border bg-background transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="inline-block text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-6">
          {t("label")}
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center animate-fade-up">
          {/* Cover Image */}
          <Link
            href={`/articles/${article.slug}`}
            className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-muted group border border-border/10 rounded-[var(--radius)]"
          >
            {article.cover_image ? (
              <ImageWithSkeleton
                src={article.cover_image}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                <span className="font-serif font-black text-6xl tracking-widest text-foreground/10">
                  TWN
                </span>
              </div>
            )}
          </Link>

          {/* Details */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground bg-foreground/5 dark:bg-foreground/10 px-2 py-0.5">
                {article.category}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {artT("readingTime", { minutes: article.reading_time || 1 })}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight leading-tight text-foreground transition-all duration-300 group-hover:opacity-75">
              <Link href={`/articles/${article.slug}`}>
                {article.title}
              </Link>
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>

            <div className="flex items-center justify-between pt-5 mt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {formatDate(article.published_at)}
              </span>
              <Link
                href={`/articles/${article.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-foreground hover:opacity-85 flex items-center gap-1.5 group"
              >
                {artT("readMore")}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
