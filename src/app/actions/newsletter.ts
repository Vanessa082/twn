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

import { enforceRateLimit, isBotSubmission } from "@/lib/security/submission-protection";
import { addSubscriber } from "@/lib/services/subscribers";
import { subscribeNewsletterSchema } from "@/lib/validation/schemas";

export async function subscribeAction(_prevState: unknown, formData: FormData) {
  // Honeypot check
  const honeypot = formData.get("website")?.toString();
  if (isBotSubmission(honeypot)) {
    return { success: true, error: null };
  }

  // Rate Limiting (max 5 subscriptions per 10 min)
  const rateLimit = await enforceRateLimit("newsletter_subscribe", 5);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error! };
  }

  const email = formData.get("email")?.toString().trim();

  const validated = subscribeNewsletterSchema.safeParse({ email });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid email address.",
    };
  }

  const result = await addSubscriber(validated.data.email);
  return result;
}
