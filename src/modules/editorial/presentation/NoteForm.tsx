"use client";

import NoteLayout from "./NoteLayout";
import { readingTimeLabel } from "./note-format";
import { calculateReadingTime } from "../domain/reading-time";
import { createNoteAction, setNoteTagsAction, updateNoteAction } from "@/modules/editorial/actions";
import type { Note, NoteChapter, NoteRevision, NoteStatus, Tag } from "@/modules/editorial/contracts";
import RevisionHistory from "./RevisionHistory";
import ImageUploadField from "@/components/admin/media/ImageUploadField";
import SaveStatusIndicator, { type SaveStatus } from "@/components/admin/ui/SaveStatusIndicator";

import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { createNoteSchema } from "@/lib/validation/schemas";
import type { NoteAuthor } from "@/modules/site/contracts";
import { ArrowLeft, Edit2, Eye, Globe, Loader2, Save, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import SeoPreview from "@/components/admin/SeoPreview";
import TagPicker from "@/components/admin/TagPicker";
import TiptapEditor from "@/components/admin/TiptapEditor";

interface NoteFormProps {
  initialData?: Note;
  allTags?: Tag[];
  initialTags?: Tag[];
  revisions?: NoteRevision[];
  author: NoteAuthor;
}

export default function NoteForm({
  initialData,
  allTags = [],
  initialTags = [],
  revisions = [],
  author,
}: NoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewMode, setPreviewMode] = useState(false);

  // Form States
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [category, setCategory] = useState<NoteChapter>(initialData?.category || "technology");
  const [status, setStatus] = useState<NoteStatus>(initialData?.status || "draft");
  const [publishedAt, setPublishedAt] = useState(
    initialData?.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : ""
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);

  // Advanced SEO States
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || "");
  const [ogImage, setOgImage] = useState(initialData?.og_image || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonical_url || "");

  const [error, setError] = useState<string | null>(null);

  // ── Save Status & Unsaved-Changes Guard ─────────────────────────────────────
  // 'isDirty' is true once any field has been changed from the initial value.
  // It drives both the browser beforeunload guard and the status badge.
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Mark form dirty whenever a key field changes.
  // We use useEffect so the flag is set after the first user interaction,
  // not on the initial render with pre-populated edit data.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional field tracking
  useEffect(() => {
    setIsDirty(true);
    setSaveStatus("unsaved");
  }, [
    title,
    excerpt,
    content,
    coverImage,
    slug,
    category,
    status,
    publishedAt,
    seoTitle,
    seoDescription,
    ogImage,
    canonicalUrl,
  ]);

  // Register the beforeunload guard   blocks tab close when there are unsaved changes.
  useUnsavedChanges({ isDirty: isDirty && saveStatus === "unsaved" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── Publishing validation ──────────────────────────────────────────────────
    // Block submission if required fields are missing.
    if (!title.trim()) {
      setError("Title is required before saving.");
      return;
    }
    if (!excerpt.trim()) {
      setError("Excerpt is required; it introduces the note in Today’s Page and note lists.");
      return;
    }
    if (!content.trim() || content.trim() === "<p></p>") {
      setError("Content cannot be empty.");
      return;
    }
    // Extra guard: block publish without a cover image
    if (status === "published" && !coverImage.trim()) {
      setError("A cover image is required before publishing.");
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
    const validation = createNoteSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Check the note details.");
      return;
    }
    const validatedNote = {
      ...validation.data,
      cover_image: validation.data.cover_image ?? null,
      published_at: validation.data.published_at ?? null,
    };

    setSaveStatus("saving");
    startTransition(async () => {
      let result: { success: boolean; error: string | null; data?: Note | null };
      if (initialData?.id) {
        result = await updateNoteAction(initialData.id, validatedNote);
      } else {
        result = await createNoteAction(validatedNote);
      }

      if (result.success && result.data) {
        const noteId = result.data.id;
        const tagIds = selectedTags.map((t) => t.id);
        await setNoteTagsAction(noteId, tagIds);
        setSaveStatus("saved");
        setIsDirty(false);
        // Only redirect when publishing   Save stays on this page
        if (validatedNote.status === "published") {
          router.push("/admin/notes");
          router.refresh();
        }
      } else {
        setSaveStatus("unsaved");
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
            href="/admin/notes"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-black tracking-tight text-foreground">
              {initialData ? `Edit: ${initialData.title}` : "Create New Note"}
            </h1>
            {/* Save status badge   shows Unsaved / Saving / Saved */}
            <SaveStatusIndicator status={isPending ? "saving" : saveStatus} />
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
                <Eye className="h-4 w-4" /> Quick Preview
              </>
            )}
          </button>

          {initialData?.id && (
            <Link
              href={`/admin/notes/${initialData.id}/preview`}
              target="_blank"
              className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-muted-gold/40 bg-muted-gold/10 px-4 text-xs font-bold text-muted-gold hover:bg-muted-gold/20 transition-colors"
            >
              <Globe className="h-4 w-4" /> Full Preview
            </Link>
          )}

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
            Save Note
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
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <NoteLayout
            note={{
              title: title || "Untitled note",
              excerpt,
              category,
              cover_image: coverImage || null,
              published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
            }}
            bodyHtml={content || "<p>Start writing to see your note here.</p>"}
            readingTime={readingTimeLabel(calculateReadingTime(content))}
            author={author}
            topics={selectedTags}
            dateFallback="Not yet published"
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
                htmlFor="note-title"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Title
              </label>
              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="w-full h-12 px-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base font-semibold"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label
                htmlFor="note-excerpt"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Excerpt <span className="text-destructive">*</span>
                <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal">
                  Required. This introduces the latest note in Today&apos;s Page and note lists.
                </span>
              </label>
              <textarea
                id="note-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write the short introduction that invites readers into the note…"
                rows={3}
                minLength={10}
                maxLength={500}
                required
                className="w-full p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
              />
              <p className="text-right text-[10px] text-muted-foreground">{excerpt.length}/500</p>
            </div>

            {/* Content editor */}
            <div className="space-y-2">
              <label
                htmlFor="note-content"
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
                  htmlFor="note-category"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Category
                </label>
                <select
                  id="note-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoteChapter)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="technology">Technology</option>
                  <option value="leadership">Leadership</option>
                  <option value="learning">Learning</option>
                  <option value="community">Community</option>
                  <option value="reflections">Reflections</option>
                </select>
              </div>

              {/* Tags (Granular Discovery) */}
              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <TagIcon className="h-3.5 w-3.5 text-muted-gold" />
                  Tags
                </span>
                <TagPicker
                  allTags={allTags}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>

              {/* Custom Slug */}
              <div className="space-y-2">
                <label
                  htmlFor="note-slug"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Slug (Optional)
                </label>
                <input
                  id="note-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-if-blank"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              <ImageUploadField
                label="Cover image"
                description="Required to publish. Shown at 16:9 on the note and in lists."
                purpose="cover"
                aspectClassName="aspect-video"
                value={coverImage}
                onChange={setCoverImage}
                allowUrl
              />

              {/* Status */}
              <div className="space-y-2">
                <label
                  htmlFor="note-status"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Status
                </label>
                <select
                  id="note-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as NoteStatus)}
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
                  htmlFor="note-published-at"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Publish Date (Optional)
                </label>
                <input
                  id="note-published-at"
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
                  htmlFor="note-seo-title"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  SEO Meta Title
                  <span className="text-[10px] text-muted-foreground block normal-case font-normal">
                    Defaults to note title if blank
                  </span>
                </label>
                <input
                  id="note-seo-title"
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "Defaults to note title"}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {/* SEO Description */}
              <div className="space-y-2">
                <label
                  htmlFor="note-seo-desc"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  SEO Meta Description
                  <span className="text-[10px] text-muted-foreground block normal-case font-normal">
                    Defaults to excerpt if blank
                  </span>
                </label>
                <textarea
                  id="note-seo-desc"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || "Defaults to note excerpt"}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                />
              </div>

              {/* Open Graph Image */}
              <div className="space-y-2">
                <label
                  htmlFor="note-og-image"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Open Graph Image URL
                  <span className="text-[10px] text-muted-foreground block normal-case font-normal">
                    Defaults to cover image if blank
                  </span>
                </label>
                <input
                  id="note-og-image"
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
                  htmlFor="note-canonical"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Canonical URL
                </label>
                <input
                  id="note-canonical"
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
                  <Globe className="h-4 w-4 text-muted-gold" />
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

            {/* Card 3: Revision History (Edit Mode only) */}
            {initialData?.id && <RevisionHistory revisions={revisions} noteId={initialData.id} />}
          </div>
        </div>
      )}
    </form>
  );
}
