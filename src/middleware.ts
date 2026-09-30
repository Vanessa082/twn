import { isAuthorizedAdmin } from "@/modules/identity";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk runs only on the admin surface. Readers never authenticate (ADR-005), so
 * public pages must stay outside the matcher: otherwise every document request
 * is routed through Clerk's handshake, which breaks crawlers, link previews and
 * anyone arriving without Clerk cookies.
 *
 * Admin server actions POST to /admin/* URLs, so they stay covered. Any admin
 * action invoked from a public URL fails closed because `auth()` requires this
 * middleware to have run.
 */
export default clerkMiddleware(async (auth, req) => {
  const session = await auth();

  if (!session.userId) {
    await auth.protect();
    return;
  }

  const claims = session.sessionClaims as Record<string, unknown> | null;
  const metadata =
    (claims?.metadata as Record<string, unknown> | undefined) ||
    (claims?.publicMetadata as Record<string, unknown> | undefined);
  const role = typeof metadata?.role === "string" ? metadata.role : null;

  const allowed = isAuthorizedAdmin({
    userId: session.userId,
    allowlistRaw: process.env.ADMIN_USER_IDS,
    role,
    nodeEnv: process.env.NODE_ENV,
  });

  if (!allowed) {
    const home = new URL("/", req.url);
    home.searchParams.set("error", "forbidden");
    return NextResponse.redirect(home);
  }
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
