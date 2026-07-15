// ─────────────────────────────────────────────────────────────────────────────
// Email Service — Resend Integration
// Handles all transactional emails: welcome, confirmation, etc.
// Only ever called server-side (never imported by client components).
// ─────────────────────────────────────────────────────────────────────────────

import { env } from "@/lib/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Sends a welcome email to a new newsletter subscriber.
 * Called immediately after a successful DB insert in addSubscriber().
 * Fails silently — a broken email must never block the subscription itself.
 */
export async function sendWelcomeEmail(email: string): Promise<void> {
  try {
    await resend.emails.send({
      from: "TWN <onboarding@resend.dev>",
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
              <a href="https://twnotebook.com" style="display:inline-block;padding:12px 28px;background:#1A1A1A;color:#FFFFFF;font-family:'Arial',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;border-radius:8px;">
                Read the Notebook →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #F0F0EE;background:#F9F9F7;">
              <p style="margin:0;font-size:11px;color:#999999;font-family:'Arial',sans-serif;line-height:1.6;">
                You're receiving this because you subscribed at twnotebook.com.<br />
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
