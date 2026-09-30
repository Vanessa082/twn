import type { AboutData } from "../domain/about";
import type { AboutSettingsRepository } from "../domain/ports";

export async function getAboutData(repository: AboutSettingsRepository): Promise<AboutData> {
  return repository.get();
}

export async function updateAboutData(
  data: AboutData,
  repository: AboutSettingsRepository
): Promise<AboutData> {
  return repository.save(data);
}
