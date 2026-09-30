import { createFormHookContexts } from "@tanstack/react-form";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

/** Turns TanStack Form errors (strings or Standard Schema issues) into messages. */
export function errorMessages(errors: unknown[]): string[] {
  const messages = errors.flatMap((error) => {
    if (!error) return [];
    if (typeof error === "string") return [error];
    if (Array.isArray(error)) return errorMessages(error);
    if (typeof error === "object" && "message" in error) return [String(error.message)];
    return [];
  });
  return [...new Set(messages)];
}
