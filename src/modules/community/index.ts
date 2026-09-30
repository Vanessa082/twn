import {
  deleteMarginNoteAdmin as removeMarginNote,
  getAllMarginNotesAdmin as loadMarginNotesAdmin,
  getApprovedMarginNotesForNote as loadApprovedMarginNotes,
  submitMarginNote as addMarginNote,
  updateMarginNotePinAdmin as pinMarginNote,
  updateMarginNoteStatusAdmin as moderateMarginNote,
} from "./application/margin-notes";
import {
  deleteSharedPageAdmin as removeSharedPage,
  getAllSharedPagesAdmin as loadSharedPagesAdmin,
  getApprovedSharedPageBySlug as loadSharedPageBySlug,
  getApprovedSharedPages as loadApprovedSharedPages,
  submitSharedPage as addSharedPage,
  updateSharedPageStatusAdmin as moderateSharedPage,
} from "./application/shared-pages";
import type { ModerationStatus } from "./domain/types";
import { SupabaseMarginNoteRepository } from "./infrastructure/margin-note-repository";
import { SupabaseSharedPageRepository } from "./infrastructure/shared-page-repository";

function marginNotes() {
  return new SupabaseMarginNoteRepository();
}

function sharedPages() {
  return new SupabaseSharedPageRepository();
}

export async function getApprovedMarginNotesForNote(noteId: string) {
  return loadApprovedMarginNotes(noteId, marginNotes());
}

export async function submitMarginNote(noteId: string, authorName: string, content: string) {
  return addMarginNote(noteId, authorName, content, marginNotes());
}

export async function getAllMarginNotesAdmin() {
  return loadMarginNotesAdmin(marginNotes());
}

export async function updateMarginNoteStatusAdmin(id: string, status: ModerationStatus) {
  return moderateMarginNote(id, status, marginNotes());
}

export async function updateMarginNotePinAdmin(id: string, pinned: boolean) {
  return pinMarginNote(id, pinned, marginNotes());
}

export async function deleteMarginNoteAdmin(id: string) {
  return removeMarginNote(id, marginNotes());
}

export async function getApprovedSharedPages() {
  return loadApprovedSharedPages(sharedPages());
}

export async function getApprovedSharedPageBySlug(slug: string) {
  return loadSharedPageBySlug(slug, sharedPages());
}

export async function submitSharedPage(authorName: string, title: string | null, content: string) {
  return addSharedPage(authorName, title, content, sharedPages());
}

export async function getAllSharedPagesAdmin() {
  return loadSharedPagesAdmin(sharedPages());
}

export async function updateSharedPageStatusAdmin(id: string, status: ModerationStatus) {
  return moderateSharedPage(id, status, sharedPages());
}

export async function deleteSharedPageAdmin(id: string) {
  return removeSharedPage(id, sharedPages());
}

export { FALLBACK_MARGIN_NOTES, FALLBACK_SHARED_PAGES } from "./domain/community-content";
export {
  buildSharedPageSlug,
  extractSharedPageIdHint,
  isUuid,
  type SharedPageSlugSource,
} from "./domain/shared-page-slug";
export { findSharedPageByParam } from "./domain/shared-page-lookup";
export { truncateSharedPagePreview } from "./domain/shared-page-preview";
export type { MarginNote, ModerationStatus, SharedPage } from "./domain/types";
