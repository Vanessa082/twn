import type { Note } from "@/modules/editorial/contracts";
import type { AboutData } from "./about";
import type { HomepageSettings, UpdateHomepageSettingsInput } from "./homepage";

export interface AboutSettingsRepository {
  get(): Promise<AboutData>;
  save(data: AboutData): Promise<AboutData>;
}

export interface HomepageSettingsRepository {
  findCurrent(): Promise<HomepageSettings>;
  findCurrentAdmin(): Promise<{ settings: HomepageSettings; tableReady: boolean }>;
  upsert(input: UpdateHomepageSettingsInput): Promise<HomepageSettings>;
}

export interface PublishedNoteLookup {
  findPublishedById(id: string): Promise<Note | null>;
}
