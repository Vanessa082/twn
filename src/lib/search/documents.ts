import { getLatestArticles } from "@/lib/services/articles";
import { getPublicCollections } from "@/lib/services/collections";
import { getPublishedFieldNotes } from "@/lib/services/field-notes";
import { getHomepageSettings } from "@/lib/services/homepage-settings";
import { getPublishedProjects } from "@/lib/services/projects";
import { getAllTags } from "@/lib/services/tags";
import { routes } from "@/lib/site";
import { buildSharedPageSlug } from "@/lib/utils/shared-page-slug";
import { getApprovedSharedPages } from "@/modules/community";
import { type SearchDocument, type SearchIndex, buildSearchIndex } from "./engine";

const INDEX_TTL_SECONDS = 300;
/** Mirrors the homepage, which only renders this many field notes; deeper ones have no URL. */
const LINKABLE_FIELD_NOTES = 3;

function plainText(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

async function loadDocuments(): Promise<SearchDocument[]> {
  const [notes, fieldNotes, projects, collections, tags, sharedPages] = await Promise.all([
    getLatestArticles(100),
    getPublishedFieldNotes(LINKABLE_FIELD_NOTES),
    getPublishedProjects(),
    getPublicCollections(),
    getAllTags(),
    getApprovedSharedPages(),
  ]);

  return [
    ...notes.map<SearchDocument>((note) => ({
      id: `note-${note.id}`,
      type: "note",
      title: note.title,
      excerpt: note.excerpt,
      body: plainText(note.content).slice(0, 20_000),
      keywords: [note.category, note.seo_title ?? "", note.seo_description ?? ""],
      url: routes.note(note.slug),
      image: note.cover_image,
      date: note.published_at,
      meta: note.category,
    })),
    ...fieldNotes.map<SearchDocument>((note) => ({
      id: `field-${note.id}`,
      type: "field_note",
      title: note.headline,
      excerpt: clip(note.body),
      body: note.body,
      keywords: [note.tag, `no ${note.note_number}`],
      url: `/#field-note-${note.id}`,
      date: note.published_at,
      meta: `No. ${note.note_number}`,
    })),
    ...projects.map<SearchDocument>((project) => ({
      id: `project-${project.id}`,
      type: "project",
      title: project.name,
      excerpt: clip(project.overview),
      body: [project.why_started, project.what_im_learning].filter(Boolean).join(" "),
      keywords: [project.category, project.status, ...project.stack],
      url: `${routes.workbench}#project-${project.id}`,
      date: project.updated_at,
      meta: project.status,
    })),
    ...collections.map<SearchDocument>((collection) => ({
      id: `collection-${collection.id}`,
      type: "collection",
      title: collection.title,
      excerpt: clip(collection.description ?? "A curated reading path through the notebook."),
      url: `/collections/${encodeURIComponent(collection.slug)}`,
      image: collection.cover_image,
      date: collection.updated_at,
      meta: "Collection",
    })),
    ...tags.map<SearchDocument>((tag) => ({
      id: `topic-${tag.id}`,
      type: "topic",
      title: tag.name,
      excerpt: `Every note about ${tag.name}.`,
      keywords: [tag.slug.replace(/-/g, " ")],
      url: routes.topic(tag.slug),
      meta: "Topic",
    })),
    ...sharedPages.map<SearchDocument>((page) => ({
      id: `page-${page.id}`,
      type: "shared_page",
      title: page.title?.trim() || `A page from ${page.author_name}`,
      excerpt: clip(page.content),
      body: page.content,
      keywords: [page.author_name],
      url: `/pages/${buildSharedPageSlug(page)}`,
      date: page.published_at ?? page.submitted_at,
      meta: page.author_name,
    })),
  ];
}

let cached: { builtAt: number; index: Promise<SearchIndex> } | null = null;

export function getSearchIndex(): Promise<SearchIndex> {
  const now = Date.now();
  if (!cached || now - cached.builtAt > INDEX_TTL_SECONDS * 1000) {
    const index = loadDocuments().then(buildSearchIndex);
    cached = { builtAt: now, index };
    index.catch(() => {
      cached = null;
    });
  }
  return cached.index;
}

/** Editor-managed topics shown before the reader types anything. */
export async function getPopularSearches(): Promise<string[]> {
  const settings = await getHomepageSettings();
  const categories = ["Technology", "Leadership", "Learning", "Community", "Reflections"];
  return [...new Set([...settings.hero_topics, ...categories])].slice(0, 8);
}
