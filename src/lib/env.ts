// ─────────────────────────────────────────────────────────────────────────────
// Environment variable validation using t3-env + zod
// All env vars must be declared here — the app will FAIL FAST at build time
// if any required variable is missing or has the wrong type.
// ─────────────────────────────────────────────────────────────────────────────
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // ── Server-only vars (never sent to browser) ──────────────────────────────
  server: {
    // Supabase service role — full DB access, never expose to client
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // Clerk — secret key for server-side auth validation
    CLERK_SECRET_KEY: z.string().min(1),

    // Cloudinary — image upload credentials
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),

    // Resend — newsletter email sending
    RESEND_API_KEY: z.string().min(1),

    // Node environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  // ── Client-safe vars (prefixed NEXT_PUBLIC_) ──────────────────────────────
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),

    // Canonical site URL — used for OG images and sitemap
    NEXT_PUBLIC_SITE_URL: z.string().url().default("https://twnotebook.com"),
  },

  // ── Runtime env mapping (required by t3-env) ──────────────────────────────
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  // Skip validation during CI builds or when explicitly disabled
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
