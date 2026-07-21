// ─────────────────────────────────────────────────────────────────────────────
// Email Service — Resend Integration
// Handles all transactional emails: welcome, article broadcast, etc.
// Only ever called server-side (never imported by client components).
//
// NOTE: Using Resend's shared onboarding@resend.dev sender while no custom
// domain is configured. This domain can ONLY deliver to email addresses that
// are verified inside your Resend account dashboard (resend.com/audiences).
// Once you own a domain, verify it at resend.com/domains and update
// FROM_ADDRESS to "TWN <hello@yourdomain.com>" to unlock delivery to anyone.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from "@/lib/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

/** Site URL — update this when a custom domain is purchased. */
const SITE_URL = "https://twn-note.vercel.app";

/**
 * Shared sender address used across all TWN transactional emails.
 * IMPORTANT: While using onboarding@resend.dev, Resend can only deliver to
 * email addresses you have personally verified in your Resend dashboard.
 * Switch to a custom domain sender to deliver to any subscriber.
 */
const FROM_ADDRESS = "TWN <onboarding@resend.dev>";

/**
 * Sends a welcome email to a new newsletter subscriber.
 * Called immediately after a successful DB insert in addSubscriber().
 * Fails silently — a broken email must never block the subscription itself.
 */
export async function sendWelcomeEmail(email: string): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Welcome to The Notebook of a Tech Woman ✦",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to TWN</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F7;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F9F9F7;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #ECECEC;border-radius:16px;overflow:hidden;max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 24px;border-bottom:1px solid #F0F0EE;">
              <p style="margin:0;font-size:11px;font-family:'Arial',sans-serif;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#AE8D64;">The Notebook of a Tech Woman</p>
              <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;color:#1A1A1A;line-height:1.3;">
                Welcome to TWN ✦
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#444444;">
                Thank you for subscribing. You'll receive new notebook entries, articles, and reflections directly in your inbox — no noise, no spam.
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#444444;">
                TWN is a place for thoughtful writing at the intersection of technology and lived experience. We believe knowledge deserves to be preserved carefully — like pages in a notebook that lasts for years.
              </p>
              <blockquote style="margin:28px 0;padding:16px 20px;border-left:3px solid #AE8D64;background:#F9F9F7;border-radius:0 8px 8px 0;">
                <p style="margin:0;font-size:15px;font-style:italic;color:#555555;line-height:1.6;">
                  "Documentation is another form of leadership."
                </p>
              </blockquote>
              <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#777777;">
                If you ever want to leave a page — share a reflection, a lesson, or a thought — you can do so at any time on the site.
              </p>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;">
              <a href="${SITE_URL}" style="display:inline-block;padding:12px 28px;background:#1A1A1A;color:#FFFFFF;font-family:'Arial',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;border-radius:8px;">
                Read the Notebook →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #F0F0EE;background:#F9F9F7;">
              <p style="margin:0;font-size:11px;color:#999999;font-family:'Arial',sans-serif;line-height:1.6;">
                You're receiving this because you subscribed at twn-note.vercel.app.<br />
                To unsubscribe, reply with "unsubscribe" in the subject line.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });
  } catch (err) {
    // Non-fatal: log but don't throw — a broken email must not break the subscription
    console.error("[sendWelcomeEmail] Failed to send welcome email:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Article Broadcast Email
// ─────────────────────────────────────────────────────────────────────────────

export interface ArticleBroadcastPayload {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  reading_time: number | null;
  category: string;
}

/**
 * Sends a "new article published" notification to a single subscriber.
 * Designed to be called in a loop by broadcastNewArticle() in subscribers.ts.
 * Fails silently — one bad email address must not stop the rest of the batch.
 */
export async function sendArticleNewsletterEmail(
  to: string,
  article: ArticleBroadcastPayload
): Promise<void> {
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const readingTimeText = article.reading_time ? `${article.reading_time} min read` : "Quick read";

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `New Note: ${article.title}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${article.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F7;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F9F9F7;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #ECECEC;border-radius:16px;overflow:hidden;max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 20px;border-bottom:1px solid #F0F0EE;">
              <p style="margin:0;font-size:10px;font-family:'Arial',sans-serif;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#AE8D64;">The Notebook of a Tech Woman</p>
              <p style="margin:8px 0 0;font-size:11px;font-family:'Arial',sans-serif;color:#AAAAAA;letter-spacing:0.05em;">A new page has been added</p>
            </td>
          </tr>

          <!-- Cover image (if available) -->
          ${article.cover_image ? `
          <tr>
            <td style="padding:0;">
              <img src="${article.cover_image}" alt="${article.title}" width="560" style="display:block;width:100%;height:200px;object-fit:cover;border:none;" />
            </td>
          </tr>` : ""}

          <!-- Category + Title -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <p style="margin:0 0 12px;font-size:10px;font-family:'Arial',sans-serif;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#AE8D64;">${article.category}</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#1A1A1A;line-height:1.35;">${article.title}</h1>
            </td>
          </tr>

          <!-- Reading time + Excerpt -->
          <tr>
            <td style="padding:8px 40px 28px;">
              <p style="margin:0 0 16px;font-size:11px;font-family:'Arial',sans-serif;color:#AAAAAA;">${readingTimeText}</p>
              <p style="margin:0;font-size:15px;line-height:1.75;color:#555555;">${article.excerpt}</p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 36px;">
              <a href="${articleUrl}" style="display:inline-block;padding:13px 30px;background:#1A1A1A;color:#FFFFFF;font-family:'Arial',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;border-radius:8px;">Read the Full Note →</a>
            </td>
          </tr>

          <!-- Divider quote -->
          <tr>
            <td style="padding:0 40px 28px;">
              <blockquote style="margin:0;padding:16px 20px;border-left:3px solid #AE8D64;background:#F9F9F7;border-radius:0 8px 8px 0;">
                <p style="margin:0;font-size:14px;font-style:italic;color:#666666;line-height:1.6;">"Every notebook entry is a small act of preservation."</p>
              </blockquote>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #F0F0EE;background:#F9F9F7;">
              <p style="margin:0;font-size:11px;color:#AAAAAA;font-family:'Arial',sans-serif;line-height:1.6;">
                You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#AE8D64;text-decoration:none;">twn-note.vercel.app</a>.<br />
                To unsubscribe, reply with "unsubscribe" in the subject line.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });
  } catch (err) {
    console.error(`[sendArticleNewsletterEmail] Failed for ${to}:`, err);
  }
}
