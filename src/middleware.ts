import { isAuthorizedAdmin } from "@/lib/auth/admin-access";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isAdminRoute(req)) return;

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
  matcher: [
    "/((?!_next|[^?]*\\.(?:html|css|js|jpe?g|webp|png|gif|svg|css|js|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
