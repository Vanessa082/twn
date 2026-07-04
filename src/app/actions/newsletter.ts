/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NEWSLETTER SERVER ACTION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🧠 LEARNING POINT: What is a Server Action?
 * In React 19 / Next.js 15, Server Actions are async functions marked with
 * "use server" that execute EXCLUSIVELY on the server — never in the browser.
 * They are like API route handlers, but without the ceremony of writing
 * a separate /api/newsletter route. You can call them directly from forms
 * or client components, and Next.js handles the network request for you.
 *
 * Security benefit: The database credentials, API keys, and service logic never
 * reach the browser at all. The browser only sees the return value.
 *
 * 🧠 LEARNING POINT: The Action Pattern (Validate → Process → Return)
 * Every action follows a predictable three-step pattern:
 *  1. Validate inputs (never trust what comes from the browser/form)
 *  2. Delegate to the service layer (keep actions thin)
 *  3. Return a predictable result object the UI can act on
 */
"use server";

import { addSubscriber } from "@/lib/services/subscribers";

/**
 * Handles newsletter subscription form submission.
 *
 * @param prevState - The previous state, required by React's useActionState hook.
 *                   This lets React keep track of previous submissions, useful
 *                   if you need to compare old vs new state (e.g. for animations).
 * @param formData  - The raw HTML FormData object. This is a native browser type
 *                    that contains all form field values by name attribute.
 *                    We access values with formData.get("fieldName").
 */
export async function subscribeAction(_prevState: unknown, formData: FormData) {
  // 1. VALIDATE: Extract and validate the email field
  //    .get("email") fetches the value of the <input name="email"> field
  //    .toString() converts it from FormDataEntryValue to a plain string
  const email = formData.get("email")?.toString().trim();

  // Guard clause: return early with an error if email is missing
  if (!email) {
    return { success: false, error: "Email address is required." };
  }

  // 2. PROCESS: Delegate to the service layer — no raw DB calls here
  //    The service handles deeper validation (email regex, duplicate checks)
  const result = await addSubscriber(email);

  // 3. RETURN: Pass the service result directly back to the UI component
  return result;
}
