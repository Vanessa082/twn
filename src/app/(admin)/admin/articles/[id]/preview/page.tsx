import RelatedArticles from "@/components/article/RelatedArticles";
import { InlineActionBar } from "@/components/articles/ArticleEngagement";
import NewsletterSection from "@/components/home/NewsletterSection";
import { ArticleRenderer } from "@/components/article/ArticleRenderer";
import { getArticleByIdAdmin } from "@/lib/services/articles";
import { getApprovedMarginNotesForArticle } from "@/modules/community";
import { getRelatedArticles, getTagsForArticle } from "@/lib/services/tags";
import { ArrowLeft, Edit2, ShieldAlert, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ArticlePreviewPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Article Preview | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function ArticlePreviewPage({ params }: ArticlePreviewPageProps) {
  const { id } = await params;
  const article = await getArticleByIdAdmin(id);

  if (!article) {
    notFound();
  }

  const [marginNotes, relatedArticles, tags] = await Promise.all([
    getApprovedMarginNotesForArticle(article.id),
    getRelatedArticles(article.id, article.category, 3),
    getTagsForArticle(article.id),
  ]);

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Draft (Unpublished)";

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Preview Header Banner */}
      <div className="sticky top-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>
              Admin Preview Mode — Status: <strong className="underline">{article.status}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/articles/${article.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              <Edit2 className="h-3.5 w-3.5" /> Back to Editor
            </Link>
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground font-bold rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Articles
            </Link>
          </div>
        </div>
      </div>

      {/* Main Article Render (Medium-identical Layout) */}
      <main className="py-10">
        <article>
          {/* Header Block */}
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 pt-4 pb-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-serif font-black text-sm tracking-[0.1em] text-foreground">
                TWN
              </span>
              <span className="text-border select-none">/</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-gold">
                {article.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-[1.15] text-foreground mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl sm:text-2xl font-serif text-muted-foreground leading-relaxed text-left mb-6">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center gap-3.5 pt-2">
              <div className="h-11 w-11 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 text-sm font-black font-serif text-foreground/70 select-none">
                V
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Vanessa</p>
                  <span className="text-xs text-muted-gold font-medium">• Author</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{article.reading_time || 1} min read</span>
                  <span>·</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            <InlineActionBar
              slug={article.slug}
              title={article.title}
              initialLikesCount={article.likes_count ?? 0}
            />
          </div>

          {/* Cover Image */}
          {article.cover_image && (
            <div className="w-full max-w-[680px] mx-auto mb-10 px-4 sm:px-6">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted border border-border/40 shadow-sm">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Content Body */}
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
            <ArticleRenderer
              className="prose article-content text-foreground"
              html={article.content}
            />

            <InlineActionBar
              slug={article.slug}
              title={article.title}
              initialLikesCount={article.likes_count ?? 0}
            />

            {tags.length > 0 && (
              <div className="pt-6 flex flex-wrap items-center gap-2 border-t border-border mt-8">
                <TagIcon className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-1 rounded-md bg-muted/50 text-foreground/80 text-xs font-medium border border-border/60"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Related & Newsletter */}
          {relatedArticles.length > 0 && (
            <div className="max-w-4xl mx-auto border-t border-border pt-12">
              <RelatedArticles articles={relatedArticles} />
            </div>
          )}

          <div className="max-w-3xl mx-auto pt-12 border-t border-border">
            <NewsletterSection />
          </div>
        </article>
      </main>
    </div>
  );
}
