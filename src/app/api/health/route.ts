import { notesStoreResponds } from "@/modules/editorial";
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
 * Asks Editorial whether the notes store answers. This route does not name Editorial's table.
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
    const reachable = await notesStoreResponds();
    status.database = reachable ? "ok" : "error";
    status.ok = reachable;
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
