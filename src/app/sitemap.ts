import { absoluteUrl, routes } from "@/lib/site";
import { noteChapterEnum } from "@/lib/validation/schemas";
import { buildSharedPageSlug, getApprovedSharedPages } from "@/modules/community";
import { getPublishedNoteRefs } from "@/modules/editorial";
import { getPublicCollections } from "@/modules/editorial";
import { getAllTags } from "@/modules/editorial";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [notes, collections, tags, sharedPages] = await Promise.all([
    getPublishedNoteRefs(),
    getPublicCollections(),
    getAllTags(),
    getApprovedSharedPages(),
  ]);

  const latestNote = notes[0]?.updated_at ? new Date(notes[0].updated_at) : new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(routes.home),
      lastModified: latestNote,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl(routes.notebook),
      lastModified: latestNote,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl(routes.archive),
      lastModified: latestNote,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    { url: absoluteUrl(routes.workbench), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl(routes.about), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl(routes.community), changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl(routes.newsletter), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl(routes.contact), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/collections"), changeFrequency: "weekly", priority: 0.5 },
  ];

  const chapters: MetadataRoute.Sitemap = noteChapterEnum.options.map((category) => ({
    url: absoluteUrl(routes.notebookTopic(category)),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const notePages: MetadataRoute.Sitemap = notes.map((note) => ({
    url: absoluteUrl(routes.note(note.slug)),
    lastModified: new Date(note.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const collectionPages: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: absoluteUrl(`/collections/${encodeURIComponent(collection.slug)}`),
    lastModified: collection.updated_at ? new Date(collection.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const topicPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: absoluteUrl(routes.topic(tag.slug)),
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const communityPages: MetadataRoute.Sitemap = sharedPages.map((page) => ({
    url: absoluteUrl(`/pages/${buildSharedPageSlug(page)}`),
    lastModified: new Date(page.updated_at),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    ...staticPages,
    ...chapters,
    ...notePages,
    ...collectionPages,
    ...topicPages,
    ...communityPages,
  ];
}
