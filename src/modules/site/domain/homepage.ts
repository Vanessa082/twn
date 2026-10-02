import type { Note } from "@/modules/editorial/contracts";

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

export interface HomepageSettingsWithNote extends HomepageSettings {
  featured_note: Note | null;
}

export interface UpdateHomepageSettingsInput
  extends Partial<Omit<HomepageSettings, "id" | "updated_at">> {}

export interface HomepageSettingsAdminResult {
  settings: HomepageSettings;
  tableReady: boolean;
}
