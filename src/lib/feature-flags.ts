// ─────────────────────────────────────────────────────────────────────────────
// Feature Flags
//
// Use these flags to safely disable features that are built but not yet ready
// for production. Flip the flag to `true` when the feature is ready to go live.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NEWSLETTER_ENABLED
 *
 * Controls whether the newsletter subscription form is visible to visitors.
 *
 * Currently set to `false` because Resend requires a verified custom domain
 * to deliver emails to any subscriber. Using Resend's sandbox sender
 * (onboarding@resend.dev) only delivers to the account owner's email address.
 *
 * ✅ To enable:
 *   1. Purchase a domain (e.g. twnotebook.com)
 *   2. Verify it at resend.com/domains
 *   3. Update FROM_ADDRESS and SITE_URL in src/lib/services/email.ts
 *   4. Set this flag to `true`
 *
 * While disabled, visitors see a professional "Coming Soon" message instead
 * of the subscription form, so the section still looks intentional and polished.
 */
export const NEWSLETTER_ENABLED = false;
