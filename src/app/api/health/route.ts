import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Lightweight health check endpoint.
 * Used by:
 *   - Uptime monitors (UptimeRobot, BetterStack, etc.)
 *   - GitHub Actions keepalive workflow
 *   - Internal diagnostic tools
 *
 * Makes a single, read-only `SELECT 1` query to verify database connectivity.
 * Creates NO records. Uses negligible bandwidth (~100 bytes per call).
 */
export async function GET(_req: NextRequest) {
  const start = Date.now();

  const status = {
    ok: true,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "unknown",
    environment: process.env.NODE_ENV ?? "unknown",
    database: "unknown" as "ok" | "error" | "unknown",
    latency_ms: 0,
  };

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Lightweight read-only ping — does not create any records
    const { error } = await supabase.from("articles").select("id").limit(1).single();

    // PGRST116 = "no rows found" — that's still a healthy DB response
    if (error && error.code !== "PGRST116") {
      status.database = "error";
      status.ok = false;
    } else {
      status.database = "ok";
    }
  } catch {
    status.database = "error";
    status.ok = false;
  }

  status.latency_ms = Date.now() - start;

  return NextResponse.json(status, {
    status: status.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Health-Check": "twn-api",
    },
  });
}
