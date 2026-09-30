import { logger } from "@/lib/observability/logger";
import type { ArticleBroadcastPayload } from "@/lib/services/email";
import { sendArticleNewsletterEmail } from "@/lib/services/email";
import {
  type SubscriberRepository,
  SupabaseSubscriberRepository,
} from "../infrastructure/subscriber-repository";

export async function broadcastNewArticle(
  article: ArticleBroadcastPayload,
  repository: SubscriberRepository = new SupabaseSubscriberRepository()
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
        await sendArticleNewsletterEmail(email, article);
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
