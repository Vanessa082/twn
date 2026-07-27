import RelatedArticles from "@/components/article/RelatedArticles";
import ArticleEngagement, { InlineActionBar } from "@/components/articles/ArticleEngagement";
import MarginNotesList from "@/components/articles/MarginNotesList";
import ReadingProgress from "@/components/articles/ReadingProgress";
import NewsletterSection from "@/components/home/NewsletterSection";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { getArticleBySlug } from "@/lib/services/articles";
import { getApprovedMarginNotesForArticle } from "@/modules/community";
import { getRelatedArticles, getTagsForArticle } from "@/lib/services/tags";
import { Tag as TagIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) return { title: "Article Not Found" };

  const displayTitle = article.seo_title || article.title;
  const displayDescription = article.seo_description || article.excerpt;
  const displayImage = article.og_image || article.cover_image;

  return {
    title: displayTitle,
    description: displayDescription,
    alternates: article.canonical_url ? { canonical: article.canonical_url } : undefined,
    openGraph: {
      title: displayTitle,
      description: displayDescription,
      type: "article",
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at,
      images: displayImage ? [{ url: displayImage }] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) notFound();

  const [marginNotes, tags, relatedArticles] = await Promise.all([
    getApprovedMarginNotesForArticle(article.id),
    getTagsForArticle(article.id),
    getRelatedArticles(article.id, article.category),
  ]);

  const t = await getTranslations("articles");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      {/* Thin reading progress bar */}
      <ReadingProgress />

      <article className="flex-1">
        {/* ── Article Header (Medium Layout Structure) ──────────────────── */}
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-4">
          {/* Publication breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/"
              className="font-serif font-black text-sm tracking-[0.1em] text-foreground hover:opacity-70 transition-opacity"
            >
              TWN
            </Link>
            <span className="text-border select-none">/</span>
            <Link
              href="/articles"
              className="text-xs font-bold uppercase tracking-widest text-muted-gold hover:text-foreground transition-colors"
            >
              {article.category}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-[1.15] text-foreground mb-4">
            {article.title}
          </h1>

          {/* Excerpt / Subtitle — Medium style directly under title */}
          {article.excerpt && (
            <p className="text-xl sm:text-2xl font-serif text-muted-foreground leading-relaxed text-left mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Author Meta Row */}
          <div className="flex items-center gap-3.5 pt-2">
            <div className="h-11 w-11 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 text-sm font-black font-serif text-foreground/70 select-none">
              V
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Vanessa</p>
                <span className="text-xs text-muted-gold font-medium">• Follow</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{t("readingTime", { minutes: article.reading_time || 1 })}</span>
                <span>·</span>
                <span>{formatDate(article.published_at)}</span>
              </div>
            </div>
          </div>

          {/* Inline Action Bar — Medium Top Action Bar */}
          <InlineActionBar
            slug={article.slug}
            title={article.title}
            initialLikesCount={article.likes_count ?? 0}
          />
        </div>

        {/* ── Hero Cover Image — Sits below header & action bar ──────────── */}
        {article.cover_image && (
          <div className="w-full max-w-[680px] mx-auto mb-10 px-4 sm:px-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted border border-border/40 shadow-sm">
              <ImageWithSkeleton
                src={article.cover_image}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                cloudinaryWidth={1280}
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* ── Article Body (Aligned pixel-perfectly with header) ──────────── */}
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <div
            className={[
              "text-foreground/90 leading-[1.85] text-[18px] font-sans",
              "space-y-6",
              "[&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-serif [&_h2]:font-black [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:tracking-tight",
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
              "[&_img]:rounded-xl [&_img]:w-full",
              "[&_hr]:border-border [&_hr]:my-10",
            ].join(" ")}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Admin authored HTML
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Bottom Inline Action Bar */}
          <InlineActionBar
            slug={article.slug}
            title={article.title}
            initialLikesCount={article.likes_count ?? 0}
          />

          {/* Tag Pills */}
          {tags.length > 0 && (
            <div className="pt-6 flex flex-wrap items-center gap-2 border-t border-border mt-8">
              <TagIcon className="h-3.5 w-3.5 text-muted-gold shrink-0" />
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/topics/${tag.slug}`}
                  className="px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-medium border border-border/60 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── End-of-article divider ──────────────────────────────────────── */}
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 pb-10">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="font-serif text-xl font-black text-foreground/20 tracking-widest">
              TWN
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>

        {/* ── Margin Reflections Section ────────────────────────────────── */}
        <div id="comments" className="max-w-[680px] mx-auto px-4 sm:px-6 pb-20 scroll-mt-8">
          <MarginNotesList articleId={article.id} notes={marginNotes} />
        </div>
      </article>

      {/* Related Articles */}
      <RelatedArticles articles={relatedArticles} />

      {/* Newsletter CTA */}
      <NewsletterSection />
    </div>
  );
}
