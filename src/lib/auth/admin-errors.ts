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
  if (error instanceof Error) return error.message;
  return "Admin action failed.";
}
