import RelatedArticles from "@/components/article/RelatedArticles";
import NewsletterSection from "@/components/home/NewsletterSection";
import { getArticleByIdAdmin } from "@/lib/services/articles";
import { getApprovedMarginNotesForArticle } from "@/lib/services/margin-notes";
import { getRelatedArticles, getTagsForArticle } from "@/lib/services/tags";
import { ArrowLeft, Calendar, Clock, Edit2, ShieldAlert, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ArticlePreviewPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Article Preview | Admin Dashboard",
};

export const dynamic = "force-dynamic";

/**
 * ArticlePreviewPage
 *
 * Renders an unpublished draft or scheduled article with full fidelity to the
 * public article detail page (`/articles/[slug]`). Uses `getArticleByIdAdmin` to bypass
 * the `status = 'published'` RLS policy.
 */
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
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Draft (Not Published)";

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

      {/* Main Article Render */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <header className="space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted-gold/10 text-muted-gold text-xs font-bold uppercase tracking-wider">
              {article.category}
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-foreground tracking-tight leading-tight">
              {article.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic">
              {article.excerpt}
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {article.reading_time || 5} min read
              </span>
            </div>

            {article.cover_image && (
              <div className="aspect-video w-full relative rounded-2xl overflow-hidden bg-muted max-w-4xl mx-auto border border-border shadow-lg">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </header>

          {/* Content Body */}
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert text-foreground">
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted admin preview */}
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="max-w-3xl mx-auto border-t border-border pt-6">
              <div className="flex items-center gap-2 flex-wrap">
                <TagIcon className="h-4 w-4 text-muted-gold" />
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-1 rounded-full bg-muted text-foreground text-xs font-medium"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="max-w-4xl mx-auto border-t border-border pt-12">
              <RelatedArticles articles={relatedArticles} />
            </div>
          )}

          {/* Newsletter Section */}
          <div className="max-w-3xl mx-auto pt-12 border-t border-border">
            <NewsletterSection />
          </div>
        </article>
      </main>
    </div>
  );
}
