import { headers } from "next/headers";

/**
 * Submission Protection Module (Milestone 2.4)
 * Provides rate limiting, honeypot spam detection, and duplicate suppression.
 */

// In-memory sliding window store: Map<key, timestamp[]>
const rateLimitStore = new Map<string, number[]>();

// Recent content submission hash store: Map<hash, timestamp>
const contentHashStore = new Map<string, number>();

/**
 * Get client IP address from incoming request headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch (err) {
    // Graceful fallback if invoked outside request context
  }
  return "127.0.0.1";
}

/**
 * Rate Limiter using a sliding window strategy.
 *
 * @param actionKey Identifier for the action (e.g. "submit_margin_note")
 * @param limit Maximum allowed attempts within window
 * @param windowMs Time window in milliseconds (default 10 minutes)
 */
export async function enforceRateLimit(
  actionKey: string,
  limit = 5,
  windowMs = 10 * 60 * 1000
): Promise<{ success: boolean; error?: string }> {
  const ip = await getClientIp();
  const key = `${actionKey}:${ip}`;
  const now = Date.now();

  const timestamps = rateLimitStore.get(key) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    return {
      success: false,
      error: "You are submitting too frequently. Please wait a few minutes before trying again.",
    };
  }

  validTimestamps.push(now);
  rateLimitStore.set(key, validTimestamps);

  // Periodic cleanup if store grows large (>1000 keys)
  if (rateLimitStore.size > 1000) {
    for (const [k, tsList] of rateLimitStore.entries()) {
      const remaining = tsList.filter((ts) => now - ts < windowMs);
      if (remaining.length === 0) rateLimitStore.delete(k);
      else rateLimitStore.set(k, remaining);
    }
  }

  return { success: true };
}

/**
 * Honeypot check: Bots routinely fill all hidden fields in forms.
 * Returns true if a bot is detected.
 */
export function isBotSubmission(honeypotValue?: string | null): boolean {
  if (honeypotValue && honeypotValue.trim().length > 0) {
    console.warn("[SubmissionProtection] Bot detected via honeypot field submission.");
    return true;
  }
  return false;
}

/**
 * Check if the exact same payload text was submitted within duplicateWindowMs.
 */
export async function isDuplicateSubmission(
  content: string,
  duplicateWindowMs = 60 * 1000
): Promise<boolean> {
  const ip = await getClientIp();
  const rawKey = `${ip}:${content.trim()}`;
  const now = Date.now();

  const lastSubmittedAt = contentHashStore.get(rawKey);
  if (lastSubmittedAt && now - lastSubmittedAt < duplicateWindowMs) {
    return true;
  }

  contentHashStore.set(rawKey, now);

  if (contentHashStore.size > 500) {
    for (const [k, ts] of contentHashStore.entries()) {
      if (now - ts > duplicateWindowMs) contentHashStore.delete(k);
    }
  }

  return false;
}
