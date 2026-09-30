import { getPublishedNoteById } from "@/modules/editorial";
import { cache } from "react";
import { getAboutData as loadAbout, updateAboutData as saveAbout } from "./application/about";
import {
  getHomepageSettings as loadHomepage,
  getHomepageSettingsAdmin as loadHomepageAdmin,
  updateHomepageSettings as saveHomepage,
} from "./application/homepage";
import type { AboutData } from "./domain/about";
import type { UpdateHomepageSettingsInput } from "./domain/homepage";
import { FileAndSupabaseAboutRepository } from "./infrastructure/about";
import { SupabaseHomepageSettingsRepository } from "./infrastructure/homepage-settings";

function about() {
  return new FileAndSupabaseAboutRepository();
}

function homepage() {
  return new SupabaseHomepageSettingsRepository();
}

const notes = {
  findPublishedById: getPublishedNoteById,
};

export async function getAboutData() {
  return loadAbout(about());
}

export async function updateAboutData(data: AboutData) {
  return saveAbout(data, about());
}

export const getHomepageSettings = cache(async () => {
  return loadHomepage(homepage(), notes);
});

export async function getHomepageSettingsAdmin() {
  return loadHomepageAdmin(homepage());
}

export async function updateHomepageSettings(input: UpdateHomepageSettingsInput) {
  return saveHomepage(input, homepage());
}

export {
  getAuthorPortrait,
  getNoteAuthor,
  type AuthorPortrait,
  type NoteAuthor,
} from "./domain/portrait";
export type { HomepageSettingsAdminResult } from "./domain/homepage";
export type {
  AboutCurrentlyItem,
  AboutData,
  AboutFiguringOutItem,
  HomepageSettings,
  HomepageSettingsWithNote,
  SocialLink,
  UpdateHomepageSettingsInput,
} from "./contracts";
