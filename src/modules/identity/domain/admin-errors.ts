import { ZodError } from "zod";

export class AdminAuthError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

export function toAdminActionError(error: unknown): string {
  if (error instanceof AdminAuthError) return error.message;
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Some fields are invalid.";
  if (error instanceof Error) {
    const missingTable = error.message.match(/Could not find the table '(?:public\.)?(\w+)'/);
    if (missingTable) {
      return `The "${missingTable[1]}" table does not exist yet. Run its migration in the Supabase SQL Editor, then try again.`;
    }
    return error.message;
  }
  return "Admin action failed.";
}
