import { createAdminClient, createClient } from "@/lib/db/server";
import { sendWelcomeEmail } from "@/lib/services/email";
import type { Subscriber } from "@/types";

/**
 * Validates email format using a basic regular expression.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Subscribes a new email address to the newsletter.
 * Allowed for public users.
 */
export async function addSubscriber(
  email: string
): Promise<{ success: boolean; error: string | null }> {
  // 1. Validate input
  if (!email || typeof email !== "string") {
    return { success: false, error: "Email address is required." };
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    const supabase = await createClient();

    // Attempt insert (RLS allows inserts)
    const { error } = await supabase.from("subscribers").insert({ email: cleanEmail });

    if (error) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === "23505") {
        return { success: true, error: null }; // Silent success, already subscribed
      }
      console.error("[addSubscriber] DB error:", error.message);
      let errMsg = "Database registration failed.";
      if (
        error.message.includes("fetch failed") ||
        error.message.includes("TypeError") ||
        error.message.includes("failed to fetch")
      ) {
        errMsg = "Unable to connect to the database right now. Please try again later.";
      }
      return { success: false, error: errMsg };
    }

    // 2. Send branded welcome email via Resend (non-fatal — failure must not block subscription)
    try {
      await sendWelcomeEmail(cleanEmail);
    } catch (emailError) {
      console.error("[addSubscriber] Welcome email failed:", emailError);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("[addSubscriber] Service error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Admin: Fetches all newsletter subscribers.
 * Bypasses RLS using the admin client.
 */
export async function getAllSubscribersAdmin(): Promise<Subscriber[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllSubscribersAdmin] Admin DB error:", error.message);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[getAllSubscribersAdmin] Service error:", err.message);
    throw error;
  }
}
