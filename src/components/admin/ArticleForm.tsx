"use client";

import { createArticleAction, updateArticleAction } from "@/app/actions/articles";
import type { Article, ArticleCategory, ArticleStatus } from "@/types";
import { ArrowLeft, Edit2, Eye, Globe, Loader2, Save, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import SeoPreview from "./SeoPreview";
import TiptapEditor from "./TiptapEditor";

interface ArticleFormProps {
  initialData?: Article;
}

export default function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewMode, setPreviewMode] = useState(false);

  // Form States
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [category, setCategory] = useState<ArticleCategory>(initialData?.category || "technology");
  const [status, setStatus] = useState<ArticleStatus>(initialData?.status || "draft");
  const [publishedAt, setPublishedAt] = useState(
    initialData?.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : ""
  );

  // Advanced SEO States
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || "");
  const [ogImage, setOgImage] = useState(initialData?.og_image || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonical_url || "");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !content || !excerpt) {
      setError("Please fill in the title, excerpt, and content.");
      return;
    }

    const payload = {
      title,
      slug: slug.trim(),
      excerpt,
      content,
      cover_image: coverImage || null,
      category,
      status,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      og_image: ogImage.trim() || null,
      canonical_url: canonicalUrl.trim() || null,
    };

    startTransition(async () => {
      let result: { success: boolean; error: string | null; data?: unknown };
      if (initialData?.id) {
        result = await updateArticleAction(initialData.id, payload);
      } else {
        result = await createArticleAction(payload);
      }

      if (result.success) {
        router.push("/admin/articles");
        router.refresh();
      } else {
        setError(result.error || "Something went wrong.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-black tracking-tight text-foreground">
              {initialData ? `Edit: ${initialData.title}` : "Create New Article"}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {previewMode ? (
              <>
                <Edit2 className="h-4 w-4" /> Write
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Preview
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-deep-navy px-4 text-xs font-bold text-white hover:bg-deep-navy/90 dark:bg-muted-gold dark:text-charcoal-black dark:hover:bg-muted-gold/90 transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Article
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Main Workspace (Preview vs Editor split) */}
      {previewMode ? (
        /* Preview Mode Mock */
        <div className="border border-border rounded-xl bg-card p-6 sm:p-10 space-y-6 max-w-3xl mx-auto">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-gold">
              {category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-foreground">
              {title || "Untitled Article"}
            </h1>
            <p className="text-muted-foreground italic border-l-2 border-muted-gold pl-4 text-sm">
              {excerpt || "Excerpt goes here..."}
            </p>
          </div>
          {coverImage && (
            <div className="aspect-video w-full relative rounded-lg overflow-hidden bg-muted">
              <img src={coverImage} alt="Cover Preview" className="object-cover w-full h-full" />
            </div>
          )}
          <div
            className="prose prose-sm dark:prose-invert text-foreground/90 max-w-none pt-6 border-t border-border"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Preview renders admin-authored HTML content, not user input
            dangerouslySetInnerHTML={{ __html: content || "<p>Content goes here...</p>" }}
          />
        </div>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Input Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="article-title"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Title
              </label>
              <input
                id="article-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full h-12 px-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base font-semibold"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label
                htmlFor="article-excerpt"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Excerpt
              </label>
              <textarea
                id="article-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a short summary (excerpt) for listing cards..."
                rows={3}
                className="w-full p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
              />
            </div>

            {/* Content editor */}
            <div className="space-y-2">
              <label
                htmlFor="article-content"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Content
              </label>
              <TiptapEditor content={content} onChange={setContent} />
            </div>
          </div>

          {/* Sidebar Settings Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Publishing Settings */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <h3 className="font-bold text-sm text-foreground border-b border-border pb-3">
                Publishing Settings
              </h3>

              {/* Category selection */}
              <div className="space-y-2">
                <label
                  htmlFor="article-category"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Category
                </label>
                <select
                  id="article-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="technology">Technology</option>
                  <option value="leadership">Leadership</option>
                  <option value="learning">Learning</option>
                  <option value="community">Community</option>
                  <option value="reflections">Reflections</option>
                </select>
              </div>

              {/* Custom Slug */}
              <div className="space-y-2">
                <label
                  htmlFor="article-slug"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Slug (Optional)
                </label>
                <input
                  id="article-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-if-blank"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {/* Cover Image URL */}
              <div className="space-y-2">
                <label
                  htmlFor="article-cover"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Cover Image URL
                </label>
                <input
                  id="article-cover"
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label
                  htmlFor="article-status"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Status
                </label>
                <select
                  id="article-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <label
                  htmlFor="article-published-at"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Publish Date (Optional)
                </label>
                <input
                  id="article-published-at"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>

            {/* Card 2: Advanced SEO Settings & Previews */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Globe className="h-4 w-4 text-muted-gold" />
                <h3 className="font-bold text-sm text-foreground">Advanced SEO Settings</h3>
              </div>

              {/* SEO Title */}
              <div className="space-y-2">
                <label
                  htmlFor="article-seo-title"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  SEO Meta Title
                  <span className="text-[10px] text-muted-foreground block normal-case font-normal">
                    Defaults to article title if blank
                  </span>
                </label>
                <input
                  id="article-seo-title"
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "Defaults to article title"}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {/* SEO Description */}
              <div className="space-y-2">
                <label
                  htmlFor="article-seo-desc"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  SEO Meta Description
                  <span className="text-[10px] text-muted-foreground block normal-case font-normal">
                    Defaults to excerpt if blank
                  </span>
                </label>
                <textarea
                  id="article-seo-desc"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || "Defaults to article excerpt"}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                />
              </div>

              {/* Open Graph Image */}
              <div className="space-y-2">
                <label
                  htmlFor="article-og-image"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Open Graph Image URL
                  <span className="text-[10px] text-muted-foreground block normal-case font-normal">
                    Defaults to cover image if blank
                  </span>
                </label>
                <input
                  id="article-og-image"
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder={coverImage || "Defaults to cover image"}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {/* Canonical URL */}
              <div className="space-y-2">
                <label
                  htmlFor="article-canonical"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Canonical URL
                </label>
                <input
                  id="article-canonical"
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://originalsite.com/post"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {/* Live Social Preview */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-muted-gold animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Social & Search Preview
                  </span>
                </div>
                <SeoPreview
                  title={title}
                  excerpt={excerpt}
                  coverImage={coverImage}
                  slug={slug}
                  seoTitle={seoTitle}
                  seoDescription={seoDescription}
                  ogImage={ogImage}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
