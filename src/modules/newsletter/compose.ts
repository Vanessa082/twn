import { ResendEmailAdapter } from "./infrastructure/resend-email-adapter";
import { SupabaseSubscriberRepository } from "./infrastructure/subscriber-repository";

export function subscribers() {
  return new SupabaseSubscriberRepository();
}

export function mailer() {
  return new ResendEmailAdapter();
}
