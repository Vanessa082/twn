"use server";

import { enforceRateLimit, isBotSubmission } from "@/lib/security/submission-protection";
import { subscribeNewsletterSchema, subscribeToNewsletter } from "@/modules/newsletter";

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

  return subscribeToNewsletter(validated.data.email);
}
