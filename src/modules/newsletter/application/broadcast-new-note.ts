import { logger } from "@/lib/observability/logger";
import type { EmailDeliveryPort, NoteBroadcastPayload } from "../domain/email-port";
import type { SubscriberRepository } from "../domain/ports";

export async function broadcastNewNote(
  note: NoteBroadcastPayload,
  repository: SubscriberRepository,
  mailer: EmailDeliveryPort
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  try {
    const emails = await repository.findAllEmailsAdmin();
    if (emails.length === 0) {
      return { sent: 0, failed: 0 };
    }

    for (const email of emails) {
      try {
        await mailer.sendNotePublished(email, note);
        sent++;
      } catch {
        failed++;
      }
    }

    logger.info(
      "newsletter.broadcast.completed",
      { sent, failed, total: emails.length },
      "newsletter"
    );
  } catch (err) {
    logger.error("newsletter.broadcast.failed", err, {}, "newsletter");
  }

  return { sent, failed };
}

