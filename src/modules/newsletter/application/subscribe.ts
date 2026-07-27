import { sendWelcomeEmail } from "@/lib/services/email";
import type { SubscribeResult } from "../domain/subscriber";
import {
  type SubscriberRepository,
  SupabaseSubscriberRepository,
} from "../infrastructure/subscriber-repository";

export async function subscribeToNewsletter(
  email: string,
  repository: SubscriberRepository = new SupabaseSubscriberRepository()
): Promise<SubscribeResult> {
  if (!email || typeof email !== "string") {
    return { success: false, error: "Email address is required." };
  }

  const cleanEmail = email.trim().toLowerCase();

  const result = await repository.insert({ email: cleanEmail });
  if (!result.success) {
    return result;
  }

  // Non-fatal welcome email dispatch
  try {
    await sendWelcomeEmail(cleanEmail);
  } catch (emailError) {
    console.error("[subscribeToNewsletter] Welcome email failed:", emailError);
  }

  return { success: true, error: null };
}
