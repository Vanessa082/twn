import { getArticleBySlug, getLatestArticles } from "@/lib/services/articles";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import NewsletterSection from "@/components/home/NewsletterSection";
import ArticleEngagement from "@/components/articles/ArticleEngagement";
import ReadingProgress from "@/components/articles/ReadingProgress";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at,
      images: article.cover_image ? [{ url: article.cover_image }] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) notFound();

  const t = await getTranslations("articles");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">

      {/* Thin reading progress bar — sits above the sticky Navbar */}
      <ReadingProgress />

      {/* Floating engagement sidebar (client component) */}
      <ArticleEngagement slug={article.slug} title={article.title} />

      <article className="flex-1">

        {/* ── Article Header ─────────────────────────────────────────────── */}
        <div className="border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-14 sm:pt-20 sm:pb-20">

            {/* Publication byline — Medium-style context, not a back button */}
            <div className="flex items-center gap-2 mb-10">
              <Link
                href="/"
                className="font-serif font-black text-sm tracking-[0.1em] text-foreground hover:opacity-70 transition-opacity"
              >
                TWN
              </Link>
              <span className="text-border select-none">/</span>
              <Link
                href="/articles"
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {article.category}
              </Link>
            </div>

            {/* Category + Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-7">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              <span className="text-border select-none">·</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{t("readingTime", { minutes: article.reading_time || 1 })}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-black tracking-tight leading-[1.08] text-foreground mb-8">
              {article.title}
            </h1>

            {/* Pull Quote — large decorative quote mark + bold 3px bar */}
            <div className="relative my-10 pl-6 sm:pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-foreground rounded-full" />
              <span
                className="absolute -top-5 left-4 font-serif text-8xl leading-none text-foreground/6 select-none pointer-events-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="text-lg sm:text-xl font-serif leading-relaxed text-foreground/75 italic relative z-10">
                {article.excerpt}
              </p>
            </div>
          </div>
        </div>

        {/* ── Hero Cover Image ────────────────────────────────────────────── */}
        {article.cover_image && (
          <div className="max-w-5xl mx-auto px-0 sm:px-6 mb-0">
            <div className="relative aspect-[16/8] w-full overflow-hidden sm:rounded-[var(--radius)] bg-muted">
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

        {/* ── Article Body ─────────────────────────────────────────────────
            Max width 680px mirrors Medium's reading line length.
            Prose styles below handle all HTML content formatting.
        ── */}
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div
            className={[
              /* Base reading styles */
              "text-foreground/90 leading-[1.85] text-[17px] sm:text-[18px] font-sans",
              /* Spacing between content blocks */
              "space-y-6",
              /* Headings */
              "[&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-serif [&_h2]:font-black [&_h2]:text-foreground [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:tracking-tight",
              "[&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-10 [&_h3]:mb-3",
              /* Paragraphs */
              "[&_p]:text-foreground/85 [&_p]:leading-[1.85]",
              /* Inline links */
              "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-foreground/30 hover:[&_a]:decoration-foreground [&_a]:transition-all",
              /* Blockquote — editorial treatment */
              "[&_blockquote]:border-l-[3px] [&_blockquote]:border-foreground [&_blockquote]:pl-6 [&_blockquote]:my-10 [&_blockquote]:not-italic",
              "[&_blockquote_p]:text-xl [&_blockquote_p]:sm:text-2xl [&_blockquote_p]:font-serif [&_blockquote_p]:italic [&_blockquote_p]:text-foreground [&_blockquote_p]:leading-snug",
              /* Code */
              "[&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-[0.85em] [&_code]:font-mono",
              "[&_pre]:bg-card [&_pre]:border [&_pre]:border-border [&_pre]:rounded-[var(--radius)] [&_pre]:p-5 [&_pre]:overflow-x-auto",
              /* Lists */
              "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2",
              "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2",
              "[&_li]:text-foreground/85",
              /* Images inside content */
              "[&_img]:rounded-[var(--radius)] [&_img]:w-full",
              /* Horizontal rule */
              "[&_hr]:border-border [&_hr]:my-12",
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* ── End-of-article divider ──────────────────────────────────────── */}
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 pb-10">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="font-serif text-xl font-black text-foreground/20 tracking-widest">TWN</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>

        {/* ── Comments placeholder ────────────────────────────────────────── */}
        <div id="comments" className="max-w-[680px] mx-auto px-4 sm:px-6 pb-20 scroll-mt-8">
          <div className="border border-dashed border-border rounded-[var(--radius)] p-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Discussion</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Comments are coming soon. Share your thoughts via the share button above.
            </p>
          </div>
        </div>

      </article>

      {/* Newsletter CTA */}
      <NewsletterSection />
    </div>
  );
}
