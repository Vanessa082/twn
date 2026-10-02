import type {
  HomepageSettings,
  HomepageSettingsAdminResult,
  HomepageSettingsWithNote,
  UpdateHomepageSettingsInput,
} from "../domain/homepage";
import type { HomepageSettingsRepository, PublishedNoteLookup } from "../domain/ports";

export async function getHomepageSettings(
  repository: HomepageSettingsRepository,
  notes: PublishedNoteLookup
): Promise<HomepageSettingsWithNote> {
  const settings = await repository.findCurrent();
  const featured_note = settings.featured_article_id
    ? await notes.findPublishedById(settings.featured_article_id)
    : null;
  return { ...settings, featured_note };
}

export async function getHomepageSettingsAdmin(
  repository: HomepageSettingsRepository
): Promise<HomepageSettingsAdminResult> {
  return repository.findCurrentAdmin();
}

export async function updateHomepageSettings(
  input: UpdateHomepageSettingsInput,
  repository: HomepageSettingsRepository
): Promise<HomepageSettings> {
  return repository.upsert(input);
}
