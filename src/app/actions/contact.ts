"use server";

import { env } from "@/lib/env";

/**
 * Server Action to handle Contact form submissions.
 * Validates inputs and returns success/error status.
 */
export async function contactAction(_prevState: unknown, formData: FormData) {
  // 1. Validate inputs
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all fields." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please provide a valid email address." };
  }

  try {
    console.log(`[contactAction] Sending Message from ${name} (${email}) via Resend...`);

    // Call Resend REST API using native fetch
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TWN Contact Form <onboarding@resend.dev>",
        to: "vanessa@twnotebook.com", // Owner recipient
        reply_to: email,
        subject: `[TWN Contact] Message from ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #111;">
            <h2 style="border-b: 1px solid #eee; padding-bottom: 10px;">New Message from TWN Contact Form</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background: #f9f9f7; padding: 15px; border-radius: 8px; border: 1px solid #ececec; white-space: pre-wrap;">${message}</div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[contactAction] Resend error:", errText);
      throw new Error("Email sending service returned an error.");
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("[contactAction] Error handling message:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
