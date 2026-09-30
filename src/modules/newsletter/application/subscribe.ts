import type { EmailDeliveryPort } from "../domain/email-port";
import type { SubscribeResult } from "../domain/subscriber";
import type { SubscriberRepository } from "../domain/ports";

export async function subscribeToNewsletter(
  email: string,
  repository: SubscriberRepository,
  mailer: EmailDeliveryPort
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
    await mailer.sendWelcome(cleanEmail);
  } catch (emailError) {
    console.error("[subscribeToNewsletter] Welcome email failed:", emailError);
  }

  return { success: true, error: null };
}
