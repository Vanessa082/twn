"use server";

/**
 * Server Action to handle Contact form submissions.
 * Validates inputs and returns success/error status.
 */
export async function contactAction(prevState: any, formData: FormData) {
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
    // Core logic: Log details (or insert in a separate contact_messages table if needed)
    console.log(`[contactAction] New Message from ${name} (${email}):`, message);

    // Return predictable output
    return { success: true, error: null };
  } catch (error) {
    console.error("[contactAction] Error handling message:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
