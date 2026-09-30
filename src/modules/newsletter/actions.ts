"use server";

import { enforceRateLimit, isBotSubmission } from "@/lib/security/submission-protection";
import { subscribeToNewsletter } from "./application/subscribe";
import { mailer, subscribers } from "./compose";
import { subscribeNewsletterSchema } from "./presentation/schemas/subscriber-input-schema";

export async function subscribeAction(_prevState: unknown, formData: FormData) {
  const honeypot = formData.get("website")?.toString();
  if (isBotSubmission(honeypot)) {
    return { success: true, error: null };
  }

  const rateLimit = await enforceRateLimit("newsletter_subscribe", 5);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error ?? "Please wait a moment and try again." };
  }

  const email = formData.get("email")?.toString().trim();
  const validated = subscribeNewsletterSchema.safeParse({ email });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid email address.",
    };
  }

  return subscribeToNewsletter(validated.data.email, subscribers(), mailer());
}
