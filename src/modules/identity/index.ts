import {
  canAccessAdmin as accessAdmin,
  canManageFieldNotes as manageFieldNotes,
  canManageHomepage as manageHomepage,
  canManageNotebookEntries as manageNotebookEntries,
  canManageNotes as manageNotes,
  canManageProjects as manageProjects,
  canManageSubscribers as manageSubscribers,
  canModerateMarginNotes as moderateMarginNotes,
  canModerateSharedPages as moderateSharedPages,
} from "./application/policies";
import { requireAdmin as checkClerkAdmin } from "./infrastructure/clerk-admin";

export {
  isAuthorizedAdmin,
  parseAdminUserIds,
  type AdminAccessInput,
} from "./domain/admin-access";
export { AdminAuthError, toAdminActionError } from "./domain/admin-errors";

export async function requireAdmin() {
  return checkClerkAdmin();
}

export async function canAccessAdmin() {
  return accessAdmin(checkClerkAdmin);
}

export async function canManageNotes() {
  return manageNotes(checkClerkAdmin);
}

export async function canManageNotebookEntries() {
  return manageNotebookEntries(checkClerkAdmin);
}

export async function canModerateSharedPages() {
  return moderateSharedPages(checkClerkAdmin);
}

export async function canModerateMarginNotes() {
  return moderateMarginNotes(checkClerkAdmin);
}

export async function canManageSubscribers() {
  return manageSubscribers(checkClerkAdmin);
}

export async function canManageProjects() {
  return manageProjects(checkClerkAdmin);
}

export async function canManageFieldNotes() {
  return manageFieldNotes(checkClerkAdmin);
}

export async function canManageHomepage() {
  return manageHomepage(checkClerkAdmin);
}
