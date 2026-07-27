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
      console.log("[broadcastNewArticle] No subscribers to notify.");
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

    console.log(
      `[broadcastNewArticle] Broadcast complete. Sent: ${sent}, Failed: ${failed}, Total: ${emails.length}`
    );
  } catch (err) {
    console.error("[broadcastNewArticle] Unexpected error:", err);
  }

  return { sent, failed };
}
