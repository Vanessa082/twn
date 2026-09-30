import type { AboutData } from "@/types/about";

export interface AuthorPortrait {
  src: string;
  alt: string;
  caption: string;
  location: string;
}

export interface NoteAuthor {
  name: string;
  lead: string;
  portrait: AuthorPortrait | null;
}

/** The published portrait, or null when the author has removed it in the dashboard. */
export function getAuthorPortrait(hero: AboutData["hero"]): AuthorPortrait | null {
  const src = hero.image_url?.trim();
  if (!src) return null;
  return {
    src,
    alt: hero.image_alt?.trim() || `Portrait of ${hero.title}`,
    caption: hero.image_caption?.trim() ?? "",
    location: hero.image_location?.trim() ?? "",
  };
}

/** Byline details shown on every note. */
export function getNoteAuthor(hero: AboutData["hero"]): NoteAuthor {
  return { name: hero.title, lead: hero.lead, portrait: getAuthorPortrait(hero) };
}
