import type { AdminGate } from "../domain/ports";

/**
 * Named admin policies. Hiding UI is not security: every mutation must call
 * its policy on the server. The Clerk adapter is injected at the module door.
 */
export async function canAccessAdmin(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}

export async function canManageNotes(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}

export async function canManageNotebookEntries(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}

export async function canModerateSharedPages(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}

export async function canModerateMarginNotes(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}

export async function canManageSubscribers(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}

export async function canManageProjects(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}

export async function canManageFieldNotes(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}

export async function canManageHomepage(gate: AdminGate): Promise<{ userId: string }> {
  return gate();
}
