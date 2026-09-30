/**
 * Site identity and public URL vocabulary.
 *
 * The platform is "The Notebook". Long-form writing is published as notes at
 * /notebook/[slug]. Every public link to writing must go through `routes` so
 * the vocabulary never drifts back to "articles" or "blog".
 */

export const site = {
  name: "The Notebook of a Tech Woman",
  shortName: "TWN",
  author: "Vanessa",
  description:
    "Notes on technology, leadership, learning and the journey of becoming, written by a woman building a life in tech.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://twnotebook.com").replace(/\/$/, ""),
  locale: "en_US",
} as const;

export const routes = {
  home: "/",
  notebook: "/notebook",
  note: (slug: string) => `/notebook/${encodeURIComponent(slug)}`,
  notebookTopic: (category: string) => `/notebook?category=${encodeURIComponent(category)}`,
  topic: (slug: string) => `/topics/${encodeURIComponent(slug)}`,
  fieldNotes: "/#field-notes",
  workbench: "/workbench",
  archive: "/archive",
  about: "/about",
  community: "/community",
  newsletter: "/newsletter",
  contact: "/contact",
  search: (query?: string) => (query ? `/search?q=${encodeURIComponent(query)}` : "/search"),
} as const;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
