import { env } from "@/lib/env";
import { createServerClient } from "@supabase/ssr";
import { createClient as createBaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components, Server Actions, or API Routes.
 * Reads/writes cookie values to maintain user session.
 */
export const createClient = async (options?: { useCookies?: boolean }) => {
  if (options?.useCookies) {
    const cookieStore = await cookies();

    return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options: cookieOptions } of cookiesToSet) {
              cookieStore.set(name, value, cookieOptions);
            }
          } catch {
            // Ignored if called in a server component (read-only context)
          }
        },
      },
    });
  }

  // Otherwise, return a cookie-free/static-safe client using the public anon key.
  return createBaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

/**
 * Creates a Supabase admin client that bypasses Row Level Security (RLS).
 * MUST only be used on the server for admin operations (e.g. creating/editing articles, reading subscriber lists).
 */
export const createAdminClient = () => {
  return createBaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
