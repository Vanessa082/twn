// ── Editorial CMS models ────────────────────────────────────────────────────
// Shared by services (server) and admin managers (client), so this file must
// stay free of server-only imports.

import type { Article } from "@/types";

// Workbench

export const PROJECT_STATUSES = ["Building", "Active", "Shipped", "Continuous", "Paused"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  name: string;
  category: string;
  status: ProjectStatus;
  /** What it is. */
  overview: string;
  why_started: string | null;
  what_im_learning: string | null;
  stack: string[];
  url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type ProjectInput = Omit<Project, "id" | "created_at" | "updated_at">;

// Field Notes

export interface FieldNote {
  id: string;
  /** Display number, e.g. "021". */
  note_number: string;
  tag: string;
  headline: string;
  body: string;
  is_published: boolean;
  display_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type FieldNoteInput = Omit<FieldNote, "id" | "published_at" | "created_at" | "updated_at">;

// Homepage & site settings

export interface SocialLink {
  label: string;
  url: string;
}

export interface HomepageSettings {
  id: string;
  featured_article_id: string | null;
  volume_label: string;
  volume_subtitle: string;
  volume_season: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_topics: string[];
  contact_email: string | null;
  location: string | null;
  social_links: SocialLink[];
  updated_at: string;
}

export interface HomepageSettingsWithArticle extends HomepageSettings {
  /** The resolved featured article (null if none configured or not published). */
  featured_article: Article | null;
}

export type UpdateHomepageSettingsInput = Partial<Omit<HomepageSettings, "id" | "updated_at">>;
