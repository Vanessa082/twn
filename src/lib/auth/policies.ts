"use server";

import { requireAdmin } from "./require-admin";

/**
 * Centralized Domain Authorization Policies for TWN.
 * Hiding UI buttons is NOT security — every administrative operation
 * MUST invoke its explicit domain policy on the server before mutating data.
 */

export async function canAccessAdmin(): Promise<{ userId: string }> {
  return await requireAdmin();
}

export async function canManageArticles(): Promise<{ userId: string }> {
  return await requireAdmin();
}

export async function canManageNotebookEntries(): Promise<{ userId: string }> {
  return await requireAdmin();
}

export async function canModerateSharedPages(): Promise<{ userId: string }> {
  return await requireAdmin();
}

export async function canModerateMarginNotes(): Promise<{ userId: string }> {
  return await requireAdmin();
}

export async function canManageSubscribers(): Promise<{ userId: string }> {
  return await requireAdmin();
}
